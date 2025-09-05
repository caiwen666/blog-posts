@meta

```json
{
	"id": "cf980-2",
	"createTime": "2024-10-25 22:47",
	"summary": "Codeforces Round 980 Div.2总结，A、B、C、D",
	"key": ["codeforces", "cf", "980", "div2"],
	"tags": [{ "value": "未补完", "color": "error" }],
	"background": "https://www.caiwen.work/wp-content/uploads/2024/10/未命名4-2.jpg"
}
```

正常发挥，上大分了。

## CF2024A

主观难度：入门

标签：无

小学应用题，直接列不等式解出来即可。

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
    int a,b;cin>>a>>b;
    if(a>=b) cout<<a<<endl;
    else{
        int x=b-a;
        cout<<max(a-x,(int)0)<<endl;
    }
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2024B

主观难度：普及-

标签：排序、贪心

把含有的量从小到大排序。考虑一个贪心策略，我们其实是希望尽量地少出现，按下去发现不出饮料，这种情况。排序后，比如当前最小值为 $a$ ，于是我们可以轮流按下每个机器，重复 $a$ 轮，直到把含量最小的那个机器耗光了。这时我们其实不知道哪个机器空了，题目要求我们求最坏情况，所以我们不得不按下为空的那个机器，同时这个机器后面也不会再按下了，我们知道他已经空了。于是对于剩余 $n-1$ 个机器，要处理的问题等价于原问题。

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
int in[_];
inline void subtask(){
    int n,k;cin>>n>>k;
    for(int i=1;i<=n;i++) cin>>in[i];
    sort(in+1,in+n+1);
    int ans=0,base=0;
    for(int i=1;i<=n;i++){
        int now=in[i]-base;
        if(now==0){
            ans++;
            continue;
        }
        int cnt=n-i+1;
        if(now*cnt>=k){
            ans+=k;
            break;
        }else{
            ans+=now*cnt;
            k-=now*cnt;
            base=in[i];
            ans++;
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

## CF2024C

主观难度：普及/提高-

标签：贪心、排序

经典贪心。考虑调整两个相邻的pair。调整相邻的pair并不会导致其他的pair对最终答案的贡献发生变化，只会更改被调整的两个pair的贡献。

于是枚举 $4$ 的排列，考虑所有两个pair的四个数的相对大小关系下，这两个pair哪个放前面产生的逆序对最少。

赛时我就怎么做的，不过实际上枚举了几个大小关系就猜出来了：把两个数中最小值最小的那个pair放前面是更优的。写完交上去直接wa了...然后立马考虑到如果最小值相同，应该把最大值最小的放前面。再交上去就ac了。

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
#define _ 100005
pii a[_];
inline void subtask(){
    int n;cin>>n;
    for(int i=1;i<=n;i++) cin>>a[i].first>>a[i].second;
    sort(a+1,a+n+1,[](pii x,pii y){
        int xmin=min(x.first,x.second);
        int ymin=min(y.first,y.second);
        if(xmin!=ymin) return xmin<ymin;
        else{
            xmin=x.first+x.second-xmin;
            ymin=y.first+y.second-ymin;
            return xmin<ymin;
        }
    });
    for(int i=1;i<=n;i++) cout<<a[i].first<<' '<<a[i].second<<' ';
    cout<<endl;
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2024D

主观难度：普及+/提高

标签：线段树、dp、贪心、最短路

首先一点，如果从当前点跳出去，到达的点在当前点前面，那么肯定是不跳的。因为我们直接从当前点开始一直往前走获得的分数是更优的。

我们一顿跳，但最终还是要往前走，直到走到最前面的点。然后我直觉上感觉需要考虑一个 $dp[x]$ 表示从 $x$ 跳出去之后再回到 $x$ 能够获得的最大分数。

假设从 $x$ 跳走，到达了点 $to$。然后我们这里又有了一点，从 $to$ 回到 $x$ 的过程中，最多再从一个点跳出去一次。因为如果两个点都跳了，那么我们相当与是损失了两个点的分数，而两次新获得的点（不在 $x$ 和 $to$ 之间的点）是有重叠的，最远的那次跳跃就能得到这些新点。于是我们考虑，比如我们中间再选择从点 $y$ 跳出去，那么最终 $dp[x]=a[x+1]+a[x+2]+...+a[y-1]+dp[y]$。考虑使用前缀和，得到 $dp[x]=dp[y]+pre[y-1]-pre[x]$。$dp[y]+pre[y-1]$ 可以直接丢到线段树中去维护。

赛后和 lh 讨论时得知了另一种更好的做法：$x$ 与 $x$ 跳出到达的点 $y$ 之间连一个边权为 $a[x]$ 的有向边，点 $x$ 与点 $x-1$ 连一个边权为 $0$ 的有向边，然后跑最短路。

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
#define _ 400005
int tree[_<<4],a[_],b[_],dp[_],pre[_];
void modify(int k,int l,int r,int x,int y){
    if(l==r) return tree[k]=y,void();
    int mid=(l+r)>>1;
    if(x<=mid) modify(ls(k),l,mid,x,y);
    else modify(rs(k),mid+1,r,x,y);
    tree[k]=max(tree[ls(k)],tree[rs(k)]);
}
int query(int k,int l,int r,int x,int y){
    if(l>=x&&r<=y) return tree[k];
    int mid=(l+r)>>1,ans=-inf;
    if(x<=mid) ans=max(ans,query(ls(k),l,mid,x,y));
    if(y>=mid+1) ans=max(ans,query(rs(k),mid+1,r,x,y));
    return ans;
}
void clean(int k,int l,int r){
    if(l==r) return tree[k]=0,void();
    int mid=(l+r)>>1;
    clean(ls(k),l,mid);
    clean(rs(k),mid+1,r);
    tree[k]=0;
}
inline void subtask(){
    int n;cin>>n;
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=1;i<=n;i++) cin>>b[i];
    for(int i=1;i<=n;i++) pre[i]=pre[i-1]+a[i];
    int ans=a[1];
    for(int i=n;i>=1;i--){
        if(b[i]<=i){
            dp[i]=0;
            continue;
        }
        int to=b[i];
        int tmp=pre[to]-pre[i];
        tmp=max(tmp,query(1,1,n,i,to)-pre[i]);
        dp[i]=tmp;
        modify(1,1,n,i,dp[i]+pre[i-1]);
    }
    cout<<max(ans,dp[1])<<endl;
    clean(1,1,n);
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2024E/CF2024F

这场题目难度分布有点抽象了... E 都补不动。这两题以后有机会再补吧。
