gr(function(){
  hue = 0;
  document.querySelector("#shading").addEventListener("mousemove",()=>{
    hue+=0.003;
    gr("#shading .canvas")("mesh").setAttribute("hue",hue%1);
  });
});
