---
type: doc
title: grimoirejs-fundamental
order: 2
---

この記事は**grimoirejs-fundamental**プラグイン(以降、fundamental)について記述したものです。
このプラグインはGrimoire.jsが提供する最も基本的なプラグインの一つであり、3D描画関連の基礎になる共通のレイヤーを提供します。

**特別な事情がない限り、任意の3D描画を前提とするプラグインはこのプラグインを前提プラグインとし、fundamentalに含まれているAPIを活用して3D描画を実装すべきです。**

fundamentalは以下のような特徴を持ちます。

* 拡張可能性
* 高い分業性(シェーダーやシーン構築など)

## コンバーター

### String

**出力型**

```
string
```

**入力可能なもの**

* String ・・・ そのまま出力されます。
* Object ・・・ toString関数が存在する場合それが呼び出されます。

### Number

**出力型**

```
number
```

**入力可能なもの**

* String・・・Number.parseNumberにより処理され出力されます。
* Number・・・そのまま出力されます。

### Boolean

**出力型**

```
boolean
```

**入力可能なもの**

* String・・・"true"もしくは"false"のみ
* Boolean・・・そのまま出力されます。

### Component

**出力型**

```
<T> where T extends Component
```

**コンバーター引数**

* target・・・取得対象のコンポーネント名

**入力可能なもの**

* String・・・クエリとして解釈されます。属するツリーから該当する**最初の一つ**の**ノード**を見つけ出し、そこから`target`に合致するコンポーネントを取得します。
* GomlNode・・・対象となるノードの中から最初の`target`に合致するコンポーネントを取り出します。
* Component・・・そのまま渡されます(名称が`target`に指定されたものでない時例外がでます)

### Vector2

**出力型**

```
Vector2
```

**入力可能なもの**

* String・・・Vector2.parseにより処理されます。
* Vector2・・・そのまま渡されます。

### Vector3

**出力型**

```
Vector3
```

**入力可能なもの**

* String・・・Vector3.parseにより処理されます。
* Vector3・・・そのまま処理されます。

### Vector4

**出力型**

```
Vector4
```

**入力可能なもの**

* String・・・Vector4.parseにより処理されます。
* Vector4・・・そのまま処理されます。

### Color3

```
Color3
```

**入力可能なもの**

* String・・・Color3.parseにより処理されます。
* Color3・・・そのまま処理されます。
* Color4・・・Alpha値を無視したColor3を生成して渡されます。


### Color4

```
Color4
```

**入力可能なもの**

* String・・・Color4.parseにより処理されます。
* Color4・・・そのまま処理されます。
* Color3・・・Alpha値を1.0としたColor4を生成して渡されます。
