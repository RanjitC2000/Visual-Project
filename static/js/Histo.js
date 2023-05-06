var margin_3 = {top: 30, right: 30, bottom: 0, left: 20},
parentDivWidth2 = document.getElementById("Viz1").clientWidth - 10,
parentDivHeight2 = document.getElementById("Viz1").clientHeight - 50,
width_3 = parentDivWidth2 - margin_3.left - margin_3.right,
height_3 = parentDivHeight2 - margin_3.top - margin_3.bottom;

// append the svg object to the body of the page
var svg_3 = d3.select("#mydataviz3")
  .append("svg")
    .attr("width", width_3 + margin_3.left + margin_3.right)
    .attr("height", height_3 + margin_3.top + margin_3.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin_3.left + 30}, ${margin_3.top - 17.5})`);

// get the data
d3.json("/hist").then(function(data) {
  console.log(data);
  let numColumns = Object.keys(data[0]).length; // assuming all objects in the array have the same keys
  let sums = {};

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
  let binIndex = 0;
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
    .padding(0.1);

// change x tick to show start year and end year like 1995-1999
  let xAxis = d3.axisBottom(x)
    .tickFormat(function(d, i) {
      return bins[i] + "-" + (bins[i] + 3);
    });

  let y = d3.scaleLinear()
    .domain([0, d3.max(binSums)]).nice()
    .range([height_3, 0]);

  svg_3.append("g")
    .attr("transform", `translate(0, ${height_3})`)
    .call(xAxis)
    .style("color", "white");

  svg_3.append("g")
    .call(d3.axisLeft(y))
    .style("color", "white");

  svg_3.selectAll("rect")
    .data(binSums)
    .join("rect")
      .attr("x", function(d, i) { return x(bins[i]); })
      .attr("y", function(d) { return y(0); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height_3 - y(0); })
      .style("fill", "#69b3a2")
      .transition()
      .duration(500)
      .attr("y", function(d) { return y(d); })
      .attr("height", function(d) { return height_3 - y(d); });

  // change the bars into a icon



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