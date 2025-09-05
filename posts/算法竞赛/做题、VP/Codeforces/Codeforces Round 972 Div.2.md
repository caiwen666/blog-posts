@meta

```json
{
	"id": "cf972-2",
	"createTime": "2024-09-25 21:25",
	"summary": "Codeforces Round 972 Div.2总结，A、B1+B2、C、D、E1",
	"key": ["codeforces", "cf", "972", "div2"],
	"tags": [{ "value": "未补完", "color": "error" }],
	"background": "https://www.caiwen.work/wp-content/uploads/2024/09/未命名4.jpg"
}
```

## CF2005A

一开始太着急，直接猜结论是不断输出aeiou，写完交了一波结果样例都没过，挂大分了（），下回不能这么着急了。

如果不断输出aeiou的话，比如 $n=6$，会输出 `aeioua`，此时两个 `a` 及中间任何一个字符都能组成一个回文串，对答案贡献太多了，显然不是最优的。

再观察样例，不难发现，如果我们让相同字母都挨在一起，就不会出现上述情况了，于是构造方案就诞生了：先输出aeiou，如果 $n$ 还大的话就让相同字母挨在一起，比如 $n=6$ 时输出 `aaeiou` ，$n=12$ 时输出 `aaaeeeiioouu`。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
const int mod=0;
typedef pair<int,int> pii;
inline void subtask(){
	int n;cin>>n;
	int now=1;
	int t=n/5;
	int r=n%5;
	for(int i=1;i<=5;i++){
		char c;
		if(i==1) c='a';
		else if(i==2) c='e';
		else if(i==3) c='i';
		else if(i==4) c='o';
		else c='u';
		for(int i=1;i<=t;i++) cout<<c;
		if(r) cout<<c,r--;
	}
	cout<<endl;
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2005B1+B2

感觉比第一题简单。

先考虑 B1，发现只需要分类讨论即可。设两个老师初始位置为 $l$ 和 $r$。

- 如果 David 位于两个老师的两侧且靠近 $1$ 的一侧，那么 David 一直往 $1$ 那边走就可以了。答案就为 $l-1$
- 如果 David 位于两个老师的两侧且靠近 $n$ 的一侧，那么 David 一直往 $n$ 那边走就可以了。答案就为 $n-r$
- 如果 David 位于两个老师的中间，那么 David 一直走到中间位置，然后等待老师来抓就好了（再乱动的话只会让被抓的时间变短），答案为 $\left \lfloor \frac{l+r}{2} \right \rfloor - l$

值得注意的是，题目输入的两个老师的位置不一定第一个比第二个小。因为这个第一次提交又wa了，还以为做法假了，耽误了不少时间。

再考虑 B2，考虑完 B1 ，B2就很显然了。不难发现如果我们被两个老师夹在中间，那么我们基本是逃不出去了，只能跑到中间静等老师来抓，这样才能尽可能拖延时间。我们使用二分，找出我们被哪两个老师加在中间即可。如果位于最左侧/最右侧，同上述，往 $1$ 或 $n$ 方向走就可以了。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
#define _ 100005
using namespace std;
const int mod=0;
typedef pair<int,int> pii;
int a[_];
inline void subtask(){
	int n,m,q;cin>>n>>m>>q;
	for(int i=1;i<=m;i++) cin>>a[i];
	sort(a+1,a+m+1);
	for(int i=1;i<=q;i++){
		int x;cin>>x;
		int l=-1,r=-1;
		int p=upper_bound(a+1,a+m+1,x)-a;
		if(p<=m) r=p;
		if(p!=1) l=p-1;
		if(l==-1){
			cout<<a[r]-1<<endl;
		}else if(r==-1){
			cout<<n-a[l]<<endl;
		}else{
			int mid=(a[l]+a[r])>>1;
			cout<<mid-a[l]<<endl;
		}
	}
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2005C

开始冒汗了（）

首先我们设所选字符串中包含的 narek 总共有 $sum$ 个。Narek 共获得了 $s$ 分，那么 $ChatGPT$ 一定获得了 $sum-s$ 分。于是转化为最大化 $2s-sum$。

凭感觉觉得题目有点像dp，试一试

设 $dp[i][j][k]$ 表示选定了第 $i$ 行第 $j$ 个字符，匹配到了 `narek` 的第 $k$ 个字符，获得的最大收益。我们最后只需要找出所有 $dp[i][j][5]$ 中的最大收益即可。

因为我们只关心 narek ，不妨设 $w_i$ 为第 $i$ 行有多少个 narek这些字符。

考虑转移方向。有两个情况，从本行转移和从之前的某一行转移，后者意味着当前的字符是本行选中的第一个字符，也意味着在转移的时候 dp 值要减去当前行的 $w_i$。

由于我们只有把 narek 五个字符都匹配完才能得到 $5$ 分，所以只有当前字符为 `k` 且成功从别的位置转移过来，才会给 dp 值加上 $10$（注意dp值表示的是当前的 $2s-sum$）

然后考虑转移，如果当前枚举到的位置的字符为 `n` ，那么只能从 $k=5$ 转移（前面已经选了若干个 narek，从这个字符开始继续选新的 narek）或者初始化 dp 值为 $-w_i$（自己作为所有选中字符中的第一个字符）。如果为 `a` ，只能从 $k=1$ 转移。如果为 `r` ，只能从 $k=2$ 转移。以此类推。

直接转移的话，我们需要枚举本行之前（不包括本行）的所有dp值，找出最大的那个，以及枚举本行当前位置之前的所有dp值，找出最大的那个。暴力转移时间复杂度显然是爆炸的。不过我们只关心最大值，所以对于每个 $k$ 值都维护一个最大值就好了。这样一来，dp数组甚至都可以不用开。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
const int mod=0;
const int inf=0x3f3f3f3f3f3f3f3f;
typedef pair<int,int> pii;
inline int get(char c){
	if(c=='n') return 1;
	else if(c=='a') return 2;
	else if(c=='r') return 3;
	else if(c=='e') return 4;
	else if(c=='k') return 5;
	else return -1;
}
int w[1003];
int ch[1003][1003];
inline void subtask(){
	int bef[6]={-inf,-inf,-inf,-inf,-inf,-inf};
	int n,m;cin>>n>>m;
	for(int i=1;i<=n;i++){
		string str;cin>>str;
		w[i]=0;
		for(int j=0;j<m;j++){
			ch[i][j+1]=get(str[j]);
			if(get(str[j])!=-1) w[i]++;
		}
	}
	int ans=0;
	for(int i=1;i<=n;i++){
		int now[6]={-inf,-inf,-inf,-inf,-inf,-inf};
		for(int j=1;j<=m;j++){
			int k=ch[i][j];
			if(k==-1) continue;
			int maxx=-inf;
			if(k==1){
				maxx=-w[i];
				if(now[5]!=-inf){
					maxx=max(maxx,now[5]);
				}
				if(bef[5]!=-inf){
					maxx=max(maxx,bef[5]-w[i]);
				}
			}else{
				if(now[k-1]!=-inf){
					maxx=max(maxx,now[k-1]);
				}
				if(bef[k-1]!=-inf){
					maxx=max(maxx,bef[k-1]-w[i]);
				}
			}
			if(maxx!=-inf){
				if(k==5){
					maxx+=10;
					ans=max(ans,maxx);
				}
				now[k]=max(now[k],maxx);
			}
		}
		for(int j=1;j<=5;j++){
			bef[j]=max(bef[j],now[j]);
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

/*
4
5 2
nn
aa
rr
ee
kk
*/
```

## CF2005D

赛时打完C还剩30min，而且D才几百人通过，直接摆烂了（）

后面各种看题解才搞懂了这个题。总的来说这个题也不是很难感觉。

首先达成共识，gcd是能合并的。也就是 $gcd(a,b,c)=gcd(gcd(a,b),c)$，类似于取大和取小函数的性质。这意味着我们可以用线段树、st表等数据结构去维护他。

再达成共识：给定一个序列，求这个序列所有的前缀gcd，这个前缀gcd的取值肯定是单调不增的，且取值不会很多。如果序列的值域为 $A$，那么前缀gcd的种类大概是 $logA$ 数量级的。

下面我们定义 $gcd([a,b])$ 为区间 $[a,b]$ 内所有数取gcd。

我们先考虑相同的交换方法，我们选取了区间 $[L_1,R_1]$ 准备交换，和选取 $[L_2,R_2]$ 准备交换，什么时候这两种交换方法是本质相同的呢？我说，如果 $gcd([1,L_1-1])$ 和$gcd([1,L2-1])$ 相同，且 $gcd([L_1,R_1])$ 和 $gcd([L_2,R_2])$ 相同，且 $gcd([R_1+1,n])$ 和 $gcd([R_2+1,n])$ 相同。这三个条件同时满足，那么这两个交换是等价的。

通过第二个共识，我们知道 $gcd$ 的种类不会很多。

我们直接考虑去枚举要交换的区间 $[L,R]$ 。直接枚举肯定会t，但先别着急，慢慢来，我们先枚举左端点 $L$。然后我们把左端点右侧的区域分成若干段。

![](https://www.caiwen.work/wp-content/uploads/2024/09/image-20240924204233070.png)

我们需要保证，落在同一段的 $R$ 满足交换区间 $[L,R]$ 是本质相同的（关于本质相同的说法刚说过）。还是那句话， $gcd$ 的种类不会很多，所以你感性上就能感觉出来，我们不会分太多的段。对于每一段，我们既可以统计能得到的最大 $gcd_a+gcd_b$，也能统计得到这个最大值的方案数。

问题的关键在于如何去分段，直接暴力分显然不妥。我们可以考虑用二分去分段。

中间可能涉及到如何快速得到某段区间的gcd值，直接用st表或者线段树维护即可（线段树可能复杂度有点大，可能会t一点）

参考代码：

```cpp
#include<bits/stdc++.h>
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define ll long long
#define debug(x) cout<<#x<<"="<<x<<endl
#define _ 500005
using namespace std;
//const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
int a[_],b[_],n,lg[_],sta[_][20],stb[_][20];
inline int gcd(int x,int y){
	if(!x||!y) return x+y;
	while(x%y){
		int t=x%y;
		x=y;
		y=t;
	}
	return y;
}
void build(int st[_][20],int arr[]){
	for(int i=1;i<=n;i++) st[i][0]=arr[i];
	for(int i=1;i<=lg[n];i++){
		for(int j=1;j<=n-(1<<i)+1;j++){
			st[j][i]=gcd(st[j][i-1],st[j+(1<<(i-1))][i-1]);
		}
	}
}
int query(int st[_][20],int l,int r){
	if(l>r) return 0;
	int k=lg[r-l+1];
	return gcd(st[l][k],st[r-(1<<k)+1][k]);
}
inline void subtask(){
	cin>>n;
	for(int i=1;i<=n;i++) cin>>a[i];
	for(int i=1;i<=n;i++) cin>>b[i];
	build(sta,a);build(stb,b);
	int ans=query(sta,1,n)+query(stb,1,n);
	ll cnt=0;
	for(int L=1;L<=n;L++){
		int R=L,lasa1=a[L],lasb1=b[L],lasa2=query(sta,L+1,n),lasb2=query(stb,L+1,n);
		while(R<=n){
			int l=R,r=n,res;
			while(l<=r){
				int mid=(l+r)>>1;
				if(
					query(sta,L,mid)==lasa1&&
					query(stb,L,mid)==lasb1&&
					query(sta,mid+1,n)==lasa2&&
					query(stb,mid+1,n)==lasb2
				){
					res=mid;
					l=mid+1;
				}else r=mid-1;
			}
			int gcda=gcd(gcd(query(sta,1,L-1),query(stb,L,res)),query(sta,res+1,n));
			int gcdb=gcd(gcd(query(stb,1,L-1),query(sta,L,res)),query(stb,res+1,n));
			if(gcda+gcdb>ans) ans=gcda+gcdb,cnt=res-R+1;
			else if(gcda+gcdb==ans) cnt+=res-R+1;
			R=res+1;
			lasa1=query(sta,L,R);
			lasb1=query(stb,L,R);
			lasa2=query(sta,R+1,n);
			lasb2=query(stb,R+1,n);
		}
	}
	cout<<ans<<" "<<cnt<<endl;
}
signed main(){
	for(int i=2;i<=500000;i++) lg[i]=lg[i>>1]+1;
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2005E1

赛时看了一眼，结合他是E题就感觉应该是做不出来了。实际上这个题比D还简单。通过人数果然是真能反应题目难度的。

看到博弈脑子就短路了（）打算后面搞个博弈专题。

这道题需要dp+博弈，感觉有点熟悉。

$dp[l][i][j]$ 表示序列 $a$ 中选到了第 $l$ 个数，选到了左上角为 $(i,j)$ 右下角为 $(n,m)$ 的矩阵，这种情形下是否有必胜策略。

首先肯定的一点，如果 $b_{i,j} \neq a_l$ 的话，那么肯定是没有必胜策略的，dp值为0。

反之，我们继续考虑，如果 $dp[l+1][i+1...n][j+1...m]$ 存在必胜策略，那么 $dp[l][i][j]$ 必然没有必胜策略（因为你选完之后，下一回合对手就能有必胜策略了）。如果这些位置都没有必胜策略，那么当前的 $dp[l][i][j]$ 就有必胜策略了。

倒着dp，直接转移时间复杂度爆炸，使用二维前缀和优化即可。

```cpp
#include<bits/stdc++.h>
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
//const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
int l,n,m,a[303],b[303][303],sum[303][303][303],dp[303][303][303];
inline void subtask(){
	cin>>l>>n>>m;
	for(int i=1;i<=l;i++) cin>>a[i];
	for(int i=1;i<=n;i++){
		for(int j=1;j<=m;j++) cin>>b[i][j];
	}
	for(int k=l;k>=1;k--){
		for(int i=n;i>=1;i--){
			for(int j=m;j>=1;j--){
				if(b[i][j]==a[k]){
					if(k==l){
						dp[k][i][j]=1;
					}else{
						if(j==m||i==n){
							dp[k][i][j]=1;
						}else if(!sum[k+1][i+1][j+1]){
							dp[k][i][j]=1;
						}
					}
				}
				sum[k][i][j]=sum[k][i+1][j]+sum[k][i][j+1]-sum[k][i+1][j+1]+dp[k][i][j];
			}
		}
	}
	int ans=0;
	for(int i=1;i<=n;i++){
		for(int j=1;j<=m;j++){
			if(dp[1][i][j]){
				ans=1;
				break;
			}
		}
	}
	if(ans) cout<<"T"<<endl;
	else cout<<"N"<<endl;
	for(int i=1;i<=l;i++){
		for(int j=1;j<=n;j++){
			for(int k=1;k<=m;k++) dp[i][j][k]=0,sum[i][j][k]=0;
		}
	}
}
signed main(){
	//cout<<sizeof(sum)/1024/1024<<endl;
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2005E2

mlgb，看了一圈题解和讲解视频，一个都没看懂，摆了，有机会再补吧。
