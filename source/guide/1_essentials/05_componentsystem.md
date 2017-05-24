---
type: doc
title: ComponentSystem
order: 40
---

ここまでのガイドで簡単なGOMLの例が何度か出てきました。
今回は、GOMLを使って**ノードに機能を追加**してみましょう。

```xml
<goml>
  <scene>
    <camera position="0,0,-10"/>
    <mesh geometry="cube" color="red" position="0,0,0"/>
  </scene>
</goml>
```

これは非常に単純なGOMLです。キューブが一つだけ配置されていますが、何のインタラクションもありません。
では、マウスで好きな方向にカメラを移動できるようにしてみましょう。

```xml
<goml>
  <scene>
    <camera position="0,0,-10">
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <mesh geometry="cube" color="red" position="0,0,0"/>
  </scene>
</goml>
```

変更点は、`<camera>`タグの子要素に`<camera.components>`タグを追加し、さらにその中に`<MouseCameraControl>`タグを追加した部分です。
これを実行すると、マウスドラッグでカメラが移動することがわかります。

# コンポーネントとは？
先程の例で追加した`MouseCameraControl`は**コンポーネント**と呼ばれます。
コンポーネントはGOML上ではタグとして扱われ、ノードの子要素として配置して利用します。

> 今までに登場した`goml`,`scene`,`mesh`などのタグは、**ノード** と呼ばれ、**コンポーネントとは異なります。**
> GOMLで利用可能なタグはただひとつの例外を除いて、すべてノードかコンポーネントのどちらかです。
> 例外とは、`<camera.components>`などの`.components`タグで、GOMLにコンポーネントをタグとして追加するときに必要となる特別なタグです。

いくつかのコンポーネントはあらかじめ用意されていますが、シチュエーションによってはそれ以上に様々な機能が必要になるかもしれません。
そのために、コンポーネントを新しく作成するためのAPIが用意されています。
コンポーネントの作成は、GrimoireInterfaceの`registerComponent`メソッドを利用します。

```javascript
gr.registerComponent("MouseColor",{
  attribute:{
    onColor:{
      converter:"color",
      default:"red"
    },
    offColor:{
      converter:"color",
      default:"green"
    }
  },

  $awake:function(){
    this.node.on("mouseenter",function(){
      this.node.setAttribute("color",this.getAttribute("onColor"));
    });
    this.node.on("mouseleave",function(){
      this.node.setAttribute("color",this.getAttribute("offColor"));
    });
  }
})
```
このスクリプトをwebページで実行すると、GOML上で`<MouseColorComponent/>`タグが利用できるようになります。
このコンポーネントを`<mesh>`タグに追加して、表示してみましょう。

```xml
<goml>
  <scene>
    <camera position="0,0,-10">
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <mesh geometry="cube" color="red" position="0,0,0">
      <mesh.components>
        <MouseColorComponent/>
      </mesh.components>
    </mesh>
  </scene>
</goml>
```

キューブの上にマウスを乗せると、色が変わるようになったはずです。
このように、様々な機能がコンポーネントとしてモジュール化できます。
コンポーネントとは、ノードにアタッチして利用する、モジュール化された機能そのものです。

# ノードの実態
Grimoire.jsではタグはノードとコンポーネントの２種類しかありません。
コンポーネントはノードにアタッチするモジュールでした。次はノードについて説明します。

ノードもコンポーネントと同じように自由に追加することができます。

```javascript
gr.registerNode("color-cube", ["MouseColorComponent"], {
  geometry: "cube",
  onColor:"red",
  offColor:"green"
}, "mesh");
```

`gr.registerNode`メソッドは、**ノード名、コンポーネントのリスト、属性のデフォルト値、継承元ノード** を引数にとります。
このコードは、`color-mesh`という名前で、既存の`mesh`タグに`MouseColorComponent`コンポーネントを追加し、属性を変更したものとして登録します。
これによって、先程のGOMLをこのように書き換えられます。

```xml
<goml>
  <scene>
    <camera position="0,0,-10">
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <color-mesh position="0,0,0"/>
  </scene>
</goml>
```

新しく作成した`color-mesh`ノードで、`mesh`タグとコンポーネントを置き換えました。これは先程とまったく同じように動作します。
`gr.registerNode`の引数を見ると、ノードが持つ情報は、属性とコンポーネントのリストと継承関係ですが、**実は継承で受け継がれるのは属性値とコンポーネントのリストの値だけ** です。つまり、ノードが持つ情報は **属性値とコンポーネントのリスト** であって、これらを格納して親子関係を保持するための単なる箱のようなものです。
実際、標準で用いられるノードの定義は以下のようになっています。

```javascript
GrimoireInterface.registerNode("goml", [
  "CanvasInitializer", "LoopManager", "AssetLoadingManager",
  "GeometryRegistory", "RendererManager", "Fullscreen"]);
    GrimoireInterface.registerNode("scene", ["Scene"]);
    GrimoireInterface.registerNode("object", ["Transform"]);
    GrimoireInterface.registerNode("camera", ["Camera"], { position: "0,0,10" }, "object");
    GrimoireInterface.registerNode("mesh", ["MaterialContainer", "MeshRenderer"], {}, "object");
    GrimoireInterface.registerNode("renderer", ["Renderer"]);
```

すべてのノードは`registerNode`で作られています。特別なノードは基本的に一つもありません。

> ノードの唯一の例外は、すべてのノードの基底ノードとなる、`grimoire-node-base`というノードです。
> このノードだけは継承先が指定されない場合に自動的に基底となる特殊なノードです。


# 属性

いままで、`<mesh geometry="cube" color="red" position="0,0,0"/>`とGOMLにタグを書いてきました。
**属性** とは、このタグの属性のことで、実体はコンポーネントが保持しています。
コンポーネントが持つ属性は、コンポーネントを作成するとき、`attributes`フィールドで指定できました。
あくまで属性を持っているのはコンポーネントで、ノードは属性をもちません。
GOML上でノードのタグに指定している属性は、**コンポーネントの同名属性に自動的に割り当てられます** 。

属性はただの値ではなく、2つの要素から構成されます。

```javascript
attributes:{
  onColor:{
    converter:"Color4",
    default:"red"
  },
  offColor:{
    converter:"Color4",
    default:"green"
  }
}
```

さきほどのMouseColorコンポーネントの`attributes`を見てみましょう。
`attributes`には定義したい属性を列挙します。
ここでは、`onColor`,`offColor`の２つです。
それぞれの属性の中には、 **`converter`と`default`** というフィールドがあります。
`converter`とは、GOML上の属性文字列を実際の値に変換するためのオブジェクトです。
`Color4`コンバータを使えば、"red"という文字列を#ff0000のColorオブジェクトに変換できるようになります。
`default`は属性の初期値です。なにも指定しない場合はこの値が使われます。

> `default`の値には優先度があります。
> ここで説明したコンポーネントのdefaultは、ノードで定義されるデフォルト値によって上書きされます。


`default`はGOMLに書くときと同じような書式で設定します。
`converter`は、標準で用意されたものを使うか、後から追加することもできます。
詳細は次の項で解説します。


# コンバータ
コンバータは属性の値を文字列から変換するためのオブジェクトです。
標準のコンバータの一覧と詳細はここを参照してください。

これらのコンバータ以外のものを使いたい場合は、コンポーネントやノードと同じように、新しく作成する事ができます。
コンバータは、変換のための関数を指定するだけで簡単に作成できます。

```javascript
gr.registerConverter("Number", function(val): number {
  if (typeof val === "number") {
    return val;
  } else if (typeof val === "string") {
    return Number.parseFloat(val);
  } else if (val === null) {
    return null;
  }
});
```

この`Number`コンバータは、`number`はそのまま通し、`string`は`Number.parseFloat`によって変換して値にしています。
スクリプト上で`setAttribute()`を呼び出された場合など、 **文字列以外のオブジェクトが渡される可能性がある** ことに注意しましょう。
変換できない場合は例外ではなく、`undefined`を返すようにします。
また、コンバータの引数にnullを指定される場合がありますが、`undefined`を指定されることはありません。
事前に値をベリファイしたり、より高機能なコンバータを作成するAPIも用意されています。
















a
