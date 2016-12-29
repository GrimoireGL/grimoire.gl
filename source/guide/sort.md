---
type: doc
title: カスタムマテリアルの仕様
order: 2
---

通常、Grimoire.jsのプログラムはWebGLによってcanvasに描画されます。このため、WebGLの仕様の一つに含まれるGLSLを用いてシェーダーをカスタマイズすることができます。
直接GLSLをいじることも可能ですが、`materialタグ`の整合性などを考慮すると、Grimoire.js用の拡張シェーダー記法(Sort(ソール、フランス語で呪文))を用いるとより良いでしょう。

この記事では、このfundamentalが実装しているGLSLの独自拡張`Sort`(**ソール**)について解説します。

## マテリアルとは

`.sort`ファイルがなんであるかを理解するためには、まず`マテリアル`とはなんであるかを理解する必要があります。
`Grimoire.js`において、`マテリアル`とは`ジオメトリ`と同時に扱われる概念です。ジオメトリはその **オリジナルの形状** を意味する概念である一方で、マテリアルはジオメトリをどのように描画するかという、`描画手法`の組を扱うための概念です。

一つのジオメトリは、カメラ一つであったとしても、一回のレンダリングで複数回の描画がされる可能性があります。例えば、ポストエフェクトの関係で、シーンの全体を描画する前にシーン中の物体すべての`法線`を書き出さなければならないかもしれません。この場合`色`を書き込むための手法と、`法線`を書き込むための手法が必要になります。

この一つあたりの手法を`Technique`(テクニック)と呼びます。レンダラーが、法線の画像データが欲しい時は、すべてのマテリアルとジオメトリの組みに対して、法線の描画に対応したテクニックをもつマテリアルに対して描画命令を出します。

一つの手法は複数個の手順によって成り立っているかもしれません。例えば、3Dグラフィクスでよくある手法の一つに、あらかじめ大きめに書いたものの上に小さくした物体を書いてエッジに見せるという手法があります。手書きで言えば、下地を描いてから、上の塗りをするように一つの手法が複数個の手順によって成り立っている可能性があるのです。この手順を`Pass`(パス)と呼びます。

つまり、一つのマテリアル(あるジオメトリを描画するための複数個の描画手法の集合)は、一つ以上のテクニック(描画手法)からなり、一つのテクニックは、一つ以上のパス(描画手順)からなります。

つまり、Material > Technique > Passの順番で包含関係があります。

一つのマテリアルを表現するsortファイルは、**Techniqueを省略して記述することは可能ですが、Passを省略して書くことはできません。**
まずは、カスタムマテリアルの第一歩としてパスを記述して見ましょう。

## GOMLからのsortファイルの読み込み

### import-material

`<import-material>`を用いて、記述したカスタムマテリアルを読み込むことができます。(カスタムマテリアルの記述法については後述)

```xml
<import-material typeName="test" src="something.sort"/>
```

このように記述すると、`test`という名前を用いれば、`something.sort`に記述されたカスタムマテリアルを用いることができます。

一度、importされたマテリアルは二つの方法で指定が可能です。

#### 新しいマテリアルのインスタンスを作る場合

```xml
　<mesh material="new(test)"/>
```

マテリアルを受け取りうる要素に対して、`new(マテリアル名)`のように記述すると、その指定先に対して新しいインスタンスが作られます。
マテリアルは読み込むマテリアルに応じて、 **動的に** 指定可能な属性が変化します(詳細は後述)。  
例えば、あるマテリアル`test`が`color`属性を`Color3`コンバーターによって受け取るとすればいかのような記述をすることができるようになります。

```xml
   <mesh material="new(test)" color="yellow"/>
```

マテリアルを受け取りうる要素に対して、`new(マテリアル名)`のように記述すると、その指定先に対して新しいインスタンスが作られます。
マテリアルは読み込むマテリアルに応じて、 **動的に** 指定可能な属性が変化します(詳細は後述)。  
例えば、あるマテリアル`test`が`color`属性を`Color3`コンバーターによって受け取るとすればいかのような記述をすることができるようになります。

```xml
   <mesh material="new(test)" color="yellow"/>
```

#### マテリアルタグによって共通のインスタンスを作成する場合

```xml
  <!--GOML直下-->
  <material id="mat1" type="test" color="blue"/>
  <!--scene内-->
　<mesh material="#mat1"/>
　<mesh material="#mat1"/>　
  <mesh material="#mat1"/>
```

このような記述をした場合、上記の3つのメッシュでは同じマテリアルが用いられます。`<material>`に指定されている`color`を変更すると3つすべての`color`変わります。
このような指定の際は、`<mesh>`自身が`color`を受け取ることはないことに注意してください。

#### メッシュのマテリアルの初期値

ここで、一つ例としてmeshのマテリアルの初期値は`new(unlit)`となっています。また、`unlit`というマテリアルはデフォルトで読み込まれるシェーダーの一つです。
このマテリアルは、`color`と`texture`という値を受け取りうるため、普段、`<mesh>`はこれらの値を指定できます。

つまり、マテリアルがこれ以外である時`color`や`texture`という属性は存在しません。

また、`material`を初期値としたまま多くのメッシュを使う場合、それぞれのメッシュに対してマテリアルのインスタンスが作成されるため非効率です。
そのような際は、**共通にできる部分は`<material>`タグを用いて共通化することを推奨します。**

## パスの記述

まずは、パスを記述する方法を解説します。
パスは以下の要素によって成り立ちます。

* GLSLによって記述されたシェーダー
* パスの描画前に実行されるglのステートを示した宣言文
* その他Grimoire.jsとの相互運用性のために設けられた構文

### シェーダー言語の記述

#### シェーダーとは

シェーダー言語はGPU上で動作する言語です。WebGLの本質は3Dをできることではなく、3D描画などを高速に行えるシェーダーという言語がGPU上で動かせることにあります。
マテリアルによる頂点の移動や各ピクセルの色の決定などを高速にするために用いられます。

この特徴から、残念ながら **javascriptのみではシェーダーを記述することはできません。** 代わりに **GLSLという言語を用いられます。**

残念ながら、このページではシェーダー言語の仕様や入門について深く触れることはできません。しかし、これらは一般的にデスクトップ環境で動作する`OpenGL`で用いられるものと全く同じ仕様の`GLSL`が動作するため、既存の学習資料が幾らか存在します。  
また、[ShaderToy](https://webgl.souhonzan.org/entry/?v=0600)や、[doxasさんの入門記事](http://qiita.com/doxas/items/b8221e92a2bfdc6fc211)などを参照すれば、入門することができるでしょう。

#### sort内のシェーダー

sortのパス内にはそのまま直接シェーダーを記述することができます。

```glsl
@Pass{
  // ここにシェーダーを記述する
}
```

**GLSLで記述されたシェーダーは必ず`@Pass`によって囲われなければなりません。**

このSortによって読み込まれたシェーダーでは、頂点シェーダーとして用いる場合、`#define VS`が、フラグメントシェーダーとして用いる場合は`#define FS`が挿入されます。
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

#### デフォルト定数

また、いくつかの定数がデフォルトで定義されます。これらの定数はjavascriptの`Math.~~`でアクセスできる定数と全く同じものです。

```glsl
// constants
#define PI 3.141592653589793
#define E 2.718281828459045
#define LN2 0.6931471805599453
#define LN10 2.302585092994046
#define LOG2E 1.4426950408889634
#define LOG10E 0.4342944819032518
#define SQRT2 1.4142135623730951
#define SQRT1_2 0.7071067811865476
```

#### フラグメントシェーダー内でのprecision

以下のような記述をするとフラグメントシェーダーでの精度修飾子がついていないためGLSLの仕様上問題が起きます。

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
本来、フラグメントシェーダーの他のどの`float系`の変数宣言よりも前に`precision float mediump`などの記述が必要です。
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

すなわち、シェーダーファイルの先頭に`FS_PREC(mediump,float)`と記述しておけば、実際にはフラグメントシェーダーの時のみmediump精度が用いられるようになる。

#### uniform変数

uniform変数、attribute変数は共にアノテーションとセマンティクスを持ちます。
意味の解説はとりあえず置いておいて、例えば以下のような記述があります。

```glsl
@MODELVIEWPROJECTION
uniform mat4 matrixMVP;

@HAS_TEXTURE{sampler:"theTexture"}
uniform bool usingTexture;

uniform sampler2D theTexture;

@{default:"yellow", type:"color"}
uniform vec3 theColor;
```

つまり、文法としては以下の形式です。

```glsl
@セマンティクス{アノテーション}
uniformまたはattribute 型名 変数名; // ここは通常のGLSLの変数定義
```

**セマンティクスとアノテーションを両方省略することができます。** 省略した場合はセマンティクスは`USER_VALUE`(例外あり、詳しくは後述)、アノテーションは空になります。上記の例では、`theTexture`が両方省略されています。  
**セマンティクスだけ省略することができます** 省略した場合はセマンティクスは`USER_VALUE`(例外あり、詳しくは後述)、アノテーションは空になります。  上記の例では、`theColor`がセマンティクスのみ省略されています。  
**アノテーションだけ省略することができます** 省略された場合は空になります。上記の例では、`matrixMVP`のアノテーションだけ省略されています。  

##### セマンティクス

セマンティクスはその変数に何が代入されるべきかということを指します。
例えば、セマンティクスが`MODELVIEWPROJECTION`と記述されているときは、その変数には描画していようとしている対象のメッシュのModel - View - Projection行列が渡されます。
セマンティクスが`VIEWPORT`の時は、その変数には現在のビューポートの情報が渡されます。

セマンティクスによってあらかじめ、変数の受け渡しを担当するレジスター関数が決定され、パスの描画前に実行されます。

以下は、デフォルトの状態で定義されているセマンティクスのリストです。
(このうちのほとんどは、ランタイムモデルフォーマットの`glTF`の[仕様](https://github.com/KhronosGroup/glTF/tree/master/specification/1.0#semantics)そのものです。実は、内部的なマテリアルの保持形式はglTFの仕様にかなり近い形で保持されています。)

###### glTFと仕様が同じもの

| Semantic                     | Type         | Description |
|:----------------------------:|:------------:|-------------|
| `LOCAL`                      | `FLOAT_MAT4` | Transforms from the node's coordinate system to its parent's.  This is the node's matrix property (or derived matrix from translation, rotation, and scale properties). |
| `MODEL`                      | `FLOAT_MAT4` | Transforms from model to world coordinates using the transform's node and all of its ancestors. |
| `VIEW`                       | `FLOAT_MAT4` | Transforms from world to view coordinates using the active camera node. |
| `PROJECTION`                 | `FLOAT_MAT4` | Transforms from view to clip coordinates using the active camera node. |
| `MODELVIEW`                  | `FLOAT_MAT4` | Combined `MODEL` and `VIEW`. |
| `MODELVIEWPROJECTION`        | `FLOAT_MAT4` | Combined `MODEL`, `VIEW`, and `PROJECTION`. |
| `MODELINVERSE`               | `FLOAT_MAT4` | Inverse of `MODEL`. |
| `VIEWINVERSE`                | `FLOAT_MAT4` | Inverse of `VIEW`. |
| `PROJECTIONINVERSE`          | `FLOAT_MAT4` | Inverse of `PROJECTION`. |
| `MODELVIEWINVERSE`           | `FLOAT_MAT4` | Inverse of `MODELVIEW`. |
| `MODELVIEWPROJECTIONINVERSE` | `FLOAT_MAT4` | Inverse of `MODELVIEWPROJECTION`. |
| `MODELINVERSETRANSPOSE`      | `FLOAT_MAT3` | The inverse-transpose of `MODEL` without the translation.  This translates normals in model coordinates to world coordinates. |
| `MODELVIEWINVERSETRANSPOSE`  | `FLOAT_MAT3` | The inverse-transpose of `MODELVIEW` without the translation.  This translates normals in model coordinates to eye coordinates. |
| `VIEWPORT`                   | `FLOAT_VEC4` | The viewport's x, y, width, and height properties stored in the `x`, `y`, `z`, and `w` components, respectively.  For example, this is used to scale window coordinates to [0, 1]: `vec2 v = gl_FragCoord.xy / viewport.zw;` |

###### それ以外のもの

| Semantic                     | Type         | Description |
|:----------------------------:|:------------:|-------------|
| `TIME`                      | `FLOAT` | 時間(ms単位) |
| `HAS_TEXTURE` | `BOOL`| 有効なテクスチャが指定したsamplerに割り当てられているかどうか、詳細は後述 |
| `USER_VALUE`  | `ANY` | 詳細は後述|


##### アノテーション

セマンティクスによって、レジスター関数は決定されますが、その他に引数が必要な場合があります。
例えば、`HAS_TEXTURE`セマンティクスは、アノテーションの中に`sampler`という引数が必要です。この`HAS_TEXTURE`アノテーションは、  `sampler`に指定されている名前の変数に、有効なテクスチャが代入されているかどうかを判定した値が代入されます。

```glsl
@HAS_TEXTURE{sampler:"theTexture"}
uniform bool usingTexture;

uniform sampler2D theTexture;
```

上記の例では、`theTexture`に有効なテクスチャが代入されている時のみ渡されることになります。

このように、アノテーションはレジスター関数が実際の割り当て時に用いる引数のセットです。アノテーションは`JSON`の形式をとりますが、 **キー名の`"`は省略可能です**

#### USER_VALUEセマンティクス

このセマンティクスは、このuniform変数がGOMLに露出される変数であることを指します。  
例えば、この記事の最初の方で記述した`color`の例がこれにあたります。`<mesh>`の`material`属性など、マテリアルにGOMLから値を渡されることを示します。

例えば、`USER_VALUE`セマンティクスが指定されているuniform変数`test`が`float`型なら、つまり、

```glsl
@USER_VALUE
uniform float test;
```

の時、この値は`<mesh>`あるいは`<material>`に露出することになります。どちらが露出するかはどのような形で`material`を指定したかにより異なります。
`new(~~)`の形式で指定したなら **そのメッシュ自身** 、クエリ形式で指定したなら **materialタグ** になります。

##### コンバーターとdefaultアノテーション

ほかのどの`GOML`内の`attribute`とも同じように、ユーザーが渡した値を`grimoire`が内部的に変換するため、コンバーターを介して実際の値は取得されます。
どのコンバーターが利用されるかは、 **変数型**　と **アノテーション**　と **配列か否か** によって確定します。

また、`USER_VALUE`セマンティクスの指定されている変数は、`default`アノテーションを受け付けることができます。
GOML側から値が指定されない場合、この値が **コンバーターを通ってから** 渡されることになります。

さらに、GOML側からも指定されず、`default`アノテーションによっても指定されない場合、`USER_VALUE`セマンティクスが指定されている場合は、それぞれの型によってきまるデフォルト値が渡されます。

つまり、

```
   GOMLによる指定値  >  defaultアノテーション  > 型によって決まるデフォルト値
```

によって値は解決されます。

| GLSL変数型                     |     コンバーター     | デフォルト値 |　備考 |　
|:----------------------------:|:------------:|:-------------:|:---:|
|float|Number|0||
|vec2|Vector2|(0,0)||
|vec3|Vector3|(0,0,0)|`type`アノテーションが`color`でない時|
|vec3|Color3|white|`type`アノテーションが`color`の時|
|vec4|Vector4|(0,0,0,0)|`type`アノテーションが`color`でないとき|
|vec4|Vector4|white(a=1)|`type`アノテーションが`color`の時|
|bool|Boolean|false||
|int|Number|0||
|ivec2|Vector2|(0,0)||
|ivec3|Vector3|(0,0,0)||
|ivec4|Vector4|(0,0,0,0)||
|sampler2D|Texture|白色 1*1 のテクスチャ||
|mat4[]|Object|[0...0]|型はFloat32ArrayもしくはNumberの配列を利用可能|

この一覧にない型は現在未対応です。ただし、必要なものも多いため対応幅は順次拡大します。

##### デフォルトセマンティクス

利便性のため、また`v0.10`未満のライブラリからのアップデートの容易性を保つため、以下の変数名はデフォルトで次のセマンティクスが用いられます。


|変数名|セマンティクス|
|:-:|:-:|
|_time| TIME|
|_viewportSize| VIEWPORT_SIZE|
|_matL| LOCAL|
|_matM| MODEL|
|_matV| VIEW|
|_matP| PROJECTION|
|_matVM| MODELVIEW|
|_matPVM| MODELVIEWPROJECTION|
|_matIM| MODELINVERSE|
|_matIV| VIEWINVERSE|
|_matIP| PROJECTIONINVERSE|
|_matIVM| MODELVIEWINVERSE|
|_matIPVM| MODELVIEWPROJECTIONINVERSE|
|_matITM| MODELINVERSETRANSPOSE|
|_matITVM| MODELVIEWINVERSETRANSPOSE|


#### attribute変数

##### attribute変数のセマンティクス

`uniform`変数と同様に、`attribute`変数もセマンティックスを持ちます。  
このセマンティクスは、どの`attribute`変数にジオメトリ中のどのバッファを利用すればいいのか決定するために存在します。

例えば、全てのプリミティブのジオメトリは`POSITION`,`NORMAL`,`TEXCOORD`というバッファを保持しています。(もしも、自分でジオメトリを作っている方がいたとしたら、この限りではありません。)

```glsl
@POSITION
attribute vec3 value;
```

と記述すれば、この`value`に、ジオメトリの`POSITION`バッファがバインドされることになります。

##### デフォルトセマンティクス

利便性のため、また`v0.10`未満のライブラリからのアップデートの容易性を保つため、以下の変数名はデフォルトで次のセマンティクスが用いられます。

|変数名|セマンティクス|
|:-:|:-:|
|position|POSITION|
|normal|NORMAL|
|texCoord|TEXCOORD|

つまり、以下の二つのコードは同一の意味になります。

```glsl
@POSITION
attribute vec3 position;
```

```glsl
attribute vec3 position;
```

#### @import文

Sort内のシェーダーでは、外部ファイルの参照ができます。
`@import`はC++で言えば`#include`のような存在です。しかし、特に特別なことはせず、単に参照先のスクリプトファイルを指定位置に挿入します。


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

### glステートの操作

マテリアルによっては、glのステートを操作する必要があります。例えば、あるマテリアルで加算合成したい場合、本来描画する前に`gl.blendFunc(gl.ONE,gl.ONE)`と記述すると加算合成されます。
(ブレンディングについては[こちらのツール](http://www.andersriggelsen.dk/glblendfunc.php)を利用すれば理解が捗るでしょう。)

このように、特定のglステートを操作する関数をパスの実行前に呼び出す場合、以下のような構文を記述することにより可能です。

```
@Pass{
  @BlendFunc(ONE,ONE)
  // ここにシェーダーを記述
}
```

利用可能なglの関数は以下の通りです。

* [BlendFunc](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc)
* [BlendFuncSeparate](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFuncSeparate)
* [BlendEquation](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation)
* [BlendEquationSeparate](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquationSeparate)
* [BlendColor](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendColor)
* [ColorMask](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask)
* [CullFace](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace)
* [DepthFunc](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc)
* [DepthRange](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthRange)
* [FrontFace](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace)
* [LineWidth](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth)
* [PolygonOffset](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset)
* [Scissor](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor)

また、これらを指定しなくとも初期値が読み込まれます。これらの初期値は以下の通りです。

```js
{
  blendFuncSeparate: [WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA, WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA],
  blendEquationSeparate: [WebGLRenderingContext.FUNC_ADD, WebGLRenderingContext.FUNC_ADD],
  blendColor: [0, 0, 0, 0],
  cullFace: [WebGLRenderingContext.BACK],
  lineWidth: [1],
  frontFace: [WebGLRenderingContext.CCW],
  depthRange: [0, 1],
  depthFunc: [WebGLRenderingContext.LESS]
}
```

また、有効になっていないGLの機能の有効、無効を切り替えることができます。

```glsl
@Pass{
  @Disable(CULL_FACE)
  // ここにシェーダーを記述
}
```

このように記述すると、カリングが無効になります。(`gl.disable(gl.CULL_FACE)`を行うのと同じ)
つまり、裏面も描画されるようになります。

一方で、以下のように記述すればステンシルテストを有効にすることができます。(`gl.enable(gl.STENCIL_TEST)`を行うのと同じ)

```glsl
@Pass{
  @Enable(STENCIL_TEST)
  // ここにシェーダーを記述
}
```

これらも、glのステートと同様に初期値が存在し以下がデフォルトでenabledとして指定されます。

* CULL_FACE
* DEPTH_TEST
* BLEND

### その他の構文

#### マクロ

通常、GLSLでは`#define`や`#ifdef`などのC由来のプリプロセッサが用いれます。
Grimoire.jsではこのマクロを、GOML側の変化によって動的に変更することが可能です。

例えば、以下のような宣言がパス中に存在すると、

```glsl
@ExposeMacro(bool,useTexture,USE_TEXTURE,false)
```

シェーダーの文中に、`#define USE_TEXTURE false`や`#define USE_TEXTURE true`が、GOML側の`useTexture`属性によって挿入されます。
ユーザーにとって見かけ上、マテリアルの`USER_VALUE`変数と同一ですが、変更された時点でシェーダーをリコンパイルするので、あまり変更が多い変数には用いられません。
しかし、配列の大きさや、forループの数など、GLSL中で定数しか用いれない場所では効果を発揮します。

また、`@ExposeMacro`の第一引数は型で、これによりGOML側のコンバーターが決定されますが、`bool`と`int`のみが、それぞれ`Boolean`コンバーター、`Number`コンバーターによって渡されることになります。これ以外のコンバーターに対応していないことに気をつけてください。

## テクニックの記述

テクニックとは、マテリアルの中に複数の描画タイプを持っておくようにするための機構です。

```glsl
@Technique テクニック名{
  @Pass{
    ...
  }

  @Pass{
    ...
  }
}
```

のような構文をとります。

**Techniqueを省略してPassを記述すると、そのTechnique名はdefaultになります**

例えば、以下のようなマテリアルがあったとします。

```glsl
@Technique T1{
  @Pass{
    ...
  }
  @Pass{
    ...
  }
}

@Technique T2{
  @Pass{
    ...
  }
  @Pass{
    ...
  }
}
```

この際、ある`<renderer>`タグで以下のように指定したとします。

```xml
<renderer>
  <render-scene technique="T1"/>
  <render-scene technique="T2"/>
</renderer>
```

この場合、`T1`テクニックを持つ全てのシーン要素を描画した後、`T2`テクニックを持つ全てのシーン要素を描画します。
通常は、`default`テクニックが用いられるため、テクニックの指定がなくても問題ないのです。

しかし、ディファードシェーディングなど、複数回の描画を同一のメッシュに対して繰り返す場合はこの記法によって大きな威力を発揮します。

### 描画順序

背景にシェーダーを用いたい場合など、先に描画しておきたかったり、デプス値への書き込みをしないパーティクルなど、Grimoire.jsによる描画順序を操作したい場合があります。

```glsl
@Technique default{
  @DrawOrder(NoAlpha)
  @Pass{
    ...
  }
  @Pass{
    ...
  }
}
```

のように記述すれば、このテクニックが描画される順序は`NoAlpha`であると言えます。

**パスそれぞれに指定することはできないことに気をつけてください**

また、デフォルトで指定可能な描画順序は以下の通りです。

|描画順序名|優先度|遠くから描画|
|:-:|:-:|:-:|
|Background|1000|しない|
|NoAlpha|2000|しない|
|UseAlpha|3000|する|
|NoDepth|4000|する|
|Overlay|5000|する|

つまり、あるテクニックが描画される際、同じテクニックを持つマテリアルは、この描画順序に基づいてレンダリングされます。
また、遠くから描画する描画順序の場合は、同じ描画順序の時、遠い方を優先し、そうでないときは近い方から描画されます。

通常、アルファ値を使う場合、遠くから描画しないと透けて見えなくなってしまいますが、使わない場合、近くから描画した方が深度テストで落ちるピクセルが多いため通常パフォーマンスが向上するはずです。

## 拡張

この項では、以上で定義されたデフォルトの扱いについてそれぞれの拡張の方法について議論する。

### 新しいUniform変数のセマンティクスを追加する

新しいUniform変数のセマンティクスを追加するには、`UniformResolverRegistry`クラスを用います。

以下のようにインポートします。

```javascript
import UniformResolverRegistry from "grimoirejs-fundamental/ref/Material/UniformResolverRegistry";
```

あるいは、

```javascript
var UniformResolverRegistry = gr.lib.fundamental.Material.UniformResolverRegistry;
```

さらに、`UniformResolverRegistry.add`メソッドを用います。

```javascript
UniformResolverRegistry.add("新しいセマンティクス名",変数レジスターを返す関数);
```

例えば、

```javascript
UniformResolverRegistry.add("新しいセマンティクス名",(valInfo)=>{
  return (proxy,args)=>{
    proxy.uniformFloat(valInfo.name,0);
  };
});
```

のようなことを記述すれば、このセマンティクスに対しては0が代入されることになります。

例えば、オーディオの変数を取れるようにしたりなど、この拡張性は非常に便利です。
実際には以下のコードが非常に参考になるでしょう。

https://github.com/GrimoireGL/grimoirejs-fundamental/tree/master/src/Material/Uniforms
