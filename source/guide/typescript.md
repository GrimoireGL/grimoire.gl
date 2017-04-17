---
type: doc
title: Use Typescript
order: 10
---

Grimoire.js was built with Typescript. Users can use Typescript to get benefit from type checks.

# Use Typescript with Grimoire.js

All grimoire.js package published on npm is including type definition also.
If you want to use Typescript and already have made development environments for Typescript, users can use type check by just downloading Grimoire.js from npm.

## Use internal classes of Grimoire.js

In some cases, you need to access classes defined inside of Grimoire.js.

As our tutorial saying, if you want to access `Vector4` with javascript, you can access `Vector4` class with following code.

```javascript
const Vector4 = gr.lib.math.Vector4;
```

You can access same class with typescript with following code. (You need to use bundler(`webpack`,`browserify` or something any kind of them) to use `import` syntax in browser.)

```typescript
import Vector4 from "grimoirejs-math/ref/Vector4";
```

And, the code above would enable you to use type check. You can see your editor being able to use type definitions. 
