HTMLWidgets.widget({

  name: "forceNetwork",

  type: "output",

  initialize: function(el, width, height) {

    d3.select(el).append("svg")
        .attr("width", width)
        .attr("height", height);

    


    return d3.layout.force();
  },

  resize: function(el, width, height, force) {

    d3.select(el).select("svg")
        .attr("width", width)
        .attr("height", height);

    force.size([width, height]).resume();
  },

  renderValue: function(el, x, force) {

d3.selection.prototype.moveToFront = function() { 
  return this.each(function() { 
    this.parentNode.appendChild(this); 
  }); 
}; 


    // alias options
    var options = x.options;
    // convert links and nodes data frames to d3 friendly format
    var links = HTMLWidgets.dataframeToD3(x.links);
    var nodes = HTMLWidgets.dataframeToD3(x.nodes);

    // get the width and height
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    var color = eval(options.colourScale);

    // create d3 force layout
    force
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(options.linkDistance)
      .charge(options.charge)
      .on("tick", tick)
      .start();

    // select the svg element and remove existing children
    var svg = d3.select(el).select("svg");
    svg.selectAll("*").remove();

    // add zooming if requested
    if (options.zoom) {
      svg
        .attr("pointer-events", "all")
        .call(d3.behavior.zoom().on("zoom", redraw));

      var vis = svg.append("svg:g");

      vis.append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", 'white');

      function redraw() {
        vis.attr("transform",
          "translate(" + d3.event.translate + ")"+
          " scale(" + d3.event.scale + ")");
    }
    } else {
      svg
        .attr("pointer-events", "auto")
        .call(d3.behavior.zoom().on("zoom", null));
    }

    // draw links
    var link = svg.selectAll(".link")
      .data(force.links())
      .enter().append("line")
      .attr("class", "link")
      .style("stroke", function(d) { return d.colour ; }) 
      .style("opacity", options.opacity)
      .style("stroke-width", eval("(" + options.linkWidth + ")"))
      .on("mouseover", function(d) {
          d3.select(this)
            .style("opacity", 1);
      })
      .on("mouseout", function(d) {
          d3.select(this)
            .style("opacity", options.opacity);
      });

    // draw nodes
    var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      //.style("fill", function(d) { return color(d.group); })
      .style("fill", function(d) { return d.colour; })
      .style("opacity", options.opacity)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .call(force.drag);

    node.append("circle")
      .attr("r", 6)
      .style("stroke", "#fff")
      .style("opacity", options.opacity)
      .style("stroke-width", "1.5px");

    //node.append("svg:text")
    //  .attr("class", "nodetext")
    //  .attr("dx", 12)
    //  .attr("dy", ".35em")
    //  .text(function(d) { return d.name })
    //  .style("font", options.fontsize + "px serif")
    //  .style("opacity", 0)
    //  .style("pointer-events", "none");
      
      
      node.append("svg:a").attr("xlink:href", function(d){ return "" + d.url })
        .attr("xlink:show","new")
        //.attr("xlink:target","_blank")
        .append("image")
        .attr("xlink:href", function(d){ return d.pic;
        })
        .on("error", function(d) {
        //console.log('The image ' + d.pic + ' failed to load');
        d3.select(this).style("visibility", "hidden");
        })
        //.attr("xlink:target","_blank")
        .attr("id","img")
        .attr("x", -12.5)
        .attr("y", -12.5)
        .attr("width", 25)
        .attr("height", 25)
        .style("pointer-events", "all");
      
    node//.append("svg:a")
      .append("text")
      .attr("class", "nodetext")
      .text(function(d) { return d.name; })
      .attr("dy", ".35em")
      .attr("dx", 6)
      .style("font", options.fontsize + "px serif")
      .style("opacity", 0)
      .style("pointer-events", "none");

    function tick() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
    }


    function mouseover() {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16);
      d3.select(this).select("image").moveToFront().transition()
        .duration(750)
      .attr("width", 90)
      .attr("x", -4)
      .attr("y", -6)
      .attr("height", 90);
      d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 13)
        .attr("y", -13)
        .style("stroke-width", ".5px")
        .style("font", options.clickTextSize + "px serif")
        .style("opacity", 1);
      d3.select(this).moveToFront();
    }

    function mouseout() {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 8);
      d3.select(this).select("image").transition()
        .duration(750)
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -12.5)
      .attr("y", -12.5);
      d3.select(this).select("image").moveToFront();
      d3.select(this).select("text").transition()
        .style("opacity", 0);
    }
  },
});
