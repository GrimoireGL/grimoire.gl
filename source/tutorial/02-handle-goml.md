---
Type: doc
Title: Handling GOML
Order: 2
---

## Overview

In Grimoire.js it is possible to declaratively describe 3D space to be handled using XML notation. Here let's learn about the basic description of GOML using the `grimoirejs-fundamental` plug-in which contains tags necessary for rendering the basic 3D space. Basically, the user will construct a representation of Web3D using this `grimoirejs-fundamental` plugin.
The `grimoirejs-fundamental` plugin can be informed by referring to [Reference] (https://grimoire.gl/api/grimoirejs-fundamental.html). This time we will learn how to use tags necessary for basic 3D representation from this plugin.

Learning #

* What is GOML
* How to handle GOML tag
* How to handle GOML tag attributes
* How to describe scenes using `grimoire-fundamental` plugin



The following is a GOML describing the functions necessary for performing basic 3D representation.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t02-01"> </ iframe>

GOML is an abbreviation of Grimoire Object Markup Language and is a language for describing the state in the canvas to draw in XML. Grimoire.js defines it. Let's check about the GOML tag from the above sample as an example.

The `<goml>` tag is the most basic tag. It concerns the state of the canvas itself. You can specify the size of the canvas with the `width` and` height` attributes. Also, it corresponds to `fullscreen`. It also supports selectors,

```html
<Goml containerId = "main">
```

This will get the `<div>` element that encloses the canvas corresponding to GOML.

The `<geometry>` tag defines the geometry. You can use it by setting the geometry identifiers with the `name` attribute and specifying them with the` geometry` attribute of the `<mesh>` tag.

```xml
<Geometry name = "cone" type = "cone" divide = "30" />
```

* `Name` Attribute - Identifier
* `Type` attribute - the type of geometry. `Cube`,` quad`, `triangle`,` sphere`, `corn` are provided by default.
In addition, each primitive type may have attributes accordingly. The `cone` type can have the` divide` attribute. This specifies the division number of the mesh. This is an attribute depending on the type of geometry, it is possible to set attributes according to each geometry.

The `<render>` tag is a tag related to drawing. It is necessary when describing a scene. When rendering basic 3D space, you can omit this `<render>` tag.

```html
<Renderer camera = ". Camera" viewport = "0, 0, 100%, 100%">
  <Render-scene />
<Renderer />
```

The whole scene is described below the `<scene>` tag. The processing of the 3D loop will be done to the node inside this tag. Basically there is `<camera>` in `<scene>`.

```xml
<Camera class = "camera" near = "0.01" far = "40.0" aspect = "1.5" fovy = "45 d" position = "0, 0, 10" />
```

The `<camera>` tag places the camera. You can set attributes of `near, far, fovy, aspect` in the` <camera> `tag.

These can be used by using the grimoirejs-fundamental plug-in. The grimoirejs-fundamental plugin will be used by many users.

In addition to the tags supported by grimoirejs-fundamental,

* `<Mesh>`
* `<Render-quad>`
* `<Texture>`

there is ........., ........., etc.

### Try to display a cone

Let's actually use the tag defined by grimoire-fundamental.
To display a cone we need to read the geometry using the `<geometry>` tag. Let's write the definition of the geometry outside the `<scene>`.

```xml
<Geometry name = "cone" type = "cone" divide = "30" />
```

After loading the geometry you need the `<mesh>` tag to actually display it. Let's add cone to the `<geometry>` tag and add the tag below `<scene>` as shown below.

```xml
<Mesh geometry = "cone" position = "1, 1, 0" color = "# 99 f" />
```

### Try to display the texture

Next I will try to display the image in the canvas. You can paste an image on the mesh by specifying the path to the image in the `texture` attribute as shown below.

```xml
<Mesh geometry = "cube" position = "0, 0, 0" texture = "t 02 - 01 / img 1.jpg" />
```

By using Grimorire.js like this you can declaratively describe the 3D representation in the canvas.


> Next we will learn how to manipulate the loaded GOML from JavaScript. This makes it possible to dynamically change tags described in GOML and their attributes. It is also possible to use event handlers to operate at specific timing.
>
> [Handle GOML from JavaScript](/tutorial/03-handle-goml-with-js.html)
