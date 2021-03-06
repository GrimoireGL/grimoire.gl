---
type: doc
title: Interfaces
order: 30
---

You can write javascript to coop with the other web UIs or make expression more dynamic.

This is example to change mesh color when mouse hover on the mesh.

```xml
<goml>
  <scene>
    <camera position="0,0,-10"/>
    <mesh geometry="cube" color="red" position="0,0,0"/>
  </scene>
</goml>
```

```javascript
gr("*")("mesh").on("mouse-enter",function(){
  gr("*")("mesh").setAttribute("color","green");
});
gr("*")("mesh").on("mouse-leave",function(){
  gr("*")("mesh").setAttribute("color","red");
});
```

You can query node of Grimoire by calling `gr("script tag query")("node tag query")` like jQuery.
But there might be multiple GOML files in a single HTML file. Therefore, you need to specify which goml file should be operated with query.
The first query is script tag query. This is query for `<script type="text/goml">` in your HTML. In this example, all GOML file in the HTML is target of the query. This return value is named as `GOMLInterface` because it limit which GOML should be affected by later API call.
The secound query is node tag query. This is query for GOML nodes. You can use class,id or node name for querying.
You can not use attribute value for querying like `mesh[position="0,0,0"]`.
This return value is named as `NodeInterface` in same way.

You can create and assign script queried interface to use them easily. This is same code with the example.

```javascript
var all = gr("*"); // This is GOML interface
all("mesh").on("mouse-enter",function(){
  all("mesh").setAttribute("color","green");
});
all("mesh").on("mouse-leave",function(){
  all("mesh").setAttribute("color","red");
});

```

`gr("*")("mesh").on` method register event handler to specified node. All nodes have event emitter to register handlers.
Several components attached to node can fire some events from these nodes.

`gr` is a global variable registered by Grimoire.js and it is called `GrimoireInterface`.
`GrimoireInterface`,`GOMLInterface` and `NodeInterface` are the most fundamental API of Grimoire.
By understanding these APIs, you would be able to operate Grimoire objects and coop with the other your Web stuff.

> `gr.noConflict()`
>
> If your script need to use `gr` in global variable, you can prevent Grimoire to use `gr` as interface.
> There is the other global variable `GrimoireJS` is also same reference of `gr`.
> By calling `gr.noConflict()`, value of `gr` is restored if there was some values before Grimoire.js was loaded.
> This feature similar to `jQuery.noConflict()`.

# GrimoireInterface


You can acccess configuration of Grimoire.js through GrimoireInterface.
For instance, you can dismiss console logging for debugging that is generated by Grimoire default by this code.

```javascript
  gr.debug=false;
```

GrimoireInterface is functional object. You can call gr as a function.

```javascript
gr(function(){
  console.log("Grimoire.js is loaded!")
})
```

When string argument was passed to GrimoireInterface, this function works for querying GOML script as described previous section.
This function also accepts function as an argument, Grimoire will call the function as a callback when node construction of GOML was completed. Be careful that this is not called after all resource loaded.

This feature is commonly used for operating objects in the scene initially since these object must be operated after GOML script loaded. This is very similar to `DOMContentLoaded` event on HTML.

```javascript
  // Arrange 10 cubes
  gr(function(){
    for(var i=0;i<10;i++){
      var x = i-5;

      // Add mesh tag inside of scene
      gr("*")("scene").addChildByName("mesh",{geometry:"cube",position:[x,0,0]});
    }
  })

  // If you wrote the code here, it would not works since scene node is not loaded yet.
  //gr("*")("scene").addChildByName("mesh",{geometry:"cube",position:[0,0,0]});

```

## GrimoireInterface.lib

`lib` field of GrimoireInterface is important field. You can access internal class definitions of Grimoire from this reference.

```javascript
  var lib = gr.lib;
```

For example if you loaded `grimoirejs-fundamental` plugin that is basic renderer of Grimoire, you can access internal classes of the plugin from `gr.lib.fundamental`. This is a example for fetching `Material` class of `grimoirejs-fundamental` and `Vector3` of `grimoirejs-math`.

```js
var Material = gr.lib.fundamental.Material.Material;
var Vector3 = gr.lib.math.Vector3;
```

This references are automatically generated from folder structures of these plugins. If you need to access internal classes of Grimoire plugins, you would need to know which folder containing these references. (But several classes are so common to use that you can know these references from tutorials).

This feature is for accessing internal classes from pure javascript codes. If you are used to require external javascript, you can do same thing in following way.

```js
import Material from "grimoirejs-fundamental/ref/Material/Material";
import Vector3 from "grimoirejs-math/ref/Vector3";
```

You can know folder structures from github repository or API references.

# GomlInterface

GomlInterface is returned value of querying GOML script via GrimoireInterface.

Let assume there was 3 goml files like below.
```html
<body>
  <script id="first-goml" class="goml-class" type="text/goml" src="first.goml"></script>
  <script id="second-goml" class="goml-class" type="text/goml" src="second.goml"></script>
  <script id="third-goml" type="text/goml" src="third.goml"></script>
</body>
```

You can fetch GomlInterface by querying these scripts.

```javascript
var thirdGomlInterface = gr("#third-goml");
var multiGomlInterface = gr(".goml-class");
```

GomlInterface can operate multiple or single GOML files.
You can inspect how many script nodes are queried in following way.

```javascript
console.log(thirdGomlInterface.rootNodes.length);// 1
console.log(multiGomlInterface.rootNodes.length);// 2
```

GomlInterface don't contains so much interfaces like GrimoireInterface.
Generally it is used for **fetching NodeInterface** by calling GomlInterface as a function.

```javascript
thirdNodeInterface = thirdGomlInterface("mesh");
```

Make sure the queried objects are **GOML nodes** not HTML tags like GrimoireInterface.

# NodeInterface

NodeInterface is used for operating nodes. There are many APIs to operate GOML nodes.

```javascript
// Display count of meshes
console.log(gr("*")("mesh").count);

// Get attribute of the mesh. If there was multiple selected nodes, returned value is first one.
var pos = gr("*")("mesh").getAttribute("position");

// Set attributes of selected mesh.
gr("*")("mesh").setAttribute("position",[pox.x,pox.y+1,pos.z]);

// Append mesh to selected mesh.
gr("*")("mesh").append('<mesh geometry="cube" color="red"/>');

// Add component to selected nodes.
gr("*")("camera").addComponent("MouseCameraControl");

```

NodeInterface is capable of operating multiple nodes by one call.
If you want to get actual reference of single node from selector, you can use `first()` interface to get first one of the selected nodes.

```javascript
 var mesh = gr("*")("mesh").first();
```

The instance selected by `first()` is instance of `GomlNode`. GomlNode is actual instance of element in GOML.
GomlNode also contains similar interfaces like `getAttribute` or `setAttribute`. But these are completely different objects.
