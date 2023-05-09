var margin_1 = {top: 30, right: 30, bottom: 0, left: 20},
parentDivWidth3 = document.getElementById("VizMap1").clientWidth - 10,
parentDivHeight3 = document.getElementById("VizMap1").clientHeight - 50,
width_1 = parentDivWidth3 - margin_1.left - margin_1.right,
height_1 = parentDivHeight3 - margin_1.top - margin_1.bottom;

var svg_1 = d3.select("#mydataviz")
  .append("svg")
    .attr("width", width_1 + margin_1.left + margin_1.right)
    .attr("height", height_1 + margin_1.top + margin_1.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin_1.left + 30}, ${margin_1.top - 17.5})`);

d3.json("/bar").then( function(data) {
    //plot the bar chart where there will be only 4 bars with the sum of the values of each year
    var x = d3.scaleBand()
        .range([0, width_1])
        .domain(data.map(function(d) { return d.value1; }))
        .padding(.2);
    svg_1.append("g")
        .attr("transform", `translate(0, ${height_1})`)
        .attr("class", "myXaxis")
        .call(d3.axisBottom(x))
        .transition()
        .duration(1000)
        .style("color", "white");

    var y = d3.scaleLinear()
        .domain([0, (d3.max(data, function(d) { return +d.value2; }))]).nice()
        .range([height_1, 0]);
    svg_1.append("g")
        .attr("class", "myYaxis")
        .call(d3.axisLeft(y))
        .transition()
        .duration(1000)
        .style("color", "white");

    var color = d3.scaleOrdinal()
        .domain(["1", "2", "3", "4", "5", "6"])
        .range(["#7570b3","#d95f02","#1b9e77","#e7298a","#66a61e","#e6ab02"])

    svg_1.selectAll("mybar")
        .data(data)
        .join("rect")
            .attr("x", function(d) { return x(d.value1); })
            .attr("width", x.bandwidth())
            .attr("fill", function(d) { return color(d.value1); })
            .attr("height", function(d) { return height_1 - y(0); })
            .attr("y", function(d) { return y(0); })

    svg_1.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) { return y(d.value2); })
        .attr("height", function(d) { return height_1 - y(d.value2); })
        .delay(function(d,i){console.log(i) ; return(i*100)})

});
