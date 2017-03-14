---
Type: doc
Title: Create component
Order: 7
---

## Overview

In this chapter we will try to create a component that can be used in Grimoire.js. Learn the procedure for building your own components through creating basic components.

Learning #

* Create component

### Creating Components

Use the registerComponent method to define a component. Let's define the component from javascript.

* Attributes - Defines the attributes of the component
    * Default - Sets the initial value of the attribute
    * Converter - Defines the type of attribute value. In the example below `Number` is specified, so it is treated as a number.
* $ Awake - called when initializing the component
* $ Update - called every frame

In a lifecycle event such as `$ awake` or` $ update`, `this.node` can get the node to which the component belongs.

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
```

In order to dynamically add the last created component to the existing `mesh`, we do` addComponent` on the node.
This operation should be done after GOML is parsed, so do it in `gr (function () {})`.

```
$$ ('mesh'). AddComponent ('Rotate');
```

Let's check it.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t07-01"> </ iframe>


Production of basic components is as follows. Component development can be done in the user's favorite environment. Development using TypeScript is also possible.


For details, see [here](/tutorial/13-create-plugin.html).

> Next, let's actually create a GOML node.
>
> [Try creating a node](/tutorial/10-create-node.html)
