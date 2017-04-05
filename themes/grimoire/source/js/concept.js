document.addEventListener("DOMContentLoaded",()=>{
  var concept = document.getElementById("concept");
  var bottomElem = document.getElementById("bottom-detail");
  var img = document.getElementsByClassName("concept-logo-icon").item(0);
  var dim = document.getElementsByClassName("concept-overlay-dim").item(0);
  document.addEventListener("scroll",()=>{
    var rect = concept.getBoundingClientRect();
    var ratio = -rect.top/(rect.top - rect.bottom);
    const t = Math.min(1.0,Math.pow((0.5 - ratio)/0.5,2.0));
    bottomElem.style.opacity = t;
    img.style.opacity = t;
    gr("#concept-canvas")("render-quad").setAttribute("progress",t);
    dim.style.opacity = Math.pow(Math.max(0,(ratio - 0.5)/0.5),2.0);
    console.log(ratio);
  });
})
