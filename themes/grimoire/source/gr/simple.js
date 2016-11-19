var colors = ['white', 'red', 'lime'];
gr(function() {
  var i = 0;
  setInterval(function() {
    gr('#simple')('mesh').setAttribute('color', colors[i % 3]);
    i++;
  }, 1000);
});
