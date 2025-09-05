@meta

```json
{
	"id": "csapp-2",
	"createTime": "2024-12-19 22:57",
	"summary": "CSAPP 第二章 - 信息的表示和处理的读书笔记",
	"key": ["csapp", "data lab", "二进制", "整数", "浮点数"],
	"background": "http://pic.caiwen.work/i/2025/01/29/6799cdcfd9014.png"
}
```

## 预备知识

- 字节：计算机内存每**8**位被分为一个块，称为一个字节，是最小的可寻址单位。
- 十六进制——十进制——二进制对应表：

![](http://pic.caiwen.work/i/2025/01/29/6799cabdde5ea.png)

- 字长：指针占用的内存空间大小。在32位机器上是4字节，在64位机器上是8字节。
- 小/大端法
  - 小端法：最低有效字节放在内存中的前面（与阅读顺序相反）。
  - 大端法：最低有效字节放在内存的后面（与阅读顺序相同）。
  - 大多数机器使用小端法。
  - 字符串类型在内存中的储存顺序与大端法还是小端法无关。

- 移位运算
  - 左移，没有什么特别的。
  - 右移分两种
    - 逻辑右移：直接右移，然后在高位补0。
    - 算数右移：如果最高位为1，那么最高位补1。最高位为0，则最高位补0。
  - 对于一个由 $w$ 位组成的数据类型，如果要移动的位数 $k$ 大于等于 $w$，则实际上是位移 $k \space mod  \space w$ 位。

## 整数

### 编码

**无符号整数**

对于一个位表示 $x=[x_{w-1},x_{w-2},...,x_0]$ ，其表示的十进制数为：

$$
B2U_w(x)=\sum_{i=0}^{w-1} x_i2^i
$$

**有符号整数**

对于一个位表示 $x=[x_{w-1},x_{w-2},...,x_0]$ ，其表示的十进制数为：

$$
B2T_w(x)=-x_{w-1}2^{w-1}+\sum_{i=0}^{w-2} x_i2^i
$$

这种编码方式成为补码。

**一些特殊的值**

![](http://pic.caiwen.work/i/2025/01/29/6799caf8d8490.png)

注意，补码的范围是不对称的，即 $|T_{min}|=|T_{max}|+1$ ，因为一半的位模式是负数，另一半的位模式是0和正数。

### 无符号和有符号互转

转换时确保位模式不会发生变化。

**有符号转无符号**

$$
T2U_w(x)=\begin{cases}
x+2^w, & x<0 \\
x,  & x \ge 0
\end{cases}
$$

推导：

对于相同的位模式 $x$，我们有：

$$
B2U_w(x)-B2T_w(x)\\
=x_{w-1}2^{w-1}+\sum_{i=0}^{w-2} x_i2^i-(-x_{w-1}2^{w-1}+\sum_{i=0}^{w-2} x_i2^i)\\
=2\times x_{w-1}2^{w-1}=x_{w-1}2^w
$$

因此当 $B2T_w(x)$ 为负数时，$x_{w-1}$ 为 $1$，两者相差为 $2^w$。反之，$x_{w-1}$ 为 $0$，两者相同。

**无符号转有符号**

$$
U2T_w(x)=\begin{cases}x, & x\le T_{max} \\x-2^w,  & x > T_{max}\end{cases}
$$

总的来说，补码符号位为 $0$ 时，两者转换前后相同。反之，转化前后相差 $2^w$。

**有符号和无符号同时出现时**

在C语言中，有符号和无符号同时出现时，会隐式地将有符号转为无符号。

### 扩展与截断

**扩展**

- 零扩展：无符号整数扩展时，高位补0。
- 符号扩展：有符号整数扩展时，补原最高位，类似逻辑右移。

零扩展和最高位为 $0$ 时的符号扩展，扩展前后表示的十进制整数一定是不变的。

最高位为 $1$ 时的符号扩展，对于有符号整数，扩展前后表示的十进制整数一定也会是不变的，证明如下：

$$
B2T_{w+1}([x_{w-1},x_{w-1},x_{w-2},...,x_0])\\
=-x_{w-1}2^w+x_{w-1}2^{w-1}+\sum_{i=0}^{w-2}x_i2^i\\
=-x_{w-1}(2^w-2^{w-1})+\sum_{i=0}^{w-2}x_i2^i\\
=-x_{w-1}2^{w-1}+\sum_{i=0}^{w-2}x_i2^i\\
=B2T_{w}([x_{w-1},x_{w-2},...,x_0])
$$

**截断**

直接将其位模式上的高位丢弃。

**两种转换同时存在**

当既有有符号和无符号的转换，又有扩展或者截断时，要先改变大小，再进行有符号和无符号之间的转换。这是C语言标准规定的。

### 加法

先在位模式的视角直接相加，如果溢出了，则把溢出的位数直接截断。

**无符号整数**

位数为 $w$ 时，$x$ 和 $y$ 相加，得到 $(x+y)\space mod \space 2^w$。即如果要溢出了就减去 $2^w$。

设得到的结果为 $s$，如果 $s<x$ 或者 $s<y$，则说明发生了溢出。

**有符号整数**

位数为 $w$ 时，$x$ 和 $y$ 相加，如果发生了正溢出就减去 $2^w$，如果发生了负溢出就加上 $2^w$。

设得到的结果为 $s$

- 当 $x>0$，$y>0$，但 $s\le 0$ 时，说明发生了正溢出。
- 当 $x<0$，$y<0$，但 $s\ge 0$ 时，说明发生了负溢出。

### 取相反数

对于有符号整数 $x$，$-x$ 与 $\sim x+1$ 位级表示相同。

### 乘法

**有符号和无符号整数之间相乘**

都视为相同位级表示的无符号整数，然后相乘，得出的结果如果有溢出则截断。

**乘上常数**

对于要乘上的数字是一个常数的时候，则可以把乘法转化为若干个位运算来加速运算。

如果要乘上 $2^k$ ，则只需要左移 $k$ 位。于是我们可以把任何的常数拆成若干个 $2$ 的幂次相加或相减。

如 $14=2^3+2^2+2^1$，则 $x \times 14=(x<<3)+(x<<2)+(2<<1)$。

同时，$14=2^4-2^1$，则 $x \times 14=(x<<4)-(2<<1)$。

更一般的，我们可以将常数 $K$ 的二进制视为若干个连续0或者连续1的块交替的形式：$[(0...0)(1...1)(0...0)...(1...1)]$。

考虑一组从位位置 $l$ 到位位置 $r$ 的连续的 $1$（$l\le r$），这一部分对乘积的影响有如下两种形式：

- $(x<<l)+(x<<(l+1))+...+(x<<r)$
- $(x<<(r+1))-(x<<l)$

**判断是否溢出**

对于 $x$ 和 $y$ 相乘，令其结果为 $p$。

如果 $x$ 为 $0$，显然不会发生溢出。

反之，如果 `p/x!=y` 则说明发生溢出。

### 除以2的幂

**无符号**

对于除以 $2^k$ 且下取整，直接逻辑右移 $k$ 位即可。

**有符号**

对于除以 $2^k$ ，如果直接算数右移 $k$ 位，那么得到的结果是向下取整的。

但C语言中的负数做除法时，并不是向下取整，是向零取整的。

当被除数为正时，没什么问题。

当被除数为负时，我们先加上一个偏置值 $2^k-1$，再算数右移 $k$ 位。

## 浮点数

### 编码

对于一个小数 $b$，我们可以将其表示为一个二进制的小数：

$$
b_mb_{m-1}...b_1b_0.b_{-1}b_{-2}...b_{-n+1}b_{-n}
$$

于是

$$
b=\sum_{i=-n}^{m}2^i\times b_i
$$

然后，类似与科学计数法，我们可以把上述的二进制小数表示为：

$$
(-1)^s\times M \times 2^E
$$

- $s$：符号，$s=1$ 时表示其为负数，$s=0$ 时表示其为整数
- $M$：尾数，是一个二进制小数
- $E$：阶码

编码时，从高位到低位依次是：

- $1$ 位的 $s$ 编码符号位 $s$
- $k$ 位的 $exp$ 编码阶码 $E$
- $n$ 位的 $frac$ 编码尾数 $M$

![](http://pic.caiwen.work/i/2025/01/29/6799cb6c7edce.png)

| 数据类型 | $k=$ | $n=$ |
| -------- | ---- | ---- |
| float    | 8    | 23   |
| double   | 11   | 52   |

然后，浮点数在编码时分为如下的几种类型

**情况1：规格化的值**

编码阶码的部分既不全为 $0$ 也不全为 $1$。

![](http://pic.caiwen.work/i/2025/01/29/6799cba4545b4.png)

- 对于 $E$
  - $E=e-Bias$
  - $e$ 为 $exp$ 字段对应的无符号整数
  - $Bias$ 为一个偏置值，等于 $2^{k-1}-1$。对于 float 类型，其为 $127$。对于 double 类型，其为 $1023$
  - 对于 float 类型，$E \in [-126,127]$。对于 double 类型，$E\in [-1022,1023]$
- 对于 $M$
  - $M=1+f$
  - $f$ 为 $frac$ 编码的小数值，其二进制表示为 $0.f_{n-1}f_{n-2}...f_1f_0$

**情况2：非规格化的值**

编码阶码的部分全为 $0$ 。

![](http://pic.caiwen.work/i/2025/01/29/6799cbd4e0929.png)

- 对于 $E$
  - $E=1-Bias$
  - $Bias$ 与规格化值中的计算方法相同
- 对于 $M$
  - $M=f$
  - $f$ 与规格化值中的计算方法相同
- 非规格化值用来表示特别接近于 $0$ 的小数

**情况3：特殊值**

当编码阶码的部分全为 $1$ ，且编码尾数的部位全为 $0$ 时，其表示为无穷大

![](http://pic.caiwen.work/i/2025/01/29/6799cc15aa7e6.png)

但如果编码尾数的部分不全为 $0$，则表示 NaN

![](http://pic.caiwen.work/i/2025/01/29/6799cc35956c5.png)

**示例**

对于一个 $8$ 位，$k=4$，$n=3$ 的小数，其示例如下：

![](http://pic.caiwen.work/i/2025/01/29/6799cc54c3c51.png)

同时，应当注意到，如果将一个浮点数的位级表示视为一个无符号整数，他们的大小顺序是相同的。对于负数的浮点数则相反

### 舍入

对于一般情况，正常进行四舍五入。如果一个数，恰好位于可能要舍入的两个数中间，则舍入到最后一位为偶数的那个数。

例如，舍入到小数点后两位

| 原数      | 舍入到的数 | 原因                                           |
| --------- | ---------- | ---------------------------------------------- |
| 2.8949999 | 2.89       | 不到一半，正常四舍五入                         |
| 2.8950001 | 2.90       | 超过一般，正常四舍五入                         |
| 2.8950000 | 2.90       | 刚好在一半时，保证最后一位是偶数，所以向上舍入 |
| 2.8850000 | 2.88       | 刚好在一半时，保证最后一位是偶数，所以向下舍入 |
| 10.00011  | 10.00      | 不到一半，正常四舍五入                         |
| 10.00110  | 10.01      | 超过一般，正常四舍五入                         |
| 10.11100  | 11.00      | 刚好在一半时，保证最后一位是偶数，所以向上舍入 |
| 10.10100  | 10.10      | 刚好在一半时，保证最后一位是偶数，所以向下舍入 |

## DataLab

### bitXor

```cpp
/*
 * bitXor - x^y using only ~ and &
 *   Example: bitXor(4, 5) = 1
 *   Legal ops: ~ &
 *   Max ops: 14
 */
int bitXor(int x, int y) {
  return (~(x&y))&(~((~x)&(~y)));
}
```

### tmin

求 tmin

```cpp
/*
 * tmin - return minimum two's complement integer
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {
	return (1<<31);
}
```

### isTmax

我们发现，Tmax + 1 和 ~Tmax 是相等的。不过，`-1` 也有这个特点，所以需要特判一下

```cpp
/*
 * isTmax - returns 1 if x is the maximum, two's complement number,
 *     and 0 otherwise
 *   Legal ops: ! ~ & ^ | +
 *   Max ops: 10
 *   Rating: 1
 */
int isTmax(int x) {
  	return (!(!(x^(~0))))&(!((x+1)^(~x)));
}
```

我们发现，`!` 这个运算符用来搞判断是非常好用的

### allOddBits

我们每次把位级表示分成两半，然后把让低位的那一半与上高位的那一半，反复下去，即可求出

```cpp
/*
 * allOddBits - return 1 if all odd-numbered bits in word set to 1
 *   where bits are numbered from 0 (least significant) to 31 (most significant)
 *   Examples allOddBits(0xFFFFFFFD) = 0, allOddBits(0xAAAAAAAA) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 2
 */
int allOddBits(int x) {
	x=x&(x>>16);
	x=x&(x>>8);
	x=x&(x>>4);
	x=x&(x>>2);
	return (x>>1)&1;
}
```

### negate

```cpp
/*
 * negate - return -x
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
	return (~x)+1;
}
```

### isAsciiDigit

```cpp
int isAsciiDigit(int x) {
  	int flag1 = !((x>>4)^(0x03));
	int flag2 = x&(1<<3);
	int flag3 = x&(1<<2);
	int flag4 = x&(1<<1);
	return flag1&((!flag2)|((!flag3)&(!flag4)));
}
```

### conditional

首先把 x 转为要么为 0 要么为 1 的条件。

然后生成一个 msk，其为 `flag+(~0)`。这样的话，如果 flag 为 1，msk 就为 0，反之，msk 就为各位都为 1 的一个数。

然后通过 msk 即可按条件返回不同的数。

```cpp
/*
 * conditional - same as x ? y : z
 *   Example: conditional(2,4,5) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 16
 *   Rating: 3
 */
int conditional(int x, int y, int z) {
  	int flag = !(!x);
	int msk;
       	msk = flag+(~0); //flag=0 -> msk=111... or msk = 0
	int t1 = msk&z; //flag=0 -> c1=z  or c1=0
	msk = (!flag)+(~0); //flag=1 -> msk=111... or msk=0
	int t2 = msk&y; //flag=1 -> c2=y or c2=0
	return t1^t2;
}
```

### isLessOrEqual

```cpp
/*
 * isLessOrEqual - if x <= y  then return 1, else return 0
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  	int d=x+((~y)+1);
	int flag1=(d>>31)&1;
	int flag2=!d;
	int sym1=(x>>31)&1;
	int sym2=(y>>31)&1;
	int flag3=sym1^sym2;
	int p1=sym1&(!sym2);
	int msk=flag3+(~0);
	int p2=msk&(flag1|flag2);
	return p1|p2;
}
```

### logicalNeg

类似上面的 allOddBits，我们判断奇数位上是否存在 1 和偶数位上是否存在 1

```cpp
/*
 * logicalNeg - implement the ! operator, using all of
 *              the legal operators except !
 *   Examples: logicalNeg(3) = 0, logicalNeg(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4
 */
int logicalNeg(int x) {
  	x=x|(x>>16);
	x=x|(x>>8);
	x=x|(x>>4);
	x=x|(x>>2);
	int flag1=1^(x&1);
	int flag2=1^((x>>1)&1);
	return flag1&flag2;
}
```

### howManyBits

类似二分的思想，然后再套上条件运算

```cpp
/* howManyBits - return the minimum number of bits required to represent x in
 *             two's complement
 *  Examples: howManyBits(12) = 5
 *            howManyBits(298) = 10
 *            howManyBits(-5) = 4
 *            howManyBits(0)  = 1
 *            howManyBits(-1) = 1
 *            howManyBits(0x80000000) = 32
 *  Legal ops: ! ~ & ^ | + << >>
 *  Max ops: 90
 *  Rating: 4
 */
int howManyBits(int x) {
  	int ans=0;
	int flag1=!((x>>31)&1);
	int msk1=flag1+(~0);
	int p1=msk1&(~x);
	int p2=(~msk1)&(x);
	x=p1^p2;
	int m1=1;
	int m2=(1<<2)+(~0);
	int m4=(1<<4)+(~0);
	int m8=(1<<8)+(~0);
	int m16=(1<<16)+(~0);
	int now=x;
	int tmp,flag,msk;
	//16
	tmp=now>>16;
	flag=!(!tmp);
	msk=flag+(~0);
	ans=ans+((~msk)&(16));
	now=((msk&(now&m16))^((~msk)&(tmp)));
	//8
	tmp=now>>8;
	flag=!(!tmp);
	msk=flag+(~0);
	ans=ans+((~msk)&(8));
	now=((msk&(now&m8))^((~msk)&(tmp)));
	//4
	tmp=now>>4;
	flag=!(!tmp);
	msk=flag+(~0);
	ans=ans+((~msk)&(4));
	now=((msk&(now&m4))^((~msk)&(tmp)));
	//2
	tmp=now>>2;
	flag=!(!tmp);
	msk=flag+(~0);
	ans=ans+((~msk)&(2));
	now=((msk&(now&m2))^((~msk)&(tmp)));
	//1
	tmp=now>>1;
	flag=!(!tmp);
	msk=flag+(~0);
	ans=ans+((~msk)&(1));
	now=((msk&(now&m1))^((~msk)&(tmp)));
	flag=!(!now);
	msk=flag+(~0);
	ans=ans+((~msk)&(1));
	return ans+1;
}
```

### floatScale2

我们发现，对于非规格化的浮点数，乘二就相当于把尾数部分左移一位

对于规格化数，把阶码部分加上 1 即可

```cpp
/*
 * floatScale2 - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatScale2(unsigned uf) {
  	unsigned s=(uf>>31);//1
	unsigned e=((uf<<1)>>24);//8
	unsigned m=((uf<<9)>>9);//23
	if(!e){
		return (s<<31)|(uf<<1);
	}else{
		if(e==0xfe) return ((s<<8)|(0xff))<<23;
		else if(e==0xff){
			if(m) return uf;
			return ((s<<8)|(0xff))<<23;
		}
		else return (s<<31)|((e+1)<<23)|m;
	}
}
```

### floatFloat2Int

非规格化数一定全小于 1，规格化数中的一部分也是小于 1 的

```cpp
/*
 * floatFloat2Int - Return bit-level equivalent of expression (int) f
 *   for floating point argument f.
 *   Argument is passed as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point value.
 *   Anything out of range (including NaN and infinity) should return
 *   0x80000000u.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
int floatFloat2Int(unsigned uf) {
  	unsigned s = (uf>>31);//1
	unsigned e = ((uf<<1)>>24);//8
	unsigned m = ((uf<<9)>>9);//23
	if(!e) return 0;
	if(e<127) return 0;
	e=e-127;
	if(e>=32) return 0x80000000u;
	if(e<=23) m = m>>(23-e);
	else m = m<<(e-23);
	m = (1<<e)|m;
	if(s){
		if(m>0x80000000u) return 0x80000000u;
		else if(m==0x80000000u) return (1<<31);
		else return (~m)+1;
	}else{
		if(m>=0x80000000u) return 0x80000000u;
		else return m;
	}
}
```

### floatPower2

```cpp
/*
 * floatPower2 - Return bit-level equivalent of the expression 2.0^x
 *   (2.0 raised to the power x) for any 32-bit integer x.
 *
 *   The unsigned value that is returned should have the identical bit
 *   representation as the single-precision floating-point number 2.0^x.
 *   If the result is too small to be represented as a denorm, return
 *   0. If too large, return +INF.
 *
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. Also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatPower2(int x) {
    if(x<-149) return 0;
	if(x>127) return 0x7f800000u;
	if(x<-126){
		int d=-x-126;
		return 1<<(23-d);
	}else{
		int d=x+127;
		return d<<23;
	}
}
```
