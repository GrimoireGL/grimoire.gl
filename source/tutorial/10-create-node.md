---
Type: doc
Title: Create node
Order: 10
---

## Overview
In this chapter we will create a node usable in Grimoire.js. By creating a node, the user can actually use it as a tag in GOML. Learn the procedure for creating a node by creating a basic node.

Learning #

* Create node

### Creating a node

Use the registerNode method to define a component.
In the registerNode method, you can specify the name of the node as the first argument, the default component attached to the second argument, and the tag to inherit as the third argument.
Basically, you can now write tags defined with the Grimoire interface.

The `Rotate` specified in the default component is from the section" Create component [/tutorial/07-create-component.html) ".

```javascript
Gr.registerComponent ('Rotate', {
  Attributes: {
    Speed: {
      Default: '1',
      Converter: 'Number',
    },
  },
  $ Mount: function () {
    This.phi = 0;
  },
  $ Update: function () {
    This.phi + = this.getAttribute ('speed');
    This.node.setAttribute ('rotation', this.phi + ',' + this.phi + ',' + this.phi);
  },
});

Gr.registerNode ("rotate", ["Rotate"], {}, "mesh");
```

Registered nodes can be used as tags in GOML. As we added it as default component, we can also specify the `speed` attribute.

```
<Rotate geometry = "cube" position = "0,0,0" color = "# 0000FF" speed = "1" />
```

Let's check it.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t10-01"> </ iframe>

> Next, I will learn about making my own material. Material is important for setting the material texture. Grimoire.js strongly supports the creation and import of materials. Let's create materials and give breadth to 3D representation.
>
> [Try making your own material](/tutorial/11-create-material.html)
