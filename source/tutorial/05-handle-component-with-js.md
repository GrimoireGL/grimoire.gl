---
Type: doc
Title: Handle components with javascript
Order: 5
---

## Overview

As well as what we did in Chapter 3, Grimoire.js allows you to manipulate components from javascript.
As a function for manipulating components, the node interface provides an `addComponent` method.

Learning #

* Operation by javascript on components
* Change the attributes of the added component

### Add Components
To add a component we use the `addComponent` method.
Let's check it.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t05-01"> </ iframe>

Also, it is possible to change attributes for added components.
Let's modify the attributes of the `MouseCameraControl` component for the` <camera> `tag here.

```javascript
$$ ("camera"). First (). GetComponent ("MouseCameraControl"). SetAttribute ("zoomSpeed", 1);
```

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t05-02"> </ iframe>

> Next, consider the nature of GOML nodes and components. Learn the data structure of Grimoire.js.
>
> [Essence of nodes and components](/tutorial/06-node-and-component.html)
