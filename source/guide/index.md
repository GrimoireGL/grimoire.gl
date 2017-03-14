---
Type: doc
Title: Introduction
Order: 1
---

# What is Grimoire.js?

** Grimoire (Grimoire) .js ** is, in a nutshell, ** WebGL framework for web development ** **. `WebGL` expression which requires advanced knowledge and difficulty in existing Web development flow, ** in existing web development flow **, ** with minimal code **, easily ** , ** Framework for handling ** at the production level **.

The technology to deal with `WebGL` has evolved for application and game development until recently. In many libraries, it was common for developers who touched them to implement similar functions on the Web, and users also handle WebGL accordingly.

`WebGL` is also an option on the Web, and it must be handled easily at the same level as other images and movies. Everyday in the Web front end, its difficulty is increasing day by day as the framework evolves. Why can you impose to write completely different ways only for `WebGL` in such a situation?

`Grimoire.js` changes the way of` WebGL` on this Web. People on the Web can deal with the writing style of the Web, and those who were originally tampering with CG and the like do write like the conventional one, the parts can be used by people in the Web field soon. ** WebGL makes it one of the brush possessed by Web engineers next to images and videos. ** That is what Grimoire.js accomplishes.

# What can you do with Grimoire.js?

Well, then what exactly can you do with ** Grimoire.js **?

For example, ** 3D model can be displayed simply **,

![](https://i.gyazo.com/2c6f811b72d565d76ef2b0f846af28bd.gif)

https://cx20.github.io/gltf-test/examples/grimoiregl/index.html?model=VC&scale=0.2

> GlTF display test by [@ cx 20](https://github.com/cx20)

Advanced ** You can also easily display shader art **.


![Post effect](https://i.gyazo.com/9d519c71b24ae27fccd35413e44a5b73.gif)

http://qiita.com/pnlybubbles/items/c87e8e7466ecdc11a23c

> [Post effect (Grimoire.js Advent Calender 2016)](http://qiita.com/pnlybubbles/items/c87e8e7466ecdc11a23c) [@pnlybubbles](https://github.com/pnlybubbles)

Alternatively, you can also create applications ** linked with various functions of HTML5 like ** WebCam.

![Web camera sample](https://i.gyazo.com/b4ff87de431cf756f65e716525f41418.gif)

https://grimoiregl.github.io/grimoire.gl-example/#webcam

> Official sample

Regardless of how you want to use it, if it requires expressivity of `WebGL`, you will be able to fully benefit from` Grimoire.js`.

# Introduction

To test `Grimoire.js`, first create a simple` .html` and load it with the following `<script>`.

```html
<Script src = "https://unpkg.com/grimoirejs-preset-basic/register/grimoire-preset-basic.js"> </script>
```

This script is not just `Grimoire.js` but it contains some plugins. The minimum required functions are available for the first time with this script.

If you want to use `minify` js or` npm`, please refer to [download](/guide/download.html). ** However, beginners are encouraged to use `<script>` first. It is best to enter everything from simple things **

# Declarative WebGL markup

In `Grimoire.js`, write markup (GOML) for describing WebGL. For example, write it at the position you want to embed as follows.

```xml
<Script type = "text/goml">
  <Goml>
   <Scene>
    <Camera/>
    <Mesh color = "red" position = "0, 0, 0"/>
   </Scene>
  </Goml>
</Script>
```

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example/#guide-01">
</iframe>

In this way, `<canvas>` is inserted and displayed in a part of `<script>` where `* =` text/goml`` is specified **

By manipulating the `position` attribute of` <mesh> `, you can see that the displayed red rectangle moves. You can manipulate declaratively like this to interrogate general HTML sentences in this way.

> Load GOML file

> You can read goml files from outside even by specifying `src =" external file URL "`, like `<script>` when reading javascript files. In this tutorial, it is embedded in html for a brief explanation, but ** It is usually recommended to use external loading. **

Of course, if you describe it like this you can handle multiple canvases.

```xml
<Script type = "text/goml">
  <Goml>
   <Scene>
    <Camera/>
    <Mesh color = "red" position = "0, 0, 0"/>
   </Scene>
  </Goml>
</Script>
<Script type = "text/goml">
  <Goml>
   <Scene>
    <Camera/>
    <Mesh color = "green" position = "0, 0, 0"/>
   </Scene>
  </Goml>
</Script>
```

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example/#guide-02">
</iframe>

# Operation with Javascript

```xml
<Script type = "text/goml" id = "canvas 1">
  <Goml>
   <Scene>
    <Camera/>
    <Mesh color = "red" position = "0, 0, 0"/>
   </Scene>
  </Goml>
</Script>
<Script type = "text/goml">
  <Goml>
   <Scene>
    <Camera/>
    <Mesh color = "green" position = "0, 0, 0"/>
   </Scene>
  </Goml>
</Script>
```

If you execute JS like the following, the upper cube becomes blue one second after `Grimoire.js` is loaded.

```javascript
Gr (function () {
  SetTimeout (function () {
    Gr ("# canvas 1") ("mesh"). SetAttribute ("color", "blue");
  }, 1000);
});
```

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example/#guide-03">
</iframe>

If someone has dealt with `jQuery`, you will find that it is a similar API. `Gr` is an object defined by` Grimoire.js`, and all APIs can be accessed through this.

** When `function` is passed to` gr`, it is called at the timing when `Grimoire.js` is initialized **

Also, pass in a string to ** `gr` and specify` <script> `in the query and specify a query to get the node you want to manipulate against it ** (Return with the first parenthesis of gr Please be aware that it is a query to a certain `<script>`, which is one of the most common mistakes that people who use for the first time are prone to falling.

# Node and component system of Grimoire.js

The discussion so far is the same as that of other tag-based WebGL libraries. However, once you understand the system of nodes and components in `Grimoire`, you will see how well the system of this node is made.

Generally, the DOM system of XML and HTML can show the parent-child relationship of each node. This is the same also in GOML.

![](./Images/nodes.png)

In fact, a node is composed of a collection of ** functions ** called ** components **.

![](./images/node-have-components.png)

For example, `<mesh>` always means `Transform`, a component that manages coordinate and rotation, etc, and a set of` MeshRenderer` which manages the display part.

`<Camera>` stands for `Transform`, a set of` Camera` components that manage camera conversion mechanisms and so on.

These components receive ** attributes ** as input. For example, `Transform` which manages coordinates and rotation amount has obviously attributes such as` position` and `rotation`.

![](./images/component-have-attributes.png)

The `position` attribute passed to` <mesh> `is passed to the` Transform` component of this `<mesh>` and used as a parameter. All such attributes can be operated in javascript in the same way.

Here, in order to grasp the power of the component, try to make the camera move by writing as follows.

```xml
<Script type = "text/goml" id = "canvas 1">
  <Goml>
   <Scene>
    <Camera>
      <Camera.components>
        <MouseCameraControl/>
      </camera.components>
    </Camera>
    <Mesh color = "red" position = "0, 0, 0"/>
   </Scene>
  </Goml>
</Script>
```

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example/#guide-04">
</iframe>

As mentioned above, by inserting `<MouseCameraControl>` in `<camera.components>` which is a child element of `<camera>`, it is possible to use `Transform` and` Camera `MouseCameraControl` in addition to` MouseCameraControl`.

![](./images/optional-component.png)

## Write a component

The component has not discussed anything yet. Let's try to make a component, `Rotate`, which keeps turning objects stuck together, for example.

```javascript
Gr.registerComponent ("Rotate", {
  Attributes: {
    Speed:
    {
      Default: 1,
      Converter: "Number"
    }
  },
  $ Mount: function () {
    This.phi = 0;
  },
  $ Update: function () {
    This.phi + = this.getValue ("speed");
    This.node.setAttribute ("rotation", this.phi + "," + this.phi + "," + this.phi);
  }
})
```
The elements in `attributes` are the parameter names and details that this component can accept.
I will not touch it deeply here, but as you can see from the parameter name, it is a numeric value, indicating that the initial value is `1`.

Let's write goml like this after writing this.

```xml
<Script type = "text/goml" id = "canvas 1">
  <Goml>
   <Scene>
    <Camera>
      <Camera.components>
        <MouseCameraControl/>
      </camera.components>
    </Camera>
    <Mesh color = "red" position = "0, 0, 0">
      <Mesh.components>
        <Rotate/>
      </mesh.components>
    </Mesh>
   </Scene>
  </Goml>
</Script>
```

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example/#guide-05">
</iframe>

The following figure shows the lifecycle of a component. I do not need to understand everything now, but this figure will be useful to you in the future.

![](./Images/message-order.png)

Functions starting with $ are called ** message handlers ** and will be called everywhere in the component lifecycle.
`This` in this message handler is bound to each instance.

As for message handlers, there are many things that we have touched a lot, but here is just an event handler and understanding is OK.

## Define a node

If you want to draw a large amount of rotated `<mesh>`, it is inconvenient to write it as above. Let's try to prepare `<rotated-mesh/>`.

```javascript
Gr.registerNode ("rotated-mesh", ["Rotate"], {}, "mesh");
```

```xml
<Script type = "text/goml" id = "canvas 1">
  <Goml>
   <Scene>
    <Camera>
      <Camera.components>
        <MouseCameraControl/>
      </camera.components>
    </Camera>
    <Rotated-mesh color = "red" position = "- 2, 0, 0"/>
    <Rotated-mesh color = "green" position = "0, 0, 0" speed = "2"/>
    <Rotated-mesh color = "blue" position = "2, 0, 0" speed = "3"/>
   </Scene>
  </Goml>
</Script>
```

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example/#guide-06">
</iframe>

# next

You understand the most basic mechanism of `Grimoire.js` so far. Everything is built on this. There is no exception.

After grasping such a structure, it would be around the drawing that you would probably want to listen and want to listen. How can we write a model and texture?
You are ready to do ** [tutorial](/tutorial) **. Now let's move on to the next step.
