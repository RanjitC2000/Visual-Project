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
  .attr("transform", `translate(${width_1/2+margin_1.left}, ${height_1/2+margin_1.top})`);

d3.json('/bar').then( function(data) {
  console.log(data)

// Scales
var x = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(data.map(d => d.value1));
var y = d3.scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([0, 150000]);

// Add the bars
svg_1.append("g")
  .selectAll("path")
  .data(data)
  .join("path")
    .attr("fill", "#69b3a2")
    .attr("d", d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(d => y(d['value2']))
        .startAngle(d => x(d.value1))
        .endAngle(d => x(d.value1) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius))

// Add the labels
svg_1.append("g")
    .selectAll("g")
    .data(data)
    .join("g")
      .attr("text-anchor", function(d) { return (x(d.value1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
      .attr("transform", function(d) { return "rotate(" + ((x(d.value1) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['value2'])+10) + ",0)"; })
    .append("text")
      .text(function(d){return(d.value1)})
      .attr("transform", function(d) { return (x(d.value1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
      .style("font-size", "11px")
      .attr("alignment-baseline", "middle")
      .attr("fill", "white")

});