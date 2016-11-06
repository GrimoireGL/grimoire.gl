---
type: doc
title: ノードの作成
order: 10
---

## 概要


## 学べること

* ノードの作成

### ノードの作成

コンポーネントを定義するにはregisterNodeメソッドを用います。
registerNodeメソッドでは第一引数にノードの名前、第二引数に付属するデフォルトコンポーネント、第三引数に継承するタグを指定できます。
基本的には以上により、Grimoireインターフェースで定義したタグを記述することができるようになります。

デフォルトコンポーネントに指定されている`Rotate`は"[コンポーネントを作成してみる](/tutorial/07-create-component.html)"のセクションのものです。

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

gr.registerNode("rotate", ["Rotate"], {}, "mesh");
```

それでは確認してみましょう。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t10-01"></iframe>

> 次はマテリアルの自作を学びます。マテリアルは物体の質感を設定するために重要です。Grimoire.jsではマテリアルの作成とインポートを強くサポートしています。マテリアルを作成して、3D表現に幅をもたせましょう。
>
> [マテリアルを自作してみる](/tutorial/11-create-material.html)
