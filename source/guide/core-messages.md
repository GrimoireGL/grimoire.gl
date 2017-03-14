---
Type: doc
Title: Core message
Order: 4
---

All messages are handled by methods starting with `$`.
This is to suppress bugs etc. caused by a method or a method not intended to be created as a normal method being activated by a message issued by another component.

# Group of messages defined by GrimoireJS itself

## treeInitialized

```typescript
  Function $ treeInitialized (c: ITreeInitializedInfo): void;
```

```typescript
Interface ITreeInitializedInfo {
    OwnerScriptTag: HTMLScriptElement;//script tag containing this GOML
    Id: string;//Unique ID assigned to each tree
}
```

Called when the tree is initialized.
It is called when all the nodes described in the initial GOML are initialized.

It will not be called for any components added after initialization.

## mount

```typescript
  Function $ mount (): void;
```

Called when the node to which the component belongs is attached to the tree.

## unmount

```typescript
  Function $ unmount (): void;
```

Called when the node to which the component belongs is detached from the tree.


# Algorithm at node initialization

It is assumed that when node N is instantiated newly so that certain node N belongs to parent node P, it is initialized in the following order.
```
1. CN = N, CP = P//initialize component
2. Instantiate CN
3. FOR c <= Required component of all CN
3-1. Instantiate c and set it to N
3-2. FOR a <= Attributes of all c
3-2-1. Instantiate a and set it to c
3-2-2. Record that a is an attribute of CN

4. c <= all CN additional components (components specified by .COMPONENTS without GOML)
4-1. Instantiate c and set it to CN
4-2. FOR a <= Attributes of all c
4-2-1 Instantiate a and set it to c//Since the additional component describes the attribute directly to the node of the component, there is no need to record that a is an attribute of CN

5. CN.parent = CP
6. CP = CN

7. If there are child nodes in the CN, repeat 2-7. (When this process is over, a detached tree with N as the root is generated.)
(At this point, the component has not been called at all except for the constructor, neither attribute nor initial value assignment)

8. IF (P is not null & & P is mounted) || P is null but N is the root of goml (not root or P null is not included (just a detached tree) )
8-1. Assign initial values ​​for all enabled essential components' attributes.
(Assigned by GOML value> initial value of Node> priority of initial value of Attribute)
8-2. Assign the initial value of the attribute of all enabled additional components of N.
(Assigned by priority of initial value of GOML> Attribute)
8-3. All enabled components belonging to FOR c = N
8-3-1. C. $ Awake ();//<- invoked before the first mount. It is invoked only once for every component
8-4. SendMessage ('mount')
```

In principle, ** no component is invoked for any unmounted ** processes **. This also includes attribute assignment. (Except constructors)
(Some attributes can not be fixed unless they belong to tree (selector specification etc.))

However, only in the constructor of the component, the creator of the component can process the state that it is not mounted in the tree.
(Basically, use of constructor is not recommended)


All attributes satisfy the following conditions.
* All attributes are passed to the component once through the converter. (Including defaultValue)
* Do not pass values ​​to disabled components.
* When a disabled component is changed, it is passed to the component at the timing when it becomes enabled after that.
