"use strict";

var tdviz = tdviz || {'version':0.9, 'controller':{}, 'viz': {} ,'extras': {}, 'comm': {} };

tdviz.viz.punchcard = function(options) {
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
        'debug_level': 3
    };

    extend(options, defaults); // returns options + defaults

    self["header_margin"] = 0
    self["margin"] = 50;
    // Copy options object to self
    for (var key in options){
        self[key] = options[key];
    }

    self.container_id = self['id_name'];

    self.begin = 0;
    self.init_columns = self.labels[1].length;
    self.init_rows = self.labels[0].length;

    // Auxiliar logging function
    self.myLog = function (myString, level) {
        if ((self.debug_level!=0)&&(level<=self.debug_level)){
            console.log(myString);
        }
    };

    self._mousemove = function(){
        self.tooltip
            .style("left", (d3.event.pageX +20) + "px")
            .style("top", (d3.event.pageY - 12) + "px");
    };

    self._mouseover = function(d){
        self.tooltip
            .html(d + " clientes (" + (d/self.total*100).toFixed(2) + "%)")
            .style("opacity", 1);
    }

    self._mouseout = function(){
        self.tooltip
            .style("opacity", 0);
    }

    self.init = function() {
        self.container = d3.select('#' + self.id_name);

        self.svg = self.container.append('svg')
            .attr('width', self.width)
            .attr('height', self.height)
            .attr('style', "padding-left:"+self["header_margin"]+";")
            .on("mousemove",self._mousemove);

        // add a tooltip
        self.tooltip = self.container.append('div')
            .html("")
            .attr("class", "punch_tooltip")
            .style("opacity", 0);

        self.render(self.data);

    };

    self.render = function(myData) {

        // Number of rows/columns may vary between renderizations
        self.columns = self.labels[1].length;
        self.rows = self.labels[0].length;

        var space = 0;
        if (self.rows == 1) {
            space = 105;
            self.begin = 0;
        }

        self.yScale = d3.scale.linear().domain([0,self.rows+1]).range([35 + self["margin"], self.height - self.margin - space]);//.clamp(true);
        self.xScale = d3.scale.linear().domain([0,self.columns+1]).range([35 + self["margin"], self.width - self.margin + 120]);//.clamp(true);

        // clean if row/columns differ
        if (self.columns != self.init_columns || self.rows != self.init_rows || self.begin == 0) {
            self.svg.selectAll("text.headerH").remove();
            self.svg.selectAll("text.headerV").remove();
            self.svg.selectAll("circle.punches").remove();
            self.init_columns = self.columns;
            self.init_rows = self.rows;
            self.begin = 1;

            // reDraw labels
            var myHeadersH = self.svg.selectAll("text.headerH").data([self["headers"][0]].concat(self.labels[0]));
            var myHeadersV = self.svg.selectAll("text.headerV").data([self["headers"][1]].concat(self.labels[1]));

            myHeadersH.enter().append("text")
                .attr("class", "headerH")
                .attr("x", function(d,i){if(i==0){return self.xScale(self.rows/2+0.5)} else {return self.xScale(i);}})
                .attr("y", function(d,i){if(i==0){return self.yScale(0)-35} else {return self.yScale(0);}})
                .attr("text-anchor","middle")
                .text(function(d,i){return d;});

            myHeadersV.enter().append("text")
                .attr("class", function(d,i){if(i==0){return "rotate headerV"} else {return "headerV"}})
                .attr("x", function(d,i){if(i==0){return -self.yScale(self.columns/2+0.5)} else {return self.xScale(0);}})
                .attr("y", function(d,i){if(i==0){return self.yScale(0)-65-self["header_margin"]} else{return self.yScale(i);}})
                .attr("text-anchor","middle")
                .text(function(d,i){return d;});
        }

        self.total = 0;
        for(var i in myData) { self.total += myData[i]; }

        self.myPunches = self.svg.selectAll("circle.punches").data(myData);

        self.myPunches.enter().append("svg:circle")
            .attr("class", "punches")
            .attr("cx", function(d,i){return self.xScale(i%(myData.length/self.columns) + 1);})
            .attr("cy", function(d,i){return self.yScale(Math.floor(i/self.rows) + 1)})
            .attr("r",0)
            .on("mouseover", function(d) {self._mouseover(d)})
            .on("mouseout", self._mouseout);
            //.append("svg:title").text(function(d) { return d + " personas"; });

        self.myPunches.transition()
            .style("fill", function(d) {return self.color_scale(d);})
            .attr("r", function(d,i){return self.size_scale(d); });

    };

    // ... On document ready ...
    $(document).ready(function() {
        self.myLog("Chart Ready", 4);
        self.init();
    });

    return self;
};