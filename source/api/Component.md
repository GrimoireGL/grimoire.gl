---
type: doc
title: Component
order: 15
---

コンポーネントは、ノードにアタッチされる機能を、それぞれ独立して扱うためのオブジェクトです。
コンポーネントはツリー上のGomlNodeの一つのノードに所属し、ノードからメッセージを受けて動作します。

# name
このコンポーネントの名前です
# attributes
このコンポーネントの属性のリストです。
# node
このコンポーネントが属するノードです
# element
このコンポーネントに対応するdom要素です
# isDefaultComponent
このコンポーネントがデフォルトコンポーネントであるかを判定します。
# enabled
コンポーネントの有効無効を設定、取得します。
# companion
このコンポーネントのノードのcompanionです。GomlNodeを参照してください。
# tree
このコンポーネントのノードのtreeです。GomlNodeを参照してください。
# getValue
属性値を取得します。
# getAttribute
属性を取得します。
# removeEnabledObserver
addEnabledObserverで追加したオブザーバを削除します。
# addEnabledObserver
enabledの変化が通知されるオブザーバを登録します。
# resolveDefaultAttributes
システムで使用されます。**使用しないでください**。
# __addAtribute
**カスタムコンポーネントを実装する場合に内部から利用します。**
このコンポーネントに属性を追加します。
# __removeAttributes
**カスタムコンポーネントを実装する場合に内部から利用します。**
このコンポーネントから属性を削除します。
