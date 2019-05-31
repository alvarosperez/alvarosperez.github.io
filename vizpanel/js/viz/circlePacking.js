var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.circlePacking = function (options)
{

    // Object

    var self = {};


    // Get options data

    for (var key in options) self[key] = options[key];

    // Constants

    // Color for parents and global nodes (should be equal to background color in body)

    self.parentSelect = "#"+self.idName;

    self.init = function() {

        self.zoomVar = d3.behavior.zoom();


        // svg init

        self.myLog("Iniciando circlePacking... en ", 3);
        self.myLog(self.parentSelect, 3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .on("mousemove", mousemove)
            .attr("width", self.width)
            .attr("height", self.height)
            .call(self.zoomVar.on("zoom", self.redraw))
            .append("g");


        self.tooltip = d3.select(self.parentSelect).append("div")
            .attr("id", "tooltip")
            .html("")
            .attr("class", "tooltip")
            .style("opacity", 0);


        function mousemove() {

            var coordinates = d3.mouse(this);

            self.tooltip
                .style("left", (coordinates[0] + 20) + "px")
                .style("top", (coordinates[1] + 60 - 12) + "px");
        }

        self.pack = d3.layout.pack()
            .size([self.width, self.height])
            .padding(1)
            .value(function (d) {
                return d.size;
            });

        self.zoom = 1.0;

        self.translate = "0,0";

        self.svg.attr("transform",
                "translate(" + self.translate + ")"
                + " scale(" + self.zoom + ")");

        self.firstRender = true;

        self.zoomContainer();

    };

    self.zoomIn = function(){
        self.zoom += 0.5;

        var centerX = (self.width/2)/self.zoom;
        var centerY = (self.height/2)/self.zoom;

        var translateX = (centerX -(self.width/2)) * self.zoom;
        var translateY = (centerY -(self.height/2)) * self.zoom;

        self.zoomVar.scale(self.zoom);
        self.zoomVar.translate([translateX, translateY]);

        self.svg
            .transition().duration(self.transTime)
            .attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                    + " scale(" + self.zoomVar.scale() + ")");

    };

    self.zoomOut = function(){

        self.zoom -= 0.5;

        var centerX = (self.width/2)/self.zoom;
        var centerY = (self.height/2)/self.zoom;

        var translateX = (centerX -(self.width/2))*self.zoom;
        var translateY = (centerY -(self.height/2))*self.zoom;

        self.zoomVar.scale(self.zoom);
        self.zoomVar.translate([translateX, translateY]);

        self.svg
            .transition().duration(self.transTime)
            .attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                    + " scale(" + self.zoomVar.scale() + ")");
    };

    self.redraw = function(){

        self.svg.attr("transform",
            "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");

        self.zoom = d3.event.scale;

    };


    self.resetZoom = function() {
        self.zoom = 1.0;

        var centerX = (self.width / 2) / self.zoom;
        var centerY = (self.height / 2) / self.zoom;

        var translateX = (centerX - (self.width / 2)) * self.zoom;
        var translateY = (centerY - (self.height / 2)) * self.zoom;

        self.zoomVar.scale(self.zoom);
        self.zoomVar.translate([translateX, translateY]);

        self.svg
            .transition().duration(self.transTime)
            .attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                + " scale(" + self.zoomVar.scale() + ")");
    };


   self.getFullPath = function(d)
   {
        var paths = [];

        // search recursively for oldest parent != root

        var data = d;

        var leafName = d.name;

        paths.push(leafName);

        var name;

        while(data.parent && data.parent.depth>0)
        {
            data = data.parent;
            name = data.name;
            paths.push(name);
        }

        return paths.reverse().join("/");

   };

    self.checkData = function(data)
    {
        if (self.dataOptions.separator === "\\t"){
            var dsv_data = d3.tsv.parse(data, function(d) {
                d = self.low_call(d);
                return {
                    category: d.category,
                    size: self.dataOptions.translateComma == true? +d.count.replace(",",".") :+d.count
                };
            }, function(error, rows) {
            });
        } else {
            var dsv = d3.dsv(self.dataOptions.separator, "text/plain");
            var dsv_data = dsv.parse(data, function(d) {
                d = self.low_call(d);
                return {
                    category: d.category,
                    size: self.dataOptions.translateComma == true? +d.count.replace(",",".") :+d.count
                };
            }, function(error, rows) {
            });
        }

        var final_data = {name: "root", "children":[]};

        for (var i in dsv_data)
        {
            var name = dsv_data[i].category;
            var size = dsv_data[i].size;
            var pointer = final_data.children;

            var categories = name.split("/");

            for (var j in categories)
            {
                var category = categories[j];
                var depth = j;

                // iterate through actual children

                var found = false;

                // check if category exists at this level

                for (var k in pointer)
                {
                    if(pointer[k].name == category)
                    {
                        found = true;
                        pointer = pointer[k].children;
                        break;
                    }
                }

                // if not exists, append category as branch or leaf if last node (+count)

                if(found == false)
                {
                    // if not last child:
                    if(j!=categories.length-1)
                    {
                        pointer.push({name: categories[j], children: []});
                        pointer = pointer[pointer.length-1].children;
                    }
                    else
                    {
                        pointer.push({name: categories[j], size: size});
                    }
                }
            }
        }

        //return JSON.parse(data);
        return {'content': final_data, 'error': null};
    };

    self.refreshColors = function(color_scale)
    {
        self.color_scale = color_scale;
        self.render(self.data);
    };


    self.render = function(data)
    {
        self.data = data;


        var leaves = self.pack(self.data);

        self.leaves = leaves;

        var node = self.svg.selectAll('.node')
              .data(leaves,function(d){return self.getFullPath(d);});


        self.changed = node;


        self.changed
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .transition()
            .duration(self.transTime)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        self.changedCircles = self.svg.selectAll('.node').selectAll('circle')
              .data(leaves,function(d){return self.getFullPath(d);});

        self.changedCircles
               .attr('class',function(d){ return d.children ? "parent circleNode" : "leaf circleNode"; })
                    .transition()
                    .duration(self.transTime)
               .style("fill",function(d){
                        if (d.children)
                        {
                            return self.backColorScale(d.depth);
                        }
                        else
                        {
                            // search recursively for oldest parent != root
                            var data = d;

                            var name = d.name;

                            while(data.parent.depth>0)
                            {
                                data = data.parent;
                                name = data.name;
                            }

                            return self.color_scale(name);

                        }
                    })
               .attr("r", function(d) { return d.r; });

         self.changedText = self.svg.selectAll('.node').selectAll('text')
              .data(leaves,function(d){return self.getFullPath(d);});

        self.changedText
            .attr("class",function (d,i){return !d.children ? "leyendaInterior" : "";})
            .attr("text-anchor","middle")
            .attr("initSize" , function(d,i){ return d3.select(this).style("font-size");})
            .style("font-size", function(d,i){ return d3.select(this).attr("initSize");}) // initial guess
            .transition()
            .text(function(d){return (!d.children ? d.name : "");})
            .duration(self.transTime)
            .style("font-size", function(d) { return ((2 * (d.r*8/10) ) / this.getComputedTextLength() * parseInt(d3.select(this).attr("initSize").replace("px",""),10)) + "px"; })
            .attr("dy", ".3em");

       // Entering....

        self.news = node.enter().insert("g",".leaf")
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        // The bubbles...

        self.nodes = self.news.append("circle")
            .on("mouseover",function(d,i){self.interactionCallBack(d,i,"mouseover");})
            .on("mouseout", function(d,i){self.interactionCallBack(d,i,"mouseout");})
            .on("click", function(d,i){self.interactionCallBack(d,i,"click");})
            .attr('class',function(d){ return d.children ? "parent circleNode" : "leaf circleNode"; })
            .style("fill",function(d){
                    if (d.children)
                    {
                        return self.backColorScale(d.depth);
                    }
                    else
                    {
                        // search recursively for oldest parent != root
                        var data = d;

                        var name = d.name;

                        while(data.parent.depth>0)
                        {
                            data = data.parent;
                            name = data.name;
                        }

                        return self.color_scale(name);

                    }
                })
            .attr('r',0)
            .transition()
            .duration(self.transTime)
            .attr("r", function(d) { return d.r; });


        self.news.append("text")
            .attr("class",function (d,i){return !d.children ? "leyendaInterior" : "";})
            .attr("text-anchor","middle")
            .style("opacity",0.1)
            .style("fill", "#"+$("#color_first").val())
            .text(function(d){return (!d.children ? d.name : "");})
            .style("font-size", "2px") // initial guess
            .transition()
            .duration(self.transTime)
            .style("font-size", function(d) { return ((2 * 2 *(d.r*8/10) ) / this.getComputedTextLength()) + "px"; })
            .style("opacity",1.0)
            .attr("dy", ".3em");

        // Exiting....

        self.old = node.exit();

        self.old.transition().duration(self.transTime).remove();

        self.old.selectAll("circle").transition().duration(self.transTime)
            .attr("r",function(d,i){return 0;})
            .remove();

        self.old.selectAll("text").transition().duration(self.transTime)
            .style("opacity",0.0)
            .remove();


        // Final sort

        d3.selectAll(".node").sort(function(a,b) {return  a.depth - b.depth});

        self.firstRender=false;


    };

    self.zoomContainer = function(){
        var myHtml = '<div class="control-zoom-in">+</div>';
        myHtml += '<div class="control-zoom-out">-</div>';

        d3.select(self.parentSelect).append('div')
            .attr("id", "control-zoom")
            .html(myHtml)
            .style("position", "absolute")
            .style("top", "80px")
            .style("left", "10px")
            .style("text-align", "center")
            .style("border", "solid 3px rgba(0,0,0,0.3)")
            .style("border-radius", "7px")
            .style("font", "bold 18px 'Lucida Console', Monaco, monospace");

        d3.select(".control-zoom-in")
            .style("padding", "3px 5px 3px 5px")
            .style("background", "white")
            .style("border-radius", "7px 7px 0 0")
            .style("line-height", "18px")
            .style("border-bottom", "solid 1px lightgray")
            .style("cursor", "pointer")
            .on("click", self.zoomIn);

        d3.select(".control-zoom-out")
            .style("background", "white")
            .style("border-radius", "0 0 7px 7px")
            .style("padding", "3px 5px 3px 5px")
            .style("line-height", "18px")
            .style("cursor", "pointer")
            .on("click", self.zoomOut);
    }

    // Main del objeto

    self.init();

    return self;


};
