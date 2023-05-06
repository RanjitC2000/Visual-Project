var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

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

    let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "white")
  }

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent")
  }

  //on clicking a country console log the country name
  let mouseClick = function(error,d) {
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

})