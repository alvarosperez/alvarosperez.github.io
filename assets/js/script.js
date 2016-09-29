var lnStickyNavigation;
var resize = 0;
var self = {}

var ability = {
        "Javascript": 9,
        "HTML": 9,
        "CSS": 9,
        "Python": 9,
        "d3.js": 8,
        "ElasticSearch ": 8,
        "RESTful APIs": 8,
        "Kibana": 7,
        "React": 8,

        "Hadoop": 6,
        "MapReduce": 6,
        "HIVE": 6,
        "MySQL": 4,
        "MongoDB": 2,
        "R": 3,
        "Scala": 2,

        "Android": 7,
        "Java": 6,
        "PHP": 5,
        "Bash": 5,
        "C": 4,

        "JSON": 9,
        "XML": 7,
        "Testing ": 6,
    }

var languages = {
    "Spanish": 10,
    "English": 9,
    "German": 5,
    "Portuguese": 3
}

var tools = {
    "Sublime Text": 8,
    "Jira": 8,
    "Git": 8,
    "CartoDB": 7,
    "Jenkins": 6,
    "Selenium": 6,
    "Photoshop": 5,
    "QGIS": 4,

}

$(document).ready(function()
{
    applyNavigation();
    applyResize();
    checkHash();
    checkBrowser();
    self.fillAbilities(ability, "div.row.abilities");
    self.fillAbilities(languages, "div.row.languages");
    self.fillAbilities(tools, "div.row.tools");

    self.width = $(this).width();
    if(self.width <= 420){
        resize = 2;
        self.width = 330;
    } else if(self.width > 420 && self.width <= 979){
        resize = 1;
        self.width = 420;
    } else if (self.width > 979) {
        resize = 0;
        self.width = 600;
    }
    self.wordcloud("word_cloud", self.width, 300);

});

/* NAVIGATION FUNCTIONS */

function applyNavigation()
{
    applyClickEvent();
    applyNavigationFixForPhone();
    applyScrollSpy();
    applyStickyNavigation();
}

function applyClickEvent()
{
    $('a[href*=#]').on('click', function(e)
    {
        e.preventDefault();

        if( $( $.attr(this, 'href') ).length > 0 )
        {
            $('html, body').animate(
            {
                scrollTop: $( $.attr(this, 'href') ).offset().top
            }, 400);
        }
        return false;
    });
}

function applyNavigationFixForPhone()
{
    $('.navbar li a').click(function(event)
    {
        $('.navbar-collapse').removeClass('in').addClass('collapse');
    });
}

function applyScrollSpy()
{
    $('#navbar-example').on('activate.bs.scrollspy', function()
    {
        window.location.hash = $('.nav .active a').attr('href').replace('#', '#/');
    });
}

function applyStickyNavigation()
{
    lnStickyNavigation = 0;

    $(window).on('scroll', function()
    {
        stickyNavigation();
    });

    stickyNavigation();
}

function stickyNavigation()
{
    if($(window).scrollTop() > lnStickyNavigation)
    {
        $('body').addClass('fixed');
    }
    else
    {
        $('body').removeClass('fixed');
    }
}

/* RESIZE FUNCTION */

function applyResize()
{
    $(window).on('resize', function()
    {
        lnStickyNavigation = 0 //$('.scroll-down').offset().top + 20;
        var width = $(this).width();

        $('.jumbotron').css({ height: ($(window).height()) +'px' });

        if(width <= 420 && resize != 2){
            resize = 2;
            self.wordcloud("word_cloud", 330, 300);
        } else if(width > 420 && width <= 979 && resize != 1){
            resize = 1;
            self.wordcloud("word_cloud", 420, 300);
        } else if (width > 979 && resize != 0) {
            resize = 0;
            self.wordcloud("word_cloud", 600, 300);
        }


    });
}

/* HASH FUNCTION */

function checkHash()
{
    lstrHash = window.location.hash.replace('#/', '#');

    if($('a[href='+ lstrHash +']').length > 0)
    {
        $('a[href='+ lstrHash +']').trigger('click');
    }
}

/* IE7- FALLBACK FUNCTIONS */

function checkBrowser()
{
    var loBrowserVersion = getBrowserAndVersion();

    if(loBrowserVersion.browser == 'Explorer' && loBrowserVersion.version < 8)
    {
        $('#upgrade-dialog').modal({
            backdrop: 'static',
            keyboard: false
        });
    }
}

function getBrowserAndVersion()
{
    var laBrowserData = [{
        string:         navigator.userAgent,
        subString:      'MSIE',
        identity:       'Explorer',
        versionSearch:  'MSIE'
    }];

    return {
        browser: searchString(laBrowserData) || 'Modern Browser',
        version: searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || '0.0'
    };
}

function searchString(paData)
{
    for(var i = 0; i < paData.length; i++)
    {
        var lstrDataString  = paData[i].string;
        var lstrDataProp    = paData[i].prop;

        this.versionSearchString = paData[i].versionSearch || paData[i].identity;

        if(lstrDataString)
        {
            if(lstrDataString.indexOf(paData[i].subString) != -1)
            {
                return paData[i].identity;
            }
        }
        else if(lstrDataProp)
        {
            return paData[i].identity;
        }
    }
}

function searchVersion(pstrDataString)
{
    var lnIndex = pstrDataString.indexOf(this.versionSearchString);

    if(lnIndex == -1)
    {
        return;
    }

    return parseFloat(pstrDataString.substring(lnIndex + this.versionSearchString.length + 1));
}

self.wordcloud = function(div_id, width, height){

    d3.select("#word_cloud svg").remove();
    d3.select("#word_cloud.tooltip").remove();

    var fill = d3.scale.category20();

    var angles = [0, 22.5, 45, 67.5, 90, -22.5, -45, -67.5, -90];

    self.container = d3.select("#"+div_id);

    var skills = $.extend({}, ability, tools);


    // add a tooltip
    self.tooltip = self.container.append('div')
        .html("")
        .attr("class", "wordcloud_tooltip")
        .style("opacity", 0);

    self.getHtml = function(value){
        var full_stars = ~~(value/2);
        var half_star = value%2;
        var empty_stars = 5 - full_stars - half_star;

        var html = "";
        while(full_stars > 0){
            html += '<i class="filled fa fa-star"></i>';
            full_stars -= 1;
        }
        if(half_star == 1){
            html += '<i class="filled fa fa-star-half-full"></i>';
        }
        while(empty_stars > 0){
            html += '<i class="filled fa fa-star-o"></i>';
            empty_stars -= 1;
        }
        return html;
    }

    self._mousemove = function(){
        self.tooltip
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 12) + "px");
    };

    self._mouseover = function(d){
        self.tooltip
            .html(d.text + ": " + self.getHtml(skills[d.text]))
            .style("opacity", 1);
    }

    self._mouseout = function(){
        self.tooltip
            .style("opacity", 0);
    }

    self._click = function(d){
        self.tooltip
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 12) + "px")
            .style("opacity", 1)
            .html(d.text + ": " + self.getHtml(skills[d.text]))
    }

    self.draw = function(words) {
        self.container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("mousemove",self._mousemove)
          .append("g")
            .attr("transform", "translate("+width/2+","+height/2+")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .on("mouseover", function(d) { return self._mouseover(d) })
            .on("mouseout", self._mouseout)
            .on("click", function(d) { return self._click(d) })
            .text(function(d) { return d.text; });
    }

    d3.layout.cloud().size([width, height])
        .words(Object.keys(skills).map(function(d) {
          return {text: d, size: skills[d] * 4};
        }))
        .padding(2)
        .rotate(function() { return ~~(Math.random()*2) * 90; }) //angles[Math.floor(Math.random() * angles.length)]; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", self.draw)
        .start();
}

self.fillAbilities = function(ability, query){

    self.getHtml = function(value){
        var full_stars = ~~(value/2);
        var half_star = value%2;
        var empty_stars = 5 - full_stars - half_star;

        var html = "";
        while(full_stars > 0){
            html += '<i class="filled fa fa-star"></i>';
            full_stars -= 1;
        }
        if(half_star == 1){
            html += '<i class="filled fa fa-star-half-full"></i>';
        }
        while(empty_stars > 0){
            html += '<i class="filled fa fa-star-o"></i>';
            empty_stars -= 1;
        }
        return html;
    }

    html = '<div class="col-md-6">';
    Object.keys(ability).map(function(key, i){
        if (i == parseInt(Object.keys(ability).length / 2)){
            html += '</div><div class="col-md-6">';
        }
        html += '<ul class="no-bullets">';
        html += '    <li>';
        html += '        <span class="ability-title">' + key + '</span>';
        html += '        <span class="ability-score">';
        html += self.getHtml(ability[key]);
        html += '        </span>';
        html += '    </li>';
        html += '</ul>';
    })

    $(query).html(html)
}
