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


    d3.csv("treemap_2/religious_expenditures.csv", function(error, data) {
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

        draw(nest,' euros');

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

      function draw(nest, label_text, label_euros) {

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
          .attr("class", "nodes");


      nodes = nodes.merge(new_nodes)

        nodes
        // .attr("class", "node")
          .append('rect')
          .attr('stroke', 'white')
          .attr('stroke-width', '1px')
          // .append('rect')
          // .attr('id', function(d) {
          //   return d.data.key;
          // })
          .style('fill', function(d){ return colour_scale(d.data.key); })
          .attr("x", function(d) {
            return d.x0 + "px";
          })
          .attr("y", function(d) {
            return d.y0 + "px";
          })
          .attr("width", function(d) {
            return d.x1 - d.x0 + "px";
          })
          .attr("height", function(d) {
            return d.y1 - d.y0 + "px";
          })
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

      nodes = nodes.merge(new_nodes);


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
