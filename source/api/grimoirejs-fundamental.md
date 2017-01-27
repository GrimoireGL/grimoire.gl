---
type: doc
title: grimoirejs-fundamental
order: 2
---

## 概要



## インストール

```sh
$ npm install grimoirejs-fundamental --save
```

[unpkg.com](https://unpkg.com)によるCDNも利用可能。

** [CDN - grimoirejs-fundamental - ](https://unpkg.com/grimoirejs-fundamental/register/grimoire-fundamental.js) **

## 一覧

### ノード

  |ノード名|説明|
  |:-:|:-:|
  |[`<goml>`](#gomlノード)|GOMLファイルのルートノード|
  |[`<scene>`](#sceneノード)|ある3D空間上のモデルの配置やカメラの設定などの場面の設定を含むためのノード|
  |[`<object>`](#objectノード)|3D空間上の物体を意味するノード|
  |[`<camera>`](#cameraノード)|3D空間を撮影するためのカメラのノード|
  |[`<mesh>`](#meshノード)|3D空間上のモデルなど、 **映るもの** を表すためのノード|
  |[`<renderer>`](#rendererノード)|キャンバスの描画手法を指定するためのノード|
  |[`<geometry>`](#geometryノード)|新しい形状を生成するためのノード|
  |[`<texture>`](#textureノード)|テクスチャを明示的に読み込むためのノード|
  |[`<material>`](#materialノード)|マテリアルを明示的に読み込むためのノード|
  |[`<import-material>`](#import-materialノード)|新しいマテリアルを外部から読み込むためのノード|
  |[`<texture-buffer>`](#texture-bufferノード)|カラーバッファ用のテクスチャを生成するためのノード|
  |[`<render-buffer>`](#render-bufferノード)|深度バッファ/ステンシルバッファ用の`renderbuffer`を生成するためのノード|
  |[`<render-scene>`](#render-sceneノード)|シーンを描画するレンダリング手順を表すためのノード|
  |[`<render-quad>`](#render-quadノード)|四角形単体を特定のマテリアルで描画するためのノード|

### コンポーネント

  |コンポーネント名|説明|
  |:-:|:-:|
  |[`<AssetLoadingManagerComponent>`](#AssetLoadingManagerComponentコンポーネント)|アセットの読み込みを司るコンポーネント。ローダーの表示などを司る。|
  |[`<CameraComponent>`](#CameraComponentコンポーネント)|シーンを描画するカメラのコンポーネント|
  |[`<CanvasInitializerComponent>`](#CanvasInitializerComponentコンポーネント)|キャンバスの初期化及び設定を司るコンポーネント|
  |[`<ClickableMeshComponent>`](#ClickableMeshComponentコンポーネント)||
  |[`<FullscreenComponent>`](#FullscreenComponentコンポーネント)|フルスクリーン状態を管理するコンポーネント|
  |[`<GeometryComponent>`](#GeometryComponentコンポーネント)|ジオメトリを生成するためのコンポーネント|
  |[`<GeometryRegistoryComponent>`](#GeometryRegistoryComponentコンポーネント)|ジオメトリを管理するコンポーネント|
  |[`<HTMLBinderComponent>`](#HTMLBinderComponentコンポーネント)|(Deprecated)DOM要素とTransformを同期させるためのコンポーネント|
  |[`<LoopManagerComponent>`](#LoopManagerComponentコンポーネント)|全体のループを管理しているコンポーネント。あまり直接ユーザーがいじることはありません。|
  |[`<MaterialComponent>`](#MaterialComponentコンポーネント)||
  |[`<MaterialContainerComponent>`](#MaterialContainerComponentコンポーネント)|マテリアルとマテリアルへの属性を管理するためのコンポーネント|
  |[`<MaterialImporterComponent>`](#MaterialImporterComponentコンポーネント)|マテリアル設定ファイルを読み込むためのコンポーネント|
  |[`<MouseCameraControlComponent>`](#MouseCameraControlComponentコンポーネント)||
  |[`<RenderBufferComponent>`](#RenderBufferComponentコンポーネント)||
  |[`<RendererComponent>`](#RendererComponentコンポーネント)||
  |[`<RendererManagerComponent>`](#RendererManagerComponentコンポーネント)|全レンダラーを管理するためのコンポーネント|
  |[`<RenderHitareaComponent>`](#RenderHitareaComponentコンポーネント)||
  |[`<RenderQuadComponent>`](#RenderQuadComponentコンポーネント)||
  |[`<RenderSceneComponent>`](#RenderSceneComponentコンポーネント)||
  |[`<SceneComponent>`](#SceneComponentコンポーネント)|特定のシーン内に関連する処理を行うためのコンポーネント|
  |[`<TextureBufferComponent>`](#TextureBufferComponentコンポーネント)||
  |[`<TextureComponent>`](#TextureComponentコンポーネント)||
  |[`<TimeComponent>`](#TimeComponentコンポーネント)||
  |[`<TransformComponent>`](#TransformComponentコンポーネント)|シーン中に存在する物体の変形を司るコンポーネント|

### コンバーター

  |コンバーター名|説明|
  |:-:|:-:|
  |[`CanvasSizeConverter`](#CanvasSizeConverterコンバーター)|キャンバスのサイズ用のコンバーター|
  |[`GeometryConverter`](#GeometryConverterコンバーター)|ジオメトリを指定するためのコンバーター|
  |[`MaterialConverter`](#MaterialConverterコンバーター)|マテリアルを指定するためのコンバーター|
  |[`NodeConverter`](#NodeConverterコンバーター)||
  |[`TextureConverter`](#TextureConverterコンバーター)|テクスチャへの参照を取得するためのコンバーター|
  |[`ViewportConverter`](#ViewportConverterコンバーター)|ビューポートサイズを設定するためのコンバーター|

## ノード詳細


### gomlノード


GOMLファイルのルートノード  
ツリーに唯一一つ必要なコンポーネントなどをつけておくためのノード。  
特に、`<canvas>`の初期化やループの管理など、最初の初期化時のパラメーターを受け取るためのコンポーネントとともに、  
`<canvas>`の設定(`width`や`height`)またはフルスクリーンなどのコンポーネントを含む。

#### コンポーネント

* CanvasInitializer
* LoopManager
* AssetLoadingManager
* GeometryRegistory
* RendererManager
* Fullscreen


### sceneノード


ある3D空間上のモデルの配置やカメラの設定などの場面の設定を含むためのノード  
カメラや、ライト、メッシュなど空間に配置するためのノードです。  
全ての場面に存在する座標を持ちうるノード(`TransformComponent`を含むノード)は必ずこのノードの子ノードのとして存在する必要があります。

#### コンポーネント

* Scene


### objectノード


3D空間上の物体を意味するノード  
メッシュやカメラなどのベースとなるノードです。このノードの子要素には親要素の変型量(`position`や`rotation`)などが伝搬します。  
詳しくは`TransformComponent`を参照すると良いでしょう。

#### コンポーネント

* Transform


### cameraノード

**継承元:&lt;object&gt;**

3D空間を撮影するためのカメラのノード  
3D空間を撮影するためのカメラを意味するノードです。シーンをレンダリングするには最低一つのカメラがシーンに属していなければなりません。

#### コンポーネント

* Camera


### meshノード

**継承元:&lt;object&gt;**

3D空間上のモデルなど、 **映るもの** を表すためのノード  
3D空間上に存在する映るものを意味するノードです。シーンに何かを写すには最低一つのメッシュがシーンに属していなければなりません。  
メッシュは、マテリアル(材質)とジオメトリ(形状)からなります。この2つの指定を変えることで、様々な表現が3D空間上で可能になります。

#### コンポーネント

* MaterialContainer
* MeshRenderer


### rendererノード


キャンバスの描画手法を指定するためのノード  
キャンバス上の領域をどのように描画するかを示すためのノードです。gomlの読み込み時に一つも存在しない場合は、自動的にgoml直下に生成されます。  
1つ以上のレンダラーを含むことで、キャンバスの複数の領域をレンダリングしたりすることができるようになります。  
また、この子要素に指定する`<render-XXX>`ノードなどによって、どのようにその領域を描画するかが決定されます。  
通常、`<renderer>`の子ノードに何も存在しない場合、自動的に`<render-scene>`タグが生成されます。

#### コンポーネント

* Renderer


### geometryノード


新しい形状を生成するためのノード  
単純な変形(`scale`、`position`、`rotation`だけで表せない)、例えば円の分割数などを指定したい別の形状を明示的に生成するためのノードです。

#### コンポーネント

* Geometry


### textureノード


テクスチャを明示的に読み込むためのノード  
テクスチャを読み込むためのノードです。通常、テクスチャはurlをマテリアルに指定するなどして読み込まれますが、  
サンプラの指定などをしたい場合、このタグで明示的に読み込むことにより読み込むことができます。

#### コンポーネント

* Texture


### materialノード


マテリアルを明示的に読み込むためのノード  
マテリアルを生成するためのノードです。メッシュからこのノードを参照して利用することにより、複数のメッシュで共通のマテリアルのインスタンスを参照させることができます。  
これは、同時にマテリアルの値が編集できるだけでなく、パフォーマンス的にも大きな利点をもたらします。

#### コンポーネント

* Material


### import-materialノード


新しいマテリアルを外部から読み込むためのノード  
Grimoire.jsのマテリアルファイル(`*.sort`)から新しい種類のマテリアルを読み込むためのノードです。

#### コンポーネント

* MaterialImporter


### texture-bufferノード


カラーバッファ用のテクスチャを生成するためのノード  
`<renderer>`ノードの直下に含まれうるノードの一つです。  
このノードによってレンダリングに用いるカラーバッファを生成することができます。  
カラーバッファはオフスクリーンレンダリングなどへの利用など様々な面で利用することができます。

#### コンポーネント

* TextureBuffer


### render-bufferノード


深度バッファ/ステンシルバッファ用の`renderbuffer`を生成するためのノード  
`<renderer>`ノードの直下に含まれうるノードの一つです。  
このノードによってレンダリングに用いる深度バッファやステンシルバッファを生成することができます。

#### コンポーネント

* RenderBuffer


### render-sceneノード


シーンを描画するレンダリング手順を表すためのノード  
`<renderer>`ノードの直下に含まれうるノードの一つです。  
このノードは`out`に指定されたテクスチャ(デフォルトではキャンバス自身)に対して、シーンの内容を描画します。

#### コンポーネント

* RenderScene
* RenderHitArea


### render-quadノード


四角形単体を特定のマテリアルで描画するためのノード  
`<renderer>`ノードの直下に含まれうるノードの一つです。  
このノードは`out`に指定されたテクスチャ(デフォルトではキャンバス自身)に対して、単純な四角形(`quad`)を指定されたマテリアルで描画します。

#### コンポーネント

* MaterialContainer
* RenderQuad




## コンポーネント詳細


### AssetLoadingManagerComponentコンポーネント


アセットの読み込みを司るコンポーネント。ローダーの表示などを司る。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|loadingProgress|Number|現在の読み込み状況を0-1で表す。|
|autoStart|Boolean|リソースの読み込み完了後に、自動的にレンダリングループを開始するかどうか|
|enableLoader|Boolean|リソースのロード時にローディング画面を表示するかどうか|


##### loadingProgress属性

**初期値** ・・・ `0`  
**コンバーター** ・・・ `Number`



現在の読み込み状況を0-1で表す。


##### autoStart属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`

リソースの読み込み完了後に、自動的にレンダリングループを開始するかどうか


##### enableLoader属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`

リソースのロード時にローディング画面を表示するかどうか



### CameraComponentコンポーネント


シーンを描画するカメラのコンポーネント  
このコンポーネントによって、透視射影や正方射影などの歪みを調整します。  
また、このコンポーネントの付属するノードに属する`Transoform`によって、カメラの位置や向きが確定されます。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|fovy|Angle2D|カメラの視野角。|
|near|Number|カメラに映るもっとも近い距離です。|
|far|Number|far - nearの値があまりにも大きいと、Z-fighting(手前の物体が奥に表示されたように見えたりする)現象が起きる可能性があります。|
|aspect|Number|カメラのアスペクト比|
|autoAspect|Boolean|アスペクト比の自動調整が有効か否か|
|orthoSize|Number|正射影時の横の基準サイズ|
|orthogonal|Boolean|この属性がfalseである場合、カメラは透視射影としてシーンをレンダリングします。この場合、レンダリング結果にパース(奥行き感)が出ます。|


##### fovy属性

**初期値** ・・・ `45d`  
**コンバーター** ・・・ `Angle2D`

カメラの視野角。  
orthogonal属性がtrueである場合この属性は無視されます。


##### near属性

**初期値** ・・・ `0.01`  
**コンバーター** ・・・ `Number`

カメラに映るもっとも近い距離です。  
0よりも大きく、far属性よりも小さい必要があります。


##### far属性

**初期値** ・・・ `100`  
**コンバーター** ・・・ `Number`



far - nearの値があまりにも大きいと、Z-fighting(手前の物体が奥に表示されたように見えたりする)現象が起きる可能性があります。  
この差があまりに大きい時、カメラに映る物体の座標の小さいz座標の値の差は0に近似されます。  
逆にこの値が小さい時は、カメラに映る物体はある程度小さいz座標の差でも問題なく表示されます。  
**大切なのは、写したい空間よりも無駄に大きくしないこと。常に適切な値を設定するべきです**


##### aspect属性

**初期値** ・・・ `1.6`  
**コンバーター** ・・・ `Number`

カメラのアスペクト比  
カメラの横の大きさと縦の大きさの比率を指定します。autoAspect属性がtrueである時、毎回のレンダリング時にこの値を自動調整します。


##### autoAspect属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`

アスペクト比の自動調整が有効か否か  
レンダリング時にそのビューポートの大きさに応じて比率を自動調整するかどうかを示します。


##### orthoSize属性

**初期値** ・・・ `100`  
**コンバーター** ・・・ `Number`

正射影時の横の基準サイズ  
正射影時はfovy属性を用いて自動的に写す領域を決定できません。  
そのため、横の一片のサイズをこの属性で指定します。**アスペクト比は計算に用いられることに注意してください。**


##### orthogonal属性

**初期値** ・・・ `false`  
**コンバーター** ・・・ `Boolean`



この属性がfalseである場合、カメラは透視射影としてシーンをレンダリングします。この場合、レンダリング結果にパース(奥行き感)が出ます。  
一方、この属性がtrueである場合、カメラは正射影としてシーンをレンダリングします。この場合、レンダリング結果には奥行き感は出ません。



### CanvasInitializerComponentコンポーネント


キャンバスの初期化及び設定を司るコンポーネント  
このコンポーネントによって、適切な位置に`<canvas>`を初期化してWebGLコンテキストを初期化します。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|width|CanvasSize|キャンバスタグの横幅を指定します。|
|height|CanvasSize|キャンバスタグの縦幅を指定します。|
|containerId|String|キャンバス要素の直接の親要素のコンテナに割り当てるidを指定します。|
|containerClass|String|キャンバス要素の直接の親要素のコンテナに割り当てるクラス名を指定します。|
|preserveDrawingBuffer|Boolean|描画結果をdataURLに変換する際などはこの属性がtrueでないと正常にレンダリング結果を取得できません。|
|antialias|Boolean|この属性は、途中で動的に変更することができません。|


##### width属性

**初期値** ・・・ `fit`  
**コンバーター** ・・・ `CanvasSize`

キャンバスタグの横幅を指定します。


##### height属性

**初期値** ・・・ `fit`  
**コンバーター** ・・・ `CanvasSize`

キャンバスタグの縦幅を指定します。


##### containerId属性

**初期値** ・・・ `(Empty string)`  
**コンバーター** ・・・ `String`

キャンバス要素の直接の親要素のコンテナに割り当てるidを指定します。


##### containerClass属性

**初期値** ・・・ `gr-container`  
**コンバーター** ・・・ `String`

キャンバス要素の直接の親要素のコンテナに割り当てるクラス名を指定します。


##### preserveDrawingBuffer属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`



描画結果をdataURLに変換する際などはこの属性がtrueでないと正常にレンダリング結果を取得できません。


##### antialias属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`



この属性は、途中で動的に変更することができません。



### ClickableMeshComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



### FullscreenComponentコンポーネント


フルスクリーン状態を管理するコンポーネント  
Grimoire.jsによって管理されているキャンバス(正確にはその親のコンテナ)のフルスクリーン状態等を管理します。  
(他の要素をフルスクリーン化することも可能ですが、通常このGrimoire.jsによって生成されるキャンバスを含むDOM要素に対して用いられます。)  
また、一部の古いブラウザでは動作しない機能であることに注意してください。  
また、`fullscreen`属性は必ず マウスのイベントなどのユーザーのインタラクションを伴うイベントからの呼び出しで **動的に** trueにされる必要があります。  
最初からtrueに設定して初期状態でキャンバスをフルスクリーン状態にすることはWebAPIの制約上できません。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|fullscreen|Boolean|このフラグをtrueにする際は、**必ず**、マウスイベントなどのユーザーのインタラクションを伴うイベントからの呼び出しで変更されなければなりません。|
|fullscreenTarget|String|nullが指定された場合、キャンバスの親要素が用いられます。|


##### fullscreen属性

**初期値** ・・・ `false`  
**コンバーター** ・・・ `Boolean`



このフラグをtrueにする際は、**必ず**、マウスイベントなどのユーザーのインタラクションを伴うイベントからの呼び出しで変更されなければなりません。  

したがって、GOMLで初期状態からこのフラグをtrueにすることはできません。


##### fullscreenTarget属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`



nullが指定された場合、キャンバスの親要素が用いられます。



### GeometryComponentコンポーネント


ジオメトリを生成するためのコンポーネント  
`type`属性に指定されたタイプのジオメトリを生成して、`name`属性に指定された名前で利用できる形にして登録します。  
このコンポーネントは`type`属性に応じて、**動的** に属性が増えることに気をつけてください。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|type|String|`GeometryFactory`に登録されたプリミティブのジェネレーターの名前を指します。|
|name|String|`GeometryConverter`によって取得される際に利用されるジオメトリ名です。|


##### type属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`



`GeometryFactory`に登録されたプリミティブのジェネレーターの名前を指します。  
この指定する名前によって、動的に属性が増えることに気をつけてください。  
また、増えたジオメトリの属性は動的に操作できないことに気をつけてください。


##### name属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`



`GeometryConverter`によって取得される際に利用されるジオメトリ名です。  
もし、`quad`など事前に登録されたジオメトリを指定した場合、そのジオメトリを上書きすることができます。



### GeometryRegistoryComponentコンポーネント


ジオメトリを管理するコンポーネント  
あまりユーザーが直接操作することはありません。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|defaultGeometry|StringArray|デフォルトで生成するジオメトリの種類|


##### defaultGeometry属性

**初期値** ・・・ `quad,cube,sphere`  
**コンバーター** ・・・ `StringArray`

デフォルトで生成するジオメトリの種類



### HTMLBinderComponentコンポーネント


(Deprecated)DOM要素とTransformを同期させるためのコンポーネント  
このコンポーネントはfundamentalからは削除されます。(別のパッケージとして分離予定)

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|htmlQuery|String||
|targetRenderer|String||


##### htmlQuery属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`




##### targetRenderer属性

**初期値** ・・・ `render-scene`  
**コンバーター** ・・・ `String`





### LoopManagerComponentコンポーネント


全体のループを管理しているコンポーネント。あまり直接ユーザーがいじることはありません。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|loopEnabled|Boolean||


##### loopEnabled属性

**初期値** ・・・ `false`  
**コンバーター** ・・・ `Boolean`





### MaterialComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|type|String||


##### type属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`





### MaterialContainerComponentコンポーネント


マテリアルとマテリアルへの属性を管理するためのコンポーネント  
このコンポーネントは将来的に`MeshRenderer`と統合されます。  
指定されたマテリアルの初期化の管理や、マテリアルによって動的に追加される属性の管理を行います、

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|material|Material|対象のマテリアル|
|drawOrder|String|デフォルトの状態では、マテリアルから読み込んだ描画順序設定を用います|


##### material属性

**初期値** ・・・ `new(unlit)`  
**コンバーター** ・・・ `Material`

対象のマテリアル


##### drawOrder属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`



デフォルトの状態では、マテリアルから読み込んだ描画順序設定を用います



### MaterialImporterComponentコンポーネント


マテリアル設定ファイルを読み込むためのコンポーネント

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|typeName|String|マテリアル名として登録される名前|
|src|String|読み込み先のファイルパス|


##### typeName属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`

マテリアル名として登録される名前


##### src属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`

読み込み先のファイルパス



### MouseCameraControlComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|rotateSpeed|Number||
|zoomSpeed|Number||
|moveSpeed|Number||
|center|Position||
|distance|Number||


##### rotateSpeed属性

**初期値** ・・・ `1`  
**コンバーター** ・・・ `Number`




##### zoomSpeed属性

**初期値** ・・・ `1`  
**コンバーター** ・・・ `Number`




##### moveSpeed属性

**初期値** ・・・ `1`  
**コンバーター** ・・・ `Number`




##### center属性

**初期値** ・・・ `0,0,0`  
**コンバーター** ・・・ `Position`




##### distance属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `Number`





### RenderBufferComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|name|String||


##### name属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`





### RendererComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|camera|Component||
|viewport|Viewport||
|handleMouse|Boolean||


##### camera属性

**初期値** ・・・ `camera`  
**コンバーター** ・・・ `Component`




##### viewport属性

**初期値** ・・・ `auto`  
**コンバーター** ・・・ `Viewport`




##### handleMouse属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`





### RendererManagerComponentコンポーネント


全レンダラーを管理するためのコンポーネント

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



### RenderHitareaComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



### RenderQuadComponentコンポーネント




#### 属性

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


##### out属性

**初期値** ・・・ `default`  
**コンバーター** ・・・ `String`




##### depthBuffer属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`




##### targetBuffer属性

**初期値** ・・・ `default`  
**コンバーター** ・・・ `String`




##### clearColor属性

**初期値** ・・・ `#0000`  
**コンバーター** ・・・ `Color4`




##### clearColorEnabled属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`




##### clearDepthEnabled属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`




##### clearDepth属性

**初期値** ・・・ `1`  
**コンバーター** ・・・ `Number`




##### technique属性

**初期値** ・・・ `default`  
**コンバーター** ・・・ `String`





### RenderSceneComponentコンポーネント




#### 属性

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


##### layer属性

**初期値** ・・・ `default`  
**コンバーター** ・・・ `String`




##### depthBuffer属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `String`




##### out属性

**初期値** ・・・ `default`  
**コンバーター** ・・・ `String`




##### clearColor属性

**初期値** ・・・ `#0000`  
**コンバーター** ・・・ `Color4`




##### clearColorEnabled属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`




##### clearDepthEnabled属性

**初期値** ・・・ `true`  
**コンバーター** ・・・ `Boolean`




##### clearDepth属性

**初期値** ・・・ `1`  
**コンバーター** ・・・ `Number`




##### camera属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `Component`




##### technique属性

**初期値** ・・・ `default`  
**コンバーター** ・・・ `String`





### SceneComponentコンポーネント


特定のシーン内に関連する処理を行うためのコンポーネント  
このコンポーネントには属性が存在しません。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



### TextureBufferComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



### TextureComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|



### TimeComponentコンポーネント




#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|time|Number||
|timeDelta|Number||


##### time属性

**初期値** ・・・ `0`  
**コンバーター** ・・・ `Number`




##### timeDelta属性

**初期値** ・・・ `0`  
**コンバーター** ・・・ `Number`





### TransformComponentコンポーネント


シーン中に存在する物体の変形を司るコンポーネント  
このコンポーネントによって物体の座標や回転量、拡大料などが定義されます。  
シーン中の全ての物体は必ずこのコンポーネントを含まなければなりません。

#### 属性

|名前|コンバーター|詳細|
|:-:|:-:|:-:|
|position|Vector3|この物体の座標|
|rotation|Rotation3|この物体の回転量|
|scale|Vector3|この物体の拡大率|
|rawMatrix|Object|利用されません|


##### position属性

**初期値** ・・・ `0,0,0`  
**コンバーター** ・・・ `Vector3`

この物体の座標


##### rotation属性

**初期値** ・・・ `0,0,0,1`  
**コンバーター** ・・・ `Rotation3`

この物体の回転量


##### scale属性

**初期値** ・・・ `1,1,1`  
**コンバーター** ・・・ `Vector3`

この物体の拡大率


##### rawMatrix属性

**初期値** ・・・ `null`  
**コンバーター** ・・・ `Object`

利用されません




## コンバーター詳細

### CanvasSizeConverterコンバーター

キャンバスのサイズ用のコンバーター  
数値を指定した場合(`100`など)はその値をそのまま返す。  
`aspect(1.6)`などと記述する時、キャンバスのアスペクト比を1.6にするようにリサイズする。  
`fit`と指定した時、親要素にちょうどマッチするサイズを返す。  
もし、親要素の高さが0である時かつ、親がbodyである際で`fit`が指定されていると、bodyへの高さ属性が指定されていないものと判断して、  
自動的にbodyに`height:100%`を割り当てる。

### GeometryConverterコンバーター

ジオメトリを指定するためのコンバーター  
`quad`など、ジオメトリ名を指定するか、Geometry型のインスタンスを渡す。

### MaterialConverterコンバーター

マテリアルを指定するためのコンバーター  
`<material>へのクエリ`が指定された場合は、そのクエリによって検索された先頭の`<material>`を用いる。  
`new(マテリアル名)`が指定された場合は、新しいマテリアルのインスタンスを生成して用いる。  
通常、マテリアルを指定するコンポーネントはマテリアルによって、そのコンポーネントが所持する属性が置き換わる。  
`new(マテリアル)`名で指定した場合、そのコンポーネント自身がマテリアルの属性を管理することになるので注意が必要。

### NodeConverterコンバーター



### TextureConverterコンバーター

テクスチャへの参照を取得するためのコンバーター  
渡すものが文字列である場合、4つの方法がある。  
`url`・・・指定したアドレスから画像を解決して取得する  
`backbuffer(バックバッファ名)`・・・名前付きバックバッファのリストから取得する  
`video(ビデオファイルへのURL)`・・・指定したアドレスからビデオを取得してテクスチャとして再生する(Buggy)  
`query(<texture>へのクエリ)`・・・指定したクエリで`<texture>`を探索して利用する。  
渡すものがオブジェクトである場合、5つの方法がある。  
`Texture2D型`・・・そのまま利用される  
`HTMLImageElement`・・・必要がある場合リサイズされた上で利用される。(自動的に2の累乗に変換される)  
`HTMLCanvasElement`・・・必要がある場合リサイズされた上で利用される。(自動的に2の累乗に変換される)  
`HTMLVideoElement`・・・必要がある場合リサイズされた上で、自動的に再生される(自動的に2の累乗に変換される)

### ViewportConverterコンバーター

ビューポートサイズを設定するためのコンバーター  
`auto`・・・親のキャンバスのサイズにあったビューポートサイズを返す  
`左端,上端,幅,高さ`・・・キャンバスのサイズを具体的に指定する。  
数値を指定するとピクセル単位になるが、数値に%をつければ親のキャンバス基準での比率指定ができる。



undefined
