var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.heatMap = function (idName, className, options)
{

    console.log("Iniciando heatmap...");
    // Object
    var self = {};

    // Get options data
    for (var key in options) self[key] = options[key];

    console.log(self);

    // Constants
    // Color for parents and global nodes (should be equal to background color in body)

//    d3.select("#" + idName).append("div").attr("id","map").attr("class","map").style("height", self.height)
//        .style("width", self.width);

    d3.select("#" + idName).append("div").attr("id","map").attr("class","map");

    self.idName = "map";

    self.parentSelect = "#" + self.idName;

    self.init = function() {

       // tdviz.viz.mapViz callbacks
        self.callBacks = {
                        'polygon':
                        {
                            'enter': function(selection){
                                    self.myLog("enter callback", 4);
                                    selection.attr("d",self.mapChart.path).transition(self.transTime).style("fill", function(d,i) {
                                        return self.getCurrentScale(d);
                                    });
                            },
                            'zoom': function(selection){
                                    selection.attr("d",self.mapChart.path);
                            },
                            'update': function(selection){
                                    self.myLog("update callback", 4);
                                    selection.attr("d",self.mapChart.path).transition(self.transTime).style("fill", function(d,i) {
                                        return self.getCurrentScale(d);
                                    });
                            },
                            'over': function(d,i){
                                self.myLog('over callback', 5);
                                self.myLog(d, 6);
                                var myHtml = self.map_calls.name(d) + "</br>" + self.getCurrentValue(d);
                                self.mapChart.tooltip.html(myHtml);
                                self.mapChart.tooltip.style("opacity",1.0);
                            },
                            'out': function(d,i)
                            {
                                self.mapChart.tooltip.style("opacity",0.0);
                            }
                        }
        };


        // Insert callback maps onto vizOptions
        self.vizOptions['callBackDict'] = self.callBacks;

        console.log("Anadiendo mapChart en "+ self.idName);
        console.log("VIZOPTIONS");
        console.log(self.vizOptions);

        $("#map").attr("visibility","hidden");

        self.vizOptions.tileLayer =  L.tileLayer.provider(self.base_map);

        // Customizable 'id' function

        self.vizOptions.idCallBackDict = {
            'polygon': self.map_calls.id
        };

        console.log("MAPMAPMAPIDIDID");
        console.log(self.map_calls.id);

        // Instantiate mapChart
        self.mapChart = tdviz.viz.mapViz(self.idName, self.className, self.vizOptions);

        console.log("anadiendo layer");

        // Add main layer...
        self.mapChart.addLayer("all");

        // Render geojson init file
        if(self.dataFile != "none") {
            self.renderFile(self.dataFile, "all");
        }
        else
        {
            self.mapChart.render(self.data,"all");
        }



    };

    // Renders a file into a map viz layer
    self.renderFile = function(fileName,layerName) {
        d3.json(self.baseJUrl+fileName, function(mapData){
            if(mapData!=null){
                self.mapChart.render(mapData,layerName);
            }
            else {
                self.myLog("Could not load file: "+self.baseJUrl+fileName,1);
            }
        });
    };

    self.getCurrentValue = function(d)
    {
        if('heat_value' in self){
            return(self.heat_value[self.map_calls.id(d)]);
        }
        else {
            return 0;
        }
    };

    self.getCurrentScale = function(d)
    {
        if('heat_value' in self){
            return(self.colorScale(self.heat_value[self.map_calls.id(d)]));
        }
        else {
            return "#CCC";
        }
    };


    self.checkData = function(data)
    {
        if (self.dataOptions.separator === "\\t"){
            var dsv_data = d3.tsv.parse(data, function(d) {
                d = self.low_call(d);
                return {
                    // Uncomment following line to 'smash' zero values and convert to int
                    id: d.id[0] == "0" ? +d.id: d.id,
                    //id: d.id,
                    size: self.dataOptions.translateComma == true ? +d.count.replace(",", ".") : +d.count
                };
            }, function(error, rows) {
                console.log(rows);
            });
        } else {
            var dsv = d3.dsv(self.dataOptions.separator, "text/plain");
            var dsv_data = dsv.parse(data, function(d) {
                d = self.low_call(d);
                return {
                    // Uncomment following line to 'smash' zero values and convert to int
                    id: d.id[0] == "0" ? +d.id: d.id,
                    //id: d.id,
                    size: self.dataOptions.translateComma == true ? +d.count.replace(",", ".") : +d.count
                };
            }, function(error, rows) {
                console.log(rows);
            });
        }

       console.log("DSV DATA");
       console.log(dsv_data);

       var heat_values = {};
       var values = [];

       for (var i in dsv_data)
       {
           heat_values[dsv_data[i].id] = dsv_data[i].size;
           values.push(dsv_data[i].size);
       }

       self.colorScale = d3.scale.linear().domain([d3.min(values),d3.max(values)]).range([self.firstColor, self.secondColor]).clamp(true);
       self.minValue = d3.min(values);
       self.maxValue = d3.max(values);

       return {'content': heat_values, 'error': null};
    };

    self.render = function(data)
    {
        self.heat_value = data;
        self.mapChart.updateValues("all");
        $("#map").attr("visibility","visible");
    };


    self.refreshColors = function(first, second)
    {
        self.firstColor = first;
        self.secondColor = second;
        self.colorScale = d3.scale.linear().domain([self.minValue, self.maxValue ]).range([self.firstColor, self.secondColor]).clamp(true);
        self.mapChart.updateValues("all");

        $("#map").attr("visibility","visible");
    };




    // Main del objeto
    self.init();
    return self;
};
