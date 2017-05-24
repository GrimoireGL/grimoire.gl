---
type: doc
title: インターフェース
order: 30
---
Grimoire.jsはGOMLを書くだけでも簡単な表示はできますが、もし他のUIとの連携したり、動的な表現を作り込みたいなら、**javascriptで操作** したくなるはずです。
まずは、シーン上にキューブがあるとして、マウスが乗っているときだけその色を変更してみましょう。

```xml
<goml>
  <scene>
    <camera position="0,0,-10"/>
    <mesh geometry="cube" color="red" position="0,0,0"/>
  </scene>
</goml>
```

```javascript
gr("*")("mesh").on("mouseEnter",function(){
  gr("*")("mesh").setAttribute("color","green");
});
gr("*")("mesh").on("mouseLeave",function(){
  gr("*")("mesh").setAttribute("color","red");
});
```
これだけのコードを記述して、ブラウザで表示してみましょう。マウスに応じて色が変化するはずです！

このコードを少し詳しく見ていきましょう。あなたがもしjavascriptに精通していれば、
`gr("*")("mesh").on`メソッドがイベントハンドラを登録する関数だと気づいたかもしれません。
Grimoire.jsでは、**mouseEnter**,**mouseLeave** などのイベントに対してコールバック関数を登録することができます。
コールバックを登録するするオブジェクトは`gr("*")("mesh")`という書き方で記述できます。
この部分は、以下のように３段階に分かれています。
@@図@@

`gr`は、Grimoire.jsがグローバルに定義する唯一のオブジェクトで、**GrimoireInterface** と呼ばれます。
`gr`にセレクタを渡して得られるオブジェクトは **GOMLInterface** で、さらにそれにセレクタを渡して **NodeInterface** が得られます。
この3つのオブジェクトが、Grimoire.jsを操作するための最も基本的なインタフェースで、それぞれGrimoire.js全体、GOML単位、ノード単位での操作のために使います。
ただの関数オブジェクトではありません。順番に見ていきましょう。



#GrimoireInterface
Grimoire.jsを読み込むと、自動的に`gr`オブジェクトがグローバルに定義されます。
このオブジェクトからGrimoire.js全体の設定を変更したり、取得したりできます。
たとえば、Grimoire.jsがデフォルトで出力するデバッグ用コンソール出力をオフにしたければ、

```javascript
  gr.debug=false;
```

というように設定すればいいでしょう。
他にも以下のような便利なAPIが用意されています。

```javascript
  //バージョン情報やプラグインの情報などが取得できます
  var lib = gr.lib;

  //すべてのノードが管理されます
  var nodes = gr.nodeDictionary;

  //読み込まれたプラグインや作成されたノードをすべてクリアしてピュアな状態に戻します。
  gr.clear()
```
GrimoireInterfaceは以降に紹介するあらゆるAPIの起点となるオブジェクトなので、以降のガイド中でもたびたび登場します。
必要であれば詳細なAPIリファレンスを参照してください。

ところで、`gr`オブジェクトは関数として呼び出すこともできます。
```javascript
gr(function(){
  console.log("Grimoire.js is loaded!")
})
```

このように`gr`オブジェクトにコールバック関数を渡して呼び出すと、ページ上のGOMLがロードされた直後にコールバックされます。
この機能は、**シーン上のオブジェクトを動的に操作するシチュエーション** などで非常によく使います。
GOML上のオブジェクトを操作するなら、このように **GOMLが読み込まれたあと** に処理を行う必要があるからです。

```javascript
  //10個のキューブを一列に配置します。
  gr(function(){
    for(var i=0;i<10;i++){
      var x = i-5;

      //<mesh>タグを<scene>に追加します。
      gr("*")("scene").addChildByName("mesh",{geometry:"cube",position:[x,0,0]});
    }
  })

  //'scene'ノードはまだ読み込まれていないので、以下のコードは動作しません！
  //gr("*")("scene").addChildByName("mesh",{geometry:"cube",position:[0,0,0]});

```

よく見ると、ここでは`gr`に関数を渡す以外に`gr("*")("scene")`という使い方もしています。
`gr`は関数を渡すとロード時のコールバックになりますが、**文字列を渡すとGomlInterfaceを取得する関数になります**。

ここで渡す文字列は、**GOMLを読み込んでいる<script>タグ** を指定するためのセレクタです。ただ、GOMLを一つしか使わない場合は`"*"`を指定してもいいでしょう。
さて、GOMLInterfaceの取得方法と使い方を見てみましょう。

> `gr`オブジェクトとまったく同じオブジェクトに`GrimoireJS`変数からもアクセスできます。
もし`gr`オブジェクトが他に使用している変数と重複する場合は、`GrimoireJS.noConflict()`を呼び出すことで、`gr`への割り当てを解除することができます。

#GOMLInterface

以下のように、３つのGOMLが読み込まれているとしましょう。
```html
<body>
  <script id="first-goml" class="goml-class" type="text/goml" src="first.goml"></script>
  <script id="second-goml" class="goml-class" type="text/goml" src="second.goml"></script>
  <script id="third-goml" type="text/goml" src="third.goml"></script>
</body>
```
GrimoireInterfaceにセレクタを指定することで取得で、GomlInterfaceを取得できます。

```javascript
var thirdGomlInterface = gr("#third-goml");
var multiGomlInterface = gr(".goml-class");
```
GomlInterfaceは一つ、あるいは複数のGomlを対象に操作をするためのインタフェースです。
対象のGOMLの数はこのように取得できます。
```javascript
console.log(thirdGomlInterface.rootNodes.length);// 1
console.log(multiGomlInterface.rootNodes.length);// 2
```

ただ、GomlInterfaceはGrimoireInterfaceほど多くの機能を持ちません。
ほとんどの場合、**関数として呼び出してNodeInterfaceを取得する** のに使うでしょう。

```javascript
thirdNodeInterface = thirdGomlInterface("mesh");
```
呼び出し方はGrimoireInterfaceと同様ですが、指定するのは**ノードを指定するセレクタ**です。

実際はGomlInterfaceを単体で使う機会は少ないため、GrimoireInterfaceからつなげて、
```javascript
var meshInThirdGoml = gr("#third-goml")("mesh");
```
と書くことが多いでしょう。

#NodeInterface
ノードを操作するために最もよく使うであろうインタフェースです。
NodeInterfaceを取得したら、あとは操作をするためのメソッドを呼び出すだけです。
ノードを操作するために様々なAPIが用意されています。たとえば、

```javascript
//対象となるmeshの個数を表示します。
console.log(gr("*")("mesh").count);

//属性を取得します
var pos = gr("*")("mesh").getAttribute("position");

// 属性を設定します。ここでは、y座標を１大きくしています。
gr("*")("mesh").setAttribute("position",[pox.x,pox.y+1,pos.z]);

//メッシュの子ノードを追加します。
gr("*")("mesh").append('<mesh geometry="cube" color="red"/>');

//ノードにコンポーネントを追加します。
gr("*")("camera").addComponent("MouseCameraControll");

```

などです。
ちなみに、NodeInterfaceは **複数のノードを同時に対象にできる** ので
すべてのメッシュを同時に色を変えることもできます。

>GomlNodeのインスタンスとNodeInterface似たAPIを持っていますがは明確に異なるオブジェクトです。基本的にはNodeInterfaceからの操作で十分ですが、GomlNodeのインスタンスを直接操作する際は、これらの違いを意識しておきましょう。
