function drawWordCloud(wordData) {
  
  var fill = d3.scale.category20();

  width = $(document).width();
  widthL = $('#leftS').width();
  widthR = $('#rightS').width();
  height = $(document).height();
  heightT = $('#navtop').height();

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
        .attr("viewBox", "0 0 "+(width-widthL-widthR-100)+" "+(height-190))
        //.attr("width", width-widthL-widthR)
        //.attr("height", height-300)
        .classed("svg-content", true)
        .append("g")
        .attr("transform", "translate(" + [(width/3)+40, height/3] + ")")
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
  sessionStorage.setItem('generateWC', '0');

}
