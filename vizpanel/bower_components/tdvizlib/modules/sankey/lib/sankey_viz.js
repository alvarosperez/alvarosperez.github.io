var tdviz = tdviz || {'version': 0.1, 'controller': {}, 'viz': {}, 'extras': {} };


tdviz.viz.sankeyViz = function (options) {

    // Object

    var self = {};


    // Get options data

    for (key in options) {
        self[key] = options[key];
    }

    self.parentSelect = "#" + self.idName;


    self.init = function () {
        // svg init
        self.myLog("Init sankey diagram... at ", 3);
        self.myLog(self.parentSelect, 3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .append("g")
            .attr("transform", "translate(" + self.margin / 2 + "," + self.margin / 2 + ")");

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "sankeyChartTextWarning")
            .attr("x", self.width / 2)
            .attr("y", self.height / 2)
            .text(self.loadingMessage);

        self.sankey = d3.sankey()
            .nodeWidth(self.nodeWidth)
            .nodePadding(self.nodePadding)
            .size([self.width - self.margin, self.height - self.margin]);

        self.path = self.sankey.link();

        self.formatNumber = d3.format(",.2f");
        self.format = function (d) {
            return self.formatNumber(d) + " %";
        };
    }

    self.render = function (data) {
        self.myLog("sankeyViz Render....", 3);

        self.data = data;

        self.myLog("Data received", 3);

        self.myLog(data, 3);
        self.sankey
            .nodes(self.data.nodes)
            .links(self.data.links)
            .layout(320);

             self.myLog("End layout", 3);

        var link = self.svg.append("g").selectAll(".link")
            .data(self.data.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", self.path)
            .attr("visibility", function (d, i) {
                if (d.source.name.substring(0, 1) == "_" || d.target.name.substring(0, 1) == "_") {
                    return "hidden";
                }
                else {
                    return "visible";
                }
            })
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            });

        link.append("title")
            .text(function (d) {
                //var fraction = (d.value/(self.data.total+0.0))*100;
                //return d.source.name + " → " + d.target.name + "\n" + self.format(fraction)+"\n" + d.value +" coocurrences";
                self.myLog(d, 3);
                return d.source.name + " → " + d.target.name + "\n"+ d.value +" sessions\n"
                    + ((d.value/d.target.value)*100).toFixed(2)+" % from target\n"
                    + ((d.value/d.source.value)*100).toFixed(2)+" % from source";

            });

        var node = self.svg.append("g").selectAll(".node")
            .data(self.data.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("rect")
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("width", self.sankey.nodeWidth())
            .style("fill", function (d) {

                    return d.level == "M" ? self.mainNodeColor : d.color = self.color(d.name.replace(/ .*/, ""));
            })
            .attr("class",function(d)
            {
                if(d.name==self.rightSpecialBox || d.name==self.leftSpecialBox)
                {
                    return "special";
                }
                else
                {
                    return "normal";
                }
            })
            .style("stroke", function (d) {

                return d3.rgb(d.color).darker(2);
            })
            .attr("visibility", function (d) {
                return d.name.substring(0, 1) == "_" ? "hidden" : "visible";
            })
            .append("title")
            .text(function (d) {
                //console.log(d.value);
                //console.log(self.data.total);
                //var fraction = (d.value/(self.data.total+0.0))*100;
                //console.log(fraction);
                return d.name + "\n" + d.value +" total sessions";
                self.myLog(d, 3);
                //return d.name + "\n" + self.format(fraction)+"\n" + d.value +" coocurrences";
            });

        node.append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.name == self.mainNodeName ? -d.y/2 : d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                return d.name == self.mainNodeName ? "middle" : "end";
            })
            .attr("transform", null)
            .style("font-size", function (d) {
                return d.level == "M" ? "20px" : "12px";
            })
            .text(function (d) {
                return d.name;
            })
            .attr("visibility", function (d) {
                return d.name.substring(0, 1) == "_" ? "hidden" : "visible";
            })
            .style("font-style",function(d){
                if(d.name==self.rightSpecialBox || d.name==self.leftSpecialBox)
                {
                    return "italic";
                }
                else
                {
                    return "normal";
                }
            }
            )
            .filter(function (d) {
                return d.x < self.width / 2;
            })
            .attr("x", function (d, i) {
                return d.name == self.mainNodeName ? self.sankey.nodeWidth() / 2 : 6 + self.sankey.nodeWidth()
            })
            .attr("text-anchor", function (d) {
                return d.name == self.mainNodeName ? "middle" : "begin";
            });

        // El remove del warning esta al final porque el primer render tarda...
        self.warningMessage.transition().duration(self.transTime).style("opacity", 0.0).remove();
    }

    // Main del objeto
    self.init();

    return self;
}