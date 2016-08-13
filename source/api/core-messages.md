---
type: doc
title: コアメッセージ
order: 1
---

## GrimoireJS自身が定義するメッセージ群

### awake

定義

```typescript

function awake():void;

```

あるコンポーネントがインスタンス化された際、自動的に呼び出されます。
コンストラクタとは異なり、これが呼び出される際は以下のプロパティーが挿入されることが保障されます。

* node(親ノード)
* name(自身のコンポーネント名)
* attributes(属性群)
* sharedObject(親ノードがツリーにアタッチされている場合のみ(それ以外はnull))

### treeInitialized

```typescript
  treeInitialized(c: ITreeInitializedInfo): void;
```

```typescript
interface ITreeInitializedInfo {
    ownerScriptTag: HTMLScriptElement; // このGOMLを含んでいるスクリプトタグ
    id: string; // 各ツリーに割り振られたユニークなID
}
```

ツリーが初期化された際に呼び出されます。
初期のGOMLの中に記述されているノードが全て初期化されると呼び出されます。

初期化後に追加されたいかなるコンポーネントには呼び出されることはありません。

