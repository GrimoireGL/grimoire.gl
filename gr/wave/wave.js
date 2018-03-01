gr.registerComponent("Wave",{
  attributes:{
    amp:{
      default:1.0,
      converter:"Number"
    },
    speed:{
      default:1.0,
      converter:"Number"
    }
  },
  $mount(){
    this.transfrom = this.node.getComponent("Transform");
    this.__bindAttributes();
  },$update(t){
    var p = this.transfrom.getAttribute("position");
    this.transfrom.setAttribute("position",[p.X,Math.sin(this.speed * t.timer.timeInSecound) * this.amp,p.Z])
  }
});

gr.registerNode("wave-mesh",["Wave"],{},"mesh");
