---
type: doc
title: マテリアルの自作
order: 11
---

## 概要

Grimoire.jsのfundamentalプラグインには強力なマテリアルの作成・インポート機能が含まれている。
これにより、シェーダーの作成者は最小限の労力でマテリアルを作成し公開できるとともに、
利用者はすぐにインポートして、タグベースのインターフェースで利用できる。

この章ではシェーダーを活用したマテリアルの作成について解説する。そのため、GLSLの文法がある程度前提
になる解説が多々存在する。
**もし、GLSLにまったく触れたことがない、それがなんであるかがわからない読者は一度`ShaderToy`などを
利用してGLSLに触れてみることを強く推奨する。**

## Sortファイル

このライブラリにおけるシェーダーファイルの形式はGLSLを拡張したSORT(ソール)によって記述される。  
GLSL単体では、単一のシェーダー(頂点シェーダーもしくはフラグメントシェーダー)を複数個記述して、
javascriptなどから操作することにより初めて利用できるが、このSORTを利用することによって、
`マルチパスレンダリング`、`GLステートの操作`、`uniform変数の初期値の設定`、`外部ファイルのインポート`
などが可能になる。

### sortファイルの文法

以下は簡単なsortファイルの例である。

```glsl
@Pass
@BlendFunc(ONE,ONE)
FS_PREC(mediump,float)

#ifdef VS
  attribute vec3 position;

  uniform mat4 _matPVM;

  void main(){
    gl_Position = _matPVM * vec4(position,1);
  }
#endif

#ifdef FS
  @{type:"color", default:"#381794"}
  uniform vec4 color;

  void main(){
    gl_FragColor = color;
  }
#endif

```

通常のシェーダーについて見慣れている人ならば、上記のコードが以下によって構築されていることがわかるだろう。

* 通常のGLSLのコード
* 通常のGLSLのマクロ
* `@`から始まる文

**さわってみよう1**

まずは上記のコードを読み込んだ以下のコードを読んで、uniform変数としてマテリアルに記述
されている`color`がマテリアルタグから操作できることを見て欲しい。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t11-01" allowfllscreen></iframe>

### sortのuniform変数

sortのuniform変数はその変数名の付け方によって2つに大別される。

* ユーザーUniform変数
* 環境Uniform変数

`_`から**始まらない**変数は**ユーザーUniform変数**であり、`_`から**始まる**変数は**環境Uniform変数**である。

例えば、上記のコードの例で言えば`color`は**ユーザーUniform変数**であり、`_matPVM`は**環境Uniform変数**である。

また、どちらのタイプのuniform変数でも変数の宣言の上部に@から始まるJSONを記述することにより、`初期値`や`設定`などの付加情報を変数に結びつけることができる。この付加情報を**アノテーション**と言う。

例:

```glsl
  @{type:"color", default:"#381794"}
  uniform vec4 color;
```

> アノテーションのJSON
>
> アノテーションのJSONはJSON5ライブラリによってパースされている。そのため、キー部分の`"`は省略できる。

#### 環境Uniform変数

環境Uniform変数は、プラグインなどが、変数名に応じて自動的に値をシェーダーに割り当てる際に利用される。
`fundamental`自身もこの機能を利用して利用する機会が多いであろういくつかの変数を定義している。

> grimoirejs-fundamentalの代表的な環境Uniform変数
>
> |変数型|変数名|内容|
> |:-:|:-:|:-:|
> |float|\_time|Grimoire.js読み込み時からの時間|
> |vec2|\_viewportSize|レンダリング対象のビューポートサイズ(px単位)|
> |mat4|\_matM|モデル行列|
> |mat4|\_matV|ビュー行列|
> |mat4|\_matP|プロジェクション行列|
> |mat4|\_matPV|プロジェクション \* ビュー行列|
> |mat4|\_matVM|ビュー行列 \* モデル行列|
> |mat4|\_matPVM|レンダリング対象のモデルのプロジェクション行列 \* ビュー行列 \* モデル行列|
> |vec3|\_cameraPosition|カメラ座標(ワールド座標系)|
> |vec3|\_cameraDirection|カメラ向き(ワールド座標系)|
>
> 詳細は[sortシェーダー](https://grimoire.gl/guide/sort.html)が参考になる。

#### ユーザーUniform変数

ユーザーUniform変数は、タグを通じてユーザーがインタラクション可能な値をシェーダーに割り当てる際に利用される。
(一般的にユーザーがいじらないであろう調整用の変数やガウス分布の係数の配列などもこちらで作成して、コンポーネントから割り当てる。)

ユーザーUniform変数には初期値を持つことができる。この際には、対象となるuniform変数のアノテーションのdefault要素にデフォルトとなる値を入れる。

タグ側での値の指定は対応した型のコンバーターによって行われる。

例えば、`sampler2D`型のuniform変数にはテクスチャへのファイルパスをタグ側から読み込むことができる。

それぞれの型に対応したコンバーターが何になるか等、詳細の説明は [sortシェーダー](https://grimoire.gl/guide/sort.html)を参考にして欲しい。

> vec3,vec4型のコンバーター
>
> vec3,vec4型はデフォルトではベクトル型のコンバーターが指定される。
> すなわち、`1,2,3`という指定や`n(1,2,3)`などの指定が可能であるが、色のコンバーターではないので`red`や`#330000`などの指定はできない。
>
> ただし、vec3,vec4のアノテーションに`type:"color"`を指定すると、使われるコンバーターは色の指定用のものになる。

### sortのattribute変数

attribute変数はジオメトリー内の同名のバッファとして登録されているものから用いる。
デフォルトで登録されているプリミティブは初期状態で以下のようなバッファを持つ。

|変数型|変数名|内容|
|:-:|:-:|:-:|
|vec3|position|モデル空間の頂点座標|
|vec3|normal|モデル空間の法線(正規化済み)|
|vec3|texCoord|テクスチャ座標|

**さわってみよう2**

以下の例は上記の説明を参考にいくつかの機能を使ったものである。

違う変数を使って見たり、初期値を変えて実際に試してみよう。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t11-02" allowfllscreen></iframe>

### プリファレンス

シェーダーを用いる際はしばしば適切なglステートの設定がなければ動作しないものがある。そのため、sortシェーダーではシェーダー内部でglステートの設定を明示できる。

`@Pass` 以外の`@プリファレンス名(引数...)`の形式をとるものを**プリファレンス**と呼ぶ。

これらはパスの描画時にGLのステートに設定を与えるなどの機能を持つ。以下は、定義済みのプリファレンスである。

#### WebGLのAPIと同一のもの

* BlendFunc
* BlendFuncSeparate
* BlendEquation
* BlendEquationSeparate
* CullFace

これらは、同名のWebGLの関数と同じ引数リストを持ち、同様の指定により処理を指定できる。

例えば、`@CullFace(FRONT)`と記述したマテリアルで描画が行われると前方がカリングされる。

**さわってみよう3**

以下の例はブレンド設定をSORTからいじったものである。違う設定を使って見たりして実験してみよう。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t11-03" allowfllscreen></iframe>
### マルチパスレンダリング

エッジの描画のシェーダーなどでは、1回の描画だけでは目的の画が得られないことがある。その際、複数回の描画(マルチパスレンダリング)をする必要がある。

今までの解説では、一回分の描画(シングルパス)の記述に必要な部分だけを解説したが、SORTでは、複数回の描画を一つのシェーダーで記述することができる。

SORTの`@Pass`ディレクティブはその終わりから、次の`@Pass`までを一つのパスとみなすための文法である。
これらそれぞれの描画(パス)は、上から順に描画される。

**さわってみよう4**
例えば、以下の例では`前面をカリングにして少し拡大`したあと、`背面をカリングにして通常描画`することによってエッジを書いたサンプルである。

<iframe class="editor" src="https://grimoiregl.github.io/grimoire.gl-example#t11-04" allowfllscreen></iframe>
