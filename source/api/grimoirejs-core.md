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

#### addRootNode
Grimoire.jsで管理されるルートノードを追加します。
`html`に読み込まれた`goml`は、ページロード時にパースされ、そのルートノードは自動的にこのメソッドに渡されます。
追加したノードの`id`を返します。
- **定義**

  `public addRootNode(tag: HTMLScriptElement, rootNode: GomlNode): string`
- **使い方**

#### getRootNode
`goml`として読み込んだスクリプトタグを指定し、対応するツリーのルートノードを取得します。
- **定義**

  `public getRootNode(scriptTag: Element): GomlNode`
- **使い方**

#### clear
GrimoireInterfaceの状態をクリアし、その後`initialize`します。
クリアされるのは以下です。

+ nodeDeclarations
+ ComponentDeclaration
+ converters
+ rootNodes
+ loadTasks
+ nodeDictionary
+ componentDictionary

- **定義**

  `public clear(): void`
- **使い方**


#### registerComponent
Grimoire.jsにコンポーネントを追加し、その`ComponentDeclaration`を返します。
追加されたコンポーネントは、`goml`中で利用できるようになります。
名前が重複していた場合、例外を投げます。
コンポーネントは、オブジェクトかコンストラクタを指定します。
`debug`フラグが立っている場合、命名規則にに則っていなければ警告します。
`superComponent`には継承元コンポーネントを指定します。存在しなければ例外を投げます。
- **定義**

  `public registerComponent(name: string | NSIdentity, obj: Object | (new () => Component), superComponent?: string | NSIdentity | (new () => Component)): ComponentDeclaration`
- **使い方**

  コンポーネントの名前は`CamelCase`が推奨されます。
  簡易的にコンポーネントを追加するのには、オブジェクトを渡すのが簡単です。
  ```javascript
  gr.registerComponent("ComponentName",{
    attributes:{
      hoge:{
        converter:"Number",
        default:777
      },
      fuga:{
        converter:"String",
        default:"Grimoire"
      }
    },

    $awake(){
      /*~~~*/
    }
  })
  ```
  また、コンストラクタを指定することもできます。
  ```javascript
  class ComponentName{
    static get attributes(){
      return {
        hoge:{
          converter:"Number",
          default:777
        },
        fuga:{
          converter:"String",
          default:"Grimoire"
        }
      }
    }
    $awake(){
      /*~~~*/
    }
  }
  gr.registerComponent("ComponentName",ComponentName);
  ```
  ３つ目の引数に継承するコンポーネントを指定できます。
  ここでも、コンストラクタか、名前で指定できます。
  ```javascript
  gr.registerComponent("ComponentName1",ComponentName1,"SuperComponent");
  gr.registerComponent("ComponentName2",ComponentName2,SuperComponent);
  ```

#### registerNode
Grimoire.jsにノードを追加します。
追加されたノードは`goml`中で利用できます。
名前が重複していた場合、例外を投げます。
`debug`フラグが立っている場合、命名規則にに則っていなければ警告します。
ノードが持つべきコンポーネントのリストを、識別子で指定します。
ノードの属性の初期値を、指定することができます。
`superNode`には継承元ノードを指定します。存在しなければ例外を投げます。
`freezeAttributes`で、固定する属性を指定できます。
固定した属性は、`goml`,`NodeInterface`からの操作を禁止し、
`GomlNode`かコンポーネントのインスタンスからしか操作できなくなります。

- **定義**

  `public registerNode(name: string | NSIdentity,
    requiredComponents: (string | NSIdentity)[],
    defaults?: { [key: string]: any } | NSDictionary<any>,
    superNode?: string | NSIdentity,
    freezeAttributes?: string[]): void`
- **使い方**

  以下のように、ノードを追加します。

  ```javascript
  gr.registerNode("node-name",["ComponentName"],{
    hoge:100,
    fuga:"js"
  })

  gr.registerNode("node-name2",[],{
    hoge:200,
    fuga:"override default value 'js'."
  },"node-name");
  ```
  属性の固定は、以下のような状況で有用でしょう。
  ```javascript
  gr.registerNode("cube",[],{
    geometry:"cube"
  },"mesh",["geometry"]);
  ```

#### registerConverter
コンバータを追加します。

- **定義**

  `public registerConverter(name: string | NSIdentity, converter: ((this: Attribute, val: any) => any)): void`
- **使い方**

#### overrideDeclaration
ノードの宣言を上書きします。
指定したノードが存在しないときは例外を投げます。
`additionalComponents`でコンポーネントを追加することができます。
コンポーネントを削除することはできません。
`defaults`で属性の初期値を変更できます。

- **定義**

  `public overrideDeclaration(targetDeclaration: string | NSIdentity, additionalComponents: (string | NSIdentity)[]): NodeDeclaration`
  `public overrideDeclaration(targetDeclaration: string | NSIdentity, defaults: { [attrName: string]: any }): NodeDeclaration`
  `public overrideDeclaration(targetDeclaration: string | NSIdentity, additionalComponents: (string | NSIdentity)[], defaults: { [attrName: string]: any }): NodeDeclaration`
- **使い方**
  以下のようにして、カメラの初期値を書き換えることができます。

  ```javascript
  gr.overrideDeclaration("camera",{
    position:"10,3,10",
    rotation:"y(45)"
  })
  ```
  また、以下のようにして、カメラをマウスで操作できるようにできます。
  (`MouseCameraControll`は、[grimoirejs-fundamental](url)に含まれます。)

  ```javascript
  gr.overrideDeclaration("camera",["MouseCameraControll"])
  ```

#### queryRootNodes
内部使用
- **定義**

  `public queryRootNodes(query: string): GomlNode[]`
- **使い方**

#### extendGrimoireInterface
GrimoireInterfaceにメソッドを追加します。
既に存在する識別子を指定すると、例外を投げます。
**指定した関数内では、`this`はGrimoireInterfaceにバインドされます**
- **定義**

  `public extendGrimoireInterface(name:string, func:Function):void`
- **使い方**

#### extendGomlInterface
GomlInterfaceにメソッドを追加します。
既に存在する識別子を指定すると、例外を投げます。
**指定した関数内では、`this`はGrimoireInterfaceにバインドされます**
- **定義**

  `public extendGomlInterface(name:string, func:Function):void`
- **使い方**

#### extendNodeInterface
NodeInterfaceにメソッドを追加します。
既に存在する識別子を指定すると、例外を投げます。
**指定した関数内では、`this`はGrimoireInterfaceにバインドされます**
- **定義**

  `public extendNodeInterface(name:string, func:Function):void`
- **使い方**


## GomlInterface
複数、または単数のツリーを操作するためのインタフェースです。
`GrimoireInterface`にクエリを渡して関数として呼び出すことで取得できます。

### コンストラクタ
constructor(rootNodes: GomlNode[])
### 関数として呼び出し
`gomlInterface`は関数として呼び出して、`NodeInterface`を取得できます。
引数として、対象となるノードを指定するクエリを渡します。
#### gr("selector")(query: string): NodeInterface;
- **定義**

  ```typescript
  function(selector: string): NodeInterface;
  ```
- **パラメータ**
  - selector

    対象となるノードを指定するセレクタ
- **使い方**

  セレクタで指定されたノードを、対象となるすべてのツリーからそれぞれ探索して返します。
  たとえば、`goml`上で以下のように２つのノードが読み込まれていたとします。

  ```xml
  <mesh id="nodeId" class="nodeClass"/>
  <mesh class="nodeClass"/>
  ```
  この`goml`が`html`に以下のように埋め込まれていたとします。
  ```html
  <script id="main" type="text/goml" src="path/to/goml"></script>
  ```
  このとき、最初の`mesh`を以下のように指定できます。

  ```javascript
  var node = gr("#main")("#nodeId");
  ```
  また、以下のようにclassを指定するセレクタを渡して、複数の`mesh`を同時に対象にできます。

  ```javascript
  var nodes = gr("#main")(".meshClass");
  ```
  > *注意:*  
  > 操作対象のNodeは一つとは限りません。セレクタで指定される複数の対象同時に操作できます。
### プロパティ
#### rootNodes
GomlInterfaceが対象とするツリー群のルートノードのリストです。
- **型**

  `GomlNode[]`
- **使い方**

### メソッド
#### getNodeById
#### queryFunc


## NodeInterface
### コンストラクタ
constructor(public nodes: GomlNode[][])
### プロパティ
#### nodes
#### count
#### nodeDeclarations
`goml`上で利用可能なすべてのタグの定義を取得できます。
- **構文**

  ```typescript
  gr.nodeDeclarations
  ```
- **型**

  NSDictionary<NodeDeclaration>
- **使い方**
#### isEmpty
### メソッド
#### get
#### getAttribute
属性を取得します。
- **定義**

  `public queryRootNodes(query: string): GomlNode[]`
- **使い方**

#### setAttribute
属性を設定します。
#### on
イベントリスナを追加します
- **定義**
- **使い方**
#### off
イベントリスナを削除します
- **定義**
- **使い方**
#### append
対象となるノードそれぞれに、指定したタグをパースした結果を追加します。
- **定義**

  `public append(tag: string): NodeInterface`
- **使い方**
#### remove
対象となるノードを、ツリーから削除します。
- **定義**
- **使い方**
#### forEach
対象となるノードそれぞれに対して関数を適用します。
- **定義**
- **使い方**
#### find
述語を満たす最初のノードを取得します
- **定義**
- **使い方**
#### watch
- **定義**
- **使い方**
#### setEnabled
- **定義**
- **使い方**
#### children
- **定義**
- **使い方**
#### addComponent
- **定義**
- **使い方**
#### first
最初のノードを取得します。
- **定義**
- **使い方**
#### single
最初のノードを取得しますが、このインタフェースの対象が単一でなければ例外を投げます。
- **定義**
- **使い方**
#### filter
- **定義**
- **使い方**
#### toArray
対象を配列にして返します。
- **定義**
- **使い方**
#### addChildByName
- **定義**
- **使い方**
#### sendMessage
- **定義**
- **使い方**
#### broadcastMessage
- **定義**
- **使い方**



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

# 標準プラグイン
grimoirejs-coreで定義される標準のノード、コンポーネント、コンバータです。
## ノード
説明
### コンポーネント
### 属性
### 親

## コンポーネント
説明
###コンポーネント名
#### 属性
説明
##### 名前
##### コンバータ
##### デフォルト
#### 親
#### 発行イベント






## コンバータ
### String
- **出力型**

  ```
  string
  ```
- **入力型**

  * String ・・・ そのまま出力されます。
  * Object ・・・ toString関数が存在する場合それが呼び出されます。

### Number

- **出力型**

  ```
  number
  ```
- **入力**

  * String・・・Number.parseNumberにより処理され出力されます。
  * Number・・・そのまま出力されます。

### Boolean

- **出力型**

  ```
  boolean
  ```
- **入力**

  * String・・・"true"もしくは"false"のみ
  * Boolean・・・そのまま出力されます。

### Object

- **出力型**

  ```
  any
  ```
- **入力**

  * Object・・・そのまま出力されます。

### Component

- **出力型**

  ```
  <T> where T extends Component
  ```
- **コンバーター引数**

  * target・・・取得対象のコンポーネント名
- **入力可能なもの**

  * String・・・クエリとして解釈されます。属するツリーから該当する**最初の一つ**の**ノード**を見つけ出し、そこから`target`に合致するコンポーネントを取得します。
  * GomlNode・・・対象となるノードの中から最初の`target`に合致するコンポーネントを取り出します。
  * Component・・・そのまま渡されます(名称が`target`に指定されたものでない時例外がでます)

### Enum

- **出力型**

  ```
  number
  ```
- **コンバーター引数**

  * table・・・列挙する対象のハッシュテーブル。keyはString、値はnumberです。
- **入力**

  * String・・・テーブルのkeyとしてその値を返します。keyとして存在しないときは例外をなげます。
  * number・・・そのまま通します

### Array

- **出力型**

  ```
  Array
  ```
- **コンバーター引数**

  * type・・・配列の要素に適用されるコンバータ。存在しないと実行時に例外を投げます。
- **入力**

  * String・・・ **半角スペース** で区切り、コンバータ引数で指定されたコンバータに通されます。
  * Array・・・要素をそれぞれコンバータに通した新しい配列を返します。

### NumberArray

- **出力型**

  ```
  number[]
  ```
- **入力**

  * String・・・ **,** (カンマ)で区切り、`Number.parseFloat`を通します。
  * Array・・・そのまま返します。
### StringArray

- **出力型**

  ```
  Array
  ```
- **入力**

  * String・・・ **半角スペース** で区切って返します。
  * Array・・・そのまま返します。




















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
