---
type: doc
title: ダウンロード
order: 0
---

# スタンドアロン

scriptタグで読み込んですぐに利用するためには、スタンドアロン版の使用が便利です。`GrimoireJS`及び`gr`がグローバル変数として登録されます。(`gr`は`noConflict`を用いて利用しないことも可能です。)

<div class="primary-buttons"><a download href="https://github.com/GrimoireGL/grimoirejs-basic/raw/master/release/grimoirejs-preset-basic.zip">ダウンロード</a></div>

> Note:
>
> 上のリンクでは`grimoirejs`, `grimoirejs-fundamental`, `grimoirejs-math`が同梱されている、 `grimoirejs-preset-basic`がダウンロードされます。
> `grimoirejs-fundamental`を利用することで初めてレンダリングが行えるようになります。また`grimoirejs-fundamental`は`grimoirejs-math`に依存しているため、これらが含まれます。

## CDN

unpkg上で提供されているパッケージは常に最新版になっています。[こちら](https://unpkg.com/grimoirejs-preset-basic/register/grimoire-preset-basic.min.js)を利用すれば、手軽に組み込むことが可能です。

> Note:
>
> 上のリンクでは`grimoirejs`, `grimoirejs-fundamental`, `grimoirejs-math`が同梱されている、 `grimoirejs-preset-basic`がダウンロードされます。

# npm

すでに自作のアプリケーション環境がNPMを用いている場合や、babelなどを使ったり効率的に開発したい場合のためにnpmを用いる方法も用意されています。

```bash
$ npm install grimoirejs --save
$ npm install grimoirejs-math --save
$ npm install grimoirejs-fundamental --save
```

この状態で、以下のように記述すれば同様にしてgrインターフェースが取得できます。

```javascript
import gr from "grimoirejs";
```

あるいは、`require`を用いて以下のようにも取得できます。

```javascript
const gr = require("grimoirejs");
```

> Note:
>
> ただし、この状態でバンドリングなどにGrimoire.jsは中身に含まれず、scriptタグで読み込む必要があることに注意してください。あくまで参照を取ってくるだけの場合の記法です。

もし、scriptタグなどで読み込まない場合は、以下のようにすることで実際にGrimoire.jsを走らせることが可能です。

```javascript
import gr from "grimoirejs/register";
```

この参照先には実際のgrimoirejsのコードが含まれるため、このままバンドリングなどをすると、grimoirejsのコードを取り込んだまま使用することが可能になります。

> Note:
>
> `grimoirejs-fundamental`, `grimoirejs-math` を利用する場合は同様にインポートし、バンドリングを行うことで利用可能になります。
