@meta

```json
{
	"id": "mo_ni_sai",
	"createTime": "2022-09-30 11:51",
	"summary": "高二时准备csp前打的模拟赛的一些错误总结",
	"key": ["csp", "模拟赛", "错误总结", "51nod", "清北学堂"],
	"background": "https://www.caiwen.work/wp-content/uploads/2022/09/0ed357bab5483ff440243c926d4fd2cd.jpeg"
}
```

## 9-5测试

t1：ac

t2：ac

t3：后缀数组，不会

t4：暴力也要尽可能优化。多过一个点也能超过很多人

## 9-7测试

t1：要注意，使用滚动数组后，最后要注意调用最后的滚动数组需要`arr[now]`，而不是`arr[1-now]`

t2：ac

t3：网络流，不会

## 51nod第一场

t1：交代码的时候要最后测试一下，确保调试输出都删除干净了

t2：状压dp由于$n*2^n$的极限复杂度，在枚举状态的大循环里面要避免大常数操作。比如可以预处理的数据要预处理，尽量不要通篇longlong

**t3：错误的算法却ac，未修改**

t4：树上使用并查集

## 51nod第二场

t1：和上面不同，如果时间复杂度足够，一定要开longlong！

t2：树上倍增

**t3：好像是一种经典的树上dp，zhx讲过类似的。未修改**

**t4：莫队+根号分治，未修改**

## 19清北学堂模拟-1

t0：一定要再三确定快读没有打错，不然全爆零！！！！注意时间分配，优先拿到暴力分，暴力打的好分数也不少了

t1：ac

t2：要注意留出时间认真审题（最后草草审题写暴力大概率爆零）。即使有正解，对于暴力分也要尽量打暴力，确保暴力分是稳拿的。或者造符合暴力测试点的测试数据，确保正解可以通过具有特殊性质的测试点

t3：题解没看懂，不改了

## 19清北学堂模拟-2

t0：再次体现了上面所说的策略，三道题都没有想到正解。

t1使用noip2012年的题目的一个结论进行玄学优化，暴力期望20pts，但另外20pts的暴力通过玄学优化也得到了（一开始其实是30pts，如果按照上面的策略，暴力越暴力越好，确保暴力分稳拿的话，就是40pts）；

t2如果打表过程的时间占用不大，但是数据大的话，可以将打表程序合在主程序里，相当于预处理到数组中；

t3即使是暴力分的测试点也要看好数据范围。换句话说，即使选择拿暴力分，数组范围也要尽量按正解的数据范围开

## 51nod第三场

t1: ac。dp时，如果一个下标可以通过另一个下标推导过来，那么这个下标可以被消掉，达到优化空间的效果。考虑进一步优化时，可以考虑滚动数组。使用滚动数组可以将dp的一维提出来，在最外层循环，但记录的时候只记录当前和上一个。这样虽然时间复杂度没变，但空间复杂度大大降低。

t2：ac。如果题目数据比较容易生成，暴力容易写，那么最好使用对拍。对拍没出现错误则大概率ac。

t3：构造题，太难了，看题解证明了几个小时才把题目完全理解明白。值得学习的是，由于犯懒，对于$n>=1000$的数据直接选择输出无解。实际上仍然需要拼一把，使用dfs继续暴力，据说dfs写得好可以80pts。  
另外还有一种大根堆和小根堆的写法

```cpp
class maxx{
	public:
		inline bool operator()(int x,int y){
			return d[x]<d[y];
		}
};
class minn{
	public:
		inline bool operator()(int x,int y){
			return d[x]>d[y];
		}
};
priority_queue<int,vector<int>,minn> qmin;
priority_queue<int,vector<int>,maxx> qmax;
```

（qmax大根堆，qmin小根堆，大根堆重载用小于号，小根堆重载用大于号）

t4：涉及到线段树上构成区间的点在一条链上。如果是区间$[l,r]$，那么这条链就是$(l-1,r+1)$。除此之外，还需要特判 $l=1$ 且 $r=n$时 ，$l=1$和$r=n$。在对链进行维护时，使用树链剖分，注意从轻链跳到重链的时候要暴力修改，注意跳过一个链条时要去掉一头，在一个链条上时要去掉两头。由于每个链条的端点都需要建立线段树，所以线段树数量很多，因此开线段树时，sum和lazy数组要用vector，根据链条的长度来调节线段树的大小。

## 清北学堂Day3

t1:之前在51nod上做过，ac

t2:一开始想到了一个一个大根堆一个小根堆的做法。中间是用对拍，成功发现了代码存在错误，修改后对拍了几千数据没有发现错误，再次体现了对拍的重要性。但是被卡了，70pts，tle。看题解才知道是一个线段树上二分的题目。

使用离散化+二次离散化（即先把大数离散化为小数，然后相同的数之间再离散化成不同的数，相当于每个数都对应一个独一无二的id，相同的数之间的id不同。但是如果$a_i<a_j$则必有$id_i<id_j$）

二次离散化之后，根据id建立一个类似于值域线段树。这样以来，我们可以利用线段树上的各种特性，如区间求和。其次，在插入和删除一个数之后，这些数在线段树上其实还是排序过的，这就无形之间排序了

一开始看到线段树二分，就想了一个$nlognlogn$的做法，但tle+wa了。实际上，线段树作为一个完全二叉树，本身就可以二分的，只需要$nlogn$

值得一提的是，中间开了1e6个stl的queue，发现程序刚运行，还未输入数据的时候运行奇慢。而且运行过程中查看任务管理器发现mle，这提醒我们对拍生成大数据测试时要打开任务管理器确保不会mle。

前几次写出来之后对拍，使用中等规模数据对拍，发现都可以通过，但提交之后只有30pts，还不如自己一开始写的。而使用小规模数据，或者特殊数据（比如序列只有1和2），不仅对拍速度快，快速得到hack数据，wa之后也能轻松分析数据，修改程序。

t3:一开始想了个dijkstra的做法，但其实dijkstra算法要求无后效性，但是原题是有后效性的。但感觉这个算法应该可以骗到一定的分数，就对规模较大的数据应用了这个错误算法。为了保险，在dijkstra算出一个答案之后，选择使用dfs进行优化答案。但是dfs会超时，就加入卡时的技巧。最后骗到70pts（貌似dfs优化答案+卡时并没有发挥效果）

看题解后了解到，对于最小化两个$\sum$相乘这种类型，可以将每个决策点看做二维平面上的一个点。先根据$w_a$，求出一个最短路（一个决策点A），再根据$w_b$，求出一个决策点B，则更优的决策点一定在这两个点连线的下方。使用向量叉乘，得到和两个点围成面积最大的另一个点C，然后再$solve(A,C)，solve(C,B)$进行分治。

t4:遇到了和之前类似的，有关字典序的问题，但依然不会。草草写了个暴力，10pts。

对于之前那道题，我们实际上是求某个状态下，第i位增加1，对整个序列的排名产生的贡献，既是求第i+1位到最后一位，在某个状态下有多少种情况。而求这个贡献，我们是使用组合数学的方法

对于这道题，我们很难用数学方法直接算出来。我们考虑dp。其中，位置i之前在s序列中选择了多少个数，对于位置i+1到n的情况数存在影响，我们将其作为dp的一维。注意，在dp的时候，由于我们考虑的是位置i+1到n，因此需要倒序dp

对于这两道题，得到每一位对排名的贡献之后，就可以按位枚举，得到需要的序列

对于之前那道题，我们是直接生成为某个排名的序列，我们从第一位开始枚举

对于这道题，我们要求比某个序列排名大指定排名的序列。我们在原始序列的基础上，倒着枚举。

### T2：二次离散化+线段树二分

```cpp
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
#include<queue>
#define ls(k) (k)<<1
#define rs(k) (k)<<1|1
using namespace std;

int sum1,cnt1,sum2,cnt2;

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

int in[1000006],uni[1000006],tot;
int n;
int id[1000006];
int pre[1000006];
int to_uni[1000006];
vector<int> tmp;
struct Entry{
	int index,value,id,opt;
} fin[1000006];

int sum[1000006<<4];
int w[1000006<<4];
void update(int k,int l,int r,int x,int d){
	if(l==r){
		sum[k]+=to_uni[l]*d;
		w[k]+=d;
		return;
	}
	int mid=(l+r)>>1;
	if(x<=mid){
		update(ls(k),l,mid,x,d);
	}else{
		update(rs(k),mid+1,r,x,d);
	}
	sum[k]=sum[ls(k)]+sum[rs(k)];
	w[k]=w[ls(k)]+w[rs(k)];
}

//线段树二分
int tota=0;
void collect1(int k,int l,int r){
	if(l==r){
		if(sum[k]&&((sum1+sum[k])<<1)<=tota) cnt1++,sum1+=sum[k];
		return;
	}
	int mid=(l+r)>>1;
	if(((sum1+sum[ls(k)])<<1)<=tota){
		cnt1+=w[ls(k)];
		sum1+=sum[ls(k)];
		collect1(rs(k),mid+1,r);
	}else{
		collect1(ls(k),l,mid);
	}
}
void collect2(int k,int l,int r){
	if(l==r){
		if(sum[k]&&((sum2+sum[k])<<1)<=tota) cnt2++,sum2+=sum[k];
		return;
	}
	int mid=(l+r)>>1;
	if(((sum2+sum[rs(k)])<<1)<=tota){
		cnt2+=w[rs(k)];
		sum2+=sum[rs(k)];
		collect2(ls(k),l,mid);
	}else{
		collect2(rs(k),mid+1,r);
	}
}

bool cmp1(Entry a,Entry b){
	if(a.value==b.value) return a.index<b.index;
	return a.value<b.value;
}
bool cmp2(Entry a,Entry b){
	return a.index<b.index;
}

int now=0;
signed main(){
	//cout<<sizeof(id)/1024/1024<<endl;
	//第一次离散化
	n=read();
	for(int i=1;i<=n;i++){
		in[i]=read();
		if(in[i]>0){
			uni[++tot]=in[i];
		}
	}
	sort(uni+1,uni+1+tot);
	tot=unique(uni+1,uni+1+tot)-uni-1;
	for(int i=1;i<=n;i++){
		if(in[i]>0){
			in[i]=lower_bound(uni+1,uni+tot+1,in[i])-uni;
		}else{
			in[i]=lower_bound(uni+1,uni+tot+1,-in[i])-uni;
			in[i]=-in[i];
		}
	}

	//第二次离散化，先分好操作
	for(int i=1;i<=n;i++){
		fin[i].index=i;
		if(in[i]>0){
			fin[i].value=in[i];
			fin[i].opt=1;
		}else{
			fin[i].value=-in[i];
			fin[i].opt=2;
		}
	}
	//排序，分配id
	sort(fin+1,fin+n+1,cmp1);
	for(int i=1;i<=n;i++){
		if(fin[i].opt==1){
			fin[i].id=i;
			to_uni[i]=uni[fin[i].value];
		}
	}
	//排序，恢复原来排序
	sort(fin+1,fin+n+1,cmp2);
	//给删除操作分配id
	for(int i=1;i<=n;i++){
		if(fin[i].opt==1){
			pre[fin[i].id]=id[fin[i].value];
			id[fin[i].value]=fin[i].id;
		}else{
			fin[i].id=id[fin[i].value];
			//cout<<"<<"<<fin[i].id<<endl;
			id[fin[i].value]=pre[id[fin[i].value]];
		}
	}

	for(int i=1;i<=n;i++){
		if(fin[i].opt==1){
			update(1,1,n,fin[i].id,1);
			tota+=uni[fin[i].value];
			now++;
		}else{
			update(1,1,n,fin[i].id,-1);
			tota-=uni[fin[i].value];
			now--;
		}
		sum1=sum2=cnt1=cnt2=0;
		collect1(1,1,n);
		collect2(1,1,n);
		if(abs(sum1-(tota-sum1))<abs(sum2-(tota-sum2))){
			cout<<now-cnt1<<' ';
		}
		if(abs(sum1-(tota-sum1))>abs(sum2-(tota-sum2))){
			cout<<cnt2<<' ';
		}
		if(abs(sum1-(tota-sum1))==abs(sum2-(tota-sum2))){
			cout<<min(now-cnt1,cnt2)<<' ';
		}
	}
	return 0;
}

/*
8
3 4 5 3 3 -3 -3 4
*/
```

### T3:最小化乘积

```cpp
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
#include<queue>
#define int long long
using namespace std;

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

struct Point{
	int x,y;
	Point(int _x,int _y){
		x=_x;y=_y;
	}
};
inline Point getmin(Point a,Point b){
	int sa=a.x*a.y;
	int sb=b.x*b.y;
	if(sa<sb) return a;
	return b;
}

struct Edge{
	int to,next,wa,wb;
} edge[40004];
int head[10004],size;
inline void add(int u,int v,int wa,int wb){
	size++;
	edge[size].to=v;
	edge[size].wa=wa;
	edge[size].wb=wb;
	edge[size].next=head[u];
	head[u]=size;
}

int dis[10004],vis[10004];
int suma[10004],sumb[10004];
int s,t;
Point dijkstra(Point A,Point B){
	memset(dis,0x3f,sizeof(dis));
	memset(vis,0,sizeof(vis));
	memset(suma,0,sizeof(suma));
	memset(sumb,0,sizeof(sumb));
	queue<int> q;
	dis[s]=0;
	q.push(s);
	while(!q.empty()){
		int now=q.front();q.pop();
		vis[now]=false;
		for(int i=head[now];i;i=edge[i].next){
			int to=edge[i].to;
			int w=(B.x-A.x)*edge[i].wb+(A.y-B.y)*edge[i].wa;
			if(dis[now]+w<dis[to]){
				dis[to]=dis[now]+w;
				suma[to]=suma[now]+edge[i].wa;
				sumb[to]=sumb[now]+edge[i].wb;
				if(!vis[to]){
					vis[to]=true;
					q.push(to);
				}
			}
		}
	}
	return Point(suma[t],sumb[t]);
}

Point ans(0x3f3f3f3f,0x3f3f3f3f);
void solve(Point a,Point b){
	Point c=dijkstra(a,b);
	ans=getmin(ans,c);
	int tx=b.x-a.x;
	int ty=b.y-a.y;
	int fx=c.x-a.x;
	int fy=c.y-a.y;
	if(tx*fy-ty*fx>=0) return;
	solve(a,c);
	solve(c,b);
}

int n,m;
signed main(){
	n=read(),m=read(),s=read(),t=read();
	for(int i=1;i<=m;i++){
		int u=read(),v=read(),a=read(),b=read();
		add(u,v,a,b);
		add(v,u,a,b);
	}
	Point a=dijkstra(Point(0,1),Point(0,0));
	Point b=dijkstra(Point(0,0),Point(1,0));
	ans=getmin(a,b);
	solve(a,b);
	cout<<ans.x*ans.y;
	return 0;
}

/*
4 5 1 4
1 2 2 3
1 3 3 3
1 4 5 5
2 4 3 1
3 4 1 3
*/
```

### T4:字典序排名

```cpp
#include<iostream>
#include<cstdio>
#include<algorithm>
#include<cstdlib>
#include<cstring>
#include<cmath>
#define fre(z) freopen(z".in","r",stdin),freopen(z".out","w",stdout)
using namespace std;
const int N=3010;
long long f[N][N];
//f[i][j]
//从j位置开始，包括j位置，再一直到最后，总共多少种情况（对序列排名贡献）
//i表示已经匹配了多少个子序列，因为这一维有后效性
int a[N],b[N],pre[N];
int main() {
	int i,n,m,j,k,p;char c;long long Q;
	while ((c=getchar())<'1'||'9'<c);
	a[n=1]=c-'0';
	while ('1'<=(c=getchar())&&c<='9') a[++n]=c-'0';
	while ((c=getchar())<'1'||'9'<c);
	b[m=1]=c-'0';
	while ('1'<=(c=getchar())&&c<='9') b[++m]=c-'0';
	f[n+1][m+1]=1;
	cin>>Q;

	//对f进行最大值限制：Q+1
	//因为我们不希望从头开始枚举得到ans，这样的话我们还需要求出t序列的排名
	//最后求ans的时候是从t的基础上枚举
	//实际上，有了最大值限制，保证整个计算不会爆long long。
	//枚举时，如果Q大于贡献值，就减去，最大值限制这个行为没有产生影响
	//		  如果Q小于，那么当前枚举的数就枚举对了，就进一步细化ans序列，最大值限制也没有产生影响

	//由于i下标从1开始枚举，实际上第一个位置，不包括第一个位置，之前，是有0个数在s序列中被选择
	//所以i的实际意义是前面选择了x+1个数，需要把i下标-1才是实际意义
	for (j=m;j;j--) f[n+1][j]=min(f[n+1][j+1]*9,Q+1);
	//s序列前面枚举完了，再往后面每一位都*9即可，没有s序列的限制带来的麻烦了

	for (i=n;i;i--)
		for (j=m;j;j--)
			f[i][j]=min(f[i][j+1]*8+f[i+1][j+1],Q+1);
	//i是j位置之前，不包括j位置，选了多少个s序列
	//j这个位置选其余8个数，8种情况，且i不加1
	//j这个位置又往后选了个在s序列里的数，一种情况，i+1

	for(int i=1;i<=n;i++){
		for(int j=1;j<=m;j++){
			cout<<f[i][j]<<' ';
		}
		cout<<endl;
	}

	for (i=1;i<=m;i++) pre[i]=pre[i-1]+(b[i]==a[pre[i-1]+1]);


	for (j=m;j;j--) {
		for (k=b[j]+1;k<=9;k++){//确保排名比t序列大
			//cout<<"["<<j<<"]->"<<k<<",p:"<<pre[j-1]+(k==a[pre[j-1]+1])+1<<",q"<<Q<<endl;
			//最后的+1是实际情况转换为约定情况
			if (Q<=f[pre[j-1]+(k==a[pre[j-1]+1])+1][j+1]) {
				//枚举位置之前的数都原封不动
				for (i=1;i<j;i++) printf("%d",b[i]);printf("%d",k);
				p=pre[j-1]+(k==a[pre[j-1]+1]);
				for (++j;j<=m;j++,p+=k==a[p+1])
					for (k=1;k<=9;k++)
						if (Q<=f[p+(k==a[p+1])+1][j+1]) {
							printf("%d",k);
							break;
						}
						else Q-=f[p+(k==a[p+1])+1][j+1];
				return 0;
			}
			else Q-=f[pre[j-1]+(k==a[pre[j-1]+1])+1][j+1];
		}
	}
}
```
