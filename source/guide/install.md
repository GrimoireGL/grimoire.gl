---
type: doc
title: インストール
order: 0
---

## スタンドアロン

scriptタグで読み込んですぐに利用するためには、スタンドアロン版の使用が便利です。`GrimoireGL`及び`gr`がグローバル変数として登録されます。(`gr`は`noConflict`を用いて利用しないことも可能です。)

<div class="primary-buttons">
<a>ダウンロード</a>
</div>

### CDN

unpkg上で提供されているパッケージは常に最新版になっています。[こちら](https://unpkg.com/grimoirejs@0.11.8/register/index.js)を利用すれば、手軽に組み込むことが可能です。

## npm

すでに自作のアプリケーション環境がNPMを用いている場合や、babelなどを使ったり効率的に開発したい場合のためにnpmを用いる方法も用意されています。

```bash
$ npm install grimoirejs --save
```

この状態で、以下のように記述すれば同様にしてgrインターフェースが取得できます。

```javascript
import gr from "grimoirejs";
```

あるいは、`require`を用いて以下のようにも取得できます。

```javascript
const gr = require("grimoirejs");
```

**ただし、この状態でバンドリングなどにGrimoire.jsは中身に含まれず、scriptタグで読み込む必要があることに注意してください。あくまで参照を取ってくるだけの場合の記法です。**

もし、scriptタグなどで読み込まない場合は、以下のようにすることで実際にGrimoire.jsを走らせることが可能です。

```javascript
import gr from "grimoirejs/register";
```

この参照先には実際のgrimoirejsのコードが含まれるため、このままバンドリングなどをすると、grimoirejsのコードを取り込んだまま使用することが可能になります。
