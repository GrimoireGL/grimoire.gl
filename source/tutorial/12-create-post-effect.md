---
Type: doc
Title: Create a post effect
Order: 12
---

## Overview

Using the material described in the previous chapter, you can apply post effects and apply effects to images.
In this case, customize the behavior of the renderer by the tag written in the contents of the `<renderer>` tag.

For example, the following example is a code that only inverts the color of the input image and outputs it.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t12-01" allowfllscreen> </ iframe>

### What is in the renderer tag

The contents of the contents of the renderer tag are mainly classified into two.

* Renderer - a tag representing the task of rendering as \ *
* Texture-buffer / render-buffer Tag that represents the texture for the render destination

For example, in the above example, the `<renderer>` tag is described as follows.

```xml
<Renderer>
  <Texture-buffer name = "bb1" />
  <Render-quad material = "new (render-image)" source = "./ img 2.jpg" out = "bb 1" />
  <Render-quad material = "new (negate)" source = "backbuffer (bb 1)" />
</ Renderer>
```

#### texture-buffer tag

The `<texture-buffer>` tag means the color buffer associated with the renderer. Define a texture for the back buffer associated with a specific name with the `name` attribute.
The texture registered with this tag can be passed from the tag side to the variable of type `sampler2D` in the rendering done by this renderer by` backbuffer (texture-buffer name) `.


#### render-quad tag

The `<render-quad>` tag is one of the renderer's tasks, drawing with the material with the `quad` element specified. When an `out` element is specified, it draws on that target.
