---
type: doc
title: grimoirejs-math
order: 5
---

# AABB

Width of this AABB

```
public get Width()
```

Height of this AABB

```
  public get Height()
```

Distance of this AABB

```
  public get Distance()
```

Calculate new bounding box with considering the new point is included. @param {Vector3} newPoint the point that will be considered that it should be in this bounding box.

```
  public expandAABB(newPoint: Vector3): void
```

Clean up this AABB with initial value.

```
public clear(): void
```

```
  public toMathematicaCuboid(): string
```

# Color3

```
  public static fromColor4(col: Color4): Color3
```

```
  public static parse(color: string, tryParse?: boolean): Color3
```

```
  public static internalParse(color: string, isFirst: boolean, tryParse?: boolean): Color3
```

```
  public static equals(col1: Color3, col2: Color3): boolean
```

```
  public toVector(): Vector3
```

```
  public toVector4(a?: number): Vector4
```

```
  public get R(): number
```

```
  public get G(): number
```

```
  public get B(): number
```

```
  public get ElementCount(): number
```

```
  public equalWith(col: Color3): boolean
```

```
  public toString(): string
```

```
  public toDisplayString(): string
```

# Color4

```
  public static internalParse(color: string, isFirst: boolean, tryParse?: boolean): Color4
```

```
  public static parse(color: string, tryParse?: boolean): Color4
```

```
  public static equals(col1: Color4, col2: Color4): boolean
```

```
  public get R(): number
```

```
  public get G(): number
```

```
  public get B(): number
```

```
  public get A(): number
```

```
  public toVector(): Vector4
```

```
  public get ElementCount(): number
```

```
  public equalWith(col: Color4): boolean
```

```
  public toString(): string
```

```
  public toDisplayString(): string
```

# Colors

```
{
  "aliceblue": "#F0F8FF",
  "antiquewhite": "#FAEBD7",
  "aqua": "#00FFFF",
  "aquamarine": "#7FFFD4",
  "azure": "#F0FFFF",
  "beige": "#F5F5DC",
  "bisque": "#FFE4C4",
  "black": "#000000",
  "blanchedalmond": "#FFEBCD",
  "blue": "#0000FF",
  "blueviolet": "#8A2BE2",
  "brown": "#A52A2A",
  "burlywood": "#DEB887",
  "cadetblue": "#5F9EA0",
  "chartreuse": "#7FFF00",
  "chocolate": "#D2691E",
  "coral": "#FF7F50",
  "cornflowerblue": "#6495ED",
  "cornsilk": "#FFF8DC",
  "crimson": "#DC143C",
  "cyan": "#00FFFF",
  "darkblue": "#00008B",
  "darkcyan": "#008B8B",
  "darkgoldenrod": "#B8860B",
  "darkgray": "#A9A9A9",
  "darkgreen": "#006400",
  "darkgrey": "#A9A9A9",
  "darkkhaki": "#BDB76B",
  "darkmagenta": "#8B008B",
  "darkolivegreen": "#556B2F",
  "darkorange": "#FF8C00",
  "darkorchid": "#9932CC",
  "darkred": "#8B0000",
  "darksalmon": "#E9967A",
  "darkseagreen": "#8FBC8F",
  "darkslateblue": "#483D8B",
  "darkslategray": "#2F4F4F",
  "darkslategrey": "#2F4F4F",
  "darkturquoise": "#00CED1",
  "darkviolet": "#9400D3",
  "deeppink": "#FF1493",
  "deepskyblue": "#00BFFF",
  "dimgray": "#696969",
  "dimgrey": "#696969",
  "dodgerblue": "#1E90FF",
  "firebrick": "#B22222",
  "floralwhite": "#FFFAF0",
  "forestgreen": "#228B22",
  "fuchsia": "#FF00FF",
  "gainsboro": "#DCDCDC",
  "ghostwhite": "#F8F8FF",
  "gold": "#FFD700",
  "goldenrod": "#DAA520",
  "gray": "#808080",
  "green": "#008000",
  "greenyellow": "#ADFF2F",
  "grey": "#808080",
  "honeydew": "#F0FFF0",
  "hotpink": "#FF69B4",
  "indianred": "#CD5C5C",
  "indigo": "#4B0082",
  "ivory": "#FFFFF0",
  "khaki": "#F0E68C",
  "lavender": "#E6E6FA",
  "lavenderblush": "#FFF0F5",
  "lawngreen": "#7CFC00",
  "lemonchiffon": "#FFFACD",
  "lightblue": "#ADD8E6",
  "lightcoral": "#F08080",
  "lightcyan": "#E0FFFF",
  "lightgoldenrodyellow": "#FAFAD2",
  "lightgray": "#D3D3D3",
  "lightgreen": "#90EE90",
  "lightgrey": "#D3D3D3",
  "lightpink": "#FFB6C1",
  "lightsalmon": "#FFA07A",
  "lightseagreen": "#20B2AA",
  "lightskyblue": "#87CEFA",
  "lightslategray": "#778899",
  "lightslategrey": "#778899",
  "lightsteelblue": "#B0C4DE",
  "lightyellow": "#FFFFE0",
  "lime": "#00FF00",
  "limegreen": "#32CD32",
  "linen": "#FAF0E6",
  "magenta": "#FF00FF",
  "maroon": "#800000",
  "mediumaquamarine": "#66CDAA",
  "mediumblue": "#0000CD",
  "mediumorchid": "#BA55D3",
  "mediumpurple": "#9370DB",
  "mediumseagreen": "#3CB371",
  "mediumslateblue": "#7B68EE",
  "mediumspringgreen": "#00FA9A",
  "mediumturquoise": "#48D1CC",
  "mediumvioletred": "#C71585",
  "midnightblue": "#191970",
  "mintcream": "#F5FFFA",
  "mistyrose": "#FFE4E1",
  "moccasin": "#FFE4B5",
  "navajowhite": "#FFDEAD",
  "navy": "#000080",
  "oldlace": "#FDF5E6",
  "olive": "#808000",
  "olivedrab": "#6B8E23",
  "orange": "#FFA500",
  "orangered": "#FF4500",
  "orchid": "#DA70D6",
  "palegoldenrod": "#EEE8AA",
  "palegreen": "#98FB98",
  "paleturquoise": "#AFEEEE",
  "palevioletred": "#DB7093",
  "papayawhip": "#FFEFD5",
  "peachpuff": "#FFDAB9",
  "peru": "#CD853F",
  "pink": "#FFC0CB",
  "plum": "#DDA0DD",
  "powderblue": "#B0E0E6",
  "purple": "#800080",
  "red": "#FF0000",
  "rosybrown": "#BC8F8F",
  "royalblue": "#4169E1",
  "saddlebrown": "#8B4513",
  "salmon": "#FA8072",
  "sandybrown": "#F4A460",
  "seagreen": "#2E8B57",
  "seashell": "#FFF5EE",
  "sienna": "#A0522D",
  "silver": "#C0C0C0",
  "skyblue": "#87CEEB",
  "slateblue": "#6A5ACD",
  "slategray": "#708090",
  "slategrey": "#708090",
  "snow": "#FFFAFA",
  "springgreen": "#00FF7F",
  "steelblue": "#4682B4",
  "tan": "#D2B48C",
  "teal": "#008080",
  "thistle": "#D8BFD8",
  "tomato": "#FF6347",
  "turquoise": "#40E0D0",
  "violet": "#EE82EE",
  "wheat": "#F5DEB3",
  "white": "#FFFFFF",
  "whitesmoke": "#F5F5F5",
  "yellow": "#FFFF00",
  "yellowgreen": "#9ACD32"
}
```

# MatrixBase

```
  public rawElements: GLM.IArray;
```

```
  public get RowCount(): number
```

```
  public get ColmunCount(): number
```

```
  public getAt(row: number, colmun: number): number
```

```
  public getBySingleIndex(index: number): number
```

# Matrix

```
  public static zero(): Matrix
```

```

  public static identity(): Matrix
```

```
  public static fromElements(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33): Matrix
```

```
  public static fromFunc(f: (w: number, h: number) => number): Matrix
```

```
  public static equals(m1: Matrix, m2: Matrix): boolean
```

```
  public static add(m1: Matrix, m2: Matrix): Matrix
```

```
  public static subtract(m1: Matrix, m2: Matrix): Matrix
```

```
  public static scalarMultiply(s: number, m: Matrix): Matrix
```

```
  public static multiply(m1: Matrix, m2: Matrix): Matrix
```

```
  public static trs(t: Vector3, rot: Quaternion, s: Vector3): Matrix
```

```
  public static negate(m: Matrix): Matrix
```

```
  public static transpose(m: Matrix): Matrix
```

```
  public static transformPoint(m: Matrix, t: Vector3): Vector3
```

```
  public static transformNormal(m: Matrix, t: Vector3): Vector3
```

```
  public static transform(m: Matrix, t: Vector4): Vector4
```

```
  public static determinant(m: Matrix): number
```

```
  public static inverse(m: Matrix): Matrix
```

```
  public static translate(v: Vector3): Matrix
```

```
  public static scale(v: Vector3): Matrix
```

```
  public static rotateX(angle: number): Matrix
```

```
  public static rotateY(angle: number): Matrix
```

```
  public static rotateZ(angle: number): Matrix
```

```
  public static rotationQuaternion(quat_: Quaternion): Matrix
```

```
  public static frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix
```

```
  public static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix
```

```
  public static perspective(fovy: number, aspect: number, near: number, far: number): Matrix
```

```
  public static lookAt(eye: Vector3, lookAt: Vector3, up: Vector3): Matrix
```

```
  public getAt(row: number, colmun: number): number
```

```
  public setAt(row: number, colmun: number, val: number): void
```

```
  public getBySingleIndex(index: number): number
```

```
  public getColmun(col: number): Vector4
```

```
  public getRow(row: number): Vector4
```

```
  public multiplyWith(m: Matrix): Matrix
```

```
  public equalWith(m: Matrix): boolean
```

```
  public toString(): string
```

```
  public toMathematicaString(): string
```

```
  public get ElementCount(): number
```

```
  public get RowCount(): number
```

```
  public get ColmunCount(): number
```

# MatrixArray

```
  public static getIdentityMatrixArray(length: number): MatrixArray
```

```
  public getAt(index: number): Matrix
```

```
  public setAt(index: number, matrix: Matrix): void
```

# PointList

```
  public static initializeWithCube(list: PointList): PointList
```

```
  public addPoint(point: Vector3): void
```

```
  public transform(transformMatrix: Matrix): void
```

```
  public clear(): void
```

```
  public getBoundingBox(): AABB
```

```
  public toMathematicaPoints(): string
```

# Quaternion

```
  public rawElements: GLM.IArray;
```

```
public static equals(q1: Quaternion, q2: Quaternion): boolean
```

```
public static add(q1: Quaternion, q2: Quaternion): Quaternion
```

```
public static multiply(q1: Quaternion, q2: Quaternion): Quaternion
```

```
public static angleAxis(angle: number, axis: Vector3): Quaternion
```

```
  public static euler(x: number, y: number, z: number): Quaternion
```

```
public static eulerXYZ(x: number, y: number, z: number): Quaternion
```

```
public static slerp(q1: Quaternion, q2: Quaternion, t: number): Quaternion
```

```
  public static fromToRotation(from: Vector3, to: Vector3): Quaternion
```

```
  public static lookRotation(forward: Vector3, upVec?: Vector3): Quaternion
```

```
public static get Identity(): Quaternion
```

```
  public get eularAngles()
```

```
  public set eularAngles(v: Vector3)
```

```
public get X(): number
```

```
public get Y(): number
```

```
public get Z(): number
```

```
public get W(): number
```

```
public get ImaginaryPart(): Vector3
```

```
public get Conjugate(): Quaternion
```

```
public get Length(): number
```

```
  public equalWith(q: Quaternion): boolean
```

```
public normalize(): Quaternion
```

```
public inverse(): Quaternion
```

```
public toAngleAxisString(): string
```

```
public toString(): string
```

```
public factoringQuaternionZXY(): { x: number, y: number, z: number }
```

```
public factoringQuaternionXYZ(): { x: number, y: number, z: number }
```

# Rectangle

```
  public static equals(r1: Rectangle, r2: Rectangle): boolean
```

```
  public static edgeSizeEquals(r1: Rectangle, r2: Rectangle): boolean
```

```
  public get Left(): number
```

```
  public get Right(): number
```

```
  public get Top(): number
```

```
  public get Bottom(): number
```

```
  public get Width(): number
```

```
  public get Height(): number
```

```
  public contains(point: Vector2): boolean
```

```
  public contains(x: number, y: number): boolean
```

```
  public contains(xOrPoint: number | Vector2, y?: number): boolean
```

```
  public toLocal(x: Vector2): Vector2
```

```
  public toLocal(x: number, y: number): number[]
```

```
  public toLocal(xOrPoint: Vector2 | number, y?: number): any
```

```
  public toString(): string
```

# VectorBase

```
public rawElements: GLM.IArray;
```

```
public get magnitude()
```

```
public get ElementCount(): number
```

```
public get sqrMagnitude(): number
```

# Vector2

```
public static get XUnit(): Vector2
```

```
public static get YUnit(): Vector2
```

```
public static get One(): Vector2
```

```
public static get Zero(): Vector2
```

```
public static copy(vec: Vector2): Vector2
```

```
public static parse(str: string): Vector2
```

```
public static dot(v1: Vector2, v2: Vector2): number
```

```
public static add(v1: Vector2, v2: Vector2): Vector2
```

```
public static subtract(v1: Vector2, v2: Vector2): Vector2
```

```
public static multiply(s: number, v: Vector2): Vector2
```

```
public static negate(v1: Vector2): Vector2
```

```
public static equals(v1: Vector2, v2: Vector2): boolean
```

```
public static nearlyEquals(v1: Vector2, v2: Vector2): boolean
```

```
public static normalize(v1: Vector2): Vector2
```

```
public static min(v1: Vector2, v2: Vector2): Vector2
```

```
public static max(v1: Vector2, v2: Vector2): Vector2
```

```
public static angle(v1: Vector2, v2: Vector2): number
```

```
public get normalized()
```

```
public get X(): number
```

```
public get Y(): number
```

```
public set X(x: number)
```

```
public set Y(y: number)
```

```
public dotWith(v: Vector2): number
```

```
public addWith(v: Vector2): Vector2
```

```
public subtractWith(v: Vector2): Vector2
```

```
public multiplyWith(s: number): Vector2
```

```
public negateThis(): Vector2
```

```
public equalWith(v: Vector2): boolean
```

```
public nearlyEqualWith(v: Vector2): boolean
```

```
public normalizeThis(): Vector2
```

```
public toString(): string
```

```
public toDisplayString(): string
```

```
public get ElementCount(): number
```

```
public toMathematicaString(): string
```

# Vector3

```
public static get XUnit(): Vector3
```

```
public static get YUnit(): Vector3
```

```
public static get ZUnit(): Vector3
```

```
public static get Zero(): Vector3
```

```
public static get One(): Vector3
```

```
public static copy(source: Vector3): Vector3
```

```
public static dot(v1: Vector3, v2: Vector3): number
```

```
public static add(v1: Vector3, v2: Vector3): Vector3
```

```
public static subtract(v1: Vector3, v2: Vector3): Vector3
```

```
public static multiply(s: number, v: Vector3): Vector3
```

```
public static negate(v1: Vector3): Vector3
```

```
public static equals(v1: Vector3, v2: Vector3): boolean
```

```
public static nearlyEquals(v1: Vector3, v2: Vector3): boolean
```

```
public static normalize(v1: Vector3): Vector3
```

```
public static cross(v1: Vector3, v2: Vector3): Vector3
```

```
public static min(v1: Vector3, v2: Vector3): Vector3
```

```
public static max(v1: Vector3, v2: Vector3): Vector3
```

```
public static angle(v1: Vector3, v2: Vector3): number
```

```
public static parse(str: string): Vector3
```

```
public toMathematicaString(): string
```

```
public get normalized()
```

```
public get X(): number
```

```
public get Y(): number
```

```
public get Z(): number
```

```
public set X(x: number)
```

```
public set Y(y: number)
```

```
public set Z(z: number)
```

```
public normalizeThis(): Vector3
```

```
public dotWith(v: Vector3): number
```

```
public addWith(v: Vector3): Vector3
```

```
public subtractWith(v: Vector3): Vector3
```

```
public multiplyWith(s: number): Vector3
```

```
public negateThis(): Vector3
```

```
public equalWith(v: Vector3): boolean
```

```
public nearlyEqualWith(v: Vector3): boolean
```

```
public crossWith(v: Vector3): Vector3
```

```
public toString(): string
```

```
public toDisplayString(): string
```

```
public get ElementCount(): number
```

# Vector4

```
public static get XUnit(): Vector4
```

```
public static get YUnit(): Vector4
```

```
public static get ZUnit(): Vector4
```

```
public static get WUnit(): Vector4
```

```
public static get One(): Vector4
```

```
public static get Zero(): Vector4
```

```
public static copy(vec: Vector4): Vector4
```

```
public static dot(v1: Vector4, v2: Vector4): number
```

```
public static add(v1: Vector4, v2: Vector4): Vector4
```

```
public static subtract(v1: Vector4, v2: Vector4): Vector4
```

```
public static multiply(s: number, v: Vector4): Vector4
```

```
public static negate(v1: Vector4): Vector4
```

```
public static equals(v1: Vector4, v2: Vector4): boolean
```

```
public static nearlyEquals(v1: Vector4, v2: Vector4): boolean
```

```
public static normalize(v1: Vector4): Vector4
```

```
public static min(v1: Vector4, v2: Vector4): Vector4
```

```
public static max(v1: Vector4, v2: Vector4): Vector4
```

```
public static angle(v1: Vector4, v2: Vector4): number
```

```
public static parse(str: string): Vector4
```

```
public get normalized()
```

```
public get X()
```

```
public get Y()
```

```
public get Z()
```

```
public get W()
```

```
public set X(x: number)
```

```
public set Y(y: number)
```

```
public set Z(z: number)
```

```
public set W(w: number)
```

```
public normalizeThis(): Vector4
```

```
public dotWith(v: Vector4): number
```

```
public addWith(v: Vector4): Vector4
```

```
public subtractWith(v: Vector4): Vector4
```

```
public multiplyWith(s: number): Vector4
```

```
public negateThis(): Vector4
```

```
public equalWith(v: Vector4): boolean
```

```
public nearlyEqualWith(v: Vector4): boolean
```

```
public get ElementCount(): number public toString(): string
```

```
public toDisplayString(): string
```

```
public toMathematicaString(): string
```

# VectorArray

```
public rawElements: number[]; public static zeroVectorArray(dimension: number, length: number): VectorArray
```

```
public static fromArray(dimension: number, source: number[]): VectorArray
```

```
public static equals(v1: VectorArray, v2: VectorArray): boolean
```

```
public equalWith(v1: VectorArray): boolean
```

```
public appendVector(vector: VectorBase): void
```

```
public setVector(index: number, vector: VectorBase): void
```

```
public setRawArray(index: number, rawArray: number[]): void
```

```
public getVector<t extends="" vectorbase="">(index: number): T</t>
```

```
public setVectorArray(vectors: VectorBase[], offset = 0): void
```

```
public getVectorArray<t extends="" vectorbase="">(): T[]</t>
```

```
public get dimension(): number
```
