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

  $mount:function(){
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

## Registering components in ES6 syntax

If your development environment supports ES6 syntax, extending component is better way to registering components.
This is example code which behaviour is completely same as I sited above.

```javascript
import Component from "grimoirejs/ref/Node/Component";
class MouseColor extends Component{
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
  $mount(){
    this.node.on("mouseenter",function(){
      this.node.setAttribute("color",this.getAttribute("onColor"));
    });
    this.node.on("mouseleave",function(){
      this.node.setAttribute("color",this.getAttribute("offColor"));
    });
  }
}
gr.registerComponent("MouseColor",MouseColor);
```

# GomlNode

`GomlNode` is our virtual DOM instance. You can access GomlNode to which current component is attached from component via `this.node`.

```js
this.node // <- Instance of GomlNode
```

There are several useful interfaces in GomlNode to make component.

```js
const trans = this.node.getComponent("Transform"); // you can get other components attached to the node
const trans2 = this.node.getComponent(Transform); // You can fetch them by string or constructor function

this.node.getAttribute("position");
this.node.setAttribute("position","10,0,0");
```

When you query `getComponent` with constructor function, this will consider inheritance of the constructor.
For example, if you call `this.node.getComponent(A)`, it can return instance of B which inherits A.

`getAttribute` and `setAttribute` exists on component instance also. But, `getAttribute` and `setAttribute` of component is only works for themselves. Therefore, even if the node contains Transform component having `position` attribute, you cannnot access this attribute by `this.getAttribute("position")`. You should use `this.node.getAttribute("position")` instead.

## GomlNode#companion

Several fields are bound to tree of a GOML file. If you load 2 GOML file, there should be 2 canvases.
Therefore, Grimoire need to manage 2 gl instance one time. There are good abstraction not to consider which canvas containing the components in Grimoire.

`GomlNode#companion` is a reference of hash table that can exist single instance in one GOML tree.
This is example javascript code to fetch WebGLRenderingContext that is managed by current GOML tree.

```js
this.node.companion.get("gl");
```

You can also set companion from `this.node.companion.set("name",instance)`.
This is commonly used companions.

* gl ・・・ WebGLRenderingContext
* canvasElement・・・HTMLCanvasElement generated by Grimoire

# Message function

You can notice there are several functions of which names begin with `$` in the component registering codes.
These are called `message functions`. As the `Start` or `Update` methods of Unity, Grimoire will call these functions in ideal timings.

## Messages commonly used

This is message list called by core of Grimoire.

* $awake ・・・ Called when the component was instanciated.
* $mount ・・・ Called when the component was attached to nodes.
* $unmount・・・Called when the component was detached from nodes.
* $dispose・・・Called when the component was destroyed.

And there are messages called by plugins also. `$update` is the most commonly used message function defined by plugins.
`$update` is registered by `grimoirejs-fundamental` to update scene.

* $update ・・・ Called when objects should be updated in active scene.

There are more message functions you can use. However, these 5 messages are enough to know in basic usage.

## Message functions in deep

New message functions can be defined by user also. If you need  to call specific methods in the other component, this feature would be helpful to build such feature.

There are 2 API to call message functions manually.

### GomlNode#sendMessage

`sendMessage` is the method of GomlNode to call every matched message functions in the components attached to the node.
This is an example to call sendMessage in a component.

```js
this.node.sendMessage("newMessage",args);
```

By this example code, `$newMessage` message methods of the other components of attached node will be called with the arguments. Make sure called method is not `newMessage` but `$newMessage`.

### GomlNode#broadcastMessage

`broadcastMessage` is the method to call `sendMessage` recursively in every children(and self) of the node.
This is an example to call broadcastMessage in a component.

```js
this.node.broadcastMessage("newMessage",args);
```

This argument list is completely same as sendMessage. But, make sure the message functions of node called by this API is in  every nodes of children of the node and self node.

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
