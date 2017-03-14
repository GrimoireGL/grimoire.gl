---
Type: doc
Title: Authoring of materials
Order: 11
---

## Overview

Grimoire.js's fundamental plug-in includes powerful material creation and import functions.
This allows shader authors to create and publish materials with minimal effort,
The user can import it immediately and use it with the tag based interface.

This chapter explains the creation of materials using shaders. Therefore, the GLSL grammar is somewhat premised
There are many explanations to become.
** If you have never touched the GLSL, readers who do not know what it is like to call `ShaderToy` etc.
We strongly recommend using GLSL by using it. **

## Sort file

The format of the shader file in this library is described by SORT (sole) which extends GLSL.
For GLSL alone, describe multiple shaders (vertex shader or fragment shader)
It can be used for the first time by operating from javascript etc, but by using this SORT,
`Multipass rendering`, `manipulate GL state`, `set initial value of uniform variable`, `import external file`
And so on.

### Sort file grammar

The following is an example of a simple sort file.

```glsl
@ Pass
@ BlendFunc (ONE, ONE)
FS_PREC (mediump, float)

#ifdef VS
  Attribute vec3 position;

  Uniform mat4 _matPVM;

  Void main () {
    Gl_Position = _ matPVM * vec 4 (position, 1);
  }
# Endif

# Ifdef FS
  @ {Type: "color", default: "# 381794"}
  Uniform vec4 color;

  Void main () {
    Gl_FragColor = color;
  }
# Endif

```

If you are familiar with normal shaders, you will find that the above code is built by

* Regular GLSL code
* Normal GLSL macros
* Sentences starting with `@`

** Let's touch * 1 **

First read the code above and read the following code and write it as a uniform variable in the material
Let's see that `color` being manipulated can be manipulated from the material tag.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t11-01" allowfllscreen> </ iframe>

### uniform variable of sort

The sort uniform variable is roughly divided into two according to the way of assigning the variable name.

* User Uniform variable
* Environmental Uniform variable

Variables are ** User Uniform variables **, variables beginning with `_` ** ** are ** environment Uniform variables **.

For example, in the code example above, `color` is ** user Uniform variable ** and` _matPVM` is ** environment Uniform variable **.

Also, by writing JSON which begins with @ at the top of variable declaration for both types of uniform variable, additional information such as `initial value` and `setting` can be connected to the variable. This additional information is called ** annotation **.

Example:

```glsl
  @ {Type: "color", default: "# 381794"}
  Uniform vec4 color;
```

> Annotation JSON
>
> Annotation JSON has been parsed by the JSON 5 library. Therefore, ```in the key part can be omitted.

#### Environment Uniform Variable

The environment Uniform variable is used when plugins etc. automatically assign values ​​to shaders according to variable names.
`Fundamental` itself also defines a number of variables that will have many opportunities to exploit this feature.

> Representative environment of grimoirejs-fundamental environment Uniform variable
>
> | Variable type | Variable name | Content |
> | -: -: |: -: |: -: |
> | Float | \ _time | Grimoire.js Time since reading |
> | Vec2 | \ _viewportSize | Viewport size to be rendered (px unit) |
> | Mat4 | \ _ matM | model matrix |
> | Mat4 | \ _ matV | view matrix |
> | Mat4 | \ _ matP | projection matrix |
> | Mat4 | \ _ matPV | projection \ * view matrix |
> | Mat4 | \ _ matVM | view matrix \ * model matrix |
> | Mat4 | \ _ matPVM | Projection matrix of model to be rendered \ * View matrix \ * Model matrix |
> | Vec3 | \ _ cameraPosition | camera coordinates (world coordinate system) |
> | Vec3 | \ _ cameraDirection | camera orientation (world coordinate system) |
>
> For details, [sort shader] (https://grimoire.gl/guide/sort.html) is helpful.

#### User Uniform Variable

User Uniform variables are used to assign values ​​that users can interact with through tags to shaders.
(In general, adjustment variables and Gaussian distribution coefficient arrays that the user will not tamper with are created here and assigned from the component.)

The user Uniform variable can have an initial value. In this case, put the default value in the default element of the annotation of the target uniform variable.

Specification of the value on the tag side is done by the converter of the corresponding type.

For example, to a uniform variable of type `sampler2D` you can read the file path to the texture from the tag side.

Please refer to [sort shader] (https://grimoire.gl/guide/sort.html) for the detailed explanation such as what the converter corresponding to each type will be.

> Vec3, vec4 type converter
>
> For vec3, vec4 type, a vector type converter is specified by default.
> That is, designation of `1, 2, 3` and specification such as` n (1,2,3) `are possible, but since it is not a color converter, designation of` red` or `# 330000` Can not.
>
> However, if `type:" color "` is specified for the annotation of vec3, vec4, the converter used will be for color specification.

### sort's attribute variable

The attribute variable is used from the one registered as the buffer of the same name in the geometry.
Primitives that are registered by default have the following initialization buffer.

| Variable type | Variable name | Contents |
|: -: |: -: |: -: |
| Vec3 | position | vertex coordinates of model space |
| Vec3 | normal | Model space normals (normalized) |
| Vec3 | texCoord | texture coordinates |

** Let's touch it 2 **

The following example uses several functions with reference to the above explanation.

Let's try using different variables and changing initial values ​​and actually trying.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t11-02" allowfllscreen> </ iframe>

### Preferences

When shaders are used, sometimes they do not work unless there is an appropriate gl state setting. Therefore, in the sort shader, you can specify the setting of the gl state inside the shader.

Those which take the form of `@ preference name (argument ...)` other than `@ Pass` is called ** preference **.

These have functions such as giving settings to GL state when drawing a path. The following are predefined preferences.

#### The same as the WebGL API

* BlendFunc
* BlendFuncSeparate
* BlendEquation
* BlendEquationSeparate
* CullFace

They have the same argument list as the function of WebGL of the same name, and you can designate the processing by the same specification.

For example, drawing is done with material written as `@ CullFace (FRONT)`, the front is culled.

** Let's touch * 3 **

The following example is a blend setting from SORT. Let's try experimenting with different settings.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t11-03" allowfllscreen> </ iframe>

#### Publishing Macro Values

There are cases where you want to dynamically rewrite shader macros in the case of variables that can not be passed by uniform variables alone, such as the number of loops.
In such a case, using the `@ ExposeMacro` preference makes it possible to manipulate the value of a particular macro from the tag side.

```glsl
  @ExposeMacro (type, GOML side attribute name, macro name, initial value)
```

Currently two types are available as types:

* Int
* Bool

When bool is specified, the only valid values ​​for the initial value are true or false. If int is specified, an integer can be specified. (Truncated if decimal is specified)

For example, specify as follows.
```glsl
@ExposeMacro (int, loopCount, LOOP_COUNT, 5)
@ExposeMacro (bool, useTexture, USE_TEXTURE, true)
```

Also, in the above example, if no value exists in the tag in particular, the following macro is inserted.

```glsl
  #define LOOP_COUNT 5
  #define USE_TEXTURE
```

** Note that the value of bool type is expressed not by its value but by the presence or absence of a flag. **

In the following example, the normals of the spheres are drawn, but it is possible to set whether the calculation method of the normal is to be world space or view space from the tag side.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t11-05" allowfllscreen> </ iframe>

### Multipass Rendering

In a shader of drawing an edge, the target image may not be obtained with only one drawing. At that time, it is necessary to draw a plurality of times (multipass rendering).

In the commentary so far, only the part necessary for the description of single drawing (single pass) is explained, but in SORT, it is possible to describe multiple drawing in one shader.

The `@ Pass` directive of SORT is a grammar for considering from the end to the next` @ Pass `as one pass.
Each drawing (pass) is rendered in order from the top.

** Let's touch * 4 **
For example, in the following example, it is a sample that writes edges by `drawing a little in front by culling and then` drawing on the back with culling on the back.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t11-04" allowfllscreen> </ iframe>
