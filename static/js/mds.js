var margin_3 = {top: 20, right: 30, bottom: 0, left: 10},
parentDivWidth2 = document.getElementById("Viz1").clientWidth,
parentDivHeight2 = document.getElementById("Viz1").clientHeight - 30,
width_3 = parentDivWidth2 - margin_3.left - margin_3.right,
height_3 = parentDivHeight2 - margin_3.top - margin_3.bottom;

// append the svg object to the body of the page
var svg_3 = d3.select("#mydataviz3")
  .append("svg")
    .attr("width", width_3 + margin_3.left + margin_3.right)
    .attr("height", height_3 + margin_3.top + margin_3.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin_3.left}, ${margin_3.top})`);

d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv").then(function(data) {

  // List of groups = header of the csv files
  var keys = data.columns.slice(1)

  // Add X axis
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width_3 ]);
  svg_3.append("g")
    .attr("transform", `translate(0, ${height_3*0.8})`)
    .call(d3.axisBottom(x).tickSize(-height_3*.7).tickValues([1900, 1925, 1975, 2000]))
    .select(".domain").remove()
  // Customization
  svg_3.selectAll(".tick line").attr("stroke", "#b8b8b8")

  // Add X axis label:
  svg_3.append("text")
      .attr("text-anchor", "end")
      .attr("x", width_3)
      .attr("y", height_3-30 )
      .text("Time (year)");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-100000, 100000])
    .range([ height_3, 0 ]);

  // color palette
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeDark2);

  //stack the data?
  var stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys)
    (data)

  // create a tooltip
  var Tooltip = svg_3
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("font-size", 17)

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(event,d) {
    Tooltip.style("opacity", 1)
    d3.selectAll(".myArea").style("opacity", .2)
    d3.select(this)
      .style("stroke", "white")
      .style("opacity", 1)
  }
  var mousemove = function(event,d,i) {
    grp = d.key
    Tooltip.text(grp)
  }
  var mouseleave = function(event,d) {
    Tooltip.style("opacity", 0)
    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }

  // Area generator
  var area = d3.area()
    .x(function(d) { return x(d.data.year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })

  // Show the areas
  svg_3
    .selectAll("mylayers")
    .data(stackedData)
    .join("path")
      .attr("class", "myArea")
      .style("fill", function(d) { return color(d.key); })
      .attr("d", area)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

})
