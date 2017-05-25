---
type: doc
title: GOML
order: 2
---

# What is GOML?

All objects are treated as tree structure in Grimoire. **GOML** is a markup language to represent that structure.
In generally, GOML have `.goml` as file extension.
You can use syntax highlight in your editor with using syntax highlight because GOML is just a specific case of XML.

Users can write node structures and components in GOML as tags. These nodes and components must be registered to `GrimoireInterface` before loading the GOML.
You can read more about component systems or nodes in [Component system](/guide/1_essentials/05_componentsystem.html).


# How to put GOML file to your page

To embed GOML file in your webpage, you need to add script tag with `text/goml` type.

```html
<body>
  <script type="text/goml">
    <goml>
      <scene>
        <camera />
        <mesh color="red" geometry="cube"/>
      </scene>
    </goml>
  </script>
</body>
```

We recommend to use external file to embed goml file like the code below.

```html
<body>
  <script type="text/goml" src="./index.goml"></script>
</body>
```

Grimoire will load goml files after constructing HTML DOM.(With DOMContentLoaded event).

# Syntax

This is an example of GOML.

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

> These nodes such as `goml`, `scene`, `mesh`,`camera` and `MouseCameraControl` component is registered with `grimoire-fundamental` plugin. By loading this plugin, you can use these basic nodes for rendering with WebGL.
>`grimoire-fundamental` is included in `grimoirejs-preset-basic` (that can be downloaded from installation document).
> When you are using `grimoirejs-preset-basic`, you don't need to load `grimoirejs-fundamental` additionally.
> Several nodes and components defined with default plugins are described in [Major tags](/guide/1_essentials/08_tags.html).

Attributes of nodes can be specified by attribute syntax of XML.
All attributes in GOML is parsed as string initially. And then Grimoire will use `Converter` to convert them into ideal data type of the attribute internally.
Converters can be different with the other attributes. For example, you can specify `0,0,0` to `position` attribute of `mesh`.
The attribute will use `Position` converter to parse the string.

You can read more about converter in [Component System](/guide/1_essentials/05_componentsystem.html).


## Optional component syntax

In the previous example, `<MouseCameraControl>` tag is contained in `<camera.components>` tag that is child of `<camera>` tag.
This is specific syntax to add components to the node.

```xml
<goml>
  <scene>
    <scene.components>
      <PhysicsWorld/>
    </scene.components>
    <camera/>
    <mesh>
      <mesh.components>
        <RigidBody mass="10"/>
      </mesh.components>
    </mesh>
  </scene>
</goml>
```

This is example to use [grimoirejs-physics](https://github.com/GrimoireGL/grimoirejs-physics) plugin to apply physically simulation feature to `<scene>` and `<mesh>`.

These components applied with this syntax is named `Optional components`.

> Attributes of optional component
> Attributes of optional components should be written in **atrtibutes in component tag**.
> It would not be affected when you applied value from node attribute.

## Namespace
Grimoire is a framework extended by adding tags with plugins. However, if you need a lot of tags in your application, tag name can conflict the other plugins. All plugins have different **namespace** to identify these.
**namespaces** are determined from `package.json` of the plugin package.

For example there was two different plugins `grimoirejs-plugin1` and `grimoirejs-plugin2`. And let assume these plugins registered `<apple>` nodes and `Edible` components.
In this situation, this goml code is invalid because Grimoire can not distinguish these tags.

```xml
<goml>
  <scene>
    <camera />
    <apple />
  </scene>
</goml>
```

To denote the `<apple>` is registered `grimoirejs-plugin1` explicitly, you need to apply xml namespace to `<apple>` tag.

```xml
<goml xmlns:plugin1="HTTP://GRIMOIRE.GL/NS/GRIMOIREJS-PLUGIN1">
  <scene>
    <camera />
    <plugin1:apple />
  </scene>
</goml>
```

This is same for components.
```xml
<goml xmlns:plugin1="HTTP://GRIMOIRE.GL/NS/GRIMOIREJS-PLUGIN1">
  <scene>
    <camera />

    <mesh color="red" geometry="cube">
      <mesh.components>
        <plugin1:Edible/>
      </mesh.components>
    </mesh>

  </scene>
</goml>
```
