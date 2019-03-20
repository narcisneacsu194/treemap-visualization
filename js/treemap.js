Treemap = function(_parentElement) {
  this.parentElement = _parentElement;

  this.initVis();
};

Treemap.prototype.initVis = function() {
  let vis = this;

  vis.svg = d3.select("svg");
  vis.margin = { left: 15, right: 20, top: 125, bottom: 300 };
  vis.width = +vis.svg.attr("width");
  vis.width = vis.width - vis.margin.left - vis.margin.right;
  vis.height = +vis.svg.attr("height");
  vis.height = vis.height - vis.margin.top - vis.margin.bottom;

  vis.g = vis.svg
    .append("g")
    .attr(
      "transform",
      "translate(" + vis.margin.left + "," + vis.margin.top + ")"
    );

  // Tooltip
  vis.tip = d3
    .tip()
    .attr("class", "d3-tip")
    .html(function(d) {
      let text =
        "<span style='color:white'>" + "Name: " + d.data.name + "</span><br>";
      text +=
        "<span style='color:white'>" +
        "Category: " +
        d.data.category +
        "</span><br>";
      text +=
        "<span style='color:white'>" + "Value: " + d.data.value + "</span><br>";

      return text;
    });

  vis.g.call(vis.tip);

  // Graph title
  vis.svg
    .append("text")
    .attr("x", vis.svg.attr("width") / 2)
    .attr("y", 50)
    .attr("font-size", "30px")
    .attr("text-anchor", "middle")
    .text("Video Game Sales");

  // Graph sub-title
  vis.svg
    .append("text")
    .attr("x", vis.svg.attr("width") / 2)
    .attr("y", 80)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Top 100 Most Sold Video Games Grouped by Platform");

  vis.fader = function(color) {
    return d3.interpolateRgb(color, "#fff")(0.2);
  };
  vis.color = d3.scaleOrdinal(d3.schemeCategory20.map(vis.fader));
  vis.format = d3.format(",d");

  vis.treemap = d3
    .treemap()
    .tile(d3.treemapResquarify)
    .size([vis.width, vis.height])
    .round(true)
    .paddingInner(1);

  // Since we are dealing with hierarchical data, need to convert the data to the right format
  vis.root = d3
    .hierarchy(videoGameData)
    .eachBefore(function(d) {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum(sumByValue)
    .sort(function(a, b) {
      return b.height - a.height || b.value - a.value;
    });

  // Computes x0, x1, y0, and y1 for each node (where the rectangles should be)
  vis.treemap(vis.root);

  // Return the size of the node
  function sumByValue(d) {
    return d.value;
  }

  vis.renderVis();
};

Treemap.prototype.renderVis = function() {
  let vis = this;

  vis.cell = vis.g
    .selectAll("g")
    .data(vis.root.leaves())
    .enter()
    .append("g")
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    });

  // Add rectanges for each of the boxes that were generated
  let arr = [];
  vis.cell
    .append("rect")
    .attr("id", function(d) {
      arr.push(d.data.category);
      return d.data.id;
    })
    .attr("width", function(d) {
      return d.x1 - d.x0;
    })
    .attr("height", function(d) {
      return d.y1 - d.y0;
    })
    .attr("fill", function(d) {
      return vis.color(d.parent.data.id);
    })
    .on("mouseover", vis.tip.show)
    .on("mouseout", vis.tip.hide);

  arr = arr.filter((v, i) => arr.indexOf(v) === i);

  // Make sure that text labels don't overflow into adjacent boxes
  vis.cell
    .append("clipPath")
    .attr("id", function(d) {
      return "clip-" + d.data.id;
    })
    .append("use")
    .attr("xlink:href", function(d) {
      return "#" + d.data.id;
    });

  // Add text labels - each word goes on its own line
  vis.cell
    .append("text")
    .attr("clip-path", function(d) {
      return "url(#clip-" + d.data.id + ")";
    })
    .selectAll("tspan")
    .data(function(d) {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", function(d, i) {
      return 13 + i * 10;
    })
    .text(function(d) {
      return d;
    });

  vis.legend = vis.g
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      "translate(" + (vis.width / 2 - 100) + ", " + (vis.height + 50) + ")"
    );

  let num = -1;
  let col = 0;
  arr.forEach(function(platform) {
    let legendRow;
    num++;

    if (num != 0 && num % 6 === 0) {
      num = 0;
      col += 100;
    }

    legendRow = vis.legend
      .append("g")
      .attr("transform", "translate(" + col + "," + num * 25 + ")");

    legendRow
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", vis.color("Video Game Sales Data Top 100." + platform));
    legendRow
      .append("text")
      .attr("x", -10)
      .attr("y", 12)
      .attr("font-size", "15px")
      .attr("text-anchor", "end")
      .text(platform);
  });
};
