---
type: doc
title: grimoirejs-core
order: 1
---

Grimoire.jsの本体である**grimoirejs-core**のAPIドキュメントです。
grimoirejs-coreの基本的な使い方に関しては、[ガイド](todo)を参照してください。

# グローバルインタフェース
主にwebページ上からの操作のために用意されたインタフェース。
Grimoire.jsを操作するためのオブジェクトは、`GrimoireInterface`クラスのインスタンスです。
`GrimoireInterface`は`<script>`タグでWebページにロードされている場合、**`gr`グローバル変数からアクセスできます**。
もしnpmを利用されるのであれば、以下のようにしてこのオブジェクトを参照できます。

```javascript
var gr = require("grimoirejs");
```
また、webページ上では、`gr`と同じ参照を`GrimoireJS`グローバル変数からも得ることができます。

## GrimoireInterface
Grimoire.jsの設定、プラグインの追加や管理、ノードやコンポーネントへのアクセスを提供します。

### 関数として呼び出す
GrimoireInterfaceは関数として呼び出すことができます。このとき、引数に応じていくつかのオーバーロードがあります。

#### gr("selector")
- **定義**

  ```typescript
  function gr(selector: string): GOMLInterface;
  ```
- **パラメータ**
  - selector

    対象となる*goml*が記述された`<script>`タグを指定するセレクタ
- **使い方**

  セレクタで指定された、`type="text/goml"`の指定されている`<script>`タグを探索し、対応するツリーに対する`GomlInterface`を取得します。
  `GomlInterface`については[こちら](todo)を参照してください。
  たとえば、`html`上で以下のように２つの`gomlが`読み込まれていたとします。

  ```html
  <script id="gomlId" class="gomlClass" type="text/goml" src="./hoge.goml"></script>
  <script class="gomlClass" type="text/goml" src="./fuga.goml"></script>
  ```
  このとき、最初の`goml`を以下のように指定できます。

  ```javascript
  var goml = gr("#gomlId");
  ```
  また、以下のようにclassを指定するセレクタを渡して、複数の`goml`を同時に対象にできます。

  ```javascript
  var gomls = gr("script.gomlClass");
  ```
  > *注意:*  
  > 操作対象のGOMLは一つとは限りません。セレクタで指定される複数の対象同時に操作できます。また、セレクタの対象は`canvas`ではなく`script`タグである事に注意してください。

#### gr(rootNode[])

- **定義**

  ```typescript
  function gr(rootNodes: GomlNode[]): GOMLInterface;
  ```
- **パラメータ**
  - rootNodes

    対象となる*goml*のツリーのルートノードの配列
- **使い方**

  引数で指定したルートノード群に対応するツリーに対する`GomlInterface`を取得します。
  対象としたいツリーのルートノードが既にわかっている場合は、セレクタで指定するよりこちらのほうが高速です。それ以外の挙動は[セレクタで指定した場合](todo)と同じです。

#### gr(function)

  - **定義**

    ```typescript
    function gr(callback:()): void;
    ```
  - **パラメータ**
    - callback

      ```javascript
      function(scriptTags):void
      ```
      ページ上のgomlが全てマウントされた後に呼ばれるコールバック。引数としてページ上のすべての`goml`が記述された`<script>`タグの配列が渡されます。
  - **使い方**

    通常、`goml`がマウントされる前にツリーを操作することはできません。従って、`gr(selector)`などの操作もこのコールバック内で行うことになります。
    例えば以下のように、スクリプトからツリー上にオブジェクトを配置する場合に使用します

    ```javascript
    gr(function(scriptTags){
      var gomlCount = scriptTags.length;
      console.log("this page has "+gomlCount+" gomls.");

      var target = gr("#gomlId")("#targetNode");
      for (let i = 0; i < 10; i++) {
          target.addChildByName("mesh",{
            geometry:"cube",
            position:i+",0,0"
          });
      }
    });
    ```

### プロパティ

#### nodeDeclarations
`goml`上で利用可能なすべてのタグの定義を取得できます。
- **構文**

  ```typescript
  gr.nodeDeclarations
  ```
- **型**

  NSDictionary<NodeDeclaration>
- **使い方**

  `gr.registerNode`メソッドによって登録されたすべてのノードがこのプロパティで管理されます。`goml`上でタグとして用いられるのはここから取得できるノードであり、それ以外にありません。
  以下のようにして、利用可能なすべてのノード名を表示できます。

  ```javascript
  var nodes = gr.nodeDeclarations;
  nodes.forEach(function(node){
    console.log(node.name.fqn);
  });
  ```

#### componentDeclarations
`goml`上で利用可能なすべてのコンポーネントの定義を取得できます。
- **構文**

  ```typescript
  gr.componentDeclarations
  ```
- **型**

  `NSDictionary<ComponentDeclaration>`
- **使い方**

  `gr.registerComponent`メソッドによって登録されたすべてのコンポーネントがここで管理されます。`goml`上で用いられるコンポーネントはすべてここから取得でき、それ以外にはありません。
  以下のようにして、利用可能なすべてのコンポーネント名を表示できます。

  ```javascript
  var components = gr.componentDeclarations;
  components.forEach(function(component){
    console.log(component.name.fqn);
  });
  ```

#### converters
属性に利用可能なすべてのコンバータを取得します。
- **構文**

  ```typescript
  gr.converters
  ```
- **型**

  `NSDictionary<IAttributeConverter>`
- **使い方**

  `gr.registerConverter`メソッドによって登録されたすべてのコンバータがここで管理されます。`goml`上で用いられるコンバータはすべてここから取得でき、それ以外にはありません。
  以下のようにして、利用可能なすべてのコンポーネント名を表示できます。

  ```javascript
  var components = gr.componentDeclarations;
  components.forEach(function(component){
    console.log(component.name.fqn);
  });
  ```
  コンバータ作成時に内部で別のコンバータを呼び出したい場合は、`Attribute.convert`メソッドが便利です。

#### rootNodes
ページ上のすべてのツリーのルートノードがここで管理されます。
- **構文**

  `gr.rootNodes`
- **型**

  `{ [rootNodeId: string]: GomlNode }`
- **使い方**

#### lib
Grimoire.jsのバージョンなどのメタ情報や、内部で利用されたり、プラグインで追加されたクラスにアクセスできます。
- **構文**

  `gr.lib`
- **型**

  `{
    [key: string]: {
      __VERSION__: string;
      __NAME__: string;
      [key: string]: any;
    }
  }`
- **使い方**

#### loadTasks
[`gr.register`メソッド](todo)によって追加されたロードタスクの配列。[`gr.resolvePlugins`](todo)メソッドを実行すると、先頭から順に非同期で呼び出されます。
[`gr.clear`](todo)メソッドで内容がクリアされます。
- **構文**

  `gr.loadTasks`
- **型**

  `(() => Promise<void>)[]`
- **使い方**

#### nodeDictionary
ページ上に存在するすべてのマウント済みノードをここで管理します。ノードが`dispose`されるとここからも削除されます。
- **型**
  `{ [nodeId: string]: GomlNode }`
- **使い方**

#### componentDictionary
ページ上に存在するすべてのマウント済みコンポーネントをここで管理します。コンポーネントが`dispose`されるとここからも削除されます。
- **型**

  `{ [componentId: string]: Component }`
- **使い方**

#### initializedEventHandler
[`gr(function)`](todo)で登録されたコールバック。
- **型**

  `((scriptTags: HTMLScriptElement[]) => void)[]`
- **使い方**


#### debug
デバッグオプション。デフォルトでtrue。
trueのときは様々な警告が出力されますが、パフォーマンスが若干低下します。プロダクションでは`false`にしてください。
- **型**

  `boolean`
- **使い方**
  ```javascript
  gr.debug = false;
  ```

### メソッド

#### ns
- **定義**

  ```typescript
   function ns(namespace: string): (name: string) => NamespacedIdentity;
  ```
- **使い方:**

  ノードやコンポーネントなどの識別に用いる名前空間オブジェクト(`NSIdentity`)を返します。

  プラグインを作成する場合、外部のプラグインとの名前の競合を防ぐため、ノードやコンポーネントの指定は単に文字列で行うのではなく、可能な限り`NSIdentity`を利用してください。`NSIdentity`は`NSIdentity.from`から直接インスタンスを生成できますが、このメソッドは利便性のためのエイリアスとして用意されています。

  ```javascript
  var g = gr.ns("http://grimoire.gl/ns/sample");
  var id = g("TEST"); // be quivalent to NSIdentity.from("http://grimoire.gl/ns/sample","TEST")
  ```

#### initialize
`grimoirejs-core`で定義される標準のノードとコンポーネント、コンバータを登録します。通常はページがロードされたタイミングで自動的に呼ばれます。
- **定義**

  `public initialize(): void`
- **使い方**

#### register
プラグインの登録と初期化を行う関数を登録します。
[`gr.resolvePlugins`](todo)メソッドで順に実行されます。
- **定義**

  `public register(loadTask: () => Promise<void>): void`
- **使い方**

#### resolvePlugins
[`gr.register`](todo)メソッドで登録された関数を順に実行します。通常、ページロード時に自動的に実行されます。
- **定義**

  `public async resolvePlugins(): Promise<void> `
- **使い方**

#### getCompanion
- **定義**

  `public getCompanion(scriptTag: Element): NSDictionary<any>`
- **使い方**

#### addRootNode
- **定義**

  `public addRootNode(tag: HTMLScriptElement, rootNode: GomlNode): string`
- **使い方**

#### getRootNode
- **定義**

  `public getRootNode(scriptTag: Element): GomlNode`
- **使い方**

#### clear
- **定義**

  `public clear(): void`
- **使い方**

#### registerComponent
- **定義**

  `public registerComponent(name: string | NSIdentity, obj: Object | (new () => Component), superComponent?: string | NSIdentity | (new () => Component)): ComponentDeclaration`
- **使い方**

#### registerNode
- **定義**

  `public registerNode(name: string | NSIdentity,
    requiredComponents: (string | NSIdentity)[],
    defaults?: { [key: string]: any } | NSDictionary<any>,
    superNode?: string | NSIdentity, freezeAttributes?: string[]): void`
- **使い方**

#### registerConverter
- **定義**

  `public registerConverter(name: string | NSIdentity, converter: ((this: Attribute, val: any) => any)): void`
- **使い方**

#### overrideDeclaration
- **定義**

  `public overrideDeclaration(targetDeclaration: string | NSIdentity, additionalComponents: (string | NSIdentity)[]): NodeDeclaration`
- **使い方**

#### queryRootNodes
- **定義**

  `public queryRootNodes(query: string): GomlNode[]`
- **使い方**

#### extendGrimoireInterface
- **定義**

  `public extendGrimoireInterface(name:string, func:Function):void`
- **使い方**

#### extendGomlInterface
- **定義**

  `public extendGomlInterface(name:string, func:Function):void`
- **使い方**

#### extendNodeInterface
- **定義**

  `public extendNodeInterface(name:string, func:Function):void`
- **使い方**


## GomlInterface
## NodeInterface

# 基本クラス
grimoirejs-coreでは、すべてのオブジェクトは`GomlNode`と`Component`,`Attribute`などの構造で表現されます。
もしプラグインの作成に挑戦するのであれば、それらのクラスの機能を理解していたほうが良いでしょう。
これらの設計指向については、[ガイド]()を参照してください。

## GomlNode
## Component
## Attribute
## Converter
## NSIdentity
## NSDictionary

# データ型
プラグインの登録の際に利用されるデータ形式です。
## NodeDeclaration
## ComponentDeclaration
## AttributeDeclaration

# その他
これらはgrimoirejs-coreの内部実装に利用されているクラスで、通常触れる機会はありません。
しかし、Grimoire.jsの挙動を完全に制御するためにはこれらの仕組みを知る必要があります。
## GomlLoader
## GomlParser
## Constants







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
