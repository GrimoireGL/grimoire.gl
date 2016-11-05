---
type: doc
title: GOMLを扱う
order: 2
---

## 概要

Grimoire.jsでは扱う
GOMLを変更することでシーンを組み立ててみましょう。

## 学べること

* GOMLとは何か
* GOMLタグの扱い方
* GOMLタグの属性の扱い方

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t02-01"></iframe>

GOMLはGrimoire Object Markup Languageの略であり、描画するキャンバス内の状態をXMLで記述するための言語です。Grimoire.jsが定義しています。これから上記のサンプルを例にGOMLのタグについて確認してみましょう。

`<goml>`タグは一番基本となるタグです。キャンバス自体の状態に関わります。`width`や`height`属性でカンバスの大きさを指定できます。また、`fullscreen`にも対応しています。

`<geometry>`タグはジオメトリを定義します。`name`属性でジオメトリの識別子を設定し、それらを`<mesh>`タグの`geometry`属性で指定することで、使うことができます。

```xml
<geometry name="cone" type="cone" divide="30" />
```

* `name`属性 - 識別子
* `type`属性 - ジオメトリの種類。`cube`, `quad`, `triangle`, `sphere`, `corn`などがデフォルトで用意されています。
その他にも各プリミティブ型ではそれに応じて、属性を持つことがあります。`cone`型では`divide`属性を持つことができます。これはメッシュの分割数を指定します。これはジオメトリの種類に依存した属性であり、各ジオメトリーに応じた属性を設定することが、可能です。

`<render>`タグは描画に関するタグです。sceneを描写する際に必要です。基本的な3Dの空間を描画する際には、この`<render>`のタグは省略することが可能です。

```html
<renderer camera=".camera" viewport="0,0,100%,100%">
  <render-scene/>
<renderer/>
```

シーンの全容は`<scene>`タグの以下に記述します。3Dのループの処理はこのタグの内部のノードに対して行われることになります。基本的に`<scene>`には`<camera>`が存在します。

```xml
<camera class="camera" near="0.01" far="40.0" aspect="1.5" fovy="45d" position="0,0,10" />
```

`<camera>`タグはカメラを配置します。`<camera>`タグには`near,far,fovy,aspect`の属性を設定できます。

これらはgrimoirejs-fundamentalプラグインを利用することにより、使用することができます。grimoirejs-fundamentalプラグインは多くのユーザーが利用することになるでしょう。

grimoirejs-fundamentalがサポートしているタグには他にも、

* `<mesh>`
* `<render-quad>`
* `<texture>`

などがあります。

### 円錐を表示してみる

それでは実際にgrimoire-fundamentalで定められたタグを使用してみましょう。
円錐(cone)を表示するためにはジオメトリを`<geometry>`タグを用いて読み込む必要があります。ジオメトリの定義は`<scene>`の外に書きましょう。

```xml
<geometry name="cone" type="cone" divide="30" />
```

ジオメトリを読み込んだら実際に表示するために`<mesh>`タグが必要です。`<geometry>`タグにconeが指定して、下のようにタグを`<scene>`以下に追加してみましょう。

```xml
<mesh geometry="cone" position="1,1,0" color="#99f" />
```

### テクスチャを表示してみる

次は画像をキャンバス内に表示してみます。下記のように`texture`属性に画像へのパスを指定することで、メッシュに画像を貼り付ける事ができます。

```xml
<mesh geometry="cube" position="0,0,0" texture="t02-01/img1.jpg" />
```

このようにGrimorire.jsを利用することにより、キャンバス内の3D表現を宣言的に記述できます。


> 次は読み込んだGOMLをJavaScriptから操作する方法を学びます。これによりGOMLで記述したタグやその属性を動的に変更することが可能になります。イベントハンドラを利用して、特定のタイミングで動作させることも可能です。
>
> [JavaScriptからGOMLを扱う](/tutorial/3-handle-goml-with-js)
