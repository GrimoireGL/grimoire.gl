---
type: doc
title: ComponentSystem
order: 40
---
# What is component?

This is simple GOML to show just a red cube.

```xml
<goml>
  <scene>
    <camera position="0,0,-10"/>
    <mesh geometry="cube" color="red" position="0,0,0"/>
  </scene>
</goml>
```

You can make camera accepting user interactions. By adding `MouseCameraControl` like following way, user can controls camera by mouse.

```xml
<goml>
  <scene>
    <camera position="0,0,-10">
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <mesh geometry="cube" color="red" position="0,0,0"/>
  </scene>
</goml>
```

This syntax is described in [GOML](/guide/1_essentials/03_goml.html) in detail. By this code, camera has a feature to be controlled by mouse. This is **component**.

In Grimoire, users can add features to nodes as component.

> What is differences between node?
>
> `component` and `node` can be written as `tag` in GOML. But these are completely different things.
> `node` is structure like HTML elements or Gameobject in Unity.
> `component` is features appended to nodes or MonoBehaviour in Unity.
> All `nodes` contains `component`.
>
> In grimoire, all tags are `component` or `node` while there is an exception.
> The exception is `.component` tag such as `<camera.components>`.

You can make feature of Grimoire by adding components by using following API.
To create component, you can use `registerComponent` method of GrimoireInterface.

```javascript
gr.registerComponent("MouseColor",{
  attribute:{
    onColor:{
      converter:"color",
      default:"red"
    },
    offColor:{
      converter:"color",
      default:"green"
    }
  },

  $awake:function(){
    this.node.on("mouseenter",function(){
      this.node.setAttribute("color",this.getAttribute("onColor"));
    });
    this.node.on("mouseleave",function(){
      this.node.setAttribute("color",this.getAttribute("offColor"));
    });
  }
})
```

This is example component to change color of mesh by hovering mouse. After executing this javascript, you can use `<MouseColorComponent/>` tag on GOML.
Now you can append this component to meshes like below.

```xml
<goml>
  <scene>
    <camera position="0,0,-10">
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <mesh geometry="cube" color="red" position="0,0,0">
      <mesh.components>
        <MouseColorComponent/>
      </mesh.components>
    </mesh>
  </scene>
</goml>
```

The cubes now have feature to change color if the mouses are hovering the meshes.
All features can be modular and reusable as components in same way.

# What was node?

We have used nodes in guides. But what was node?
As the previous section, node is just a container of components and have structures.

User can add nodes like component with using `registerNode` method of GrimoireInterface.
`registerNode` method accepts node name, list of components, default values of attribute and node name to inherit as arguments.

```javascript
gr.registerNode("color-cube", ["MouseColorComponent"], {
  geometry: "cube",
  onColor:"red",
  offColor:"green"
}, "mesh");
```

This code is adding `color-cube` that extends `mesh` tag and adding `MouseColorComponent`.
Nodes can inherit containing components and default attributes from ancestor nodes inherited.
If there was no default value was presented on node on `registerNode`, default value written in components are used.

By using this node, the previous example can be rewritten like below.

```xml
<goml>
  <scene>
    <camera position="0,0,-10">
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <color-mesh position="0,0,0"/>
  </scene>
</goml>
```

All nodes and plugins are defined in same way. Actually, `grimoirejs-fundamental` is registering nodes in following way.

```javascript
GrimoireInterface.registerNode("goml", [
  "CanvasInitializer", "LoopManager", "AssetLoadingManager",
  "GeometryRegistory", "RendererManager", "Fullscreen"]);
    GrimoireInterface.registerNode("scene", ["Scene"]);
    GrimoireInterface.registerNode("object", ["Transform"]);
    GrimoireInterface.registerNode("camera", ["Camera"], { position: "0,0,10" }, "object");
    GrimoireInterface.registerNode("mesh", ["MaterialContainer", "MeshRenderer"], {}, "object");
    GrimoireInterface.registerNode("renderer", ["Renderer"]);
```

All nodes are created with `registerNode`. There are no exception.

## grimoire-node-base

There is special node in Grimoire. `grimoire-node-base` is inherited when there was no node name to inherit was passed to `registerNode`. This is base node of every nodes.

Every nodes have `grimoire-node-base` as ancestor.

# Attributes

We have wrote `<mesh geometry="cube" color="red" position="0,0,0"/>` in GOML.
Actual **attributes** are managed by components.

Every components can contain attributes by adding `attributes` field on component declaration.
Attributes of nodes are assigned to attributes of components having same name automatically.

Attributes is defined with `converter` and `default`.

```javascript
attributes:{
  onColor:{
    converter:"Color4",
    default:"red"
  },
  offColor:{
    converter:"Color4",
    default:"green"
  }
}
```

Let see `attributes` field of `MouseColor` component in previous example.
In this examples, there are `onColor` and `offColor` as attributes.

When attributes values are assigned, Grimoire will call converter to cast assigned values into ideal type to use in components.
For example, if `Color4` converter was used, a string "red" can be converted into Color4 class instance containing #FF0000.
`default` is default value of attributes.

# Converter

Converter is a function to convert attribute values.
Users are also able to add new Converter with `registerConverter` method of `GrimoireInterface`.

This is definition of `Number` converter defined in basic plugins.

```javascript
gr.registerConverter("Number", function(val) {
  if (typeof val === "number") {
    return val;
  } else if (typeof val === "string") {
    return Number.parseFloat(val);
  } else if (val === null) {
    return null;
  }
});
```

This `Number` converter will convert values if value are passed as string by calling `Number.parseFloat`.
Make sure there is possibility that non-string value can be passed to converter. This can be happen `setAttribute` was called for example.
Converter function must return `undefined` when passed values are non convertible.
Converter argument can accept null but there is no possibility to accept `undefined`.
If user assigned `undefined` to attribute by calling `setAttribute` API, Grimoire will throw exception.
