gr.debug = false;
gr(function() {
  var mesh = gr("#main")("mesh");
  mesh.on("mouseenter", () => {
    mesh.setAttribute("scale", 2);
  });
  mesh.on("mouseleave", () => {
    mesh.setAttribute("scale", 1);
  });
  var colors = ['white', 'gray', 'orange'];
  var i = 0;
  setInterval(function() {
    mesh.setAttribute('color', colors[i % 3]);
    i++;
  }, 1000);
});