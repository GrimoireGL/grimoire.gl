---
type: doc
title: 属性(Attribute)
order: 2
---

## 属性とは

Grimoire.jsを扱う上で、属性の理解は避けられません。属性はHTMLなどの属性と同じく、以下のようにタグに記述されます。

```xml
<Tag attribute1="Value1"/>
```

以降、このドキュメントではattribute1のような属性の名前のことを属性名、Value1のような属性に割り当てられた値のことを属性値とよびます。
Grimoire.jsでは、この属性の操作によってアプリケーションを構築します。

### ノードの属性値

どのような属性値が指定可能であるかということは、各ノードによって異なります。しかし、以下の属性値はどのようなノードにも指定可能です。

* id ・・・ (文字列) HTMLの各要素に指定するidと同一な意味を持つ属性
* class ・・・(文字列)HTMLの各要素に指定するclassと同一な意味を持つ属性
* enabled・・・(true/false)このノードが有効であるか否か。

いずれにせよ、ほとんどの属性はこのように必ず持っているものではなく、ノードがどのようなコンポーネントを持っているのかによって定まります。
このノードとコンポーネントの関係については、[ノード及びコンポーネントの概要](http://grimoire.gl/guide)を参照してください。

## 属性の種類

### 通常の属性

ほとんどの場合、コンポーネントの作者はユーザーからどのような属性名でどのような型の属性値を受け取るかはコンポーネントの作成時に確定しているはずです。このような状況下では、コンポーネントのattributes静的フィールドを用いて受け取り得る属性名などを記すことができます。

このattributesは以下のような定義を満たすように設定する必要があります。

```typescript
public static attributes:{[attributeName:string]:IAttributeDeclaration};
```

```typescript
public interface IAttributeDeclaration{
   defaultValue:any;
   converter:string|NamespacedIdentity;
   [otherParameterName:string]:any;
}
```

### 動的な属性

一部の場合、コンポーネントが必ずしもユーザーがどのような属性を指定するかわからない場合があります。そのような場合のために、特定のプレフィックスを持つ属性を全て受け取ることが出来るようにできます。

このような場合には、コンポーネントのdynamicAttributes静的フィールドを指定する必要があります。

```typescript
public static dynamicAttributes:{[attributePrefix:string]:IDynamicAttributeDeclaration;}
```

```typescript
public interface IDynamicAttributeDeclaration{
   converter:string|NamespacedIdentity;
   [otherParameterName:string]:any;
}
```

ただし、この性質上デフォルト値は常にundefinedとして扱われます。また、コンポーネント内の通常の属性の取り扱いと比べ、動的な属性の取り扱いは幾分かコンポーネント側で管理する必要があります。

例えば、このような属性を取得するような操作をユーザーが行った場合、以下のメソッドがコンポーネント側で呼び出されます。

```typescript
public on
```
