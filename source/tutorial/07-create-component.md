---
type: doc
title: コンポーネントの作成
order: 7
---

## 概要

この章ではGrimoire.jsで使用可能なコンポーネントを作成してみます。基本的なコンポーネントを作成することを通して、コンポーネント自作のための手順を学びましょう。

## 学べること

* コンポーネントの作成

### コンポーネントの作成

コンポーネントを定義するにはregisterComponentメソッドを用います。javascriptからコンポーネントを定義してみましょう。


```javascript
gr(function() {
    var $$ = gr("#main");
    gr.registerComponent("Print", {
        attributes: {
            test: {
                defaultValue: "HELLO WORLD!",
                converter: "String"
            }
        },
        $awake:()=>{
          console.log("This is test!");
        }
    });
   $$("mesh").addComponent("Print");
   var data = $$("mesh")("Print").getAttribute("test");
});
```


それでは確認してみましょう。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t07-01"></iframe>


基本的なコンポーネントの制作に関しては以下の通りです。Grimoire.jsではコンポーネント制作のためのジェネレータも用意しています。この場合コンポーネントはTypeScriptを通じてNode.js環境で開発することになるでしょう。
詳しくは、[こちら](tutorial/13-create-plugin.html)を参照してください。

> 次はGOMLのノードのライフサイクルについて考えます
>
> [ノードのライフサイクルを学ぶ](/tutorial/08-node-lifecycle.html)