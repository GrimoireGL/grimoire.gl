---
type: doc
title: インターフェース
order: 30
---
Grimoire.jsはGOMLを書くだけでも簡単な表示はできますが、もし他のUIとの連携したり、動的な表現を作り込みたいなら、**javascriptで操作する必要** があります。
Grimoire.jsでは、様々な用途を想定して便利なAPIを多数用意しています。
この項では、**主要な３つのインタフェース** を順番に紹介していきます。
サンプルコードを通して、それらを使ってどのようなことができるのかを見ていきましょう。

#GrimoireInterface
Grimoire.jsを読み込むと、`gr`オブジェクトがグローバルに定義されます。
`gr`は、Grimoire.jsがグローバルに定義する唯一のオブジェクトで、**GrimoireInterface** と呼ばれます。
`gr`オブジェクトはGrimoire.jsに関する設定を変更したり取得するためのオブジェクトです。
Grimoire.jsに対するあらゆる操作はこのオブジェクトを経由することになります。

たとえば、デバッグ出力をoffにするときは
```javascript
  gr.debug=false;
```

のように設定できます。
デフォルトで`true`になっていますが、デバッグ用の警告が不要な本番環境では`false`にしておきましょう。
他にもプラグインやノードの情報、コンポーネントの追加などの操作がここからできます。詳細はAPIリファレンスを参照してください。

また、`gr`オブジェクトは関数として呼び出すこともできます。
以下のように`gr`に関数を渡して呼び出すと、Grimoire.jsがロードされ、ページ上のGOMLが読み込まれた直後にコールバックされます。
```javascript
gr(function(){
  console.log("Grimoire.js is loaded!")
  })
```

> `gr`オブジェクトとまったく同じオブジェクトに`GrimoireJS`変数からもアクセスできます。
もし`gr`オブジェクトが他に使用している変数と重複する場合は、`GrimoireJS.noConflict()`を呼び出すことで、`gr`への割り当てを解除することができます。

GOML上にオブジェクトを大量に配置する場合などは、スクリプトで操作したくなります。
このような場合は、**GOMLが読み込まれてから** 操作する必要があるので、このように記述します

```javascript
  gr(function(){
    for(var i=0;i<10;i++){
      var x = i-5;
      gr("*")("scene").addChildByName("mesh",{geometry:"cube",position:[x,0,0]});
    }
  })
  //error! GOML have not loaded yes.
  //gr("*")("scene").addChildByName("mesh",{geometry:"cube",position:[0,0,0]});

```

この例では10個のキューブを一列に配置しています。
`gr(function(){...})`の外で操作すると、GOMLが読み込まれていないためエラーになります。

よく見ると、ここでは`gr`に関数を渡す以外に`gr("*")("sene")`という使い方もしています。
`gr`は関数を渡すとロード時のコールバックになりますが、**文字列を渡すとGomlInterfaceを取得する関数になります**。
ここで渡す文字列はGOMLを指定するためのセレクタです。GOMLを一つしか使わない場合は`"*"`を指定すれば問題ありません。
詳細はAPIリファレンスを参照してください。

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
おそらくほとんどの場合、**関数として呼び出してNodeInterfaceを取得する** のに使うでしょう。

```javascript
thirdNodeInterface = thirdGomlInterface("mesh");
```
呼び出し方はGrimoireInterfaceと同様ですが、指定するのは**ノードを指定するセレクタ**です。

ところで実際はGomlInterfaceを単体で使う機会は少ないため、大抵はGrimoireInterfaceからつなげて、
```javascript
var meshInThirdGoml = gr("#third-goml")("mesh");
```
と書くことが多いでしょう。

#NodeInterface
ノードを操作するために最もよく使うであろうインタフェースです。
上の項にもある通り、GrimoireInterfaceから取得します。
