---
Type: doc
Title: grimoirejs-core
Order: 1
---

It is the API document of ** grimoirejs-core ** which is the main body of Grimoire.js.
For basic usage of grimoirejs - core, please refer to [Guide](todo).

# Global interface
An interface prepared primarily for operations from the web page.
The object to manipulate Grimoire.js is an instance of the `GrimoireInterface` class.
`GrimoireInterface` can be accessed from the **` gr` global variable if it is loaded into a web page with the `<script>` tag **.
If you are using npm you can reference this object as follows.

```javascript
Var gr = require ("grimoirejs");
```
Also on the web page you can get the same reference as `gr` from the` GrimoireJS` global variable.

## GrimoireInterface
It provides configuration of Grimoire.js, addition and management of plugins, access to nodes and components.

### Call as a function
GrimoireInterface can be called as a function. At this time, there are several overloads depending on the arguments.

#### gr ("selector")
- ** Definition **

  ```typescript
  Function gr (selector: string): GOMLInterface;
  ```
- ** Parameter **
  - selector

    A selector specifying the `<script>` tag describing the target goml *
- ** How to use **

  Search for the specified `<script>` tag specified by the selector `type =" text/goml "` and get `GomlInterface` for the corresponding tree.
  For information on `GomlInterface`, see [here](todo).
  For example, if you have two `goml 'loaded on` html` as follows:

  ```html
  <Script id = "gomlId" class = "gomlClass" type = "text/goml" src = "./hoge.goml"> </script>
  <Script class = "gomlClass" type = "text/goml" src = "./fuga.goml"> </script>
  ```
  At this time, you can specify the first `goml` as follows.

  ```javascript
  Var goml = gr ("# gomlId");
  ```
  In addition, you can target multiple 'goml' s at the same time by passing a selector specifying class as below.

  ```javascript
  Var gomls = gr ("script.gomlClass");
  ```
  > * Attention: *
  > There is no guarantee that one GOML is manipulated. Multiple targets specified by the selector can be operated simultaneously. Also note that the target of selector is `script` tag rather than` canvas`.

#### gr (rootNode [])

- ** Definition **

  ```typescript
  Function gr (rootNodes: GomlNode []): GOMLInterface;
  ```
- ** Parameter **
  - rootNodes

    Array of root nodes of the target * goml * tree
- ** How to use **

  Get `GomlInterface` for the tree corresponding to the root node group specified by argument.
  If you already know the root node of the tree you want to target, this is faster than specifying with the selector. Other behaviors are the same as [When specified with selector](todo).

#### gr (function)

  - ** Definition **

    ```typescript
    Function gr (callback :()): void;
    ```
  - ** Parameter **
    - callback

      ```javascript
      Function (scriptTags): void
      ```
      Callback called after all goml on the page is mounted. An array of `<script>` tags are passed as arguments describing all `goml` on the page.
  - ** How to use **

    Normally you can not manipulate the tree before `goml` is mounted. Therefore, operations such as `gr (selector)` will also be done in this callback.
    For example, use this to place an object on the tree from a script as follows

    ```javascript
    Gr (function (scriptTags) {
      Var gomlCount = scriptTags.length;
      Console.log ("this page has" + gomlCount + "gomls.");

      Var target = gr ("# gomlId") ("# targetNode");
      For (let i = 0; i <10; i ++) {
          Target.addChildByName ("mesh", {
            Geometry: "cube",
            Position: i + ", 0, 0"
          });
      }
    });
    ```

### Property

#### nodeDeclarations
You can get the definition of all tags available on `goml`.
- ** Syntax **

  ```typescript
  Gr.nodeDeclarations
  ```
- ** Type **

  NSDictionary <NodeDeclaration>
- ** How to use **

  All nodes registered by the `gr.registerNode` method are managed by this property. It is a node that can be obtained from here, used as a tag on `goml`, and nothing else.
  You can display all available node names as follows:

  ```javascript
  Var nodes = gr.nodeDeclarations;
  Nodes.forEach (function (node) {
    Console.log (node.name.fqn);
  });
  ```

#### componentDeclarations
You can get the definition of all the components available on `goml`.
- ** Syntax **

  ```typescript
  Gr.componentDeclarations
  ```
- ** Type **

  `NSDictionary <ComponentDeclaration>`
- ** How to use **

  All components registered by the `gr.registerComponent` method are managed here. All components used on `goml` can be obtained from here, but nothing else.
  You can display all available component names as follows:

  ```javascript
  Var components = gr.componentDeclarations;
  Components.forEach (function (component) {
    Console.log (component.name.fqn);
  });
  ```

#### converters
Get all the available converters for the attribute.
- ** Syntax **

  ```typescript
  Gr.converters
  ```
- ** Type **

  `NSDictionary <IAttributeConverter>`
- ** How to use **

  All converters registered by `gr.registerConverter` method are managed here. All converters used on `goml` can be obtained from here, but nothing else.
  You can display all available component names as follows:

  ```javascript
  Var components = gr.componentDeclarations;
  Components.forEach (function (component) {
    Console.log (component.name.fqn);
  });
  ```
  The `Attribute.convert` method is useful if you want to call another converter internally when creating the converter.

#### rootNodes
The root nodes of all the trees on the page are managed here.
- ** Syntax **

  `Gr.rootNodes`
- ** Type **

  `{[RootNodeId: string]: GomlNode}`
- ** How to use **

#### lib
You can access meta information such as the version of Grimoire.js and classes that are used internally or added by the plugin.
- ** Syntax **

  `Gr.lib`
- ** Type **

  `{
    [Key: string]: {
      __VERSION__: string;
      __NAME__: string;
      [Key: string]: any;
    }
  } `
- ** How to use **

#### loadTasks
Array of load tasks added by [`gr.register` method](todo). When the [`gr.resolvePlugins`](todo) method is executed, it is called asynchronously from the beginning.
The contents are cleared with the [`gr.clear`](todo) method.
- ** Syntax **

  `Gr.loadTasks`
- ** Type **

  `(() => Promise <void>) []`
- ** How to use **

#### nodeDictionary
We manage all the mounted nodes on the page here. It will be deleted from here if the node is `dispose`.
- ** Type **
  `{[NodeId: string]: GomlNode}`
- ** How to use **

#### componentDictionary
We manage all the mounted components that exist on the page here. When a component is `dispose` it will be deleted from here as well.
- ** Type **

  `{[ComponentId: string]: Component}`
- ** How to use **

#### initializedEventHandler
Callback registered with [`gr (function)`](todo).
- ** Type **

  `((ScriptTags: HTMLScriptElement []) => void) []`
- ** How to use **


#### debug
Debugging options. True by default.
When true, various warnings are output, but the performance slightly decreases. Please make it `false` in production.
- ** Type **

  `Boolean`
- ** How to use **
  ```javascript
  Gr.debug = false;
  ```

### Method

#### ns
- ** Definition **

  ```typescript
   Function ns (namespace: string): (name: string) => NamespacedIdentity;
  ```
- ** Usage: **

  Returns a namespace object (`NSIdentity`) used to identify nodes, components, etc.

  When creating a plug-in, in order to prevent name conflict with an external plug-in, specify nodes and components not by string but use `NSIdentity` as much as possible. `NSIdentity` can create instances directly from` NSIdentity.from`, but this method is provided as an alias for convenience.

  ```javascript
  Var g = gr.ns ("http://grimoire.gl/ns/sample");
  Var id = g ("TEST");//be quivalent to NSIdentity.from ("http://grimoire.gl/ns/sample", "TEST")
  ```

#### initialize
Register the standard nodes and components defined by `grimoirejs - core 'and converters. Normally it will be called automatically when the page is loaded.
- ** Definition **

  `Public initialize (): void`
- ** How to use **

#### register
Register the function to register and initialize the plug-in.
It is executed in order by the [`gr.resolvePlugins`](todo) method.
- ** Definition **

  `Public register (loadTask: () => Promise <void>): void`
- ** How to use **

#### resolvePlugins
Execute functions registered in the [`gr.register`](todo) method in order. It is normally executed automatically when loading the page.
- ** Definition **

  `Public async resolvePlugins (): Promise <void>`
- ** How to use **

#### addRootNode
Add a root node managed by Grimoire.js.
`Goml` loaded in` html` is parsed on page loading and its root node is automatically passed to this method.
Return the `id` of the added node.
- ** Definition **

  `Public addRootNode (tag: HTMLScriptElement, rootNode: GomlNode): string`
- ** How to use **

#### getRootNode
Specify the script tag read as `goml` and get the root node of the corresponding tree.
- ** Definition **

  `Public getRootNode (scriptTag: Element): GomlNode`
- ** How to use **

#### clear
Clear the state of GrimoireInterface and then `initialize` afterwards.
The following is cleared.

+ NodeDeclarations
+ ComponentDeclaration
+ Converters
+ RootNodes
+ LoadTasks
+ NodeDictionary
+ ComponentDictionary

- ** Definition **

  `Public clear (): void`
- ** How to use **


#### registerComponent
Add a component to Grimoire.js and return its `ComponentDeclaration`.
The added component will be available in `goml`.
If there are duplicate names, throw an exception.
A component specifies an object or a constructor.
If the `debug` flag is set, it warns if it does not conform to the naming convention.
`SuperComponent` specifies the source component. Throws an exception if it does not exist.
- ** Definition **

  (New () => Component), superComponent ?: string | NSIdentity | (new () => Component)): ComponentDeclaration`
- ** How to use **

  The name of the component is `CamelCase` is recommended.
  It is easy to pass an object to add components simply.
  ```
  Gr.registerComponent ("ComponentName", {
    Attributes: {
      Hoge: {
        Converter: "Number",
        Default: 777
      },
      Fuga: {
        Converter: "String",
        Default: "Grimoire"
      }
    },

    $ Awake () {
     /* ~~~ */    }
  })
  ```
  You can also specify a constructor.
  ```javascript
  Class ComponentName {
    Static get attributes () {
      Return {
        Hoge: {
          Converter: "Number",
          Default: 777
        },
        Fuga: {
          Converter: "String",
          Default: "Grimoire"
        }
      }
    }
    $ Awake () {
     /* ~~~ */    }
  }
  Gr.registerComponent ("ComponentName", ComponentName);
  ```
  You can specify the component to be inherited by the third argument.
  Again, you can specify it by constructor or by name.
  ```javascript
  Gr.registerComponent ("ComponentName 1", ComponentName 1, "SuperComponent");
  Gr.registerComponent ("ComponentName 2", ComponentName 2, SuperComponent);
  ```

#### registerNode
Add a node to Grimoire.js.
The added node is available in `goml`.
If there are duplicate names, throw an exception.
If the `debug` flag is set, it warns if it does not conform to the naming convention.
Specify the list of components that the node should have with an identifier.
You can specify the initial value of the attribute of the node.
For `superNode`, specify the source node to be inherited. Throws an exception if it does not exist.
With `freezeAttributes`, you can specify the attributes to fix.
Fixed attributes prohibit operations from `goml`,` NodeInterface`,
You can only operate from `GomlNode` or an instance of the component.

- ** Definition **

  `Public registerNode (name: string | NSIdentity,
    RequiredComponents: (string | NSIdentity) [],
    Defaults ?: {[key: string]: any} | NSDictionary <any>,
    SuperNode ?: string | NSIdentity,
    FreezeAttributes ?: string []): void`
- ** How to use **

  Add a node as follows.

  ```javascript
  Gr.registerNode ("node-name", ["ComponentName"], {
    Hoge: 100,
    Fuga: "js"
  })

  Gr.registerNode ("node-name 2", [], {
    Hoge: 200,
    Fuga: "override default value 'js'."
  }, "Node-name");
  ```
  Fixing attributes is useful in the following situations.
  ```javascript
  Gr.registerNode ("cube", [], {
    Geometry: "cube"
  }, "Mesh", ["geometry"]));
  ```

#### registerConverter
Add a converter.

- ** Definition **

  `Public registerConverter (name: string | NSIdentity, converter: ((this: Attribute, val: any) => any)): void`
- ** How to use **

#### overrideDeclaration
Overwrite the declaration of the node.
Throws an exception if the specified node does not exist.
You can add components with `additionalComponents`.
Components can not be deleted.
You can change the initial value of the attribute with `defaults`.

- ** Definition **

  `Public overrideDeclaration (targetDeclaration: string | NSIdentity, additionalComponents: (string | NSIdentity) []): NodeDeclaration`
  `Public overrideDeclaration (targetDeclaration: string | NSIdentity, defaults: {[attrName: string]: any}): NodeDeclaration`
  NSIdentity, additionalComponents: (string | NSIdentity) [], defaults: {[attrName: string]: any}): NodeDeclaration`
- ** How to use **
  You can rewrite the initial value of the camera as follows.

  ```javascript
  Gr.overrideDeclaration ("camera", {
    Position: "10, 3, 10",
    Rotation: "y (45)"
  })
  ```
  You can also make the camera operate with the mouse as follows.
  (`MouseCameraControll` is included in [grimoirejs - fundamental](url).)

  ```javascript
  Gr.overrideDeclaration ("camera", ["MouseCameraControll"])
  ```

#### queryRootNodes
Internal use
- ** Definition **

  `Public queryRootNodes (query: string): GomlNode []`
- ** How to use **

#### extendGrimoireInterface
Add a method to GrimoireInterface.
If you specify an identifier that already exists, you throw an exception.
** Within the specified function, `this` is bound to GrimoireInterface **
- ** Definition **

  `Public extendGrimoireInterface (name: string, func: Function): void`
- ** How to use **

#### extendGomlInterface
Add a method to GomlInterface.
If you specify an identifier that already exists, you throw an exception.
** Within the specified function, `this` is bound to GrimoireInterface **
- ** Definition **

  `Public extendGomlInterface (name: string, func: Function): void`
- ** How to use **

#### extendNodeInterface
Add a method to NodeInterface.
If you specify an identifier that already exists, you throw an exception.
** Within the specified function, `this` is bound to GrimoireInterface **
- ** Definition **

  `Public extendNodeInterface (name: string, func: Function): void`
- ** How to use **


## GomlInterface
An interface for manipulating multiple or single trees.
You can obtain it by passing a query to `GrimoireInterface` and calling it as a function.

### Constructor
Constructor (rootNodes: GomlNode [])
### Call as function
`GomlInterface` can be called as a function to get` NodeInterface`.
As an argument, pass in a query that specifies the target node.
#### gr ("selector") (query: string): NodeInterface;
- ** Definition **

  ```typescript
  Function (selector: string): NodeInterface;
  ```
- ** Parameter **
  - selector

    A selector that specifies the target node
- ** How to use **

  It searches and returns the nodes specified by the selector from all the target trees, respectively.
  For example, suppose two nodes are loaded on `goml` as follows.

  ```xml
  <Mesh id = "nodeId" class = "nodeClass"/>
  <Mesh class = "nodeClass"/>
  ```
  Suppose that this `goml` is embedded in` html` as follows.
  ```html
  <Script id = "main" type = "text/goml" src = "path/to/goml"> </script>
  ```
  At this time, the first `mesh` can be specified as follows.

  ```javascript
  Var node = gr ("# main") ("# nodeId");
  ```
  Also, you can pass multiple selectors specifying class as below to target multiple `mesh` at the same time.

  ```javascript
  Var nodes = gr ("# main") (". MeshClass");
  ```
  > * Attention: *
  > There is not necessarily one Node to be operated. Multiple targets specified by the selector can be operated simultaneously.
### Property
#### rootNodes
The list of root nodes of the tree group targeted by GomlInterface.
- ** Type **

  `GomlNode []`
- ** How to use **

### Method
#### getNodeById
#### queryFunc


## # NodeInterface
### Constructor
Constructor (public nodes: GomlNode [] []))
### Property
#### nodes
#### count
#### nodeDeclarations
You can get the definition of all tags available on `goml`.
- ** Syntax **

  ```typescript
  Gr.nodeDeclarations
  ```
- ** Type **

  NSDictionary <NodeDeclaration>
- ** How to use **
#### isEmpty
### Method
#### get
#### getAttribute
Get the attribute.
- ** Definition **

  `Public queryRootNodes (query: string): GomlNode []`
- ** How to use **

#### setAttribute
Set attributes.
#### on
Add an event listener
- ** Definition **
- ** How to use **
#### off
Delete the event listener
- ** Definition **
- ** How to use **
#### append
Add the result of parsing the specified tag to each target node.
- ** Definition **

  `Public append (tag: string): NodeInterface`
- ** How to use **
#### remove
Delete the target node from the tree.
- ** Definition **
- ** How to use **
#### forEach
Apply the function to each target node.
- ** Definition **
- ** How to use **
#### find
Get the first node that satisfies the predicate
- ** Definition **
- ** How to use **
#### watch
- ** Definition **
- ** How to use **
#### setEnabled
- ** Definition **
- ** How to use **
#### children
- ** Definition **
- ** How to use **
#### addComponent
- ** Definition **
- ** How to use **
#### first
Get the first node.
- ** Definition **
- ** How to use **
#### single
It gets the first node, but throws an exception if the target of this interface is not single.
- ** Definition **
- ** How to use **
#### filter
- ** Definition **
- ** How to use **
#### toArray
Returns an array of objects.
- ** Definition **
- ** How to use **
#### addChildByName
- ** Definition **
- ** How to use **
#### sendMessage
- ** Definition **
- ** How to use **
#### broadcastMessage
- ** Definition **
- ** How to use **



# Base class
In grimoirejs-core, all objects are represented by structures such as `GomlNode`,` Component`, and `Attribute`.
If you are trying to create a plug-in, you better understand the function of those classes.
For information on these design orientations, please refer to [Guide]().

# ## GomlNode
## Component
## Attribute
## Converter
## # NSIdentity
## NSDictionary

# Data type
This is the data format used when registering plugins.
## NodeDeclaration
## ComponentDeclaration
## AttributeDeclaration

# Other
These are the classes used for the internal implementation of grimoirejs - core, and have no opportunity to touch them normally.
However, in order to fully control the behavior of Grimoire.js, we need to know these mechanisms.
## GomlLoader
# ## GomlParser
## Constants

# Standard plugin
It is a standard node, component, converter that is defined by grimoirejs-core.
## node
Description
### Component
### Attributes
### parent

##
Description
### Component name
#### Attributes
Description
##### name
##### converter
##### Default
#### parent
#### Published event






## converter
### String
- ** Output type **

  ```
  String
  ```
- ** Input type **

  * String ..... Outputs as it is.
  * Object ... it is called if toString function exists.

### Number

- ** Output type **

  ```
  Number
  ```
- ** Input **

  * String · · · Processed and output by Number.parseNumber.
  * Number ..................................

### Boolean

- ** Output type **

  ```
  Boolean
  ```
- ** Input **

  * String ... only "true" or "false"
  * Boolean · · · Output as it is.

### Object

- ** Output type **

  ```
  Any
  ```
- ** Input **

  * Object ... It is output as it is.

### Component

- ** Output type **

  ```
  <T> where T extends Component
  ```
- ** Converter Argument **

  * Target ... name of component to be acquired
- ** What can be input **

  * String --- interpreted as a query. Find the corresponding ** node ** ** node ** from the tree to which it belongs, and get the component that matches `target` from there.
  * GomlNode ... fetches the component matching the first `target` from the target nodes.
  * Component ··· passed as it is (exceptions are given when the name is not specified as `target`)

### Enum

- ** Output type **

  ```
  Number
  ```
- ** Converter Argument **

  * Table ... Hash table for enumeration. Key is String, value is number.
- ** Input **

  * String ... Returns its value as the key of the table. I will raise an exception if it does not exist as key.
  * Number ... let it go through

### Array

- ** Output type **

  ```
  Array
  ```
- ** Converter Argument **

  * Type ... ... Converter applied to elements of array. If it does not exist, throw an exception at run time.
- ** Input **

  * String ··· ** Separate by half-width space ** and passed through the converter specified by the converter argument.
  * Array ... ... Returns a new array of elements passed through the converter.

### NumberArray

- ** Output type **

  ```
  Number []
  ```
- ** Input **

  * String · · · **, ** (comma), and pass through `Number.parseFloat`.
  * Array · · · · · · Return directly.
### StringArray

- ** Output type **

  ```
  Array
  ```
- ** Input **

  * String ··· ** Separate by half-width space ** and return it.
  * Array · · · · · · Return directly.




















## AssetLoadingManager component
<! - EDIT HERE (@Component) ->
A component that manages the loading of resources that require asynchronous resolution.
This component displays the load screen at the initial time.
Also, after loading, notify other components of the processing start and start the rendering loop.
<! -/EDIT HERE ->
### Attributes
<! - DO NOT EDIT ->
<! - ATTRS ->
| Attribute name | Converter | Default value | Other |
|: ------: |: ------: |: ------: |: ------: |
| LoadingProgress | number | 0 | none |
| AutoStart | boolean | true | none |

<! -/ATTRS ->
<! -/DO NOT EDIT ->
### loadingProgress attribute

 * `Converter`: number
 * `DefaultValue`: 0

<! - EDIT HERE (loadingProgress) ->
Read only. Returns the current load situation in 100% fraction.
<! -/EDIT HERE ->
### autoStart attribute

 * `Converter`: boolean
 * `DefaultValue`: true

<! - EDIT HERE (autoStart) ->
Whether to automatically start the rendering loop after loading resources.
If this is false, if the user himself calls the begin method for LoopManager, no drawing process will be performed.
<! -/EDIT HERE ->
