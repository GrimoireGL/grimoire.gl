---
type: doc
title: コンポーネントの作成
order: 7
---

## 概要

この章ではGrimoire.jsで使用可能なコンポーネントを作成してみます。基本的なコンポーネントを作成することを通して、コンポーネント自作のための手順を学びましょう。

## 学べること

* コンポーネントの作成

### コンポーネントの作成

コンポーネントを定義するにはregisterComponentメソッドを用います。javascriptからコンポーネントを定義してみましょう。

* attributes - コンポーネントの属性を定義します
    * defaultValue - 属性の初期値を設定します
    * converter - 属性値の型を定義します。下の例では`Number`を指定しているので、数字として扱われます。
* $awake - コンポーネントの初期化時に呼び出されます
* $update - 毎フレーム呼び出されます

`$awake`や`$update`などのライフサイクルイベントの中では`this.node`でコンポーネントの属しているノードを取得できます。

```javascript
gr.registerComponent('Rotate', {
  attributes: {
    speed: {
      defaultValue: '1',
      converter: 'Number',
    },
  },
  $mount: function() {
    this.phi = 0;
  },
  $update: function() {
    this.phi += this.getValue('speed');
    this.node.setAttribute('rotation', this.phi + ',' + this.phi + ',' + this.phi);
  },
});
```

最後に作ったコンポーネントを既存の`mesh`に動的に追加するために、ノードに対して`addComponent`を行います。
この操作はGOMLがパースされてから行うべきなので、`gr(function() {})`の中で行います。

```
$$('mesh').addComponent('Rotate');
```

それでは確認してみましょう。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t07-01"></iframe>


基本的なコンポーネントの制作に関しては以下の通りです。コンポーネント開発はユーザーの好きな環境で行うことができます。TypeScriptを用いた開発も可能です。


詳しくは、[こちら](/tutorial/13-create-plugin.html)を参照してください。

> 次はGOMLのノードを実際に作成してみます。
>
> [ノードを作ってみる](/tutorial/10-create-node.html)
