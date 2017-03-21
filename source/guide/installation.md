---
type: doc
title: Installation
order: 0
---

## Compatibility note

Grimoire doesn't support IE11 and below. Please use Microsoft Edge instead.
(Possibly works fine on IE11.)

> Caution of WebGL extension Compatibility
>
> Some of plugin may require some extension of WebGL or some specific texture size at least to work.
> You can see [webglstats.com](https://webglstats.com/) to check compatibility of WebGL extensions.

## Release notes

All release notes for [core library](https://github.com/GrimoireGL/GrimoireJS) and official plugins are available on Github.

* [Release note for core library](https://github.com/GrimoireGL/GrimoireJS/releases)

# Include `<script>` directly

You can simply download and link with `<script>` tag. `gr` will be registered as global variable.

**Download link via unpkg.com**

* [Minified version](https://unpkg.com/grimoirejs-preset-basic/register/grimoire-preset-basic.min.js)

* [Basic version](https://unpkg.com/grimoirejs-preset-basic/register/grimoire-preset-basic.js)

> What is `preset-basic`?
>
> The package named `preset-basic` is starter set of Grimoire.js. This includes some plugins most of developers need to use.
> This contains this packages below.
>
>  * grimoirejs (Core package)
>  * grimoirejs-math (3DGraphics math library)
>  * grimoirejs-fundamental (Minimal renderer components)

## Download another plugins

Grimoire is component oriented framework. Every features represented as tags and components are implemented as plugins.
These plugins register some components and nodes to enable us to use them.

In many case, you need to use another plugins for your work. You can just link them after the `grimoirejs` file.

This is official package lists maintained.

**Downalod link via unpkg.com**

* [grimoirejs-gltf](https://unpkg.com/grimoirejs-gltf/register/grimoire-gltf.js)(Model loader plugin for `.gltf` format)
* [grimoirejs-forward-shading](https://unpkg.com/grimoirejs-forward-shading/register/grimoire-forward-shading.js)(Typical shading plugin)

# CDN

The links introduced above are all CDN. You can just paste the links into your javascript file to use.

**These are linking to the newest version. To prevent breaking your work by our update, make sure the versions are fixed.**

# NPM

**If you are stranger to javascript development, we suggest you to use direct include `<script>` tag instead of using npm.**

All of the packages can be installed with npm.

```bash
$ npm install grimoirejs-preset-basic --save
```

The other packages are also provided via npm in same way.

## `/register`

If you want to bundle all of files including grimoirejs, you need to call `/register` file first.

```js
const gr = require("grimoirejs-preset-basic/register");
```

or

```js
import gr from "grimoirejs-preset-basic/register";
```

This code will register all tags to prepare to use.

> What will occur when import without `register`?
>
> The code called by `register` is including actual grimoirejs code to be bundled.
> The require code without `register` (for example `require('grimoirejs-preset-basic')`) is just referencing GrimoireJS variable which is global reference to Grimoire.js
> This is used for fetching grimoire interface from npm without accessing global variable and linking actual grimoire.js code with `<script>` tag.
