---
Type: doc
Title: grimoirejs-fundamental
Order: 2
---
# Overview



# Install

```sh
$ Npm install grimoirejs-fundamental - save
```

CDN by [unpkg.com](https://unpkg.com) is also available.

** [CDN - grimoirejs - fundamental -](https://unpkg.com/grimoirejs-fundamental/register/grimoire-fundamental.js) **

A list

## node

  | Node name | Description |
  |: -: |: -:: |
  | [`<Goml>`](# goml node) | Route node of GOML file |
  | [`<Scene>`](# scene node) | A node for including settings of scenes such as placement of models on a 3D space and setting of cameras |
  | [`<Object>`](# object node) | Node that means an object in 3D space |
  | [`<Camera>`](# camera node) | camera node for taking 3D space |
  | [`<Mesh>`](# mesh node) | Model such as 3D space, etc. ** Node to represent ** *
  | [`<Renderer>`](# renderer node) | Node for specifying the canvas drawing method |
  | [`<Geometry>`](# geometry node) | Node for generating a new shape |
  | [`<Texture>`](# texture node) | node for explicitly reading the texture |
  | [`<Material>`](# material node) | node for explicitly reading material |
  | [`<Import-material>`](# import-material node) | Node for reading new materials from outside |
  | [`<Texture-buffer>`](# texture-buffer node) | node for generating texture for color buffer |
  | [`<Render-buffer>`](# render-buffer node) | node for generating `renderbuffer` for depth buffer/stencil buffer |
  | [`<Render-scene>`](# render-scene node) | Node to represent the rendering procedure to render the scene |
  | [`<Render-quad>`](# render-quad node) | Node for rendering a single rectangle with a specific material |

##

  | Component name | Description |
  |: -: |: -:: |
  | [`<AssetLoadingManagerComponent>`](# AssetLoadingManagerComponent component) | Component responsible for loading assets. It controls display of the loader. |
  | [`<CameraComponent>`](# CameraComponent component) | Component of the camera that renders the scene |
  | [`<CanvasInitializerComponent>`](# CanvasInitializerComponent component) | Component responsible for canvas initialization and configuration |
  | [`<ClickableMeshComponent>`](# ClickableMeshComponent component) ||
  | [`<FullscreenComponent>`](# FullscreenComponent component) | Component that manages the full screen state |
  | [`<GeometryComponent>`](# GeometryComponent component) | Component for generating geometry |
  | [`<GeometryRegistoryComponent>`](# GeometryRegistoryComponent component) | Component that manages the geometry |
  | [`<HTMLBinderComponent>`](# HTMLBinderComponent component) | (Deprecated) Component for synchronizing Transform with DOM element |
  | [`<LoopManagerComponent>`](# LoopManagerComponent component) | A component that manages the entire loop. There is nothing to be touched directly by the user. |
  | [`<MaterialComponent>`](# MaterialComponent component) ||
  | [`<MaterialContainerComponent>`](# MaterialContainerComponent component) | Component for managing attributes to materials and materials |
  | [`<MaterialImporterComponent>`](# MaterialImporterComponent component) | Component for reading the material configuration file |
  | [`<MouseCameraControlComponent>`](# MouseCameraControlComponent component) ||
  | [`<RenderBufferComponent>`](# RenderBufferComponent component) ||
  | [`<RendererComponent>`](# RendererComponent component) ||
  | [`<RendererManagerComponent>`](# RendererManagerComponent component) | Component for managing all renderers |
  | [`<RenderHitareaComponent>`](# RenderHitareaComponent component) ||
  | [`<RenderQuadComponent>`](# RenderQuadComponent component) ||
  | [[<RenderSceneComponent> `](# RenderSceneComponent component) ||
  | [`<SceneComponent>`](# SceneComponent component) | Component for performing related processing within a specific scene |
  | [`<TextureBufferComponent>`](# TextureBufferComponent component) ||
  | [`<TextureComponent>`](# TextureComponent component) ||
  | [`<TimeComponent>`](# TimeComponent component) ||
  | [`<TransformComponent>`](# TransformComponent component) | Component responsible for deformation of objects present in the scene |

## converter

  | Converter Name | Description |
  |: -: |: -:: |
  | [`CanvasSizeConverter`](# CanvasSizeConverter converter) | Converter for canvas size |
  | [`GeometryConverter`](# GeometryConverter converter) | Converter to specify geometry |
  | [`MaterialConverter`](# MaterialConverter converter) | Converter for specifying material |
  | [`NodeConverter`](# NodeConverter converter) ||
  | [`TextureConverter`](# TextureConverter converter) | Converter for obtaining reference to texture |
  | [`ViewportConverter`](# ViewportConverter converter) | Converter for setting viewport size |

# Node details


## goml node


Root node of GOML file
A node for keeping only one necessary component etc in the tree.
In particular, along with components for receiving initial initialization parameters, such as `<canvas>` initialization and loop management,
Contains components such as `<canvas>` setting (`width` or` height`) or fullscreen.

### Component

* CanvasInitializer
* LoopManager
* AssetLoadingManager
* GeometryRegistory
* RendererManager
* Fullscreen


## scene node


A node for including scene settings such as arrangement of a model in a certain 3D space and setting of a camera
It is a node for placing in the space such as camera, light, mesh etc.
Nodes that can have coordinates that exist in all scenes (nodes that contain `TransformComponent`) must exist as child nodes of this node.

### Component

* Scene


## object node


A node meaning an object in 3D space
It is the base node of mesh and camera. Child elements of this node will propagate the amount of transformation (`position` or` rotation`) of the parent element.
For details, refer to `TransformComponent`.

### Component

* Transform


## ## camera node

** Inherited from: & lt; object & gt; **

A node of a camera for shooting 3D space
It is a node meaning a camera to shoot 3D space. At least one camera must belong to the scene to render the scene.

### Component

* Camera


## mesh node

** Inherited from: & lt; object & gt; **

A model such as a 3D space model, etc. ** A node for representing **
It is a node that means what appears in 3D space. At least one mesh must belong to the scene to capture something in the scene.
Mesh consists of material (material) and geometry (shape). By changing these two specifications, various expressions become possible in 3D space.

### Component

* MaterialContainer
* MeshRenderer


## renderer node


A node for designating a canvas drawing method
This is a node to show how to draw the area on the canvas. If none of goml's loads are present, they are automatically created directly under goml.
By including one or more renderers, you can render multiple areas of the canvas.
Also, the `<render-XXX>` node specified for this child element determines how to draw that area.
Normally, `<render-scene>` tags are automatically generated if there is nothing in the child node of `<renderer>`.

### Component

* Renderer


## geometry node


A node for generating a new shape
It is a node to explicitly generate another shape that you want to specify simple deformation (not only `scale`,` position`, `rotation`), such as the number of divisions of a circle.

### Component

* Geometry


## texture node


A node for explicitly reading a texture
Node for reading texture. Normally textures are read by specifying url as material,
If you want to specify sampler etc., you can load by explicitly reading with this tag.

### Component

* Texture


## material node


Node for explicitly reading material
A node for generating material. By referring to this node from the mesh, you can make multiple meshes refer to instances of common material.
This not only allows you to edit the value of the material at the same time, it also brings significant performance advantages.

### Component

* Material


## import-material node


Node for reading new material from outside
This is a node for reading a new kind of material from the material file (* .sort) of Grimoire.js.

### Component

* MaterialImporter


## texture-buffer node


Node for generating texture for color buffer
It is one of the nodes that can be included directly under the `<renderer>` node.
This node can generate a color buffer for rendering.
The color buffer can be used in various aspects such as use for off-screen rendering etc.

### Component

* TextureBuffer


## ## render-buffer node


Node for generating `renderbuffer` for depth buffer/stencil buffer
It is one of the nodes that can be included directly under the `<renderer>` node.
This node can generate depth buffer and stencil buffer for rendering.

### Component

* RenderBuffer


## render-scene node


A node for representing a rendering procedure for rendering a scene
It is one of the nodes that can be included directly under the `<renderer>` node.
This node draws the contents of the scene against the texture specified as `out` (by default the canvas itself).

### Component

* RenderScene
* RenderHitArea


## render-quad node


Node for rendering a single rectangle with a specific material
It is one of the nodes that can be included directly under the `<renderer>` node.
This node draws a simple rectangle (`quad`) with the specified material for the texture specified as` out` (default on the canvas itself).

### Component

* MaterialContainer
* RenderQuad




# Component details


## AssetLoadingManagerComponent component


A component that controls the loading of assets. It controls display of the loader.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| LoadingProgress | Number | The current read status is represented by 0 - 1. |
| AutoStart | Boolean | Whether to automatically start the rendering loop after loading the resource |
| EnableLoader | Boolean | Whether loading screen is displayed when loading resources |


#### loadingProgress attribute

** Initial value ** ... `0`
** Converter ** ... `Number`



The current reading status is represented by 0 - 1.


#### autoStart attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`

Whether to automatically start the rendering loop after loading the resource


#### enableLoader attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`

Whether to display the loading screen when loading resources



## ## CameraComponent component


Component of the camera that draws the scene
This component adjusts distortion such as perspective projection and square projection.
Also, `Transoform` belonging to the node to which this component belongs establishes the position and orientation of the camera.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Fovy | Angle2D | Viewing angle of the camera. |
| Near | Number | The closest distance shown in the camera. |
If | far | Number | far - near is too large, there is a possibility that Z - fighting (appearing as if the object in front is displayed behind) phenomenon may occur. |
| Aspect | Number | Aspect ratio of camera |
| AutoAspect | Boolean | Whether automatic aspect ratio adjustment is enabled |
| OrthoSize | Number | horizontal reference size when orthogonal projection |
| Orthogonal | Boolean | If this attribute is false, the camera renders the scene as perspective projection. In this case, parsing (sense of depth) appears in the rendering result. |


#### fovy attribute

** Initial value ** ... `45 d`
** Converter ** ... ... `Angle2D`

Viewing angle of the camera.
This attribute is ignored if the orthogonal attribute is true.


#### near attribute

** Initial value ** ... 0.01 `
** Converter ** ... `Number`

It is the closest distance reflected on the camera.
It must be greater than 0 and less than the far attribute.


#### far attribute

** Initial value ** ... `100`
** Converter ** ... `Number`



If the value of far - near is too large, there is a possibility that Z - fighting (appearing as if the object in front is displayed in the back) phenomenon occurs.
When this difference is too large, the difference in the value of the small z coordinate of the coordinates of the object appearing in the camera is approximated to zero.
Conversely, when this value is small, objects displayed in the camera are displayed with no problem even if the difference in z coordinate is small to some extent.
** The important thing is not to make it wastefully larger than the space you want to copy. You should always set an appropriate value **


#### aspect attribute

** Initial value ** ... `1.6`
** Converter ** ... `Number`

Aspect ratio of camera
Specify the ratio of the size of the camera to the size of the camera in the horizontal direction. When the autoAspect attribute is true, this value is automatically adjusted at every rendering.


#### autoAspect attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`

Whether automatic adjustment of the aspect ratio is effective or not
Indicates whether to automatically adjust the ratio according to the size of the viewport when rendering.


#### orthoSize attribute

** Initial value ** ... `100`
** Converter ** ... `Number`

Horizontal reference size during orthographic projection
During orthographic projection, you can not determine the area to be automatically photographed using the fovy attribute.
Therefore, specify the size of the horizontal piece with this attribute. ** Please note that the aspect ratio is used for calculation. **


#### orthogonal attribute

** Initial value ** ... `false`
** Converter ** ... `Boolean`



If this attribute is false, the camera renders the scene as perspective projection. In this case, parsing (sense of depth) appears in the rendering result.
On the other hand, if this attribute is true, the camera will render the scene as orthographic projection. In this case, there is no sense of depth in the rendering result.



## ## CanvasInitializerComponent component


Component responsible for initializing and setting the canvas
This component initializes the WebGL context by initializing `<canvas>` in the proper position.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Width | CanvasSize | Specifies the width of the canvas tag. |
| Height | CanvasSize | Specifies the vertical width of the canvas tag. |
| ContainerId | String | Specifies the id to assign to the container of the direct parent element of the canvas element. |
| ContainerClass | String | Specifies the class name to assign to the container of the direct parent element of the canvas element. |
| PreserveDrawingBuffer | Boolean | When rendering results are converted to dataURL etc. If this attribute is not true, rendering result can not be acquired normally. |
| Antialias | Boolean | This attribute can not be changed dynamically in the middle. |


#### width attribute

** Initial value ** · · · `fit`
** Converter ** ... `CanvasSize`

Specify the width of the canvas tag.


#### height attribute

** Initial value ** · · · `fit`
** Converter ** ... `CanvasSize`

Specify the vertical width of the canvas tag.


#### containerId Attribute

** Initial value ** ... ... `(Empty string)`
** Converter ** ... `String`

Specify the id to assign to the container of the direct parent element of the canvas element.


#### containerClass attribute

** Initial value ** ... `gr-container`
** Converter ** ... `String`

Specifies the class name to assign to the container of the direct parent element of the canvas element.


#### preserveDrawingBuffer attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`



When rendering result is converted to dataURL etc, rendering result can not be acquired normally unless this attribute is true.


#### antialias attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`



This attribute can not be changed dynamically in the middle.



## ClickableMeshComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |



## FullscreenComponent component


Component that manages full screen state
It manages the full screen state etc. of the canvas managed by Grimoire.js (precisely its parent container).
(It is possible to make other elements full screen, but it is usually used for DOM elements including the canvas generated by this Grimoire.js.)
Also note that it is a function that does not work with some older browsers.
Also, the `fullscreen` attribute must be dynamically ** true on a call from an event involving a user's interaction, such as a mouse event.
It is impossible due to WebAPI restriction to set the canvas to the full screen state at the initial state by setting it to true from the beginning.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Fullscreen | Boolean | When this flag is set to true, it must ** be changed by **, a call from an event with user interaction such as mouse event etc. |
If fullscreenTarget | String | null is specified, the parent element of the canvas is used. |


#### fullscreen attribute

** Initial value ** ... `false`
** Converter ** ... `Boolean`



When this flag is set to true, it must ** be changed by a call from an event accompanied by a user's interaction such as **, mouse event etc.

Therefore, this flag can not be set to true from the initial state in GOML.


#### fullscreenTarget Attribute

** Initial value ** ... `null`
** Converter ** ... `String`



If null is specified, the parent element of the canvas is used.



## GeometryComponent component


Component for generating geometry
It creates a geometry of the type specified in the `type` attribute and registers it so that it can be used with the name specified in the` name` attribute.
Please be aware that this component will have ** dynamic ** attributes depending on the `type` attribute.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Type | String | Points to the name of the generator of the primitive registered in `GeometryFactory`. |
| Name | String | Geometry name to be used when getting by 'GeometryConverter'. |


#### type attribute

** Initial value ** ... `null`
** Converter ** ... `String`



It refers to the name of the generator of the primitive registered in `GeometryFactory`.
Please be aware that the attribute will dynamically increase depending on the name you specify.
Also, be aware that the increased geometry attributes can not be dynamically manipulated.


#### name attribute

** Initial value ** ... `null`
** Converter ** ... `String`



Geometry name used when getting by `GeometryConverter`.
If you specify a preregistered geometry such as `quad`, you can overwrite that geometry.



## GeometryRegistoryComponent component


Component that manages the geometry
There is not much user operation directly.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| DefaultGeometry | StringArray | type of geometry generated by default |


#### defaultGeometry attribute

** Initial value ** · · · `` quad, cube, sphere`
** Converter ** ... ... `StringArray`

Types of geometry generated by default



## HTMLBinderComponent component


(Deprecated) Component for synchronizing Transform with DOM element
This component will be removed from fundamental. (Separated as separate package)

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| HtmlQuery | String ||
| TargetRenderer | String ||


#### htmlQuery attribute

** Initial value ** ... `null`
** Converter ** ... `String`




#### targetRenderer attribute

** Initial value ** ... `render-scene`
** Converter ** ... `String`





## LoopManagerComponent component


A component that manages the entire loop. There is nothing to be touched directly by the user.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| LoopEnabled | Boolean ||


#### loopEnabled attribute

** Initial value ** ... `false`
** Converter ** ... `Boolean`





## MaterialComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Type | String ||


#### type attribute

** Initial value ** ... `null`
** Converter ** ... `String`





## MaterialContainerComponent component


Components for managing materials and material attributes
This component will be integrated with `MeshRenderer` in the future.
We manage the initialization of the specified material and manage the attributes dynamically added by the material,

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Material | Material | Target material |
| DrawOrder | String | In the default state, use the drawing order setting read from the material |


#### material attribute

** Initial value ** ... ... `new (unlit)`
** Converter ** ... `Material`

Target material


#### drawOrder attribute

** Initial value ** ... `null`
** Converter ** ... `String`



In the default state, we use the drawing order setting read from the material



## MaterialImporterComponent component


Component for reading the material configuration file

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| TypeName | String | Name registered as material name |
| Src | String | File path to load |


#### typeName Attribute

** Initial value ** ... `null`
** Converter ** ... `String`

Name registered as material name


#### src attribute

** Initial value ** ... `null`
** Converter ** ... `String`

File path to load



## MouseCameraControlComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| RotateSpeed ​​| Number ||
| ZoomSpeed ​​| Number ||
| MoveSpeed ​​| Number ||
| Center | Position ||
| Distance | Number ||


#### rotateSpeed ​​attribute

** Initial value ** ... `1`
** Converter ** ... `Number`




#### zoomSpeed ​​attribute

** Initial value ** ... `1`
** Converter ** ... `Number`




#### moveSpeed ​​attribute

** Initial value ** ... `1`
** Converter ** ... `Number`




#### center attribute

** Initial value ** ... `0, 0, 0`
** Converter ** ... `Position`




#### distance attribute

** Initial value ** ... `null`
** Converter ** ... `Number`





## RenderBufferComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Name | String ||


#### name attribute

** Initial value ** ... `null`
** Converter ** ... `String`





## RendererComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Camera | Component ||
| Viewport | Viewport ||
| HandleMouse | Boolean ||


#### camera attribute

** Initial value ** ... `camera`
** Converter ** ... `Component`




#### viewport attribute

** Initial value ** ... `auto`
** Converter ** ... `Viewport`




#### handleMouse Attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`





## RendererManagerComponent component


Components for managing all renderers

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |



## RenderHitareaComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |



## RenderQuadComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Out | String ||
| DepthBuffer | String ||
| TargetBuffer | String ||
| ClearColor | Color 4 ||
| ClearColorEnabled | Boolean ||
| ClearDepthEnabled | Boolean ||
ClearDepth | Number ||
| Technique | String ||


#### out Attribute

** Initial value ** ... `default`
** Converter ** ... `String`




#### depthBuffer attribute

** Initial value ** ... `null`
** Converter ** ... `String`




#### targetBuffer attribute

** Initial value ** ... `default`
** Converter ** ... `String`




#### clearColor attribute

** Initial value ** ... `` 0000``
** Converter ** ... `Color 4`




#### clearColorEnabled attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`




#### clearDepthEnabled attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`




#### clearDepth attribute

** Initial value ** ... `1`
** Converter ** ... `Number`




#### technique attribute

** Initial value ** ... `default`
** Converter ** ... `String`





## RenderSceneComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Layer | String ||
| DepthBuffer | String ||
| Out | String ||
| ClearColor | Color 4 ||
| ClearColorEnabled | Boolean ||
| ClearDepthEnabled | Boolean ||
ClearDepth | Number ||
| Camera | Component ||
| Technique | String ||


#### layer attribute

** Initial value ** ... `default`
** Converter ** ... `String`




#### depthBuffer attribute

** Initial value ** ... `null`
** Converter ** ... `String`




#### out Attribute

** Initial value ** ... `default`
** Converter ** ... `String`




#### clearColor attribute

** Initial value ** ... `` 0000``
** Converter ** ... `Color 4`




#### clearColorEnabled attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`




#### clearDepthEnabled attribute

** Initial value ** ... `true`
** Converter ** ... `Boolean`




#### clearDepth attribute

** Initial value ** ... `1`
** Converter ** ... `Number`




#### camera attribute

** Initial value ** ... `null`
** Converter ** ... `Component`




#### technique attribute

** Initial value ** ... `default`
** Converter ** ... `String`





## SceneComponent component


Components for performing related processing in a specific scene
There are no attributes for this component.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |



## TextureBufferComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |



## TextureComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |



## TimeComponent component




### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Time | Number ||
| TimeDelta | Number ||


#### time attribute

** Initial value ** ... `0`
** Converter ** ... `Number`




#### timeDelta attribute

** Initial value ** ... `0`
** Converter ** ... `Number`





## TransformComponent component


Component responsible for deformation of objects present in the scene
This component defines the coordinate of the object, the amount of rotation, the magnification fee, etc.
All objects in the scene must include this component.

### Attributes

| Name | Converter | Details |
|: -: |: -: |: -: |
| Position | Vector 3 | coordinate of this object |
| Rotation | Rotation 3 | Rotation amount of this object |
| Scale | Vector 3 | magnification ratio of this object |
| RawMatrix | Object | Not used |


#### position attribute

** Initial value ** ... `0, 0, 0`
** Converter ** ... ... `Vector 3`

The coordinates of this object


#### rotation attribute

** Initial value ** ... `0, 0, 0, 1`
** Converter ** ... ... `Rotation 3`

The amount of rotation of this object


#### scale attribute

** Initial value ** ... `1, 1, 1`
** Converter ** ... ... `Vector 3`

The enlargement factor of this object


#### rawMatrix attribute

** Initial value ** ... `null`
** Converter ** ... `Object`

Not used




# Converter Details

## CanvasSizeConverter converter

Converter for canvas size
If you specify a numeric value (such as `100`), return that value as is.
When describing `aspect (1.6)` etc, resize to make the canvas aspect ratio 1.6.
When `fit` is specified, it returns the size that exactly matches the parent element.
If the height of the parent element is 0 and the parent is body, if `fit` is specified, it is judged that the height attribute to the body is not specified,
Automatically assign `height: 100%` to body.

## GeometryConverter Converter

Converter to specify the geometry
Specify the geometry name, such as `quad`, or pass an instance of Geometry type.

## MaterialConverter converter

Converter for specifying material
If `query to <material>` is specified, use the first `<material>` retrieved by that query.
If `new (material name)` is specified, create and use a new material instance.
Normally, the material that specifies the material is replaced by the material by the material.
Note that if you specify it with `new (material)` name, that component itself will manage the attributes of the material.

## ## NodeConverter Converter



## TextureConverter converter

Converter to get reference to texture
There are four ways when passing is a string.
`Url` ... Resolve and retrieve the image from the specified address
`Backbuffer (back buffer name)` ... fetching from the list of named back buffers
`Video (URL to video file)` ... ... Acquires video from the specified address and plays it as a texture (Buggy)
`Query (Query to <texture>)` ... Search and use `<texture>` in the specified query.
There are five ways when passing is an object.
`Texture2D type` · · · used as is
`HTMLImageElement` · · · If necessary, it is resized and used. (It is automatically converted to a power of 2)
`HTMLCanvasElement` · · · If necessary, it is resized and used. (It is automatically converted to a power of 2)
`HTMLVideoElement` ... If necessary, it is automatically resized after being resized (it is automatically converted to a power of 2)

## ViewportConverter converter

Converter for setting viewport size
`Auto` ... Return the size of the viewport that matched the size of the parent canvas
`Left end, Top edge, Width, Height` ... Specify the size of the canvas concretely.
If you specify a number, it becomes pixel unit, but if you add% to the number you can specify the ratio on the parent's canvas basis.
