var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.vizController = function(options)
{

    // Instance reference

    var self = {};

    // Global vars

    for (key in options) self[key] = options[key];

    self.parentSelect = "#"+self.idName;
    self.mapFirstColor = "#CCF";
    self.mapSecondColor = "#004";

    // Funciones auxiliares y de copy

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // Function for lowercasing dsv parsed key names (just in case column names are case-mixed)

    self.low_call = function(d)
    {
      // From http://stackoverflow.com/questions/26998476/right-way-to-modify-d3-csv-to-lower-case-column-names

      Object.keys(d).forEach(function(origProp) {
        var lowerCaseProp = origProp.toLocaleLowerCase();
        // if the uppercase and the original property name differ
        // save the value associated with the original prop
        // into the lowercase prop and delete the original one
        if (lowerCaseProp !== origProp) {
          d[lowerCaseProp] = d[origProp];
          delete d[origProp];
        }
      });
      return d;

    };

    // Tooltip functions BEGIN

    // remove underscores in category names...

    self.removeUnderscores = function(textInput){
        return textInput.replace(/_/g," ");
    };

    self.interactionCirclePacking = function(d, i, eventName){

          if(eventName=="mouseover"){
            if(!d.children) self.chart.tooltip.style("opacity",1.0).html(self.displayTipLeaf(d));
            else if(d.depth!=0) self.chart.tooltip.style("opacity",1.0).html(self.displayTipNode(d));
          }
          else if(eventName=="mouseout") self.chart.tooltip.style("opacity", 0.0);

    };

    self.interactionTreeMap = self.interactionCirclePacking;

    self.interactionChord = function(d,i, eventName, type, label){

                console.log("interaction");
                console.log(eventName);

          if(eventName=="mouseover"){

            if(type=="chord")
            {
                var html = "";

                var sourceName = label[d.source.index];

                var targetName = label[d.target.index];

                html+="Connections between <b>" + sourceName + "</b> and <b>" + targetName + "</b>: ";

                html+= d.source.value+" </br>";

                html+="Connections between <b>" + targetName + "</b> and <b>" + sourceName + "</b>: ";

                html+= d.target.value+" </br>";

                self.chart.tooltip.style("opacity", 1.0).html(html);

            }

            if(type=="group")
            {
                var html = "";

                html+="Total connections (in+out) for <b>"+ label[d.index]+"</b>: " + d.value.toFixed(0);

                self.chart.tooltip.style("opacity", 1.0).html(html);

            }

          }
          else if(eventName=="mouseout") self.chart.tooltip.style("opacity", 0.0);
    };

    self.displayTipLeaf = function(d)
    {
        var html ="";

        var categories = [];


        // search recursively for oldest parent != root

        var data = d;

        var leafName = d.name;

        var name;

        while(data.parent.depth>0)
        {
            data = data.parent;
            name = data.name;
            categories.push(self.removeUnderscores(name));
        }

        var catName = categories.reverse().join("/");

        html+="<span class='big'>"+leafName+"</span></b><br>";
        html+=parseFloat(d.value).toFixed(0)+" items";
        html+="<br>"+catName;

        return html;
    };

    self.displayTipNode = function(d)
    {
        var html ="";

        var categories = [];
        // search recursively for oldest parent != root

        var data = d;

        var name = d.name;

        categories.push(self.removeUnderscores(name));

        while(data.parent.depth>0)
        {
            data = data.parent;
            name = data.name;
            categories.push(self.removeUnderscores(name));
        }

        var catName = categories.reverse().join(" /</br>");

        html+="<span class='big'>"+catName+"</span><br>";
        html+=parseFloat(d.value).toFixed(0)+" items";

        return html;

    };

    self.refresh_geo_data = function(key){
        console.log("Refreshing geo data for");
        console.log(key);

        self.geo_data = geo_data[map_conf[key]['geo_data_key']];
        self.map_options = map_conf[key]['vizOptions'];
        self.base_map = map_conf[key]['base_map'];
        self.map_calls = map_conf[key]['callbacks'];

        console.log(self.geo_data);
        console.log(self.map_options);

    };


    // Control functions
    var my_html = tr._tr('separator') +': <input type="text" name="" value="' + self.dataOptions.separator + '">';
    d3.select("#left-nav").append("div").attr("class","title").html(tr._tr('viz_controls'));
    d3.select("#left-nav").append("div").attr("id","separator_control").html(my_html);
    d3.select("#left-nav").append("hr");

    d3.select("#separator_control > input").on("input", function(){
        self.dataOptions.separator = $(this).val();
    });
    
    self.display_scale_controls = function()
    {
        d3.select("#controls").remove();
        var default_scale = d3.scale.category10();

        var select_content = '<select class="scale_colors">'+
            '<option value="a">'+ tr._tr('first_scale')+'</option>'+
            '<option value="b">' + tr._tr('second_scale')+'</option>'+
            '<option value="c">' + tr._tr('third_scale')+'</option>'+
            '<option value="d">' + tr._tr('fourth_scale')+'</option>'+
            '</select>';

        var default_text_color = "#FCFCFC";
        if (window.location.hash == "#chordgraph")
            default_text_color = "#000";

        var my_html =[
                    '<div id="color_scale_control" style="float:left;">'+tr._tr('color_scale')+' '+select_content+'</div>',
                    '<div style="float:left;margin-left:3px">'+tr._tr('text_color')+': <input id="color_first" class="color" value="'+default_text_color+'" size="3"></div>'

        ].join('\n');

        d3.select("#left-nav").append("div").attr("id","controls").attr("class","controls").html(my_html);

        self.color_scale = default_scale;

        jscolor.init();
        d3.select("#color_first").on("change", function(){
            $("text").css("fill", "#" + this.color.toString());
        });


        d3.select(".scale_colors").on("change", function(){

            var color_scale = default_scale;

            var selected_value = $(this).val();

            if (selected_value == "a"){ color_scale = d3.scale.category10();}
            else if (selected_value == "b") {color_scale = d3.scale.category20();}
            else if (selected_value == "c"){color_scale = d3.scale.category20b();}
            else if(selected_value == "d"){color_scale = d3.scale.category20c();}

            self.color_scale = color_scale;

            console.log("Actual color scale");
            console.log(self.color_scale);

            self.chart.refreshColors(self.color_scale);


        });

    };

    self.display_map_controls = function ()
    {
        d3.select("#controls").remove();
        var select_content = '<select class="country">';

        for (var key in map_conf)
        {
            if (key == self.defaultMap)
                select_content+= '<option selected="selected" value="'+key+'">'+key+'</option>';
            else
                select_content+= '<option value="'+key+'">'+key+'</option>';
        }

        select_content+= '</select>';

        var my_html =             [
                    '<div style="float:left;">Min color: <input id="color_first" class="color" value="'+ self.mapFirstColor +'" size="3"></div>',
                    '<div style="float:right;"><p>Max color: <input id="color_second" class="color" value="'+ self.mapSecondColor +'" size="3"></p></div>',
                    '<div id="map_name_control" style="float:left;">Map: '+select_content+'</div>'

        ].join('\n');

        d3.select("#left-nav").append("div").attr("id","controls").attr("class","controls").html(my_html);

        console.log("reseteando colores");

        jscolor.init();

        self.map_help = d3.select("#chartContent").append("img")
            .attr("src", "css/img/" + self.defaultMap + "_ids.png")
            .attr("style", "max-height: " + (window.innerHeight - self.topMargin*2) + "px; float: right; margin-right: " + (self.topMargin*2) +"px") ;

        // Refresh geo_data

        self.refresh_geo_data($(".country").val());

        d3.select(".country").on("change", function(){

            console.log($(this).val());
            $("#chartContent").html("");

            self.map_help = d3.select("#chartContent").append("img")
                .attr("src", "css/img/" + $(this).val() + "_ids.png")
                .attr("style", "max-height: " + (window.innerHeight - self.topMargin*2) + "px; float: right; margin-right: " + (self.topMargin*4) +"px") ;

            self.refresh_geo_data($(this).val());

        });

        d3.select("#color_first").on("change", function(){

            self.mapFirstColor = "#"+this.color;

            // If map exists.. refresh colors..

            if (document.getElementById("map") !== null)
            {
                self.chart.refreshColors(self.mapFirstColor, self.mapSecondColor);
            }

        });
        d3.select("#color_second").on("change", function(){

           self.mapSecondColor = "#"+this.color;

            // If map exists.. refresh colors..

            if (document.getElementById("map") !== null)
            {
                self.chart.refreshColors(self.mapFirstColor, self.mapSecondColor);
            }

        });


    };

    // Tooltip functions END

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            [
                    '<div id="chartContent" class="chartContent"></div>',
                    '</div>',
                    '<div id="floatingDiv"></div>'

        ].join('\n');


        function handleDragOver(evt)
        {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

        }

        function handleFileSelect(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer.files; // FileList object.

            // files is a FileList of File objects. List some properties.
            var output = [];

            for (var i = 0, f; f = files[i]; i++) {

                var reader = new FileReader();

                reader.onload = function (e) {
                    var my_data = reader.result;

                    var result;
                    var error = null;

                    // Clean floating div

                    $("#floatingDiv").html("");
                    d3.select("#floatingDiv").style("opacity", 0.0);

                    // Init new viz_type if apply: If same viz_type, mantain old svg and object
                    // to show transitions on updates, enter and exit

                    if (self.old_viz_type != self.viz_type) {

                        // If not first render, remove old svg

                        if (self.old_viz_type != "None") {
                            $("#chartContent").html("");
                        }

                        self.chart = self.charts[self.viz_type].chart();
                        self.old_viz_type = self.viz_type;
                    }
                    else{

                        // If you switch between vis types, without actually rendering, svg has been removed
                        // but self.old_viz still equals self.viz_type b/c no drag&drop has been called on the latter viz

                        if ($("#" + self.idName + " svg").length==0)
                        {
//                            // Refresh geo_data
//
//                            if ((self.viz_type == "choropleth") && (typeof $(".country").val() != 'undefined')) {
//
//                                self.refresh_geo_data($(".country").val());
//                            }

                            // Instantiate chart

                            self.chart = self.charts[self.viz_type].chart();
                            self.old_viz_type = self.viz_type;

                        }

                        console.log("Old viz");
                        console.log(self.old_viz_type);
                        console.log("New viz");
                        console.log(self.viz_type);
                    }

                    try {
                        console.log("CHEQUEANDO DATA");
                        result = self.chart.checkData(my_data);
                    }
                    catch (err) {
                        error = tr._tr('error_main');
                    }


                    if (error == null && result.error == null) {
                        console.log("RENDERING...");

                        self.chart.render(result.content);

                        // NEW: Remove map_name_select on map drawing

                        if (typeof self.charts[self.viz_type].on_render != "undefined")
                        {
                            self.charts[self.viz_type].on_render();
                        }

                    }
                    else {
                        if(self.map_help) self.map_help.remove();
                        toastr["error"](error, tr._tr('error_sub'));
                    }

                    // self.circleChart.render(final_data);
                };

                reader.readAsText(f);
            }
        }

        function change_on_hash(hash){

            var chartName = "";

            if (hash === "#circle_packing") {
                chartName = "circle_packing";
            } else if (hash === "#treemap") {
                chartName = "treemap";
            } else if (hash === "#choropleth") {
                chartName = "choropleth";
            } else if (hash === "#transition") {
                chartName = "transition_matrix";
            } else if (hash === "#chordgraph") {
                chartName = "chord_graph";
            }

            console.log('setup ->' + chartName);

            if (chartName !== "") {
                self.viz_type = chartName;
            }

            // And remove old render and old controls

            $("#chartContent").html("");


            // TODO: More abstract way to display new controls based on graph type

//            if(chartName == "choropleth"){
//                display_map_controls();
//            }

            if (typeof self.charts[self.viz_type].controls != "undefined")
            {
                self.charts[self.viz_type].controls();
            }


        }

        // Insert html

        $(self.parentSelect).html(injectString);

        // Setup the dropzone listener

        // Setup the dnd listeners.

        var dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);

        // default visualization
        self.viz_type = "circle_packing";

        // Basic view routing
        $(window).on('hashchange', function() {

            change_on_hash(window.location.hash);

        });


        // To take advantage of transitions

        self.old_viz_type = "None";

        self.charts = {

            circle_packing: {
                chart: function () {
                    return tdviz.viz.circlePacking(
                        {
                            'idName': "chartContent",
                            'idInfo': self.idInfo,
                            'height': window.innerHeight - self.topMargin,
                            'width': window.innerWidth,
                            'transTime': self.transTime,
                            'backColorScale': self.backColorScale,
                            'selectCallBack': self.selectCallBack,
                            'myLog': myLog,
                            'interactionCallBack' : self.interactionCirclePacking,
                            'dataOptions': self.dataOptions,
                            'color_scale' : self.color_scale,
                            'low_call': self.low_call
                        });
                },
                controls: self.display_scale_controls
            },
            treemap: {
                chart: function () {
                    return tdviz.viz.treeMap(
                        {
                            'idName': "chartContent",
                            'idInfo': self.idInfo,
                            'height': window.innerHeight - self.topMargin,
                            'width': window.innerWidth,
                            'transTime': self.transTime,
                            'backColorScale': self.backColorScale,
                            'selectCallBack': self.selectCallBack,
                            'myLog': myLog,
                            'interactionCallBack' : self.interactionTreeMap,
                            'dataOptions': self.dataOptions,
                            'color_scale' : self.color_scale,
                            'low_call': self.low_call
                        });
                },
                controls: self.display_scale_controls
            },
            chord_graph:{
                chart: function() {
                    return tdviz.viz.chordGraph(
                        {
                            'idName': "chartContent",
                            'width': window.innerWidth,
                            'height': window.innerHeight - self.topMargin,
                            'transTime': self.transTime,
                            'chordPadding': 0.05,
                            'myLog': myLog,
                            'colorRule': "bigger",
                            'interactionCallBack': self.interactionChord,
                            'dataOptions': self.dataOptions,
                            'color_scale' : self.color_scale,
                            'low_call': self.low_call
                        });

                },
                controls: self.display_scale_controls
            },
            choropleth: {
                chart: function () {
                    return tdviz.viz.heatMap("chartContent", "chartContent",
                        {
                            'baseJUrl': "http://datascope.tid.es/static/vizpanel/",
                            'base_map': self.base_map,
//                            'dataFile': 'spain_geo.json',
                            'dataFile': 'none',
                            'data': self.geo_data,
                            'transTime': 3000,
                            'debugLevel': 3,
                            'myLog': myLog,
                            'firstColor': self.mapFirstColor,
                            'secondColor': self.mapSecondColor,
                            'vizOptions': self.map_options,
                            'dataOptions': self.dataOptions,
                            'map_calls': self.map_calls,
                            'low_call': self.low_call
                        });

                },
                controls: self.display_map_controls,
                on_render: function () { self.map_help.remove();}

            }
        };

        console.log(map_conf);
        console.log(geo_data);

        // Setup variables on first landing...

        change_on_hash(window.location.hash);

    });
    return self;
};
