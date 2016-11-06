---
type: doc
title: プラグインを作成してみる
order: 13
---

## 概要

ここではGrimoire.jsが提供しているジェネレータを活用して、ユーザーはプラグインを制作することができます。また、npmを通じてプラグインを公開することも可能です。

## 学べること

* プラグインジェネレータを用いたプラグインの作成手順
* プラグインの公開

### プラグインジェネレータを使用してみる

Grimoire.jsではコンポーネントやノードの作成のためにプラグインジェネレータを提供しています。これによりユーザーは簡単にプラグインを作成し、公開することが可能になります。ジェネレータに関する詳細は[プラグインジェネレータ](../guide/addons-generator.html)を参照してください。ここでは、簡単なノードとコンポーネントを制作することを行い、プラグイン制作の方法を学びます。

> Grimoire.jsのプラグインを制作、公開するためには現在(2016/10)Node.js環境が必要です。プラグインの制作にはTypeScriptを用いられます。

Grimoire.jsのプラグインジェネレータはyoemanを使って導入されます。

```
npm install yo generator-grimoire-addons -g
```

```
mkdir grimoirejs-sample-plugin
cd grimoirejs-sample-plugin
yo generator-addons
```

> Grimoire.jsのプラグインには`grimoirejs`のプレフィックスをつけることが推奨されます。

Grimoire.jsが用いる各ノードやコンポーネントなどの名前の識別のために名前空間を用います。自分以外の人が用いるであろうコンポーネントやノードを作成する場合、名称が被って競合するのを防ぐために利用する必要があります。

以上の操作でGrimoire.jsのプラグイン開発環境は整います。

Git管理する場合には`.gitignore`がジェネレータにより生成されています。


### コンポーネントを制作してみる

コンポーネントを制作してみましょう。今回はコンポーネントをつけると、対象のノードが移動するようになるコンポーネントを作ってみます。

```
npm run scaffold -- -t component -n LinaerMotion
```

`src/Components`以下に`LinearMotionComponent.ts`が生成されます。ジェネレータが基本的な部分が作成されます。ユーザーはコンポーネントに必要な属性とコンポーネントに必要なロジックを構築するだけです。TransformComponentなど依存するコンポーネントを利用する場合には、必要なプラグインを導入して開発しましょう。

以下は定めた方向に一定速度で進むコンポーネントを作成した例です。attributeには`direction`と`speed`の二つを定めています。


```javascript
import Component from "grimoirejs/lib/Node/Component";
import IAttributeDeclaration from "grimoirejs/lib/Node/IAttributeDeclaration";
import {Vector3} from "grimoirejs-math"
import TransformComponent from "grimoirejs-fundamental/lib/Components/TransformComponent";
import Attribute from "grimoirejs/lib/Node/Attribute";
export default class LinearMotionComponent extends Component {

    public static componentName: string = "LinearMotionComponent";

    public static attributes: { [key: string]: IAttributeDeclaration } = {
        // Specify the attributes user can intaract
        direction: {
            defaultValue: "1,0,0",
            converter: "Vector3"
        },
        speed: {
            defaultValue: 1,
            converter: "Number"
        }
    };

    private _transform: TransformComponent;
    private _direction: Vector3;
    private _speed: number;
    public $awake(): void {
        this.getAttribute("direction").boundTo("_direction");
        this.getAttribute("speed").boundTo("_speed");
        this._transform = this.node.getComponent("Transform") as TransformComponent;
    }
    public $mount(): void {
    }
    public $update(): void {
        this._transform.localPosition = this._transform.localPosition.addWith(this._direction.normalized.multiplyWith(this._speed * 0.05));
    }

}
```

`$awake()`や`$mount()`は、Grimoire.jsからメッセージを受け取ります。`$update()`は1フレームに一回呼び出されます。

### コンバーターを生成してみる

コンバーターを作成してみましょう。
カスタムコンバータを使用するためには以下のコマンドによります。

```
npm scaffold -- -t converer -n ConverterName
```

これによりConverterNameConverter.tsとテスト環境が生成されます。
デフォルトでgrimoirejs-fundamentalにコンバーターはいくつか用意されていますが、必要な場合には制作することが必要でしょう。

### ノードを作成してみる

ノードを作成してみます。
ユーザーはindex.ts内に作成したいタグを書くことにより可能です。

```
  GrimoireInterface.registerNode("l-mesh", ["LinearMotion"], {}, "mesh");
```


### 作成したプラグインを公開してみる

作成したコンポーネントを公開するにはnpmを通じてpublishすることにより可能です。


