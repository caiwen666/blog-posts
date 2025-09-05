@meta

```json
{
	"id": "uva1086",
	"createTime": "2022-07-02 16:22",
	"summary": "UVA1086 The Ministers' Major Mess的题解",
	"key": ["题解", "uva1086", "tarjan", "2sat"],
	"background": "https://www.caiwen.work/wp-content/uploads/2022/07/16.png"
}
```

::: success 说明
本文作为洛谷UVA1086 The Ministers' Major Mess[^1]的题解，已经在洛谷发布。

https://www.luogu.com.cn/problem/solution/UVA1086
[^1]:UVA1086 The Ministers' Major Mess https://www.luogu.com.cn/problem/UVA1086
:::

## 题意简述

有 $B$（$1 \leq B \leq 100$）个提案和 $M$（$1 \leq M \leq 500$）个议员。每个议员可以对 $K$（$1 \leq K \leq 100$）个提案投票，作出 **通过** 或者 **否决** 的决定。现在你需要对每个议案的最终结果作出判断，使得每个议员的决定都有超过半数以上和最终结果相吻合。

## 题目分析

首先要注意 $K$ 的范围非常小，我们可以分情况讨论：

$K = 1$ ，那么这个议员的决定必须是最后结果，才能满足 **使得每个议员的决定都有超过半数以上和最终结果相吻合**。

$K=2$ ，此时需要注意 **超过半数以上** 的含义，在原题的 pdf 文档中的英文描述是 **more than half**，这意味着符合的数目要比一半多，不能等于一半。$K=2$ 的时候的一半是 $1$，比一半多意味着两个决定都要与最终吻合。

$K=3$，按照上述思路，需要有至少两个决定与最终结果吻合。也就是说如果有一个决定不吻合了，那么剩下的两个决定都必须吻合。

$K=4$，一半是 $2$，超过一半，也就是 $3$，需要有至少 $3$ 个决定与最终吻合，一个决定不吻合了剩下三个就都需要吻合。

这种如果一个决定不吻合，剩下两个/三个都必须吻合，启示我们可以使用 $2-SAT$ 来解决。

## 代码分析

下面规定 $e$ 表示一个提案，$a$ 表示对这个提案做出的决定。点 $i$ 表示的是提案为**否定**，$false$；点 $i+n$ 表示的是提案为**通过**，$true$。

对于提案最终必须是某种情况，我们可以写个 $must$ 函数：提案 $e$ 最后必须是 $a$ 情况。

```cpp
inline void must(int e,char a){
	if(a=='y'){
		add(e,e+n);
	}else{
		add(e+n,e);
	}
}
```

想让一个点必须是 $false$，可以让这个点的 $true$ 向这个点的 $false$ 连一条边。另一情况同理。

对于一个提案的决定与最终不符的话，其他决定必须相符的情况，我们可以写个 $op$ 函数（具体含义看代码）。

```cpp
inline void op(int e1,char a1,int e2,char a2){
	if(a1=='y'){
		if(a2=='y') add(e1,e2+n);
		else add(e1,e2);
	}else{
		if(a2=='y') add(e1+n,e2+n);
		else add(e1+n,e2);
	}
}
```

（定义这两个函数的目的是为了之后的建边的代码好写）

然后建边部分：

```cpp
for(int i=1;i<=m;i++){
	int k,e1,e2,e3,e4;
	char a1,a2,a3,a4;
	cin>>k;
	if(k==1){
		cin>>e1>>a1;
		must(e1,a1);
	}
	if(k==2){
		cin>>e1>>a1>>e2>>a2;
		must(e1,a1);
		must(e2,a2);
	}
	if(k==3){
		cin>>e1>>a1>>e2>>a2>>e3>>a3;
		op(e1,a1,e2,a2);
		op(e1,a1,e3,a3);

		op(e2,a2,e1,a1);
		op(e2,a2,e3,a3);

		op(e3,a3,e2,a2);
		op(e3,a3,e1,a1);
	}
	if(k==4){
		cin>>e1>>a1>>e2>>a2>>e3>>a3>>e4>>a4;
		op(e1,a1,e2,a2);
		op(e1,a1,e3,a3);
		op(e1,a1,e4,a4);

		op(e2,a2,e1,a1);
		op(e2,a2,e3,a3);
		op(e2,a2,e4,a4);

		op(e3,a3,e2,a2);
		op(e3,a3,e1,a1);
		op(e3,a3,e4,a4);

		op(e4,a4,e2,a2);
		op(e4,a4,e1,a1);
		op(e4,a4,e3,a3);
	}
}
```

建好边之后就是常规的 $2-SAT$ 解法:

$tarjan$：

```cpp
int n;
stack<int> s;
int low[maxn],dfn[maxn];
int _time;
bool lock[maxn];
int id[maxn];
int tot;
void dfs(int x);
void tarjan(){
	memset(low,0,sizeof(low));
	memset(dfn,0,sizeof(dfn));
	_time=0;
	memset(lock,0,sizeof(lock));
	memset(id,0,sizeof(id));
	tot=0;
	for(int i=1;i<=n*2;i++){
		if(!dfn[i]) dfs(i);
	}
}
void dfs(int x){
	low[x]=dfn[x]=++_time;
	s.push(x);
	lock[x]=true;
	for(int i=head[x];i;i=edge[i].next){
		int to=edge[i].to;
		if(!dfn[to]){
			dfs(to);
			low[x]=min(low[x],low[to]);
		}else if(lock[to]) low[x]=min(low[x],dfn[to]);
	}
	if(low[x]==dfn[x]){
		tot++;
		while(true){
			int k=s.top();s.pop();
			id[k]=tot;
			lock[k]=false;
			if(k==x) break;
		}
	}
}
```

这里在 dfs 之前把 $low$，$dfn$ 等变量都重置了，因为我们不止会用一次 $tarjan$，这个在后面会说。

然后单独写一个函数判断是否有解：

```cpp
inline bool check(){
	for(int i=1;i<=n;i++){
		if(id[i]==id[i+n]){
			return false;
		}
	}
	return true;
}
```

然后我们将最后的可能的一种答案存放在 $ans$ 数组中，注意数组是 `int` 类型的，这个后面也会说。

```cpp
for(int i=1;i<=n;i++){
	if(id[i+n]<id[i]) ans[i]=true;
	else ans[i]=0;
}
```

然后题目和一般的 $2-SAT$ 不同，他不让你求一种可能结果，而是对于一些可以通过，也可以否定的提案输出 `?`，如何判断一个提案是 `?` 而不是一个确定的结果呢？

我们可以这样，如果求得的一个可能的答案为 `y`，那么我们加一条从 $true$ 到 $false$ 的边，即强制选择 $false$。再跑一遍 $tarjan$，如果还有解，那么说明这个提案否定和通过都可以；如果无解，那么说明这个提案最后必须是通过。

```cpp
//判断是否可以为问号
for(int i=1;i<=n;i++){
	if(ans[i]==true){
		must(i,'n');
		tarjan();
		if(check()) ans[i]=3;
	}else{
		must(i,'y');
		tarjan();
		if(check()) ans[i]=3;
	}
	redo();
}
```

$ans$ 数组中 $0$ 代表必须是否定，$1$ 代表必须是肯定，$3$ 代表都可以。

注意这里有个 $redo$ 函数，用来撤销用于判断一个提案是否为 `?` 时建的边：

```cpp
inline void redo(){
	head[edge[size].from]=edge[size].next;
	size--;
}
```

建图部分：

```cpp
struct Edge{
	int from,next,to;
} edge[15*500];
int head[201];
int size;
inline void add(int u,int v){
	size++;
	edge[size].to=v;
	edge[size].next=head[u];
	edge[size].from=u;
	head[u]=size;
}
inline void redo(){
	head[edge[size].from]=edge[size].next;
	size--;
}
```

（注意 $edge$ 数组的大小。为了 $redo$ 操作，$Edge$ 结构体中新增了一个成员：$from$）

最后根据 $ans$ 数组输出。

## 完整代码

```cpp
#include<iostream>
#include<cstring>
#include<stack>
#include<cstdio>
#define maxn 201
using namespace std;

struct Edge{
	int from,next,to;
} edge[15*500];
int head[201];
int size;
inline void add(int u,int v){
	size++;
	edge[size].to=v;
	edge[size].next=head[u];
	edge[size].from=u;
	head[u]=size;
}
inline void redo(){
	head[edge[size].from]=edge[size].next;
	size--;
}

int n;
stack<int> s;
int low[maxn],dfn[maxn];
int _time;
bool lock[maxn];
int id[maxn];
int tot;
void dfs(int x);
void tarjan(){
	memset(low,0,sizeof(low));
	memset(dfn,0,sizeof(dfn));
	_time=0;
	memset(lock,0,sizeof(lock));
	memset(id,0,sizeof(id));
	tot=0;
	for(int i=1;i<=n*2;i++){
		if(!dfn[i]) dfs(i);
	}
}
void dfs(int x){
	low[x]=dfn[x]=++_time;
	s.push(x);
	lock[x]=true;
	for(int i=head[x];i;i=edge[i].next){
		int to=edge[i].to;
		if(!dfn[to]){
			dfs(to);
			low[x]=min(low[x],low[to]);
		}else if(lock[to]) low[x]=min(low[x],dfn[to]);
	}
	if(low[x]==dfn[x]){
		tot++;
		while(true){
			int k=s.top();s.pop();
			id[k]=tot;
			lock[k]=false;
			if(k==x) break;
		}
	}
}

inline void must(int e,char a){
	if(a=='y'){
		add(e,e+n);
	}else{
		add(e+n,e);
	}
}


inline void op(int e1,char a1,int e2,char a2){
	if(a1=='y'){
		if(a2=='y') add(e1,e2+n);
		else add(e1,e2);
	}else{
		if(a2=='y') add(e1+n,e2+n);
		else add(e1+n,e2);
	}
}

int ans[101];
inline bool check(){
	for(int i=1;i<=n;i++){
		if(id[i]==id[i+n]){
			return false;
		}
	}
	return true;
}
inline void clear(){
	memset(edge,0,sizeof(edge));
	memset(head,0,sizeof(head));
	size=0;
}
inline void subtask(int cas,int b,int m){
	clear();
	n=b;
	for(int i=1;i<=m;i++){
		int k,e1,e2,e3,e4;
		char a1,a2,a3,a4;
		cin>>k;
		if(k==1){
			cin>>e1>>a1;
			must(e1,a1);
		}
		if(k==2){
			cin>>e1>>a1>>e2>>a2;
			must(e1,a1);
			must(e2,a2);
		}
		if(k==3){
			cin>>e1>>a1>>e2>>a2>>e3>>a3;
			op(e1,a1,e2,a2);
			op(e1,a1,e3,a3);

			op(e2,a2,e1,a1);
			op(e2,a2,e3,a3);

			op(e3,a3,e2,a2);
			op(e3,a3,e1,a1);
		}
		if(k==4){
			cin>>e1>>a1>>e2>>a2>>e3>>a3>>e4>>a4;
			op(e1,a1,e2,a2);
			op(e1,a1,e3,a3);
			op(e1,a1,e4,a4);

			op(e2,a2,e1,a1);
			op(e2,a2,e3,a3);
			op(e2,a2,e4,a4);

			op(e3,a3,e2,a2);
			op(e3,a3,e1,a1);
			op(e3,a3,e4,a4);

			op(e4,a4,e2,a2);
			op(e4,a4,e1,a1);
			op(e4,a4,e3,a3);
		}
	}
	tarjan();
	if(!check()){
		cout<<"Case "<<cas<<": impossible"<<endl;
		return;
	}
	for(int i=1;i<=n;i++){
		if(id[i+n]<id[i]) ans[i]=true;
		else ans[i]=0;
	}
	//判断是否可以为问号
	for(int i=1;i<=n;i++){
		if(ans[i]==true){
			must(i,'n');
			tarjan();
			if(check()) ans[i]=3;
		}else{
			must(i,'y');
			tarjan();
			if(check()) ans[i]=3;
		}
		redo();
	}
	cout<<"Case "<<cas<<": ";
	for(int i=1;i<=n;i++){
		if(ans[i]==0) cout<<"n";
		else if(ans[i]==1) cout<<"y";
		else if(ans[i]==3) cout<<"?";
	}
	cout<<endl;
}

int main(){
	int cas=0;
	while(true){
		cas++;
		int b,m;
		cin>>b>>m;
		if(b==0&&m==0) return 0;
		else subtask(cas,b,m);
	}
	return 0;
}
```
