---
type: doc
title: GOMLを扱う
order: 2
---

## 概要

GOMLを変更することでシーンを組み立ててみましょう。

## 学べること

* GOMLとは何か
* GOMLタグの扱い方
* GOMLタグの属性の扱い方

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#tutorial"></iframe>

GOMLはGrimoire Object Markup Languageの略であり、描画するカンバス内の状態をxmlで記述するためのGrimoire.jsが定義する言語です。

`<goml>`タグは一番基本となるタグで、カンバス自体の状態に関わります。`width`や`height`属性でカンバスの大きさを指定できます。

`<geometry>`タグはジオメトリを定義します。`name`属性でジオメトリの識別子を設定し、それらを`<mesh>`タグの`geometry`属性で指定することで、使うことができます。

```xml
<geometry name="cube" type="cube" divide="30" />
```

* `name`属性 - 識別子
* `type`属性 - ジオメトリの種類。`cube`, `quad`, `triangle`, `sphere`, `corn`がデフォルトで用意されています。
* `divide`属性 - メッシュの分割数を指定します。これはジオメトリの種類に依存した属性であり、`cube`以外のジオメトリでは無い場合があります。

シーンの全容は`<scene>`タグの以下に記述します。

```xml
<camera class="camera" near="0.01" far="40.0" aspect="1.5" fovy="45d" position="0,0,10" />
```

`<camera>`タグはカメラを配置します。

> 次は読み込んだGOMLをJavaScriptから操作する方法を学びます
>
> [JavaScriptからGOMLを扱う](/tutorial/3-handle-goml-with-js)
