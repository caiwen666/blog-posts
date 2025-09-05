@meta

```json
{
	"createTime": "2025-01-29 15:27",
	"id": "effective-ts",
	"summary": "Effective Typescript 的读书笔记，按照个人感觉合适的顺序重新组织知识结构",
	"background": "http://pic.caiwen.work/i/2025/01/29/6799c5ad0e6d1.png",
	"key": ["effective typescript", "js", "ts", "node.js", "前端"]
}
```

在最开始接触typescript的时候，很多地方感觉非常麻烦，或者不知道如何处理，直接any了事。后来在豆瓣上发现了 _Effective Typescript_ 这本书，看评价说还不错，于是就搞了本看了看，大概不到一周就看完了，感觉收获很多，非常值得推荐。这里记录一下读书笔记。

本书由 62 个 item 组成，每个 item 的最后有一个 Things to remember，可以视为一个总结。

## ts 和 js 的关系

- ts 是 js 的超集

## 配置 ts

- 从 tsconfig.json 中配置 ts 而不是在命令行中

- 尽可能把所有严格的检查打开，尤其是 noImplicitAny 和 strickNullChecks

- 开启 noEmitOnError 来阻止没通过类型检查的代码产生编译结果

- 开启 sourceMap 来使得在浏览器中 debug 时可以看到原始的 ts 代码

```ts
// tsconfig.json
{
 "compilerOptions": {
 "sourceMap": true
 }
}
```

## 类型

### 代码的生成和类型是独立的

基本的思想是，ts 中的类型仅仅是影响你在编写代码的时候，而对于代码的执行是不会有影响的，在编译后，所有与类型相关的东西都会被移除。这会有如下的影响：

- 没有通过类型检查的ts代码也会产生编译后的js代码。可以在 tsconfig.json 中开启 noEmitOnError 来阻止没通过类型检查的代码产生编译结果
- 由于在编译后，所有与类型相关的东西都会被移除，这会导致比如你定义了个 interface，然后你不能使用 instanceof 来判断一个变量的类型是不是这个 interface，因为 interface 在代码编译后会被清除
- 你在 ts 中的类型操作并不会影响到变量的值。比如有一个 string 类型的变量 `a` ，然后你进行了这么一个操作 `const b = a as number`。虽然后面 ts 仍然会推断 `b` 为一个 number ，但实际在运行过程中， `b` 仍然是一个 string。
- 在运行的时候的类型不一定和代码中声明的类型相同
- ts 的类型相当于一种零成本抽象，不会使代码有任何的性能影响。

### type space 和 value space

ts 中的标识符存在于两个地方： type space 和 value space

type space 中的东西会在运行时消失

interface 就是处于 type space 中，这就导致你不能使用 instanceof 来判断一个变量是否为某个 interface 类型

字面量既可以是 type space 也可以是 value space，如：

```ts
type T1 = "string literal";
type T2 = 123;
const v1 = "string literal";
const v2 = 123;
```

class 处于这两个 space 中，既可以用作类型也可以作为一个值（这就是为什么可以使用 instanceof）

typeof 的运算符在不同的 space 中有不同的作用：

```ts
type T1 = typeof p; // Type is Person
type T2 = typeof email;
// Type is (p: Person, subject: string, body: string) => Response
const v1 = typeof p; // Value is "object"
const v2 = typeof email; // Value is "function"
```

如果我们有一个名为 `Cylinder` 的 class，则有：

```ts
const v = typeof Cylinder; // Value is "function"
type T = typeof Cylinder; // Type is typeof Cylinder
type C = InstanceType<typeof Cylinder>; // Type is Cylinder
```

### 运行时类型判断

如果你确实想在运行时判断类型，你可以有如下两个方式：

- 判断某个特定的属性是否存在

![](http://pic.caiwen.work/i/2025/01/28/679882395f50b.png)

- 在 interface 上搞一个用于标记类型的属性

![](http://pic.caiwen.work/i/2025/01/28/679882ec4113c.png)

![](http://pic.caiwen.work/i/2025/01/28/6798831e2021a.png)

- 使用 class ，然后你就可以使用 instanceof 了

### 函数重载

在 ts 中你不能像 java 那样搞函数重载，比如：

![](http://pic.caiwen.work/i/2025/01/28/679887303634b.png)

一个函数只能有一个具体的实现

你需要以这样的形式实现函数重载：

![](http://pic.caiwen.work/i/2025/01/28/6798877c48466.png)

但还是有一些不足，如：

```ts
function double(x: number): number;
function double(x: string): string;
function double(x: any) {
	return x + x;
}
const num = double(12); // Type is number
const str = double("x"); // Type is string
```

如果再搞一个函数包装一下，可能出现问题：

```ts
function f(x: number | string) {
	return double(x);
	// ~ Argument of type 'string | number' is not assignable
	// to parameter of type 'string'
}
```

#### conditional type

更好的解决方案是使用 conditional type

```ts
function double<T extends number | string>(
	x: T,
): T extends string ? string : number;
function double(x: any) {
	return x + x;
}
// function f(x: string | number): string | number
function f(x: number | string) {
	return double(x);
}
```

### 集合角度

你可以把 ts 中的类型看成集合。如果所有是 A 类型 是 B 类型 的子集，那么是 A 类型的值也是 B 类型。你可以将其与鸭子类型结合起来看

### 鸭子类型

```ts
interface Vector2D {
	x: number;
	y: number;
}
function calculateLength(v: Vector2D) {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}
const v: NamedVector = { x: 3, y: 4, name: "Zee" };
calculateLength(v); // OK, result is 5
```

可以看到，只要满足了目标类型的特征，那么就可以视为目标类型。

class 也不例外

```ts
class C {
	foo: string;
	constructor(foo: string) {
		this.foo = foo;
	}
}
const c = new C("instance of C");
const d: C = { foo: "object literal" }; // OK!
```

你可以利用这一点进行单元测试，比如：

```ts
interface Author {
	first: string;
	last: string;
}
function getAuthors(database: PostgresDB): Author[] {
	const authorRows = database.runQuery(`SELECT FIRST, LAST FROM AUTHORS`);
	return authorRows.map((row) => ({ first: row[0], last: row[1] }));
}
```

你可以把 database 的类型搞得更精确一些：

```ts
interface DB {
	runQuery: (sql: string) => any[];
}
function getAuthors(database: DB): Author[] {
	const authorRows = database.runQuery(`SELECT FIRST, LAST FROM AUTHORS`);
	return authorRows.map((row) => ({ first: row[0], last: row[1] }));
}
```

代码仍然和上面一样可以正常工作， 但是这回你可以自己编写一个简单的 DB 类型的一个东西，来模拟数据库，从而测试这个函数。

### 规避鸭子类型

类似运行时类型判断，你可以搞一个标记属性

```ts
interface Vector2D {
	_brand: "2d";
	x: number;
	y: number;
}
function vec2D(x: number, y: number): Vector2D {
	return { x, y, _brand: "2d" };
}
function calculateNorm(p: Vector2D) {
	return Math.sqrt(p.x * p.x + p.y * p.y); // Same as before
}
calculateNorm(vec2D(3, 4)); // OK, returns 5
const vec3D = { x: 3, y: 4, z: 1 };
calculateNorm(vec3D);
// ~~~~~ Property '_brand' is missing in type...
```

对于一些基本的数据类型，比如 string ， number，这么附带一个标记属性就不太好搞了，当然你可以在创建一个 interface，但是这样就比较臃肿了，你还可以这样：

```ts
type AbsolutePath = string & { _brand: "abs" };
function listAbsolutePath(path: AbsolutePath) {
	// ...
}
```

然后可以结合 type guard

```ts
function isAbsolutePath(path: string): path is AbsolutePath {
	return path.startsWith("/");
}
```

或者像下面这样再搞一个函数去生成这样的类型：

```ts
type Meters = number & { _brand: "meters" };
type Seconds = number & { _brand: "seconds" };
const meters = (m: number) => m as Meters;
const seconds = (s: number) => s as Seconds;
const oneKm = meters(1000); // Type is Meters
const oneMin = seconds(60); // Type is Seconds
```

不过比较尴尬的一点是，因为我们说类型的操作并不影响变量本身，因此上面这个例子中的 meters 和 seconds 仍然可以进行数值运算，但是运算后就又变成数字了

```ts
const tenKm = oneKm * 10; // Type is number
const v = oneKm / oneMin; // Type is number
```

### interface 和 type 的区别

两者都可以继承，interface 可以使用 extends ，type 可以使用 & 运算符，但是 interface 不可以继承一个复杂的类型，如 union 类型

同时，只有 type 有 union ，interface 没有

#### augmented

interface 可以 augmented ，比如：

```ts
interface IState {
	name: string;
	capital: string;
}
interface IState {
	population: number;
}
const wyoming: IState = {
	name: "Wyoming",
	capital: "Cheyenne",
	population: 500_000,
}; // OK
```

类似一种类型合并。但是 type 没有

不过很多情况下，这种重复定义可能是代码写错了。因此建议使用 type 来定义类型

### readonly

你可以使用 readonly 来避免被改变

```ts
function arraySum(arr: readonly number[]) {
	let sum = 0,
		num;
	while ((num = arr.pop()) !== undefined) {
		// ~~~ 'pop' does not exist on type 'readonly number[]'
		sum += num;
	}
	return sum;
}
```

非 readonly 类型可以赋值给 readonly类型，但 readonly 的类型不能赋值给非 readonly 类型

```ts
const a: number[] = [1, 2, 3];
const b: readonly number[] = a;
const c: number[] = b;
// ~ Type 'readonly number[]' is 'readonly' and cannot be
// assigned to the mutable type 'number[]'
```

注意 readonly 的影响是 shallow 的，比如：

```ts
interface Outer {
	inner: {
		x: number;
	};
}
const o: Readonly<Outer> = { inner: { x: 0 } };
o.inner = { x: 1 };
// ~~~~ Cannot assign to 'inner' because it is a read-only property
o.inner.x = 1; // OK
```

虽然 inner 是 readonly 但是其内部的 x 仍是可变的。你可以使用 ts-essentials 的 DeepReadonly 泛型来使深层的部分也是 readonly

同时，如果给 index signature 设置 readonly ，那么可以使用解构来绕过

```ts
let obj: { readonly [k: string]: number } = {};
// Or Readonly<{[k: string]: number}
obj.hi = 45;
// ~~ Index signature in type ... only permits reading
obj = { ...obj, hi: 12 }; // OK
obj = { ...obj, bye: 34 }; // OK
```

### 使用 index signature 表示动态数据

比如：

```ts
type Rocket = { [property: string]: number };
```

`[property: string]: number` 就是一个 index signature

- property 只是一个表示，并没有什么用

- string 表示 index 的类型

- number 表示取出来的值的类型

实际上，js 中无论 index 是什么类型，再内部都是按 string 类型存储的，比如：

> \> **x = {}**
>
> {}
>
> \> **x[[1, 2, 3]] = 2**
>
> 2
>
> \> **x**
>
> { '1,2,3': 1 }
>
> \> **{ 1: 2, 3: 4}**
>
> { '1': 2, '3': 4 }

同时，数组也被视为对象，数组的下角标作为 key ，如：

> \> **typeof []**
>
> 'object'
>
> \> **x = [1, 2, 3]**
>
> [ 1, 2, 3 ]
>
> \> **x[0]**
>
> 1
>
> \> **x['1']**
>
> 2
>
> \> **Object.keys(x)**
>
> [ '0', '1', '2' ]

### 枚举对象的字段

朴素地遍历对象的字段可能会报错：

```ts
const obj = {
	one: "uno",
	two: "dos",
	three: "tres",
};
for (const k in obj) {
	const v = obj[k];
	// ~~~~~~ Element implicitly has an 'any' type
	// because type ... has no index signature
}
```

因为这里的 k 仅仅是一个 string 类型

还可以这么改进：

```ts
let k: keyof typeof obj; // Type is "one" | "two" | "three"
for (k in obj) {
	const v = obj[k]; // OK
}
```

不过这又带来了一个问题，由于 ts 鸭子类型的特性，我们可以传递含有其他多于属性的对象。这样 ts 的推导就不准确了

当然我们还可以这样：

```ts
function foo(abc: ABC) {
	for (const [k, v] of Object.entries(abc)) {
		k; // Type is string
		v; // Type is any
	}
}
```

不过这样的话还需要更多的判断去确定 v 的类型

## 关于 any

### 使用 any 的范围尽可能小

如果你真的要用 any 的话，使用的范围尽可能小一点：

比如：

```ts
function processBar(b: Bar) {
	/* ... */
}
function f() {
	const x = expressionReturningFoo();
	processBar(x);
	// ~ Argument of type 'Foo' is not assignable to
	// parameter of type 'Bar'
}
```

如果你确定 x 传给 processBar 没问题的话，你可以这么做：

```ts
processBar(x as any); // Prefer this
```

而不是这样：

```ts
const x: any = expressionReturningFoo(); // Don't do this
processBar(x);
```

这样可以把 any 的影响降到最低

同样的，在创建 obj 的时候：

```ts
const config: Config = {
	a: 1,
	b: 2,
	c: {
		key: value,
		// ~~~ Property ... missing in type 'Bar' but required in type 'Foo'
	},
};
```

这样：

```ts
const config: Config = {
	a: 1,
	b: 2, // These properties are still checked
	c: {
		key: value as any,
	},
};
```

而不是：

```ts
const config: Config = {
	a: 1,
	b: 2,
	c: {
		key: value,
	},
} as any; // Don't do this!
```

### 尽可能使用 any 的更精确的形式

假如我们要写一个获取数组长度的函数，由于我们不知道，也没必要知道是什么类型的数组，我们可以这样：

```ts
function getLength(array: any[]) {
	return array.length;
}
```

而不是：

```ts
function getLengthBad(array: any) {
	// Don't do this!
	return array.length;
}
```

又比如这样：

```ts
function hasTwelveLetterKey(o: { [key: string]: any }) {
	for (const key in o) {
		if (key.length === 12) {
			return true;
		}
	}
	return false;
}
```

而不是直接把 o 类型设为 any

#### 任意个参数的函数

```ts
const numArgsBad = (...args: any) => args.length; // Returns any
const numArgsGood = (...args: any[]) => args.length; // Returns number
```

要像上面这样而不是下面这样

### 把一些不太安全的类型断言隐藏在函数中

比如我们要实现一个函数，可以做到缓存函数最后一次的返回结果：

下面是一个实现：

```ts
function cacheLast<T extends Function>(fn: T): T {
	let lastArgs: any[] | null = null;
	let lastResult: any;
	return function (...args: any[]) {
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Type '(...args: any[]) => any' is not assignable to type 'T'
		if (!lastArgs || !shallowEqual(lastArgs, args)) {
			lastResult = fn(...args);
			lastArgs = args;
		}
		return lastResult;
	};
}
```

根据我们的代码实现，最后的返回值一定是可以与 T 类型匹配的，但是 ts 仍报错，虽然我们可以写出没报错的形式，但可能有点麻烦。我们知道这里一定是没问题的，所以可以进行类型断言：

```ts
function cacheLast<T extends Function>(fn: T): T {
	let lastArgs: any[] | null = null;
	let lastResult: any;
	return function (...args: any[]) {
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Type '(...args: any[]) => any' is not assignable to type 'T'
		if (!lastArgs || !shallowEqual(lastArgs, args)) {
			lastResult = fn(...args);
			lastArgs = args;
		}
		return lastResult;
	} as unknown as T;
}
```

我们出于一些原因，不得已使用了 any 和一些类型断言，但这仅仅发生在这个函数体中，我们把这些限定了一个范围。我们只要确保函数的签名部分并没有什么 any 之类的泄露出来就好了

### 考虑使用 unknown 和 never

any 有如下的特性：

- 任何类型都可以赋值给 any 类型
- any 类型可以赋值给其他任意的类型

unknown 只满足第一条，即任何类型都可以赋值给 unknown 类型。但不满足第二条，即只能赋值给其他的 unknown 和 any 类型

never 只满足第二条，即可以赋值给其他任意的类型。但不满足第一条，即任何类型都不能赋值给 never （包括 any）

比如现在要做一个 yaml 的解析函数，我们自然是无法知道解析出来的类型是什么，我们可能考虑使用 any 作为其返回值，但还是不够 type safety。更好的做法是将返回值设置为 unknown，这样的话，任何的值都可以作为返回值给出去，但是调用者接收到返回值后无法使用，必须使用类型断言，转为自己期望的类型，从而保证了类型安全。

当然有人可能想用泛型来包装一下，比如：

```cpp
function safeParseYAML<T>(yaml: string): T {
 return parseYAML(yaml);
}
```

但这在 ts 中并不是一个好的代码风格

#### 双重断言

unknown 还可以用来双重断言：

```ts
let barUnk = foo as unknown as Bar;
```

这样的话，即使后面我们进行代码重构，两次断言被分开了，也会报错，不会出现什么大问题。但是如果是先转成 any 在转成 Bar 的话就没有了这个效果

#### object 和 {}

这两个具有和 unknown 类似的特性，但是比 unknown 表示的范围更加小一点

- object 包括所有的 对象 和 数组，但是不包括一些 primitive type ，比如 `true` `12` `"foo"`
- {} 包括所有的值，除了 null 和 undefined

### 检查项目的类型覆盖率

使用 `npx type-coverage` 可以看到项目的类型覆盖率。使用 any 会使这个值下降。

使用 `npx type-coverage --detail` 可以看到项目中哪里使用了 any

## 类型推导

### Excess property checking

Excess property checking 可以检查你在书写一个特定类型的 obj 的时候是否引入了多余的属性。在声明变量的时候添加显式的类型标注可以开启这个检查：

```ts
interface Room {
	numDoors: number;
	ceilingHeightFt: number;
}
const r: Room = {
	numDoors: 1,
	ceilingHeightFt: 10,
	elephant: "present",
	// ~~~~~~~~~~~~~~~~~~ Object literal may only specify known properties,
	// and 'elephant' does not exist in type 'Room'
};
```

这也是为什么我们在这种情况下要用类型标注而不是类型断言。

作为函数的参数传递时，也有这个检查：

```ts
interface Options {
	title: string;
	darkMode?: boolean;
}
function createWindow(options: Options) {
	if (options.darkMode) {
		setDarkMode();
	}
	// ...
}
createWindow({
	title: "Spider Solitaire",
	darkmode: true,
	// ~~~~~~~~~~~~~ Object literal may only specify known properties, but
	// 'darkmode' does not exist in type 'Options'.
	// Did you mean to write 'darkMode'?
});
```

但是注意只有字面量可以

```ts
const o: Options = { darkmode: true, title: "Ski Free" };
// ~~~~~~~~ 'darkmode' does not exist in type 'Options'...
const o1: Options = document; // OK
const o2: Options = new HTMLAnchorElement(); // OK

const intermediate = { darkmode: true, title: "Ski Free" };
const o: Options = intermediate; // OK
```

如果你使用了字面量，也开启了类型标注，但是还使用了类型断言，这个检查也不会开启

你可以添加一个 index signature 来禁用这个检查：

```ts
interface Options {
	darkMode?: boolean;
	[otherOptions: string]: unknown;
}
const o: Options = { darkmode: true }; // OK
```

如果一个 interface 的所有属性都可以为空，那么就称其为弱类型：

```ts
interface LineChartOptions {
	logscale?: boolean;
	invertedYAxis?: boolean;
	areaChart?: boolean;
}
```

根据 ts 鸭子类型的特性，任何的 obj 都可以称为 LineChartOptions 类型，但是 ts 又引入了另一个检查，一个 obj 必须与弱类型至少有一个属性相同才可以赋值：

```ts
const opts = { logScale: true };
const o: LineChartOptions = opts; //error
```

### 推导尺度

const 声明的变量的推导比 let 的更加精确，如：

```ts
let x = "x"; // type is string
const x = "x"; // type is "x"
```

但 const 声明的对象内的属性没有这个：

```ts
const v = {
	x: 1, // type is number
};
v.x = 3; // OK
```

有时你想让推导变得更加精确，你可以手动标注类型：

```ts
const v: { x: 1 | 3 | 5 } = {
	x: 1,
}; // Type is { x: 1 | 3 | 5; }
```

或者使用 as const

```ts
const v1 = {
	x: 1,
	y: 2,
}; // Type is { x: number; y: number; }
const v2 = {
	x: 1 as const,
	y: 2,
}; // Type is { x: 1; y: number; }
const v3 = {
	x: 1,
	y: 2,
} as const; // Type is { readonly x: 1; readonly y: 2; }
const a1 = [1, 2, 3]; // Type is number[]
const a2 = [1, 2, 3] as const; // Type is readonly [1, 2, 3]
```

数组和 tuple 类型也有类似的问题，如：

```ts
// Parameter is a (latitude, longitude) pair.
function panTo(where: [number, number]) {
	/* ... */
}
panTo([10, 20]); // OK
const loc = [10, 20];
panTo(loc);
// ~~~ Argument of type 'number[]' is not assignable to
// parameter of type '[number, number]'
```

你可以这么做：

```ts
const loc: [number, number] = [10, 20];
panTo(loc); // OK
```

使用 as const 可能出问题：

```ts
const loc = [10, 20] as const;
panTo(loc);
// ~~~ Type 'readonly [10, 20]' is 'readonly'
// and cannot be assigned to the mutable type '[number, number]'
```

### type guard

你可以手动编写一个函数，来判断一个值是否是某个类型，帮助 ts 更好地推导

```ts
function isInputElement(el: HTMLElement): el is HTMLInputElement {
	return "value" in el;
}
function getElementContent(el: HTMLElement) {
	if (isInputElement(el)) {
		el; // Type is HTMLInputElement
		return el.value;
	}
	el; // Type is HTMLElement
	return el.textContent;
}
```

### 理解 any 类型的"进化"

有的变量，可能你在往里面存放具体的值之前，ts 将其为推断为 any 类型，但是存放具体的值之后，ts 将其推断为更加具体的类型，比如：

```ts
function range(start: number, limit: number) {
	const out = []; // Type is any[]
	for (let i = start; i < limit; i++) {
		out.push(i); // Type of out is any[]
	}
	return out; // Type is number[]
}
```

和上面那一条不一样，这种 "进化" 是可以 "膨胀" 的：

```ts
const result = []; // Type is any[]
result.push("a");
result; // Type is string[]
result.push(1);
result; // Type is (string | number)[]
```

除了循环结构，分支结构和 try-catch 结构也可以有这种特性：

```ts
let val; // Type is any
if (Math.random() < 0.5) {
	val = /hello/;
	val; // Type is RegExp
} else {
	val = 12;
	val; // Type is number
}
val; // Type is number | RegExp
```

```ts
let val = null; // Type is any
try {
	somethingDangerous();
	val = 12;
	val; // Type is number
} catch (e) {
	console.warn("alas!");
}
val; // Type is number | null
```

但是在函数闭包里没有这种特性：

```ts
function makeSquares(start: number, limit: number) {
	const out = [];
	// ~~~ Variable 'out' implicitly has type 'any[]' in some locations
	range(start, limit).forEach((i) => {
		out.push(i * i);
	});
	return out;
	// ~~~ Variable 'out' implicitly has an 'any[]' type
}
```

当然，在"进化"之前，他还是 any，比如：

```ts
const out = [];
 // ~~~ Variable 'out' implicitly has type 'any[]' in some
 // locations where its type cannot be determined
 if (start === limit) {
     return out;
     // ~~~ Variable 'out' implicitly has an 'any[]' type
 }
 for (let i = start; i < limit; i++) {
 	out.push(i);
 }
 return out;
}
```

不过还是建议使用显式的类型标注，以便更好地代码补全的错误检查

### aliase 的推导

ts 无法很好地推导 aliase

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
	const box = polygon.bbox;
	if (polygon.bbox) {
		if (
			pt.x < box.x[0] ||
			pt.x > box.x[1] ||
			// ~~~ ~~~ Object is possibly 'undefined'
			pt.y < box.y[1] ||
			pt.y > box.y[1]
		) {
			// ~~~ ~~~ Object is possibly 'undefined'
			return false;
		}
	}
	// ...
}
```

因此一直使用一个 aliase

```ts
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
	const box = polygon.bbox;
	if (box) {
		if (
			pt.x < box.x[0] ||
			pt.x > box.x[1] ||
			pt.y < box.y[1] ||
			pt.y > box.y[1]
		) {
			// OK
			return false;
		}
	}
	// ...
}
```

### async 函数返回值推导

ts 推导 async 函数返回值时，会自动将类型用 Promise 泛型包裹：

```ts
// function getNumber(): Promise<number>
async function getNumber() {
	return 42;
}
```

### 对于 dom 的类型推导

ts 可以推断 dom 的类型：

```ts
document.getElementsByTagName("p")[0]; // HTMLParagraphElement
document.createElement("button"); // HTMLButtonElement
document.querySelector("div"); // HTMLDivElement
```

但是这种就不灵了：

```ts
document.getElementById("my-div"); // HTMLElement
```

## 代码建议

### 不要使用 Object wrapper types

比如 String、Number、Boolean、Symbol、Bigint 这种类型

这种类型相当于对象，直接比较，即使是用 === ，比较的也是对象的地址，地址不同的对象即使看起来完全一致也会判定为 false

> \> **"hello" === new String("hello")**
>
> false
>
> \> **new String("hello") === new String("hello")**
>
> false

对于 primitive type ，当需要将其视为其所对应的 object wrapper type 的时候，则会创建一个临时的对象，然后在操作结束后将对象销毁，如：

> \> **x = "hello"**
>
> \> **x.language = 'English'**
>
> 'English'
>
> \> **x.language**
>
> undefined

此外，primitive type 和 object wrapper type 在 ts 中视为不同的类型。primitive type 可以赋值为 object wrapper type ，而反之则不可以。但注意前者，即使你可以赋值，但是在运行时，他的值仍然为 primitive type，这会导致一些疑惑的地方。

```ts
function getStringLen(foo: String) {
	return foo.length;
}
getStringLen("hello"); // OK
getStringLen(new String("hello")); // OK

function isGreeting(phrase: String) {
	return ["hello", "good day"].includes(phrase);
	// ~~~~~~
	// Argument of type 'String' is not assignable to parameter
	// of type 'string'.
	// 'string' is a primitive, but 'String' is a wrapper object;
	// prefer using 'string' when possible
}
```

所以还是一律使用 primitive type 比较好

### 不同类型的变量使用不同的名称

在 js 中可以给一个变量先后赋值不同类型的值，但在 ts 中不可以。你可能考虑这么做：

```ts
let id: string | number = "12-34-56";
fetchProduct(id);
id = 123456; // OK
fetchProductBySerialNumber(id); // OK
```

但是不要这么做，最好是再开一个变量：

```ts
const id = "12-34-56";
fetchProduct(id);
const serial = 123456; // OK
fetchProductBySerialNumber(serial); // OK
```

此外，变量遮盖也不是一个好的代码习惯：

```ts
//Don't do this
const id = "12-34-56";
fetchProduct(id);
{
	const id = 123456; // OK
	fetchProductBySerialNumber(id); // OK
}
```

### 善用函数签名的类型

比如下面这个代码：

```ts
function add(a: number, b: number) {
	return a + b;
}
function sub(a: number, b: number) {
	return a - b;
}
function mul(a: number, b: number) {
	return a * b;
}
function div(a: number, b: number) {
	return a / b;
}
```

可以优化为下面的代码：

```ts
type BinaryFn = (a: number, b: number) => number;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```

这个非常适用于定义回调函数的类型

另外，比如你现在想要写一个函数，来改善原有的函数，你可以利用 typeof 来获取到原有函数的签名，就不用再费劲照抄原函数的参数和返回值类型

### 善于利用 ts 的类型推断

如果 ts 能正确推断出类型，就不要再去自己标注了，比如：

```ts
let x = 12;
let x: number = 12; // Don't do this
```

如果参数有默认值，那么也没必要再去标注类型了：

```ts
function parseNumber(str: string, base = 10) {
	// ...
}
```

传递闭包时，闭包的类型也没必要标注：

```ts
// Don't do this:
app.get("/health", (request: express.Request, response: express.Response) => {
	response.send("OK");
});
```

但是用字面量声明对象时，需要标注类型，开启 excess property checking

此外，函数的返回值最好也标注好类型，而不是让 ts 自己推导

### 尽可能使用类型声明而不是类型断言

如果你要定义一个特定 interface 类型的变量，你最好是这样做：

```ts
interface Person {
	name: string;
}
const alice: Person = { name: "Alice" }; // Type is Person
```

而不是：

```ts
const bob = { name: "Bob" } as Person; // Type is Person
```

因为前者有 excess property check ，可以保证你确保写代码的过程中仍有代码补全和类型安全

对于箭头函数同理：

```ts
const people = ["alice", "bob", "jan"].map((name): Person => ({ name })); // Type is Person[]
```

注意类型声明作用在箭头函数的返回值上，而不是引入一个 `const person: Person = {name};` 这样太麻烦了

当然有时候你确实需要类型断言：

- 把一个宽泛的类型断言为一个精确的类型：

```ts
document.querySelector("#myButton").addEventListener("click", (e) => {
	e.currentTarget; // Type is EventTarget
	const button = e.currentTarget as HTMLButtonElement;
	button; // Type is HTMLButtonElement
});
```

- 非 null / undefined 断言：如果你确定这个值不会为 null / undefined ，则可以再该值后面加一个 `!`

### 不要分步创建一个对象

```ts
//Don't do this
const pt = {} as Point;
pt.x = 3;
pt.y = 4;
//Do this
const pt: Point = {
	x: 3,
	y: 4,
};
```

如果你需要用一个小的对象创建一个大的对象，考虑使用解构：

```ts
//Don't do this
const pt = { x: 3, y: 4 };
const id = { name: "Pythagoras" };
const namedPoint = {};
Object.assign(namedPoint, pt, id);
namedPoint.name;
// ~~~~ Property 'name' does not exist on type '{}'

//Do this
const namedPoint = { ...pt, ...id };
namedPoint.name; // OK, type is string
```

```ts
declare let hasMiddle: boolean;
const firstLast = { first: "Harry", last: "Truman" };
const president = { ...firstLast, ...(hasMiddle ? { middle: "S" } : {}) };
```

### 函数签名的类型设计

一个函数的接受的类型应该很广泛，返回值的类型应该尽可能单一：

```ts
interface LngLat {
	lng: number;
	lat: number;
}
type LngLatLike = LngLat | { lon: number; lat: number } | [number, number];
```

将参数类型设置为 LngLatLike ，尽可能接收更多形式

### 不要在注释中重复类型

函数的参数是什么类型，返回值是什么类型，都写在代码里了，不需要你再从代码注释里再写一遍

### 尽可能把整体设置为 null

如果两个变量，要么都不为 null ， 要么都为 null，那么你应该考虑使用 tuple 把两者结合起来，而不是设两个变量，如：

```ts
// Don't do this
function extent(nums: number[]) {
	let min, max;
	for (const num of nums) {
		if (!min) {
			min = num;
			max = num;
		} else {
			min = Math.min(min, num);
			max = Math.max(max, num);
			// ~~~ Argument of type 'number | undefined' is not
			// assignable to parameter of type 'number'
		}
	}
	return [min, max];
}

const [min, max] = extent([0, 1, 2]);
const span = max - min;
// ~~~ ~~~ Object is possibly 'undefined'

// Do this
function extent(nums: number[]) {
	let result: [number, number] | null = null;
	for (const num of nums) {
		if (!result) {
			result = [num, num];
		} else {
			result = [Math.min(num, result[0]), Math.max(num, result[1])];
		}
	}
	return result;
}
const range = extent([0, 1, 2]);
if (range) {
	const [min, max] = range;
	const span = max - min; // OK
}
```

### 把所有的类型都导出

在编写一个供别人使用的模块时，最好是把所有的类型都导出，如：

```ts
interface SecretName {
	first: string;
	last: string;
}
interface SecretSanta {
	name: SecretName;
	gift: string;
}
export function getGift(name: SecretName, gift: string): SecretSanta {
	// ...
}
```

如果这样，别人在使用的时候无法导入 SecretName 和 SecretSanta 这两个类型，就会给使用者带来一些麻烦。

如果你作为一个使用者，遇到了这种情况，那么可以使用如下的方法解决：

```ts
type MySanta = ReturnType<typeof getGift>; // SecretSanta
type MyName = Parameters<typeof getGift>[0]; // SecretName
```

### 给回调函数设置 this 类型

目前对 js 的 this 还不太了解，以后有机会再补

### 把依赖其他库的类型抽象出来

比如：

```ts
function parseCSV(contents: string | Buffer): { [column: string]: string }[] {
	if (typeof contents === "object") {
		// It's a buffer
		return parseCSV(contents.toString("utf8"));
	}
	// ...
}
```

其中的 Buffer 是 node.js 特有的类型。如果这个函数作为一个模块发布，那么后面在浏览器环境使用这个函数的人会产生疑惑。

解决方法是，考虑到我们只使用了 Buffer 类型的 toString 方法，我们可以把这个类型单独拿出来：

```ts
interface CsvBuffer {
	toString(encoding: string): string;
}
function parseCSV(
	contents: string | CsvBuffer,
): { [column: string]: string }[] {
	// ...
}
```

### 使用现代的 js 语法

1. 对于循环遍历：
   - 如果只是变量数组的元素，那么使用 for-of

   - 如果还需要得到当前下表，那么使用 forEach

   - 如果需要中间跳出循环，那么使用 for

2. 使用 import 和 export 语法而不是 require
3. 使用箭头函数而不是 function
4. 善于使用解构语法

### 有初始常量值就不用写类型了

比如：

```ts
const INIT_OPTIONS = {
	width: 640,
	height: 480,
	color: "#00FF00",
	label: "VGA",
};
interface Options {
	width: number;
	height: number;
	color: string;
	label: string;
}
```

可以把下面的 interface 的定义优化为：

```ts
type Options = typeof INIT_OPTIONS;
```

### mapped type

如：

```ts
type Vec3D = { [k in "x" | "y" | "z"]: number };
// Type Vec3D = {
// x: number;
// y: number;
// z: number;
// }
```

当然可以更加灵活：

```ts
type ABC = { [k in "a" | "b" | "c"]: k extends "b" ? string : number };
// Type ABC = {
// a: number;
// b: string;
// c: number;
// }
```

从外，使用 mapped type 还可以用来保证相关联的类型和值的同步

### 使用 union 抽取类型的公共部分

比如下面的代码：

```ts
interface SaveAction {
	type: "save";
	// ...
}
interface LoadAction {
	type: "load";
	// ...
}
type Action = SaveAction | LoadAction;
type ActionType = "save" | "load"; // Repeated types!
```

可以改进为：

```ts
type ActionType = Action["type"]; // Type is "save" | "load"
```

这个和 pick 泛型不太一样：

```ts
type ActionRec = Pick<Action, "type">; // {type: "save" | "load"}
```

## 其他

### Monkey patching

如果想以一个类型安全的方法进行 monkey patching，你可以使用 interface 的 augmented

```ts
interface Document {
	/** Genus or species of monkey patch */
	monkey: string;
}
document.monkey = "Tamarin"; // OK
```

如果你在编写一个模块，可以用 declare global

```ts
export {};
declare global {
	interface Document {
		/** Genus or species of monkey patch */
		monkey: string;
	}
}
document.monkey = "Tamarin"; // OK
```

但是这还是会出现问题：当你在别的地方引入了这个模块，其他没有引入这个模块的地方也被影响了

最好是自己再开一个类型：

```ts
interface MonkeyDocument extends Document {
	/** Genus or species of monkey patch */
	monkey: string;
}
(document as MonkeyDocument).monkey = "Macaque";
```

### TSDoc

可以按如下的形式编写注释，这种注释可以被 ide 识别，支持 markdown：

```ts
/**
 * Generate a greeting.
 * @param name Name of the person to greet
 * @param salutation The person's title
 * @returns A greeting formatted for human consumption.
 */
function greetFullTSDoc(name: string, title: string) {
	return `Hello ${title} ${name}`;
}
```

![](http://pic.caiwen.work/i/2025/01/29/6799bb14957cd.png)

```ts
/**
 * This _interface_ has **three** properties:
 * 1. x
 * 2. y
 * 3. z
 */
interface Vector3D {
	x: number;
	y: number;
	z: number;
}
```

![](http://pic.caiwen.work/i/2025/01/29/6799bb3b6ae68.png)

### 访问修饰符

ts 中支持使用 public private 和 protected

```ts
class Diary {
	private secret = "cheated on my English test";
}
const diary = new Diary();
diary.secret;
// ~~~~~~ Property 'secret' is private and only
// accessible within class 'Diary'
```

但是这仅仅是在 type space 做出的限制，可以很容易绕过：

```ts
class Diary {
	private secret = "cheated on my English test";
}
const diary = new Diary();
(diary as any).secret; // OK
```

### 一些工具类泛型

#### Pick<T,K>

可以从类型 T 中选取字段 K 来组成新的类型，其定义：

```ts
type Pick<T, K extends keyof T> = {
	[k in K]: T[k];
}; // OK
```

#### Partial< T >

将 T 中所有的属性都变为可选的，其定义：

```ts
type Partial<T> = { [k in keyof Options]?: T[k] };
```

#### 返回值和参数类型

ReturnType 可以用于获取一个函数的返回值类型。Parameters 可以获取一个函数的参数类型，如

```ts
type MySanta = ReturnType<typeof getGift>; // SecretSanta
type MyName = Parameters<typeof getGift>[0]; // SecretName
```

#### Record

可以用于简写多个类型相等的属性，如

```ts
type Vec3D = Record<"x" | "y" | "z", number>;
// Type Vec3D = {
// x: number;
// y: number;
// z: number;
// }
```

#### Readonly< T >

可以将类型 T 的所有属性设置为 readonly
