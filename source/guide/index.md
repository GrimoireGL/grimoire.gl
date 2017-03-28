---
type: doc
title: はじめに
order: 1
---

# Grimoire.jsとは?

**Grimoire(グリモア).js** は、**Web開発のためのWebGLフレームワーク** です。 高度なグラフィクスの知識が要求され、既存のWebの開発フローに乗りにくい`WebGL`表現を、**既存のWeb開発のフローで** 、 **最小限のコードで** 、**簡単に** 、**プロダクションレベルで** 扱うためのフレームワークです。

`WebGL`を扱うための技術は、アプリケーションやゲーム開発にフォーカスしたものでした。既存の多くのWebGLライブラリは、それらに慣れ親しんだ開発者が同様のAPIをweb上に移植してきたものなので、これらを扱おうとするweb開発者は彼らの開発文化に従わなければなりませんでした。そしてそれは、web開発の文化とは大きく異なるものです。

`WebGL`には無限の表現力があります。しかし、画像や動画と同じくらい簡単に扱うことはできません。ただでさえ変化の激しいweb開発の世界で、`webGL`を扱うためだけに多大な学習コストを払わねばならないのは、webGL利用の大きな障壁になっています。

`Grimoire.js`は、このWebにおける`WebGL`のあり方を変えます。グラフィクス系の開発者は、(彼らが慣れ親しんだやり方)[]で容易に機能を拡張し、Web開発者は[自分たちの知識の延長](#TODO:link to grimoire interface)で自然にそれを扱えるようにします。**WebGLをWebエンジニアにとって、画像や動画に次ぐ新しい筆にするのです。**

# Grimoire.jsで何ができるの?

さて、**Grimoire.js** を使ってなにができるのでしょうか?
いくつかの例を見てみましょう。

最もシンプルな用途は、単純に **3Dモデルを表示すること** でしょう。

![](https://i.gyazo.com/2c6f811b72d565d76ef2b0f846af28bd.gif)

https://cx20.github.io/gltf-test/examples/grimoiregl/index.html?model=VC&scale=0.2

> glTF表示テスト by [@cx20](https://github.com/cx20)

Grimoire.jsは簡単にシェーダーを記述できるので、高度な **シェーダーアートを簡単に表示すること** もできます。


![ポストエフェクト](https://i.gyazo.com/9d519c71b24ae27fccd35413e44a5b73.gif)

http://qiita.com/pnlybubbles/items/c87e8e7466ecdc11a23c

> [ポストエフェクトする(Grimoire.js Advent Calender 2016)](http://qiita.com/pnlybubbles/items/c87e8e7466ecdc11a23c)[@pnlybubbles](https://github.com/pnlybubbles)

また、高度にwebのAPIに親和した設計は、**WebCamなどHTML5の様々な機能と連携** することも容易です。

![Webカメラサンプル](https://i.gyazo.com/b4ff87de431cf756f65e716525f41418.gif)

https://grimoiregl.github.io/grimoire.gl-example/#webcam

あなたが`WebGL`の表現力を必要とするなら、それがどのようなものであっても、`Grimoire.js`の恩恵を受けることができるでしょう。

# はじめに

`Grimoire.js`を試すには、まず単純な`html`を作成して以下の`<script>`タグで読み込みます。

```html
<script src="https://unpkg.com/grimoirejs-preset-basic/register/grimoire-preset-basic.js"></script>
```

> このスクリプトはピュアな`Grimoire.js`ではなく、それにいくつかの[標準プラグイン](url)が入ったものを読み込みます。このスクリプトでwebGLを扱うために必要な最低限の機能が利用できます。

もし`minify`されたjsや、`npm`からの利用をしたいなら[インストール](installation.html)を参考にしてください。

# WebGLをマークアップ

`Grimoire.js`では、WebGLを記述するためのマークアップ([GOML](goml.html))を記述します。`html`の`<body>`に以下のように記述してみましょう。

```xml
<body>
  <script type="text/goml">
    <goml>
     <scene>
      <camera/>
      <mesh color="red" position="0,0,0"/>
     </scene>
    </goml>
  </script>
</body>
```

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example/#guide-01">
</iframe>

このように、**`type='text/goml'`が指定されている`<script>`タグを埋め込むと、その位置に`<canvas>`が自動的に挿入されて表示されます**

`<mesh>`の`position`属性を操作すれば、表示されている赤い四角形が動くのがわかります。Grimoire.jsのオブジェクトは一般的なHTMLのドキュメントと同じように宣言的に操作できるのです。

> GOMLファイルの読み込み  
> 通常のjavascriptファイルを読み込む際と同様に、`src="外部ファイルのURL"`を指定して外部からgomlファイルを読み込むこともできます。 このチュートリアルでは、簡略な説明のためhtmlに埋め込んでいますが、**通常は外部読み込みにすることを推奨します。**

以下のように、複数個のキャンバスを扱うこともできます。

```xml
<script type="text/goml">
  <goml>
   <scene>
    <camera/>
    <mesh color="red" position="0,0,0"/>
   </scene>
  </goml>
</script>
<script type="text/goml">
  <goml>
   <scene>
    <camera/>
    <mesh color="green" position="0,0,0"/>
   </scene>
  </goml>
</script>
```

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example/#guide-02">
</iframe>

# Javascriptによる操作

```xml
<script type="text/goml" id="canvas1">
  <goml>
   <scene>
    <camera/>
    <mesh color="red" position="0,0,0"/>
   </scene>
  </goml>
</script>
<script type="text/goml">
  <goml>
   <scene>
    <camera/>
    <mesh color="green" position="0,0,0"/>
   </scene>
  </goml>
</script>
```

このようなHTMLに対して、以下のようなJSを実行すると、`Grimoire.js`が読み込まれてから1秒後に上の立方体だけ青くなります。

```javascript
gr(function(){
  setTimeout(function(){
    gr("#canvas1")("mesh").setAttribute("color","blue");
  },1000);
});
```

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example/#guide-03">
</iframe>

もしあなたが`jQuery`を扱ったことがあれば、似たようなAPIであると気がつくでしょう。 `gr`は、`Grimoire.js`が定義するオブジェクトで、すべてのAPIはこれを通じてアクセスできます。

> `gr`に`function`を渡すと、Grimoire.jsがgomlの内容が読み込んだタイミングでコールバックされます

> また、`gr`オブジェクトに **スクリプトタグを指定するセレクタ** を指定し、続けて **操作したいノードを指定するセレクタを指定する** と、ノードを操作するインタフェースを取得できます。 (grに続くの最初の括弧で帰ってくるのは、スクリプトタグへのクエリということに注意してください。これは初めて使う人が陥りやすい最も多いミスの一つです。)

# Grimoire.jsのノード・コンポーネントシステム

ここまでは、他のタグベースのWebGLライブラリと同じような機能を紹介しました。
しかし、`Grimoire.js`の最大の特長は、圧倒的な拡張性を実現する**ノードやコンポーネントのシステム**にあります。

例えば以下のような`goml`を記述してみましょう。
Grimoire.jsは`goml`を、それぞれのタグをノードとするツリー構造として扱います。
ただし、`<camera.components>`タグは通常のタグではなく、**`<camera>`タグにコンポーネントを追加するための記法** です。追加された`MouseCameraControl`コンポーネントは、マウスによって位置を操作するためのコンポーネントです。
```xml
<script type="text/goml" id="canvas1">
  <goml>
   <scene>
    <camera>
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <mesh color="red" position="0,0,0"/>
   </scene>
  </goml>
</script>
```

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example/#guide-04">
</iframe>

この`goml`では、カメラをマウスで操作できるようになりました。
Grimoire.jsでは、ノードは **コンポーネント** と呼ばれる個別のモジュールの集まりで、複数のコンポーネント格納するコンテナのようなものです。コンポーネントについての詳細は、[ガイド]()で解説しています。

![](./images/node-have-components.png)

例えば`<mesh>`タグは、`Transform`という、座標や回転量などを管理するコンポーネントと`MeshRenderer`という、表示を管理しているコンポーネントがデフォルトで格納されています。
また、`<camera>`タグは`Transform`と、カメラの本体の仕組みを管理している`Camera`コンポーネントが格納されます。

![](./images/optional-component.png)
ノード名によって固有のデフォルトコンポーネントに加え、追加でコンポーネントを追加することで、その組み合わせによって様々な機能を実現できるのがノード・コンポーネントシステムの特長です。


## コンポーネントを作成する

コンポーネントは新しく定義することもできます。ここでは例えばアタッチされたノード自身を回転させるコンポーネント、`Rotate`を作ってみることにしましょう。

```javascript:index.js
gr.registerComponent("Rotate",{
  attributes:{
    speed:
    {
      default:1,
      converter:"Number"
    }
  },
  $mount:function(){
    this.phi = 0;
  },
  $update:function(){
    this.phi += this.getValue("speed");
    this.node.setAttribute("rotation",this.phi + "," + this.phi + "," + this.phi);
  }
})
```
`gr.registerComponent`でコンポーネントを登録することができます。詳細は[GrimoireInterface#registerComponent](url)で解説するのでここでは深く触れませんが、`attributes`の中にこのコンポーネントが受け取れるパラメーターを宣言できます。
このパラメータは属性と呼ばれ、ここでは数値型で、初期値が`1`である属性が宣言されています。
属性の詳細は[ガイド]()で解説しています。

このjavascriptを実行した上で、以下のようなgomlを書いてみましょう。

> 先程のjavascriptは、Grimoire.jsを読み込むscriptタグの下に読み込むことで実行できます。
```html
<script src="https://unpkg.com/grimoirejs-preset-basic/register/grimoire-preset-basic.js"></script>
<script src="./index.js"></script>
```

```xml
<script type="text/goml" id="canvas1">
  <goml>
   <scene>
    <camera>
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <mesh color="red" position="0,0,0">
      <mesh.components>
        <Rotate/>
      </mesh.components>
    </mesh>
   </scene>
  </goml>
</script>
```

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example/#guide-05">
</iframe>


以下の図は、あるコンポーネントのライフサイクルを表します。今全てを理解する必要はありませんが、この図は将来あなたの役に立つことでしょう。

![](./images/message-order.png)

$から始まる関数は **メッセージハンドラー** と呼ばれ、コンポーネントのライフサイクルの随所で呼ばれることになります。
このメッセージハンドラー内の`this`はそれぞれのコンポーネントのインスタンスにバインドされます。

[メッセージハンドラー]()はGrimoire.jsの中核を成す仕組みですが、ここでは単なるイベントハンドラーという程度の理解で問題ないでしょう。

## ノードを定義してみる

もし、回転する`<mesh>`を頻繁に使うなら、上のように書くのは不便です。ここで、`<rotated-mesh/>`という新しいノードを作成してみましょう。

```javascript
gr.registerNode("rotated-mesh",["Rotate"],{},"mesh");
```

```xml
<script type="text/goml" id="canvas1">
  <goml>
   <scene>
    <camera>
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <rotated-mesh color="red" position="-2,0,0"/>
    <rotated-mesh color="green" position="0,0,0" speed="2"/>
    <rotated-mesh color="blue" position="2,0,0" speed="3"/>
   </scene>
  </goml>
</script>
```

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example/#guide-06">
</iframe>

# 次は

ここまで理解したあなたは`Grimoire.js`の基本的な仕組みを理解しています。Grimoire.jsのノードやコンポーネントは、標準のものも含めてすべてこのように作成されています。`<goml>`,`<scene>`,`<camera>`などもそうであり、例外はありません。

簡単に機能を紹介してきましたが、Grimoire.jsを学ぶには実際に使ってみるのが一番の近道です。
あなたのために、 **[チュートリアル](/tutorial)** が用意されています。さあ、次の一歩へ進みましょう。
