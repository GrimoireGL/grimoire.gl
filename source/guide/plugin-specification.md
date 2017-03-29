---
type: doc
title: Plugin specification
order: 3
---

To make any plugins are able to be worked with the other plugins fine, any plugins should match the specification below.
If you can use template projects, you should use them. But, if you need to use your own development environments, read this specification to follow.

# Directory structure

Grimoire.js plugin of NPM package must include these directories.

* ref
* register
* src

# File structures and purposes

## register/index.js

This is the file loaded with `require("<Plugin package name>/register")`.
This file must contains all javascript entire bundled plugin project.

### Exported object

Assume a plugin have these files below.

* src/A.js
* src/B/C.js
* src/B/D.js

The `export` object must be below.

```javascript
{
  A:require("./A.js"),
  B:{
    C:require("./B.js"),
    D:require("./C.js")
  }
}
```

When the code required, plugin must assign the object above into `window.GrimoireJS.lib.{Plugin package name}`.

**Note**

* Bundled `index.js` must not contain any other plugins code that the plugin depend to.
(Do not call `require("<Plugin name of dependency>/register")`in your library code. But,`require("<Plugin name of dependency>/ref/PATH/TO/MODULE")` is ok to include since that is just referencing the other object.)
* Directory named `A` and a js file named `A.js` cannot exist in same time because of this specification.

## `ref` directory

The files to fetch reference of exported object inside of plugin should be included in this directory.

For instance,`ref/B/C.js` should be generated with following code for `src/B/C.js`.

```javascript
window.GrimoireJS.lib.<package name of dependency>.B.C;
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
window.GrimoireJS.lib.{ライブラリ名};
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
