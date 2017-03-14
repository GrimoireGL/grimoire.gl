---
Type: doc
Title: Download
Order: 0
---

# Standalone

In order to read it with the script tag and use it immediately, it is convenient to use the standalone version. `GrimoireJS` and` gr` are registered as global variables. (`Gr` can also not be used with` noConflict`.)

<Div class = "primary-buttons"> <a download href="https://github.com/GrimoireGL/grimoirejs-basic/raw/master/release/grimoirejs-preset-basic.zip"> Download </a> </Div>

> Note:
>
> The link above will download `grimoirejs-preset-basic`, which includes` grimoirejs`, `grimoirejs-fundamental` and` grimoirejs-math`.
> `Grimoirejs-fundamental` will be available for rendering for the first time. Also `grimoirejs-fundamental` depends on` grimoirejs-math`, so these are included.

## CDN

The packages provided on unpkg are always up to date. [Here](https://unpkg.com/grimoirejs-preset-basic/register/grimoire-preset-basic.min.js), you can easily incorporate it.

> Note:
>
> The link above will download `grimoirejs-preset-basic`, which includes` grimoirejs`, `grimoirejs-fundamental` and` grimoirejs-math`.

# Npm

There is also a way to use npm for cases where your own application environment already uses NPM, or when you want to develop babel etc. efficiently.

```bash
$ Npm install grimoirejs --save
$ Npm install grimoirejs-math --save
$ Npm install grimoirejs-fundamental - save
```

In this state, if you describe it as follows, you can acquire gr interface in the same way.

```javascript
Import gr from "grimoirejs";
```

Alternatively, you can also retrieve it using `require` as follows.

```javascript
Const gr = require ("grimoirejs");
```

> Note:
>
> However, please note that in this state Grimoire.js is not included in the contents and it needs to be read with the script tag in bundling etc. It is a notation only when you only get a reference.

If you do not load with script tag etc., you can actually run Grimoire.js by doing as follows.

```javascript
Import gr from "grimoirejs/register";
```

Since this reference destination contains the code of actual grimoirejs, if you do bundling etc. as it is, you can use it while capturing the grimoirejs code.

> Note:
>
> If you use `grimoirejs-fundamental`,` grimoirejs-math`, you can import it and use it by doing bundling as well.
