@meta

```json
{
	"id": "czoi-online-4",
	"createTime": "2023-08-21 12:25",
	"summary": "本篇文章是举行在2023年7月22日的 CZOI Online #4 的题解",
	"key": ["czoi"]
}
```

::: success 说明
本篇文章是举行在2023年7月22日的 CZOI Online #4 的题解

比赛页：https://www.luogu.com.cn/contest/117584

T1序列：https://www.luogu.com.cn/problem/T351561

T2涂色：https://www.luogu.com.cn/problem/T323309

T3游戏：https://www.luogu.com.cn/problem/T323500

T4中心：https://www.luogu.com.cn/problem/T325767
:::

本次比赛原本是作为CSP考前信心赛的，所以题目并没有出的很难，并且暴力分给的也还可以。

由于出题人在写这篇题解的时候已经有三四月没有碰oi了，所以本篇题解只能粗略的讲一下大致做法并给出std。具体实现希望各位私下再去互相讨论。

## T1 sequence

本题迎面而来的两个西格玛就吓人一跳。不过仔细分析一下发现题目并不是很难理解。

直接打暴力，可以通过subtask0，subtask1可能比较优秀的暴力可以通过。

subtask2不难发现，给出的序列是个回文序列。我们进一步思考这个回文序列有什么特性，会发现对于一个回文序列，对他无论进行多少次操作一和操作二，最后的效果都是一样的。
想到这个特性之后，离正解就差一步。我们发现，一旦任何一个序列执行了第二个操作，就会变成回文序列，转化为subtask2的情况。

至此，正解已经呼之欲出：枚举第一个二操作在哪一次执行。注意特判没有二操作的情况。  
当然，本题更重要的一部分是推石子，如何才能以非常小的复杂度计算出最后要最大化的那个值。这一部分不难，自行推导。

参考代码

```cpp
#include<bits/stdc++.h>
#define _ 100005
#define int long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define ull unsigned long long
#define ll long long
using namespace std;
const int mod=1e9+7;

inline int read(){
	int res=0,ch=getchar(),f=1;
	while(!isdigit(ch) and ch!=EOF){
		if(ch=='-') f=-1;
		ch=getchar();
	}
	while(isdigit(ch)){
		res=(res<<3)+(res<<1)+(ch-'0');
		ch=getchar();
	}
	return res*f;
}

int n,m;
int a[_],s[_],w[_],sub[_],po[_];

inline int copy(int y,int p){
	if(p>m) return y;
	return (po[m-p+1]*y%mod+sub[p])%mod;
}

signed main(){
	//freopen(".in","r",stdin);
	//freopen(".out","w",stdout);
	n=read(),m=read();
	for(int i=1;i<=n;i++) a[i]=read(),s[1]+=a[i],s[1]%=mod;
	for(int i=2;i<=m;i++) s[i]=s[i-1]*2%mod;
	w[1]=n,po[0]=1;
	for(int i=2;i<=m;i++) w[i]=w[i-1]*2%mod;
	for(int i=1;i<=m;i++) po[i]=po[i-1]*2%mod;
	sub[m]=w[m]*s[m]%mod;
	for(int i=m-1;i>=1;i--){
		sub[i]=(po[m-i]*w[i]%mod*s[i]%mod+sub[i+1])%mod;
	}

	int now=0;
	for(int i=1;i<=n;i++){
		now+=(n-i+1)*a[i]%mod,now%=mod;
	}

	int ans=copy(now,1);
	int y=now,len=n,x=s[1];
	for(int i=1;i<=m;i++){
		int tmp=(2*len%mod+1)*x%mod;
		ans=max(ans,copy(tmp,i+1));
		y=(x*len%mod+2*y%mod)%mod;
		x=x*2%mod;
		len=len*2%mod;
	}
	cout<<ans;
	return 0;
}
```

事实上你大概率是看不懂这个代码的，毕竟是推出式子来再写的代码。每个人可能最后计算的思路不同。所以仅供参考。

**小结**

- 本题实际上是来自CCPC2022桂林站的C题，链接：https://codeforces.com/gym/104008/problem/C 。同时也有更官方题解：https://codeforces.com/gym/104008/attachments/download/17654/2022_ccpc_guilin_solution.pdf 。较本题解缺少了一些思路的引导（毕竟参加CCPC的都是大佬）

- 出本题的目的实际上是想告诉大家，真正比赛的时候往往是一眼看不出正解的。你需要根据测试点的特殊性质，一步步去接近正解。这一点在NOIP2022的T1和T2都有所体现。

- 有一些题可能需要挖掘题目中的特殊性质。希望各位在后期的练习中能领悟到这一点。

- 有一些题在解决的过程中需要考虑每个元素的“贡献”。如本题，我们不是直接看 $b_i$ 这个整个的序列，而是考虑每个元素对最后答案的影响，即“贡献”

**相关练习**

部分分引导正解

1. [NOIP2022] 种花 https://www.luogu.com.cn/problem/P8865

2. [NOIP2022] 喵了个喵 https://www.luogu.com.cn/problem/P8866

考虑“贡献”

1. DFS 序 3，树上差分 1 https://loj.ac/p/146

2. DFS 序 4 https://loj.ac/p/147

3. [CSP-S2019 江西] 多叉堆 https://www.luogu.com.cn/problem/P5689

4. [NOIP2021] 数列 https://www.luogu.com.cn/problem/P7961

## T2 paint

参加过NOI春季测试的同学可能一眼发现这个题和这场比赛的T1非常相似。实际上本题可以视为那个题的加强版，原题的做法无法解决本题。

说句题外话，当时出题人本人就在考场上把那个题看成了这个题，而且加上某个地方细节出了问题，调了2.5h最后又因为燕山大学电脑的fc有问题，导致自以为没通过大样例。比赛快结束的时候最后无奈又加了个暴力，然后一紧张特盘判反了，导致与暴力同分。并且本题浪费了2.5h导致整个比赛节奏打乱，最后与一等无缘。希望大家吸取教训。

首先本题的数据输入有点复杂。聪明人应该学会直接把下发文件中的show.cpp中的代码借用过来。

暴力可以通过subtask0，获得10pts。

对于subtask1，可以使用线段树区间推平。这个应该是课上讲过的，不会的需要反思了。

实际上还有一种方法解决这种区间推平问题。我个人将其称之为“并查集快速跳过”，这个应该也是课上讲过的。当时有道例题：

P2391 白雪皑皑 https://www.luogu.com.cn/problem/P2391

这个题就是本题思路的一个来源。

各位没做过这道题的可以先做这道题，然后再继续往下看。

然后subtaks2就是二维的情况。

实际上二维情况就是多个一维，所以将一个操作拆分成若干个单行操作，循环行数，即“一行一行的涂”即可。

但很显然这个题没有这么简单。比如如果只有一列，有若干行，上述方法和暴力没有区别。所以我们判断，如果行数多就一列一列地涂，如果列数多就一行一行地涂。这样复杂度就降下来了。并且因为行数和列数的乘积，即格子的个数受到限制，所以“枚举”这一操作，最多要循环 $\sqrt{n\times m}$ 次行或者列。为了做到这一点，还需要维护一个并查集。

此外，在验题的时候，仍然倒序操作，开一个数组，记录当前方格指向的下一个没有涂色的方格，然后暴力涂色，但涂完就跳到下一个没有涂色的方格，而不是再一个一个判断。这种做法和并查集做法的区别在于这种做法没有路径压缩，因此可以被特殊构造的数据卡过去，因此就有了本题十分变态的数据读入。

参考代码：

```cpp
#include<bits/stdc++.h>
#define _ 10000007
using namespace std;

inline int read(){
	int res=0,ch=getchar(),f=1;
	while(!isdigit(ch) and ch!=EOF){
		if(ch=='-') f=-1;
		ch=getchar();
	}
	while(isdigit(ch)) res=(res<<3)+(res<<1)+(ch-'0'),ch=getchar();
	return res*f;
}

struct DataMaker{
	int n,m,q=0,A,B,C,D,E,F,G,H,T,J[5],K=5;
	DataMaker(int _n,int _m,int a,int b,int c,int d,int e,int f,int g,int h,int t){T=t,n=_n,m=_m,A=a,B=b,C=c,D=d,E=e,F=f,G=g,H=h;}
	inline int read(){
		if(K<=4) return J[K++];
		else{
			if(q<T) q++,J[1]=((A*q+B)%n+n)%n+1,J[2]=((B*q+A)%m+m)%m+1,J[3]=((C*q+D)%n+n)%n+1,J[4]=((D*q+C)%m+m)%m+1,K=1;
			else q++,J[1]=((E*q+F)%n+n)%n+1,J[2]=((F*q+E)%m+m)%m+1,J[3]=((G*q+H)%n+n)%n+1,J[4]=((H*q+G)%m+m)%m+1,K=1;
			return J[K++];
		}
	}
};

struct U{
	int fa[_],n;
	void init(int nn){n=nn;for(int i=1;i<=n;i++) fa[i]=i;}
	inline int find(int x){while(x!=fa[x]) x=fa[x]=fa[fa[x]];return x;}
}u1,u2;
struct O{int x1,y1,x2,y2,c;} qq[_];
int n,m,q,ans[_];

inline int ax2n(int x,int y){
	if(x>n||y>m) return 0;
	return (x-1)*m+y;
}
inline int n2x(int x){
	if(x%m) return x/m+1;
	else return x/m;
}
inline int n2y(int x){
	if(x%m) return x%m;
	else return m;
}

inline void paint1(int x,int l,int r,int c){
	int np=u1.find(ax2n(x,l));
	if(np==0) return;
	int nx=n2x(np),ny=n2y(np);
	while(ny<=r){
		ans[np]=c;
		u1.fa[u1.find(np)]=u1.fa[u1.find(ax2n(nx,ny+1))];
		u2.fa[u2.find(np)]=u2.fa[u2.find(ax2n(nx+1,ny))];
		if(ny==r) break;
		ny++;
		np=u1.find(ax2n(nx,ny));
		if(np==0) break;
		ny=n2y(np);
	}
}

inline void paint2(int x,int l,int r,int c){
	int np=u2.find(ax2n(l,x));
	if(np==0) return;
	int nx=n2x(np),ny=n2y(np);
	while(nx<=r){
		ans[np]=c;
		if(nx==r){
			u1.fa[u1.find(np)]=u1.fa[u1.find(ax2n(nx,ny+1))];
			u2.fa[u2.find(np)]=u2.fa[u2.find(ax2n(nx+1,ny))];
			break;
		}
		u1.fa[u1.find(np)]=u1.fa[u1.find(ax2n(nx,ny+1))];
		u2.fa[u2.find(np)]=u2.fa[u2.find(ax2n(nx+1,ny))];
		nx++;
		np=u2.find(ax2n(nx,ny));
		if(np==0) break;
		nx=n2x(np);
	}
}

void subtask(){
	n=read(),m=read(),q=read();
	int A=read(),B=read(),C=read(),D=read(),E=read(),F=read(),G=read(),H=read(),T=read();
	DataMaker obj(n,m,A,B,C,D,E,F,G,H,T);
	for(int i=1;i<=q;i++){
		int x1=obj.read(),y1=obj.read(),x2=obj.read(),y2=obj.read();
		if(x1>x2) swap(x1,x2);
		if(y1>y2) swap(y1,y2);
		qq[i].x1=x1,qq[i].y1=y1,qq[i].x2=x2,qq[i].y2=y2,qq[i].c=i;
	}
	u1.init(n*m),u2.init(n*m);
	for(int i=q;i>=1;i--){
		int x1=qq[i].x1,y1=qq[i].y1,x2=qq[i].x2,y2=qq[i].y2,c=qq[i].c;
		if(x2-x1<y2-y1) for(int j=x1;j<=x2;j++) paint1(j,y1,y2,c);
		else for(int j=y1;j<=y2;j++) paint2(j,x1,x2,c);
	}

	for(int i=1;i<=n;i++){
		for(int j=1;j<=m;j++){printf("%d ",ans[ax2n(i,j)]);}
		printf("\n");
	}

}

signed main(){
	//freopen("paint.in","r",stdin);
	//freopen("paint.out","w",stdout);
	int t=1;
	while(t--) subtask();
	return 0;
}
```

**小结**

1. 本题实际上难度要大于T3。比赛难度不是严格的升序排列在CSP2022和NOIP2022中均有所体现，希望各位能注意到这点。不过有一点我想应该是不变的：最后一题肯定是最难的。当然有可能2023年打脸了。

2. 希望各位能吸取我春季测试时的教训。多读题，不要把题目想复杂了。

3. 本题涉及到并查集跳过的思想，这个比较常见，后面又给了例题各位可以再去体会体会。还有涉及到询问的倒序处理，即将询问或者操作离线下来。这个手法也是比较常见，尤其是在最小生成树那里。本题最后还涉及到一种和根号有关的优化，也不知道能不能称为“根号分治”，总之还是希望各位能学习一下这种思想。

4. 本题还反映了各位的听课效果。实际上本题涉及到的并查集快速跳过和线段树区间推平都是课上讲过的。如果你忘记了，真的要反思一下。

5. 下发文件中如果有cpp文件，其中的代码有时可能会对解题有所帮助，虽然noip和csp基本没下发过几次cpp文件。

**相关练习**

并查集快速跳过的又一个模板题

1. Knight Tournament https://www.luogu.com.cn/problem/CF356A

将询问/操作倒序处理

1. [USACO18JAN] MooTube G https://www.luogu.com.cn/problem/P4185

并查集用来跳过的思想

1. [HEOI2016/TJOI2016] 树 https://www.luogu.com.cn/problem/P4092

2. 「WHOI-2」彗星蜜月 https://www.luogu.com.cn/problem/P8431 （这一题中的某一步也可以用类似的，当然常数大了亿些，而且不是正解）

## T3 game

首先本题的“概率”的输入方式可能就对一些人产生了疑惑。对分数取模，实际上就是分子乘上分母的逆元。如果你逆元没学好，本题直接寄。

首先注意，是两人相差 $d$，可以是Caiwen多也可以是明陌多。

然后考虑Caiwen最多能有多少卡片（考虑明陌也是同理）

我们设某一局时，Caiwen有 $x$ 个卡片，明陌有 $y$ 张卡片，则有 $x+y=m+n$

当Caiwen比明陌多 $d$ 张卡片使游戏结束时，$x-y=d$ 解得 $x=(m+n+d)/2$，将这个值记为 $up$

当明陌比Caiwen多 $d$ 张卡片使游戏结束时，$y-x=d$ 解得 $x=(m+n-d)/2$，将这个值记为 $down$

上面算出来的两个 $x$ 值分别是Caiwen手上最多拥有和最少拥有的卡片，同时也是游戏结束时的条件

这时候我们可以有个特判：当 $m+n+d$ 不能被2整除时，上述式子没有整数解。这种情况直接输出0，出题人好心，特意放置了几个为0的测试点，这样做可以得到15pts。当我们在比赛的时候，对于题目的特殊情况最好特判，一方面我们可以保证这些分数是稳拿的，另一方面，我们自己想出来的“正解”可能遗漏了特殊情况。

因为本题的每一局就相当于dp的每一阶段，所以非常明显能看出使用dp

我们设状态 $dp[i][j]$ 表示第 $i$ 局，Caiwen手上的卡片数量为 $j$ 时的概率。

注意这里我们不设状态 $dp[i][j]$ 表示第 $i$ 局，Caiwen和明陌手上的卡片数量相差为 $j$ 时的概率。这样设计也可以，但是有可能 $j$ 为负数，我们需要把所有的 $j$ 加上一个固定的偏移量，但这样做非常容易错，所以不建议。

开始时有 $dp[1][n]=1$

答案为 $dp[N][up]+dp[N][down]$

转移方程 $dp[i][j]=(dp[i-1][j]\times p_0)+(dp[i-1][j+1]\times p_2)+(dp[i-1][j-1]\times p_1)$

本题还有一些易错的地方

- 注意不能转移一些状态。比如 $dp[i][down/up]$ 的状态是不能被转移的，因为已经满足了游戏结束的条件了

- 注意本题的空间限制。直接 `int dp[6000][12003];` 是不行的。这时我们发现，每次的状态转移只跟上一个阶段的状态有关，和再往前的状态无关，所以我们考虑 01滚动数组优化

参考代码

```cpp
#include<bits/stdc++.h>
#define int long long
using namespace std;
const int mod=1000000007;

inline int qpow(int a,int p,int res=1){for(;p;p>>=1,a=a*a%mod) if(p&1) res=res*a%mod;return res;}
int N,n,m,p0,p1,p2,d;
int up,down;
int dp[2][12003];

signed main(){
	cin>>N>>n>>m>>p0>>p1>>p2>>d;
	if((m+n+d)&1){
		cout<<0;
		return 0;
	}
	int up=(n+m+d)/2,down=(n+m-d)/2;
	int now=0;
	dp[now][n]=1;
	for(int i=1;i<=N;i++){
		for(int j=0;j<=m+n;j++){
			dp[1-now][j]=0;//别忘了清空！
			if(j+1<=m+n&&j+1!=up&&j+1!=down) dp[1-now][j]+=dp[now][j+1]*p2%mod;dp[1-now][j]%=mod;
			if(j!=up&&j!=down) dp[1-now][j]+=dp[now][j]*p0%mod;dp[1-now][j]%=mod;
			if(j-1>=0&&j-1!=up&&j-1!=down) dp[1-now][j]+=dp[now][j-1]*p1%mod;dp[1-now][j]%=mod;
		}
		now=1-now;
	}
	cout<<(dp[now][up]+dp[now][down])%mod;
	return 0;
}
```

顺便一提 01滚动数组优化，可能有人不知道。如上述代码，一开始 `now=0`，当你 `now=1-now` 后，`now=1`，再来一遍 `now=1-now`，`now=0`，这样就实现了数组的来回切换。这是一个很常见的技巧。

**小结**

1. 本题实际上是dp里面非常套路的题目，没有什么难度。考虑到各位可能没怎么做过概率dp，所以就出了一道。如果你没有做出来这个题，说明你对dp的理解还比较欠缺。

2. 本题的细节比较多，需要注意状态转移时的”边界“

3. 注意特判掉一些特殊情况

4. 注意dp的一些常见优化（当然单调队列优化，斜率优化这些省选内容没有时间就不要琢磨了）

**相关练习**

一道也是比较老套的期望dp

1. [蓝桥杯 2022 省 A] 爬树的甲壳虫 https://www.luogu.com.cn/problem/P8774

本题其实最开始想考察dp时，如果数组的下标可以取负数，此时就要加上一个”固定值“把下表变成正的。上述题解提了一嘴。下面是与此相关的一些题目。其中第二题涉及到”同余“，感兴趣的还可以了解一下”同余最短路“

2. P1282 多米诺骨牌 https://www.luogu.com.cn/problem/P1282

3. P1356 数列的整除性 https://www.luogu.com.cn/problem/P1356

4. Jury Compromise https://www.luogu.com.cn/problem/UVA323

一道01滚动数组优化的题目

5. FAOI-R1【A】Program of ln(x) 2025 https://www.luogu.com.cn/problem/T269289

说起dp优化，这里我再推荐一个题，当然这个题拿满分还是比较困难的。我想说的不是这个题的正解，而是这个题的部分分

这个题前6个点的dp是不难想的（这都想不出来那说明你真的不会dp），然后你发现有一维是没必要的，于是就去掉了，可以通过前9个点。当然你一上来就想到了这一步也没关系。

重点是10-16这一部分，用到了一个类似于”单调性“的性质优化dp，因为你发现状态的转移具有单调性。这个具体可以自己去看洛谷上的题解。

当然这个题正解就没必要考虑了，拿到64分就非常好了。

6. [CSP-S2019] 划分 https://www.luogu.com.cn/problem/P5665

紧接着我又想到了一个题，这个题的dp优化也是比较值得学习的。不过这道题一上来你需要能看出”一半“这个条件能给这道题带来什么特殊性质。实际上，如今的信竞题往往都需要根据题目的各种信息推出特殊性质，如同本场比赛的T1一样。

7. [CSP-S2019] Emiya 家今天的饭 https://www.luogu.com.cn/problem/P5664

## T4 center

首先本题实际上是树的中心的模板题。在一本通的提高篇树形dp一节中有讲。  
具体解法参考：

https://www.caiwen.work/index.php/2022/11/22/326/

树的中心一节。

:::info 链接失效说明
由于本博客经过多次迁移，上面的链接已经不可用。你可以尝试在本博客中搜索“树的中心”来找到相应的文章。
:::

如果你学树形dp的时候没见过这个东西，那说明你算法学的还不够详细。在我的博客中有一些noip前写的笔记，上面的内容我认为是比较全的，各位有时间可以去看一下，发现有没学过的点一定要去学，这些笔记没有多余的内容，都是noip会考到的。由于这些笔记是给自己看的，所以有些地方你可能看不懂，因此这些笔记最重要的是目录。可以结合本笔记和百度来学习。

虽然这一题是个模板题，但各大oj上都没有相应可以评测的地方。acwing上有，但是是收费题目。所以就自己造了数据，出了一个这种题。

你可能想要喷出题人竟然出了这么经典的原题，还放到T4。实际上NOIP2022的T4也是原题，所以出原题并且放在T4就合情合理了起来。

实际上你没学过树的中心，本题的dp思路也是比较好的，但就是不好想到。

**小结**

1. noip和csp小概率会出原题，如noip2022。实际上noip2021的t3与codeforces上的一个题用到的结论类似。不过广泛刷题对大家来说要求较高。反正建议各位最起码看看题解，知道题大概怎么做，万一2023年又出原题了呢。

2. 菊花图和链形的图是图论中两个经典的部分分，这两个特殊情况请各位务必在时间允许的情况下拿到分数。
