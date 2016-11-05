---
type: doc
title: ノードの作成
order: 10
---

## 概要


## 学べること

* ノードの作成

### ノードの作成

コンポーネントを定義するにはregisterNodeメソッドを用います。
registerNodeメソッドでは第一引数にノードの名前、第二引数に付属するデフォルトコンポーネントを記述します。
基本的には以上により、Grimoireインターフェースで定義したタグを記述することができるようになります。

```javascript
gr(function() {
    var $$ = gr("#main");
    debugger;
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
    console.log(gr.componentDeclarations);
    console.log(data);
});
```

それでは確認してみましょう。

> 次はマテリアルの自作を学びます。マテリアルは物体の質感を設定するために重要です。Grimoire.jsではマテリアルの作成とインポートを強くサポートしています。マテリアルを作成して、3D表現に幅をもたせましょう。
>
> [マテリアルを自作してみる](/tutorial/11-create-material.html)