@meta

```json
{
	"id": "promising-semantics",
	"createTime": "2025-12-21 13:08",
	"key": ["并行", "内存", "内存模型", "promising-semantics", "popl"],
	"background": "https://api.file.caiwen.work/picture/2025/12/21/20251221131016581.png"
}
```

Promising Semantics 是对于宽松内存模型的一种解释模型，具体的简介和论文在这里：[A Promising Semantics for Relaxed-Memory Concurrency](https://sf.snu.ac.kr/promise-concurrency/) 。

## 1. 基本概念

### 1.1 Multi-valued Memory

在 Promising Semantics 中，内存中的一个位置上不只是有一个值，而且有多个。每次在对某个位置上写入数据时，应该将其视为在该位置插入了一个“消息”。每个消息都有一个时间戳，表示其什么时候被插入的。

比如下面这个例子，其中 `X` 和 `Y` 是内存地址，`r1` 和 `r2` 是寄存器。内存中的数据初始情况下均为 0。后面的例子没有特殊说明也是按这个来。

```
X = 1   ||  Y = 1
r1 = Y  ||  r2 = X
```

这个例子中可能会发生 **Load hoisting**，即 load 操作被提前，具体原因可以参考：[软件性能工程-多核编程 - Caiwen的博客](https://www.caiwen.work/post/mit6172-4#3-5-nei-cun-mo-xing)，那么就存在 `r1 = r2 = 0` 的情况。 使用 Promising Semantics 解释的话就是两个线程可能写内存相当于是从对应的内存位置插入数据，而并非是覆盖数据：

![image-20251219153759017](https://api.file.caiwen.work/picture/2025/12/19/image-20251219153759017.png)

而在读内存的时候，不一定要选择时间戳最新的消息的数据来读，也可以读旧的数据，于是 `r1 = r2 = 0` 就是有可能的。

### 1.2 View

每个线程都有一个 View，表示在一个位置上已经接受了哪个消息，当读和写的时候就会更新 View。比如还是上面那个例子，当左边线程执行 `X = 1` 后，其 View 就变成了下面这样：

![image-20251219160338915](https://api.file.caiwen.work/picture/2025/12/19/image-20251219160338915.png)

读和写操作只能作用在 View 的右边：

![image-20251219160603820](https://api.file.caiwen.work/picture/2025/12/19/image-20251219160603820.png)

View 的设计可以使得 **per-location coherence** 原则得到保证，这个原则表明，对于同一个内存位置的操作顺序是所有线程公认一致的，具体来说可以分为以下四点：

- Read-Read Coherence：如果在同一个线程中读 `x` 得到了某个值，那么该线程第二次读的时候不能读取到比第一次读取更旧的值。
- Write-Read Coherence：如果在一个线程中，先写入了 `x`，然后再读 `x` 的时候，要么读取到刚才写入的值，要么读取到在全局顺序中比刚才写入的值更新的值。

（上面两个更倾向于是单线程内的程序顺序的感知）

- Write-Write Coherence：如果两个线程同时对 `x` 进行修改。如果线程一看到的是先进行了 `x=1` ，然后进行 `x=2`，那么线程二看到的也将会是先 `x=1` 再 `x=2`。
- Read-Write Coherence：如果在一个线程中，先读取了 `x`（得到旧值），然后写入了 `x`（写入新值），那么在其他的线程中就不应该出现先读到了旧值再读到了新值的情况。即所有线程都应该承认先读后写这个相对顺序。

（上面两个更倾向于是要求线程之间达成一个全局顺序的共识）

比如：

```
x = 1   ||  x = 2
a = x   ||  b = x
```

假如 `a` 读到 2，那么说明在时间轴上是先写入 1 再写入 2 的（不然的话线程 1 写入 1 之后，其 View 的右边就没有写入 2 的消息了），而这样的话，线程二写入 2 之后，其 View 的右边就不会有写入 1 的消息了，因此不可能出现 `a = 2`，`b = 1` 的情况。

同时这里再对 Multi-valued Memory 进行补充。一个线程在往内存位置中插入写数据的消息时，时间戳可以随便选，只要严格大于当前视图的时间戳就可以，比如：

```
x = 2  ||  y = 2
y = 1  ||  x = 1
a = y  ||  b = x
```

可以出现 `a = b = 2` 的情况，我们只需要让写 1 时取的时间戳小于写 2 时取的时间戳就可以了。

### 1.3 Promise

比如：

```
r1 = X  ||  r2 = Y
Y = r1  ||  X = 1
```

可能会出现 **Store Hoisting**，即右边的线程将 `X = 1` 提前，毕竟单看右边的线程，`X = 1` 这个操作没什么依赖，放在什么时候执行都无所谓，所以就不如提到最前面执行。这就导致 `r1 = r2 = 1` 是可能发生的。

为了解释这个问题，Promising Semantic 允许一个线程先 promise 自己会写入某个数据：

![image-20251219171311040](https://api.file.caiwen.work/picture/2025/12/19/image-20251219171311040.png)

然后我们需要对这个 promise 进行 certificate，即不看其他的线程，只看发起 promise 的线程，能否仅靠自己就可以兑现这个 promise，如果可以的话这个 promise 就是 certified 的。

此时对于其他线程来说，就相当于是 `X` 这个位置写入了 1，后续可以直接去使用这个位置。

![r1 读到了 1](https://api.file.caiwen.work/picture/2025/12/19/image-20251219171758472.png)

![Y 写入了 1](https://api.file.caiwen.work/picture/2025/12/19/image-20251219171833770.png)

注意，一个 promise 能够成立，还需要完成 re-certificate 的操作，即确保这个线程真的能兑现承诺：

![r2 读取 Y](https://api.file.caiwen.work/picture/2025/12/19/image-20251219171954495.png)

![右边的线程兑现了承诺](https://api.file.caiwen.work/picture/2025/12/19/image-20251219172036341.png)

又比如：

```
r1 = X  ||  r2 = Y
Y = r1  ||  X = r2
```

在 Promising Semantics 中是不可能出现 `r1 = r2 = 1` 的（但在 C++ 以前的内存模型中可能会允许这样的情况（只是模型能允许，但实际上也产生不了），也就是经典的 **Out of thin air**）。因为如果要产生这种情况，需要右边的线程先 promise `X = 1`，但是我们再进行 certificated 的时候，发现仅凭右边的线程是无法兑现这个 promise 的，因此这个 promise 就不成立。

又比如：

```
r1 = X  ||  r2 = Y
Y = r1  ||  if r2 == 1 { X = r2 } else { X = 1 }
```

如果仅仅是依赖于硬件的话，上面的情况可能并不会出现 store hoisting。但是编译器的优化会将这个分支判断优化成 `X = 1`，然后再进行 store hoisting。我们的 Promising Semantics 也能解释这一点：右边的线程 promise `X = 1`，并且右边的线程能够独自兑现 promise（certified），并且实际运行中右边线程也确实兑现了 promise （re-certified）

对于发起 promise 的线程，往往不能在 promise re-certified 之前利用这个 promise，比如：

```
a = X
X = 1
```

是不能出现的 `a = 1` 的。Promising Semantics 的 View 对其进行限制。promising `X = 1` 之后，`a` 如果读到 1 的话，那么 View 就会被拉到这个 `X = 1` 这里。此时再进行 `X = 1`，消息就只能插到当前 View 的左侧（且是严格的左侧，插入消息不能直接插到当前 View 的位置），于是就无法兑现这个 promise 了。

发起 promising 可能会对程序后续的运行做出更多限制，比如：

```
a = X  ||  X = 2
X = 1  ||
```

左边线程可以发起一个 promise，并且这个 promise 也是可以被 certified 的（只要前面 `a = X` 没有读到 1 就可以）。但是，如果右边线程插入了 `X = 2` 这个消息，且时间戳比左边线程的 promise 还大，并且左边线程的 `a = X` 读到 2 了，那么就会使得左边线程的 View 跨过了 promise，使得这个 promise 无法被 re-certified，于是这种情况是不被允许的。

（需要注意的是，这里所说的限制，限制的是发起 promise 的线程。对于上面所说的情况来说，左边线程的 `a = X` 读到 2 是不被允许的，但是右边线程将 `X = 2` 的时间戳取得比 promise 还大，这个是允许的）

同时还可以再对 Multi-valued Memory 做一个补充：时间戳不一定需要是一个整数，也就是两个整数的时间戳之间还能再插入时间戳。比如：

```
x = 1  ||  x = 3
x = 2  ||
```

左边线程可能会在时间 2 promise `x = 2`。右边线程的 `x = 3` 可能发生在时间 1。为了使得 promise 能够被兑现，左边线程的 `x = 1` 的时间戳需要比 2 小，但是 1 和 0 都已经被占用了。好在 Promising Semantics 允许时间戳是任意数字，我们可以让 `x = 1` 发生于时间 1.5。

发起 promise 时，时间戳可以任取。

写操作可以看作是先发起了一个 promise，然后又立刻兑现他。

## 2. Atomic Update

这里所说的原子操作是形如 fetch and add 和 compare and swap 这种 read and modify 的。

```
r1 = X.fetch_add(1) || r2 = X.fetch_add(1)
```

这里的 `fetch_add` 将会返回 `X` 原来的值。上面这个例子中，理论上来说是不能出现 `r1 = r2 = 0` 的情况的，因为 `fetch_add` 是原子操作，不能 interleave。`fetch_add` 也算是一种写内存，如果直接将其视为普通的写操作的话，那么就可能会出现两个线程都读 `X = 0` 并且都写入 `X = 1`。

Promising Semantics 将这种原子操作看成是一个时间戳的区间：

![image-20251219190604281](https://api.file.caiwen.work/picture/2025/12/19/image-20251219190604281.png)

这个区间是左开右闭的，左端点是 read 的数据的时间戳，右端点是 modify 作用的时间戳。Promising Semantics 规定一个内存位置的消息之间的时间戳是没有交集的，所以只能基于同一个消息做一次原子操作。

但是原子操作占用一个区间，这可能导致之前的 promise 无法兑现：

```
a = x				|| x = y || z.fetch_add(1)
b = z.fetch_add(1)  ||		 ||
y = b + 1			||		 ||
```

比如这个例子中，线程 1 首先 promise `y = 1`，但这个是基于 `b = z.fetch_add(1)` 先于 `z.fetch_add(1)` 执行的情况，而如果后者先执行，那么这个 promise 就兑现不了了。

于是 Promising Semantics 对 promise 做了如下限制：对 promise 进行 certificate 的时候，还需要确保，这个 promise 在未来的任何内存情况下都是能兑现的。

一个思考是这里为什么不去限制后续的原子操作不能使得 promise 无法兑现？这是因为 Promising Semantics 有线程局部性的原则，就是让一个线程操作带来的限制尽可能的是限制线程本身。这里一个相似的地方是，上文也提到过一个发起一个 promise 可能会对程序后续操作做出限制，当时那里的限制也是限制发起 promise 的操作本身的。

不过即使在这个限制下，我们也可以这么做：在 $(0, 1]$ 这个时间上 promise `z = 1` （即 promise 线程 1 的 `z.fetch_add(1)` 先于线程 3 的执行）（这个 promise 一定可以兑现，因为这个时间段上不可能再有其他操作了），然后再在 $(3,4]$ 这个时间上 promise `y = 1`（也是一定可以兑现的，毕竟 `b` 的值已经被前面那个 promise 确定了）

## 3. 同步

### 3.1 Release / Acquire Fence

有时候我们需要阻止指令重排，以确保程序的正确性，这就需要用到一些 ordering primitives：

- sc fence：sc fence 两侧的指令不能重排，或者说下面的指令不能到上面，上面的指令也不能到下面，是一种双向的限制
- release fence：让上面的指令不能到下面去。一般用于 store（比如对标志位的修改，这样可以确保标志位的修改不会提前）
- acquire fence：让下面的指令不能到上面去。一般用于 load（比如循环判断标志位是否修改，这样可以确保标志位确实修改之后再进行其他操作，不会让其他操作的指令移上来）

我们先来讨论 release fence 和 acquire fence。此时 Promising Semantics 需要进行进一步扩展。现在，每个线程有多个 view，一个 cur view，一个 rel view，一个 acquire view。cur view 相当于没扩展之前线程的 view，rel view 表示当前线程在上次进行 release fence 操作时的 cur view，acq view 表示当前线程如果进行一个 acquire fence 操作将会合并进来的 view。一般来说有 $\text{rel view} \le \text{cur view} \le \text{acq view}$。

如果不加特殊说明，我们后面说“合并” view 指的是原 view 和要被合并进来的 view 在时间轴上取 max。

除此之外，我们还对于每个消息引入了 message view 。一个消息的 message view 为发布这个消息时，当前线程的 rel view。

这几个 view 之间是这样运作的。当线程执行 release fence 时，会将线程的 rel view 变为 cur view。当前线程发布一个消息（即写）的时候，消息的 message view 即为当前线程的 rel view。当前线程收到一个消息（即读）的时候，会将消息的 message view 合入到当前线程的 acq view 中。当线程执行 acquire fence 时，会将线程的 acq view 合入到 cur view 中。

![image-20251220221347069](https://api.file.caiwen.work/picture/2025/12/20/image-20251220221347069.png)

上面例子中，fence-rel 操作会将左边线程的 rel view 更新为其 cur view，于是 x = 1 就存在于 rel view 中，然后再产生 y = 1 这个消息时，就携带了这个 rel view。然后右边线程如果读到 y = 1，就说明其接收到了 y = 1 这个消息，同时将其 message view 合入 acq view 中，那么 acq view 就包含了 x = 1，后面再进行 fence-acq 操作，就会使得右边线程的 acq view 合入 cur view，那么其 cur view 就包含了 x = 1 ，于是后面必然会读到 x = 1。

注意的是，一般来说 release fence 后面的 store 是不能 promise 在 release fence 之前的，就比如上面这个例子中，y = 1 是不能在程序最开始 promise 的。这是因为 promise 和普通的写操作差不多，也会携带 message view。当我们在程序最开始 promise 的时候，此时这个 promise 的 message view 其实是一个初始状态的 view（即每一个内存位置都是到 0 这个时间戳）。而我们的 release fence 是想让其后面的 store 指令的 message view 带上当前 rel view，那么这个目的就达不到了。

还有一点，acquire fence 后面的 store 操作却能够跨过 acquire fence 进行 promise。因为 acquire fence 是来将 load 操作接收到的 message view 合入 cur view 的，和 store 操作无关。

不过这里我也不太能理解清楚。特别是 acquire fence 如果允许后面的 store 操作进行 promise 从而前移的话，似乎违背了我们之前所说的 acquire fence 不能让下面的指令移动到上面去。我自己的理解是，acquire fence 只是确保 fence 下面的 load 指令会同步，而对于 store 指令无所谓。

### 3.2 Release / Acquire Access

一般是 store 对应于 release，load 对应于 acquire 。release store 可以等价于先进行一个 release fence，然后再进行一个 relaxed store。acquire load 可以等价于先进行一个 relaxed load，再进行一个 acquire fence。

但 release access 还有点特殊，此时我们的 Promising Semantics 还需要再扩展一下：每个线程不再是只有一个 rel view 了，而是每个线程中，每个位置都有一个 rel view。在进行任何的 store 操作时（无论是 release、acquire 还是 relaxed），被 store 的位置的 rel view 就会更新。在进行 release store 的时候，就会把该位置的 rel view 变为当前线程的 cur view。release store 发出的消息携带的 message view 也只会携带其对应位置的 rel view。

其实另一个角度说 release fence 反而是一种特例，他会把所有位置的 rel view 都同步到 cur view。

![image-20251220231843769](https://api.file.caiwen.work/picture/2025/12/20/image-20251220231843769.png)

比如上面这个例子，线程 2 收到 y = 1 的话，其 message view 也包含了 x = 1，那么再 acquire 之后，b 就一定会是读到 1。而线程 3 收到 z = 1，但线程 1 发出 z = 1 的时候仅仅是携带了 z 位置的 rel view，而这个位置由于没有 release 同步到 cur，所以是还没有包含 x = 1，那么线程 3 很有可能就会读到 x = 0。

和 release / acquire fence 中提到到的一样，release access 往往不能 promise，而 acquire access 能够 promise。

![release access 不能 promise，acquire access 能够 promise](https://api.file.caiwen.work/picture/2025/12/21/image-20251221105331424.png)

![acquire access 能够 promise](https://api.file.caiwen.work/picture/2025/12/21/image-20251221105401005.png)

### 3.3 Release Sequences

对于 read and modify 这个 atomic update，其具体来说是分为了 read 和 write 两个行为，于是这个 atomic update 也会在内存中产生一个消息。Promising Semantics 中规定，atomic update 的 message view 必须将其 read 行为得到的 message view 也给合并进来，这样就会导致一个“消息链条”。

![image-20251221104512897](https://api.file.caiwen.work/picture/2025/12/21/image-20251221104512897.png)

比如上面这个例子，$y_{\mathbf{rel}} = 1$ 会将 $x = 1$ 合入到 y 位置处的 rel view。那么后面的 $y = 2$ 的 message view 中也会携带了 $x = 1$。如果线程三读到了 $y = 3$，那么说明之前线程 2 先基于线程 1 的 $y = 2$ 进行了 fetch and add。根据我们上面所说，fetch and add 会将 $y = 2$ 的 message view 也合入到自己的 message view 中，线程 3 在接收 $y = 3$ 并进行 acquire 的时候，$x = 1$ 就沿着 $y = 2$，到达 $FAA(y,1)$ 然后到达线程 3 的 cur view，于是线程 3 在后面读 x 的时候必然是读到 $x = 1$。

值得注意的是，线程 2 再进行 fetch and add 之后，还是有可能读到 $x = 0$ 的。

### 3.4 SC Fences

为了支持 sc fence，Promising Semantics 再次进行了扩展，其引入了一个 global view，这个 view 是只有一个的，并非每个线程都有一个。当某个线程执行 fence-sc 操作的时候，该线程的 cur view 和 global view 都会变成这两种较大的那个，即 $\text{cur view} = \text{global view} = max(\text{cur view}, \text{global view})$。

![image-20251221105823006](https://api.file.caiwen.work/picture/2025/12/21/image-20251221105823006.png)

比如上面的例子，$x = 1$ 之后进行 fence-sc，于是 global view 就会包含 $x = 1$。线程 2 进行 $y = 1$ 后进行 fence-sc，于是 global view 就会既包含 $x = 1$ 又包含 $y = 1$，并且线程 2 的 cur view 也包含了 $x = 1$，于是后面 $b$ 就不可能读到 $0$。

### 3.5 Plain Access

其实我们上面如果不加特殊说明，所有的非 release 和 acquire 操作都是 relaxed 操作。而 C++ 中，没特殊说明访问方式的操作并非是 relaxed 操作，而是 plain acccess。编译器会对 plain access 进行更加激进的优化，使得一些 per-location coherence 得不到保证。

![image-20251221110749351](https://api.file.caiwen.work/picture/2025/12/21/image-20251221110749351.png)

比如上面这个例子，编译器在考虑线程 2 的时候并不会得知线程 1 的存在，于是可能会将 $b = x$ 移到前面去（反正对一个地址进行两次读，在编译器眼里这两个顺序无所谓），变成右边那个样子。但是在程序员眼中代码还是左边那个样子，看起来是不满足 Read-Read Coherence 了。

为了解释这种情况，Promising Semantics 又进行了扩展，他把每个线程的 cur view 拆成了两个分量：pln 分量和 rlx 分量。rlx 分量就相当于之前 cur view 没有拆分时的样子，并且有 pln 分量是小于等于 rlx 分量的。当对于 $x$ 进行一个 plain read 的时候，只能读时间戳大于 $pln(x)$ 的消息，并且读完只会去更新 $rlx$ 分量。对于 $x$ 进行一个 plain write 的时候，则需要保证写入消息的时间戳要大于 $rlx(x)$，并且写完之后既会更新 $pln$ 分量又会更新 $rlx$ 分量。

## 4. 完整模型

下面形式化定义中的符号具体含义可以参考论文的第 4 页和第 8 页。

- $o$ 表示访问方式，有 $pln$（plain）、$rlx$（releaxed）、$ra$（release/acquire），并且这几个访问方式还形成了一个集合关系：$pln \subset rlx \subset ra$。并且这里的 $ra$ 指的是 release/acquire access

### 4.1 Read

![image-20251221113130869](https://api.file.caiwen.work/picture/2025/12/21/image-20251221113130869.png)

![image-20251221113244194](https://api.file.caiwen.work/picture/2025/12/21/image-20251221113244194.png)

对于 read-helper，前两个关于时间戳 $t$ 的限制就是我们在 Plain Access 中所讲的。

$V$ 则表示了当前操作进行之后，cur view 的增量，可以看到无论是哪种访问方式，都会增加 $rlx$ 分量（releaxed/release/acquire 都有同步的作用，plain 没有），而 $pln$ 访问方式却不更新 $pln$ 分量（read-read coherence 会被破坏）。

acq view 基本和 cur view 进行一样的更新。

plain 访问并不会将 message view 合入到 cur view 或是 acq view。除了 plain 以外的访问类型，都会将 message view 合入 acq view（正如我们之前说 release/acquire fence 的时候所讲的）。而 acquire/release 还会直接把 message view 合入到 cur view（这里 read 其实主要和 acquire 有关了，acquire access 自带了 acquire fence）。

值得注意的是 read 并不会更新 rel view。

### 4.2 Write

![image-20251221120418221](https://api.file.caiwen.work/picture/2025/12/21/image-20251221120418221.png)

![image-20251221120429622](https://api.file.caiwen.work/picture/2025/12/21/image-20251221120429622.png)

正如我们在 Plain Access 中所讲的，写入的时候选取的时间戳 $t$ 一定要大于 cur view 的 rlx 分量。

无论是何种访问模式，都会更新 pln 和 rlx 两个分量。

无论是何种访问模式，都会更新 rel view。如果是 ra 的话（主要是 release），还会直接让 x 位置的 rel view 直接同步到 cur view。

对于 write 操作插入的消息的 message view，plain 访问类型并不会携带 message view，其余的访问类型会携带当前位置的 rel view（其实还会并上 $R_r$，这个主要用于我们之前所说的 Release Sequences）。

这里还要求，如果是 ra（主要是 release access）的话，那么此时所有发起，且还没兑现的 promise 的 message view 必须是空集。我个人的理解是这里是为了允许 plain access 越过 release access 提前 promise 的。但是搞不懂的是，即使是 relaxed access，越过 release access 进行 promise 时也可以令其 message view 为一个空集。Gemini 给我的解释是 release access 后面的发起的 message 的 message view 本应该是包含 rel view，但是 promise 时令他是空集，这就发生矛盾了（或者说 message view 不同的话就无法兑现？）

### 4.3 Update

![image-20251221123307714](https://api.file.caiwen.work/picture/2025/12/21/image-20251221123307714.png)

atomic update 相当于把 read 和 write 连在一块了。需要特殊注意的是，atomic update 会将其 read 操作得到的 message view 合入其 write 操作产生的 message 的 message view 中。（为了实现 Release Sequences）

### 4.4 SC Fence

![image-20251221123014491](https://api.file.caiwen.work/picture/2025/12/21/image-20251221123014491.png)

![image-20251221123006714](https://api.file.caiwen.work/picture/2025/12/21/image-20251221123006714.png)

SC-FENCE-HELPER 中的 $S$ 可以认为是 global view。

行为比较简单，就是 cur view、acq view、rel view 全部大力更新成 global view。

不过这里也要求，进行 sc fence 时不能有尚未兑现的 promise，或者这个 promise 是 plain write 的。

### 4.5 Release / Acquire Fence

![](https://api.file.caiwen.work/picture/2025/12/21/image-20251221123642050.png)
