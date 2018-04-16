function drawWordCloud(wordData) {

  var fill = d3.scale.category20();
    var data = [{word:"Hello",weight:20},{word:"World",weight:10},{word:"Normally",weight:25},{word:"You",weight:15},{word:"Want",weight:30},{word:"More",weight:12},{word:"Words",weight:8},{word:"But",weight:18},{word:"Who",weight:22},{word:"Cares",weight:27}];

    width = $(document).width();
    widthL = $('#leftS').width();
    widthR = $('#rightS').width();
    height = $(document).height();
    heightT = $('#navtop').height();


/*
var worker = new Worker("worker.js");

worker.postMessage({
  nodes: nodes,
  links: links
});

worker.onmessage = function(event) {
  switch (event.data.type) {
    case "tick": return ticked(event.data);
    case "end": return ended(event.data);
  }
};
function ended(data) {
  var nodes = data.nodes,
      links = data.links;

  meter.style.display = "none";

  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);

  context.beginPath();
  links.forEach(drawLink);
  context.strokeStyle = "#aaa";
  context.stroke();

  context.beginPath();
  nodes.forEach(drawNode);
  context.fill();
  context.strokeStyle = "#fff";
  context.stroke();

  context.restore();
}*/
  d3.layout.cloud().size([width-widthL-widthR-200, height-350])
        .words(wordData)
        //.padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select("#cloud").append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 "+(width-widthL-widthR-100)+" "+(height-200))
          //.attr("width", width-widthL-widthR)
          //.attr("height", height-300)
          .classed("svg-content", true)
        .append("g")
          .attr("transform", "translate(" + [(width/3)+100, height/3] + ")")
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {

            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
    }
    sessionStorage.setItem('fetched', '0');
}
