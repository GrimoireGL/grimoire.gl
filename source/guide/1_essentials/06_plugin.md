---
type: doc
title: プラグイン
order: 50
---

# プラグインとはなにか？
Grimoire.jsは高い拡張性を持ったフレームワークです。
一方で、そのためにコアに標準で備えられている機能は最小限になっています。
Grimoire.jsを利用するほとんどの場合は、プラグインを適切に組み合わせて利用することになります。

今まで、Grimoire.jsを利用して簡単なサンプルを作ってきましたが、ページ読み込み時にGrimoire.jsのバージョン情報がコンソールに表示されていました。

```
Grimoire.js v0.14.1-beta4
plugins:

  1 : grimoirejs-math@1.8.0
  2 : grimoirejs-fundamental@0.12.6
  3 : grimoirejs-preset-basic@1.8.6

To suppress this message,please inject a line "gr.debug = false;" on the initializing timing.
```
そのページで読み込んでいる`Grimoirejs-preset-basic`は、

- `grimoirejs-math`
- `grimoirejs-fundamental`

の２つのプラグインを含んでいます。標準的なwebGLレンダリングの機能をこれらが実装しています。
このようにプラグインを組み合わせることで、必要に応じて様々な機能を組み合わせることができます。
また、プラグインを新しく開発して、公開するための方法も用意しています。


# 作成するには？

プラグインの作成は複雑なビルド環境を用意する必要があり、構築は非常に煩雑です。
そのため、[構築済みのボイラーブレート](https://github.com/GrimoireGL/ts-boilerplate)を利用することを推奨します。
ビルド環境は、`grimoirejs-couldron`というツールとしてまとめられています。

```bash
git clone git@github.com:GrimoireGL/ts-boilerplate.git
```

クローンしたら、`npm install`します。





# 公開するには？
