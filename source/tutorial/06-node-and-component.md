---
Type: doc
Title: The essence of nodes and components
Order: 6
---
## Overview

Learn the essence of nodes and components here. Grimoire.js has a tree structure as a data structure.

Learning #

* Data structure of Grimoire.js
* Properties of nodes and components

### Data structure of Grimoire.js

<img src = ". / Images / 06 - node - and - component - 01.png" width = "480">

In Grimoire.js, one tree is generated for one GOML. The above figure shows a tree structure with respect to basic GOML.

<img src = ". / Images / 06 - node - and - component - 02.png" width = "280">

In addition, each node has a list of components as a function. Considering the `<mesh>` tag as an example, we have a `Transform` component which has functions of moving, transformation and rotation, and a` MeshRenderer` component with drawing related functions as default components.

In this way, each node is created by a combination of specific components.

<img src = ". / Images / 06 - node - and - component - 03.png" width = "480">

Each component to write has appropriate attributes. In the previous Chapter 3, we changed attributes of this component using javascript.

A node described in GOML as a tag represents a combination of default components. When actually creating a node, it is necessary to define the name of the node to be combined. When building the logic, the user will write it in the component.

Component attributes are exposed to the corresponding nodes.

```html
<Mesh position = "0, 0, 0" scale = "1, 1, 1" rotation - "y (30 d)"> </ mesh>
```

Therefore, it is possible to describe as described above in GOML.

The nature of the nodes and components is over.

> Let's create our own components next. In addition, the created component can be released to the outside through npm.
>
> [Try creating a component](/tutorial/07-create-component.html)
