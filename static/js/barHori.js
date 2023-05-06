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

// Parse the Data
d3.json("/bar").then( function(data) {
    console.log(data)
    let select_industry = "";
    // X axis
    // var x = d3.scaleBand()
    //     .range([ 0, width_1 ])
    //     .domain(data.map(function(d) { return d.value1; }))
    //     .padding(0.2);
    // svg_1.append("g")
    //     .attr("transform", `translate(0, ${height_1})`)
    //     .call(d3.axisBottom(x))
    //     .style("color", "white")
    //     .selectAll("text")
    //         .attr("transform", "translate(-10,0)rotate(-45)")
    //         .style("text-anchor", "end")
    //         .style("color", "white");

    // // Add Y axis
    // var y = d3.scaleLinear()
    //     .domain([0,d3.max(data, function(d) { return +d.value2; })])
    //     .range([ height_1, 0]);
    // svg_1.append("g")
    //     .call(d3.axisLeft(y))
    //     .style("color", "white");

    // // Bars
    // svg_1.selectAll("mybar")
    //     .data(data)
    //     .enter()
    //     .append("rect")
    //         .attr("x", function(d) { return x(d.value1); })
    //         .attr("y", function(d) { return y(d.value2); })
    //         .attr("width", x.bandwidth())
    //         .attr("height", function(d) { return height_1 - y(d.value2); })
    //         .attr("fill", "#69b3a2")

    //create horizontal bar chart   
    var x = d3.scaleLinear()
        .domain([0, (d3.max(data, function(d) { return +d.value2; }))*1.2])
        .range([0, width_1]);

    let xAxis = d3.axisBottom(x)
        .ticks(7)
    svg_1.append("g")
        .attr("transform", `translate(0, ${height_1})`)
        .call(xAxis)
        .style("color", "white");

    var y = d3.scaleBand()
        .range([0, height_1])
        .domain(data.map(function(d) { return d.value1; }))
        .padding(.1);

    let mouseClick = function(error,d) {
            console.log(d)
            if (typeof d === "object") {
                select_industry = d.value1;
            } else {
                select_industry = d;
            }
            $.ajax({
              type: "POST",
              url: "/bar",
              data: JSON.stringify({'industry': select_industry}),
              contentType : "application/json",
              dataType: "json",
            })
            if (select_industry != "") {
              d3.select("#mydataviz3").selectAll("*").remove();
              d3.select("#mydataviz3").append("script").attr("src", "static/js/Histo.js");
            }
          }
        

    // svg_1.selectAll("rect")
    //     .data(data)
    //     .join("rect")
    //     .attr("x", x(0) )
    //     .attr("y", function(d) { return y(d.value1); })
    //     .attr("width", function(d) { return x(d.value2); })
    //     .attr("height", y.bandwidth() )
    //     .on("click", mouseClick)
    //     .style("fill", "#69b3a2")

    //Add Transition while loading the page
    svg_1.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.value1); })
        .attr("width", function(d) { return x(d.value2); })
        .attr("height", y.bandwidth() )
        .on("click", mouseClick)
        .style("fill", "#69b3a2")
        .transition()
        .duration(500)
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.value1); })
        .attr("width", function(d) { return x(d.value2); })
        .attr("height", y.bandwidth() );
        

    svg_1.append("g")
        .call(d3.axisLeft(y))
        //keep the y axis tick labels to appear on the right side of the y axis
        .selectAll("text")
        .attr("transform", "translate(20,0)")
        .style("text-anchor", "start")
        .style("color", "white")
        .on("click", mouseClick);



    //add text to bars
    // svg_1.selectAll("myRect")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //     .attr("x", function(d) { return x(d.value2) + 20; })
    //     .attr("y", function(d) { return y(d.value1); })
    //     .attr("dy", "1.5em")
    //     .attr("dx", "-1.5em")
    //     .text(function(d) { return d.value1; })
    //     .attr("fill", "white")
    //     .attr("font-size", "12px")
    //     .attr("text-anchor", "start")
    //     .style("opacity", 0)
    //     .transition()
    //     .duration(2000)
    //     .style("opacity", 1)

})