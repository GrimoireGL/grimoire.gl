---
type: doc
title: sortシェーダー
order: 2
---

**この記事はgrimoirejs-fundamentalを前提**とした記事です。

fundamental上のプログラムはWebGLによってcanvasに描画されます。このため、WebGLの仕様の一つに含まれるGLSLを用いてシェーダーをカスタマイズすることができます。
fundamentalは直接GLSLをいじることも可能ですが、`materialタグ`の整合性などを考慮すると、Grimoire.js用の拡張シェーダー記法(Sort(ソール、フランス語で呪文))を用いるとより良いでしょう。

この記事では、このfundamentalが実装しているGLSLの独自拡張`Sort`(**ソール**)について解説します。

## Sortの特徴

SortはGLSLに独自の構文を複数追加することで、GOML側への連携を強めたものです。そのため、独自拡張以外の部分については基本的にGLSLの文法が用いれます。

また、単にシェーダー言語と言う特徴というより、シングルパス単体のシェーダーコードを記述する事を目的としています。マルチパスについては複数個のSortのシェーダーファイルを組み合わせることにより記述できます。

この基本的な原則に加え、以下のような特徴を主に提供します。

* 頂点シェーダーとフラグメントシェーダーを分離せず記述できます。
* よく使うシェーダーコードなどを外部解決可能です。
* シェーダー変数への代入が極めて簡易的になります。

## マルチパス構文

マルチパスのSortのコードを構成するには`@Pass`ステートメントを利用します。この項以降のすべての説明はシングルパスSortの記述法ですが、`@Pass`によって区切られたSortのプログラムは別のパスとして動作します。

**文法**

```
@Pass
 // First Pass
 #ifdef VS
     // ....
 #endif
 #ifdef FS
     // ....
 #endif
@Pass
 // SecoundPass
 #ifdef VS
     // ....
 #endif
 #ifdef FS
     // ....
 #endif
```

## パス制御構文

Sortには複数個の、シングルパスをどのように構築するかを記述するための構文が存在します。この項ではこれらについて記述します。

### 頂点シェーダーとフラグメントシェーダー

sortとして読み込んだ際は、頂点シェーダーとして用いる場合、`#define VS`が、フラグメントシェーダーとして用いる場合は`#define FS`が挿入されます。
これを用いることで同一ファイルで双方のシェーダーを用いることが可能になります。

例

```glsl

#ifdef VS
  void main(){
    gl_Position = ~~~
  }
#endif

#ifdef FS
  void main(){
    gl_FragColor = ~~~
  }
#endif

```

あくまで、GLSLのマクロを利用したものなので、これらの`VS`で区切られたセクションや`FS`で区切られたセクションは複数回登場することもできます。

#### フラグメントシェーダー内でのprecision

varying変数を用いる際に、以下のような記述をするとフラグメントシェーダーでの精度修飾子がついていないため問題が起きます。

```glsl
varying vec2 vValue;

#ifdef VS
  void main(){
    gl_Position = ~~~
  }
#endif

#ifdef FS
  void main(){
    gl_FragColor = ~~~
  }
#endif
```

これは、頂点シェーダー、フラグメントシェーダーともに使われる`varying vec2 vValue`が先頭にあるためにfloatの精度修飾がないため問題になるからです。
しかし、単に`precision mediump float;`と先頭に記述してしまえば、VSでも読み込まれてしまうのでエラーになってしまう。
そこで、`FS_PRECマクロ`や`VS_PRECマクロ`があらかじめシェーダーの先頭に追加される。

それぞれの定義は以下のようになっている。

```glsl
#ifdef FS
  #define FS_PREC(prec,type) precision prec type;
  #define VS_PREC(prec,type)
#endif
#ifdef VS
  #define VS_PREC(prec,type) precision prec type;
  #define FS_PREC(prec,type)
#endif
```

すなわち、シェーダーファイルの先頭に`FS_PREC(mediump,float)`と記述しておけば、実際にはフラグメントシェーダーの時にはmediump精度が用いられるようになる。


### @import文

`@import`はC++で言えば`#include`のような存在です。単に参照先のスクリプトファイルを指定位置に挿入します。


**文法**

```
@import("ファイルパス")
```

ファイルパスとして受付可能なものは絶対パス及び相対パスです。一般的なURLとして動作します。
また、外部リクエストは増やしたくないが、共通のスクリプトが存在する場合は、特定のエイリアスをこのファイルパスに用いて実際にはプログラム中に既に含まれたコードないから`@import`を解決することができます。

このような場合、`grimoirejs/lib/Material/ImportResolver`をrequireして、ImageResolverのコンストラクタへの参照を取得し以下のように記述することでこれを実現可能です。

```
    ImportResolver.addAliasToStatic("ThisIsAlias","何らかのコード");
```

このように記述すると、`@import("ThisIsAlias")`と言う表記に出くわすと、このコードが挿入されて外部に解決を試みません。

### @NoBlend,@NoCull,@NoDepth

**文法**

```
    @NoBlend()
```

これらの関数に引数はありません。もし、これらの関数がSortのソースコード上に存在すると、fundamentalは自動的にこのコードを実行する前に対応する`gl.disable`を呼び出します。

### @CullFace,@BlendFunc,@BlendFuncSeparate,@BlendEquation,@BlendEquationSeparate,@DepthFunc

それぞれに対応したWebGLの関数を呼び出します。また、引数は定数名をそのまま記入します。

**文法**

```
   @CullFace(FRONT)
```

例えば、以上のような例では`gl.cullFace(gl.FRONT)`をパスの開始時に呼び出すのと同等の結果として処理されます。

また、上記の関数の存在に応じてそれぞれ以下のように自動的に`gl.enable`が挿入されます。


|enableされる先|Sort内に存在する命令|
|:-:|:-:|
|DEPTH_TEST|@DepthFunc|
|BLEND|@BlendFunc,@BlendEquationSeparate,@BlendEquation,@BlendEquationSeparate|
|CULL_FACE|@CullFace|

## 変数Annotation

Sortにおける各uniform変数は`変数Annotation`を受けることが可能です。これは、変数の内容を登録するレジストラに対して、どのような内容の変数を希望するのか記述するものです。
例えば、あるuniform変数testは以下のようにして変数Annotation`default`を受け付けることが可能です。

```
@{default:"1,2,3,4"}
uniform vec4 test;
```

これにより、仮にユーザーがこの変数testになにも指定しなくても、testには初期値として`(1,2,3,4)`が代入された状態でシェーダーが実行されるようになります。
他にも、型や環境Uniform変数の種類によってその他の変数Annotationが意味がある/必須である場合があります。

## 環境Uniform変数

以下のように`_`から変数名が始まる変数は`環境Uniform変数`になります。これらはGOML側に公開されず、対応する変数名のレジストラーが登録されている時には代入されます。
例えば、以下のような例では、`_time`には自動的にGrimoire.js読み込み時からの時間が代入されるようになっています。

```
 uniform float _time;
```

環境Uniform変数は変数名によって代入されます。環境Uniform変数として問題なく動作するためには、その型と変数名について想定する型と合致していなければなりません。

以下はfundamentalがデフォルトで定義している環境Uniform変数です。

|変数型|変数名|内容|
|:-:|:-:|:-:|
|float|_time|Grimoire.js読み込み時からの時間|
|vec2|_viewportSize|レンダリング対象のビューポートサイズ(px単位)|
|mat4|_matM|モデル行列|
|mat4|_matV|ビュー行列|
|mat4|_matP|プロジェクション行列|
|mat4|_matPV|プロジェクション \* ビュー行列|
|mat4|_matVM|ビュー行列 \* モデル行列|
|mat4|_matPVM|レンダリング対象のモデルのプロジェクション行列 \* ビュー行列 \* モデル行列|
|vec3|_cameraPosition|カメラ座標(ワールド座標系)|
|vec3|_cameraDirection|カメラ向き(ワールド座標系)|



## ユーザーUniform変数

前述した環境Uniform変数とは異なり、`_`によって**先導されない**uniform変数を`ユーザーUniform変数`と言います。
このような変数は、自動的に`material`タグなどから操作できるようになります。その際用いられるコンバーターや初期値(defaultアノテーションが存在しない場合)は以下のようになります。

|変数型|コンバーター名|初期値(defaultアノテーションが存在しない際)|
|:-:|:-:|:-:|
|bool|boolean|false|
|float|number|0|
|vec2|Vector2|(0,0)|
|vec3|Vector3(type変数Annotationがcolorの場合はColor3)|(0,0,0)|
|vec4|Vector4(type変数Annotationがcolorの場合はColor4)|(0,0,0,0)|
|float[]|NumberArray|\[0,0,....0\](配列長はシェーダー内の指定による)|
|sampler2D|MaterialTexture|undefined|

ユーザーUniform変数は、自動的にGOML側で操作できるようになります。
例えば、Sort内に`uniform vec3 something;`というようなものがあると、これはユーザーuniform変数なのでこのSortを扱っているタグ側の属性になります。
例えば、このマテリアルがある`mesh`タグに紐付いているならば、そのタグ内で`<mesh something="1,2,3">`と記述することにより、そのマテリアルが使われる際には、(1,2,3)のベクトルがuniform変数に代入されて用いられます。

また、vec3,vec4の変数アノテーションとして`type`アノテーションに`color`を指定するとユーザーがタグから色としてベクトルに値を渡すことができるようになります。

例

```glsl

@{type:"color"}
uniform vec3 specularColor;

@{type:"color"}
uniform vec4 albedoColor;
```

### texture使用フラグ

テクスチャを利用する場合、テクスチャが指定されていなかった場合の処理も記述したいことがある。
そのような場合のために、`sampler2D`型の変数のアノテーションには`usedFlag`アノテーションがあり、テクスチャが使用されているかどうかのフラグを別の変数に代入することができる。

```glsl
@{usedFlag:"flagOfTexture"}
uniform sampler2D texture;

uniform bool flagOfTexture; // textureがタグから挿入されている場合のみtrueが代入される。
```

## 挿入済みマクロ

よく使う定数などいくつかのマクロはデフォルトでヘッダーとしてシェーダーに挿入される。
以下は、初期状態で挿入されるヘッダーのコードである。

```glsl
/*Header start*/
// helper macros
#ifdef FS
  #define FS_PREC(prec,type) precision prec type;
  #define VS_PREC(prec,type)
#endif
#ifdef VS
#define VS_PREC(prec,type) precision prec type;
#define FS_PREC(prec,type)
#endif
// constants
#define PI 3.141592653589793
#define E 2.718281828459045
#define LN2 0.6931471805599453
#define LN10 2.302585092994046
#define LOG2E 1.4426950408889634
#define LOG10E 0.4342944819032518
#define SQRT2 1.4142135623730951
#define SQRT1_2 0.7071067811865476
/*Header end*/
```

## 例

### edge-sprite.sort
```glsl
@Pass
@DepthFunc(LEQUAL)
@CullFace(BACK)
attribute vec3 position;

@vert{
   uniform mat4 _matPVM;
   void main(){
      gl_Position = _matPVM * vec4(position,1);
   }
}

@frag{
  @{type:"color", default:"pink"}
  uniform vec4 color;

  void main(){
     gl_FragColor = color;
  }
}
@Pass
@DepthFunc(LEQUAL)
@CullFace(FRONT)
FS_PREC(mediump,float)

#ifdef VS
   attribute vec3 position;
   uniform mat4 _matPVM;

   @{default:"1.1"}
   uniform float edgeScale;
   void main(){
      gl_Position = _matPVM * vec4(position * edgeScale,1);
   }
#endif

#ifdef FS
  @{type:"color", default:"black"}
  uniform vec4 edgeColor;

  void main(){
     gl_FragColor = edgeColor;
  }
#endif

```

### 扱っているgoml

```xml
<goml width="512" height="512">
  <import-material typeName="edgeSprite" src="./edge-sprite.sort"/>
  <geometry name="sphere" type="sphere" divHorizontal="40" divVertical="40"/>

  <renderers bgColor="#0000">
    <renderer camera=".camera" viewport="0,0,100%,100%">
      <render-scene/>
    </renderer>
  </renderers>
    <scene>
      <camera class="camera" near="0.01" far="40.0" aspect="1.0" fovy="45d" position="0,0,10" rotation="y(0d)">
        <camera.components>
          <MouseCameraControl rotateX="10" moveSpeed="0.1"/>
        </camera.components>
      </camera>
      <mesh geometry="sphere" material="new(edgeSprite)" edgeColor="red"/>
    </scene>
</goml>

```

### 読み込み側のhtml

```html
<!DOCTYPE html>
<html>

<head>
  <script type="text/javascript" src="../product/index.es2016.js"></script> <!--Grimoire.js本体-->
</head>
<body>
  <script id="main" type="text/goml" src="./sample.goml"></script>
</body>

</html>

```

### 結果画像

![https://i.gyazo.com/c78686bc267070f39e55c4c2e23e1f78.png](https://i.gyazo.com/c78686bc267070f39e55c4c2e23e1f78.png)
