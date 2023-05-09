d3.json('/pcp').then(function(data) {
  var margin_4 = {top: 10, right: 10, bottom: 30, left: 30},
  parentDivWidth2 = document.getElementById("Viz2").clientWidth,
  parentDivHeight2 = document.getElementById("Viz2").clientHeight - 30,
  width_4 = parentDivWidth2 - margin_4.left - margin_4.right,
  height_4 = parentDivHeight2 - margin_4.top - margin_4.bottom;

  plot_height = height_4;
  plot_width = width_4 + 130;

  data = JSON.parse(data);
  var color = ['seagreen','orangered','mediumslateblue']
  dimensions = Object.keys(data['data'][0]).filter(function(d){ return d != 'color' })

  var categories = ['base_egg_steps','base_happiness','experience_growth','percentage_male','type1', 'type2','generation', 'is_legendary']

  var y = {}
  for (i in dimensions){
      var name = dimensions[i]
      if (categories.includes(name)){
          y[name] = d3.scaleBand()
              .domain( data['data'].map(function(d){ return d[name] }) )
              .range([plot_height, 0])
              .padding(1)
      }
      else{
          y[name] = d3.scaleLinear()
              .domain( d3.extent(data['data'], function(d) { return +d[name]; } ) ).nice()
              .range([plot_height, 0])
      }
  }

  var x = d3.scalePoint()
      .range([0,plot_width])
      .padding(1)
      .domain(dimensions);

  var highlight = function(d,i){

      selected = color[i.color]
      d3.selectAll(".line")
          .transition().duration(200)
          .style("stroke", "lightgrey")
          .style("opacity", "0.2")

      d3.selectAll("." + selected)
          .transition().duration(200)
          .style("stroke", selected)
          .style("opacity", "1")

      d3.selectAll(".linenumber" + data.data.indexOf(i))
          .transition().duration(200)
          .style("stroke-width", "10px")

      // tooltip.transition()
      //     .duration(200)
      //     .style("opacity", .9);
      // tooltip.html("Pokemon Name: " + data['name'][data.data.indexOf(i)] + "<br/>" + "<br/>" + "Dimensions: " + "<br/>" + dimensions.map(function(p) { return p + ": " + i[p]; }).join("<br/>"))
      //     .style("left", 1285 + "px")
      //     .style("top", 300 + "px");
  }

  var doNotHighlight = function(event,d){
      d3.selectAll(".line")
          .transition().duration(200).delay(300)
          .style("stroke", function(d){ return( color[d.color] ) })
          .style("stroke-width", "1px")
          .style("opacity", "1")

      // console.log(data.data.indexOf(d))
      
      // tooltip.transition()
      //     .duration(500)
      //     .style("opacity", 0);
  }

  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }
      
  var svg_4 = d3.select("#mydataviz4").append("svg")
      .attr("width", width_4 + margin_4.left + margin_4.right)
      .attr("height", height_4 + margin_4.top + margin_4.bottom)
      .append("g")
      .attr("transform", `translate(${margin_4.left - 65}, ${margin_4.top + 20})`);
  
  svg_4.selectAll("myPath")
      .data(data['data'])
      .join("path")
      .attr("class", function (d,i) { 
          return "line " + color[d.color] + " linenumber"+ i } )
      .attr("d",  path)
      .style("fill", "none" )
      .style("stroke", function(d){ return( color[d.color] ) })
      .style("stroke-width", "1px")
      .style("opacity", 1)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)

  svg_4.selectAll("myAxis")
      .data(dimensions).enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
      .style("color", "white")
      .append("text")
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "white")

  // svg_4.append("text")
  //     .attr("x", (width / 2))
  //     .attr("y", -20 - (margin.top / 2))
  //     .attr("text-anchor", "middle")
  //     .style("font-size", "20px")
  //     .style("text-decoration", "underline")
  //     .style("font-weight", "bold")
  //     .text("Parallel Coordinates Plot");

  //     var legend = svg_4.selectAll(".legend")
  //     .data(color)
  //     .enter().append("g")
  //     .attr("class", "legend")
  //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // legend.append("rect")
  //     .attr("x", plot_width-40)
  //     .attr("width", 18)
  //     .attr("height", 18)
  //     .style("fill", function(d, i) { return color[i]; });

  // legend.append("text")
  //     .attr("x", plot_width-20)
  //     .attr("y", 9)
  //     .attr("dy", ".35em")
  //     .style("text-anchor", "start")
  //     .text(function(d, i) {
  //         switch (i) {
  //             case 0: return "Cluster 1";
  //             case 1: return "Cluster 2";
  //             case 2: return "Cluster 3";
  //         }
  //     }
  // );
  // var tooltip = d3.select("#plot").append("div")
  // .attr("class", "tooltip")
  // .style("font-size", "13px")
  // .style("font-weight", "bold")
  // .style("font-family", "sans-serif")
  // .style("opacity", 0);
});