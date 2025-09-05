@meta

```json
{
	"id": "cf979-2",
	"createTime": "2024-10-25 22:01",
	"summary": "Codeforces Round 979 Div.2总结，A、B、C、D、E、F",
	"key": ["codeforces", "cf", "979", "div2"],
	"tags": [{ "value": "未补完", "color": "error" }],
	"background": "https://www.caiwen.work/wp-content/uploads/2024/10/未命名4-1-1.jpg"
}
```

唐完了，只切了A和B，C读假，卡一个多小时，D还剩10min无力气写了...

## CF2030A

主观难度：普及-

标签：贪心、排序

首先一点是 $c_1=b_1$。$c_i$ 和 $b_i$ 分别为前缀最大值和前缀最小值。如果我们把最大的数放在最前面，那么所有的 $c_i$ 都会是最大的，对于 $b_i$ 同理。所以我们考虑前两个数字放最大值和最小值，然后答案即为 $(maxx-minn)\times i$。

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
    int n;cin>>n;
    int maxx=-inf,minn=inf;
    for(int i=1;i<=n;i++){
        int x;cin>>x;
        maxx=max(maxx,x);
        minn=min(minn,x);
    }
    cout<<(maxx-minn)*(n-1)<<endl;
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2030B

发现 $f(t)$ 和 $g(t)$ 都是能算出来的。具体地，$f(t)=2^{cnt_0}-1$，$g(t)=2^{cnt_1+cnt_0}-1-f(t)=2^{cnt_1+cnt_0}-2^{cnt_0}$。即为最小化 $|2^{cnt_1+cnt_0}-2^{cnt_0+1}+1|$。容易看出 $cnt_1+cnt_0=cnt_0+1$ 即 $cnt_1=1$ 时能取到最小值。

那么构造方案就出来了，只输出 $1$ 个 `1`，剩余地方都是 `0` 即可。注意特判 $n=1$ 的情况。

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
    int n;cin>>n;
    if(n==1) cout<<"0"<<endl;
    else if(n==2) cout<<"01"<<endl;
    else if(n==3) cout<<"010"<<endl;
    else{
        for(int i=1;i<=n-1;i++) cout<<"0";
        cout<<"1"<<endl;
    }
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2030C

主观难度：普及-

标签：博弈、贪心

开始读错题了，以为填完运算符之后是从右到左进行计算得到的式子（至于为什么是从右到左而不是从左到右，因为我看样例都是这样），于是首先一个想法是贪心，Alice 肯定填 `or`，Bob 肯定填 `and`，搞完之后交上去发现WA了（题目都读错了肯定WA）。从直觉上看不出这个贪心有什么错误，但还是打算换个思路。之前遇到过博弈+dp的题目，于是考虑这个题是不是也是这样的。

直接dp感觉有点难搞，因为当你决定当前这个运算符填还是不填的时候，当前要填的运算符的左侧是知道的，但右侧是不知道的，因为是从右往左计算。但右侧的结果要么是 $0$ 要么是 $1$。想了一会得到了这样的一个dp：$dp[i][0/1]$ 表示前 $i$ 个运算符确定，最后一个运算符右侧为 $0/1$ 时表达式最终结果。显然 $dp[i][0]=dp[i][1]$ 时就决出胜负了。没有决出胜负的话，Alice 的回合会考虑让最终表达式结果为 $1$，根据 $dp[i-1][0/1]$ 判断他希望这个运算符运算结果是 $0$ 还是 $1$。如果希望为 $0$ 的话他填 `and` 是比较好的，反之填 `or`。对于 Bob 同理。

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
int dp[200005][2];
inline void subtask(){
    int n;cin>>n;
    string str;cin>>str;
    if(str[0]=='1') cout<<"YES"<<endl;
    else{
        dp[1][0]=0;
        dp[1][1]=1;
        for(int i=2;i<=n-1;i++){
            if(dp[i-1][0]==dp[i-1][1]){
                if(dp[i-1][0]==1) cout<<"YES"<<endl;
                else cout<<"NO"<<endl;
                return;
            }
            if(i%2==1){//for a
                int left=str[i-1]=='1'? 1:0;
                if(dp[i-1][0]==1){
                    dp[i][0]=1;
                    dp[i][1]=left==1? 0:1;
                }else{
                    dp[i][0]=left==1? 1:0;
                    dp[i][1]=1;
                }
            }else{//bob
                int left=str[i-1]=='1'? 1:0;
                if(dp[i-1][0]==0){
                    dp[i][0]=0;
                    dp[i][1]=left==1? 1:0;
                }else{
                    dp[i][0]=left==1? 0:1;
                    dp[i][1]=0;
                }
            }
        }
        int right=str[n-1]=='0'? 0:1;
        if(dp[n-1][right]) cout<<"YES"<<endl;
        else cout<<"NO"<<endl;
    }
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

但说了这么多，还是把题目读假了，上述代码还是WA的。

赛时检查这个dp检查了半天，觉得没毛病。后面感觉可能是最终表达式计算的那里读的不好（怎么可能会从右往左算，太离谱了）。最后卡到这个题了，临近比赛结束才从 lh 那里得知这道题是先把 `and` 都算完之后再算 `or`。

这样的话，这个题就太简单了，首先首位都有 $1$ 的话是 Alice必胜的，Alice只需要把第一个和最后一个运算符选为 `or` 即可。如果有两个连续的 $1$，Alice也是必胜的，因为Alice可以在开始的三个回合内，把其中一个 `1` 的两边都加上 `or`，这样后续无论再怎么加都一定会让表达式为 `1`。

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
int dp[200005][2];
inline void subtask(){
    int n;cin>>n;
    string str;cin>>str;
    if(str[0]=='1'||str[n-1]=='1') cout<<"YES"<<endl;
    else{
        int las=1;
        for(int i=0;i<n;i++){
            int now=str[i]=='1'? 1:0;
            if(now==1&&now==las) return cout<<"YES"<<endl,void();
            las=now;
        }
        cout<<"NO"<<endl;
    }
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2030D

主观难度：普及/提高-

标签：差分

发现如果能交换 $i$ 和 $i+1$ 位置，那么就给 $i$ 和 $i+1$ 连一个边。一个位置的数可以通过连上的边到达其他位置。因为我们要排序，所以算出每个数到排好序的位置要经过哪些边，从而得出哪些边是必选的。然后随着询问的进行，维护哪些边存在以及是否覆盖了必选边即可。使用差分即可做到。

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
int arr[200005],n,key[200005],now[200005];
char ch[200005];
inline void subtask(){
    int n,q;cin>>n>>q;
    for(int i=1;i<=n;i++){
        int x;cin>>x;
        if(x==i) continue;
        int l=min(x,i),r=max(x,i);
        arr[l]++;arr[r]--;
    }
    for(int i=1;i<n;i++) key[i]=key[i-1]+arr[i];
    cin>>ch+1;
    int still=0;
    for(int i=1;i<=n;i++){
        if(ch[i]=='L') now[i-1]++;
        else now[i]++;
    }
    for(int i=1;i<n;i++){
        if(key[i]&&!now[i]) still++;
        //debug(now[i]);
    }
    while(q--){
        int x;cin>>x;
        if(ch[x]=='L'){
            now[x-1]--;
            now[x]++;
            if(now[x-1]==0&&key[x-1]) still++;
            if(now[x]==1&&key[x]) still--;
            ch[x]='R';
        }else{
            now[x]--;
            now[x-1]++;
            if(key[x]&&now[x]==0) still++;
            if(key[x-1]&&now[x-1]==1) still--;
            ch[x]='L';
        }
        if(still) cout<<"NO"<<endl;
        else cout<<"YES"<<endl;
    }
    for(int i=1;i<=n;i++) arr[i]=key[i]=now[i]=0;
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2030E

主观难度：提高+/省选-

标签：dp、组合数学、快速幂、贪心

我们记 $f_i$ 为数字 $i$ 出现的次数。

首先要看出一点，最终分数为 $f_0+min(f_0,f_1)+min(f_0,f_1,f_2)+...$。

发现是加和的形式，我们可以考虑拆开看每一项对答案的贡献。

比如考虑 $min(f_0,f_1,...f_i)$ 的贡献，记 $min(f_0,f_1,...f_i)=k$，这一项对答案的贡献即为能够使得 $min(f_0,f_1,...f_i)=k$ 的子序列的个数。显然 $min(f_0,f_1,...f_i)$ 只跟 $f_i$ 及之前 $f$ 的有关，$f_i$ 之后的无关。这就有了一个无后效性的特点，从而具有了 dp 的基础。

设 $dp[i][j]$ 为仅考虑 $f_0$ 到 $f_i$，有 $min(f_0,f_1,...,f_i)=j$ 的子序列个数。那么对答案的贡献即为 $dp[i][j]\times 2^{f_{i+1}+f_{i+2}+...+f_{n}}$。

初始时有 $dp[0][i]=C_{f_0}^{i}$。

考虑转移，$dp[i][j]$ 中的 $j$ 有两种可能，一种是前面 $i-1$ 项的最小值比 $j$ 大，是 $f_i$ 导致了前缀最小值为 $j$。另一种是前面 $i-1$ 项最小值为 $j$，$f_i$ 比 $j$ 大。于是就有

$$
dp[i][j]+=C_{f_i}^{j}\times (dp[i-1][j]+dp[i-1][j+1]+dp[i-1][j+2]+...+dp[i-1][n])
$$

上述对应情况一。

$$
dp[i][j]+=dp[i-1][j]\times (C_{f_i}^{j+1}+C_{f_i}^{j+2}+...+C_{f_i}^{f_i})
$$

上述对应情况二。

显然我们可以使用前缀和进行优化，但最后总时间复杂度还是 $O(n^2)$ 的。

不过我们需要发现一点，$dp[i][j]$ 中的 $j$ 最大值不会超过 $min(f_0,f_1,...,f_i)$ ，而我们知道所有 $f_i$ 相加才会是 $n$。所以，我们转移的时候控制一下枚举的上界，就能得到一个 $O(n)$ 的 dp。

```cpp
#include<bits/stdc++.h>
#define int long long
#define ull unsigned long long
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
#define debug(x) cout<<#x<<"="<<x<<endl
using namespace std;
const int inf=0x3f3f3f3f3f3f3f3f;
const int mod=998244353;
typedef pair<int,int> pii;
#define _ 200005
int premin[_],a[_],fac[_],inv[_],f[_],pref[_];
int dp[2][_],predp[_];
inline int qpow(int x,int p,int res=1){for(;p;p>>=1,x=x*x%mod) if(p&1) res=res*x%mod;return res;}
inline int c(int n,int m){return m>n? 0:fac[n]*inv[m]%mod*inv[n-m]%mod;}
inline void subtask(){
    int n;cin>>n;
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=1;i<=n;i++) f[a[i]]++;
    premin[0]=f[0];for(int i=1;i<=n;i++) premin[i]=min(premin[i-1],f[i]),pref[i]=(pref[i-1]+f[i])%mod;
    int ans=0,now=0;
    for(int i=1;i<=premin[0];i++) dp[1][i]=c(f[0],i),predp[i]=(predp[i-1]+dp[1][i])%mod,ans+=dp[1][i]*i%mod*qpow(2,pref[n])%mod,ans%=mod;
    for(int i=1;i<=n;i++){
        for(int j=1;j<=premin[i];j++) dp[now][j]=c(f[i],j)*((predp[premin[i-1]]-predp[j]+mod)%mod)%mod;
        int suf=0;
        for(int j=1;j<=f[i];j++) suf+=c(f[i],j),suf%=mod;
        for(int j=1;j<=premin[i];j++) dp[now][j]+=dp[1-now][j]*suf%mod,dp[now][j]%=mod,suf=(suf-c(f[i],j)+mod)%mod;
        for(int j=1;j<=premin[i];j++) predp[j]=(predp[j-1]+dp[now][j])%mod;
        for(int j=1;j<=premin[i];j++) ans+=dp[now][j]*j%mod*qpow(2,pref[n]-pref[i])%mod,ans%=mod;
        now=1-now;
    }
    cout<<ans<<endl;
    for(int i=0;i<=n;i++) f[i]=0;
}
signed main(){
    ios::sync_with_stdio(false);
    fac[0]=1;
    for(int i=1;i<=200000;i++) fac[i]=fac[i-1]*i%mod;
    inv[200000]=qpow(fac[200000],mod-2);
    for(int i=200000-1;i>=0;i--) inv[i]=inv[i+1]*(i+1)%mod;
    int t;cin>>t;
    while(t--) subtask();
    return 0;
}
```

## CF2030F

主观难度：提高+/省选-

标签：贪心、线段树、双指针

首先你还是要看出一点（感觉cf很多题都需要你首先能看出什么性质来），如果询问区间出现类似 `a ... b ... a ... b` 这样的情况，即两个相同的数交叉，那么该区间肯定是消不掉的。

于是我们的任务就是判断一个给定的区间是否包含这样的四个数。

然后我们还需要看出一点，如果一个区间可以消掉，那么其包含的小区间也可以。这就意味着有单调的性质。我们不妨设 $far[x]$ 为以 $x$ 为左端点的区间中，最大的合法区间的右端点能到哪里。

因为有单调的性质，于是我们就可以考虑使用双指针来快速地处理出 $far[x]$。处理出来后后续的询问就很好解决了。

走双指针 $l$ 和 $r$，先固定 $l$ 表示正在求 $far[l]$，$r$ 不断尝试往前走。当 $r$ 扫到一个数字 $x$ 的时候，如果当前的 $x$ 的上一个 $x$ 出现的位置比 $l$ 还小，那么 $r$ 就可以往前移动。反之，$x$ 就可能是 `a ... b ... a ... b` 情况中的 `b`。于是我们在当前 $x$ 和 上个 $x$ 之间寻找是否有类似的 `a`。我们不妨把所有加入当前双指针区间的数字的上一个相同数字出现的位置加入线段树中维护，这样我们只需要在两个 $x$ 之间的区间内询问一个最小值，然后判断这个最小值是否比上一个 $x$ 还靠前就好了。值得注意的是，加入一个数字时如果上一个出现的位置比 $l$ 还小的话就不必加入到线段树了。$r$ 不断往前移动，再也移动不了了就计算出来了 $far[l]$ ，同时 $l$ 往前移动。$l$ 往前移动的时候，注意可能还需要在线段树中删掉一个元素。

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
int in[_],lst[_],nxt[_],far[_],bu[_],tree[_<<4];
void modify(int k,int l,int r,int x,int y){
    if(l==r) return tree[k]=y,void();
    int mid=(l+r)>>1;
    if(x<=mid) modify(ls(k),l,mid,x,y);
    else modify(rs(k),mid+1,r,x,y);
    tree[k]=min(tree[ls(k)],tree[rs(k)]);
}
int query(int k,int l,int r,int x,int y){
    if(l>=x&&r<=y) return tree[k];
    int mid=(l+r)>>1,ans=inf;
    if(x<=mid) ans=min(ans,query(ls(k),l,mid,x,y));
    if(y>=mid+1) ans=min(ans,query(rs(k),mid+1,r,x,y));
    return ans;
}
void build(int k,int l,int r){
    if(l==r) return tree[k]=inf,void();
    int mid=(l+r)>>1;
    build(ls(k),l,mid);
    build(rs(k),mid+1,r);
    tree[k]=inf;
}
bool flag=false;
inline void subtask(){
    int n,q;cin>>n>>q;
    for(int i=1;i<=n;i++) cin>>in[i];
    for(int i=1;i<=n;i++) bu[i]=0;
    for(int i=1;i<=n;i++) lst[i]=bu[in[i]],bu[in[i]]=i;
    for(int i=1;i<=n;i++) bu[i]=inf;
    for(int i=n;i>=1;i--) nxt[i]=bu[in[i]],bu[in[i]]=i;
    build(1,1,n);
    int l=1,r=1;
    while(l<=n){//move l
        while(r<n){//move r
            if(lst[r+1]<l) r++;
            else{
                int ml=lst[r+1]+1,mr=r;
                int t=query(1,1,n,ml,mr);
                if(t>lst[r+1]){
                    modify(1,1,n,r+1,lst[r+1]);
                    r++;
                }
                else break;
            }
        }
        far[l]=r;
        if(nxt[l]<=r) modify(1,1,n,nxt[l],inf);
        l++;
    }
    for(int i=1;i<=q;i++){
        int ql,qr;cin>>ql>>qr;
        if(qr>far[ql]) cout<<"NO"<<endl;
        else cout<<"YES"<<endl;
    }
}
signed main(){
    ios::sync_with_stdio(false);
    int t;cin>>t;
    if(t==1) flag=true;
    while(t--) subtask();
    return 0;
}
```

## CF2030G1/CF2030G2

感觉不是自己能做出来的，先摆烂，有机会再补。
