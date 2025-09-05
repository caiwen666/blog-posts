@meta

```json
{
	"id": "cf975-2",
	"createTime": "2024-10-23 23:51",
	"summary": "Codeforces Round 975 Div.2总结，A、B、C、D、E、F",
	"key": ["codeforces", "cf", "975", "div2"],
	"background": "https://www.caiwen.work/wp-content/uploads/2024/10/未命名4.jpg"
}
```

赛时切4个，再上大分

## CF2019A

主观难度：普及-

标签：贪心

显然总共有两种选法，一种是选所有偶数格子，一种是选所有奇数格子。这两种选法中一定存在一种选法可以把最大值选到。当总数为偶数时，两种选法能选到的格子数量相同，再选择能把最大值选到的选法就能得到最大答案。总数为奇数时，选所有奇数格子比选所有偶数格子能选到的格子数量多一个。如果选所有奇数格子能把最大值选到，那么就是最优的。反之，选所有偶数格子，虽然选到的格子数量少一个，但最大值比次大值至少大一，所以就把亏的部分补回来了。综上，把最大值选上是最优的。注意如果有多个最大值，显然选择位于奇数位置的最大值更好一些。

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
	int n;cin>>n;
	int maxx=-inf,index;
	for(int i=1;i<=n;i++){
		int x;cin>>x;
		if(x>maxx){
			maxx=x;
			index=i;
		}else if(x==maxx){
			if(i%2){
				index=i;
			}
		}
	}
	if(n%2==0){
		cout<<maxx+n/2<<endl;
	}else{
		if(index%2){
			cout<<maxx+n/2+1<<endl;
		}else{
			cout<<maxx+n/2<<endl;
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

## CF2019B

主观难度：普及/提高-

标签：map、组合计数

容易发现，有很多点，被穿过线段数量是相同的。具体的，比如 $(x_i,x_{i+1})$ 区间内的点，被穿过线段数量是相同的（注意是开区间，端点处的情况我们再谨慎讨论），而且不难计算出数量为 $i\times(n-i)$，共有 $x_{i+1}-x_i-1$ 个点。考虑到这样算出来的数量不多，所以开个map。对于这种情况，$mp[i\times(n-i)]+=x_{i+1}-x_i-1$。然后考虑端点处，点 $x_i$ 被穿过线段数量为 $i\times(n-i+1)-1$ （左边能选 $i$ 个点，右边能选 $n-i+1$ 个点（注意第 $i$ 个点，即区间左端点也能再选），但是这样的话会出现左右两边都选第 $i$ 个点的情况，所以再减一。这种情况下，$mp[i\times(n-i+1)-1]++$。

然后对于每个询问，直接从 map 取就好了。

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
inline void subtask(){
	int n,q;cin>>n>>q;
	unordered_map<int,int> mp;
	int las;
	for(int i=1;i<=n;i++){
		int x;cin>>x;
		if(i==1||i==n){
			mp[n-1]=mp[n-1]+1;
		}else{
			int now=i*(n-i+1)-1;
			mp[now]=mp[now]+1;
		}
		if(i!=1){
			int l=i-1;
			int r=n-l;
			int now=l*r;
			mp[now]=mp[now]+x-las-1;
		}
		las=x;
	}
	for(int i=1;i<=q;i++){
		int x;cin>>x;
		cout<<mp[x]<<" ";
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

## CF2019C

主观难度：普及/提高-

标签：贪心

我们设 $x$ 为分的堆数，$y$ 为每个堆中牌的数量，$xy$ 即为包含的总牌数。再设初始时牌数为 $sum$，某个类型最大的牌数为 $maxx$（$maxx=max(a_1,a_2,...,a_n)$）。首先有个性质，假如我们不受 $k$ 的限制，可以任意加牌，我们在确定了 $x$ 和 $y$ 之后，发现还差点牌（即 $xy>sum$），那么是一定可以补上，且仍保持每堆中牌类型各不相同。

显然，$sum\le xy\le sum+k$。$maxx\le x$（因为同一个堆中不能有相同的牌，所以相同类型的牌一定是要放到不同的堆）。

题目即要求我们求出 $y$ 的最大值。其实检查一个答案是否合法的时间复杂度并不高，所以我们考虑从大到小枚举 $y$。对于给定的 $y$，$x$ 是有范围的，为 $\left \lceil \frac{sum}{y} \right \rceil \le x \le \left \lfloor \frac{sum+k}{y} \right \rfloor$，再加上 $maxx\le x$，两个范围叠加上去，如果 $x$ 有解，那么当前枚举的 $y$ 是合法的。

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
inline void subtask(){
	int n,k;cin>>n>>k;
	int maxx=-inf;
	int sum=0;
	for(int i=1;i<=n;i++){
		int x;cin>>x;
		maxx=max(maxx,x);
		sum+=x;
	}
	for(int i=n;i>=1;i--){
		int fl=ceil(1.0*sum/i);
		int fr=floor(1.0*(sum+k)/i);
		if(fl>fr) continue;
		if(maxx<=fr){
			cout<<i<<endl;
			break;
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

## CF2019D

主观难度：普及+/提高

标签：前缀和、二分、差分

比 E 难，赛时感觉做不出来就摆烂了，后面又自己想出来了。

首先有一点，如果点 $i$ 的时间限制为 $t_i$，那么与 $i$ 距离大于 $t_i$ 的点都不会是有获胜策略的点。通过这一点我们就可以先排除一部分点。

然后我们考虑只判断一个点该怎么做。我们贪心地考虑，肯定先左右寻找 $t$ 最小的点，然后一直沿着这个点的方向占领，直到占领了这个点，然后再寻找下一个最小的点，沿着对应的方向占领，以此类推。因为我们很自然地想去先把当前最棘手的点先处理掉，不那么棘手的点之后再处理。

然后我们就又得到一个结论，对于两个点 $x$ 和 $y$，如果 $x$ 和 $y$ 之间点的数量（包括$x$ 和 $y$）大于 $max(t_x,t_y)$，那么这两个点之间的所有的点都不会是有必胜策略的点。可以按照上述的贪心策略证明。这中间的点，肯定会先去占领 $x$ 和 $y$ 中 $t$ 最小的那个，占领完毕后再去占领另一个，此时中间所有的点都被占领了，但是耗费时间却大于另一个点的 $t$ 值，无法占领另一个点。

我们考虑枚举 $x$ 和 $y$。考虑枚举两者之间 $t$ 值最大的那个，记为 $x$，然后分别在 $[1,x-t_x]$ 和 $[x+t_x,n]$ 中寻找距离 $x$ 最远的且小于等于 $t_x$ 的点 $y$，然后 $x$ 和 $y$ 之间所有的点都标记为无必胜策略的点。其中，寻找 $y$ 可以通过搞前缀和后缀最小值+二分解决。标记无必胜策略点可以通过差分来解决。

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
#define _ 200005
typedef pair<int,int> pii;
int tag[_],in[_],pre[_],suf[_];
inline void push(int l,int r){tag[l]++,tag[r+1]--;}
inline void subtask(){
    int n;cin>>n;
    for(int i=1;i<=n;i++) cin>>in[i];
    for(int i=1;i<=n;i++){
        int r=i+in[i],l=i-in[i];
        if(r<=n) push(r,n);
        if(l>=1) push(1,l);
    }
    pre[1]=in[1],suf[n]=in[n];
    for(int i=2;i<=n;i++) pre[i]=min(pre[i-1],in[i]);
    for(int i=n-1;i>=1;i--) suf[i]=min(suf[i+1],in[i]);
    for(int i=1;i<=n;i++){
        int now=in[i];
        int R=i+in[i],L=i-in[i];
        if(R<=n){
            //deal right
            int l=R,r=n,ans=-1;
            while(l<=r){
                int mid=(l+r)>>1;
                if(suf[mid]<=now){
                    ans=mid;
                    l=mid+1;
                }else r=mid-1;
            }
            if(ans!=-1) push(i,ans);
        }
        if(L>=1){
            //deal left
            int l=1,r=L,ans=-1;
            while(l<=r){
                int mid=(l+r)>>1;
                if(pre[mid]<=now){
                    ans=mid;
                    r=mid-1;
                }else l=mid+1;
            }
            if(ans!=-1) push(ans,i);
        }
    }
    int sum=0,ans=0;
    for(int i=1;i<=n;i++){
        sum+=tag[i];
        if(!sum) ans++;
    }
    cout<<ans<<endl;
    for(int i=1;i<=n+1;i++) tag[i]=0;
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    for(int i=1;i<=t;i++){
        subtask();
    }
    return 0;
}
```

注意的是，差分这里有这样的一句 `tag[r+1]--`，如果 $r$ 取 $n$，那么就涉及到了 $tag[n+1]$ 。如果最后清空的时候只清空到 $tag[n]$ 的话就寄啦！

## CF2019E

主观难度：普及/提高-

标签：图论、bfs、dfs

赛时看这道题过的比D还多，于是直接跳过D来做E。一开始有点被题号吓到了，不过思考之后发现还是不难的。

到根的距离即为深度。我们从点 $1$ 开始一种类似 $bfs$ 的处理方式。先把点 $1$ 的子节点都取出来，放入 $sta$ 数组中。这些点加上点 $1$ 就是如果我们让所有的点到根距离都为 $1$ 的话，需要保留的点。$sta$ 数组表示的是位于当前深度的点。考虑增加深度，我们让 $sta$ 数组中的点都尝试往下再遍历新的点。如果能的话就再把新的点也加入 $stb$ 数组中，不能的话，说明这个点要被删掉，给它打个标记。如果一个点的所有子点都被标记为删除，那么这个点也要被标记删除。然后在把 $stb$ 数组替换 $sta$ 数组，重复上述过程。一个点最多被添加一次，删除一次，所以复杂度是能控制住的。这个过程中维护当前留下来的点。

```cpp
#include<bits/stdc++.h>
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
#define _ 500005
using namespace std;
const int inf=0x3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
struct Edge{int next,to;} edge[_<<1];
int head[_],siz,f[_],tag[_],cnt[_];
inline void add(int u,int v){edge[++siz].to=v,edge[siz].next=head[u],head[u]=siz;}
void dfs1(int x,int fa){
	for(int i=head[x];i;i=edge[i].next){
		int to=edge[i].to;
		if(to==fa) continue;
		f[to]=x;
		cnt[x]++;
		dfs1(to,x);
	}
}
int sta[_],stb[_],pa,pb,ans[_],now,dep;
void del(int x){
	now--;
	tag[f[x]]++;
	if(tag[f[x]]==cnt[f[x]]){
		del(f[x]);
	}
}
void dfs2(int x){
	ans[x]=now;
	pb=0;
	for(int i=1;i<=pa;i++){
		if(!cnt[sta[i]]){
			del(sta[i]);
		}else{
			for(int j=head[sta[i]];j;j=edge[j].next){
				int to=edge[j].to;
				if(to==f[sta[i]]) continue;
				stb[++pb]=to;
				now++;
			}
		}
	}
	pa=0;
	for(int i=1;i<=pb;i++){
		sta[++pa]=stb[i];
	}
	if(pa==0) return dep=x,void();
	else dfs2(x+1);
}
inline void subtask(){
	int n;cin>>n;
	for(int i=1;i<n;i++){
		int u,v;cin>>u>>v;
		add(u,v);add(v,u);
	}
	dfs1(1,0);
	pa=0;
	for(int i=head[1];i;i=edge[i].next){
		int to=edge[i].to;
		sta[++pa]=to;
	}
	now=1+pa;
	dfs2(1);
	int maxx=-inf;
	for(int i=1;i<=dep;i++) maxx=max(maxx,ans[i]);
	cout<<n-maxx<<endl;

	siz=0;
	for(int i=1;i<=n;i++) head[i]=f[i]=cnt[i]=tag[i]=0;
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2019F

主观难度：普及+/提高

标签：并查集、贪心

感觉最后要最大化的东西影响因素很多，不好处理，于是就摆烂了（划掉

首先需要观察出一点：一定要把最大值选上（和A很像）。如果最大值两边都没有被选，显然选上最大值是更好的。如果一边的数被选了，显然取消选中，该选最大值是更好的。如果两边都选了，把这两个都取消选中，选上最大值，虽然数量上少了一，但是最大值比次大值至少大一，因此把亏的又给补上了。综上，一定要把最大值选上。

影响最终式子的还有最小值。我们不妨直接枚举最小值吧。从大到小枚举最小值。因为我们枚举的是最小值，所以只有位于最大值和最小值之间的数字目前能被选中。随着这个枚举过程，我们能够选中的数字是越来越多的。

但还有一个限制，选中的数字不能相邻。现在能被选中的数字都是可以随便选的，只会对选中的数量产生影响。于是我们考虑一个东西，给你一个序列，选择的数不能相邻，最多能选多少个数？显然是 $\left \lceil \frac{len}{2} \right \rceil$ 的（ $len$ 为这个序列的长度）。随着最小值的枚举，能够选中的数字是越来越多，这些能够选中的位置就形成了若干个联通块，各个联通块内怎么选互不干扰。于是我们维护联通块大小（这里就用到并查集了）一个大小为 $len$ 的联通块对答案的贡献为 $\left \lceil \frac{len}{2} \right \rceil$。

不过这里又有点问题，上述的做法的前提是能够选中的数字随便选。你要随便选的话可能没选中最大值，而我们说你要选中最大值了才是最优的。如果一个联通块内能把最大值选上，那么其他联通块内就能随便选了。对于偶数长度的联通块，只要包含最大值，就是能够选上的。而对于奇数的联通块，我们上面得出联通块对答案的贡献为 $\left \lceil \frac{len}{2} \right \rceil$ 的前提是奇数长度联通块都是把第奇数个元素选中。而最大值可不一定在第奇数个元素里面。我们考虑，如果所有的偶数长度的联通块中不包含最大值，奇数长度的联通块中，最大值都出现在第偶数个元素的位置，那么就必须有一个奇数长度的联通块需要牺牲一下，不把第奇数个元素选中，而把第偶数个元素选中，对答案的贡献由 $\left \lceil \frac{len}{2} \right \rceil$ 变为 $\left \lfloor \frac{len}{2} \right \rfloor$，减了一。但是这个联通块牺牲后，最大值就被选上了，其余联通块对答案贡献不变。

为了处理这些，我们需要对每个联通块记录一下，其奇数位置是否有最大值出现，偶数位置是否有最大值出现。

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
#define _ 200005
int in[_],fa[_],has[_][2],siz[_],tag,pick[_],cnt;
// tag为当前有多少个联通块能在不降低对答案的贡献情况下把最大值选上
// cnt为当前所有联通块的长度部分对答案的贡献
inline int find(int x){while(x!=fa[x]) x=fa[x]=fa[fa[x]];return x;}
inline bool provide(int x){
    if(siz[x]%2==0) return max(has[x][0],has[x][1]);
    else return has[x][1];
}
inline void uni(int l,int r){
    int fax=find(l),fay=find(r);
    if(provide(fax)) tag--;
    if(provide(fay)) tag--;
    cnt-=ceil(1.0*siz[fax]/2);
    cnt-=ceil(1.0*siz[fay]/2);
    if(siz[fax]%2) has[fax][0]=max(has[fax][0],has[fay][1]),has[fax][1]=max(has[fax][1],has[fay][0]);
    else has[fax][0]=max(has[fax][0],has[fay][0]),has[fax][1]=max(has[fax][1],has[fay][1]);
    siz[fax]=siz[fax]+siz[fay];
    fa[fay]=fax;
    if(provide(fax)) tag++;
    cnt+=ceil(1.0*siz[fax]/2);
}
pii pa[_];
inline void subtask(){
    tag=0;cnt=0;
    int n;
    cin>>n;for(int i=1;i<=n;i++) cin>>in[i];
    if(flag){
        for(int i=1;i<=n;i++) cout<<in[i]<<' ';
        cout<<endl;
    }
    for(int i=1;i<=n;i++) fa[i]=i,siz[i]=1;
    for(int i=1;i<=n;i++) pa[i]=pii(i,in[i]);
    sort(pa+1,pa+n+1,[](pii a,pii b){return a.second>b.second;});
    for(int i=1;i<=n;i++){
        has[i][0]=0;
        if(in[i]==pa[1].second) has[i][1]=1;
        else has[i][1]=0;
        pick[i]=0;
    }
    int ans=-inf;
    for(int i=1;i<=n;i++){
        int p=pa[i].first,v=pa[i].second;
        //debug(p);
        tag+=has[p][1];pick[p]=1;cnt++;
        if(p>=2&&pick[p-1]) uni(p-1,p);
        if(p<=n-1&&pick[p+1]) uni(p,p+1);
        if(tag) ans=max(ans,pa[1].second+v+cnt);
        else ans=max(ans,pa[1].second+v+cnt-1);
    }
    cout<<ans<<endl;
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    for(int i=1;i<=t;i++) subtask();
    return 0;
}
```
