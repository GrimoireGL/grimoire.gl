---
Type: doc
Title: handling components
Order: 4
---

## Overview
Grimoire.js defines components as a means to increase code reusability. This allows the user to easily apply the constructed logic to different nodes. The component here is the foundation of all nodes. By combining components, a node with one specific function is created.

Learning #

* About default and optional components
* How to write GOML on optional components

### Default and Optional Components

The components of Grimoire.js are divided into two types, default components and optional components.
A tag such as `<mesh>` described in GOML comes with several components from the beginning depending on the tag name (for example, Transform component). These components are called default components.
On the other hand, the component that the user added later with GOML etc is set as an optional component.

> When adding an optional component, there may be components on which the component depends. In doing so, it is necessary to explicitly add it to the node as an optional component, including dependent components.

### Add optional components

It is possible to add optional components from GOML to nodes. To do that, we need to measure the components to add to the child elements of the node. The description for that is as follows.

Consider adding a component that allows mouse operation on the `<camera>` tag as an example. The notation is as follows. By adding this to the child element of the `<camera>` tag, adding the component is complete.

```html
<Camera.components>
  <MouseCameraControl />
</camera.components>
```

> MouseCameraControl is a tag supported by grimoirejs-fundamental. Users can also create components. For details, it is described in [Create a component](/tutorial/07-create-component.html).

To the target tag, it is necessary to set `<target tag name.components> tag of the component to be added </ target tag name .components>`.

Let's make sure that the component is actually added.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t04-01"> </ iframe>



> Next, learn to operate from Javascript on the operation of the component. This makes it possible to add and change components dynamically.
>
> [Try to manipulate OptionalComponent from the javascript side](/tutorial/05-handle-component-with-js.html)
