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
    data = JSON.parse(data);
    if (data.Year){
        if (data.Country){
            if(data.Industry){
                d3.select("#barTitle").text(data.Industry + " Industry of " + data.Country + "'s " + data.Year+" Emmisions in Millions of Metric tons of CO2");
            }
            else{
                d3.select("#barTitle").text(data.Country + "'s " + data.Year+" Emmisions in Millions of Metric tons of CO2");
            }
        }
        else{
            d3.select("#barTitle").text(data.Year+" Worldwide Emmisions in Millions of Metric tons of CO2");
        }
    }
    else{
        d3.select("#barTitle").text(data.Country + "'s Industry Emmisions in Millions of Metric tons of CO2");
    }
    data = data.data;
    let select_industry = "";  
    var x = d3.scaleLinear()
        .domain([0, (d3.max(data, function(d) { return +d.value2; }))*1.2])
        .range([0, width_1]);

    let xAxis = d3.axisBottom(x)
        .ticks(7)
    svg_1.append("g")
        .attr("transform", `translate(0, ${height_1})`)
        .attr("class", "myXaxis")
        .call(xAxis)
        .transition()
        .duration(1000)
        .style("color", "white");

    var y = d3.scaleBand()
        .range([0, height_1])
        .domain(data.map(function(d) { return d.value1; }))
        .padding(.1);
    
    var color = d3.scaleOrdinal()
        .domain(["1", "2", "3", "4", "5", "6"])
        .range(["#7570b3","#d95f02","#1b9e77","#e7298a","#66a61e","#e6ab02"])

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
            .html("Emissions: " + (d.value2).toFixed(2) + " Million Metric Tons of CO2")
            .style("left", error.x - 600 + "px")
            .style("top", error.y - 300 + "px")
    }
    let mouseLeave = function(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
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
        .attr("width", function(d) { return x(0); })
        .attr("height", y.bandwidth() )
        .style("fill", d => color(d.value2))
        .transition()
        .duration(1000)
        .attr("width", function(d) { return x(d.value2); })
        

    svg_1.selectAll("rect")
        .on("click", mouseClick)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        
        

    svg_1.append("g")
        .attr("class", "myYaxis")
        .call(d3.axisLeft(y))
        .transition()
        .duration(1000)
        .style("color", "white")
        //keep the y axis tick labels to appear on the right side of the y axis
        .selectAll("text")
        //if the length of the text is less that 5 characters make the font size bigger
        .style("font-size", function(d){ if (d.length < 5) {return "20px"} else {return "10px"}})
        .attr("transform", function(d){ if (d.length < 5) {return "translate(150,0)"} else {return "translate(20,0)"}})
        .style("text-anchor", "start")
        .style("color", "white");

    //add click event to the y axis tick labels
    svg_1.selectAll(".myYaxis")
        .selectAll("text")
        .on("click", mouseClick)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)

    


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