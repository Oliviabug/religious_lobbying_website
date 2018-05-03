(function () {

// dimensions
var width = 600;
var height = 400;

var margin = {
    top: 50,
    bottom: 50,
    left: 0,
    right: 50,
}

// create an svg to draw in
var svg = d3.select("#force_graph")
.append("svg")
    .attr("width", width)
    .attr("height", height)
.append('g')
    .attr('transform', 'translate(' + margin.top + ',' + margin.left + ')');

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;


var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d){
        return d.ID;
    })
    .strength(1))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collide", d3.forceCollide().radius(2))
    .force("charge", d3.forceManyBody().strength(-3500));

d3.json("simple_force_graph/data.json", function(error, graph) {

    console.log(error);
    console.log(graph);

    var nodes = graph.nodes;
    var links = graph.edges;

    console.log(nodes);
    console.log(links);

    var link = svg.selectAll('.link')
        .data(links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('id', function(d){
          if(d.hasOwnProperty("Connection")) {
            return d["Connection"];
          }
          else if (d.hasOwnProperty("Role")) {
            return d["Role"];
          }
          else {
            return "blank"
          }
        })
        .attr('stroke', "#ddd")
        .attr('stroke-width', function(d){
            return 4;
        });
///Adding Visible linkText

var linkText = svg.selectAll('.linkText')
                  .data(links)
                  .enter()
                  .append('text')
                  .append('textPath')
                  .attr("xlink:href", function(d){
                    if(d.hasOwnProperty("Connection")) {
                      return '#' + d["Connection"];
                    }
                    else if (d.hasOwnProperty("Role")) {
                      return '#' + d["Role"];
                    }
                    else {
                      return "#blank"
                    }
                  })
                  .style('text-anchor', 'middle')
                  .attr('startOffset', '50%')
                  .attr('id', '#linkingText')
                  .text(function(d){
                    if(d.hasOwnProperty("Connection")) {
                      return d["Connection"];
                    }
                    else if (d.hasOwnProperty("Role")) {
                      return d["Role"];
                    }
                    else {
                      return "blank"
                    }}
                  );



///



    var node = svg.selectAll('.nodes')
        .data(nodes)
        .enter()
        .append('g')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut);

    node
        .append("circle")
        .attr('class', 'nodes')
        //Size based on ID
        .attr("r", function(d) {if(d.hasOwnProperty("ID")) {
          if(d["ID"] < 1000) {
          return 8;
        }
          else {
            return 6;
          }
        };
      })
        .attr("fill", function(d){
          //Colour Based on ID
          if(d.hasOwnProperty("ID")) {
            if(d["ID"] < 1000) {
            return "red";
          }
            else {
              return "blue";
            }
          };
        })
        .attr("stroke", "#ddd");

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) {
            if(d.hasOwnProperty("Religious Organizations")) {
              return d["Religious Organizations"]
            } else {
              return d["Employee"];
            };
        })
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("fill", function(d) {
            return "black";
        });

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation
        .force("link")
        .links(links);

    var linkedByIndex = {}
    links.forEach(function(d){
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    function isConnected(a, b){
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index === b.index;
    }

    function mouseOver(d) {
        var opacity = 0.1;
        node.style("stroke-opacity", function(o){
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            return thisOpacity;
        });
        node.style("fill-opacity", function(o){
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            return thisOpacity;
        });
        link.style('stroke-opacity', function(o) {
            return o.source === d || o.target === d ? 1 : opacity;
        });
        link.style('stroke', function(o){
            return o.source === d || o.target === d ? o.source.colour : "#ddd";
        })

        var connection = links[' Connection'];
        console.log(connection);

       linkText.style('opacity', function(o){
           thisOpacity = isConnected(d, o) ? 1 : opacity;
           return thisOpacity;
         })
     }

   function mouseOut(){
       node.style('stroke-opacity', 1)
       node.style('fill-opacity', 1)
       link.style('stroke-opacity', 1)
       link.style('stroke', '#ddd')
       linkText.style('opacity', '0')
   }

    function ticked() {
        link.attr("d", function(d){

            //console.log(d);

            var offset = 30;

            var midpoint_x = (d.source.x + d.target.x) / 2;
            var midpoint_y = (d.source.y + d.target.y) / 2;

            var dx = (d.target.x - d.source.x);
            var dy = (d.target.y - d.source.y);

            var normalise = Math.sqrt((dx * dx) + (dy * dy));

            var offSetX = midpoint_x + offset*(dy/normalise);
            var offSetY = midpoint_y - offset*(dx/normalise);

            return "M" + d.source.x + "," + d.source.y +
                "S" + offSetX + "," + offSetY +
                " " + d.target.x + "," + d.target.y;
        });
        node.attr("transform", function(d){
            if (d.x < 0) {
                d.x = 0
            };
            if (d.y < 0) {
                d.y = 0
            };
            if (d.x > width) {
                d.x = width
            };
            if (d.y > height) {
                d.y = height
            };
            return "translate(" + d.x + "," + d.y + ")"
        })
    }
});


}());
