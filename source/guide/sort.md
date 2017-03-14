---
Type: doc
Title: Specification of custom material
Order: 2
---

Normally, programs of Grimoire.js are rendered in canvas by WebGL. Therefore, you can customize the shader using GLSL included in one of WebGL specifications.
Although it is possible to directly interact with GLSL, it is better to use extended shader notation for Grimoire.js (Sort (spells in French)) for Grimoire.js, considering the consistency of the `material tag`.

In this article, we will explain GLSL 's own extension `Sort` (** Saul **) implemented by this fundamental.

# What is Material

In order to understand what the `.sort` file is, you first need to understand what` material 'is.
In `Grimoire.js`,` material` is a concept coincident with `geometry`. Geometry is a concept that means ** original shape **, while material is a concept for dealing with pairs of `drawing methods`, such as how to draw geometry.

Even if one geometry is one camera, there is a possibility that drawing will be performed more than once with one rendering. For example, in relation to post effects, you may have to write out `normals` of all objects in the scene before drawing the whole scene. In this case you need a technique for writing `color` and a technique for writing `normal`.

We refer to this technique as `Technique` (technique). When the renderer wants the image data of the normal, it issues a drawing command to the material having the technique corresponding to the drawing of the normal for all the material and geometry combination.

One method may consist of several procedures. For example, as one of the common methods in 3D graphics, there is a method of writing a small object on the large-sized one in advance and showing it to the edge. Speaking in handwriting, there is a possibility that one method is made up of multiple procedures, as if painting the top after painting the ground. This procedure is called `Pass`.

That is, one material (a set of a plurality of drawing methods for drawing a certain geometry) is made up of one or more techniques (drawing methods), and one technique is one from more than one path (drawing procedure) Become.

That is, there is an inclusion relation in the order of Material> Technique> Pass.

Although it is possible to describe a sort file representing one material by omitting ** Technique, Pass can not be written without writing it. **
Let's start by describing the path as the first step of the custom material.

# Read sort file from GOML

## import-material

You can import the custom material you have written using `<import-material>`. (The description method of custom material is described later)

```xml
<Import-material typeName = "test" src = "something.sort"/>
```

In this way, you can use the custom material described in `something.sort` by using the name` test`.

Once imported material can be specified in two ways.

### When creating an instance of a new material

```xml
<Mesh material = "new (test)"/>
```

If you write elements like 'new (material name) `for elements that can receive materials, a new instance will be created for that destination.
Depending on the material to be read, the material ** dynamically change attributes that can be specified ** will change (details will be described later).
For example, if one material `test` receives the` color` attribute via the `Color 3` converter, you can write something like that.

```xml
   <Mesh material = "new (test)" color = "yellow"/>
```

If you write elements like 'new (material name) `for elements that can receive materials, a new instance will be created for that destination.
Depending on the material to be read, the material ** dynamically change attributes that can be specified ** will change (details will be described later).
For example, if one material `test` receives the` color` attribute via the `Color 3` converter, you can write something like that.

```xml
   <Mesh material = "new (test)" color = "yellow"/>
```

### When creating a common instance with a material tag

```xml
  <! - Just under GOML ->
  <Material id = "mat1" type = "test" color = "blue"/>
  ? <! - Within scene ->
<Mesh material = "# mat1"/>
<Mesh material = "# mat1"/>
  <Mesh material = "# mat1"/>
```

In the case of such a description, the same material is used for the above three meshes. Changing `color` specified in` <material> `will change all three` color`.
Please be aware that `<mesh>` itself will not receive `color` when making such a designation.

### Initial Value of Mesh Material

Here, as an example, the initial value of mesh's material is `new (unlit)`. Also, the material `unlit` is one of the shaders loaded by default.
Since this material can accept `color` and` texture` values, `mesh>` can usually specify these values.

That is, there are no `color` or` texture` attributes when the material is anything else.

Also, if you use many meshes with `material` as initial value, it is inefficient because instances of the material are created for each mesh.
In such a case, it is recommended to share common parts with * `<material>` tags. **

# Path description

First, I will explain how to write a path.
The path is made up of the following elements.

* Shaders described by GLSL
* Declaration statement indicating the state of gl executed before drawing the path
* Others Syntax established for interoperability with Grimoire.js

# # Shader language description

### What is a shader?

Shader language is the language that runs on GPU. The essence of WebGL is not to be able to do 3D, but to be able to run on the GPU a language called shader that can perform 3D drawing at high speed.
It is used to speed up the movement of apexes by materials and the color of each pixel.

Unfortunately from this feature, shaders can not be written with ** javascript alone. ** Instead, you can use the language ** GLSL. **

Unfortunately, we can not deeply touch on shader language specifications and introduction on this page. However, since these are generally `GLSL` with exactly the same specification as those used in` OpenGL` which operates in the desktop environment, there are some existing learning materials.
Also see [ShaderToy](https://webgl.souhonzan.org/entry/?v=0600) and [Introduction to doxas](http://qiita.com/doxas/items/b8221e92a2bfdc6fc211) Then you will be able to begin.

### Shaders in sort

You can write shaders directly in the sort's path.

```glsl
@ Pass {
 //Write a shader here
}
```

** Shaders written in GLSL must be enclosed by `@ Pass'. **

In the shader read by this Sort, `# define VS` is inserted when used as a vertex shader, and` #define FS` if it is used as a fragment shader.
By using this, it becomes possible to use both shaders with the same file.

An example

```glsl

#ifdef VS
  Void main () {
    Gl_Position = ~~~
  }
# Endif

# Ifdef FS
  Void main () {
    Gl_FragColor = ~~~
  }
# Endif

```

Since it uses the GLSL macros to the last, the section delimited by these `VS` and the section delimited by` FS` can appear multiple times.

### default constant

Also, some constants are defined by default. These constants are exactly the same as those accessible by javascript `Math. ~~`.

```glsl//constants
#define PI 3.141592653589793
#define E 2.718281828459045
#define LN2 0.6931471805599453
#define LN10 2.302585092994046
#define LOG2E 1.4426950408889634
#define LOG 10E 0.4342944819032518
#define SQRT2 1.4142135623730951
#define SQRT1 - 2 0.7071067811865476
```

### precision within a fragment shader

When describing as follows, there is a problem in specification of GLSL because the precision modifier in the fragment shader is not attached.

```glsl
Varying vec2 vValue;

#ifdef VS
  Void main () {
    Gl_Position = ~~~
  }
# Endif

# Ifdef FS
  Void main () {
    Gl_FragColor = ~~~
  }
# Endif
```

This is because there is no precision qualification of float because `verting vec2 vValue` used for both vertex shader and fragment shader is at the beginning, which is a problem.
Originally, you need to write `precision float mediump` before the variable declaration of any other` float 'of the fragment shader.
However, if you simply write `precision mediump float;` at the beginning, you will get an error because it will be loaded by VS as well.
Therefore, `FS_PREC macro` and 'VS_PREC macro' are prefixed to the beginning of the shader.

Each definition is as follows.

```glsl
# Ifdef FS
  #define FS_PREC (prec, type) precision prec type;
  #define VS_PREC (prec, type)
# Endif
#ifdef VS
  #define VS_PREC (prec, type) precision prec type;
  #define FS_PREC (prec, type)
# Endif
```

In other words, if you write `FS_PREC (mediump, float)` at the beginning of the shader file, mediump precision will be used only when it is actually a fragment shader.

### uniform variable

Both uniform and attribute variables have annotations and semantics.
For the time being, leave a comment on the meaning, for example, the following description.

```glsl
@ MODELVIEWPROJECTION
Uniform mat4 matrix MVP;

@ HAS_TEXTURE {sampler: "theTexture"}
Uniform bool usingTexture;

Uniform sampler 2D theTexture;

@ {Default: "yellow", type: "color"}
Uniform vec3 theColor;
```

In other words, it has the following form as grammar.

```glsl
@ Semantics {annotation}
Uniform or attribute type name variable name;//here is a regular GLSL variable definition
```

** Both semantics and annotations can be omitted. ** If omitted, the semantics is `USER_VALUE` (with exceptions, details are described below), the annotation is empty. In the above example, both `theTexture` are omitted.
** Only semantics can be omitted ** If omitted, the semantics is `USER_VALUE` (with exceptions, details are described below), the annotation is empty. In the above example, `theColor` has only semantics omitted.
** Only annotations can be omitted ** If omitted, it is empty. In the above example, only the annotation of `matrix MVP` has been omitted.

#### Semantics

Semantics refers to what should be assigned to that variable.
For example, if the semantics is described as `MODELVIEWPROJECTION`, that variable will be passed the Model - View - Projection matrix of the target mesh being drawn.
When the semantics is `VIEWPORT`, the current viewport information is passed to that variable.

The register function responsible for passing variables is determined beforehand by semantics and executed before the path is drawn.

The following is a list of the semantics defined in the default state.
(Most of this is the specification of `glTF` in the runtime model format (https://github.com/KhronosGroup/glTF/tree/master/specification/1.0# semantics) itself. Actually, the internal material The preservation form of it is kept very close to the specification of glTF.)

##### same specification as glTF

| Semantic | Type | Description |
|:----------------------------:|:------------:|-------------|
| `LOCAL` |` FLOAT_MAT4` | Transforms from the node's coordinate system to its parent's. This is the node's matrix property (or derived matrix from translation, rotation, and scale properties). |
| `MODEL` |` FLOAT_MAT4` | Transforms from model to world coordinates using the transformers node and all of its ancestors.
| `VIEW` |` FLOAT_MAT4` | Transforms from world to view coordinates using the active camera node.
| `PROJECTION` |` FLOAT_MAT4` | Transforms from view to clip coordinates using the active camera node. |
| `MODELVIEW` |` FLOAT_MAT4` | Combined `MODEL` and` VIEW`.
| `MODELVIEWPROJECTION` |` FLOAT_MAT4` | Combined `MODEL`,` VIEW`, and `PROJECTION`.
| `MODELINVERSE` |` FLOAT_MAT4` | Inverse of `MODEL`. |
| `VIEWINVERSE` |` FLOAT_MAT4` | Inverse of `VIEW`.
| `PROJECTIONINVERSE` |` FLOAT_MAT4` | Inverse of `PROJECTION`. |
| `MODELVIEWINVERSE` |` FLOAT_MAT4` | Inverse of `MODELVIEW`. |
| `MODELVIEWPROJECTIONINVERSE` |` FLOAT_MAT4` | Inverse of `MODELVIEWPROJECTION`. |
| `MODELINVERSETRANSPOSE` |` FLOAT_MAT 3` | The inverse-transpose of `MODEL` without translation. This translates normals in model coordinates to world coordinates.
| `MODELVIEWINVERSETRANSPOSE` |` FLOAT_MAT3` | The inverse-transpose of `MODELVIEW` without this translation. This translates normals in model coordinates to eye coordinates.
| `VIEWPORT` |` FLOAT_VEC4` | The viewport's x, y, width, and height properties stored in the `x`,` y`, `z`, and` w` components, respectively. For example, this is used to Scale window coordinates to [0, 1]: `vec2 v = gl_FragCoord.xy/viewport.zw;` |

##### Other than that

| Semantic | Type | Description |
|:----------------------------:|:------------:|-------------|
| `TIME` |` FLOAT` | time (in ms) |
| `HAS_TEXTURE` |` BOOL` | Whether valid textures are assigned to the specified sampler, see below for details |
| `USER_VALUE` |` ANY` | Details are described below |

#### Annotation

Register functions are determined by semantics, but other arguments may be required.
For example, the `HAS_TEXTURE` semantics requires an argument` sampler` in the annotation. This `HAS_TEXTURE` annotation is assigned a value that determines whether a valid texture has been assigned to a variable named by` sampler`.

```glsl
@ HAS_TEXTURE {sampler: "theTexture"}
Uniform bool usingTexture;

Uniform sampler 2D theTexture;
```

In the above example, it is passed only when a valid texture is assigned to theTexture.

Thus, the annotation is the set of arguments the register function uses when actually allocating. Annotation takes the form `JSON`, but the ** key name` `` is optional **

### USER_VALUE semantics

This semantics indicates that this uniform variable is a variable exposed to GOML.
For example, this is the example of `color` described at the beginning of this article. Indicates that values ​​are passed from GOML to material, such as `material` attribute of` <mesh> `.

For example, if the uniform variable `test` with` USER_VALUE` semantics specified is of type `float`,

```glsl
@ USER_VALUE
Uniform float test;
```

, This value will be exposed to `<mesh>` or `<material>`. Which is exposed differs depending on how you specified `material`.
If specified in the form `new (~~)` ** the mesh itself **, if specified in query form ** material tag **.

#### Converter and default annotation

As with `attribute` in any other` GOML`, since `grimoire` internally converts the value passed by the user, the actual value is obtained via the converter.
Which converters are used is determined by ** variable type **, ** annotation **, ** array or not **.

Also, variables specified with `USER_VALUE` semantics can accept` default` annotations.
If no value is specified from the GOML side, this value will be passed ** after passing the ** converter.

In addition, if not specified by the GOML side and not specified by the `default` annotation, if` USER_VALUE` semantics are specified, the default value depending on each type is passed.

That is,

```
   Specified value by GOML> default annotation> default value determined by type
```

Values ​​are resolved by.

| GLSL Variable type | Converter | Default value | Remarks |
|:----------------------------:|:------------:|:-------------:|:---:|
| Float | Number | 0 ||
| Vec 2 | Vector 2 | (0, 0) ||
| Vec3 | Vector3 | (0,0,0) | `type` when the annotation is not` color` |
| Vec3 | Color3 | white | When the `type` annotation is` color` |
| Vec4 | Vector4 | (0,0,0,0) | `type` if the annotation is not` color` |
| Vec4 | Vector4 | white (a = 1) | `type` when the annotation is` color` |
| Bool | Boolean | false ||
| Int | Number | 0 ||
| Ivec 2 | Vector 2 | (0, 0) ||
| Ivec 3 | Vector 3 | (0, 0, 0) ||
| Ivec 4 | Vector 4 | (0, 0, 0, 0) ||
| Sampler2D | Texture | white 1 * 1 texture ||
| Mat4 [] | Object | [0 ... 0] | type can use array of Float32Array or Number |

The types not in this list are currently unsupported. However, since there are also many things you need, the corresponding range will be gradually expanded.

#### Default Semantics

For convenience and to maintain ease of updating from libraries under `v0.10`, the following variable names default to the following semantics.


| Variable name | Semantics |
|:-:|:-:|
| _time | TIME |
| _viewportSize | VIEWPORT_SIZE |
| _ Mat L | LOCAL |
| _matM | MODEL |
| _ Mat V | VIEW |
| _matP | PROJECTION |
| _matVM | MODELVIEW |
| _matPVM | MODELVIEWPROJECTION |
| _matIM | MODELINVERSE |
| _ Mat IV | VIEWINVERSE |
| _matIP | PROJECTIONINVERSE |
| _matIVM | MODELVIEWINVERSE |
| _matIPVM | MODELVIEWPROJECTIONINVERSE |
| _matITM | MODELINVERSETRANSPOSE |
| _matITVM | MODELVIEWINVERSETRANSPOSE |


### attribute variable

#### semantics of attribute variable

Like the `uniform` variable, the` attribute` variable also has semantics.
This semantics exists to determine which `attribute` variable to use which buffer in the geometry.

For example, the geometry of all primitives holds `POSITION`,` NORMAL`, `TEXCOORD` buffers. (If this was not the case, if there was someone who made geometry by yourself.)

```glsl
@ POSITION
Attribute vec3 value;
```

If you write it, the `POSITION` buffer of the geometry will be bound to this` value`.

#### Default Semantics

For convenience and to maintain ease of updating from libraries under `v0.10`, the following variable names default to the following semantics.

| Variable name | Semantics |
|:-:|:-:|
| Position | POSITION |
| Normal | NORMAL |
| TexCoord | TEXCOORD |

In other words, the following two codes have the same meaning.

```glsl
@ POSITION
Attribute vec3 position;
```

```glsl
Attribute vec3 position;
```

### @import statement

Shaders in Sort can reference external files.
`@ Import` is like` #include` in C ++. However, we do not do anything special, but simply insert the referenced script file at the specified position.


**grammar**

```
@import ("file path")
```

Those that can be accepted as file paths are absolute paths and relative paths. It works as a general URL.
Also, if you do not want to increase external requests, but there is a common script, use a specific alias for this file path and actually solve `@ import 'without code already included in the program I can.

In this case, you can implement this by requiring `grimoirejs/lib/Material/ImportResolver` to obtain a reference to the ImageResolver constructor and describe it as follows.

```
    ImportResolver.addAliasToStatic ("ThisIsAlias", "some code");
```

In this way, if you encounter the expression `@ import (" ThisIsAlias ​​")` this code will be inserted and will not attempt to resolve to the outside.

## Operation of the gl state

Depending on the material, you need to manipulate the state of gl. For example, if you wish to synthesize with a material, add `gl.blendFunc (gl.ONE, gl.ONE)` `before summing and doing addition synthesis.
(For blending, you can use [this tool](http://www.andersriggelsen.dk/glblendfunc.php) to improve your understanding.)

In this way, when you call a function that manipulates a specific gl state before executing a path, it is possible to describe the syntax as follows.

```
@ Pass {
  @ BlendFunc (ONE, ONE)
 //Write a shader here
}
```

Available gl functions are as follows.

* [BlendFunc](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc)
* [BlendFuncSeparate](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate)
* [BlendEquation](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation)
* [BlendEquationSeparate](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquationSeparate)
* [BlendColor](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendColor)
* [ColorMask](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask)
* [CullFace](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace)
* [DepthFunc](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc)
* [DepthRange](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthRange)
* [FrontFace](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace)
* [LineWidth](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth)
* [PolygonOffset](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset)
* [Scissor](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor)

Also, even if you do not specify them, the initial value is read. These initial values ​​are as follows.

```js
{
  BlendFuncSeparate: [WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA],
  BlendEquationSeparate: [WebGLRenderingContext.FUNC_ADD, WebGLRenderingContext.FUNC_ADD],
  BlendColor: [0, 0, 0, 0],
  CullFace: [WebGLRenderingContext.BACK],
  LineWidth: [1],
  FrontFace: [WebGLRenderingContext.CCW],
  DepthRange: [0, 1],
  DepthFunc: [WebGLRenderingContext.LESS]
}
```

You can also switch the validity and invalidity of GL functions that are not enabled.

```glsl
@ Pass {
  @ Disable (CULL_FACE)
 //Write a shader here
}
```

In this way, culling will be invalid. (Equivalent to `gl.disable (gl.CULL_FACE)`)
In other words, the back side will also be drawn.

On the other hand, you can enable stencil test by writing as follows. (Same as doing `gl.enable (gl.STENCIL_TEST)`)

```glsl
@ Pass {
  @ Enable (STENCIL_TEST)
 //Write a shader here
}
```

These as well as the state of gl have an initial value and the following are specified as enabled by default.

* CULL_FACE
* DEPTH_TEST
* BLEND

## Other syntax

### macro

Normally, GLSL uses C-derived preprocessors such as `# define` and` # ifdef`.
In Grimoire.js, it is possible to dynamically change this macro according to the change on GOML side.

For example, if the following declaration exists in the path,

```glsl
@ExposeMacro (bool, useTexture, USE_TEXTURE, false)
```

`# Define USE_TEXTURE false` and` #define USE_TEXTURE true` are inserted in the shader's sentence by the `useTexture` attribute on GOML side.
It is apparently the same as the material's `USER_VALUE` variable, but because it recompiles the shader when it is changed, it is not used for variables with too many changes.
However, it takes effect in places where only constants are used in GLSL, such as the size of the array and the number of for loops.

Also, the first argument of `@ ExposeMacro` is a type, which determines the converter on the GOML side, but only` bool` and `int` are passed by the` Boolean` converter, `Number` converter respectively . Please be aware that it is not compatible with other converters.

# Technique description

Technique is a mechanism to keep multiple drawing types in a material.

```glsl
@ Technique Technique name {
  @ Pass {
    ...
  }

  @ Pass {
    ...
  }
}
```

It takes the following syntax.

** If Technique is omitted and Pass is described, its Technique name will be default **

For example, suppose you have the following material.

```glsl
@ Technique T1 {
  @ Pass {
    ...
  }
  @ Pass {
    ...
  }
}

@ Technique T2 {
  @ Pass {
    ...
  }
  @ Pass {
    ...
  }
}
```

In this case, if you specify it with a `<renderer>` tag like this:

```xml
<Renderer>
  <Render-scene technique = "T1"/>
  <Render-scene technique = "T2"/>
</Renderer>
```

In this case, after drawing all the scene elements with the `T1` technique, draw all the scene elements with the` T2` technique.
Usually, since the `default` technique is used, there is no problem without specifying a technique.

However, if you repeat drawing more than once on the same mesh, such as deferred shading, this notation will show great power.

## drawing order

When you want to use a shader as a background, you may want to manipulate the drawing order by Grimoire.js, such as those that you want to draw first, or do not write to depth values.

```glsl
@ Technique default {
  @ DrawOrder (NoAlpha)
  @ Pass {
    ...
  }
  @ Pass {
    ...
  }
}
```

If you write it like this, you can say that the order in which this technique is drawn is `NoAlpha`.

** Please be careful that you can not specify it for each pass **

The drawing order that can be specified by default is as follows.

| Drawing order name | Priority | Draw from a long distance |
|:-:|:-:|:-:|
| Background | 1000 | never |
| NoAlpha | 2000 | never |
| UseAlpha | 3000 | To |
| NoDepth | 4000 | To |
| Overlay | 5000 | To |

That is, when a technique is drawn, materials with the same technique are rendered based on this rendering order.
Also, in the case of drawing order to be drawn from a distance, the drawing order takes precedence when it is in the same drawing order, and from the closer side when not drawing it.

Normally, when using alpha values, it will become invisible if you do not draw from a distance, but if you do not use it, you should improve performance usually because there are more pixels that are drawn from nearby because of the depth test.

# Extension

In this section we discuss each extension method for the default handling defined above.

# Add the semantics of the new Uniform variable

To add the semantics of the new Uniform variable we use the `UniformResolverRegistry` class.

Import as follows.

```javascript
Import UniformResolverRegistry from "grimoirejs-fundamental/ref/Material/UniformResolverRegistry";
```

Alternatively,

```javascript
Var UniformResolverRegistry = gr.lib.fundamental.Material.UniformResolverRegistry;
```

We also use the `UniformResolverRegistry.add` method.

```javascript
UniformResolverRegistry.add ("new semantic name", a function that returns a variable register);
```

For example,

```javascript
UniformResolverRegistry.add ("New Semantics Name", (valInfo) => {
  Return (proxy, args) => {
    Proxy.uniformFloat (valInfo.name, 0);
  };
});
```

If you describe something like this, 0 will be substituted for this semantic.

For example, this extensibility is very useful, such as making it possible to take audio variables.
In reality the following code will be very helpful.

https://github.com/GrimoireGL/grimoirejs-fundamental/tree/master/src/Material/Uniforms
