"use strict";

var tdviz = tdviz || {'version':0.9, 'controller':{}, 'viz': {} ,'extras': {}, 'comm': {} };

tdviz.extras.help = function(idName, className, options) {

    // Instance reference

    var self = {};

    self.idName = idName;

    self.className = className;

    // Copy options object to self

    for (var key in options){
      self[key] = options[key];
    }

    self._fill_help = function(help_index){

        var my_html = "";
        var header_html = "";

        // Fill content

        var my_data = self.help_data[help_index];

        var my_header = my_data.header;
        var my_text = my_data.text;
        var my_image = my_data.image;

        my_html+='<a name="'+self.idName+"_"+i+'"><h1>' + my_header + '</h1></a>';
        my_html+='<div>' + my_text + '</div>';

        if (my_image != null) { my_html+='<div class="img_div"><img src="'+ self.path_help + '/' + my_image + '"></div>';}



        // Fill header array

        var headers = [];

        for(var i=0; i<self.help_data.length; i++)
        {
            my_header = self.help_data[i].header;

            if (i==help_index)
            {
                headers.push('<span class="help_link selected">'+my_header+"</span>");
            }
            else
            {
                headers.push('<span class="help_link">'+my_header+"</span>");
            }
        }

        // Fill content + header

        self.help_content.transition().style("opacity",0).each("end", function()
        {
            d3.select(this).html(my_html).transition().style("opacity",1);
        });

        self.help_header.html(headers.join(" | "));

        // On click: fill_help with element index

        d3.selectAll("#" + self.idName + " .help_link").on("click", function(d,i){self._fill_help(i);return false;});


    };

    self.init = function() {

        self.parent = d3.select("#" + self.idName);

        self.visible_help = false;

        // Used preloaded JS
        // TODO:
        // Toggle panel on/off
        // Fill panel (plain html): header, content, scroll, jump
        // Try !=s divs

            
        if (self.viz_type == "circle_packing"){
            self.help_data = (typeof circle_packing[self.lang] != 'undefined') ? circle_packing[self.lang] : circle_packing['en'];
        } else if (self.viz_type == "treemap" ){
            self.help_data = (typeof treemap[self.lang] != 'undefined') ? treemap[self.lang] : treemap['en'];
        } else if (self.viz_type == "choropleth" ){
            self.help_data = (typeof choropleth[self.lang] != 'undefined') ? choropleth[self.lang] : choropleth['en'];
        } else if (self.viz_type == "chordgraph" ){
            self.help_data = (typeof chordgraph[self.lang] != 'undefined') ? chordgraph[self.lang] : chordgraph['en'];
        } else {
            if(self.lang == 'es'){
                self.help_data = [{
                    "header": "No hay datos",
                    "text": "<p>No existen archivos de ayuda para esta visualización, consulte con los administradores.</p>",
                    "image": null
                }]
            } else {
                self.help_data = [{
                    "header": "No data",
                    "text": "<p>There is no help info for this visualization, contact the administrators if you need help.</p>",
                    "image": null
                }]
            }
        }          


        // Include help button at the parent top right corner
        self.help_button = self.parent.append("i")
            .attr("class", "help_button fa fa-info-circle fa-2x")
            .on("click", function(){

               self.visible_help = (!self.visible_help);
               self.help_div.transition().style("opacity", function(d,i){ return self.visible_help ? 1.0:0.0;});
               self.help_div.style("display", function(d,i){ return self.visible_help ? "":"none";});
               self.help_button.transition().style("opacity", function(d,i){ return self.visible_help ? 0.0:1.0;});

            });


        // Include floating div at the parent top right corner
        self.help_div = self.parent.append("div")
            .attr("class", "help_panel")
            .style("opacity", function(d,i){ return self.visible_help ? 1.0:0.0;})
            .style("display", function(d,i){ return self.visible_help ? "":"none";})
            .html("");

        self.close_button = self.help_div.append("i")
            .attr("class", "close_button fa fa-times")
             .on("click", function(){

               self.visible_help = (!self.visible_help);
               self.help_div.transition().style("opacity", function(d,i){ return self.visible_help ? 1.0:0.0;});
               self.help_div.style("display", function(d,i){ return self.visible_help ? "":"none";});
               self.help_button.transition().style("opacity", function(d,i){ return self.visible_help ? 0.0:1.0;});

            });

        self.help_header = self.help_div.append("div")
            .attr("class", "header");

        self.help_content = self.help_div.append("div")
            .attr("class", "content");

        self._fill_help(0);

    };

    self.init();
};

