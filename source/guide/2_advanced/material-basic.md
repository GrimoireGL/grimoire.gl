---
type: doc
title: Material basics
order: 10
---

# What is material?

Material is group of shader program codes and arguments used for rendering objects.

For example, if you use `forward-shading` plugin to use lights, you can make so different rendering result from different parameters.

![](https://i.gyazo.com/180f7e3a0ca2b5d67337f46ac3913a35.gif)

> You can see various appearance of cube that was made by changing material arguments.

By understanding material of Grimoire, you can achieve an appearance you want to create.

# `material` attribute on mesh

As we described in tutorial, we can specify `color` attribute as default.

```xml
   <mesh geometry="cube" color="yellow"/>
```

You need to know there was omitted default value `material`. If we denote default value of `material`, it should be following code.

```xml
   <mesh geometry="cube" material="new(unlit)" color="yellow"/>
```

`new(unlit)` is just a default value of `material` on `MeshRenderer` component attached to `mesh`.

> `forward-shading` plugin will rewrite default value of `material` on `MeshRenderer`
>
> For users can use shader enabling shading by default, if you use `forward-shading` plugin, the plugin will rewrite default value of `material`.
> The default value will be `new(basic)` when you use the plugin.

`material` attribute determine what kind of material arguments (such as `color` or `texture`) are available on that tag.
For instance, if you specified `new(unlit)` on a `<mesh>` tag, you will be able to specify `color` and `texture` attribute on the `<mesh>`. When you specified `new(basic)` enabled by linking `forward-shading` plugin, you will be able to specify `roughness` , `roughnessTexture` , `albedo` and so on.

As you need to know what arguments are available when you want to use javascript function, material parameters are different and depends on what material used.

## syntax of `material` attribute

There are 2 types of syntax is available on material attribute.

* `${query-to-material}`
* `new(${material-name})`

`new()` syntax is very useful if you need to instanciate a `<mesh>` from javascript because it does not require instanciate the other tags such as `material`. However, if you have a lot of meshes that have same materials, you should use query syntax. It works more faster than 'new syntax'.

### query syntax on material attribute

You can use "query syntax" of material for sharing material configuration between meshes.

```xml
<goml>
  <material class="mat1" type="unlit" color="yellow"/>
  <scene>
    <camera/>
    <mesh material=".mat1" position="2,0,0"/>
    <mesh material=".mat1" position="-2,0,0"/>
    <mesh material=".mat1"/>
  </scene>
</goml>
```

Ensure that you need to specify material arguments on `<material>` tag not `<mesh>` tag.

### 'new' syntax on material attribute

When you need to create material for each `<mesh>`, it is pain to make `<material>` for each `<mesh>`.
For these case, you can use "new syntax" of material for creating a material instance for the mesh.

```xml
<goml>
  <scene>
    <camera/>
    <mesh material="new(unlit)" color="yellow" position="2,0,0"/>
    <mesh material="new(unlit)" color="green" position="-2,0,0"/>
    <mesh material="new(unlit)" color="red"/>
  </scene>
</goml>
```

Ensure that you need to specify materials on each `<mesh>` tags.

## Material arguments

Most of materials on Grimoire is created with custom material file `.sort`. Grimoire will generate attributes for this custom material file by parsing variables of shader code.
