---
type: doc
title: Component
order: 30
---


# AttributeManager
属性の管理をするクラスです。
属性値の遅延set、遅延watch,属性のマルチキャストの実装を持ちます。
## コンストラクタ
```typescript
new AttributeManager(tag:string);
```

+ `tag` 識別のための文字列。内部からの警告に付加されます。
## method
### addAttribute
```typescript
public addAttribute(attr:Attribute):Attribute
```
属性を追加し、追加した属性を返します。
追加した属性名が既に存在しているときは警告します。
この属性に対する遅延set,遅延watchがあれば処理します。

### watch
```typescript
public watch(attrName:string|NSIdentity,watcher: (newValue: any, oldValue: any, attr: Attribute) => void, immediate = false):void
```
属性をwatchします。
属性をNSIdentityで指定した場合、該当の属性すべてをwatchします。
属性名で指定した場合、該当する属性が全て同じ名前空間のものであれば、それら全てをwatchします。
異なる名前空間のものがあれば、例外を投げます。

### setAttribute
```typescript
public setAttribute(attrName: string | NSIdentity, value: any): void
```
属性を設定します。
属性をNSIdentityで指定した場合、該当の属性すべてに設定します。
属性名で指定した場合、該当する属性が全て同じ名前空間のものであれば、それら全てに設定します。
異なる名前空間のものがあれば、例外を投げます。

### getAttribute
属性を取得します。
指定した属性名やNSIdentityに該当する属性が複数であれば、例外を投げます。

### remove Attribute
属性を削除します。
属性が存在して削除に成功したらtrue,存在しなければfalseを返します。
