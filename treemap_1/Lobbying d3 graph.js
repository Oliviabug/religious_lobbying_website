(function () {

  // The width and height of my different graphs should all have different varibale name
  var width = 800;
  var height = 500;

  // Same for the margin as well as for the svg and g varibales
  var margin = {
    top: 0,
    right: 0,
    left: 0,
    bottom: 0
  };


  var svg = d3.select('div#treemap_1').append("svg")
      .attr("width", width)
      .attr("height", height)


  width = width - margin.right - margin.left;
  height = height - margin.bottom - margin.top;

  //append a svg and make it responsive
  // var svg = d3.select("div#treemap_1")
  //    .append("div")
  //    .classed("svg-container", true) //container class to make it responsive
  //    .append("svg")
  //    //responsive SVG needs these 2 attributes and no width and height attr
  //    .attr("preserveAspectRatio", "xMinYMin meet")
  //    .attr("viewBox", "0 0 950 650")
  //    //class to make it responsive
  //    .classed("svg-content-responsive", true);


  d3.selection.prototype.moveToFront = function() {
     return this.each(function(){
       this.parentNode.appendChild(this);
     });
   };

  /*This creates a div for the tooltip*/
  var div = d3.select("#treemap_1").append("div")
       .attr("class", "tooltip")
       .style("opacity", 0);


  drawTreeMap("treemap_1/Lobbying_orgs_for_d3.csv");

  function drawTreeMap(datafile) {
    d3.csv('treemap_1/Lobbying_orgs_for_d3.csv', function(data) { /*This retrieves the dataset*/
      console.log(data);

      data.forEach(function(d) { /*The forEach is for the function to go through every single item*/
        d["Costs (Higher)"] = +d["Costs (Higher)"]; /*This is for when the column names that have a space*/
      });
      // console.log(data[0]); /*We choose the rows index*/

      var org_section = d3.nest()
      .key(function(d) { return d.Section; }).rollup(function(leaves){
        return d3.sum(leaves, function(d){
          return d["Costs (Higher)"]
        })
      })
      .entries(data);

      console.log(org_section);

  // /*Size of our tree map*/
  //     var width = 1000;
  //     var height = 600;


      var format = d3.formatLocale({
        decimal: ".",
        thousands: ",",
        grouping: [3],
        currency: ["£", ""]
      }).format(",d");

      var color = d3.scaleOrdinal().range(colorbrewer.Set3["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",[6]]);
              //define color scale
      color.domain(org_section.map(function(d){ return d.key; }));

      var treemap = d3.treemap()
      .tile(d3.treemapBinary) /*This calls the treemap shape with d3*/
      .size([width, height])
      .padding(0)
      .round(true);

  /*This variable root is what data we want the tree to have inside*/
      var root = d3.hierarchy({values: org_section}, function(d){ return d.values; })
                    .sum(function(d){ return d.value});

      console.log(root);


        treemap(root);


      var node = d3.select("#treemap_1").select('svg')
        .selectAll(".node")
        .data(root.leaves())

      node.exit().remove();

      var new_nodes = node
        .enter()
        .append("g")
        .attr("class", "node");

      node = node.merge(new_nodes)

      // var new_nodes = node.enter().append("rect")
    node.append('rect')
          .attr('stroke', 'white')
          .attr('stroke-width', '1px')
          .attr("class", "node")
          .style("x", function(d) { return d.x0 + "px"; })
          .style("y", function(d) { return d.y0 + "px"; })
          .style("width", function(d) { return d.x1 - d.x0 + "px"; })
          .style("height", function(d) { return d.y1 - d.y0 + "px"; })
          .style("fill", function(d){ console.log(color(d.data.key)); return color(d.data.key);})
          .on("mouseover", function(d){   /*MOUSE OVER*/ /*This allows a change of color in the nodes when the user hovers over with the mouse*/
            var selected_label = d3.select(this).select(".node-label");
            d3.select(this)
              .style('background', "lightYellow")
              // .style('overflow', 'visible')
              // .style('z-index', 100);/*Layers in the screen have a default z-index of 1 so if a layer is higher than 1 is gonna show infront of whatever has a lower index*/
            d3.select(this).select(".node-label")
              .style("overflow", "visible")
              .style('font-weight', 'bold')
              .style('font-size','15px')
              .style("word-wrap", "break-word");
           div.transition()
              .duration(200)
             .style("opacity", .9);
           div.text(d.data.key + ': ' + "€" + format(d.data.value))
             .attr("text-align", "center")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
         div.moveToFront();

            d3.select(this).select(".node-value")
                  .style("font-size", "15px")
                  .style("font-weight", "bold")
                  .text(function(d) { return "€" + format(d.value) ; });



          })
          /*MOUSE OUT*/
          /*This return the original color of the nodes when the user mouse out*/
          .on('mouseout', function(d){
            d3.select(this)/*This is the data we are showing so the squares that have values of money*/
              .style("background", function(d){ return color(d.data.key);})
              .style('overflow', 'hidden')
              // .style('z-index', 1)
            d3.select(this).select(".node-label")
                    .style("font-weight", "normal")
                    .style("font-size", "10px")
                div.style("opacity", 0);

            d3.select(this).select(".node-value")
                    .style("font-weight", "normal")
                    .style("font-size", "10px");


          });

      // node = node.merge(new_nodes)
        // .style("x", function(d) { return d.x0 + "px"; })
        // .style("y", function(d) { return d.y0 + "px"; })
        // .style("width", function(d) { return d.x1 - d.x0 + "px"; })
        // .style("height", function(d) { return d.y1 - d.y0 + "px"; })
        // .style("fill", function(d){ console.log(color(d.data.key)); return color(d.data.key);})

      // new_nodes.append("div")
      //     .attr("class", "node-label")
      //
      // node.select(".node-label")
      //     .text(function(d) { return d.data.key; });
      //
      //
      // new_nodes.append("div")
      //         .attr("class", "node-value")
      // node.select('.node-value')
      //     .text(function(d) { return "€" + format(d.value) ; });

          var labels = node
            .append("g")
            .attr('class', 'node-label')
            .attr('transform', function(d){
                return 'translate(' + d.x0 + ',' + d.y0 +  ')'
            });

        labels.append('text')
          .text(function(d) {
            if(d.x1 - d.x0 < 50) {
              return "";
            } else {
              return d.data.key;
            }
          })
          .style('font-size', '13px')
          .attr('dy', '20px')
          .attr('dx', '2px');

        labels.append('text')
          .text(function(d) {
            if(d.x1 - d.x0 < 50) {
              return "";
            } else {
              return "€" + format(d.value);
            }
          })
          .style('font-size', '13px')
          .attr('dy', '40px')
          .attr('dx', '3px');




  });
  }

}())
