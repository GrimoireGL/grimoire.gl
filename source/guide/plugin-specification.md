---
type: doc
title: プラグイン仕様
order: 3
---

grimoire.jsでは、プラグインを用いてユーザーが新たに使用可能なタグが増えたり、インターフェースを拡張することができる。
これらのプラグインを増やし、Web上に誰でも再利用可能な様々なタグベースの機能を蓄積するために、それぞれのプラグインは以下の仕様を満たす必要がある。

これらの機能を満たすためのテンプレートを提供するためのパッケージを提供してはいるが、もし自前のビルド環境を用いる場合は以下の仕様を考慮しなければならない。

# フォルダ構成

プラグインをnpmにpublishする際には以下の2つのフォルダが必ず含まれる。

* ref
* register

# ファイル構成

## register/index.js

プラグインのユーザーが`require("プラグイン名/register")`を読んだ際に読み込まれるファイルである。このjavascriptファイルには、プラグイン内の全ファイルがバンドリングされた状態で出力されるべきである。

また、このファイルのexportは以下のようなオブジェクトを出力する仕様を持つ。

例えば、あるプラグインが以下のようなファイルを持っていたとする。

* src/A.js
* src/B/C.js
* src/B/D.js

このようなファイルを持っている場合は、index.jsは以下のようなオブジェクトをexportしなくてはならない。

```javascript
{
  A:require("./A.js"),
  B:{
    C:require("./B.js"),
    D:require("./C.js")
  }
}
```

また、同時にこのコードが呼ばれると出力する上記のようなオブジェクトそのものを`window.GrimoireJS.lib.{{ライブラリ名}}`に対して代入する必要がある。

**注意点**

* バンドリング済みのファイルに、依存先のGrimoire.jsのプラグインは含めてはならない。
(プラグイン内で`require("依存先ライブラリ名/register")`を呼んではならない。`require("依存先ライブラリ名/ref/PATH/TO/MODULE")`は参照なので問題ない。)
* ソースフォルダの中では、フォルダAとファイルA.jsが同時に存在してはならない。(この場合、上記のindex.jsはうまく生成することができない。)

## refフォルダ

プラグインないの各ソースファイルに対して参照を取得するためのファイルが含まれる。

例えば、`src/B/C.js`に対しては、以下のような内容をexportする`ref/B/C.js`を生成する。

```javascript
window.GrimoireJS.lib.{{ライブラリ名}}.B.C;
```

また、Typescriptを用いてライブラリにアクセスするユーザーを考慮するために、以下の2つのうちどちらかのファイルを上記の`src/B/C.js`に対して`ref/B/C.d.ts`を生成する必要がある。

**src/B/C.tsが存在するとき(プラグイン自体がTypescriptで記述されている時)**

ライブラリの`src/B/C.ts`をコンパイルされた時に生成される`d.ts`ファイル(型宣言ファイルを用いる)

**src/B/C.tsが存在しないとき(プラグイン自体がTypescriptで記述されていない時)**

以下のような`d.ts`ファイルをそれぞれ生成する。

```typescript
var v:any;
export default v;
```

## ref/index.js

以下のオブジェクトをexportする必要がある。

```javascript
window.GrimoireJS.lib.{{ライブラリ名}};
```

# grimoirejs-cauldronのヘルパーコマンド

上記の仕様を満たすためのいくつかの自動生成コマンドを、`grimoirejs-cauldron`パッケージが内包している。

## generate-exposureコマンド

```bash
$  cauldron generate-exposure --src ./src --dest ./src/index.ts --ts --main ./src/main.ts
```

|パラメータ名|説明|
|:-:|:-:|
|src|参照するファイル(プラグインで用いるファイル)の含まれるフォルダ|
|dest|生成するjsファイル(typescriptの場合はtsファイル)|
|ts|typescriptを生成すべきかどうか|
|main|プラグインの登録処理で呼ばれるべきファイル(プラグインのエントリーポイント)|

## generate-referenceコマンド

```bash
$  cauldron generate-reference --src ./src --dest ./src/index.ts --ts --main ./src/main.ts --dts ./ref
```

|パラメータ名|説明|
|:-:|:-:|
|src|参照するファイル(プラグインで用いるファイル)の含まれるフォルダ|
|dest|生成するjsファイル(typescriptの場合はtsファイル)|
|ts|typescriptを生成すべきかどうか|
|main|プラグインの登録処理で呼ばれるべきファイル(プラグインのエントリーポイント)|
|dts|dtsフォルダを生成する先(基本的にrefフォルダ)|

# babelのポリフィル系の留意点

refやregister内のjsファイルは全てbabel後、es2015準拠のコードでなければならない。ただし、`babel-polyfill`を各プラグインに入れてしまうと困ってしまうので、以下の例外を除いて`require("babel-polyfill")`や`transform-runtime`プラグインを用いてはならない。

## preset

Grimoire.jsには、babelの設定のpresetのように、複数のプラグインのセットをプリセットとしてインストールしたり、scriptタグとして用いることができる。
このプリセットに`grimoirejs`が含まれるpresetを用いる場合、scriptタグで用いる対象のみ`babel-polyfill`を用いる必要がある。(**register/index.jsはrequireされた時に用いられるファイルであるからこれに含めてはならない**)

また、他のプラグインをscriptからの読み込みで用いられうることを考えると、プラグインを`transform-runtime`プラグインを用いてバンドリングしてもならない。
