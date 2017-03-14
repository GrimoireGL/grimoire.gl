---
Type: doc
Title: Try using Grimorie.js
Order: 1
---

## Overview

Grimoire.js is a Web3D library. Grimoire.js allows you to create 3D representations in a way that matches the web development flow. 3D representation is displayed using HTML5 Canvas.

Learning #

* Loading Grimoire.js
* Loading GOML

### To use Grimoire.js

Usage is simple. It can be used by reading the GOML (Grimorie Object Markup Language) which expresses the script of the body of Grimoire.js and 3D in the HTML. In Grimoire.js, you can import and use only necessary functions into the library.

Let's load `grimoire.js` and` index.goml` in `index.html`.

> This grimoire.js is a bundle of Grimoire.js, grimoirejs-fundamental, grimoirejs-math as one. Users can also download this as a preset.

<iframe class = "editor" src = "https://grimoiregl.github.io/grimoire.gl-example#t01-01"> </ iframe>

This is the only preparation needed to use Grimoire.js. Let's start with various web3D expressions using Grimoire.js from now on.

In addition, Grimoire.js is supposed to generate a canvas according to the number of GOMLs read.

In the next chapter you can use the selector to get the Grimorie interface that exists on each canvas. This makes it possible to manipulate tags of GOML only for the target GOML.


> Next we will learn how to use the loaded GOML.
>
> [Handle GOML](/tutorial/02-handle-goml.html)
