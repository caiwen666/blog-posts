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

更多内容见 408计组笔记：<https://www.caiwen.work/post/408-cs-data>

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
