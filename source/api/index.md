---
type: doc
title: Top-Level API
order: 0
---

# Top-Level API Overview

Grimoire.jsを初めて用いる際、最初にいじるjavascriptのAPIはおそらくこれらのトップレベルAPIでしょう。 これらのAPIによってユーザーはい自身のサービスのロジックにマッチした形で3Dのビュー部分を操作することが容易になります。

--------------------------------------------------------------------------------

![top-level-interface](./images/top-level-interface.png)

トップレベルのAPIは以上の図のように主に4つに分割され、それぞれ役割が異なります。

## Grimoire Interface

主に**特定のGOMLソースに依存しない**対象に対して操作するAPIを提供します。

**例**

- registerNodeメソッド
- registerComponentメソッド
- ...etc

## GOMLInterface

主に**特定のNodeに依存せず、特定のGOMLのソースに依存する**対象に対して操作するAPIを提供します。

**例**

- sharedObjectフィールド
- rootNodeフィールド
- ...etc

## NodeInterface

主に**特定のNode**に対して操作するAPIを提供します。

**例**

- appendメソッド
- getComponentメソッド
- ...etc

## ComponentInterface

主に**特定のNodeに属しているコンポーネント**に対する処理に利用します。

- attrメソッド
- onメソッド
- ...etc

# API Reference

## GrimoireInterface

GrimoireInterfaceは`<script>`タグを用いて単にWebページにロードされている場合、`window.gr`に代入されます。

GrimoireInterfaceはnpmを用いて以下のようにしても取得することができます。この場合window以下を汚染することなくGrimoireInterfaceが利用可能です。

```js
var gr = require("grimoirejs");
```

### 関数として呼んだ場合

GrimoireInterfaceは関数としてセレクタを渡すことができます。 このセレクタはGOMLを選択するための記法であり、`text="text/goml"`の指定されているノードを取得するためのセレクタを指定します。

**定義**

```ts
function gr(selector:string):GOMLInterface;
```

**例**

```js
var theCanvas = gr("script.mainCanvas");
```

例えば、上記の例では`mainCanvas`クラスが指定されたscriptタグ全てが結びついているGOMLに対して処理をするインターフェースが取得されます。

> 取得される操作対象のGOMLが一つとは限らない 事に気をつけてください。

> 取得する対象が`canvas`ではなく`script`である事に注意してください。

### nsメソッド

nsメソッドはGrimoire.jsが用いる各ノードやコンポーネントなどの名前の識別のために名前空間を用いるために使います。

自分以外の人が用いるであろうコンポーネントやノードを作成する場合、名称が被って競合するのを防ぐために利用する必要があるでしょう。

**定義**

```ts
function ns(namespace:string):(name:string)=>NamespacedIdentity;
```

**例**

```js
var g = gr.ns("http://grimoire.gl/ns/sample");
var id = g("TEST"); //完全修飾名 TEST|HTTP://GRIMOIRE.GL/NS/SAMPLEを意味するオブジェクトとなる。
```

### registerNode

### registerComponent

## GOMLInterface

### 関数として呼んだ場合

## NodeInterface

### 関数として呼んだ場合

### find

### append

### remove

### attr

### children

### addComponent

### removeComponent

## ComponentInterface

### attr

### get

### destroy
