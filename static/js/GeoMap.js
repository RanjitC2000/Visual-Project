//<svg id="my_dataviz" width="500" height="315"></svg>
margin = ({top: 20, right: 30, bottom: 30, left: 40})
parentDivWidth_1 = document.getElementById("VizMap").clientWidth,
parentDivHeight_1 = document.getElementById("VizMap").clientHeight - 30,
width = parentDivWidth_1 - margin.left - margin.right,
height = parentDivHeight_1 - margin.top - margin.bottom;

var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin.left + 30}, ${margin.top})`);

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = new Map();
var colorScale = d3.scaleThreshold()
  .domain([10,100,1000,5000,10000,100000,1000000])
  .range(d3.schemeReds[7]);

// Load external data and boot
Promise.all([
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
d3.csv("static/data/map.csv", function(d) {
    data.set(d.code, +d.pop)
})]).then(function(loadData){
    let topo = loadData[0]
    let select_country = ""

    var tooltip = d3.select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "rgb(47, 47, 47)")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("padding", "10px")

    let mouseOver = function(error,d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "white")
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 0.9)
      //if data.get(d.id) undefined then "N/A" else the value
      .html("Country : " + d.properties.name +"<br/>"+ " Emmisions : " + (data.get(d.id) ? data.get(d.id) + " Million Metric tons of CO2" : "N/A"))
      //postion to wher the mouse is
      .style("left", error.x - 100 + "px")
      .style("top", error.y - 325 + "px")
  }

  let mouseLeave = function(error,d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent")
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  //on clicking a country console log the country name
  let mouseClick = function(error,d) {
    if (select_country != d.id){
      select_country = d.id
      $.ajax({
        type: "POST",
        url: "/map",
        data: JSON.stringify({'key': select_country}),
        contentType : "application/json",
        dataType: "json",
      })
      if (select_country != "") {
        d3.select("#mydataviz").selectAll("*").remove();
        d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
        d3.select("#mydataviz3").selectAll("*").remove();
        d3.select("#mydataviz3").append("script").attr("src", "static/js/Histo.js");
      }
    }
    else{
      select_country = ""
      $.ajax({
        type: "POST",
        url: "/map",
        data: JSON.stringify({'key': select_country}),
        contentType : "application/json",
        dataType: "json",
      })
      if (select_country == "") {
        d3.select("#mydataviz").selectAll("*").remove();
        d3.select("#mydataviz").append("script").attr("src", "static/js/barChart.js");
        d3.select("#mydataviz3").selectAll("*").remove();
        d3.select("#mydataviz3").append("script").attr("src", "static/js/Histo.js");
      }
    }
  }

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
      .on("click", mouseClick )

  //Add legend for color scale
  var x = d3.scaleLinear()
    .domain([0, 1000000])
    .range([0, 300]);

  svg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(0,40)");

  var legendLinear = d3.legendColor()
    .shapeWidth(30)
    .cells(7)
    .orient('horizontal')
    .scale(colorScale);

  svg.select(".legendLinear")
    .call(legendLinear);

})