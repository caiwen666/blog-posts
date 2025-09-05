@meta

```json
{
	"id": "cf973-2",
	"createTime": "2024-10-01 19:48",
	"summary": "Codeforces Round 973 Div.2总结，A、B、C、D、E、F1",
	"key": ["codeforces", "cf", "973", "div2"],
	"tags": [{ "value": "未补完", "color": "error" }],
	"background": "https://www.caiwen.work/wp-content/uploads/2024/10/未命名4-1.jpg"
}
```

还好是定级赛，不然肯定挂大分了...

## CF2013A

太简单了， 没啥好说的，直接就写出来了

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
	int n,x,y;cin>>n>>x>>y;
	if(x>=y){
		cout<<ceil(1.0*n/y)<<endl;
	}else{
		cout<<ceil(1.0*n/x)<<endl;
	}
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

然后就寄了....

因为ceil返回值为double类型，结果太大的话，cout输出时会按科学计数法输出，和答案对不上。

本来写的挺快，结果WA了，反复看了好久才发现这一点，再ac的时候已经有1w人通过了...或许预示着这次比赛会很坎坷...

## CF2013B

手玩几个样例，发现最后必然是最后一个数减去某个数。显然，减去的数越小越好。贪心地考虑，我们让倒数第二个数把前面所有的数字都减一遍，那么应该就能得到一个很小的数了，然后再让最后一个数减去他，得到的结果就是最大的。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
#define _ 200005
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
int in[_];
inline void subtask(){
	int n;cin>>n;
	for(int i=1;i<=n;i++) cin>>in[i];
	int now=in[n-1];
	int sum=0;
	for(int i=1;i<=n-2;i++) sum+=in[i];
	cout<<in[n]-(now-sum)<<endl;
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2013C

交互题，心脏骤停，从来没做过。赛时打算直接跳过这个题做D了，D wa了好几发，发现C通过的人越来越多，于是又赶紧过来看C。

首先我的一个想法是类似于二分那种，先猜是否存在大于一半长度的全0或者全1，沿着这个思路想了好久没想出来。

随后发现这个题根本不用这么复杂。首先询问是否全0，回答是就出答案了，反之就说明肯定存在1，我们把1放入答案序列中。

随后我们就从这个1开始向两边延伸。往1后面加个1，组成11，询问11是否存在，如果存在再往后面加1...以此类推。如果不存在了就改为加0询问是否存在，如果答案序列结尾无论是加0还是加1都不存在了，说明右边已经到头了，改为从前面加1或者0然后询问，和上面大同小异。这样我们就能再在 $2n$ 次询问内把这个字符串破解出来。

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
deque<int> d;
inline bool ask_front(int x){
	cout<<"? ";
	cout<<x;
	for(auto it=d.begin();it!=d.end();++it) cout<<*it;
	cout<<endl;
	cout.flush();
	int ans;cin>>ans;
	return ans;
}
inline bool ask_end(int x){
	cout<<"? ";
	for(auto it=d.begin();it!=d.end();++it) cout<<*it;
	cout<<x;
	cout<<endl;
	cout.flush();
	int ans;cin>>ans;
	return ans;
}
inline void subtask(){
	int n;cin>>n;
	int now=0;

	cout<<"? ";
	for(int i=1;i<=n;i++) cout<<0;
	cout<<endl;
	cout.flush();

	int flag;cin>>flag;
	if(flag==1){
		cout<<"! ";
		for(int i=1;i<=n;i++) cout<<0;
		cout<<endl;
		cout.flush();
		return;
	}

	now++;
	d.push_back(1);

	int dir=1;//1 for end

	while(now!=n){
		if(dir==1){
			if(ask_end(1)) d.push_back(1),now++;
			else if(ask_end(0)) d.push_back(0),now++;
			else dir=0;
		}else{
			if(ask_front(1)) d.push_front(1),now++;
			else d.push_front(0),now++;
		}
	}

	cout<<"! ";
	for(auto it=d.begin();it!=d.end();++it) cout<<*it;
	cout<<endl;
	cout.flush();

	while(!d.empty()) d.pop_back();
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2013D

赛时wa了三发，最后发现做法假了....

于是思考了很久，发现还是想复杂了

首先我们有个性质：对于两个相邻的数 $a$ 和 $b$ ，如果后者比前者小，那么我们一定可以将两个数都调整为他们的平均数，且调整后，对最终答案的影响一定是不劣的。

换句话说，后面那个数比前面那个数小，那么就能把这两个数都变成一个数。

然后我们再考虑，如果经过我们的一顿调整，调整后的序列的极差最小了，这个最后的序列有什么特点？答案是一定是单调不降的。因为一旦后面的数小于前面的数，那么我们就可以来利用上述的性质使得答案更优，或者不变，至少是不劣的。

我们知道了我们最终的目标，即把最后这个序列变成单调不降的。

然后又有个性质，我们两个数不一定相邻，也可以。比如序列 `a b c`，我们先对 ab操作，得到 `a-1 b+1 c` 再对后面两个数操作，得到 `a-1 b+1-1 c+1` 即 `a-1 b c+1` ，你发现了吗，等价于直接选择ac进行操作。所以不相邻也是可以的。

然后，我们不妨称将两个数变为一个数，即他们的平均数，这个操作叫做合并，将已经合并成一个数的这些数合称为一个块。然后，如果一个块（块里面所有的数都变成他们的平均数了），他后面紧跟着一个数，且这个数小于块的平均数，那么我们可以将这个块和这个数合并，变成一个新块，块中所有的数都等于他们的平均数。

然后我们的做法就是，将这些数字从左向右，能合并就合并，最终合并完之后得到的序列一定是单调不降的，否则我们就还能再合并。

注意，平均数可能是小数，小数不好处理，因此我们维护两个数，块内所有数的和，以及块中数字的数量。而且，如果平均数是小数的话，我们实际上无法将所有的数都调整为平均数，但能肯定的是，块中最大的数是平均数的上取整，最小的数是平均数的下取整。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
#define _ 200005
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
pii arr[_];
int n,in[_],cnt;
inline void subtask(){
	cin>>n;
	for(int i=1;i<=n;i++) cin>>in[i];
	arr[1]=pii(in[1],1);cnt=1;
	for(int i=2;i<=n;i++){
		pii now=pii(in[i],1); // 块中只有一个数
		while(arr[cnt].first*now.second>=arr[cnt].second*now.first&&cnt>=1){
            // 不断尝试与前面的块合并。比较当前平均数和上一个块的平均数即可。注意我们实际上是把比较平均数那个式子给交叉相乘了一下，规避小数。
			now.first+=arr[cnt].first;
			now.second+=arr[cnt].second;
			cnt--;
		}
		cnt++;
		arr[cnt]=now;
	}
	double minn=1.0*arr[1].first/arr[1].second;// 第一个块必然是平均数最小块
	double maxx=1.0*arr[cnt].first/arr[cnt].second;
	cout<<(int)(ceil(maxx)-floor(minn))<<endl;
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2013E

有点像上一场的 D，想到了大概会用到前缀gcd以log的速度收敛的性质。我还以为要用到什么科技，补题的时候想半天，以为要用到什么科技，没搞出来。结果没想到这么简单...

首先，前缀gcd一定是单调不增的。

其次，如果我们让前缀gcd不断减小，那么大概减小log次就到1了。

然后，如果前缀gcd到1了，后面的数字怎么排无所谓了，反正得到的前缀gcd都是1。后面的部分我们甚至可以 $O(1)$ 统计答案。

然我们就有个贪心：我们先把最小的数放在第一位，然后后面暴力枚举，枚举后面再放哪个数可以是当前的前缀gcd最小。看似是暴力的，但我们只需要log次枚举就能让前缀gcd归1，时间复杂度不会很大。

有种特殊情况，就是如果所有数的gcd不为1的话，就意味着我们枚举到最后一个位置也无法让前缀gcd变为1。所以我们需要做个处理，先求出所有数的gcd，然后让每个数都除去这个gcd，然后最终答案再乘上这个gcd。

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
int in[100005];
inline int gcd(int a,int b){
	while(a%b){
		int t=a%b;
		a=b;
		b=t;
	}
	return b;
}
inline void subtask(){
	int n;cin>>n;
	for(int i=1;i<=n;i++) cin>>in[i];
	int g=in[1];
	for(int i=1;i<=n;i++) g=gcd(g,in[i]);
	for(int i=1;i<=n;i++) in[i]/=g;
	int minn=inf;
	for(int i=1;i<=n;i++) minn=min(minn,in[i]);
	int ans=minn,now=minn,has=1;
	for(int i=1;i<=n;i++){
		int t=now;
		for(int j=1;j<=n;j++){
			t=min(t,gcd(now,in[j]));
		}
		ans+=t;
		now=t;
		has++;
		if(t==1){
			ans+=n-has;
			break;
		}
	}
	cout<<ans*g<<endl;
}
signed main(){
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2013F1

先换个视角，我们把从点 1 到点 u 路径上的点横向排列成一个链，大概长这样子：

![](https://www.caiwen.work/wp-content/uploads/2024/10/image-20241001192634703.png)

（图中三角部分为点的子树）

然后，轮到一个人的回合时，这人总的来说只会有两个行为：要么跳入当前所在点的子树，要么继续沿着这个从 1 到 u 的链行走。

我们假设，比如 Bob 在点 6 跳入了子树中，之后 Alice 就可以在点 1 到点 5 之间随便走了。

![](https://www.caiwen.work/wp-content/uploads/2024/10/image-20241001193046693.png)

假设当前回合是Bob的回合，在点6。Bob要不要选择跳入子树呢？那Bob就需要先判断，我跳入子树后，能走多远，假设跳入子树中最远能走 $x$ 个点。然后他还要计算，Alice最远还能走多远，假设为 $y$。如果 $x>y$ 那么 Bob 必胜。否则，Bob只能再小心翼翼地沿着链走。

跳入一个子树后能走多远，可以通过dfs计算出来。对手能走的范围是一个区间，需要用st表维护。

值得注意的一点，比如对于Alice，我们在st表中维护的是 $far[i]+i$，其中 $i$ 表示链上第 $i$ 个点，$far[i]$ 表示跳入点 $i$ 的子树后还能走多远。为什么？因为st表维护的这个是以 $1$ 为起点的距离，而Alice在后续过程中可能往前移动了。我们假设到了第 $j$ 个点。$far[i]+i-j$ 即为Alice在第 $j$ 个点，最后选择跳入点 $i$ 的子树中，能走多远。也就是后面我们再减去当前位置即可得到相对于当前位置的距离。Bob同理。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
#define _ 200005
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=0;
typedef pair<int,int> pii;
int siz,head[_],p[_],fa[_],tag[_],far[_];
int lg[_],sta[_][22],stb[_][22];
struct Edge{int next,to;} edge[_<<1];
inline void add(int u,int v){edge[++siz].to=v,edge[siz].next=head[u],head[u]=siz;}
void dfs1(int x,int f){
	for(int i=head[x];i;i=edge[i].next){
		int to=edge[i].to;
		if(to==f) continue;
		fa[to]=x;
		dfs1(to,x);
	}
}
void dfs2(int x,int f){
	int mx=0;
	for(int i=head[x];i;i=edge[i].next){
		int to=edge[i].to;
		if(to==f) continue;
		if(tag[to]) continue;
		dfs2(to,x);
		mx=max(mx,far[to]);
	}
	far[x]=mx+1;
	if(f==0) far[x]--;
}
inline void subtask(){
	int n,t;
	cin>>n;
	for(int i=1;i<n;i++){
		int u,v;cin>>u>>v;
		add(u,v);add(v,u);
	}
	cin>>t;cin>>t;
	dfs1(1,0); //得到fa数组
	stack<int> st;
	// 下面这顿操作把从点 1 到点 u 所有的点取出来
    int now=t;st.push(now);
	while(now!=1){
		now=fa[now];
		st.push(now);
	}
	int cnt=0;
	while(!st.empty()){
		now=st.top();st.pop();
		tag[now]=1;
		p[++cnt]=now;
	}
    // 得到far数组
	for(int i=1;i<=cnt;i++) dfs2(p[i],0);
    // st表预处理
	for(int i=1;i<=cnt;i++) sta[i][0]=far[p[i]]+i,stb[i][0]=far[p[i]]+cnt-i+1;
	for(int i=1;i<=lg[cnt];i++){
		for(int j=1;j<=cnt-(1<<i)+1;j++){
			sta[j][i]=max(sta[j][i-1],sta[j+(1<<(i-1))][i-1]);
			stb[j][i]=max(stb[j][i-1],stb[j+(1<<(i-1))][i-1]);
		}
	}
	now=0;
	int l=1,r=cnt;//l 和 r 分别表示当前Alice和Bob在链上哪个点
	while(l<r){
		if(now==0){
			int L=l+1,R=r;
			int k=lg[R-L+1];
			int bob=max(stb[L][k],stb[R-(1<<k)+1][k])-(cnt-r+1);
			if(far[p[l]]>bob){
				now=1;
				break;
			}else l++;
		}else{
			int L=l,R=r-1;
			int k=lg[R-L+1];
			int ali=max(sta[L][k],sta[R-(1<<k)+1][k])-l;
			if(far[p[r]]>ali){
				now=0;
				break;
			}else r--;
		}
		if(l==r) break;
		now=1-now;
	}
	if(now) cout<<"Alice"<<endl;
	else cout<<"Bob"<<endl;

	siz=0;
	for(int i=1;i<=n;i++) head[i]=tag[i]=0;
}
signed main(){
	for(int i=2;i<=200000;i++) lg[i]=lg[i>>1]+1;
	ios::sync_with_stdio(false);
	int t;cin>>t;
	while(t--) subtask();
	return 0;
}
```

## CF2013F2

mlgb，看半天也没看懂，摆了，有机会再补
