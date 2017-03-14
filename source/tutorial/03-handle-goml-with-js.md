---
Type: doc
Title: Work with GOML in Javascript
Order: 3
---

## Overview

Attributes of nodes and components declared in GOML can be manipulated by reading javascript. Grimoire.js provides an interface that can be easily handled when manipulating the canvas part. In this chapter, let's actually change the attribute of the component actually using Grimoire's interface.

This time, we will perform the basic operation related to the node of the interface. For details of the top level API, it is good to refer to [APIReference] (https://grimoire.gl/api/).

Learning #
* Acquisition from Canvas's javascript side
* Operation by javascript on GOML node
* Change node attributes

Get ### canvas

First, load javascript to get canvas.
Let's load `index.js` in` index.html`.

You are now ready to get the canvas (already in the web editor below).

```javascript
Gr (function () {
  Var $$ = gr ("# main");
});
```

> When retrieving the part of the canvas you want to manipulate, try to get it inside the Grimoire interface. This is to prevent acquisition from occurring before canvas generation.

You can get the canvas part handled by Grimoire.js using the selector like below. When using multiple GOMLs etc., you can explicitly operate on the canvas you write by using this.

### Try changing the attribute of mesh

Let's first overwrite the `position` attribute on the` <mesh> `node.

To change the attributes of the default component for a node, use `setAttribute (" attribute name ", value)`. For value, it is possible to specify a value suitable for the converter to which the write attribute corresponds.

```javascript
Gr (function () {
    Var $$ = gr ("# main");
    SetTimeout (function () {
      $$ ("mesh"). SetAttribute ("position", "3,0,0");
    }, 1000);
});
```

With the above description mesh's position should be shifted to (3, 0, 0) after 1 second.
Let's check it.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t03-01" allowfllscreen> </ iframe>

> When specified as a node name, all nodes with the same node name are acquired. Let's use a selector when you operate on a specific node.

In addition to Grimoire's node interface,
In the node's interface, you can perform operations on the structure of the node (destroy, append), operations on node attributes (setAttribute, getAttribute), and register event handlers (on, off).

* Get
* AddComponent ** (handled in next chapter) **
* Append
* Children
* CompareClass
* Find
* Off
* On
* Remove
Foreach
Single
* Count

Currently the above methods are supported.

### Try adding mesh dynamically

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t03-02" allowfllscreen> </ iframe>

Let's use the `append` method
By using this method `append ('<tag>')` you can add a node from Javascript to the specified location.

```javascript
      $$ ("mesh"). Append ('<mesh geometry = "cube" position = "0, 1, 0" color = "green" />');
```

By describing as described above, the green Cube should be displayed at (0, 1, 0).

> Next we will learn how to handle components. Nomenclature declared in GOML comes with standard default components, but you can add components later in GOML. The next chapter deals with this optional component in detail.

> [Try handling components](/tutorial/04-handle-component.html)
