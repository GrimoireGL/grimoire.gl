gr.debug = false;
const Quaternion = gr.lib.math.Quaternion;
gr(function() {
  const scene = gr("#main")("scene").single();
  setInterval(function() {
    const n = scene.addChildByName("rigid-sphere", {
      position: [Math.random() * 2 - 1, 6, 0],
      targetBuffer: "wireframe"
    });
    n.on("mouseenter", function() {
      n.setAttribute("color", "blue");
    });
  }, 1000);
});
gr.register(() => {
  gr.registerComponent("OimoScene", {
    $awake: function() {
      this.world = new OIMO.World();
    },
    $update: function() {
      this.world.step();
    }
  });
  gr.overrideDeclaration("scene", ["OimoScene"]);
  gr.registerComponent("Rigid", {
    attributes: {
      shape: {
        default: "sphere",
        converter: "String"
      },
      move: {
        converter: "Boolean",
        default: true
      }
    },
    $mount: function() {
      this.__bindAttributes();
      this.transform = this.node.getComponent("Transform");
      const p = this.transform.localPosition;
      const r = this.transform.localRotation;
      const s = this.transform.localScale;
      const oimoScene = this.node.getComponentInAncestor("OimoScene");
      this.body = oimoScene.world.add({
        type: this.shape,
        size: [s.X, s.Y, s.Z],
        pos: [p.X, p.Y, p.Z],
        rot: [r.X, r.Y, r.Z],
        move: this.move,
        density: 1
      });
    },
    $update: function() {
      const p = this.body.getPosition();
      this.transform.setAttribute("position", [p.x, p.y, p.z]);
      const r = this.body.getQuaternion();
      this.transform.setAttribute("rotation", new Quaternion([r.x, r.y, r.z, r.w]));
    }
  });
  gr.registerNode("rigid-sphere", ["Rigid"], {
    color: "green",
    geometry: "sphere"
  }, "mesh");
});