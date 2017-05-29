gr.debug = false
gr.registerComponent('Rotate', {
  attributes: {
    speed: {
      default: '1,1,1',
      converter: 'Vector3'
    }
  },
  $mount: function() {
    this.phi = gr.lib.math.Vector3.Zero
    this.delta = this.getAttribute('speed').multiplyWith(Math.PI / 180)
  },
  $update: function() {
    this.phi = this.phi.addWith(this.delta)
    this.node.setAttribute('rotation', gr.lib.math.Quaternion.eulerXYZ(this.phi.X, this.phi.Y, this.phi.Z))
  }
})
