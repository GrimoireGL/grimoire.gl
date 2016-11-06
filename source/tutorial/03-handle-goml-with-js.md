---
type: doc
title: JavascriptでGOMLを扱う
order: 3
---

## 概要

GOMLで宣言したノード、コンポーネントの属性は、javascriptを読み込むことにより操作することができます。 Grimoire.jsでは、canvas部分を操作する際に容易に扱うことのできるインターフェースを提供しています。この章では、実際にGrimoireのインターフェースを用いて実際にコンポーネントの属性を変更して見ましょう。

今回は、インターフェースのノードに関する基本的な操作を行います。トップレベルAPIの詳細は、[APIReference](https://grimoire.gl/api/) を参照すると良いでしょう。

## 学べること
* Canvasのjavascript側からの取得
* GOMLのノードに関するjavascriptによる操作
* ノードの属性の変更

### canvasの取得

まずcanvasを取得するためのjavascriptを読み込みます。
`index.html`に`index.js`を読み込みましょう。

これでcanvasを取得するための準備は整いました(以下のWebエディタでは既に読み込んであります)。

```javascript
gr(function() {
  var $$ = gr("#main");
});
```

> 操作するキャンバス部分を取得する際にはGrimoireインターフェース内で取得するようにします。これはcanvas生成前に取得が行われることを防ぐためです。

以下のようにセレクタを用いて、Grimoire.jsが扱うキャンバス部分を取得できます。複数のGOMLを読み込んでいる場合等、これを利用することにより、書くキャンバスに対して明示的な操作を行うことが可能になります。

### meshの属性を変更してみる

それでは、まず`<mesh>`ノードに対して`position`属性を上書きしてみましょう。

ノードに対して、デフォルトコンポーネントの属性を変化させるためには`setAttribute("属性名", value)`を用います。valueには,書く属性が対応しているコンバーターに適した値を指定することが可能です。

```javascript
gr(function() {
    var $$ = gr("#main");
    setTimeout(function(){
      $$("mesh").setAttribute("position", "3,0,0");
    },1000);
});
```

以上の記述により1秒後にmeshのポジションが(3,0,0)に移動しているはずです。
確認してみましょう。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t03-01"allowfllscreen></iframe>

>ノード名で指定した場合には、同じノード名を持つノードの全てが取得されます。ある特定のノードに対して操作を行う際にはセレクタを活用しましょう。

他にもGrimoireのノードインターフェースには、
ノードのインターフェースでは、ノードの構造に関する操作(destroy, append)、ノードの属性に関する操作(setAttribute,getAttribute)、また、イベントハンドラの登録(on,off)を行うことができます。

* get
* addComponent **(次の章で扱います)**
* append
* children
* compareClass
* find
* off
* on
* remove
* foreach
* single
* count

現在は上記のメソッドがサポートされています。

### 動的にmeshを追加してみる

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t03-02" allowfllscreen></iframe>

`append`メソッドを使ってみましょう
このメソッド`append('<tag>')`を用いることにより、Javascriptからノードを指定した箇所に追加することができます。

```javascript
      $$("mesh").append('<mesh geometry="cube" position="0,1,0" color="green" />');
```

これで、緑色のCubeが(0,1,0)に表示されるはずです。

> 次はコンポーネントの扱い方を学びます。 GOMLで宣言したノードには標準でデフォルトコンポーネントが付属していますが、後からコンポーネントをGOML内で追加することができます。次の章ではこのオプショナルコンポーネントについて詳しく扱います。

> [コンポーネントを扱ってみる](/tutorial/04-handle-component.html)
