d3.json('/pcp').then(function(data) {
  var margin_4 = {top: 10, right: 10, bottom: 30, left: 30},
  parentDivWidth2 = document.getElementById("Viz2").clientWidth,
  parentDivHeight2 = document.getElementById("Viz2").clientHeight - 30,
  width_4 = parentDivWidth2 - margin_4.left - margin_4.right,
  height_4 = parentDivHeight2 - margin_4.top - margin_4.bottom;

  plot_height = height_4 - 30;
  plot_width = width_4 + 141;

  data = JSON.parse(data);
  let select_cont = "";
  var color = ['seagreen','orangered','deeppink','mediumslateblue','gold','chartreuse']
  var selected_continent = {'seagreen': 'Asia', 'orangered': 'Europe', 'mediumslateblue': 'North America', 'deeppink': 'Africa', 'chartreuse': 'Oceania', 'gold': 'South America'}
  dimensions = Object.keys(data['data'][0]).filter(function(d){ return d != 'color' })

  var categories = ['base_egg_steps','base_happiness','experience_growth','percentage_male','type1', 'type2','generation', 'is_legendary']

  let selected_year_range = "";
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
        if (select_cont == ""){
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
                //highlight the legend of the cluster that is selected
            d3.selectAll(".legend")
                .transition().duration(200)
                .style("opacity", "0.2")

            d3.selectAll(".legendnumber" + selected)
                .transition().duration(200)
                .style("opacity", "1")
        }

        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Country " + data['name'][data.data.indexOf(i)])
            .style("left", (d.x - 800) + "px")
            .style("top", (d.y-750) + "px");
  }

  var doNotHighlight = function(event,d){
        //legend is selected, do this
        if (select_cont == ""){
            d3.selectAll(".line")
                .transition().duration(200).delay(300)
                .style("stroke", function(d){ return( color[d.color] ) })
                .style("stroke-width", "1.5px")
                .style("opacity", "1")
            d3.selectAll(".legend")
                .transition().duration(200)
                .style("opacity", "1")
        }
        

        //highlight the legend of the cluster that is selected

    //   // console.log(data.data.indexOf(d))
      
    tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        .style("left", 0 + "px")
        .style("top", 0 + "px");
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
      .style("stroke-width", "1.5px")
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

 //show the legend below the graph
 var legend = svg_4.selectAll(".legend")
    .data(color)
    .enter().append("g")
    .attr("class", function (d,i) { return "legend " + " legendnumber" + color[i] })
    .attr("transform", function(d, i) { return "translate(" + ((i * 118 - 100) - 600) + ","+(plot_height+20)+")"; });

//on clicking legend, highlight the cluster that is selected and grey out the rest
var legendclick = function(d,i){
    selected = i
    d3.selectAll(".line")
        .transition().duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2")

    d3.selectAll("." + selected)
        .transition().duration(200)
        .style("stroke", selected)
        .style("opacity", "1")

    //highlight the legend of the cluster that is selected
    d3.selectAll(".legend")
        .transition().duration(200)
        .style("opacity", "0.2")

    d3.selectAll(".legendnumber" + selected)
        .transition().duration(200)
        .style("opacity", "1")

    
}

  //if you click on the same legend again, reset the graph
    var legendclickreset = function(d,i){   
        d3.selectAll(".line")
            .transition().duration(200).delay(300)
            .style("stroke", function(d){ return( color[d.color] ) })
            .style("stroke-width", "1px")
            .style("opacity", "1")
        d3.selectAll(".legend")
            .transition().duration(200)
            .style("opacity", "1")
    }

    legend.append("rect")
        .attr("x", plot_width-40)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return color[i]; })
        //add a click event to console log the color of the legend that is clicked
        .on("click", function(d,i){
            if (select_cont == selected_continent[i]){
                select_cont = ""
                $.ajax({
                    type: "POST",
                    url: "/pcp",
                    data: JSON.stringify({'key': select_cont}),
                    contentType : "application/json",
                    dataType: "json",
                })
                d3.select("#my_dataviz").selectAll("*").remove();
                d3.select("#my_dataviz").append("script").attr("src", "static/js/GeoMap.js");
                d3.select("#mydataviz").selectAll("*").remove();
                $.ajax({url: '/get_variable_value'}).done(function (data) {
                    var s = data.my_variable;
                    if (s != ""){
                        d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
                    }
                    else{
                        d3.select("#mydataviz").append("script").attr("src", "static/js/barChart.js");
                    }
                })
                // d3.json("/get_variable_value", function(error,data) {
                //     console.log(error,data,data.my_variable);
                //     selected_year_range = data.selected_year_range;
                // });
                // if (selected_year_range != ""){
                //     d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
                // }
                // else{
                // d3.select("#mydataviz").append("script").attr("src", "static/js/barChart.js");
                //}
                d3.select("#mydataviz2").selectAll("*").remove();
                d3.select("#mydataviz2").append("script").attr("src", "static/js/treemap.js");
                d3.select("#mydataviz3").selectAll("*").remove();
                d3.select("#mydataviz3").append("script").attr("src", "static/js/Histo.js");
                legendclickreset(d,i)
                }
                else{
                    select_cont = selected_continent[i]
                    $.ajax({
                        type: "POST",
                        url: "/pcp",
                        data: JSON.stringify({'key': select_cont}),
                        contentType : "application/json",
                        dataType: "json",
                    })
                    legendclick(d,i)
                    d3.select("#my_dataviz").selectAll("*").remove();
                    d3.select("#my_dataviz").append("script").attr("src", "static/js/GeoMap.js");
                    d3.select("#mydataviz").selectAll("*").remove();
                    d3.select("#mydataviz").append("script").attr("src", "static/js/barHori.js");
                    d3.select("#mydataviz2").selectAll("*").remove();
                    d3.select("#mydataviz2").append("script").attr("src", "static/js/treemap.js");
                    d3.select("#mydataviz3").selectAll("*").remove();
                    d3.select("#mydataviz3").append("script").attr("src", "static/js/Histo.js");
                    }
                    });

    legend.append("text")
        .attr("x", plot_width-20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        //change text color to white
        .style("fill", "white")
        .text(function(d, i) {
            switch (i) {
                case 0: return "Asia";
                case 1: return "Europe";
                case 2: return "Africa";
                case 3: return "N. America";
                case 4: return "S. America";
                case 5: return "Oceania";
            }
        }
    );


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
  var tooltip = d3.select("#mydataviz4")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "rgb(47, 47, 47)")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "10px")

});