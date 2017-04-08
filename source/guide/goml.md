---
type: doc
title: GOML
order: 2
---

[WIP]

# GOMLとは
Grimoire.jsでは、すべてのオブジェクトはツリー構造となって扱われます。
**GOML** はその構造を記述するためのマークアップ言語です。通常、拡張子`.goml`というファイルに記述されます。
GOMLでは、[GrimoireInterfaceに予め登録](url)されたノードとコンポーネントをタグとして使用できます。
ノードとコンポーネントについては、[Grimoire.jsのノード・コンポーネントシステム](url)で解説しています。


# 文法
Gomlは基本的に`xml`です。例えば、以下のようなGomlは正しく読み込まれます。

```xml
<goml>
  <scene>
    <camera position="0,0,-10">
      <camera.components>
        <MouseCameraControl/>
      </camera.components>
    </camera>
    <mesh geometry="cube" color="red" position="0,0,0"/>
  </scene>
</goml>
```

> この例に登場する、`goml`や`scene`などのノードは、標準プラグインである[grimoire-fundamental](url)で定義されています。標準プラグインやコアで定義されるノード・コンポーネントのリストは[ここ](url)で紹介しています。

ノードが持つ属性は、xml属性として指定することができます。
それぞれの属性は、その属性の[コンバータ](url)によって文字列から適切な値に変換されます。
例えば、`<camera>`の`position`属性は、`Vector3`コンバータが利用されます。
属性値の文字列での具体的な記法については[各コンバータの仕様](url)を参照してください。


## オプショナルコンポーネント記法
先程の例では、`<camera>`タグの子要素に`<camera.components>`タグがあり、さらにその子要素に`<MouseCameraControl>`タグがあります。
このように、**あるノードのタグの子要素として`<タグ名.components>`というタグを配置する** ことは、**そのノードにコンポーネントを追加するための特別な記法です。**
例えば、[grimoirejs-physics](https://github.com/GrimoireGL/grimoirejs-physics)プラグインを利用して`<mesh>`タグに物理演算の機能を付与するには、`<scene>`に`PhysicsWorld`コンポーネントを、`<mesh>`に`RigidBody`コンポーネントを以下のように追加します。

```xml
<goml>
  <scene>
    <scene.components>
      <PhysicsWorld/>
    </scene.components>
    <camera/>
    <mesh>
      <mesh.components>
        <RigidBody mass="10"/>
      </mesh.components>
    </mesh>
  </scene>
</goml>
```
このように追加されたコンポーネントを、**オプショナルコンポーネント** と呼びます。

> オプショナルコンポーネントの属性は、**コンポーネントのタグに直接書く** 点に注意してください。
**ノードのタグに書いても反映されません。**

## 名前空間
Grimoire.jsはプラグインによって多くのタグを利用することができますが、タグ数の増加に伴い、他のプラグインで定義されるタグとと名前が重複する可能性が高まります。
Grimoire.jsでは、プラグインごとに名前空間を定義してこれらのタグを識別します。
名前空間はプラグインごとに一意になるように設計されているので、これを利用することですべてのノード、コンポーネント、属性を識別可能です。
名前空間の詳細は[ここ](url)を参照してください。

たとえば、`grimoirejs-plugin1`と`grimoirejs-plugin2`が、どちらも`<apple>`という名前のノード、`Eatable`というコンポーネントを定義していたとしましょう。
この場合、以下のGomlは`<apple>`がどちらのプラグインのものか判別できないため、エラーになります。

```xml
<goml>
  <scene>
    <camera />
    <apple />
  </scene>
</goml>
```

`<apple>`が`grimoirejs-plugin1`のものであることを明示するためには、`<apple>`ノードにxml名前空間を付与します。

```xml
<goml xmlns:plugin1="HTTP://GRIMOIRE.GL/NS/GRIMOIREJS-PLUGIN1">
  <scene>
    <camera />
    <plugin1:apple />
  </scene>
</goml>
```

`Eatable`コンポーネントについても同様です。
```xml
<goml xmlns:plugin1="HTTP://GRIMOIRE.GL/NS/GRIMOIREJS-PLUGIN1">
  <scene>
    <camera />

    <mesh color="red" geometry="cube">
      <mesh.components>
        <plugin1:Eatable/>
      </mesh.components>
    </mesh>

  </scene>
</goml>
```

# GOMLの埋め込み
GOMLをページ上に埋め込むには`<script>`タグに`type="text/goml"`を指定して記述します。

```html
<body>
  <script type="text/goml">
    <goml>
      <scene>
        <camera />
        <mesh color="red" geometry="cube"/>
      </scene>
    </goml>
  </script>
</body>
```

通常は、Gomlは別のファイルに分割することを推奨します。この場合は、`<script>`タグの`src`属性に、Gomlファイルを指定してください。

```html
<body>
  <script type="text/goml" src="./index.goml"></script>
</body>
```
埋め込まれたGomlはページがロードされた直後に、Grimoire.jsが自動的に探索してパースします。
この処理の詳細は次の項で解説します。

# GOMLの読み込み
TODO
