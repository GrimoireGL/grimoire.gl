---
type: doc
title: grimoirejs-fundamental
order: 2
---

この記事は**grimoirejs-fundamental**プラグイン(以降、fundamental)について記述したものです。
このプラグインはGrimoire.jsが提供する最も基本的なプラグインの一つであり、3D描画関連の基礎になる共通のレイヤーを提供します。

**特別な事情がない限り、任意の3D描画を前提とするプラグインはこのプラグインを前提プラグインとし、fundamentalに含まれているAPIを活用して3D描画を実装すべきです。**

fundamentalは以下のような特徴を持ちます。

* 拡張可能性
* 高い分業性(シェーダーやシーン構築など)

## コンバーター

### String

**出力型**

```
string
```

**入力可能なもの**

* String ・・・ そのまま出力されます。
* Object ・・・ toString関数が存在する場合それが呼び出されます。

### Number

**出力型**

```
number
```

**入力可能なもの**

* String・・・Number.parseNumberにより処理され出力されます。
* Number・・・そのまま出力されます。

### Boolean

**出力型**

```
boolean
```

**入力可能なもの**

* String・・・"true"もしくは"false"のみ
* Boolean・・・そのまま出力されます。

### Component

**出力型**

```
<T> where T extends Component
```

**コンバーター引数**

* target・・・取得対象のコンポーネント名

**入力可能なもの**

* String・・・クエリとして解釈されます。属するツリーから該当する**最初の一つ**の**ノード**を見つけ出し、そこから`target`に合致するコンポーネントを取得します。
* GomlNode・・・対象となるノードの中から最初の`target`に合致するコンポーネントを取り出します。
* Component・・・そのまま渡されます(名称が`target`に指定されたものでない時例外がでます)

### Vector2

**出力型**

```
Vector2
```

**入力可能なもの**

* String・・・Vector2.parseにより処理されます。
* Vector2・・・そのまま渡されます。

### Vector3

**出力型**

```
Vector3
```

**入力可能なもの**

* String・・・Vector3.parseにより処理されます。
* Vector3・・・そのまま処理されます。

### Vector4

**出力型**

```
Vector4
```

**入力可能なもの**

* String・・・Vector4.parseにより処理されます。
* Vector4・・・そのまま処理されます。

### Color3

```
Color3
```

**入力可能なもの**

* String・・・Color3.parseにより処理されます。
* Color3・・・そのまま処理されます。
* Color4・・・Alpha値を無視したColor3を生成して渡されます。


### Color4

```
Color4
```

**入力可能なもの**

* String・・・Color4.parseにより処理されます。
* Color4・・・そのまま処理されます。
* Color3・・・Alpha値を1.0としたColor4を生成して渡されます。

## AssetLoadingManager コンポーネント
<!-- EDIT HERE(@Component)-->
非同期的な解決を必要とするようなリソース群のロードを管理しているコンポーネント。
このコンポーネントにより、初期時にロード画面を表示します。
また、ロード終了後に他のコンポーネントに処理の開始を通知してレンダリングループを開始します。
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| loadingProgress | number | 0 | なし |
| autoStart | boolean | true | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### loadingProgress 属性

 * `converter`: number
 * `defaultValue`: 0

<!-- EDIT HERE(loadingProgress)-->
読み取り専用。現在のロード状況を100分率で返します。
<!-- /EDIT HERE-->
### autoStart 属性

 * `converter`: boolean
 * `defaultValue`: true

<!-- EDIT HERE(autoStart)-->
リソースのロード終了後に自動的にレンダリングループを開始するかどうか。
これがfalseの場合、ユーザーが自らLoopManagerに対してbeginメソッドを呼ばなければ、一切の描画処理は行われません。
<!-- /EDIT HERE-->

## Camera コンポーネント
<!-- EDIT HERE(@Component)-->

シーンの描画をするカメラの役割をするコンポーネントです。
シーン中の物体を描画する際にこのコンポーネントにより生成されたビュー行列や射影行列が用いられます。

<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| fovy | number | 0.3 | なし |
| near | number | 0.01 | なし |
| far | number | 10 | なし |
| aspect | number | 1.6 | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### fovy 属性

 * `converter`: number
 * `defaultValue`: 0.3

<!-- EDIT HERE(fovy)-->
視野角。ラジアン単位で指定します。
1/2π以上の値は指定できません。
<!-- /EDIT HERE-->
### near 属性

 * `converter`: number
 * `defaultValue`: 0.01

<!-- EDIT HERE(near)-->
近クリップ面(カメラから物体が映る最短の距離)を指定します。
必ず、正の値を指定する必要があります。
<!-- /EDIT HERE-->
### far 属性

 * `converter`: number
 * `defaultValue`: 10

<!-- EDIT HERE(far)-->
遠クリップ面(カメラから物体が映る最長の距離)を指定します。
遠ければ遠いほどいいわけではなく、近クリップ面との差があまりにも大きすぎると、物体の前後関係が曖昧になってしまう場所が発生し得ます。
<!-- /EDIT HERE-->
### aspect 属性

 * `converter`: number
 * `defaultValue`: 1.6

<!-- EDIT HERE(aspect)-->
スクリーン上のアスペクト比を指定します。
<!-- /EDIT HERE-->

## CanvasInitializer コンポーネント
<!-- EDIT HERE(@Component)-->
キャンバスの初期化を司るコンポーネントです。
このコンポーネントに対してtreeInitializedが呼ばれた瞬間にスクリプトタグの存在した場所に対して`<canvas>`タグの生成を試みます。
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| width | number | 640 | なし |
| height | number | 480 | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### width 属性

 * `converter`: number
 * `defaultValue`: 640

<!-- EDIT HERE(width)-->
キャンバスの幅を指します。
<!-- /EDIT HERE-->
### height 属性

 * `converter`: number
 * `defaultValue`: 480

<!-- EDIT HERE(height)-->
キャンバスの高さを指します。
<!-- /EDIT HERE-->

## Geometry コンポーネント
<!-- EDIT HERE(@Component)-->
あるプリミティブなどのジオメトリを含まれているGOML内でで使用可能にします。
このコンポーネントは`type`属性に合わせて必要な属性値を動的に生成します。
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| type | string | undefined | なし |
| name | string | undefined | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### type 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(type)-->
生成するジオメトリのタイプです。任意のジオメトリを`GeometryFactory.addType`から追加することによりユーザーが独自のパラメーターを割り当てたジオメトリを作成することができます。
<!-- /EDIT HERE-->
### name 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(name)-->
生成したジオメトリにつける名前です。これを用いて`GeometryConverter`は対象となるジオメトリを識別します。
例えば、`MeshRenderer`の`geometry`属性などに指定する名前になります。
<!-- /EDIT HERE-->

## GeometryRegistory コンポーネント
<!-- EDIT HERE(@Component)-->
Geometryの登録に関する処理をあらかじめ行うためのコンポーネントです。

gomlノードにあらかじめ含められており、ユーザーが直接いじる必要はほぼありません。
<!-- /EDIT HERE-->
属性なし
## LoopManager コンポーネント
<!-- EDIT HERE(@Component)-->
レンダリングループを管理するコンポーネントです。
loopEnabledがtrueである場合、自動的にそのブラウザのrequestAnimationFrameの際に処理を実行します。
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| loopEnabled | boolean | false | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### loopEnabled 属性

 * `converter`: boolean
 * `defaultValue`: false

<!-- EDIT HERE(loopEnabled)-->
ループが有効かどうか。
通常、この属性を編集する必要はありません。AssetLoadingManagerコンポーネントがロード終了時に自動的にtrueにマークします。
<!-- /EDIT HERE-->

## Material コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| type | string | undefined | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### type 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(type)-->
<!-- /EDIT HERE-->

## MaterialContainer コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| material | material | undefined | `componentBoundTo`</br> "_materialComponent" </br>    </br>  </br> |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### material 属性

 * `converter`: material
 * `defaultValue`: undefined

<!-- EDIT HERE(material)-->
<!-- /EDIT HERE-->

## MaterialImporter コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| type | string | undefined | なし |
| src | string | undefined | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### type 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(type)-->
<!-- /EDIT HERE-->
### src 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(src)-->
<!-- /EDIT HERE-->

## MaterialManager コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
属性なし
## MeshRenderer コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| geometry | geometry | "quad" | なし |
| targetBuffer | string | "default" | なし |
| layer | string | "default" | なし |
| drawCount | number | Number.MAX_VALUE | なし |
| drawOffset | number | 0 | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### geometry 属性

 * `converter`: geometry
 * `defaultValue`: "quad"

<!-- EDIT HERE(geometry)-->
<!-- /EDIT HERE-->
### targetBuffer 属性

 * `converter`: string
 * `defaultValue`: "default"

<!-- EDIT HERE(targetBuffer)-->
<!-- /EDIT HERE-->
### layer 属性

 * `converter`: string
 * `defaultValue`: "default"

<!-- EDIT HERE(layer)-->
<!-- /EDIT HERE-->
### drawCount 属性

 * `converter`: number
 * `defaultValue`: Number.MAX_VALUE

<!-- EDIT HERE(drawCount)-->
<!-- /EDIT HERE-->
### drawOffset 属性

 * `converter`: number
 * `defaultValue`: 0

<!-- EDIT HERE(drawOffset)-->
<!-- /EDIT HERE-->

## MouseCameraControl コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| rotateX | number | 1 | なし |
| rotateY | number | 1 | なし |
| moveZ | number | 1 | なし |
| moveSpeed | number | 1 | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### rotateX 属性

 * `converter`: number
 * `defaultValue`: 1

<!-- EDIT HERE(rotateX)-->
<!-- /EDIT HERE-->
### rotateY 属性

 * `converter`: number
 * `defaultValue`: 1

<!-- EDIT HERE(rotateY)-->
<!-- /EDIT HERE-->
### moveZ 属性

 * `converter`: number
 * `defaultValue`: 1

<!-- EDIT HERE(moveZ)-->
<!-- /EDIT HERE-->
### moveSpeed 属性

 * `converter`: number
 * `defaultValue`: 1

<!-- EDIT HERE(moveSpeed)-->
<!-- /EDIT HERE-->

## RenderBuffer コンポーネント
<!-- EDIT HERE(@Component)-->
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| name | string | undefined | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### name 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(name)-->
<!-- /EDIT HERE-->

## Renderer コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| camera | component | "camera" | `target`</br> "CAMERA"</br>    </br> |
| viewport | viewport | "auto" | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### camera 属性

 * `converter`: component
 * `defaultValue`: "camera"

<!-- EDIT HERE(camera)-->
<!-- /EDIT HERE-->
### viewport 属性

 * `converter`: viewport
 * `defaultValue`: "auto"

<!-- EDIT HERE(viewport)-->
<!-- /EDIT HERE-->

## RendererManager コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| bgColor | color4 | new Color4(0, 0, 0, 1) | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### bgColor 属性

 * `converter`: color4
 * `defaultValue`: new Color4(0, 0, 0, 1)

<!-- EDIT HERE(bgColor)-->
<!-- /EDIT HERE-->

## RenderQuad コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| out | string | "default" | なし |
| depthBuffer | string | undefined | なし |
| targetBuffer | string | "default" | なし |
| clearColor | color4 | "#0000" | なし |
| clearColorEnabled | boolean | true | なし |
| clearDepthEnabled | boolean | true | なし |
| clearDepth | number | 1.0 | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### out 属性

 * `converter`: string
 * `defaultValue`: "default"

<!-- EDIT HERE(out)-->
<!-- /EDIT HERE-->
### depthBuffer 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(depthBuffer)-->
<!-- /EDIT HERE-->
### targetBuffer 属性

 * `converter`: string
 * `defaultValue`: "default"

<!-- EDIT HERE(targetBuffer)-->
<!-- /EDIT HERE-->
### clearColor 属性

 * `converter`: color4
 * `defaultValue`: "#0000"

<!-- EDIT HERE(clearColor)-->
<!-- /EDIT HERE-->
### clearColorEnabled 属性

 * `converter`: boolean
 * `defaultValue`: true

<!-- EDIT HERE(clearColorEnabled)-->
<!-- /EDIT HERE-->
### clearDepthEnabled 属性

 * `converter`: boolean
 * `defaultValue`: true

<!-- EDIT HERE(clearDepthEnabled)-->
<!-- /EDIT HERE-->
### clearDepth 属性

 * `converter`: number
 * `defaultValue`: 1.0

<!-- EDIT HERE(clearDepth)-->
<!-- /EDIT HERE-->

## RenderScene コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| layer | string | "default" | なし |
| depthBuffer | string | undefined | なし |
| out | string | "default" | なし |
| clearColor | color4 | "#0000" | なし |
| clearColorEnabled | boolean | true | なし |
| clearDepthEnabled | boolean | true | なし |
| clearDepth | number | 1.0 | なし |
| material | material | undefined | `componentBoundTo`</br> "_materialComponent"</br>    </br> |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### layer 属性

 * `converter`: string
 * `defaultValue`: "default"

<!-- EDIT HERE(layer)-->
<!-- /EDIT HERE-->
### depthBuffer 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(depthBuffer)-->
<!-- /EDIT HERE-->
### out 属性

 * `converter`: string
 * `defaultValue`: "default"

<!-- EDIT HERE(out)-->
<!-- /EDIT HERE-->
### clearColor 属性

 * `converter`: color4
 * `defaultValue`: "#0000"

<!-- EDIT HERE(clearColor)-->
<!-- /EDIT HERE-->
### clearColorEnabled 属性

 * `converter`: boolean
 * `defaultValue`: true

<!-- EDIT HERE(clearColorEnabled)-->
<!-- /EDIT HERE-->
### clearDepthEnabled 属性

 * `converter`: boolean
 * `defaultValue`: true

<!-- EDIT HERE(clearDepthEnabled)-->
<!-- /EDIT HERE-->
### clearDepth 属性

 * `converter`: number
 * `defaultValue`: 1.0

<!-- EDIT HERE(clearDepth)-->
<!-- /EDIT HERE-->
### material 属性

 * `converter`: material
 * `defaultValue`: undefined

<!-- EDIT HERE(material)-->
<!-- /EDIT HERE-->

## Scene コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
属性なし
## Texture コンポーネント
<!-- EDIT HERE(@Component)-->











<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| src | string | undefined | なし |
| minFilter | enum | "LINEAR" | `table`</br> </br>        LINEAR: WebGLRenderingContext.LINEAR,</br>        NEAREST: WebGLRenderingContext.NEAREST,</br>        NEAREST_MIPMAP_NEAREST: WebGLRenderingContext.NEAREST_MIPMAP_NEAREST,</br>        NEAREST_MIPMAP_LINEAR: WebGLRenderingContext.NEAREST_MIPMAP_LINEAR,</br>        LINEAR_MIPMAP_NEAREST: WebGLRenderingContext.LINEAR_MIPMAP_NEAREST,</br>        LINEAR_MIPMAP_LINEAR: WebGLRenderingContext.LINEAR_MIPMAP_LINEAR</br>      </br>    </br> |
| magFilter | enum | "LINEAR" | `table`</br> </br>        LINEAR: WebGLRenderingContext.LINEAR,</br>        NEAREST: WebGLRenderingContext.NEAREST</br>      </br>    </br> |
| wrapS | enum | "REPEAT" | `table`</br> </br>        REPEAT: WebGLRenderingContext.REPEAT,</br>        MIRRORED_REPEAT: WebGLRenderingContext.MIRRORED_REPEAT,</br>        CLAMP_TO_EDGE: WebGLRenderingContext.CLAMP_TO_EDGE</br>      </br>    </br> |
| wrapT | enum | "REPEAT" | `table`</br> </br>        REPEAT: WebGLRenderingContext.REPEAT,</br>        MIRRORED_REPEAT: WebGLRenderingContext.MIRRORED_REPEAT,</br>        CLAMP_TO_EDGE: WebGLRenderingContext.CLAMP_TO_EDGE</br>      </br>    </br>  </br> |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### src 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(src)-->
<!-- /EDIT HERE-->
### minFilter 属性

 * `converter`: enum
 * `defaultValue`: "LINEAR"

<!-- EDIT HERE(minFilter)-->
<!-- /EDIT HERE-->
### magFilter 属性

 * `converter`: enum
 * `defaultValue`: "LINEAR"

<!-- EDIT HERE(magFilter)-->
<!-- /EDIT HERE-->
### wrapS 属性

 * `converter`: enum
 * `defaultValue`: "REPEAT"

<!-- EDIT HERE(wrapS)-->
<!-- /EDIT HERE-->
### wrapT 属性

 * `converter`: enum
 * `defaultValue`: "REPEAT"

<!-- EDIT HERE(wrapT)-->
<!-- /EDIT HERE-->

## TextureBuffer コンポーネント
<!-- EDIT HERE(@Component)-->
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| name | string | undefined | なし |
| format | enum | WebGLRenderingContext.RGBA | `table`</br> </br>        RGBA: WebGLRenderingContext.RGBA,</br>        RGB: WebGLRenderingContext.RGB</br>      </br>    </br>  </br> |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### name 属性

 * `converter`: string
 * `defaultValue`: undefined

<!-- EDIT HERE(name)-->
<!-- /EDIT HERE-->
### format 属性

 * `converter`: enum
 * `defaultValue`: WebGLRenderingContext.RGBA

<!-- EDIT HERE(format)-->
<!-- /EDIT HERE-->

## Transform コンポーネント
<!-- EDIT HERE(@Component)-->







<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| "position" | vector3 | Vector3.Zero | なし |
| "rotation" | rotation3 | Quaternion.Identity | なし |
| "scale" | vector3 | Vector3.One | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### "position" 属性

 * `converter`: vector3
 * `defaultValue`: Vector3.Zero

<!-- EDIT HERE("position")-->
<!-- /EDIT HERE-->
### "rotation" 属性

 * `converter`: rotation3
 * `defaultValue`: Quaternion.Identity

<!-- EDIT HERE("rotation")-->
<!-- /EDIT HERE-->
### "scale" 属性

 * `converter`: vector3
 * `defaultValue`: Vector3.One

<!-- EDIT HERE("scale")-->
<!-- /EDIT HERE-->

## ノード
