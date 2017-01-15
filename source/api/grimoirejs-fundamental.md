---
type: doc
title: grimoirejs-fundamental
order: 2
---
# 概要

WIP

# インストール

```sh
$ npm install grimoirejs-fundamental --save
```

[unpkg.com](https://unpkg.com)によるCDNも利用可能。

** [CDN - grimoirejs-fundamental - ](https://unpkg.com/grimoirejs-fundamental/register/grimoire-fundamental.js) **

# 一覧

## ノード

  |ノード名|説明|
  |:-:|:-:|
  |[`<goml>`](#gomlノード)|ツリーに唯一一つ必要なコンポーネントなどをつけておくためのノード。|
  |[`<scene>`](#sceneノード)|カメラや、ライト、メッシュなど空間に配置するためのノードです。|
  |[`<object>`](#objectノード)|メッシュやカメラなどのベースとなるノードです。このノードの子要素には親要素の変型量(`position`や`rotation`)などが伝搬します。|
  |[`<camera>`](#cameraノード)|3D空間を撮影するためのカメラを意味するノードです。シーンをレンダリングするには最低一つのカメラがシーンに属していなければなりません。|
  |[`<mesh>`](#meshノード)|3D空間上に存在する映るものを意味するノードです。シーンに何かを写すには最低一つのメッシュがシーンに属していなければなりません。|
  |[`<renderer>`](#rendererノード)|キャンバス上の領域をどのように描画するかを示すためのノードです。gomlの読み込み時に一つも存在しない場合は、自動的にgoml直下に生成されます。|
  |[`<geometry>`](#geometryノード)|単純な変形(`scale`、`position`、`rotation`だけで表せない)、例えば円の分割数などを指定したい別の形状を明示的に生成するためのノードです。|
  |[`<texture>`](#textureノード)|テクスチャを読み込むためのノードです。通常、テクスチャはurlをマテリアルに指定するなどして読み込まれますが、|
  |[`<material>`](#materialノード)|マテリアルを生成するためのノードです。メッシュからこのノードを参照して利用することにより、複数のメッシュで共通のマテリアルのインスタンスを参照させることができます。|
  |[`<import-material>`](#import-materialノード)|Grimoire.jsのマテリアルファイル(*.sort)から新しい種類のマテリアルを読み込むためのノードです。|
  |[`<texture-buffer>`](#texture-bufferノード)|`<renderer>`ノードの直下に含まれうるノードの一つです。|
  |[`<render-buffer>`](#render-bufferノード)|`<renderer>`ノードの直下に含まれうるノードの一つです。|
  |[`<render-scene>`](#render-sceneノード)|`<renderer>`ノードの直下に含まれうるノードの一つです。|
  |[`<render-quad>`](#render-quadノード)|`<renderer>`ノードの直下に含まれうるノードの一つです。|

## コンポーネント

  |コンポーネント名|説明|
  |:-:|:-:|
  |[`<AssetLoadingManagerComponent>`](#AssetLoadingManagerComponentコンポーネント)||
  |[`<CameraComponent>`](#CameraComponentコンポーネント)||
  |[`<FullscreenComponent>`](#FullscreenComponentコンポーネント)||
  |[`<GeometryComponent>`](#GeometryComponentコンポーネント)||
  |[`<GeometryRegistoryComponent>`](#GeometryRegistoryComponentコンポーネント)||
  |[`<HTMLBinderComponent>`](#HTMLBinderComponentコンポーネント)||
  |[`<MaterialComponent>`](#MaterialComponentコンポーネント)||
  |[`<MaterialContainerComponent>`](#MaterialContainerComponentコンポーネント)||
  |[`<MaterialImporterComponent>`](#MaterialImporterComponentコンポーネント)||
  |[`<MeshRenderer>`](#MeshRendererコンポーネント)||
  |[`<MouseCameraControlComponent>`](#MouseCameraControlComponentコンポーネント)||
  |[`<RenderBufferComponent>`](#RenderBufferComponentコンポーネント)||
  |[`<RendererComponent>`](#RendererComponentコンポーネント)||
  |[`<RendererManagerComponent>`](#RendererManagerComponentコンポーネント)||
  |[`<RenderQuadComponent>`](#RenderQuadComponentコンポーネント)||
  |[`<RenderSceneComponent>`](#RenderSceneComponentコンポーネント)||
  |[`<SceneComponent>`](#SceneComponentコンポーネント)||
  |[`<TextureBufferComponent>`](#TextureBufferComponentコンポーネント)||
  |[`<TextureComponent>`](#TextureComponentコンポーネント)||
  |[`<TransformComponent>`](#TransformComponentコンポーネント)||

## コンバーター

  |コンバーター名|説明|
  |:-:|:-:|
  |[`<CanvasSizeConverter>`](#CanvasSizeConverterコンバーター)||
  |[`<GeometryConverter>`](#GeometryConverterコンバーター)||
  |[`<MaterialConverter>`](#MaterialConverterコンバーター)||
  |[`<NodeConverter>`](#NodeConverterコンバーター)||
  |[`<PositionConverter>`](#PositionConverterコンバーター)||
  |[`<TextureConverter>`](#TextureConverterコンバーター)||
  |[`<ViewportConverter>`](#ViewportConverterコンバーター)||

# ノード詳細


## gomlノード




ツリーに唯一一つ必要なコンポーネントなどをつけておくためのノード。
特に、`<canvas>`の初期化やループの管理など、最初の初期化時のパラメーターを受け取るためのコンポーネントとともに、
`<canvas>`の設定(`width`や`height`)またはフルスクリーンなどのコンポーネントを含む。

### コンポーネント

* CanvasInitializer
* LoopManager
* AssetLoadingManager
* GeometryRegistory
* RendererManager
* Fullscreen


## sceneノード




カメラや、ライト、メッシュなど空間に配置するためのノードです。
全ての場面に存在する座標を持ちうるノード(`TransformComponent`を含むノード)は必ずこのノードの子ノードのとして存在する必要があります。

### コンポーネント

* Scene


## objectノード




メッシュやカメラなどのベースとなるノードです。このノードの子要素には親要素の変型量(`position`や`rotation`)などが伝搬します。
詳しくは`TransformComponent`を参照すると良いでしょう。

### コンポーネント

* Transform


## cameraノード

**継承元:&lt;object&gt;**



3D空間を撮影するためのカメラを意味するノードです。シーンをレンダリングするには最低一つのカメラがシーンに属していなければなりません。


### コンポーネント

* Camera


## meshノード

**継承元:&lt;object&gt;**



3D空間上に存在する映るものを意味するノードです。シーンに何かを写すには最低一つのメッシュがシーンに属していなければなりません。

メッシュは、マテリアル(材質)とジオメトリ(形状)からなります。この2つの指定を変えることで、様々な表現が3D空間上で可能になります。

### コンポーネント

* MaterialContainer
* MeshRenderer


## rendererノード




キャンバス上の領域をどのように描画するかを示すためのノードです。gomlの読み込み時に一つも存在しない場合は、自動的にgoml直下に生成されます。

1つ以上のレンダラーを含むことで、キャンバスの複数の領域をレンダリングしたりすることができるようになります。
また、この子要素に指定する`<render-XXX>`ノードなどによって、どのようにその領域を描画するかが決定されます。

通常、`<renderer>`の子ノードに何も存在しない場合、自動的に`<render-scene>`タグが生成されます。

### コンポーネント

* Renderer


## geometryノード




単純な変形(`scale`、`position`、`rotation`だけで表せない)、例えば円の分割数などを指定したい別の形状を明示的に生成するためのノードです。

### コンポーネント

* Geometry


## textureノード




テクスチャを読み込むためのノードです。通常、テクスチャはurlをマテリアルに指定するなどして読み込まれますが、
サンプラの指定などをしたい場合、このタグで明示的に読み込むことにより読み込むことができます。

### コンポーネント

* Texture


## materialノード




マテリアルを生成するためのノードです。メッシュからこのノードを参照して利用することにより、複数のメッシュで共通のマテリアルのインスタンスを参照させることができます。

これは、同時にマテリアルの値が編集できるだけでなく、パフォーマンス的にも大きな利点をもたらします。

### コンポーネント

* Material


## import-materialノード




Grimoire.jsのマテリアルファイル(*.sort)から新しい種類のマテリアルを読み込むためのノードです。

### コンポーネント

* MaterialImporter


## texture-bufferノード




`<renderer>`ノードの直下に含まれうるノードの一つです。

このノードによってレンダリングに用いるカラーバッファを生成することができます。
カラーバッファはオフスクリーンレンダリングなどへの利用など様々な面で利用することができます。

### コンポーネント

* TextureBuffer


## render-bufferノード




`<renderer>`ノードの直下に含まれうるノードの一つです。

このノードによってレンダリングに用いる深度バッファやステンシルバッファを生成することができます。

### コンポーネント

* RenderBuffer


## render-sceneノード




`<renderer>`ノードの直下に含まれうるノードの一つです。

このノードは`out`に指定されたテクスチャ(デフォルトではキャンバス自身)に対して、シーンの内容を描画します。

### コンポーネント

* RenderScene


## render-quadノード




`<renderer>`ノードの直下に含まれうるノードの一つです。

このノードは`out`に指定されたテクスチャ(デフォルトではキャンバス自身)に対して、単純な四角形(`quad`)を指定されたマテリアルで描画します。

### コンポーネント

* MaterialContainer
* RenderQuad




# コンポーネント詳細


## AssetLoadingManagerComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|loadingProgress|Number||
|autoStart|Boolean||
|enableLoader|Boolean||


#### loadingProgress属性

**初期値** ・・・ `0`
**コンバーター** ・・・ `Number`




#### autoStart属性

**初期値** ・・・ `true`
**コンバーター** ・・・ `Boolean`




#### enableLoader属性

**初期値** ・・・ `true`
**コンバーター** ・・・ `Boolean`





## CameraComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|fovy|Angle2D||
|near|Number||
|far|Number||
|aspect|Number||
|autoAspect|Boolean||
|orthoSize|Number||
|orthogonal|Boolean||


#### fovy属性

**初期値** ・・・ `45d`
**コンバーター** ・・・ `Angle2D`




#### near属性

**初期値** ・・・ `0.01`
**コンバーター** ・・・ `Number`




#### far属性

**初期値** ・・・ `100`
**コンバーター** ・・・ `Number`




#### aspect属性

**初期値** ・・・ `1.6`
**コンバーター** ・・・ `Number`




#### autoAspect属性

**初期値** ・・・ `true`
**コンバーター** ・・・ `Boolean`




#### orthoSize属性

**初期値** ・・・ `100`
**コンバーター** ・・・ `Number`




#### orthogonal属性

**初期値** ・・・ `false`
**コンバーター** ・・・ `Boolean`





## FullscreenComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|fullscreen|Boolean||
|fullscreenTarget|String||


#### fullscreen属性

**初期値** ・・・ `false`
**コンバーター** ・・・ `Boolean`




#### fullscreenTarget属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`





## GeometryComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|type|String||
|name|String||


#### type属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`




#### name属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`





## GeometryRegistoryComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|defaultGeometry|StringArray||


#### defaultGeometry属性

**初期値** ・・・ `quad,cube,sphere`
**コンバーター** ・・・ `StringArray`





## HTMLBinderComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|htmlQuery|String||
|targetRenderer|String||


#### htmlQuery属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`




#### targetRenderer属性

**初期値** ・・・ `render-scene`
**コンバーター** ・・・ `String`





## MaterialComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|type|String||


#### type属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`





## MaterialContainerComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|material|Material||
|drawOrder|String||


#### material属性

**初期値** ・・・ `new(unlit)`
**コンバーター** ・・・ `Material`




#### drawOrder属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`





## MaterialImporterComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|typeName|String||
|src|String||


#### typeName属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`




#### src属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`





## MeshRendererコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|geometry|Geometry||
|targetBuffer|String||
|layer|String||
|drawCount|Number||
|drawOffset|Number||


#### geometry属性

**初期値** ・・・ `quad`
**コンバーター** ・・・ `Geometry`




#### targetBuffer属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`




#### layer属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`




#### drawCount属性

**初期値** ・・・ `1.7976931348623157e+308`
**コンバーター** ・・・ `Number`




#### drawOffset属性

**初期値** ・・・ `0`
**コンバーター** ・・・ `Number`





## MouseCameraControlComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|rotateSpeed|Number||
|zoomSpeed|Number||
|moveSpeed|Number||
|center|Vector3||
|distance|Number||


#### rotateSpeed属性

**初期値** ・・・ `1`
**コンバーター** ・・・ `Number`




#### zoomSpeed属性

**初期値** ・・・ `1`
**コンバーター** ・・・ `Number`




#### moveSpeed属性

**初期値** ・・・ `1`
**コンバーター** ・・・ `Number`




#### center属性

**初期値** ・・・ `0,0,0`
**コンバーター** ・・・ `Vector3`




#### distance属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `Number`





## RenderBufferComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|name|String||


#### name属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`





## RendererComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|camera|Component||
|viewport|Viewport||


#### camera属性

**初期値** ・・・ `camera`
**コンバーター** ・・・ `Component`




#### viewport属性

**初期値** ・・・ `auto`
**コンバーター** ・・・ `Viewport`





## RendererManagerComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



## RenderQuadComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|out|String||
|depthBuffer|String||
|targetBuffer|String||
|clearColor|Color4||
|clearColorEnabled|Boolean||
|clearDepthEnabled|Boolean||
|clearDepth|Number||
|technique|String||


#### out属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`




#### depthBuffer属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`




#### targetBuffer属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`




#### clearColor属性

**初期値** ・・・ `#0000`
**コンバーター** ・・・ `Color4`




#### clearColorEnabled属性

**初期値** ・・・ `true`
**コンバーター** ・・・ `Boolean`




#### clearDepthEnabled属性

**初期値** ・・・ `true`
**コンバーター** ・・・ `Boolean`




#### clearDepth属性

**初期値** ・・・ `1`
**コンバーター** ・・・ `Number`




#### technique属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`





## RenderSceneComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|layer|String||
|depthBuffer|String||
|out|String||
|clearColor|Color4||
|clearColorEnabled|Boolean||
|clearDepthEnabled|Boolean||
|clearDepth|Number||
|camera|Component||
|technique|String||


#### layer属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`




#### depthBuffer属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `String`




#### out属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`




#### clearColor属性

**初期値** ・・・ `#0000`
**コンバーター** ・・・ `Color4`




#### clearColorEnabled属性

**初期値** ・・・ `true`
**コンバーター** ・・・ `Boolean`




#### clearDepthEnabled属性

**初期値** ・・・ `true`
**コンバーター** ・・・ `Boolean`




#### clearDepth属性

**初期値** ・・・ `1`
**コンバーター** ・・・ `Number`




#### camera属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `Component`




#### technique属性

**初期値** ・・・ `default`
**コンバーター** ・・・ `String`





## SceneComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



## TextureBufferComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



## TextureComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



## TransformComponentコンポーネント




### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|position|Vector3||
|rotation|Rotation3||
|scale|Vector3||
|rawMatrix|Object||


#### position属性

**初期値** ・・・ `0,0,0`
**コンバーター** ・・・ `Vector3`




#### rotation属性

**初期値** ・・・ `0,0,0,1`
**コンバーター** ・・・ `Rotation3`




#### scale属性

**初期値** ・・・ `1,1,1`
**コンバーター** ・・・ `Vector3`




#### rawMatrix属性

**初期値** ・・・ `null`
**コンバーター** ・・・ `Object`






# コンバーター詳細

## CanvasSizeConverterコンバーター



## GeometryConverterコンバーター



## MaterialConverterコンバーター



## NodeConverterコンバーター



## PositionConverterコンバーター



## TextureConverterコンバーター



## ViewportConverterコンバーター
