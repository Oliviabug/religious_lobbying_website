    var width = 900;
    var height = 500;

    var margin =  {
      top: 30,
      right: 30,
      left: 30,
      bottom: 30
    };


    var svg = d3.select('#barchart_graph').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    width = width - margin.right - margin.left;
    height = height - margin.bottom - margin.top;

    var x0 = d3.scaleBand()
                .rangeRound([0, width])
                .paddingInner(0.1);

    var x1 = d3.scaleBand().padding(0.05);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = d3.axisBottom(x0)
        // .scale(x0)
        .tickSize(0);
        // .orient("bottom");

    var yAxis = d3.axisLeft(y);
        // .scale(y)
        // .orient("left");

    svg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0' + ',' + (height) + ')');

    svg.append('g').attr('class', 'y axis');

    var color = d3.scaleOrdinal()
        .range(["#ca0020","#f4a582"]);

     var tip = d3.tip()
                 .attr('class', 'd3-tip')
                 .offset([-10, 0])

      svg.call(tip);






    d3.csv('barchart/religious_dominance.csv', function(d, i, columns) {

          for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
          return d;
          }, function(error, data) {
           if (error) throw error;

              var keys = data.columns.slice(2, -1);
              console.log(keys);

              x0.domain(data.map(function(d) { return d.religion; }));
              x1.domain(keys).rangeRound([0, x0.bandwidth()]);
              y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

              tip.html(function(d) { return d.value + '%' });

              svg.append("g")
                  .selectAll("g")
                  .data(data)
                  .enter().append("g")
                    .attr("transform", function(d) { return "translate(" + x0(d.religion) + ",0)"; })
                  .selectAll("rect")
                  .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
                  .enter().append("rect")
                  .on('mouseover', tip.show)

                  .on('mouseout', tip.hide)
                  .transition()
                  .delay(function (d) { return Math.random()*800})
                  .duration(1000)
                    .attr("x", function(d) { return x1(d.key); })
                    .attr("y", function(d) { return y(d.value); })
                    .attr("width", x1.bandwidth())
                    .attr("height", function(d) { return height - y(d.value); })
                    .attr("fill", function(d) { return color(d.key); });




                    svg.append("g")
                       .attr("class", "axis")
                       .attr("transform", "translate(0," + height + ")")
                       .call(d3.axisBottom(x0));

                   svg.append("g")
                       .attr("class", "axis")
                       .call(d3.axisLeft(y).ticks(null, "s"))
                     .append("text")
                       .attr("x", 2)
                       .attr("y", y(y.ticks().pop()) + 0.5)
                       .attr("dy", "0.32em")
                       .attr("fill", "#000")
                       .attr("font-weight", "bold")
                       .attr("text-anchor", "start")
                       .text("% by religion");

                       var legend = svg.append("g")
                            .attr("font-family", "sans-serif")
                            .attr("font-size", 10)
                            .attr("text-anchor", "end")
                          .selectAll("g")
                          .data(keys.slice().reverse())
                          .enter().append("g")
                            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 19)
                            .attr("width", 19)
                            .attr("height", 19)
                            .attr("fill", color);

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9.5)
                            .attr("dy", "0.32em")
                            .text(function(d) { return d; });



    });
