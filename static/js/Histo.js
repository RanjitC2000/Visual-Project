var margin_3 = {top: 30, right: 30, bottom: 0, left: 20},
parentDivWidth2 = document.getElementById("Viz1").clientWidth - 10,
parentDivHeight2 = document.getElementById("Viz1").clientHeight - 50,
width_3 = parentDivWidth2 - margin_3.left - margin_3.right,
height_3 = parentDivHeight2 - margin_3.top - margin_3.bottom;

var s = "";
$.ajax({url: '/get_variable_value'}).done(function (data) {
  s = data.my_variable;
})

var container = document.getElementById('mydataviz3');
if (container.querySelector('svg')) {
  // If there is, remove it
  container.removeChild(container.querySelector('svg'));
}
// append the svg object to the body of the page
var svg_3 = d3.select(container)
  .append("svg")
    .attr("width", width_3 + margin_3.left + margin_3.right)
    .attr("height", height_3 + margin_3.top + margin_3.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin_3.left + 30}, ${margin_3.top - 17.5})`);

// get the data
d3.json("/hist").then(function(data) {
  data = JSON.parse(data);
  data_name = data.name;
  //if data.Industry exists then data_industry = data.Industry
  if (data_name.length == 1 ){

    if (data.Industry) {
      data_industry = data.Industry;
      d3.select("#histTitle").text(data_industry + " Industry of " + data_name[0] + "'s Yearly Emmisions in Millions of Metric tons of CO2");
    }
    else{
    d3.select("#histTitle").text(data_name[0]+ "'s Yearly Emmisions in Millions of Metric tons of CO2");
    }
  }
  else{
    d3.select("#histTitle").text("Worldwide Yearly Emissions in Millions of Metric tons of CO2");
  }
  var colors ={
    'Asia': 'seagreen',
    'Europe': 'orangered',
    'North America': 'mediumslateblue',
    'Africa': 'deeppink',
    'Oceania': 'chartreuse',
    'South America': 'gold',
    'World': 'darkslategray',
  }
  var color = colors[data.continent];
  data = data.data;
  let numColumns = Object.keys(data[0]).length; // assuming all objects in the array have the same keys
  let sums = {};
  let selected_year_range = s;

  // initialize sums object with keys for each column and values of 0
  for (let i = 0; i < numColumns; i++) {
    sums[Object.keys(data[0])[i]] = 0;
  }
  data.forEach(function(d) {
    // add each value to the corresponding sum
    Object.keys(d).forEach(function(key) {
      sums[key] += d[key];
    });
  });
  //with bin size as 4 sum up the values i.e, first bin = sums[:4].values().sum() and so on
  let binSize = 4;
  let binSums = [];
  let binSum = 0;
  let binIndex = 1;
  Object.keys(sums).forEach(function(key) {
    binSum += sums[key];
    if (binIndex % binSize == 0) {
      binSums.push(binSum);
      binSum = 0;
    }
    binIndex++;
  });

  //plot the histogram with the binSums
  let years = d3.range(1995, 2019);

  let bins = d3.range(1995, 2019, 4);

  let x = d3.scaleBand()
    .domain(bins)
    .range([0, width_3])
    .padding(0.01);

// change x tick to show start year and end year like 1995-1999
  let xAxis = d3.axisBottom(x)
    .tickFormat(function(d, i) {
      return bins[i] + "-" + (bins[i] + 3);
    });

  let y = d3.scaleLinear()
    .domain([0, d3.max(binSums)]).nice()
    .range([height_3, 0]);

  var tooltip = d3.select("#mydataviz3")
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
      .html("Emissions: " + (d).toFixed(2) + " Million Metric Tons")
      .style("left", error.x - 1200 + "px")
      .style("top", error.y - 450 + "px")
  }
  let mouseLeave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
      .style("left", 0 + "px")
      .style("top", 0 + "px")
  }

  svg_3.append("g")
    .attr("transform", `translate(0, ${height_3})`)
    .call(xAxis)
    .transition()
    .duration(1000)
    .style("color", "white");

  svg_3.append("g")
    .call(d3.axisLeft(y))
    .transition()
    .duration(1000)
    .style("color", "white");

  // if year is selected make that bar highlighted
  //$.ajax({url: '/get_variable_value'}).done(function (data) {
//     var s = data.my_variable;
//     if (s != ""){
//         d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
//     }
//     else{
//         d3.select("#mydataviz").append("script").attr("src", "static/js/barChart.js");
//     }
// })
  if (s != ""){
    svg_3.selectAll("rect")
    .data(binSums)
    .join("rect")
      .attr("x", function(d, i) { return x(bins[i]); })
      .attr("y", function(d) { return y(0); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height_3 - y(0); })
      .style("fill", function(d, i) { 
        return bins[i] == s ? "darkred" : color; })
      .style("stroke", "white")
      .style("stroke-width", function(d, i) { return bins[i] == s ? 3 : 1; })
      .transition()
      .duration(500)
      .attr("y", function(d) { return y(d); })
      .attr("height", function(d) { return height_3 - y(d); });
  }
  else{
  svg_3.selectAll("rect")
  .data(binSums)
  .join("rect")
    .attr("x", function(d, i) { return x(bins[i]); })
    .attr("y", function(d) { return y(0); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height_3 - y(0); })
    .style("fill", color)
    .style("stroke", "white")
    .style("stroke-width", 1)
    .transition()
    .duration(500)
    .attr("y", function(d) { return y(d); })
    .attr("height", function(d) { return height_3 - y(d); });
  }
  // svg_3.selectAll("rect")
  // .data(binSums)
  // .join("rect")
  //   .attr("x", function(d, i) { return x(bins[i]); })
  //   .attr("y", function(d) { return y(0); })
  //   .attr("width", x.bandwidth())
  //   .attr("height", function(d) { return height_3 - y(0); })
  //   .style("fill", color)
  //   .transition()
  //   .duration(500)
  //   .attr("y", function(d) { return y(d); })
  //   .attr("height", function(d) { return height_3 - y(d); });

  let mouseClick = function(error,d) {
    //make all other bars normal
    svg_3.selectAll("rect")
      .style("fill", color)
      .style("opacity", 1)
      .style("stroke", "white")
      .style("stroke-width", 1)
      .style("cursor", "default")
    //Highlight the selected bar
    d3.select(this).style("fill", "darkred")
    d3.select(this).style("opacity", 1)
    d3.select(this).style("stroke", "white")
    d3.select(this).style("stroke-width", 3)
    d3.select(this).style("cursor", "pointer")
    if (selected_year_range == bins[binSums.indexOf(d)]) {
      selected_year_range = "";
      d3.select(this).style("fill", color)
      d3.select(this).style("opacity", 1)
      d3.select(this).style("stroke", "white")
      d3.select(this).style("stroke-width", 1)
      d3.select(this).style("cursor", "default")
    } else {
    selected_year_range = bins[binSums.indexOf(d)];
    }
    $.ajax({
      type: "POST",
      url: "/hist",
      data: JSON.stringify({'year_range': selected_year_range}),
      contentType : "application/json",
      dataType: "json",
    })
    if (selected_year_range != "") {
      d3.select("#mydataviz").selectAll("*").remove();
      d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
    }
    else{
      $.ajax({url: '/get_continent_value'}).done(function (data) {
        var a = data.my_variable;
        if (a == ""){
            $.ajax({url: '/get_country_value'}).done(function (data) {
                var b = data.my_variable;
                if (b == ""){
                console.log("here1")
                d3.select("#mydataviz").selectAll("*").remove();
                d3.select("#mydataviz").append("script").attr("src", "static/js/barChart.js");
                }
                else{
                d3.select("#mydataviz").selectAll("*").remove();
                d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
                }})
        }
        else{
            console.log("here2")
            d3.select("#mydataviz").selectAll("*").remove();
            d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
        }
    })
    }
  }

  

  svg_3.selectAll("rect")
    .on("click", mouseClick)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);


});
// d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv").then( function(data) {

//   console.log(data);
//   // X axis: scale and draw:
//   const x = d3.scaleLinear()
//       .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
//       .range([0, width_3]);
//   svg_3.append("g")
//       .attr("transform", `translate(0, ${height_3})`)
//       .call(d3.axisBottom(x));

//   // set the parameters for the histogram
//   const histogram = d3.histogram()
//       .value(function(d) { return d.price; })   // I need to give the vector of value
//       .domain(x.domain())  // then the domain of the graphic
//       .thresholds(x.ticks(70)); // then the numbers of bins

//   // And apply this function to data to get the bins
//   const bins = histogram(data);

//   // Y axis: scale and draw:
//   const y = d3.scaleLinear()
//       .range([height_3, 0]);
//       y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
//   svg_3.append("g")
//       .call(d3.axisLeft(y));

//   // append the bar rectangles to the svg element
//   svg_3.selectAll("rect")
//       .data(bins)
//       .join("rect")
//         .attr("x", 1)
//     .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
//         .attr("width", function(d) { return x(d.x1) - x(d.x0) -1})
//         .attr("height", function(d) { return height_3 - y(d.length); })
//         .style("fill", "#69b3a2")

// });