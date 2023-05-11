var margin_1 = {top: 40, right: 0, bottom: 0, left: 0},
width_1 = Math.min(window.innerWidth, window.innerHeight) * 0.55 - margin_1.left - margin_1.right,
height_1 = Math.min(window.innerWidth, window.innerHeight) * 0.425 - margin_1.top - margin_1.bottom,
innerRadius = 90,
outerRadius = Math.min(width_1, height_1) / 2;

// append the svg object
var svg_1 = d3.select("#mydataviz")
.append("svg")
  .attr("width", width_1 + margin_1.left + margin_1.right)
  .attr("height", height_1 + margin_1.top + margin_1.bottom)
.append("g")
  .attr("transform", `translate(${width_1/2+margin_1.left + 30}, ${height_1/2+margin_1.top})`);



d3.json('/bar').then( function(data) {
  data = JSON.parse(data);
  console.log(data);
  d3.select("#barTitle").text("Worldwide Total Emissions "+ data.total + " Million Metric Tons of CO2");
  data = data.data;


// Scales
var x = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(data.map(d => d.value1));
var y = d3.scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([0, 150000]);

//add colors based on d.value2 there are 6 of them
var color = d3.scaleOrdinal()
    .domain(["1", "2", "3", "4", "5", "6"])
    //use colorbrewer dark2 colors
    .range(["#7570b3","#d95f02","#1b9e77","#e7298a","#66a61e","#e6ab02"])

var tooltip = d3.select("#mydataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "rgb(47, 47, 47)")
    .style("color", "white")
    .style("border-radius", "5px")
    .style("padding", "10px")


let mouseOver = function(error,d) {
  tooltip
    .transition()
    .duration(200)
  tooltip
    .style("opacity", 0.9)
    .html("Emissions: " + (d.value3).toFixed(2) + " Million Metric Tons of CO2")
    .style("left", error.x - 600 + "px")
    .style("top", error.y - 350 + "px")
}
let mouseLeave = function(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
}

// Add the bars
svg_1.append("g")
  .selectAll("path")
  .data(data)
  .join("path")
    .attr("fill", d => color(d.value2))
    .attr("d", d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(d => y(d['value3']))
        .startAngle(d => x(d.value1))
        .endAngle(d => x(d.value1) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius))

//Add an axis leave some between the first and last bar
var yAxis = svg_1.append("g")
  .attr("text-anchor", "middle");

var yTick = yAxis
  .selectAll("g")
  .data(y.ticks(3).slice(1))
  .join("g");

yTick.append("circle")
  .attr("fill", "none")
  .attr("stroke", "white")
  .attr("stroke-opacity", 0.5)
  .attr("r", y);

yTick.append("text")
  .attr("y", d => -y(d))
  .attr("dy", "0.35em")
  .text(y.tickFormat(5, "s"));

//reduce sizes of tick labels
yTick.selectAll("text")
  .attr("font-size", "10px")
  .attr("fill", "white")
  .style("font-family", "sans-serif")

// yTick.append("text")
//   .attr("y", d => -y(d) - 10)
//   .attr("dy", "0.35em")
//   .text("GWh");

// Add the labels
svg_1.append("g")
  .selectAll("g")
  .data(data)
  .join("g")
    .attr("text-anchor", function(d) { return (x(d.value1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
    .attr("transform", function(d) { return "rotate(" + ((x(d.value1) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['value3']) +5) + ",0)"; })
  .append("text")
    .text(function(d){return(d.value1)})
    .attr("transform", function(d) { return (x(d.value1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)";})
    .style("font-size", "11px")
    .attr("alignment-baseline", "middle")
    .attr("fill", "white")
    .style("font-family", "sans-serif")

  //add mouseover and mouseleave events to the bars
  svg_1.selectAll("path")
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)

  svg_1.selectAll("text")
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)

  //Add legend in the center of the chart showing the colors as Continents
  
});


// // Add the labels
// svg_1.append("g")
//     .selectAll("g")
//     .data(data)
//     .join("g")
//       .attr("text-anchor", function(d) { return (x(d.value1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
//       .attr("transform", function(d) { return "rotate(" + ((x(d.value1) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['value3'])+10) + ",0)"; })
//     .append("text")
//       .text(function(d){return(d.value1)})
//       .attr("transform", function(d) { return (x(d.value1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
//       .style("font-size", "11px")
//       .attr("alignment-baseline", "middle")
//       .attr("fill", "white")
//       .style("font-family", "sans-serif")

// });