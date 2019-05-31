var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


// chordDiagram library
// input Options example:
// {
//                'idName':"chartContent", => 'id of div to insert graph,
//                'width':800, => width + height of the chart
//                'height':700,
//                'transTime':1000, => transition time
//                'chordPadding':0.05, => padding between groups, in radians
//                'loadingMessage':"Loading data...", ==> message to display while loading data (between init and render)
//                'colorScale': self.colorScale, ==> colorScale to fill groups
//                'myLog':myLog, => logging function
//                'colorRule':self.colorRule, ==> 'bigger' or 'smaller' => decision text for coloring chords (bigger or smaller
//                                                connecting arc
//
//                // Copy functions
//
//                'removeInfoChord':self.quitaInfoChord, => called to clean chord info area
//                'removeInfoGroup':self.quitaInfoGroup, => called to clean group info area
//                'fillInfoChord':self.rellenaInfoChord, => called to fill chord info area
//                'fillInfoGroup':self.rellenaInfoGroup => called to fill group info area
// }

tdviz.viz.chordDiagram = function(options)
{

    // Object

    var self = {};

    // Var to keep transition state

    self.onTransition = false;

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function(){

        // svg init

        self.myLog("Initializing chordChart... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g")
            .attr("transform", "translate("+(self.width/2)+","+(self.height/2)+")");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","chordChartTextWarning")
            .attr("x", 0)
            .attr("y",0)
            .text(self.loadingMessage);

        // elements svg

        self.groups = self.svg.append("g");
        self.chords = self.svg.append("g");
        self.texts = self.svg.append("g");

        // chord diagram dimensions

        self.chartWidth = (self.width)-(self.height/10);
        self.chartHeight = (self.height)-(self.height/10);
        self.innerRadius = Math.min(self.chartWidth, self.chartHeight) * .41;
        self.outerRadius = self.innerRadius * 1.1;

        // chord and arc functions

        self.arc_svg = d3.svg.arc().innerRadius(self.innerRadius).outerRadius(self.outerRadius);

        self.chord_svg = d3.svg.chord().radius(self.innerRadius);

        // d3.layout.chord object....

        self.chord = d3.layout.chord()
            .padding(self.chordPadding)
            .sortSubgroups(d3.ascending)
            .sortChords(d3.ascending);


    };

    // Renders data onto the initialized chord chart. Arguments =
    // 'data' is an adjacency matrix between groups
    // 'data_label' is an array with group names (exactly in the same order as in adjacency matrix

    self.render = function(data,data_label)
    {

        self.warningMessage.remove();
        self.data = data;
        self.data_label = data_label;



        self.chord.matrix(data);

        var groupsBind = self.groups.selectAll(".groups").data(self.chord.groups);
        // Unicity function = text index
        var textBind = self.texts.selectAll(".chordLegendText").data(self.chord.groups,function (d,i){return d.index;});
        // Unicity function is getStringRepr (sourceName*targetName)
        var chordsBind = self.chords.selectAll(".chords").data(self.chord.chords,function(d,i){return getStringRepr(d.source.index, d.target.index)});


        // texts...

        textBind.exit().transition().duration(self.transTime).remove();

        textBind.transition()
            .duration(self.transTime)
            .attr("transform", function(d) {
                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
                    + "translate(" + (self.outerRadius + 16) + ")";
            });

        textBind.enter().append("text")
            .attr("dy", ".35em")
            .attr("class","chordLegendText")
            .attr("transform", function(d) {
                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
                    + "translate(" + (self.outerRadius + 16) + ")";
            })
            .text(function(d){return data_label[d.index];});


        // groups....

        groupsBind.exit().transition().duration(self.transTime).remove();

        groupsBind.transition()
            .duration(self.transTime)
            .attrTween("d", arcTween(self.arc_svg, self.old));

        groupsBind.enter().append("path")
            .attr("class","groups")
            .style("fill", function(d) {return self.colorScale(d.index); })
            .style("stroke", function(d) { return "#000"; })
            .attr("d", d3.svg.arc().innerRadius(self.innerRadius).outerRadius(self.outerRadius))
            .on("mouseover", fadeOut(.1))
            .on("mouseout", fadeIn(1));


        // chords....

        chordsBind.exit().transition().duration(self.transTime).style("opacity", 0).remove();

        chordsBind.transition()
            .duration(self.transTime)
            .style("fill", function(d) {return self.colorScale(chooseNodeRule(d,self.colorRule)); })
            .style("opacity",1)
            .attrTween("d", chordTween(self.chord_svg, self.old));

        // First time chords enter: copy in self.old groups + array of chords representation

        chordsBind.enter()
            .append("path")
            .attr("class","chords")
            .attr("d", d3.svg.chord().radius(self.innerRadius))
            .style("fill", function(d) {return self.colorScale(chooseNodeRule(d,self.colorRule)); })
            .style("opacity", 0.1)
            .on("mouseover", function(d,i){self.fillInfoChord(d,i)})
            .on("mouseout",function(d,i){self.removeInfoChord(d,i)})
            .transition()
            .each("start",function()
            {
                self.onTransition = true;
            })
            .duration(self.transTime)
            .style("opacity",1)
            .each("end",function()
            {
                self.onTransition = false;
                self.old = {
                    groups: self.chord.groups(),
                    chords: chordsRepr(self.chord.chords())
                };
            });


        // And sort chords by value (adding source+target value)

        self.chords.selectAll(".chords").sort(function (a,b){return (a.target.value+ a.source.value)-(b.target.value+ b.source.value);});

    };

    // Object's 'main'

    self.init();

    return self;

    // Arc tweening function

    function arcTween(arc_svg, old) {
        return function(d,i) {
            var i = d3.interpolate(old.groups[i], d);
            return function(t) {
                return arc_svg(i(t));
            }
        }
    }

    // Chord Tweening function

    function chordTween(chord_svg, old) {
        return function(d,i) {
            var oldStrRepr = getStringRepr(d.source.index, d.target.index);
            var i = d3.interpolate(old.chords[oldStrRepr], d);
            return function(t) {
                return chord_svg(i(t));
            }
        }
    }

    // Function to remark chords on group mouseover

    function fadeIn(opacity) {
        return function (d, i) {
            self.removeInfoGroup(d,i);
            self.svg.selectAll(".chords")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .style("opacity", opacity);
        };
    }

    // Function to unmark chords on group mouseover

    function fadeOut(opacity) {
        return function (d, i) {
            self.fillInfoGroup(d,i);
            self.svg.selectAll(".chords")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .style("opacity", opacity);
        };
    }


    // Get and array of chord representations

    function chordsRepr(chords)
    {
        var repr = [];

        for(var i=0;i<chords.length;i++)
        {
            var stringRepr = getStringRepr(chords[i].source.index,chords[i].target.index);

            repr[stringRepr] = chords[i];
        }

        return repr;
    }

    // Representation (unicity function) for chords

    function getStringRepr(i,j)
    {
        return (i>j) ? i.toString()+"*"+ j.toString(): j.toString()+"*"+ i.toString();
    }

    // Aux function to choose if we color chord by bigger end or smaller end

    function chooseNodeRule(d,color_rule)
    {
        var bigger = d.source.value > d.target.value ? d.source.index: d.target.index;
        var smaller = d.source.value < d.target.value ? d.source.index: d.target.index;

        if (color_rule=='bigger')
        {
            return bigger;
        }
        else
        {
            return smaller;
        }

    }

};
