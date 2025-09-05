@meta

```json
{
	"id": "bitset",
	"summary": "bitset的学习笔记和相关题目",
	"key": ["bitset", "优化"],
	"background": "http://pic.caiwen.work/i/2025/04/03/67ee50a2c54e1.png"
}
```

## 语法知识

### 声明与初始化

头文件：`<bitset>`

声明方法：`std::bitset<N> s;`

开在全局时，默认全为 0；**开在局部时无法保证，需要使用 reset 函数清空**。

可以使用字符串来初始化：

```cpp
std::bitset<8> s(std::string("00110101"));
```

注意，字符串最右边的数字是低位，也就是上述赋值后的结果为：

| 下表 | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7   |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- |
| 值   | 1   | 0   | 1   | 0   | 1   | 1   | 0   | 0   |

### 修改与运算

直接下标修改 `s[pos]=x;` ，时间复杂度 $O(1)$

支持左右位移、与、或、异或，返回一个 bitset，如 `std::bitset<N> k=s<<x;` ，时间复杂度 $O(\frac{N}{w})$，$w$ 为计算机字长，可以视为 $64$。右移是逻辑右移。

### 输入输出

可以与 cin 和 cout 一块使用。还是注意字符串最右边的数字是低位。cout 时会自动补 0

```cpp
cin>>s;		// 1101
cout<<s;	// 000001101
```

### 成员函数

- `reset()`：全部置为 0
- `to_string() -> string`：转为 string，高位补 0
- `to_ulong() -> unsigned int`：转为 unsigned int ，溢出的话会 re
- `to_ullong() -> unsigned long long`：转为 unsigned long long，溢出的话会 re
- set
  - `set()`：全部置为 1
  - `set(int index,bool value = true)`：将下标为 index 的位置置为 value

- `test(int index) -> bool`：返回 index 位置的值
- `any() -> bool`：如果 bitset 内有 1 ，则返回 true，反之返回 false
- `none() -> bool`：如果 bitset 内有 1，则返回 false，反之返回 true
- `count() -> unsigned int`：返回 bitset 内 1 的个数，注意是无符号
- flip
  - `flip()`：所有位取反
  - `flip(int index)`：指定位置按位取反

以上操作的单点操作都为 $O(1)$，整体操作都为 $O(\frac{N}{w})$

## 题目

### P1537 弹珠

https://www.luogu.com.cn/problem/P1537

**题目描述**

给出六个非负整数 $N_1,\cdots,N_6$，其中 $N_i$ 是价值为 $i$ 的弹珠的个数。最大弹珠总数将达到 $2\times 10^4$。判断能否把这些弹珠分成价值相等的两份。

**笔记**

显然可以直接多重背包做。

现在考虑 01 背包，朴素的 01 背包会超时，但我们可以使用 bitset 优化

转移方程：$f_j = f_j | f_{j-w_i}$，倒序枚举 $w_i$

我们发现这个方程相当于把一个 01 串左移 $w_i$ 位再与原 01 串取或

我们把 $f$ 视为一个 bitset，则转移可以写成 $f|=f<<w_i$

时间复杂度 $O(\frac{n}{w}\sum w_i)$

```cpp
#include<bits/stdc++.h>
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
#define _ 120004
typedef pair<int,int> pii;
int in[7];
signed main(){
    //ios::sync_with_stdio(false);
    int now;
    while(true){
        int sum=0;now++;
        for(int i=1;i<=6;i++) scanf("%d",&in[i]),sum+=i*in[i];
        if(!sum) break;
        printf("Collection #%d:\n",now);
        if(sum%2){
            printf("Can't be divided.\n\n");
            continue;
        }
        bitset<_> s;s.reset();s.set(0);
        for(int i=1;i<=6;i++){
            for(int j=1;j<=in[i];j++){
                s|=(s<<i);
            }
        }
        if(s.test(sum/2)) printf("Can be divided.\n\n");
        else printf("Can't be divided.\n\n");
    }
    return 0;
}
```

### P5020 [NOIP 2018 提高组] 货币系统

https://www.luogu.com.cn/problem/P5020

**题目描述**

在一个完善的货币系统中，每一个非负整数的金额 $x$ 都应该可以被表示出。然而， 货币系统可能是不完善的。例如在货币系统 $n=3$, $a=[2,5,9]$ 中，金额 $1,3$ 就无法被表示出来。

两个货币系统 $(n,a)$ 和 $(m,b)$ 是等价的，当且仅当对于任意非负整数 $x$，它要么均可以被两个货币系统表出，要么不能被其中任何一个表出。

现在网友们打算简化一下货币系统。他们希望找到一个货币系统 $(m,b)$，满足 $(m,b)$ 与原来的货币系统 $(n,a)$ 等价，且 $m$ 尽可能的小。他们希望你来协助完成这个艰巨的任务：找到最小的 $m$。

有多组测试数据。

**数据范围**

$T ≤ 20, n \le 100, a_i \le 25000$。

**笔记**

先去重，然后从小到大排序。如果这 $n$ 个数中，一个数已经能被前面的数组合出来，那么这个数就可以去掉了。是一个完全背包问题。时间复杂度 $O(n\times max\{a_i\})$

完全背包也可以使用 bitset 优化。

对于一个物品 $a_i$，我们枚举这个物品的个数 $k$，转移方程即为 $f_j |= f_{j-k\times a_i}$ 。将 dp 数组视为一个 bitset，则有 $f|=f<<(k\times a_i)$。

然后我们进一步考虑：

$k=1$ 时相当于 $f$ 和 $f << a_i$ 按位或。

$k=2$ 时相当于 $f$ 、$f<<a_i$ 、$f<<2a_i$、$f<<3a_i$ 异或。

发现 $k=3$ 是不需要枚举的，因为 $k=1$ 和 $k=2$ 的结果叠加了。同理 $k=5$ 可以由 $k=1$ 和 $k=4$ 的结果叠加。我们发现只需要枚举 $2$ 的幂次即可。

总的时间复杂度 $O(n\times log(max\{a_i\})\times \frac{max\{a_i\}}{w})$，优化了一点。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
int in[101];
inline void subtask(){
    int n,mx=-1;cin>>n;
    int ans=n;
    for(int i=1;i<=n;i++) cin>>in[i],mx=max(mx,in[i]);
    sort(in+1,in+n+1);
    bitset<25001> s;s.reset();s.set(0);
    for(int i=1;i<=n;i++){
        if(s.test(in[i])){
            ans--;
            continue;
        }
        int x=in[i];
        while(x<=mx){
            s|=(s<<x);
            x*=2;
        }
    }
    cout<<ans<<endl;
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

### P3674 小清新人渣的本愿

https://www.luogu.com.cn/problem/P3674

**题目描述**

$n$ 个数，$m$ 个操作：

1. 询问区间内是否存在两个数（可为同一个数）相加为 $x$
2. 询问区间内是否存在两个数（可为同一个数）相减为 $x$
3. 询问区间内是否存在两个数（可为同一个数）相乘为 $x$

**数据范围**

$n,m\le 10^5, max(x,a_i)\le 10^5$

**笔记**

没有修改，仅查询，支持离线，考虑莫队。考虑使用 bitset 维护：

- 操作一：

如果询问是否存在 $a$ 和 $b$ 满足 $a-b=x$ ，即判断是否存在 $a=b+x$。我们令 bitset $s1$ 维护某个数是否存在，那么只需要看一下 $s1\&(s1<<x)$ 是否存在 1 即可。

- 操作二：

如果沿用上述的方法，需要判断 $a=x-b$ 是否存在，直接用 $s1$ 无法实现，因为 $b$ 前面有一个负号。我们可以考虑维护 $-b$，但是 bitset 只能维护非负数，所以我们改为维护 $N-b$，其中 $N$ 为值域上限，用 bitset $s2$。

于是转化为判断 $a=(N-b)-N+x$ 是否存在，那么只需要看一下 $s1\&(s2>>(N-x))$ 是否存在 1 即可。

- 操作三：

可以用 $O(\sqrt{x})$ 的时间暴力枚举 $x$ 的因数 $d$，然后判断 $d$ 和 $\frac{x}{d}$ 是否都存在即可。

```cpp
#include<bits/stdc++.h>
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
#define _ 100005
const int N=100000;
int a[_],blo,bl[_],bu[_];
struct Q{int l,r,id,op,x,ans;} q[_];
bitset<_> s1,s2;
inline void add(int x){
    bu[a[x]]++;
    if(bu[a[x]]==1) s1.set(a[x]),s2.set(N-a[x]);
}
inline void del(int x){
    bu[a[x]]--;
    if(bu[a[x]]==0) s1.set(a[x],0),s2.set(N-a[x],0);
}
inline void subtask(){
    int n,m;cin>>n>>m;
    blo=sqrt(n);
    for(int i=1;i<=n;i++) cin>>a[i],bl[i]=(i-1)/blo+1;
    for(int i=1;i<=m;i++) cin>>q[i].op>>q[i].l>>q[i].r>>q[i].x,q[i].id=i;
    sort(q+1,q+m+1,[](Q x,Q y){return bl[x.l]==bl[y.l]?x.r<y.r:bl[x.l]<bl[y.l];});
    int l=1,r=0;
    for(int i=1;i<=m;i++){
        while(l<q[i].l) del(l++);
        while(l>q[i].l) add(--l);
        while(r<q[i].r) add(++r);
        while(r>q[i].r) del(r--);
        if(q[i].op==1) q[i].ans=(s1&(s1<<q[i].x)).any();
        else if(q[i].op==2) q[i].ans=(s1&(s2>>(N-q[i].x))).any();
        else if(q[i].op==3){
            for(int j=1;j*j<=q[i].x;j++){
                if(q[i].x%j) continue;
                q[i].ans=s1[j]&s1[q[i].x/j];
                if(q[i].ans) break;
            }
        }
    }
    sort(q+1,q+m+1,[](Q x,Q y){return x.id<y.id;});
    for(int i=1;i<=m;i++) cout<<(q[i].ans?"hana":"bi")<<endl;
}
signed main(){
    ios::sync_with_stdio(false);
    int t=1;//cin>>t;
    while(t--) subtask();
    return 0;
}
```

::: warn 踩坑

add 那里要写成 `if(bu[a[x]]==1) s1.set(a[x]),s2.set(N-a[x]);` 而不是 `if(bu[a[x]]==1) s1.set(a[x]);s2.set(N-a[x]);` 。delete 函数同理。

:::

### F. Substrings in a String

https://codeforces.com/problemset/problem/914/F

**题目描述**

给定字符串 $s$，多次询问某个字符串 $x$ 在 $s[l:r]$ 中出现了多少次，带修。$|s|,\sum|x|\le 10^5$，时限 6s

**笔记**

bitset 还可以用来乱搞字符串匹配

我们把字符串 $s$ 中的每种字符都开一个 bitset，在 bitset 中记录该字符的出现位置，比如对于字符串 `ababababab`

则 bitset $s_a$ 为 `0101010101`

bitset $s_b$ 为 `1010101010`

（注意字符串最右边的数字是低位）

如果现在有字符串 $y$ `aba` ，我们想知道这个字符串在字符串 $s$ 中出现了多少次，那么我们可以这样：先有一个bitset $ans$ ，初始时该 bitset 中每一位都置为 1。然后我们枚举字符串 $y$ 中的每个字符 $y_i$，再令 $ans\&=(s_{y_i}>>i)$：

| bitset           | 位         |
| ---------------- | ---------- |
| $ans$ 初始时     | 1111111111 |
| $s_a>>0$         | 0101010101 |
| $s_b>>1$         | 0101010101 |
| $s_a>>2$         | 0001010101 |
| $ans$ 按位与之后 | 0001010101 |

然后我们发现，最后得到的 $ans$ 中，有 $1$ 的位置就表示这个位置可以作为字符串 $y$ 起始位置。于是我们看一下有多少个 1，就知道了出现了多少次。时间复杂度 $O(\frac{n\sum |s|}{w})$。如果 $n$ 和 $\sum|s|$ 都是 $10^5$ 级别，那么可以通过这个优化给草过去。相当于优化了暴力。

而本题还给定了区间，对于询问区间 $[l,r]$ （下标为 1 开始），我们取 $ans$ 的区间 $[l,r-|x|+1]$ （区间从右往左看）中的 1 的个数。

```cpp
#include<bits/stdc++.h>
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
#define _ 100005
bitset<_> s[27];//index-1
char str[_];//index-0
inline void subtask(){
    cin>>str;
    for(int i=0;i<strlen(str);i++) s[str[i]-'a'][i+1]=1;
    int m;cin>>m;
    while(m--){
        string ss;
        int op,l,r;cin>>op>>l;
        if(op==1) cin>>ss,s[str[l-1]-'a'][l]=0,str[l-1]=ss[0],s[str[l-1]-'a'][l]=1;
        else{
            cin>>r>>ss;
            bitset<_> ans;ans.set();
            for(int i=0;i<ss.size();i++) ans&=(s[ss[i]-'a']>>i);
            int sum1=(ans>>l).count(),sum2=(ans>>max(r-(int)ss.size()+2,0)).count();
            cout<<max(sum1-sum2,0)<<endl;
        }
    }
}
signed main(){
    ios::sync_with_stdio(false);
    int t=1;//cin>>t;
    while(t--) subtask();
    return 0;
}
```
