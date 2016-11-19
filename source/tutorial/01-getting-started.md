---
type: doc
title: Grimorie.jsを使ってみる
order: 1
---

## 概要

Grimoire.jsはWeb3Dライブラリです。Grimoire.jsではWeb開発フローにマッチした形で、3D表現を作ることができます。3D表現はHTML5のCanvasを使用することにより表示されます。

## 学べること

* Grimoire.jsの読み込み
* GOMLの読み込み

### Grimoire.jsを使ってみるには

使用方法は簡単です。Grimoire.jsの本体のscriptと3Dの表現を行うGOML(Grimorie Object Markup Language)をHTML内で読み込むことにより使用することができます。Grimoire.jsでは必要な機能だけをライブラリに取り込んで使用することができます。

では、`index.html`に`grimoire.js`と`index.goml`を読み込んでみます。

> このgrimoire.jsはGrimoire.jsとgrimoirejs-fundamental、grimoirejs-mathを一つにバンドリングしたものです。ユーザーはこれをプリセットとしてダウンロードすることもできます。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t01-01"></iframe>

Grimoire.jsを使用するために必要な準備はこれだけです。それでは、これからGrimoire.jsを使って様々なweb3D表現を始めましょう。

またGrimoire.jsではGOMLを読み込んだ数に応じて、canvasが生成されることになっています。

<!-- <iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t01-02"></iframe> -->

次の章で行いますが、ユーザはセレクタを用いて、各キャンバスに存在するGrimorieインターフェースを取得することができます。これにより対象のGOMLに対してのみGOMLのタグを操作することが可能になっています。


> 次は読み込んだGOMLの使い方を学びます。
>
> [GOMLを扱う](/tutorial/02-handle-goml.html)
