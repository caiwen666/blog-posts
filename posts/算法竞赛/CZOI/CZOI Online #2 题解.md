@meta

```json
{
	"id": "czoi-online-2-tijie",
	"createTime": "2022-12-13 16:37",
	"summary": "本篇文章是举行在2022年12月16日的 CZOI Online #2 的题解",
	"key": ["czoi"]
}
```

::: success 说明
本篇文章是举行在2022年12月17日的 CZOI Online #2 的题解

比赛页：https://www.luogu.com.cn/contest/94623

T1黑盒（仅有部分数据）：https://www.luogu.com.cn/problem/T297881

T2序列：https://www.luogu.com.cn/problem/T256382

T3滚动（仅有部分数据）：https://www.luogu.com.cn/problem/T297950

T4南瓜：https://www.luogu.com.cn/problem/T256110
:::

## T1 黑盒

### 算法零

注意到测试点11-12的操作2和3都是0，也就是执行操作4时第三个黑盒中没有数字。这样，对于每个操作4全部输出0即可。

```cpp
#include<iostream>
#include<deque>
#include<cstdio>
#include<sstream>
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

int a[1003];
int main(){
	int n=read();
	for(int i=1;i<=n;i++) a[i]=read();
	int q=read();
	int p=1;
	string str;
	cin>>str;

	for(int i=0;i<str.size();i++){
		char opt=str[i];
		if(opt=='4') cout<<0<<endl;
	}
	return 0;
}
```

时间复杂度 $O(q)$ 期望得分10pts。

### 算法一

注意到题目的数据范围有一个不起眼的约定：所有操作结束之后，黑盒二和三中没有数。结合测试点#1-4中 $n$ 和 $q_{1,2,3}$的范围，我们不难发现我们并不需要处理“无穷多个”这一条件，直接把最开始读入的 $n$ 个数作为黑盒一中的数即可。

然后考虑一个朴素的暴力：对于操作1，给每次加入的数打一个时间戳，将数放到vector里。操作2和3时，将所有数按时间戳排序，选择满足题意的数加入到黑盒三中。

然后我们做进一步思考，题目中的“无限个”实质上就是最开始的n个数无限循环下去。我们可以记录一个指针p，每次加入数时加入指针p指向的数，并右移指针。当指针p的位置大于n时，让指针重新指向1这个位置。这样就可以达到循环的效果。

```cpp
#include<bits/stdc++.h>
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

stringstream black;
bool flag=false;
inline void add(int x){
	///cout<<"add"<<x<<endl;
	if(x==0&&!flag) return;
	flag=true;
	black<<x;
}

int a[1003],_time;
typedef pair<int,int> pii;
vector<pii> ve;
int main(){
	int n=read();
	for(int i=1;i<=n;i++) a[i]=read();
	int q=read();
	int p=1;
	string str;
	cin>>str;

	for(int i=0;i<str.size();i++){
		char opt=str[i];
		if(opt=='1'){
			ve.push_back(pii(++_time,a[p]));
			p++;
			if(p>n) p-=n;
		}
		if(opt=='2'){
			sort(ve.begin(),ve.end(),[](pii x,pii y){
				return x.first<y.first;
			});
			add(ve[0].second);
			ve.erase(ve.begin());
		}
		if(opt=='3'){
			sort(ve.begin(),ve.end(),[](pii x,pii y){
				return x.first>y.first;
			});
			add(ve[0].second);
			ve.erase(ve.begin());
		}
		if(opt=='4'){
			if(!flag){
				cout<<'0'<<endl;
			}else{
				cout<<black.str()<<endl;
				flag=false;
				black.str("");
			}
		}
	}
	return 0;
}
```

时间复杂度 $O(q_1+q_4+(q_2+q_3)\times q_1 \log q_1)$ 可认为时间复杂度为 $O(q^2\log q)$

期望得分 60pts。

### 算法二

对于测试点#13-#14的只有操作2的特殊性质，我们不难想到拥有“先进先出”性质的数据结构：队列。

然后我们进一步思考测试点#15-#16的特殊性质，不难发现可以用一个栈来处理“先进后出”。

这样，我们对于这两个特殊性质进行专门的处理。

```cpp
#include<bits/stdc++.h>
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

stringstream black;
bool flag=false;
inline void add(int x){
	///cout<<"add"<<x<<endl;
	if(x==0&&!flag) return;
	flag=true;
	black<<x;
}

int a[1003],_time,n;
typedef pair<int,int> pii;
vector<pii> ve;
string str;
int p=1;
void subtask1(){
	for(int i=0;i<str.size();i++){
		char opt=str[i];
		if(opt=='1'){
			ve.push_back(pii(++_time,a[p]));
			p++;
			if(p>n) p-=n;
		}
		if(opt=='2'){
			sort(ve.begin(),ve.end(),[](pii x,pii y){
				return x.first<y.first;
			});
			add(ve[0].second);
			ve.erase(ve.begin());
		}
		if(opt=='3'){
			sort(ve.begin(),ve.end(),[](pii x,pii y){
				return x.first>y.first;
			});
			add(ve[0].second);
			ve.erase(ve.begin());
		}
		if(opt=='4'){
			if(!flag){
				cout<<'0'<<endl;
			}else{
				cout<<black.str()<<endl;
				flag=false;
				black.str("");
			}
		}
	}
}

queue<int> que;
void subtask2(){
	for(int i=0;i<str.size();i++){
		char opt=str[i];
		if(opt=='1'){
			que.push(a[p]);
			p++;
			if(p>n) p-=n;
		}
		if(opt=='2'){
			add(que.front());
			que.pop();
		}
		if(opt=='4'){
			if(!flag){
				cout<<'0'<<endl;
			}else{
				cout<<black.str()<<endl;
				flag=false;
				black.str("");
			}
		}
	}
}

stack<int> sta;
void subtask3(){
	for(int i=0;i<str.size();i++){
		char opt=str[i];
		if(opt=='1'){
			sta.push(a[p]);
			p++;
			if(p>n) p-=n;
		}
		if(opt=='3'){
			add(sta.top());
			sta.pop();
		}
		if(opt=='4'){
			if(!flag){
				cout<<'0'<<endl;
			}else{
				cout<<black.str()<<endl;
				flag=false;
				black.str("");
			}
		}
	}
}
void subtask0(){
	for(int i=0;i<str.size();i++){
		char opt=str[i];
		if(opt=='4') cout<<'0'<<endl;
	}
}

int main(){
	n=read();
	for(int i=1;i<=n;i++) a[i]=read();
	int q=read();
	cin>>str;
	int q2=0,q3=0;
	for(int i=0;i<str.size();i++){
		if(str[i]=='2') q2++;
		if(str[i]=='3') q3++;
	}
	if(q2==0&&q3==0) subtask0();
	if(q2!=0&&q3!=0) subtask1();
	else if(q2!=0) subtask2();
	else if(q3!=0) subtask3();
	return 0;
}
```

时间复杂度同算法一。期望得分80pts。

### 算法三

我们把栈和队列结合在一起看，发现加入最早的数相当于把序列中最头上的数加入。加入最晚的数相当于把序列中最末尾的数加入。这样的操作使我们想到了双向队列，这样就得到了本题的标准算法。

```cpp
#include<iostream>
#include<deque>
#include<cstdio>
#include<sstream>
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

stringstream black;
bool flag=false;
inline void add(int x){
	///cout<<"add"<<x<<endl;
	if(x==0&&!flag) return;
	flag=true;
	black<<x;
}

int a[1003];
int main(){
	int n=read();
	for(int i=1;i<=n;i++) a[i]=read();
	int q=read();
	int p=1;
	string str;
	cin>>str;

	deque<int> deq;
	for(int i=0;i<str.size();i++){
		char opt=str[i];
		if(opt=='1'){
			deq.push_back(a[p]);
			p++;
			if(p-1>=n) p-=n;
		}
		if(opt=='2'){
			add(deq.front());
			deq.pop_front();
		}
		if(opt=='3'){
			add(deq.back());
			deq.pop_back();
		}
		if(opt=='4'){
			if(!flag){
				cout<<'0'<<endl;
			}else{
				cout<<black.str()<<endl;
				flag=false;
				black.str("");
			}
		}
	}
	return 0;
}
```

时间复杂度 $O(q)$，期望得分100pts。

## T2 序列

### 算法一

暴力修改。对于所有 $k=1$ 的情况，最后扫描一下序列，找到最大值。

```cpp
#include<iostream>
using namespace std;

int n,m,k;
int A,B,C,P;
inline int rnd(){return A=(A*B+C)%P;};
inline int get(){return rnd()%n+1;};

int a[10000007];
int main(){
	cin>>n>>m>>k;
	cin>>A>>B>>C>>P;
	for(int i=1;i<=n;i++) a[i]=get();
	int ans=0;
	for(int i=1;i<=m;i++){
		int f=get(),g=get(),t=get();
		if(f>g) swap(f,g);
		for(int j=f;j<=g;j++){
			a[j]+=t;
		}
	}
	for(int i=1;i<=n;i++){
		ans=max(ans,a[i]);
	}
	cout<<ans;
	return 0;
}
```

时间复杂度 $O(nm)$

期望得分12pts，由于测试点#7过水，实际得分15pts

### 算法二

我们学习过排序算法。对于其他k的情况，可以通过排序解决

```cpp
#include<iostream>
#include<algorithm>
#define int long long
using namespace std;

int n,m,k;
int A,B,C,P;
inline int rnd(){return A=(A*B+C)%P;};
inline int get(){return rnd()%n+1;};

int a[10000007];
signed main(){
	cin>>n>>m>>k;
	cin>>A>>B>>C>>P;
	for(int i=1;i<=n;i++) a[i]=get();
	for(int i=1;i<=m;i++){
		int f=get(),g=get(),t=get();
		if(f>g) swap(f,g);
		for(int j=f;j<=g;j++){
			a[j]+=t;
		}
	}
	sort(a+1,a+n+1,[](int a,int b){
		return a>b;
	});
	cout<<a[k];
	return 0;
}
```

时间复杂度 $O(mn+nlogn)$

期望得分23pts

实际上，对于测试点#10，我们并不需要再去排序了，直接扫描一遍序列就可以取出最大值了。期望得分28pts

### 算法三

发现k非常小，取值范围只有1,2,3。我们可以设三个变量，遇到一个数，先尝试更新最大值。比最大值小尝试更新第二大的值。比第二大的值小尝试更新第三大的值。

```cpp
#include<iostream>
#include<algorithm>
#define int long long
using namespace std;

int n,m,k;
int A,B,C,P;
inline int rnd(){return A=(A*B+C)%P;};
inline int get(){return rnd()%n+1;};

int a[10000007];
signed main(){
	cin>>n>>m>>k;
	cin>>A>>B>>C>>P;
	for(int i=1;i<=n;i++) a[i]=get();
	for(int i=1;i<=m;i++){
		int f=get(),g=get(),t=get();
		if(f>g) swap(f,g);
		for(int j=f;j<=Q	g;j++){
			a[j]+=t;
		}
	}

	int m1=0,m2=0,m3=0;
	for(int i=1;i<=n;i++){
		if(a[i]>=m1){
			m3=m2;
			m2=m1;
			m1=a[i];
		}else if(a[i]>=m2){
			m3=m2;
			m2=a[i];
		}else if(a[i]>=m3){
			m3=a[i];
		}
	}
	if(k==1) cout<<m1;
	if(k==2) cout<<m2;
	if(k==3) cout<<m3;
	return 0;
}
```

时间复杂度 $O(mn+n)$

期望得分55pts

### 算法四

我们已经把最后找第k大的数的过程的时间复杂度降到最低，但还是无法通过，主要是区间修改操作耗费了大量时间，我们需要优化

观察到，最后求第k大的数，是在所有操作之后进行的，这是一个特殊的地方。数据范围为 $1e7$ 启示我们用 $O(1)$ 的修改算法

这就需要差分了

设差分数组 $d[i]=a[i]-a[i-1]$

对于给区间 $[l,r]$ 加上 $d$，可变为修改差分数组：$d[l]+=d,d[r+1]-=d$

对差分数组求前缀和就可以得到对应位置修改操作之后的值

```cpp
#include<iostream>
#include<cstdio>
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

int A,B,C,P;
int n,m,k;
inline int rnd(){return A=(A*B+C)%P;};
inline int get(){return rnd()%n+1;};

int a[10000007];
int d[10000007];

signed main(){
	//freopen("a.in","r",stdin);
	//freopen("a.out","w",stdout);
	n=read(),m=read(),k=read();
	A=read(),B=read(),C=read(),P=read();
	for(int i=1;i<=n;i++){
		a[i]=get();
		d[i]=a[i]-a[i-1];
	}
	for(int i=1;i<=m;i++){
		int l=get(),r=get(),t=get();
		if(l>r) swap(l,r);
		d[l]+=t;
		d[r+1]-=t;
	}
	int sum=0;
	for(int i=1;i<=n;i++){
		sum+=d[i];
		a[i]=sum;
	}

	int m1=0,m2=0,m3=0;
	for(int i=1;i<=n;i++){
		if(a[i]>=m1){
			m3=m2;
			m2=m1;
			m1=a[i];
		}else if(a[i]>=m2){
			m3=m2;
			m2=a[i];
		}else if(a[i]>=m3){
			m3=a[i];
		}
	}

	if(k==1) cout<<m1;
	if(k==2) cout<<m2;
	if(k==3) cout<<m3;
	return 0;
}
```

时间复杂度 $O(m+n)$

期望得分100pts

## T3 滚动

### 算法一

直接朴素暴力

```cpp
#include<bits/stdc++.h>
#define int long long
#define _ 1000006
using namespace std;
const int mod=0;

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

int a[_],n,m;

signed main(){
	n=read(),m=read();
	for(int i=1;i<=n;i++) a[i]=read();

	while(m--){
		int x=read();cout<<a[x]<<endl;
		int t=a[x];
		for(int i=x;i<n;i++) a[i]=a[i+1];
		a[n]=t;
	}
	return 0;
}
```

时间复杂度：$O(mn)$，期望得分30pts。

### 算法二

为了方便表述，我们设所有的x等于X

考虑具有特殊性质的测试点，仔细推导规律，不难发现，我们可以不滚动序列，而是类似第一题一样，定义一个指针p，一开始将指针p指向位置X。每次操作时输出指针指向的数，然后将指针右移，如果指针指向位置超过了n，那么就将指针重新指向位置X。

```cpp
#include<bits/stdc++.h>
#define int long long
#define _ 1000006
using namespace std;
const int mod=0;

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

int a[_],n,m;
vector<int> ve;
void subtask2(){
	for(int i=0;i<m;i++){
		int x=ve[i];cout<<a[x]<<endl;
		int t=a[x];
		for(int i=x;i<n;i++) a[i]=a[i+1];
		a[n]=t;
	}
}
void subtask1(){
	int p=ve[0];
	while(m--){
		cout<<a[p]<<endl;
		p++;
		if(p>n) p=ve[0];
	}
}

signed main(){
	n=read(),m=read();
	for(int i=1;i<=n;i++) a[i]=read();

	bool flag=true;
	int t;
	for(int i=1;i<=m;i++){
		t=read();
		if(i!=1){
			if(t!=ve[0]) flag=false;
		}
		ve.push_back(t);
	}
	if(flag) subtask1();
	else subtask2();
	return 0;
}
```

时间复杂度：$O(mn)$，期望得分70pts。

### 算法三

我们考虑将整个序列分为若干个块。每个块的大小为 $\sqrt{n}$，则一共有 $\sqrt{n}$ 个块，我们将每个块进行标号。特别地，最后一个块的编号为 $end$。

我们再重新考虑数列的滚动。我们可以将题意转化为：将要查询的位置的数输出，然后把这个数放到序列的末尾，然后序列后面的数集体向前移动来补齐空位。

我们将每个块用vector来储存。把每个数放到其所属的块内。

这样对于滚动这一操作，我们可以把查询到的数从其原本的块内删除，再将其加入块 $end$ 中。

这样一来，滚动操作的复杂度被我们降为 $O(1)$。但这样进行若干次操作之后，每个块内的数的数量不是相同的，我们查询一个数，只能遍历每个块，找到要查询的数，这样的复杂度是 $O(n)$ 的。

但我们进一步考虑，我们无需一个数一个数遍历，由于我们已经分块，我们可以一个块一个块的去跳过，这样一来，查询操作的复杂度被降低为 $O(\sqrt{n})$ 。

但我们需要进一步考虑，当进行若干次操作后，可能$end$ 块之前的所有块内已经没有了数字，所有的数字都已经被放到了 $end$ 块中。这样一来，查询操作的复杂度退化为 $O(n)$

为此，我们需要定期将整个序列重新分块，来降低复杂度。我们选择每执行 $\sqrt{n}$ 次操作后重建分块。

```cpp
#include<bits/stdc++.h>
#define int long long
#define _ 1000006
using namespace std;
const int mod=0;

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

int a[_],n,m;
int blo,bl[_],tmp[_],cnt;
vector<int> ve[_];

signed main(){
	n=read(),m=read();
	for(int i=1;i<=n;i++) a[i]=read();

	blo=sqrt(n);
	for(int i=1;i<=n;i++) bl[i]=(i-1)/blo+1;
	for(int i=1;i<=n;i++) ve[bl[i]].push_back(a[i]);

	while(m--){
		int x=read(),p=1,t;
		while(x>ve[p].size()) x-=ve[p].size(),p++;
		t=ve[p][x-1];cout<<t<<endl;
		auto ii=ve[p].begin();
		for(int i=1;i<x;i++) ii++;
		ve[p].erase(ii);
		ve[(n-1)/blo+1].push_back(t);
		cnt++;
		if(cnt==blo){
			int pp=0;
			for(int i=1;i<=(n-1)/blo+1;i++){
				for(int e:ve[i])
					tmp[++pp]=e;
				ve[i].clear();
			}
			//for(int i=1;i<=tot;i++) cout<<a[i]<<' ';
			//cout<<endl;
			for(int i=1;i<=pp;i++) ve[bl[i]].push_back(tmp[i]);
			cnt=0;
		}
		//cout<<endl;
		//for(int i=1;i<=(n-1)/blo+1;i++){
		//	for(int e:ve[i]) cout<<e<<' ';
		//}
		//cout<<endl;
	}
	return 0;
}
```

时间复杂度 $O(n\sqrt{n})$。期望得分100pts。

## T4 南瓜

### 算法一

我们首先考虑特殊性质A，我们对于每个南瓜将其圆度算出，并与1作差取绝对值，然后输出最大的即可。

```cpp
#include<bits/stdc++.h>
#define _ 1000006
using namespace std;

double h[_],d[_],n,k;
int main(){
	cin>>n,cin>>k;
	for(int i=1;i<=n;i++) cin>>h[i];
	for(int i=1;i<=n;i++) cin>>d[i];
	vector<double> ve;
	for(int i=1;i<=n;i++){
		ve.push_back(fabs(1.0-h[i]/d[i]));
	}
	sort(ve.begin(),ve.end());
	printf("%.4lf",ve[0]);
	return 0;
}
```

时间复杂度 $O(n\log n)$ 期望得分35pts。

### 算法二

继续考虑特殊性质B，我们只需要把所有的 $h$ 和 $d$，分别加起来再作商即可。

```cpp
#include<bits/stdc++.h>
#define _ 1000006
using namespace std;

double h[_],d[_],n,k;
int main(){
	cin>>n,cin>>k;
	double suma=0,sumb=0,ans;
	for(int i=1;i<=n;i++) cin>>h[i],suma+=h[i];
	for(int i=1;i<=n;i++) cin>>d[i],sumb+=d[i];
	ans=suma/sumb;
	printf("%.4lf",ans);
	return 0;
}
```

时间复杂度 $O(n)$ ，结合算法一期望得分60pts。

### 算法三

对于前四个测试点，我们注意到数据规模非常小，我们考虑使用暴力搜索

```cpp
#include<bits/stdc++.h>
#define _ 1000006
using namespace std;

double h[_],d[_],n,k;

double ans;
void dfs(int a,int b,double suma,double sumb){
	if(b==k){
		ans=max(ans,suma/sumb);
		return;
	}
	if(a>n) return;
	dfs(a+1,b+1,suma+h[a],sumb+d[a]);
	dfs(a+1,b,suma,sumb);
}

int main(){
	cin>>n,cin>>k;
	for(int i=1;i<=n;i++) cin>>h[i];
	for(int i=1;i<=n;i++) cin>>d[i];
	dfs(1,0,0,0);
	printf("%.4lf",ans);
	return 0;
}
```

时间复杂度 $O(C_n^k)$。结合算法一、二，期望得分80pts。

### 算法四

分类讨论，对于 $k=1$ 的情况，直接按照算法一的方式去写即可。

对于其他情况，我们考虑二分答案。我们在 $[0,10^{12}]$ 的范围内进行二分。 对于二分到的 mid，我们对其进行check，判断是否可以满足选出 $k$ 个南瓜，这些南瓜的；平均圆度大于 mid。

check 函数的实现成为了现在问题的关键。现在要满足：

$$\frac{\sum h_i}{\sum d_i}\ge mid$$

移项，得到

$$\sum{(h_i-mid\times d_i)}\ge 0$$

我们可以这样说，每个南瓜的贡献为 $h_i-mid\times d_i$，我们要找k的南瓜，使得这k个南瓜的贡献加起来大于等于0。

显然，我们将所有南瓜的贡献算出来，从大到小排序，选择前k大的贡献加起来，如果总贡献大于等于0说明这个mid是可以接受的，反之不可以接受。

```cpp
#include<bits/stdc++.h>
#define _ 1000006
using namespace std;

double h[_],d[_],n,k;

bool check(double mid){
	double ok=0;
	vector<double> ve;
	for(int i=1;i<=n;i++) ve.push_back(h[i]-d[i]*mid);
	sort(ve.begin(),ve.end(),[](double x,double y){return x>y;});
	for(int i=0;i<k;i++) ok+=ve[i];
	return ok>=0;
}

void subtask2(){
	double l=0,r=1000000000000,mid,ans;
	while(r-l>=1e-8){
		mid=(l+r)/2;
		if(check(mid)) ans=mid,l=mid;
		else r=mid;
	}
	printf("%.4lf",ans);
}
void subtask1(){
	vector<double> ve;
	for(int i=1;i<=n;i++){
		ve.push_back(fabs(1.0-h[i]/d[i]));
	}
	sort(ve.begin(),ve.end());
	printf("%.4lf",ve[0]);
}

int main(){
	cin>>n,cin>>k;
	for(int i=1;i<=n;i++) cin>>h[i];
	for(int i=1;i<=n;i++) cin>>d[i];
	if(k==1) subtask1();
	else subtask2();
	return 0;
}
```

时间复杂度 $O(n \log \log n)$ 。期望得分100pts。
