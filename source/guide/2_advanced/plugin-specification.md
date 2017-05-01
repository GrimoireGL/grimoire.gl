---
type: doc
title: Plugin making
order: 3
---

# Boiler plate for plugins

You can simply fork or copy the project to make plugins.

## Boiler plate for typescript

https://github.com/GrimoireGL/ts-boilerplate

## Boiler plate for javascript

https://github.com/GrimoireGL/js-boilerplate

# Specification

To make any plugins are able to be worked with the other plugins fine, any plugins should match the specification below.
If you can use template projects, you should use them. But, if you need to use your own development environments, read this specification to follow.

# Terms

This specification refer some words described here.

## Plugin name

Same as NPM package name.

## Short plugin name

To make plugin name can be accessed in easy way, short plugin name is NPM package name transformed following way.

* Remove head of `grimoirejs-`
* Replace `-` with `_`

Assume a plugin `grimoirejs-A-B-C`, the short plugin name of this plugin is `A_B_C`.

# Directory structure

Grimoire.js plugin of NPM package must include these directories.

* ref
* register
* src

# File structures and purposes

## register/index.js

This is the file loaded with `require("<Plugin package name>/register")`.
This file must contains all javascript entire bundled plugin project.

### Exported object

Assume a plugin have these files below.

* src/A.js
* src/B/C.js
* src/B/D.js

The `export` object must be below.

```javascript
{
  A:require("./A.js"),
  B:{
    C:require("./B.js"),
    D:require("./C.js")
  }
}
```

When the code required, plugin must assign the object above into `window.GrimoireJS.lib.{Plugin package name}`.

**Note**

* Bundled `index.js` must not contain any other plugins code that the plugin depend to.
(Do not call `require("<Plugin name of dependency>/register")`in your library code. But,`require("<Plugin name of dependency>/ref/PATH/TO/MODULE")` is ok to include since that is just referencing the other object.)
* Directory named `A` and a js file named `A.js` cannot exist in same time because of this specification.

## `ref` directory

The files to fetch reference of exported object inside of plugin should be included in this directory.

For instance,`ref/B/C.js` should be generated with following code for `src/B/C.js`.

```javascript
window.GrimoireJS.lib.<short plugin name of dependency>.B.C;
```

Furthermore, plugins need to generate `ref/B/C.d.ts` with following way for the users want to use them with `Typescript`.

**When src/B/C.ts exists(When plugin use typescript for development)**

Copy the `d.ts` file generated from `src/B/C.d.ts` to `ref/B/C.d.ts`.

**When src/B/C.ts doesn't exists(When plugins pure javascript for development)**

Generate `d.ts` file like following code.

```typescript
var v:any;
export default v;
```

## ref/index.js

The following code must be exported.

```javascript
window.GrimoireJS.lib.{short-plugin-name};
```

# Helper commands in grimoirejs-cauldron

`grimoirejs-cauldron` would generate codes following the specification above.

## generate-exposure command

```bash
$  cauldron generate-exposure --src ./src --dest ./src/index.ts --ts --main ./src/main.ts
```

|parameter|description|
|:-:|:-:|
|src|Directory of source folder|
|dest|`.ts` or `.js` file path exporting all objects to expose.|
|ts|Use typescript or not|
|main|Entry point of plugin|

## generate-reference command

```bash
$  cauldron generate-reference --src ./src --dest ./src/index.ts --ts --main ./src/main.ts --dts ./ref
```

|parameter|description|
|:-:|:-:|
|src|Directory of source folder|
|dest|`.ts` or `.js` file path exporting all objects to expose.|
|ts|Use typescript or not|
|main|Entry point of plugin|
|dts|Directory of `d.ts` files|
