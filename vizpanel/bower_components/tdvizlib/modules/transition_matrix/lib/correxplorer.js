"use strict";

var tdviz = tdviz || {'version':0.9, 'controller':{}, 'viz': {} ,'extras': {}, 'comm': {} };

tdviz.cluster = function(options) {
    // Instance reference
    var self = {};

    function extend (obj1, obj2) { 
      var result = obj1;
      for (var val in obj2) {
        if (!obj1.hasOwnProperty(val)) {
          result[val] = obj2[val];
        }
      }
      return result;
    };

    var defaults = {
      'origin_cluster': 'Origin', 
      'final_cluster': 'Final', 
      'decimals': 2, 
      'unit': '', 
      'zoom_level': 0.63, 
      'debug_level': 3, 
      'language': 'EN',
      'colors_domain': [0,2,4,5,7,14,27,39,51],
      'colors': ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],
      'transition_time': 1500,
      'libPath': '../lib'
    };

    extend(options, defaults); // returns options + defaults

    // Copy options object to self
    for (var key in options){
      self[key] = options[key];
    }

    self.container_id = self['parent_id'];

    self.scaleColor = d3.scale.linear()
      .domain(self['colors_domain'])
      .range(self['colors']);

    self.label_space = 430 * self.zoom_level;
    // I will make it also a function of scale and max label length
    
    // Auxiliar logging function
    self.myLog = function (myString, level) {
      if ((self.debug_level!=0)&&(level<=self.debug_level)){
          console.log(myString);
      }
    };

    self.init = function() {

      self.container = d3.select('#' + self.container_id);

      self.svg = self.container.append('svg')
        .attr('width', 1600 * self.zoom_level)
        .attr('height', 1200 * self.zoom_level);
  
      self.matrix = self.svg.append('g')
          .attr('class','matrix')
          .attr('transform', 'translate(' + (self.label_space + 10) + ',' + (self.label_space + 10) + ')');

      self.tooltip = self.container.append('div')
        .attr('class', 'tooltip')
        .style('opacity', '0.01');

      var legend = self.svg.selectAll(".legend")
        .data([0].concat([0,1,2,3,4,5,6,7,8]), function(d) { return d; })
        .enter().append("g")
        .attr("class", "legend");

      legend.append("rect")
        .attr("class", "scale")
        .attr("x", 1080 * self.zoom_level)
        .attr("y", function(d, i) { if(i==0){i=1;} return ((415 + 60 * i) * self.zoom_level); })
        .attr("width", 25 * self.zoom_level)
        .attr("height", 60 * self.zoom_level)
        .style("fill", function(d, i) { return self['colors'][i]; });

      legend.append("text")
        .attr("class", "tick")
        .attr("font-size", "12px")
        .text(function(d) { return "≥ " + self['colors_domain'][d] + self.unit; })
        .attr("x", (1080 + 35) * self.zoom_level)
        .attr("y", function(d, i) { if(i==0){i=1;} return ((455 + 60 * i) * self.zoom_level); });    

      self.container.append("div")
        .attr("id", "label_hor")
        .text(self.final_cluster)
        .style("left", 680 * self.zoom_level +"px")
        .style("top", 25 *self.zoom_level +"px");

      self.container.append("div")
        .attr("id", "label_ver")
        .text(self.origin_cluster)
        .style("top", 700 * self.zoom_level +"px")
        .style("left", -25+25* self.zoom_level + "px");  

      d3.json(self['libPath'] + "/info.json", function(error, json) {
        if (error) return console.warn(error);
        self.langData = json;
        self.prepare();
      });
    };

    self.prepare = function() {
  
      var menuhtml = '<p>' + self.langData[self['language']]['menu_1'] + '</p>\n';
      menuhtml    += '<p>' + self.langData[self['language']]['menu_2'] + '</p>\n';
      menuhtml    += '<p>' + self.langData[self['language']]['sort'] + ':\n';
      menuhtml    += '  <select>\n';
      menuhtml    += '    <option value="value" selected="selected">' + self.langData[self['language']]['sort_value'] + '</option>\n';
      menuhtml    += '    <option value="similarity">' + self.langData[self['language']]['sort_similar'] + '</option>\n';
      menuhtml    += '    <option value="alphabetic">' + self.langData[self['language']]['sort_alphabet'] + '</option>\n';
      menuhtml    += '    <option value="original">' + self.langData[self['language']]['sort_original'] + '</option>\n';
      menuhtml    += '  </select>\n';
      menuhtml    += '</p>\n';

      self.menu = self.container.append("div")
        .html(menuhtml)
        .style({'border-style':'solid', 'border-color': '#000', 'border-width': '1px', 'position': 'absolute', 'top': '10px', 'left': '10px', 'z-index': 10})
        .style("width", 300*self.zoom_level+"px")
        .attr("class","menu");

      self.alert = self.container.append('p')
        .attr('id', self.container_id + '_alert')
        .text(self.langData[self['language']]['order'])
        .style({'position': 'absolute', 'top': '0px', 'z-index': 15, 'display': 'none'})
        .style("left", 650 * self.zoom_level +"px")
        .style({'background-color': '#931929', 'border-radius': '4px', '-webkit-border-radius': '4px', 'padding': '15px', 'color': '#ddd'});

      self.selectSort = self.menu.select("select");

      self.sort_process = self.selectSort[0][0].value;

      self.selectSort.on("change", function() {
        self.sort_process = self.selectSort[0][0].value;
        self.myLog("Change!!" + self.sort_process, 4);
        reorder_matrix(0, 'col');
      });

      if(self.dataType == "tsv"){
        self.loadTSV();
      } else {
        self.loadCSV();
      }
    };
  
    //Load Data
    self.loadCSV = function() {
      var scsv = d3.dsv(";", "text/csv");
      scsv(self['dataFile'], function(data){

        var label_col = [];
        var label_row = [];
        var dict = {};
        var rows = [];
        var element;
        var row;

        for(var i = 0; i < data.length; i++){
          // Get labels (only once)
          element = data[i]['col'];
          label_col.pushIfNotExist(element, function(e) { return e === element });

          element = data[i]['row'];
          label_row.pushIfNotExist(element, function(e) { return e === element });

          if(!dict[element]){
            dict[element] = [];
          }
          dict[element][data[i]['col']] = data[i]['value'];
        }

        for(var i = 0; i < label_row.length; i++){
          row = [];
          for(var j = 0; j < label_col.length; j++){
            row.push(parseFloat(dict[label_row[i]][label_col[j]]));
          }
          rows.push(row);
        }
        
        self.render(rows, label_row, label_col);
      });
    };

    //Load Data
    self.loadTSV = function() {
      d3.tsv(self['dataFile'], function(data){
        // I de-dictionatize d3 stuff
        // as of now assumes both columns and row labels
        var label_col_full = Object.keys(data[0]);
        var label_row = [];
        var rows = [];
        var row = [];

        for(var i = 0; i < data.length; i++){
          label_row.push(data[i][label_col_full[0]]);
          row = [];
          for(var j = 1; j < label_col_full.length; j++){
            row.push(parseFloat(data[i][label_col_full[j]]));
          }
          rows.push(row);
        }

        self.render(rows, label_row, label_col_full.slice(1));
      });
    };

    self.render = function(data, labelsRow, labelsCol) {

      self.dataset = data;
      self.ds_row_labels = labelsRow;
      self.ds_col_labels = labelsCol;
      
      // converts a matrix into a sparse-like entries
      // maybe 'expensive' for large matrices, but helps keeping code clean
      function indexify(mat){
          var res = [];
          for(var i = 0; i < mat.length; i++){
              for(var j = 0; j < mat[0].length; j++){
                  res.push({i:i, j:j, val:mat[i][j]});
              }
          }
          return res;
      };
      
      function mouseout(d){
        self.tooltip.style("opacity", 1e-6);
      };
      
      function pixel_mouseover(d){
        self.tooltip.style("opacity", 0.8)
          .style("left", (d3.event.offsetX + 15) + "px")
          .style("top", (d3.event.offsetY + 8) + "px")
          .html(/*d.i*/self.origin_cluster + ": " + self.ds_row_labels[d.i] + "<br>" + /*d.j*/self.final_cluster + ": " + self.ds_col_labels[d.j] + "<br>" + self.langData[self['language']]['value'] + ": " + /*(d.val > 0 ? "+" : "&nbsp;") +*/ d.val.toFixed(self.decimals) + self.unit);
      };
      
      function tick_mouseover(d, i, vec, label, ident){
        self.myLog("tick_mouseover d:" + d + " i:" + i + " vec:" + vec + " label:" + label + " ident:" + ident, 5);
        // below can be optimezed a lot
        var indices = d3.range(vec.length);
        // also value/abs val?
        indices.sort(function(a, b){ return Math.abs(vec[b]) - Math.abs(vec[a]); });
        var res_list = [];
        for(var j = 0; j < Math.min(vec.length, 10); j++) {
          res_list.push(/*(vec[indices[j]] > 0 ? "+" : "&nbsp;")*/ "&nbsp;" + vec[indices[j]].toFixed(self.decimals) + "&nbsp;" + self.unit + "&nbsp;&nbsp;&nbsp;" + label[indices[j]]);
        }
        self.tooltip.style("opacity", 0.8)
          .style("left", (d3.event.offsetX + 15) + "px")
          .style("top", (d3.event.offsetY + 8) + "px")         
          .html("" + ident + ": " + d + "<br><br>" + res_list.join("<br>"));
      };
   
      self.scale = d3.scale.linear()
          .domain([0, d3.min([50, d3.max([self.ds_col_labels.length, self.ds_row_labels.length, 4])])])
          .range([0, self.zoom_level * 600]);
          
      self.col = d3.transpose(self.dataset);

      self.order_col = d3.range(self.ds_col_labels.length + 1);
      self.order_row = d3.range(self.ds_row_labels.length + 1);

      self.pixel = self.matrix.selectAll('rect.pixel').data(indexify(self.dataset));

      // as of now, data not changable, only sortable
      self.pixel.enter()
          .append('rect')
              .attr('class', 'pixel')
              .attr('width', self.scale(0.99))
              .attr('height', self.scale(0.99))
              .attr("rx", 4)
              .attr("ry", 4)
              .style('fill',function(d){ return self.scaleColor(d.val);})
              .on('mouseover', function(d){pixel_mouseover(d);})
              .on('mouseout', function(d){mouseout(d);});

      self.tick_col = self.svg.append('g')
          .attr('class','ticks')
          .attr('transform', 'translate(' + (self.label_space + 10) + ',' + (self.label_space) + ')')
          .selectAll('text.tick')
      .data(self.ds_col_labels);

      self.tick_col.enter()
          .append('text')
              .attr('class','tick')
              .style('text-anchor', 'start')
              .attr('transform', function(d, i){return 'rotate(270 ' + self.scale(self.order_col[i] + 0.7) + ',0)';})
              .attr('font-size', self.scale(0.5))
              .text(function(d){ return d; })
              .on('mouseover', function(d, i){tick_mouseover(d, i, self.col[i], self.ds_row_labels, self.final_cluster);})
              .on('mouseout', function(d){mouseout(d);})
              .on('click', function(d, i){reorder_matrix(i, 'col');});

      self.tick_row = self.svg.append('g')
          .attr('class','ticks')
          .attr('transform', 'translate(' + (self.label_space) + ',' + (self.label_space + 10) + ')')
          .selectAll('text.tick')
      .data(self.ds_row_labels);

      self.tick_row.enter()
          .append('text')
              .attr('class','tick')
              .style('text-anchor', 'end')
              .attr('font-size', self.scale(0.5))
              .text(function(d){ return d; })
          .on('mouseover', function(d, i){tick_mouseover(d, i, self.dataset[i], self.ds_col_labels, self.origin_cluster);})
              .on('mouseout', function(d){mouseout(d);})
              .on('click', function(d, i){reorder_matrix(i, 'row');});

      refresh_order(self['transition_time']);
    };

    function refresh_order(time){
      self.tick_col.transition()
          .duration(time)
              .attr('transform', function(d, i){return 'rotate(270 ' + self.scale(self.order_col[i] + 0.7) + ',0)';})
              .attr('x', function(d, i){return self.scale(self.order_col[i] + 0.7);});

      self.tick_row.transition()
          .duration(time)
              .attr('y', function(d, i){return self.scale(self.order_row[i] + 0.7);});

      self.pixel.transition()
          .duration(time)
              .attr('y', function(d){return self.scale(self.order_row[d.i]);})
              .attr('x', function(d){return self.scale(self.order_col[d.j]);});
    };

    function reorder_matrix(k, what){
      self.myLog("reorder_matrix k:" + k + " what:" + what, 4);

      function reverse_permutation(vec){
          var res = [];
          for(var i = 0; i < vec.length; i++){
              res[vec[i]] = i;
          }
          return res;
      };
      
      var last_order_col = self.order_col;
      var last_order_row = self.order_row;

      var last_k = k;
      var last_what = what;
      
      var order = [];
      var vec = [];
      var labels = [];
      var vecs = [];
      
        if(what === 'row'){  //yes, we are sorting counterpart
          vec = self.dataset[k];
          vecs = self.dataset;
          labels = self.ds_col_labels;  //test is if it ok
        } else if ( what === 'col' ) {
            vec = self.col[k];
            vecs = self.col;
          labels = self.ds_row_labels;
        }
        var indices = d3.range(vec.length);

        switch (self.sort_process) {
          case "value":
            indices = indices.sort(function(a,b){return vec[b] - vec[a];});
            break;
          //case "abs_value":
          //  indices = indices.sort(function(a,b){return Math.abs(vec[b]) - Math.abs(vec[a]);});
          //  break;
          case "original":
            break;
          case "alphabetic":
            indices = indices.sort(function(a,b){return Number(labels[a] > labels[b]) - 0.5;});
            break;
          case "similarity":
            // Ugly, but sometimes we want to sort the coordinate we have clicked
            // Also, as of now with no normalization etc
            indices = d3.range(vecs.length);
            indices = indices.sort(function(a,b){
              var s = 0;
              for(var i = 0; i < vec.length; i++){
                s += (vecs[b][i] - vecs[a][i]) * vec[i];
              }
              return s;
            });
            if(what === 'col'){
                self.order_col = reverse_permutation(indices);
            } //not else if!
            if ( what === 'row') {
                self.order_row = reverse_permutation(indices);
            }

            if(last_order_row.toString() === self.order_row.toString() && last_order_col.toString() === self.order_col.toString()){
              $('#' + self.container_id + '_alert').fadeIn(400).delay(1200).fadeOut(400);
            }

            refresh_order(self['transition_time']);
            return undefined;
        }
        if(what === 'row'){
            self.order_col = reverse_permutation(indices);
        } //not else if!
        if ( what === 'col') {
            self.order_row = reverse_permutation(indices);
        }

        if(last_order_row.toString() === self.order_row.toString() && last_order_col.toString() === self.order_col.toString()){
          $('#' + self.container_id + '_alert').fadeIn(400).delay(1200).fadeOut(400);
        }

        refresh_order(self['transition_time']);
    };

    // ... On document ready ...
    $(document).ready(function() {
      self.myLog("Chart Ready", 4);
      self.init();
    });

    return self;
};

// ADD FUNCTION TO ARRAY PROTOTYPE
// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) { 
    for(var i=0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
}; 

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function(element, comparer) { 
    if (!this.inArray(comparer)) {
        this.push(element);
    }
};