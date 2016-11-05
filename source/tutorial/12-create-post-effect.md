---
type: doc
title: ポストエフェクトを作成する
order: 12
---

## 概要

前の章で解説したマテリアルを用いて、ポストエフェクトをかけたり、画像にエフェクトをかけたりすることができる。
この際、`<renderer>`タグの中身に書くタグによって、レンダラーの挙動をカスタマイズする。

例えば以下の例は入力の画像の色を反転して出力するだけのコードである。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t11-05" allowfllscreen></iframe>

### rendererタグの中身

rendererタグの中身の要素は主に2つに分類される。

* renderer-\* となっているレンダリングのタスクを表したタグ
* texture-buffer/render-buffer というレンダリング先用のテクスチャを表すタグ

例えば、上記のサンプルでは以下のように`<renderer>`タグは記述されている。

```xml
<renderer>
  <texture-buffer name="bb1"/>
  <render-quad material="new(render-image)" source="./img2.jpg" out="bb1"/>
  <render-quad material="new(negate)" source="backbuffer(bb1)"/>
</renderer>
```

#### texture-bufferタグ

`<texture-buffer>`タグはレンダラーに結び付けられたカラーバッファを意味します。`name`属性をつけて特定の名前に結びついたバックバッファ用のテクスチャを定義します。
また、このタグで登録されたテクスチャは、このレンダラーの行う描画の中で`sampler2D`型の変数に対してタグ側から、`backbuffer(texture-bufferのname)`により渡すことが可能です。


#### render-quadタグ

`<render-quad>`タグはレンダラーのタスクの一つで、`quad`要素を指定したマテリアルで描画します。`out`要素が指定されると、その対象に描画します。
