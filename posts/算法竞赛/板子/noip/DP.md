@meta

```json
{
	"id": "noip-dp",
	"createTime": "2022-10-25 10:27",
	"summary": "noip提高级范围内的dp算法知识点和模板，自用。",
	"key": ["noip", "模板", "dp"],
	"background": "https://www.caiwen.work/wp-content/uploads/2022/10/QQ截图20221121124101.png",
	"tags": [{ "value": "自用", "color": "primary" }],
	"status": "discard"
}
```

## 背包dp

### 01背包

（1）枚举物品 $i$

（2）倒叙枚举体积 $j$

（3）$dp[j]=max(dp[j],dp[i-v[i]]+w[i])$

### 完全背包

同上，倒叙枚举变为正序枚举

### 多重背包

二进制拆分

将一个数拆分成 1、2、4、8...，这样的拆分满足拆分出来的数相互加可以加出从1到n之间的所有数的性质

```cpp
	for(int i=1;i<=n;i++){
		int vi,wi,si;
		cin>>vi>>wi>>si;
		for(int j=1;j<=si;j<<=1){
			si-=j;
			int n_vi=j*vi,n_wi=j*wi;
			for(int k=v;k>=n_vi;k--){
				dp[k]=max(dp[k],dp[k-n_vi]+n_wi);
			}
		}
		if(si){
			int n_vi=si*vi,n_wi=si*wi;
			for(int k=v;k>=n_vi;k--){
				dp[k]=max(dp[k],dp[k-n_vi]+n_wi);
			}
		}
	}
```

### 混合背包

在枚举物品之后，根据物品类型进行相应的转移即可

### 二维费用背包

多循环一层即可

### 分组背包

先枚举组别，再枚举体积，再枚举物品

### 树形背包

物品之间的关系用森林表示，就需要用树形背包

首先可以建立一个超级源点，将森林转化为一个树

状态 $dp[x][k]$ 表示以x为根的子树，选择了k个点（包括根节点）的最大价值

对于每个点，初始化 $dp[x][0]=0$，对于其他状态，$dp[x][i]=负无穷$  
首先枚遍历子节点，对于每个子节点，倒序枚举当前节点的容量，然后再枚举这个子节点选了多少个点

```cpp
dp[x][0]=0;
for(int i=0;i<ve[x].size();i++){
	int to=ve[x][i];
	dfs(to);
	for(int j=n;j>=0;j--){
		for(int k=0;k<=j;k++){
			dp[x][j]=max(dp[x][j],dp[x][j-k]+dp[to][k]);
		}
	}
}
```

遍历子节点时，就相当于枚举了一个物品，然后倒序枚举体积，就相当于一个01背包。而子节点的价值会随着分配给节点的体积改变而改变，相当于泛化物品。**在最内层枚举这个分配给这个子节点分配的容量**

值得注意的是，根节点本身也算一个物品，而上述代码并没有考虑这一点，所以我们需要修正

```cpp
if(x!=0){
	for(int i=n;i>=0;i--){
		dp[x][i]=dp[x][i-1]+w[x];
	}
}
```

## 换根dp

先选择第一个点进行dp。然后再进行一个dfs，进行换根

换根的时候，需要用父节点的答案去推得子节点的答案。具体的：对于 $u->v$ ，首先在u节点答案的基础上，减去v节点对其的贡献，然后考虑u节点剩余答案如何贡献v节点的答案

示例

```cpp
void dfs2(int x,int fa){
	for(int i=head[x];i;i=edge[i].next){
		int to=edge[i].to;
		if(to==fa) continue;
		int u=dp[x],v=dp[to];
		if(v>0) u-=v;//消除v对u的贡献
		if(u>0) v+=u;//考虑剩余u对v的贡献
		dp[to]=ans[to]=v;
		dfs2(to,x);
	}
}
```

## 数位dp

状态一般为 $dp[pos][其他需要记录的][lim][zero]$

求指定区间内满足某一条件的数的个数，采用前缀和思想

```cpp
work(b)-work(a-1)
```

首先需要把数字按位拆开

```cpp
int work(int x,int d){
	memset(dp,-1,sizeof(dp));
	int len=0;
	do{
      //值得注意的是，如果是其他进制下的数位dp，下面的10需要改成相应的进制
		num[++len]=x%10;
		x/=10;
	}while(x);
  //从最高位枚举，一开始就有lim限制
	int ans=dfs(len,0,true,true);
	for(int i=len-1;i>=1;i--){
      //高位上面补0，就没有lim限制了
		ans+=dfs(i,0,false,true);
	}
  //都有zero限制
	return ans;
}
```

记忆化搜索的过程大致如下

```cpp
int dfs(int pos,int cnt,bool lim,bool zero){
	int &tmp=dp[pos][cnt][lim][zero];
	if(tmp!=-1) return tmp;
	if(pos==0) return tmp=cnt;

	tmp=0;
	int maxn=lim? num[pos]:9;
	int minn=zero? 1:0;
	for(int i=minn;i<=maxn;i++){
		tmp+=dfs(pos-1,cnt+(i==d),lim&&(i==maxn),false);
	}

	return tmp;
}
```

## 概率dp

先找到概率为1的状态u，然后据此考虑转移方程

HDU4576 通过取模来解决环状的问题。看似转移循序无序，实际上可以根据指令的先后顺序作为dp的转移顺序。使用0/1滚动数组来优化

POJ3744 有很多概率为1的状态，转移并不是很顺利，所以可以考虑分段，在使用乘法法则求出最终概率

## 期望dp

通过dp、排列组合等计算概率，然后概率乘转移产生贡献（天数+1等）来计算出期望

转移顺序经常是倒推的，因为我们往往知道dp终点的期望而要求dp起点的期望

POJ2096

### 状态转移时的依赖

#### 对单个状态的依赖

ZOJ3329 在状态转移时发现所有的状态的转移都需要依赖 $dp[0]$ 这个状态。而 $dp[0]$ 恰好又是我们想求的。对于这种依赖单个状态，可以将依赖的状态视为未知数，转移时只看系数，最后再解方程

HDU4035 树上的依赖，一个点转移时，依赖于父节点和子节点和根节点（题目要求），而父节点和子节点转移时也会依赖自己，根节点也会依赖于这些点。对此，先从叶子节点下手，叶子节点仅依赖与父节点和根节点。通过方程的代入化简可以使得非叶子节点也仅对父节点和根节点形成依赖。实际上，这就是上面那个题目的有两个未知数的版本。转移时只需考虑系数即可，最终在根节点上解方程

#### 循环依赖

HDU4089 状态转移时，后一个状态依赖于前一个状态，而第一个状态又依赖于最后的状态，循环依赖。对此，可以通过累加、代入的方法将中间的状态全部消掉，最后得到之后一个状态的方程，把第一个或最后一个状态的值解出来，这样循环就被打破

#### 高斯消元

未完待续...

## 基环树

基环树的处理方法有暴力去掉环上一边然后dfs，还有基环树dp  
基环树的每个联通块中有且仅有一个环

首先先进行一个拓扑排序

```cpp
void topo(){
	queue<int> q;
	for(int i=1;i<=n;i++){
		if(in[i]==1) q.push(i);
	}
	while(!q.empty()){
		int now=q.front();q.pop();
		for(int i=head[now];i;i=edge[i].next){
			int to=edge[i].to;
			if(in[to]>1){
				in[to]--;
				if(in[to]==1) q.push(to);
			}
		}
	}
}
```

然后找环上的点，找到了环上的一点就可以顺着把环上的所有的点都找出来。

```cpp
for(int i=1;i<=n;i++){
    if(in[i]<2||vis[i]) continue;
    memset(loop,0,sizeof(loop));
	memset(g,0,sizeof(g));
    cnt=0;
	find(i);
    ...
}
```

find

```cpp
void find(int x){
	vis[x]=true;
	loop[++cnt]=x;
	for(int i=head[x];i;i=edge[i].next){
		int to=edge[i].to;
		if(in[to]<2||vis[to]) continue;
		find(to);
	}
}
```

然后先把环上节点的子树进行dp

```cpp
for(int j=1;j<=cnt;j++){
	dp(loop[j]);
}
```

设 $g[x][0/1][0/1]$ 表示dp到了第x个节点，第x个节点选/不选，第1个节点选/不选

首先分两类：第一个节点选/不选

1. 第一个节点不选，那么初始化第二个节点的信息

```cpp
g[2][1][0]=f[loop[1]][0]+f[loop[2]][1];
g[2][0][0]=f[loop[1]][0]+f[loop[2]][0];
for(int i=3;i<=cnt;i++){
	g[i][0][0]=max(g[i-1][1][0],g[i-1][0][0])+f[loop[i]][0];
	g[i][1][0]=g[i-1][0][0]+f[loop[i]][1];
}
```

2. 第一个节点选，那么初始化第二个和第三个节点的信息。第二个节点肯定不选。

```cpp
g[2][0][1]=f[loop[1]][1]+f[loop[2]][0];
g[3][0][1]=f[loop[1]][1]+f[loop[2]][0]+f[loop[3]][0];
g[3][1][1]=f[loop[1]][1]+f[loop[2]][0]+f[loop[3]][1];
for(int i=4;i<=cnt;i++){
	g[i][0][1]=max(g[i-1][1][1],g[i-1][0][1])+f[loop[i]][0];
	g[i][1][1]=g[i-1][0][1]+f[loop[i]][1];
}
```

最后总结答案

```cpp
ans+=max(max(g[cnt][1][0],g[cnt][0][0]),g[cnt][0][1]);
```
