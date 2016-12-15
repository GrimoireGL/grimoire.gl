---
type: doc
title: javascriptでコンポーネントを扱う
order: 5
---

## 概要

3章で行ったことと同様に、Grimoire.jsではコンポーネントをjavascriptから操作することができます。
コンポーネントを操作するための機能として、ノードインターフェースでは`addComponent`メソッドを提供しています。

## 学べること

* コンポーネントに関するjavascriptによる操作
* 追加したコンポーネントの属性の変更

### コンポーネントの追加
コンポーネントを追加するためには`addComponent`メソッドを使用します。
確認してみましょう。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t05-01"></iframe>

また、追加したコンポーネントに関しても、属性を変更することが可能です。
ここでは`<camera>`タグについている`MouseCameraControl`コンポーネントの属性を変更してみましょう。

```javascript
$$("camera").first().getComponent("MouseCameraControl").setAttribute("zoomSpeed", 1);
```

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t05-02"></iframe>

> 次は、GOMLのノードとコンポーネントの性質を考えてみます。Grimoire.jsのデータ構造を学びましょう。
>
> [ノードとコンポーネントの本質](/tutorial/06-node-and-component.html)