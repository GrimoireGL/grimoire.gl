gr.debug = false
gr(function() {
  var mesh = gr('#simple .canvas')('mesh')
  document.querySelector('#simple .red')
    .addEventListener('click', function () {
      mesh.setAttribute('color', 'red')
    })
  document.querySelector('#simple .blue')
    .addEventListener('click', function () {
      mesh.setAttribute('color', 'blue')
    })
  mesh.on('mouseenter', function () {
      mesh.setAttribute('scale', '2.0')
      document.querySelector('#simple .bigger').classList.add("bold-label");
      document.querySelector('#simple .smaller').classList.remove("bold-label");
    })
  mesh.on('mouseleave', function () {
      mesh.setAttribute('scale', '1.0')
      document.querySelector('#simple .smaller').classList.add("bold-label");
      document.querySelector('#simple .bigger').classList.remove("bold-label");
    })
})
