var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.treeMap = function (options)
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

        self.myLog("Iniciando treemap... en ", 3);
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

        self.zoomContainer();

        function mousemove() {

            var coordinates = d3.mouse(this);

            self.tooltip
                .style("left", (coordinates[0] + 20) + "px")
                .style("top", (coordinates[1] + 60 - 12) + "px");

        }

        self.treemap = d3.layout.treemap()
            .size([self.width, self.height])
            .sticky(true)
            .value(function (d) {
                return d.size;
            });

        self.zoom = 1.0;

        self.translate = "0,0";

        self.svg.attr("transform",
                "translate(" + self.translate + ")"
                + " scale(" + self.zoom + ")");

        self.firstRender = true;

    };

    self.zoomIn = function(){
        var myZoom = self.zoomVar.scale()*2;

        var centerX = (self.width/2)/myZoom;
        var centerY = (self.height/2)/myZoom;

        self.zoomVar.translate( [(centerX -(self.width/2))*myZoom, (centerY -(self.height/2))*myZoom] );
        self.zoomVar.scale(myZoom);

        self.svg
            .transition().duration(self.transTime)
            .attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                    + " scale(" + self.zoomVar.scale() + ")");

    };

    self.zoomOut = function(){

        var myZoom = self.zoomVar.scale()/2;

        var centerX = (self.width/2)/myZoom;
        var centerY = (self.height/2)/myZoom;

        self.zoomVar.translate( [(centerX -(self.width/2))*myZoom, (centerY -(self.height/2))*myZoom] );
        self.zoomVar.scale(myZoom);

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
        var myZoom = 1.0;

        var centerX = (self.width / 2) / myZoom;
        var centerY = (self.height / 2) / myZoom;

        self.zoomVar.translate( [(centerX -(self.width/2))*myZoom, (centerY -(self.height/2))*myZoom] );
        self.zoomVar.scale(myZoom);

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

        var fullPath = paths.reverse().join("/");


        return fullPath;


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
                console.log(rows);
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
                console.log(rows);
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

    self.render = function(data)
    {

        self.data = data;

        self.treemap.sticky(true);

        self.leaves = self.treemap(self.data);

        var node = self.svg.selectAll('.node')
              .data(self.leaves,function(d){return self.getFullPath(d);});


        self.changed = node;


        self.changed
            .attr("class", function(d) {return d.children ? "parent node" : "leaf node"; })
            .transition()
            .duration(self.transTime)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        self.changedRects = self.svg.selectAll('.node').selectAll('rect')
              .data(self.leaves,function(d){return self.getFullPath(d);});

        self.changedRects
               .attr('class',function(d){ return d.children ? "parent rectNode" : "leaf rectNode"; })
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
                .attr("width", function(d){ return d.dx;})
                .attr("height", function(d){ return d.dy;});

         self.changedText = self.svg.selectAll('.node').selectAll('text')
              .data(self.leaves,function(d){return self.getFullPath(d);});

        self.changedText
            .attr("class",function (d,i){return !d.children ? "leyendaInterior" : "";})
            .attr("text-anchor","begin")
            .text(function(d){return (!d.children ? d.name : "");})
            .style("font-size", "10px") // initial guess
            .attr("y", function(d){return 15;})
            .attr("x", function(d){return 10;})
            .transition()
            .duration(self.transTime)
            .style("font-size", function(d) {return this.getComputedTextLength() > d.dx*0.6 ? "0px":"10px"; })
            .attr("dy", ".3em");

       // Entering....

        self.news = node.enter().insert("g",".leaf")
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        // The rects...

        self.nodes = self.news.append("rect")
            .on("mouseover",function(d,i){self.interactionCallBack(d,i,"mouseover");})
            .on("mouseout", function(d,i){self.interactionCallBack(d,i,"mouseout");})
            .attr('class',function(d){ return d.children ? "parent rectNode" : "leaf rectNode"; })
            .style("stroke", "#FFF")
            .style("stroke-width", "5px")
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
            .attr("width", function(d){ return 0;})
            .attr("height", function(d){ return 0;})
            .transition()
            .duration(self.transTime)
            .attr("width", function(d){ return d.dx;})
            .attr("height", function(d){ return d.dy;});


        self.news.append("text")
            .attr("class",function (d,i){return !d.children ? "leyendaInterior" : "";})
            .attr("text-anchor","begin")
            .text(function(d){return (!d.children ? d.name : "");})
            .style("fill", "#"+$("#color_first").val())
            .style("font-size", "10px") // initial guess
            .attr("y", function(d){return 15;})
            .attr("x", function(d){return 10;})
            .transition()
            .duration(self.transTime)
            .style("font-size", function(d) {return this.getComputedTextLength() > d.dx*0.6 ? "0px":"10px"; })
            .attr("dy", ".3em");

        // Exiting....

        self.old = node.exit();

        self.old.transition().duration(self.transTime).remove();

        self.old.selectAll("rect").transition().duration(self.transTime)
            .attr("width",function(d,i){return 0;})
            .attr("height",function(d,i){return 0;})
            .remove();

        self.old.selectAll("text").transition().duration(self.transTime)
            .style("opacity",0.0)
            .remove();


        // Final sort

        d3.selectAll(".node").sort(function(a,b) {return  a.depth - b.depth});

        self.firstRender=false;


    };

    self.refreshColors = function(color_scale)
    {
        self.color_scale = color_scale;
        self.render(self.data);
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
