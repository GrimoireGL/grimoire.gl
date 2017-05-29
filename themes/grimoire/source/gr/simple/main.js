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
  document.querySelector('#simple .bigger')
    .addEventListener('click', function () {
      mesh.setAttribute('scale', '2.0')
    })
  document.querySelector('#simple .smaller')
    .addEventListener('click', function () {
      mesh.setAttribute('scale', '1.0')
    })
})
