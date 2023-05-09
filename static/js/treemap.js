var margin_2 = {top: 10, right: 10, bottom: 10, left: 10},
parentDivWidth = document.getElementById("Vizwithmap2").clientWidth,
parentDivHeight = document.getElementById("Vizwithmap2").clientHeight - 20,
width_2 = parentDivWidth - margin_2.left - margin_2.right,
height_2 = parentDivHeight - margin_2.top - margin_2.bottom;

// append the svg object to the body of the page
var svg_2 = d3.select("#mydataviz2")
.append("svg")
  .attr("width", width_2 + margin_2.left + margin_2.right)
  .attr("height", height_2 + margin_2.top + margin_2.bottom)
.append("g")
  .attr("transform",
        `translate(${margin_2.left}, ${margin_2.top})`);

// read json data
d3.json("/tree").then( function(data) {
  d3.select("#TreeTitle").text("Countries Renewable Energy Generation is " + (data.total/10**6).toFixed(2) + " Million GWh")
  let select_country = "";

  // Give the data to this cluster layout:
  var root = d3.hierarchy(data).sum(function(d){ return d.value}) // Here the size of each leave is given in the 'value' field in input data

  // Then d3.treemap computes the position of each element of the hierarchy
  d3.treemap()
    .size([width_2, height_2])
    .paddingTop(5)
    .paddingRight(3)
    .paddingBottom(5)
    .paddingInner(3)      // Padding between each rectangle
    //.paddingOuter(6)
    //.padding(20)
    (root)

  // prepare a color scale
  var color = d3.scaleOrdinal()
    .domain(["Asia", "Europe", "North America", "Africa", "Oceania", "South America"])
    //range of dark colors
    .range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"])

  // And a opacity scale
  var opacity = d3.scaleLinear()
    .domain([10, 30])
    .range([.5,1])

  let mouseClick = function(d,i){
    select_country = i.data.name
    $.ajax({
      type: "POST",
      url: "/tree",
      data: JSON.stringify({'key': select_country}),
      contentType : "application/json",
      dataType: "json",
    })
    if (select_country != "") {
      d3.select("#mydataviz2").selectAll("*").remove();
      d3.select("#mydataviz2").append("script").attr("src", "static/js/treeCountry.js");
    }
  }


  // use this information to add rectangles:
  svg_2
    .selectAll("rect")
    .data(root.leaves())
    .join("rect")
      .transition()
      .duration(1000)
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "white")
      .style("fill", function(d){ return color(d.parent.data.name)} )
      .style("opacity", function(d){ return opacity(d.data.value)})
      // .on("mouseover", function(d) {
      //   d3.select(this).style("fill", "#F7F79F")
      //   d3.select(this).style("opacity", 1)
      //   d3.select(this).style("stroke", "white")
      //   d3.select(this).style("stroke-width", 3)
      //   d3.select(this).style("cursor", "pointer")
      // })
      // .on("mouseout", function(d) {
      //   d3.select(this).style("fill", function(d){ return color(d.parent.data.name)} )
      //   d3.select(this).style("opacity", function(d){ return opacity(d.data.value)})
      //   d3.select(this).style("stroke", "white")
      //   d3.select(this).style("stroke-width", 1)
      // })
      // .on("click", function(d,i){
      //   select_country = i.data.name
      //   $.ajax({
      //     type: "POST",
      //     url: "/tree",
      //     data: JSON.stringify({'key': select_country}),
      //     contentType : "application/json",
      //     dataType: "json",
      //   })
      //   if (select_country != "") {
      //     d3.select("#mydataviz2").selectAll("*").remove();
      //     d3.select("#mydataviz2").append("script").attr("src", "static/js/treeCountry.js");
      //   }
      // }
      // )   

      // add on click event to the rectangles through a variable
      svg_2
        .selectAll("rect")
        .data(root.leaves())
        .join("rect")
          .on("click", mouseClick)
          .style("cursor", "pointer")


  // and to add the text labels
  // svg_2
  //   .selectAll("text")
  //   .data(root.leaves())
  //   .enter()
  //   .append("text")
  //     .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
  //     .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
  //     .text(function(d){ return d.data.name.replace('mister_','') })
  //     .attr("font-size", "19px")
  //     .attr("fill", "white")

  //Dynamic text labels depending on the size of the rectangle if too small don't show
  svg_2
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .transition()
      .duration(1000)
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+15})    // +20 to adjust position (lower)
      .text(function(d){if (d.data.percent > 0.4){ return d.data.name}})
      .attr("font-size", function(d){
        if (d.x1 - d.x0 < 25){
          return "0px"
        }
        else{
          //change the font size depending on the size of the rectangle
          return d.x1 - d.x0 < 60 ? "10px" : "19px"
        }
      })
      .attr("fill", "white")

  //add title to each group
  svg_2
    .selectAll("titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0})
      .attr("y", function(d){ return d.y0+21})
      .text(function(d){ return d.data.name })
      .attr("font-size", "19px")
      .attr("fill",  function(d){ return color(d.data.name)} )

  // add on click event to the text through a variable
  svg_2
    .selectAll("text")
    .data(root.leaves())
    .join("text")
      .on("click", mouseClick)
      .style("cursor", "pointer")

  svg_2
    .selectAll("vals")
    .data(root.leaves())
    .enter()
    .append("text")
      .transition()
      .duration(1000)
      .attr("x", function(d){ return d.x0 + (d.x1 - d.x0)/2 - 10})
      .attr("y", function(d){ return d.y0 + (d.y1 - d.y0)/2 + 5})  
      .text(function(d){
        if (d.data.percent > 0.4){return d.data.percent + "%" }
         })
      .attr("font-size", function(d){
        if (d.x1 - d.x0 < 25){
          return "0px"
        }
        else{
          return d.x1 - d.x0 < 60 ? "10px" : "19px"
        }
      })
      .attr("fill", "white")

  svg_2
    .selectAll("vals")
    .data(root.leaves())
    .join("text")
      .on("click", mouseClick)
      .style("cursor", "pointer")

  
})