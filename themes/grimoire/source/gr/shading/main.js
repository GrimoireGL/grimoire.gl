gr(function(){
  hue = 0;
  document.querySelector("#shading").addEventListener("mousemove",()=>{
    hue=(hue + 0.003) % 1;
    gr("#shading .canvas")("mesh").setAttribute("hue",hue);
    document.querySelector(".hue").textContent = Math.floor(hue * 360) +"°";
    document.querySelector(".hue").style.color = "hsl(" + hue * 360 +",50%,50%)"
  });
});
