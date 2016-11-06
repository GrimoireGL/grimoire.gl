---
type: doc
title: Top-Level API
order: 0
---

Grimoire.jsを初めて用いる際、最初に扱うjavascriptのAPIはおそらくこれらのトップレベルAPIでしょう。 これらのAPIによってユーザーは自身のサービスのロジックにマッチした形で3Dのキャンバス部分を操作することが容易になります。

![top-level-interface](./images/top-level-interface.png)

トップレベルのAPIは以上の図のように主に4つに分割され、それぞれ役割が異なります。

---

## GrimoireInterface

主に**特定のGOMLソースに依存しない**対象に対して操作するAPIを提供します。

**例**

- registerNodeメソッド
- registerComponentメソッド
- ...etc

GrimoireInterfaceは`<script>`タグを用いて単にWebページにロードされている場合、`window.gr`に代入されます。

GrimoireInterfaceはnpmを用いて以下のようにしても取得することができます。この場合window以下を書き換えることなくGrimoireInterfaceが利用可能です。

```javascript
var gr = require("grimoirejs");
```

### gr("selector")

- **定義**

  ```typescript
  function gr(selector: string): GOMLInterface;
  ```

- **使い方**

  GrimoireInterfaceは関数としてセレクタを渡すことができます。 このセレクタはGOMLを選択するための記法であり、`text="text/goml"`の指定されているノードを取得するためのセレクタを指定します。

  ```javascript
  var theCanvas = gr("script.mainCanvas");
  ```

  例えば、上記の例では`mainCanvas`クラスが指定されたscriptタグ全てが結びついているGOMLに対して処理をするインターフェースが取得されます。

  > 注意:

  > 取得される操作対象のGOMLが一つとは限らない事に気をつけてください。取得する対象が`canvas`ではなく`script`である事に注意してください。

### gr.ns(namespace)

- **定義**

  ```typescript
   function ns(namespace: string): (name: string) => NamespacedIdentity;
  ```

- **使い方:**

  nsメソッドはGrimoire.jsが用いる各ノードやコンポーネントなどの名前の識別のために名前空間を用いるために使います。

  自分以外の人が用いるであろうコンポーネントやノードを作成する場合、名称が被って競合するのを防ぐために利用する必要があるでしょう。

  ```javascript
  var g = gr.ns("http://grimoire.gl/ns/sample");
  var id = g("TEST"); //完全修飾名 TEST | HTTP://GRIMOIRE.GL/NS/SAMPLEを意味するオブジェクトとなる。
  ```

### registerComponent

- **定義**

  ```typescript
  interface IAttributeDeclaration {
    converter: string | NamespacedIdentity;
    defaultValue: any;
  }

  function registerComponent(
       name: string | NamespacedIdentity,
       attributes: { [name: string]: IAttributeDeclaration },
       component: Object | (new () => Component)
  ): void;
  ```

- **使い方**

  指定した名称のコンポーネントを追加します。 引数`name`が`NamespacedIdentity`として指定されると、名前空間を含んだタグとして区別されます。 一方で引数`name`が`string`である際は名前空間を**デフォルト名前空間**として処理します。

  引数`attributes`はこのコンポーネントが公開する属性です。これは値として`IAttributeDeclaration`を持つプレーンオブジェクトです。このプレーンオブジェクトのkeyが属性名として用いられます。(常に名前空間はこのコンポーネントの名前空間です。) ユーザーはこのattributesに指定されている属性に対してGOMLを通じて代入したりattrメソッドなどを通じて値を操作できたりします。

  引数`component`は新しく登録したいコンポーネントの`コンストラクタとなる関数`もしくは`プレーンオブジェクト`です。 ただし、プレーンオブジェクトはメソッド内部でコンストラクタに変換します。また、コンストラクタを指定する場合はそのコンストラクタのスーパークラスにComponentが入っていなければなりません。

### registerNode

- **定義**

  ```typescript
  function registerNode(
    name: string | NamespacedIdentity,
    requiredComponents: (string | NamespacedIdentity)[],
    defaultValues?: { [key: string]: any } | NamespacedDictionary<any>,
    superNode?: string | NamespacedIdentity,
    requiredComponentsForChildren?: (string | NamespacedIdentity)[]
  ): void
  ```

- **使い方**

  新たに指定した名称のノードを追加します。引数`name`が`NamespacedIdentity`として指定されると、名前空間を含んだタグとして区別されます。一方で引数`name`が`string`である際は名前空間を**デフォルト名前空間**として処理します。

  引数`requiredComponents`はその名称のノードが初期状態のときに保持するコンポーネントの配列を持ちます。この配列は要素として`string`もしくは`NamespacedIdentity`を持つことができます。 この配列を受け取った際、`string`な要素は自動的に名前空間を**デフォルト名前空間**として処理します。

  引数`defaultValues`はこのノードの各属性の初期値を表します。この引数に対して単なるプレーンオブジェクトすなわち`{[key: string]: any}`を渡した場合は、`key`を属性名として解釈し、属性の名前空間として**ノードの名前空間**を用います。もし、ノードの名前空間外の属性に対して初期値を割り当てたい場合は`NamespacedDictionary<any>`を用いてこの引数を割り当てます。

  > デフォルト値の割り当て優先順位:

  > あるノードが読み込まれた時に属性に割り当てられる値は以下の優先順位に従って割り当てられます。

  > `GOMLによる指定 > registerNode内のdefaultValuesによる指定 > registerComponent内のattributesによる指定`

  > すなわち、初期ロード時にGOMLに記述されていない属性についてはregisterNode内のdefaultValuesが検索され、それも見つからない場合はregisterComponent内のattributesから初期値をロードします。

  引数`superNode`はこのノードが設定を継承する元のノード名を指定します。この引数が指定されると、`superNode`に対応付いたノードの`requiredComponents`,`defaultValues`,`requiredComponentsForChildren`が再帰的に引き継がれます。

  引数`requiredComponentsForChildren`はこのノードの子ノードに指定されるノードに要求するコンポーネントの名称のリストを受け取ります。 この要素が指定されると、このノード以下の子ノードとしてGOML内などに記述されるすべての要素は指定されたコンポーネントを所持している必要があります。

## GOMLInterface

主に**特定のGOMLのソースに依存する**対象に対して操作するAPIを提供します。

GOMLInterfaceを介して、ひとつまたは複数のGOMLを操作できます。
GOMLInterfaceは、主にGrimoireInterfaceを関数として呼び出して取得できます。
このときセレクタの対象になったGOMLが、このGOMLInterfaceの操作対象となります。

**例**

- (なし)

### gr("gomlSelector")("nodeSelector")

- **定義**

  ```typescript
  function(selector: string): NodeInterface;
  ```

- **使い方**

  GomlInterfaceは関数としてセレクタを渡すことができます。 このセレクタはNodeを選択するための記法であり、このGOMLInterfaceが対象とするGOML群のもつNodeTreeのノードを取得するためのセレクタを指定します。

  ```javascript
  var cubes = gr("script.mainCanvas")("cube");
  ```

  例えば、上記の例では`mainCanvas`クラスが指定されたscriptタグ全てが結びついているGOMLの中で、`cube`クラスが指定された全てのノードを対象とするインターフェースが取得できます。

  > 注意:

  > 取得される操作対象のノードが一つとは限らない事に気をつけてください。


---

## NodeInterface

主に**特定のNode**に対して操作するAPIを提供します。

ひとつ、または複数のノードを対象とした操作を提供します。

**例**

- appendメソッド
- getComponentメソッド
- forEachメソッド
- removeメソッド
- ...etc

### gr("gomlSelector")("nodeSelector")("componentSelector")
- **定義**

  ```typescript
  function(selector: string): ComponentInterface;
  ```

- **使い方**

  NodeInterfaceは関数としてセレクタを渡すことができます。 このセレクタはComponentを選択するための記法であり、対象とするノード群の中からコンポーネントを指定します

  ```javascript
  var components = gr("script.mainCanvas")("cube")("a");
  ```
### isEmpty
このNodeInterfaceの対象が一つ以上存在するか確認します。
存在すればtrue,一つも存在しなければfalseを返します。
  ```typescript
  if(gr("script.mainCanvas")("cube").isEmpty()){
    //nodeInterface is empty!
  }
  ```
### get
対象となるノード群からノードを指定して取り出します。
gomlとノードのインデックスを指定することができます。
gomlのインデックスを省略すると、すべてのgomlに渡って指定したインデックスのノードを返します。
引数を指定しないと、最初のノードを返します。
どの場合も、指定した位置にノードが存在しないときは例外を投げます。
  ```typescript
  var nodeInterface = gr("script.mainCanvas")("cube");
  var gomlIndex = 2;
  var nodeIndex = 1;
  if(nodeInterface.isEmpty()){
    var firstNode = nodeInterface.get();//error: this NodeInterface is empty.
    var secondNode = nodeInterface.get(nodeIndex);//error: index out of range.
  }else{
    var firstNode = nodeInterface.get();
    var secondNode = nodeInterface.get(nodeIndex);
    var secondNodeIsThirdGOML = nodeInterface.get(gomlIndex,nodeIndex);
  }
  ```
### getAttribute
属性名を指定して、対象ノードの**最初のノードの**属性を取得します。
  ```typescript
  var cube_position = gr("script.mainCanvas")("cube").getAttribute("position");
  console.log(cube_position.X);
  console.log(cube_position.Y);
  console.log(cube_position.Z);
  ```
### setAttribute
属性名を指定して、**すべての対象ノードの**属性を設定します
  ```typescript
  gr("script.mainCanvas")("cube").setAttribute("color","red");
  ```
### addComponent
すべての対象ノードにコンポーネントを追加します。
  ```typescript
  gr("script.mainCanvas")("cube").addComponent("rotateAround");
  ```
### append
すべての対象ノードに対して、指定したタグを持つノードを子要素に追加します。
  ```typescript
  gr("script.mainCanvas")("cube").append("<mesh geometry="quad" color="brown" />");
  ```
### children
特定のノード群の子要素を対象とする、新しいnodeInterfaceを取得します。
### off
対象ノードに指定したイベントリスナが登録されていれば削除します
### on
対象ノードにイベントリスナを追加します。
### remove
対象ノードをすべて削除します。
  ```typescript
  gr("script.mainCanvas")("cube").remove();
  ```
### forEach
このノードインタフェースが対象とするすべてのノードに対して反復処理を行います。
ノードと、そのノードのgomlのインデックス、goml上でのインデックスを参照できます。
  ```typescript
  gr("script.mainCanvas")("cube").forEach((node,gomlIndex,nodeIndex)=>{
    node.setAttribute("position",`${gomlIndex},${nodeIndex},0`);
  });
  ```
### setEnable
このノードインタフェースが対象とするノードを有効、または無効にします。
  ```typescript
  gr("script.mainCanvas")("cube").setEnabled(false);
  ```
### first
対象のノード群の、ひとつ目のノードを返します。存在しない時、nullを返します。
### single
対象ノード群が唯一のノードのみを含むとき、それを返します。ノード数が０または２以上のとき、例外を投げます。
### count
対象ノードの個数を数えます。
  ```typescript
  var count = gr("script.mainCanvas")("cube").count();
  ```
---

## ComponentInterface

主に**特定のNodeに属しているコンポーネント**に対する処理に利用します。

- attrメソッド
- destroyメソッド
- ...etc

### getAttribute
特定のコンポーネント群のAttributeを返します。または、特定のAttributeに値をセットします。
### setAttribute
### destroy
指定したコンポーネント群を消去します。
### count
対象ノードの個数を数えます。
  ```typescript
  var count = gr("script.mainCanvas")("cube").count();
  ```
### get
対象となるコンポーネント群からコンポーネントを指定して取り出します。存在しないとnull、曖昧性があるとerrorを投げる

