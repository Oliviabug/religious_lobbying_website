(function () {

    var width = 800,
      height = 560;

    var margin = {
      top: 0,
      right: 0,
      left: 0,
      bottom: 0
    }

    // //append a svg and make it responsive
    // var svg = d3.select("div#treemap_2_graph")
    //    .append("div")
    //    .classed("svg-container", true) //container class to make it responsive
    //    .append("svg")
    //    //responsive SVG needs these 2 attributes and no width and height attr
    //    .attr("preserveAspectRatio", "xMinYMin meet")
    //    .attr("viewBox", "0 0 950 650")
    //    //class to make it responsive
    //    .classed("svg-content-responsive", true);

    var svg = d3.select('div#treemap_2_graph').append("svg")
        .attr("width", width)
        .attr("height", height);
      // .append("g")
      //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    width = width - margin.right - margin.left;
    height = height - margin.bottom - margin.top;

    // Define the div for the tooltip
    var div = d3.select("#treemap_2_graph").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // var colour_scale = d3.scaleOrdinal().range(colorbrewer.GnBu[9]);
    var colour_scale = d3.scaleOrdinal().range(colorbrewer.Set3["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",[6]]);



    var treemap = d3.treemap()
      .size([width, height])
      .padding(0)
      .round(true);

    width = width - margin.left - margin.right;
    height = height - margin.bottom - margin.top;

    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };


    d3.csv("treemap_2/religious_expenditures2.csv", function(error, data) {
      if (error) throw error;

      data.forEach(function(d) {
        d.Higher_cost = +d.Higher_cost;
        d['lobbyists (FTE)'] = +d['lobbyists (FTE)'];

      });

      colour_scale.domain(data.map(function(d){ return d['organisation name']}));

      var format = d3.formatLocale({
        decimal: ".",
        thousands: ",",
        grouping: [3],
        currency: ["£", ""]
      }).format(",d");




      d3.selectAll("input")
        .on("change", changed);


      function changed() {

        console.log("changed");
        console.log(this.value);

        if (this.value === "sumByMoney") {
          sumByMoney();
        } else if (this.value === "sumByTime") {
          sumByTime();
        } else if(this.value === "sumByMeetings") {
          sumByMeetings();
        }
      }

      function sumByTime() {


        var nest = d3.nest()
          .key(function(d) {
            return d['organisation name'];
          })
          .rollup(function(leaves) {
            return d3.sum(leaves, function(d) {
              return d['lobbyists (FTE)'];
            })
          });

        draw(nest, ' FTE');

      }


      function sumByMoney() {

        var nest = d3.nest()
          .key(function(d) {
            return d['organisation name'];
          })
          .rollup(function(leaves) {
            return d3.sum(leaves, function(d) {
              return d.Higher_cost;
            })
          });

        draw(nest, ' euros');

      }

      function sumByMeetings() {

        var nest = d3.nest()
          .key(function(d) {
            return d['organisation name'];
          })
          .rollup(function(leaves) {
            return d3.sum(leaves, function(d) {
              return d['# of meetings'];
            })
          });

        draw(nest, ' meetings');

      }

      function draw(nest, label_text) {

        var root = d3.hierarchy({
            values: nest.entries(data)
          }, function(d) {
            return d.values;
          })
          .sum(function(d) {
            return d.value;
          })
          .sort(function(a, b) {
            return b.value - a.value;
          });

        treemap(root);



        var nodes = d3.select('#treemap_2_graph').select('svg')
          .selectAll(".node")
          .data(root.leaves())


        nodes
          .exit()
          .remove();

        var new_nodes = nodes
          .enter()
          .append("g")
          .attr("class", "node");

      new_nodes.append("div")
          .attr("class", "node-label");

      nodes.merge(new_nodes)
          .append('rect')
          .attr('id', function(d) {
            return d.data.key;
          })
          .style('fill', function(d){ return colour_scale(d.data.key); })
          .style("x", function(d) {
            return d.x0 + "px";
          })
          .style("y", function(d) {
            return d.y0 + "px";
          })
          .style("width", function(d) {
            return d.x1 - d.x0 + "px";
          })
          .style("height", function(d) {
            return d.y1 - d.y0 + "px";
          })
          .attr('stroke', 'white')
          .attr('stroke-width', '1px')
          .on("mouseover", function(d) {
            d3.select(this).style('fill', 'lightYellow')
            var node_label = d3.select(this).select('.node-label')
            node_label.style('font-weight', 'bold')
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div .text(d.data.key + ': ' + format(d.data.value) + label_text)
                .attr('text-align', 'center')
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            div.moveToFront();
              })
        .on("mouseout", function(d) {
          d3.select(this).style('fill', function(d){ console.log(colour_scale(d.key)); return colour_scale(d.data.key); })
          var node_label = d3.select(this).select('.node-label')
          node_label.style('font-weight', 'normal')
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

       nodes = nodes.merge(new_nodes);

        var labels = nodes
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
              return (format(d.value) + label_text);
            }
          })
          .style('font-size', '13px')
          .attr('dy', '40px')
          .attr('dx', '3px');
      }

      sumByMoney();

    });


}())

// (function(){
//
//       var width = 800,
//         height = 560;
//
//       var margin = {
//         top: 0,
//         right: 0,
//         left: 0,
//         bottom: 0
//       }
//
//   var svg = d3.select('div#treemap_2_graph').append("svg")
//           .attr("width", width)
//           .attr("height", height);
//   //       // .append("g")
//   //       //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//   //
//       width = width - margin.right - margin.left;
//       height = height - margin.bottom - margin.top;
//   //
//
//   d3.selection.prototype.moveToFront = function() {
//      return this.each(function(){
//        this.parentNode.appendChild(this);
//      });
//    };
//
// /*This creates a div for the tooltip*/
//     var div = d3.select("#treemap_2_graph").append("div")
//          .attr("class", "tooltip")
//          .style("opacity", 0);
//
//
// /* This code is to make the html buttons work when clicked and retrieve a specific dataset*/
//
//    var button_4 = document.getElementById('button-money')
//      button_4.addEventListener ("click", function() {
//      drawTreeMap("religious_costs.csv", "euros");
//    });
//
//   var button_5 = document.getElementById("button-time");
//     button_5.addEventListener ("click", function() {
//     drawTreeMap("religious_time.csv", "time");
//   });
//
//   var button_6 = document.getElementById("button-meetings");
//      button_6.addEventListener ("click", function() {
//      drawTreeMap("religious_meetings.csv", "meetings");
//    });
//
//
//  drawTreeMap("religious_costs.csv", "euros");
//
//  function drawTreeMap(datafile, label_text) {
//    d3.csv('treemap_2/data/' + datafile, function(data) { /*This retrieves the dataset*/
//      console.log(data);
//
//    data.forEach(function(d) { /*The forEach is for the function to go through every single item*/
//      d["Costs (Higher)"] = +d["Costs (Higher)"]; /*This is for when the column names that have a space*/
//    });
//
//    var nest = d3.nest()
//    .key(function(d) { return d.Section; }).rollup(function(leaves){
//      return d3.sum(leaves, function(d){
//        return d["Costs (Higher)"]
//      })
//    })
//    .entries(data);
//
//
//        var color = d3.scaleOrdinal() .range(colorbrewer.Set3["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",[6]]);
//                //define color scale
//        color.domain(nest.map(function(d){ return d.key; }));
//
//        var format = d3.formatLocale({
//          decimal: ".",
//          thousands: ",",
//          grouping: [3],
//          currency: ["£", ""]
//        }).format(",d");
//
//        var treemap = d3.treemap()
//        .tile(d3.treemapBinary) /*This calls the treemap shape with d3*/
//        .size([width, height])
//        .padding(0)
//        .round(true);
//
//    /*This variable root is what data we want the tree to have inside*/
//        var root = d3.hierarchy({values: nest}, function(d){ return d.values; })
//                      .sum(function(d){ return d.value})
//                      .sort(function(a, b) {
//                        return b.value - a.value;
//                      });
//
//
//          treemap(root);
//
//        var node = d3.select("#treemap_2_graph").select('svg')
//          .selectAll(".node")
//          .data(root.leaves())
//
//        node.exit().remove();
//
//        var new_nodes = node.enter().append("g").append('rect')
//            .attr("class", "node");
//
//       node.merge(new_nodes)
//            .on("mouseover", function(d){   /*MOUSE OVER*/ /*This allows a change of color in the nodes when the user hovers over with the mouse*/
//              var selected_label = d3.select(this).select(".node-label");
//              d3.select(this)
//                .style('background', "lightYellow")
//                // .style('overflow', 'visible')
//                // .style('z-index', 100);/*Layers in the screen have a default z-index of 1 so if a layer is higher than 1 is gonna show infront of whatever has a lower index*/
//              d3.select(this).select(".node-label")
//                .style("overflow", "visible")
//                .style('font-weight', 'bold')
//                .style('font-size','15px')
//                .style("word-wrap", "break-word");
//             div.transition()
//                .duration(200)
//               .style("opacity", .9);
//             div.text(d.data.key + ': ' + d.data.value + " " + label_text)
//               .attr("text-align", "center")
//               .style("left", (d3.event.pageX) + "px")
//               .style("top", (d3.event.pageY - 28) + "px");
//           div.moveToFront();
//
//              d3.select(this).select(".node-value")
//                   //  .style("font-size", "15px")
//                   //  .style("font-weight", "bold")
//                    .text(function(d) { return format(d.value) + " " + label_text ; });
//
//            })
//            /*MOUSE OUT*/
//            /*This return the original color of the nodes when the user mouse out*/
//            .on('mouseout', function(d){
//              d3.select(this)/*This is the data we are showing so the squares that have values of money*/
//                .style("fill", function(d){ return color(d.data.key);})
//                .style('overflow', 'hidden')
//                // .style('z-index', 1)
//              d3.select(this).select(".node-label")
//                      .style("font-weight", "normal")
//                      .style("font-size", "14px")
//                  div.style("opacity", 0);
//
//              d3.select(this).select(".node-value")
//                      .style("font-weight", "normal")
//                      .style("font-size", "14px");
//
//
//            });
//
//      new_nodes.append("div")
//          .attr("class", "node-label")
//
//
//     new_nodes.append("div")
//           .attr("class", "node-value")
//
//
//        node = node.merge(new_nodes)
//          .attr('stroke', 'white')
//          .attr('stroke-width', '1px')
//          .style("x", function(d) { return d.x0 + "px"; })
//          .style("y", function(d) { return d.y0 + "px"; })
//          .style("width", function(d) { return d.x1 - d.x0 + "px"; })
//          .style("height", function(d) { return d.y1 - d.y0 + "px"; })
//          .style("fill", function(d){ console.log(color(d.data.key)); return color(d.data.key);})
//
//
//        node.select(".node-label")
//            .text(function(d) { return d.data.key; });
//
//
//        node.select('.node-value')
//            .text(function(d) { return  format(d.value) + " " + label_text ; });
//
//
// });
//
// };
//
// }());


// (function () {
//
//     var width = 800,
//       height = 560;
//
//     var margin = {
//       top: 0,
//       right: 0,
//       left: 0,
//       bottom: 0
//     }
//
//     // //append a svg and make it responsive
//     // var svg = d3.select("div#treemap_2_graph")
//     //    .append("div")
//     //    .classed("svg-container", true) //container class to make it responsive
//     //    .append("svg")
//     //    //responsive SVG needs these 2 attributes and no width and height attr
//     //    .attr("preserveAspectRatio", "xMinYMin meet")
//     //    .attr("viewBox", "0 0 950 650")
//     //    //class to make it responsive
//     //    .classed("svg-content-responsive", true);
//
//     var svg = d3.select('div#treemap_2_graph').append("svg")
//         .attr("width", width)
//         .attr("height", height);
//       // .append("g")
//       //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//     width = width - margin.right - margin.left;
//     height = height - margin.bottom - margin.top;
//
//     // Define the div for the tooltip
//     var div = d3.select("#treemap_2_graph").append("div")
//         .attr("class", "tooltip")
//         .style("opacity", 0);
//
//
//     // var colour_scale = d3.scaleOrdinal().range(colorbrewer.GnBu[9]);
//     var colour_scale = d3.scaleOrdinal().range(colorbrewer.Set3["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",[6]]);
//
//
//
//     var treemap = d3.treemap()
//       .size([width, height])
//       .padding(0)
//       .round(true);
//
//     width = width - margin.left - margin.right;
//     height = height - margin.bottom - margin.top;
//
//     d3.selection.prototype.moveToFront = function() {
//       return this.each(function(){
//         this.parentNode.appendChild(this);
//       });
//     };
//
//        var button_4 = document.getElementById('button-money')
//          button_4.addEventListener ("click", function() {
//          drawTreeMap1("religious_costs.csv", "euros");
//        });
//
//       var button_5 = document.getElementById("button-time");
//         button_5.addEventListener ("click", function() {
//         drawTreeMap2("religious_time.csv", "time");
//       });
//
//       var button_6 = document.getElementById("button-meetings");
//          button_6.addEventListener ("click", function() {
//          drawTreeMap3("religious_meetings.csv", "meetings");
//        });
//
//
//      drawTreeMap1("religious_costs.csv", "euros");
//
//      function drawTreeMap1(datafile) {
//         d3.csv('treemap_2/data/' + datafile, function(data) { /*This retrieves the dataset*/
//           console.log(data);
//
//         data.forEach(function(d) { /*The forEach is for the function to go through every single item*/
//           d["Costs (Higher)"] = +d["Costs (Higher)"]; /*This is for when the column names that have a space*/
//         });
//
//         var nest = d3.nest()
//         .key(function(d) { return d.Section; }).rollup(function(leaves){
//           return d3.sum(leaves, function(d){
//             return d["Costs (Higher)"]
//           })
//         })
//         .entries(data);
//
//
//             var color = d3.scaleOrdinal() .range(colorbrewer.Set3["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",[6]]);
//                     //define color scale
//             color.domain(nest.map(function(d){ return d.key; }));
//
//             var format = d3.formatLocale({
//               decimal: ".",
//               thousands: ",",
//               grouping: [3],
//               currency: ["£", ""]
//             }).format(",d");
//
//             var treemap = d3.treemap()
//             .tile(d3.treemapBinary) /*This calls the treemap shape with d3*/
//             .size([width, height])
//             .padding(0)
//             .round(true);
//
//         /*This variable root is what data we want the tree to have inside*/
//             var root = d3.hierarchy({values: nest}, function(d){ return d.values; })
//                           .sum(function(d){ return d.value})
//                           .sort(function(a, b) {
//                             return b.value - a.value;
//                           });
//
//
//               treemap(root);
//
//             var nodes = d3.select("#treemap_2_graph").select('svg')
//               .selectAll(".node")
//               .data(root.leaves())
//
//             nodes.exit().remove();
//
//             var new_nodes = nodes.enter().append("g")
//                 .attr("class", "node");
//
//            nodes.merge(new_nodes)
//                .append('rect')
//                .attr('stroke', 'white')
//                .attr('stroke-width', '1px')
//                .style("x", function(d) { return d.x0 + "px"; })
//                .style("y", function(d) { return d.y0 + "px"; })
//                .style("width", function(d) { return d.x1 - d.x0 + "px"; })
//                .style("height", function(d) { return d.y1 - d.y0 + "px"; })
//                .style("fill", function(d){ console.log(color(d.data.key)); return color(d.data.key);})
//                 .on("mouseover", function(d){   /*MOUSE OVER*/ /*This allows a change of color in the nodes when the user hovers over with the mouse*/
//                   var selected_label = d3.select(this).select(".node-label");
//                   d3.select(this)
//                     .style('background', "lightYellow")
//                     // .style('overflow', 'visible')
//                     // .style('z-index', 100);/*Layers in the screen have a default z-index of 1 so if a layer is higher than 1 is gonna show infront of whatever has a lower index*/
//                   d3.select(this).select(".node-label")
//                     .style("overflow", "visible")
//                     .style('font-weight', 'bold')
//                     .style('font-size','15px')
//                     .style("word-wrap", "break-word");
//                  div.transition()
//                     .duration(200)
//                    .style("opacity", .9);
//                  div.text(d.data.key + ': ' + d.data.value + " euros")
//                    .attr("text-align", "center")
//                    .style("left", (d3.event.pageX) + "px")
//                    .style("top", (d3.event.pageY - 28) + "px");
//                div.moveToFront();
//
//                   // d3.select(this).select(".node-value")
//                   //      //  .style("font-size", "15px")
//                   //      //  .style("font-weight", "bold")
//                   //       .text(function(d) { return format(d.value) + " " + label_text ; });
//
//                 })
//                 /*MOUSE OUT*/
//                 /*This return the original color of the nodes when the user mouse out*/
//                 .on('mouseout', function(d){
//                   d3.select(this)/*This is the data we are showing so the squares that have values of money*/
//                     .style("fill", function(d){ return color(d.data.key);})
//                     .style('overflow', 'hidden')
//                     // .style('z-index', 1)
//                   d3.select(this).select(".node-label")
//                           .style("font-weight", "normal")
//                           .style("font-size", "14px")
//                       div.style("opacity", 0);
//
//                   // d3.select(this).select(".node-value")
//                   //         .style("font-weight", "normal")
//                   //         .style("font-size", "14px");
//
//
//                 });
//
//
//             var labels = new_nodes
//               .append("g")
//               .attr('class', 'node-label')
//               .attr('transform', function(d){
//                   return 'translate(' + d.x0 + ',' + d.y0 +  ')'
//               });
//
//              labels.append('text')
//                 .text(function(d) {
//                   if(d.x1 - d.x0 < 50) {
//                     return "";
//                   } else {
//                     return d.data.key;
//                   }
//                 })
//                 .style('font-size', '13px')
//                 .attr('dy', '20px')
//                 .attr('dx', '2px');
//
//               labels.append('text')
//                 .text(function(d) {
//                   if(d.x1 - d.x0 < 50) {
//                     return "";
//                   } else {
//                     return (format(d.value) + ' euros');
//                   }
//                 })
//                 .style('font-size', '13px')
//                 .attr('dy', '40px')
//                 .attr('dx', '3px');
//
//
//     });
//
//   };
//
//   function drawTreeMap2(datafile) {
//      d3.csv('treemap_2/data/' + datafile, function(data) { /*This retrieves the dataset*/
//        console.log(data);
//
//      data.forEach(function(d) { /*The forEach is for the function to go through every single item*/
//        d["Costs (Higher)"] = +d["Costs (Higher)"]; /*This is for when the column names that have a space*/
//      });
//
//      var nest = d3.nest()
//      .key(function(d) { return d.Section; }).rollup(function(leaves){
//        return d3.sum(leaves, function(d){
//          return d["Costs (Higher)"]
//        })
//      })
//      .entries(data);
//
//
//          var color = d3.scaleOrdinal() .range(colorbrewer.Set3["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",[6]]);
//                  //define color scale
//          color.domain(nest.map(function(d){ return d.key; }));
//
//          var format = d3.formatLocale({
//            decimal: ".",
//            thousands: ",",
//            grouping: [3],
//            currency: ["£", ""]
//          }).format(",d");
//
//          var treemap = d3.treemap()
//          .tile(d3.treemapBinary) /*This calls the treemap shape with d3*/
//          .size([width, height])
//          .padding(0)
//          .round(true);
//
//      /*This variable root is what data we want the tree to have inside*/
//          var root = d3.hierarchy({values: nest}, function(d){ return d.values; })
//                        .sum(function(d){ return d.value})
//                        .sort(function(a, b) {
//                          return b.value - a.value;
//                        });
//
//
//            treemap(root);
//
//          var nodes2 = d3.select("#treemap_2_graph").select('svg')
//            .selectAll(".node")
//            .data(root.leaves())
//
//          nodes2.exit().remove();
//
//          var new_nodes2 = nodes2.enter().append("g")
//              .attr("class", "node");
//
//         nodes2.merge(new_nodes2)
//             .append('rect')
//             .attr('stroke', 'white')
//             .attr('stroke-width', '1px')
//             .style("x", function(d) { return d.x0 + "px"; })
//             .style("y", function(d) { return d.y0 + "px"; })
//             .style("width", function(d) { return d.x1 - d.x0 + "px"; })
//             .style("height", function(d) { return d.y1 - d.y0 + "px"; })
//             .style("fill", function(d){ console.log(color(d.data.key)); return color(d.data.key);})
//              .on("mouseover", function(d){   /*MOUSE OVER*/ /*This allows a change of color in the nodes when the user hovers over with the mouse*/
//                var selected_label = d3.select(this).select(".node-label");
//                d3.select(this)
//                  .style('background', "lightYellow")
//                  // .style('overflow', 'visible')
//                  // .style('z-index', 100);/*Layers in the screen have a default z-index of 1 so if a layer is higher than 1 is gonna show infront of whatever has a lower index*/
//                d3.select(this).select(".node-label")
//                  .style("overflow", "visible")
//                  .style('font-weight', 'bold')
//                  .style('font-size','15px')
//                  .style("word-wrap", "break-word");
//               div.transition()
//                  .duration(200)
//                 .style("opacity", .9);
//               div.text(d.data.key + ': ' + d.data.value + " FTE")
//                 .attr("text-align", "center")
//                 .style("left", (d3.event.pageX) + "px")
//                 .style("top", (d3.event.pageY - 28) + "px");
//             div.moveToFront();
//
//                // d3.select(this).select(".node-value")
//                //      //  .style("font-size", "15px")
//                //      //  .style("font-weight", "bold")
//                //       .text(function(d) { return format(d.value) + " " + label_text ; });
//
//              })
//              /*MOUSE OUT*/
//              /*This return the original color of the nodes when the user mouse out*/
//              .on('mouseout', function(d){
//                d3.select(this)/*This is the data we are showing so the squares that have values of money*/
//                  .style("fill", function(d){ return color(d.data.key);})
//                  .style('overflow', 'hidden')
//                  // .style('z-index', 1)
//                d3.select(this).select(".node-label")
//                        .style("font-weight", "normal")
//                        .style("font-size", "14px")
//                    div.style("opacity", 0);
//
//                // d3.select(this).select(".node-value")
//                //         .style("font-weight", "normal")
//                //         .style("font-size", "14px");
//
//
//              });
//
//
//          var labels2 = new_nodes2
//            .append("g")
//            .attr('class', 'node-label')
//            .attr('transform', function(d){
//                return 'translate(' + d.x0 + ',' + d.y0 +  ')'
//            });
//
//           labels2.append('text')
//              .text(function(d) {
//                if(d.x1 - d.x0 < 50) {
//                  return "";
//                } else {
//                  return d.data.key;
//                }
//              })
//              .style('font-size', '13px')
//              .attr('dy', '20px')
//              .attr('dx', '2px');
//
//            labels2.append('text')
//              .text(function(d) {
//                if(d.x1 - d.x0 < 50) {
//                  return "";
//                } else {
//                  return (format(d.value) + ' FTE');
//                }
//              })
//              .style('font-size', '13px')
//              .attr('dy', '40px')
//              .attr('dx', '3px');
//
//
//  });
//
// };
//
// function drawTreeMap3(datafile) {
//    d3.csv('treemap_2/data/' + datafile, function(data) { /*This retrieves the dataset*/
//      console.log(data);
//
//    data.forEach(function(d) { /*The forEach is for the function to go through every single item*/
//      d["Costs (Higher)"] = +d["Costs (Higher)"]; /*This is for when the column names that have a space*/
//    });
//
//    var nest = d3.nest()
//    .key(function(d) { return d.Section; }).rollup(function(leaves){
//      return d3.sum(leaves, function(d){
//        return d["Costs (Higher)"]
//      })
//    })
//    .entries(data);
//
//
//        var color = d3.scaleOrdinal() .range(colorbrewer.Set3["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462",[6]]);
//                //define color scale
//        color.domain(nest.map(function(d){ return d.key; }));
//
//        var format = d3.formatLocale({
//          decimal: ".",
//          thousands: ",",
//          grouping: [3],
//          currency: ["£", ""]
//        }).format(",d");
//
//        var treemap = d3.treemap()
//        .tile(d3.treemapBinary) /*This calls the treemap shape with d3*/
//        .size([width, height])
//        .padding(0)
//        .round(true);
//
//    /*This variable root is what data we want the tree to have inside*/
//        var root = d3.hierarchy({values: nest}, function(d){ return d.values; })
//                      .sum(function(d){ return d.value})
//                      .sort(function(a, b) {
//                        return b.value - a.value;
//                      });
//
//
//          treemap(root);
//
//        var nodes = d3.select("#treemap_2_graph").select('svg')
//          .selectAll(".node")
//          .data(root.leaves())
//
//        nodes.exit().remove();
//
//        var new_nodes = nodes.enter().append("g")
//            .attr("class", "node");
//
//       nodes.merge(new_nodes)
//           .append('rect')
//           .attr('stroke', 'white')
//           .attr('stroke-width', '1px')
//           .style("x", function(d) { return d.x0 + "px"; })
//           .style("y", function(d) { return d.y0 + "px"; })
//           .style("width", function(d) { return d.x1 - d.x0 + "px"; })
//           .style("height", function(d) { return d.y1 - d.y0 + "px"; })
//           .style("fill", function(d){ console.log(color(d.data.key)); return color(d.data.key);})
//            .on("mouseover", function(d){   /*MOUSE OVER*/ /*This allows a change of color in the nodes when the user hovers over with the mouse*/
//              var selected_label = d3.select(this).select(".node-label");
//              d3.select(this)
//                .style('background', "lightYellow")
//                // .style('overflow', 'visible')
//                // .style('z-index', 100);/*Layers in the screen have a default z-index of 1 so if a layer is higher than 1 is gonna show infront of whatever has a lower index*/
//              d3.select(this).select(".node-label")
//                .style("overflow", "visible")
//                .style('font-weight', 'bold')
//                .style('font-size','15px')
//                .style("word-wrap", "break-word");
//             div.transition()
//                .duration(200)
//               .style("opacity", .9);
//             div.text(d.data.key + ': ' + d.data.value + " meetings")
//               .attr("text-align", "center")
//               .style("left", (d3.event.pageX) + "px")
//               .style("top", (d3.event.pageY - 28) + "px");
//           div.moveToFront();
//
//              // d3.select(this).select(".node-value")
//              //      //  .style("font-size", "15px")
//              //      //  .style("font-weight", "bold")
//              //       .text(function(d) { return format(d.value) + " " + label_text ; });
//
//            })
//            /*MOUSE OUT*/
//            /*This return the original color of the nodes when the user mouse out*/
//            .on('mouseout', function(d){
//              d3.select(this)/*This is the data we are showing so the squares that have values of money*/
//                .style("fill", function(d){ return color(d.data.key);})
//                .style('overflow', 'hidden')
//                // .style('z-index', 1)
//              d3.select(this).select(".node-label")
//                      .style("font-weight", "normal")
//                      .style("font-size", "14px")
//                  div.style("opacity", 0);
//
//              // d3.select(this).select(".node-value")
//              //         .style("font-weight", "normal")
//              //         .style("font-size", "14px");
//
//
//            });
//
//
//        var labels = new_nodes
//          .append("g")
//          .attr('class', 'node-label')
//          .attr('transform', function(d){
//              return 'translate(' + d.x0 + ',' + d.y0 +  ')'
//          });
//
//         labels.append('text')
//            .text(function(d) {
//              if(d.x1 - d.x0 < 50) {
//                return "";
//              } else {
//                return d.data.key;
//              }
//            })
//            .style('font-size', '13px')
//            .attr('dy', '20px')
//            .attr('dx', '2px');
//
//          labels.append('text')
//            .text(function(d) {
//              if(d.x1 - d.x0 < 50) {
//                return "";
//              } else {
//                return (format(d.value) + ' meetings');
//              }
//            })
//            .style('font-size', '13px')
//            .attr('dy', '40px')
//            .attr('dx', '3px');
//
//
// });
//
// };
//
//
//
// }())
