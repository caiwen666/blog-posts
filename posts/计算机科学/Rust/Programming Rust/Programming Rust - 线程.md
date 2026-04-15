@meta

```json
{
	"id": "rust-thread",
	"createTime": "2026-04-05 09:39",
	"key": ["rust", "并发", "线程", "channel", "同步", "锁"],
	"summary": "本文概述 Rust 多线程与同步：spawn、join、作用域线程，mpsc/sync 信道及优化，Send/Sync、Arc、互斥与读写锁、条件变量与屏障、信号量，并简述 Rayon 与全局 OnceLock。"
}
```

## 1. fork-join

使用 `std::thread::spawn` 可以创建线程：

```rust
use std::thread;
use std::time::Duration;

fn main() {
    thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }
}
```

有几点值得注意：

- `spawn` 函数接受一个 `FnOnce` 闭包或者函数
- `main` 线程一旦结束，程序就立刻结束，因此需要保持它的存活，直到其它子线程完成自己的任务

`spawn` 函数返回一个 `JoinHandle`,`JoinHandle` 有一个 `.join` 方法，可以让当前线程阻塞，直到它等待的子线程的结束。

`.join` 方法会返回一个 `std::thread::Result` 。如果出现的线程 panic 了，那么 Result 为 Err，反之为 `Ok`。`Ok` 包裹线程的返回值 。

**Builder**

可以使用 `thread::Builder` 来自定义线程的名称（方便调试）和线程的栈大小之类的：

```rust
use std::thread;
fn named_thread_example() {
    let builder = thread::Builder::new()
    	.name("my-worker".into())
    	.stack_size(32 * 1024); // 32 KiB
    let handle = builder.spawn(|| {
        println!("Hello from thread: {:?}", thread::current().name());
        42
    }).unwrap();

    let result = handle.join().unwrap();
    println!("Thread returned: {}", result);
}
```

**Scoped Threads**

Scope Threads 将会创建一个 scope，然后在 scope 内可以创建多个线程。如果这些线程没有手动显式地 join 的话，scope 结束之后会自动 join 这些线程。总之，会确保 scope 内的线程在 scope 结束之后全部完成，这也就意味着可以向线程传递非 `'static` 引用：

```rust
use std::thread;
fn scoped_thread_example() {
    let a = vec![1, 2, 3];
    let b = vec![4, 5, 6];

    let (sum_a, sum_b) = thread::scope(|s| {
        let h1 = s.spawn(|| a.iter().sum::<i32>());
        let h2 = s.spawn(|| b.iter().sum::<i32>());
        (h1.join().unwrap(), h2.join().unwrap())
    });

    // `a` and `b` are still accessible here.
    println!("sum_a = {}, sum_b = {}", sum_a, sum_b);
}
```

## 2. Channel

Channel 可以用于线程之间数据的转移。

```rust
let (sender, receiver) = mpsc::channel::<T>();
```

`send` 直接转移数据的所有权（只移动了栈上数据）。

```rust
sender.send(data);
```

`recv` 也只是所有权的转移：

```rust
receiver.recv();
```

`send` 和 `recv` 当且仅当另一端 drop 掉时才会返回 `Err`。

当然也可以直接对 `receiver` 进行遍历，直到 `sender` 被 drop 掉：

```rust
for data in receiver {
    // do something
}
```

`Sender<T>` 实现了 Clone trait，允许你有多个 sender。`Receiver<T>` 则没有实现 Clone trait，如果需要多个 receiver 则需要使用 `Mutex`。

有个易错点：

```rust
use std::sync::mpsc;
fn main() {

    use std::thread;

    let (send, recv) = mpsc::channel();
    let num_threads = 3;
    for i in 0..num_threads {
        let thread_send = send.clone();
        thread::spawn(move || {
            thread_send.send(i).unwrap();
            println!("thread {:?} finished", i);
        });
    }

    // 在这里drop send...

    for x in recv {
        println!("Got: {}", x);
    }
    println!("finished iterating");
}
```

向线程传递的 sender 全是 clone 出来的，而最开始的 send 直到后面 `for x in recv` 也没 drop 掉，这导致后面的循环会一直堵塞。解决方法是在注释的地方添加 `drop(send)`。

**Channel 内部优化**

Rust 中的 channel 经过了一些优化。当 channel 刚被创建时，处于 Oneshot 模式。此模式下，channel 内部的数据结构非常简单，只是一个简单的原子槽，sender 可以以原子且无锁的方式在槽中插入数据，然后通知 receiver 去取出数据。

> 这种情况下 sender 只有一个，理论上不是原子操作应该也没问题。但其实 Oneshot 模式下的 channel 还维护了一个状态标记，表示是否已经放入了数据。原子操作可以保证数据和状态标记同时被更改，如果不使用原子操作的话可能会出现状态标记被更改了，而数据还没改（这往往是由于指令重排引起的），receiver 突然观察到状态标记被改变，误以为数据已经准备就绪，于是就把脏数据取出来了。
>
> 不过这里的状态标记似乎显得有点多余，因为我们其实可以让 receiver 在接收时先挂起当前线程，直到 sender 准备好数据之后由 sender 去唤起自己。但其实 Rust 这里又做了个优化，receiver 在接收数据时会先检查一下标记，如果 sender 已经在此之前准备好数据，那么 receiver 就不用再挂起当前线程了。毕竟挂起然后再唤醒，等待操作系统调度，这中间也是有一定的耗时的。

当发送第二个数据时，channel 就升级成 Stream 模式，channel 内部的数据结构是一个链表，sender 只需要在一端插入，receiver 只需要在一端删除。Stream 模式和 Oneshot 模式之间的效率差异在于，前者在链表中新增节点时在堆上申请内存，把数据放在堆上，而后者只需要把数据放在已经开好的空间中。这中间差了一个内存分配的时间，Oneshot 把这个时间优化掉了。其实由于 channel 存在内存分配的开销，所以如果要追求极致的性能，还需要使用其他的第三方库。

当 sender 被 clone 后，channel 就升级成了 Shared 模式，channel 内部的数据结构仍是链表，但是在 send 时就需要引入无锁操作。

普通的 channel 的容量是没有限制的，当 sender 速度特别快，receiver 速度特别慢时，channel 占用的内存可能会持续增长。更糟糕的是，此时 sender 可能消耗了大量的 CPU 资源，使得 receiver 处理的速度更慢。

**sync_channel**

`sync_channel` 则可以设置一个容量限制，当 channel 中停留的数据数量到达这个限制时，再 send 就会堵塞：

```rust
let (sender, receiver) = mpsc::sync_channel(1000);
```

不过即使有容量限制，sync_channel 也是一样的会动态进行内存分配，而不会提前在内存中预留一块内存。其他的第三方库可能会对此进行更多的优化。

一个有意思的地方是，如果是 `mpsc::sync_channel(0)` 的话，那么 sender 发送是会一直堵塞，直到 receiver 接收了消息。

## 3. 同步/共享

### 3.1 Send/Sync

- 如果某个数据类型可以在线程间移动，那么他就是 Send 的
- 如果某个数据可以在多个线程间**不可变**地引用，那么他就是 Sync 的

Sync 的数据类型也一定是 Send 的，大多数数据类型都是 Send + Sync：

![c565d65b61a83ea9bee289000062dfe4](https://api.file.caiwen.work/picture/2025/12/14/c565d65b61a83ea9bee289000062dfe4.jpeg)

有几个特例：

- 是 Send 但不是 Sync：这意味着多个线程不可变引用同一个变量是不安全的，但不可变引用是只读的，按理说不应该会这样。一个特例是有可能有的类型有内部可变性，比如 `Cell<T>` 和 `Receiver<T>`，即使是不可变引用也会出现对数据的修改。
  - `Receiver<T>` 的 `.recv()` 函数接收的是 `&self`，而不是 `&mut self`。这是因为 `.recv()` 改变的是建立的 Channel，而 `Receiver` 本身并没有发生改变。
- 不是 `Send`，这种一般有如下几种情况：
  - `clone` 出来的几个不同的数据之间并非是毫无关联的，也共享着一些数据。比如 `Rc<T>`，他 `clone` 时会增加引用计数，`drop` 时会减少引用计数，不同的 `Rc<T>` 之间可能会共享并修改同一个引用计数。
  - 有些资源是从属于特定线程的。比如 `MutexGuard<T>` ，理论上应该拿到锁的线程也负责释放锁，如果 `MutexGuard<T>` 也允许传递到不同的线程，那么可能会出现死锁或者其他未定义行为。
  - Rust 保守地决定。比如裸指针 `*mut T` 和 `*const T`。裸指针非常地不安全，Rust 无法对裸指针做出任何的保证。Rust 希望一个线程创建出来的裸指针只在当前线程内使用，不要传到其他线程，否则裸指针到处传非常容易导致内存安全问题。而且 Send 的含义就是，有 Send 的类型可以保证传递到其他线程是安全的，但 Rust 显然不能对裸指针有这个保证。

### 3.2 Arc

`Arc<T>` 的引用计数是线程安全的，所以可以 `Send` ，使用 `Arc<T>` 可以将数据放在堆上，然后多个线程不可变地共享：

```rust
use std::sync::Arc;
fn process_files_in_parallel(filenames: Vec<String>,
    glossary: Arc<GigabyteMap>) -> io::Result<()>
{
    ...
    for worklist in worklists {
        // This call to .clone() only clones the Arc and bumps the
        // reference count. It does not clone the GigabyteMap.
        let glossary_for_child = glossary.clone();
        thread_handles.push(
        	spawn(move || process_files(worklist, &glossary_for_child))
        );
    }
    ...
}
```

### 3.3 Mutex

Rust 中最多只能跨线程传递不可变引用。如果要通过一个不可变引用修改数据，需要内部可变性，同时内部可变性的实现也需要保证线程安全，`Mutex` 就是这样的。

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

- 可以用 `Arc` 来分发 `Mutex` 的引用
- `.lock()` 将返回 `MutexGuard<T>`，这是持有锁的凭证，只有 `MutexGuard<T>` 被 drop 掉才会将锁释放。`MutexGuard<T>` 相当于是一个指针。可以使用 `drop()` 手动提前释放掉锁。
- `.lock()` 返回的是一个 Result。当某个持有锁的线程 panic 后，其 `MutexGuard` 会被 drop 掉，此时锁释放，同时会给锁标记为 poisoned 状态。随后其他线程如果尝试去 `.lock()` 一个 poisoned 锁就会返回 `Err`。这种设计出于这样的一个考虑：如果一个线程还没释放锁，说明他还在对共享的数据进行操作，操作还没结束，而此时发生了 panic 使其无法再继续进行操作，这就使得共享的数据处于一种“损坏”的状态。此时其他线程如果拿到锁后可能会基于已经损坏的数据再继续操作，会让程序出现神秘 bug。而 poisoned 机制使得线程拿锁时知道别的线程是不是 panic 了，能更好地做出处理。当然，也可以使用 `PoisonError::into_inner()` 来继续拿锁。
- `.try_lock()` 可以尝试获得锁，如果锁被占用则会返回一个错误，并不会一直堵塞，可用来降低死锁情况发生的可能。

### 3.4 RwLock

RwLock 将访问分成读和写，允许有多个读，但只允许有一个写。进行写操作和进行第一个读操作时需要堵塞等待锁，当前线程正在读时，其他线程再读的时候就不用再等待锁了。

```rust
use std::sync::RwLock;

fn main() {
    let lock = RwLock::new(5);

    // 同一时间允许多个读
    {
        let r1 = lock.read().unwrap();
        let r2 = lock.read().unwrap();
        assert_eq!(*r1, 5);
        assert_eq!(*r2, 5);
    } // 读锁在此处被drop

    // 同一时间只允许一个写
    {
        let mut w = lock.write().unwrap();
        *w += 1;
        assert_eq!(*w, 6);

        // 以下代码会阻塞发生死锁，因为读和写不允许同时存在
        // 写锁w直到该语句块结束才被释放，因此下面的读锁依然处于`w`的作用域中
        // let r1 = lock.read();
        // println!("{:?}",r1);
    }// 写锁在此处被drop
}
```

RwLock 的读者和写者的优先级是不确定的，往往依赖于操作系统内部对读写锁的实现。不过在 Linux 上通常是读者优先的。

而 `parking_lot::RwLock` 是写者优先，他是纯 Rust 实现的，不依赖于具体的操作系统，并且采用写者优先策略，即一旦有一个写者尝试获取锁，他会阻止后续的新读者进入临界区（即使当前还有旧的读者在里面），然后等待当前的旧读者读完之后，写者立即执行。这有效防止了“写者饿死”，是大多数高性能 Rust 应用的首选。

tokio 中也有一个读写锁：`tokio::sync::RwLock` ，他则采用了公平队列策略。他内部维护者一个队列，无论是读请求还是写请求都需要按顺序排队。但这样的吞吐量可能不如上面两种高。

RwLock 有一种常见的“陷阱”。RwLock 由于要维护读锁计数器和写锁标志，在拿写锁和读锁是需要更多的判断，同时当多个 CPU 核心尝试获取读锁时，虽然无需等待锁，但是还是需要更新读锁计数器，这中间会导致缓存抖动。这些都导致 RwLock 其实要比 Mutex 的效率要低很多。这导致除非写操作的耗时非常长，这样 RwLock 可能才显出优势来。更科学的做法是先用 Mutex，需要优化的时候对比一下两者谁更优再做决定。

### 3.5 Condvar

条件变量(Condition Variables)经常和 `Mutex` 一起使用，可以让线程挂起，直到某个条件发生后再继续执行：

```rust
use std::thread;
use std::sync::{Arc, Mutex, Condvar};

fn main() {
    let pair = Arc::new((Mutex::new(false), Condvar::new()));
    let pair2 = pair.clone();

    thread::spawn(move|| {
        let (lock, cvar) = &*pair2;
        let mut started = lock.lock().unwrap();
        println!("changing started");
        *started = true;
        cvar.notify_one();
    });

    let (lock, cvar) = &*pair;
    let mut started = lock.lock().unwrap();
    while !*started {
        started = cvar.wait(started).unwrap();
    }

    println!("started changed");
}
```

上述代码流程如下：

1. `main` 线程首先进入 `while` 循环，调用 `wait` 方法挂起等待子线程的通知，并释放了锁 `started`
2. 子线程获取到锁，并将其修改为 `true`，然后调用条件变量的 `notify_one` 方法来通知主线程继续执行

`.wait()` 会接收一个`MutexGuard<'a, T>`，且它会自动地暂时释放这个锁，使其他线程可以拿到锁并进行数据更新。直到被其他地方 notify 后，它会将原本的 `MutexGuard<'a, T>` 还给我们，即重新获取到了锁，同时唤醒了此线程。

### 3.6 Barrier

在 Rust 中，可以使用 `Barrier` 让多个线程都执行到某个点后，才继续一起往后执行：

```rust
use std::sync::{Arc, Barrier};
use std::thread;

fn main() {
    let mut handles = Vec::with_capacity(6);
    let barrier = Arc::new(Barrier::new(6));

    for _ in 0..6 {
        let b = barrier.clone();
        handles.push(thread::spawn(move|| {
            println!("before wait");
            b.wait();
            println!("after wait");
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

上面代码，我们在线程打印出 `before wait` 后增加了一个屏障，目的就是等所有的线程都打印出**before wait**后，各个线程再继续执行：

```console
before wait
before wait
before wait
before wait
before wait
before wait
after wait
after wait
after wait
after wait
after wait
after wait
```

### 3.7 信号量

Rust 的标准库曾经有过信号量的实现，但是后来废除了。一个原因是使用 Mutex 和 Condvar 就可以实现，并且实现起来并不复杂：

```rust
pub struct Semaphore {
    count: Mutex<usize>,
    cvar: Condvar,
}

impl Semaphore {
    pub fn new(initial_count: usize) -> Self {
        Semaphore {
            count: Mutex::new(initial_count),
            cvar: Condvar::new(),
        }
    }
    pub fn acquire(&self) {
        let mut count = self.count.lock().unwrap();
        while *count == 0 {
            count = self.cvar.wait(count).unwrap();
        }
        *count -= 1;
    }
    pub fn release(&self) {
        let mut count = self.count.lock().unwrap();
        *count += 1;
        self.cvar.notify_one();
    }
}
```

即使操作系统提供了信号量的实现，但是不同操作系统的信号量行为存在差异，Rust 希望通过 Mutex 和 Condvar 来实现。

不过在 async 场景下，信号量用的还是比较频繁，tokio 中有相应的实现：

（这里使用了 `std::sync::Arc`，Tokio 并没有自己的 `Arc` 实现，因为标准库的 `Arc` 的引用计数是原子操作，并不会堵塞线程，也就不会堵塞 Tokio 的调度器）

```rust
use std::sync::Arc;
use tokio::sync::Semaphore;

#[tokio::main]
async fn main() {
    let semaphore = Arc::new(Semaphore::new(3));
    let mut join_handles = Vec::new();

    for _ in 0..5 {
        let permit = semaphore.clone().acquire_owned().await.unwrap();
        join_handles.push(tokio::spawn(async move {
            //
            // 在这里执行任务...
            //
            drop(permit);
        }));
    }

    for handle in join_handles {
        handle.await.unwrap();
    }
}
```

Tokio 的信号量有个大坑。他的 acquire 会返回一个 permit。这个 permit 是一个 RAII 风格的资源。也就是当 permit 被 drop 掉时，会被“归还”，也就是会增加信号量。如果你不希望有这个归还的行为，需要使用 `permit.forget()`

## 4. Rayon

Rayon 是 Rust 中一个并行计算的 crate，可以更方便地进行任务的调度。Rayon 内部维护着一个线程池（通常线程数和 CPU 核心数一致），使用 work stealing 将任务调度到不同的线程中。

```rust
// 同时执行两个任务并取回返回结果
let (v1, v2) = rayon::join(fn1, fn2);

// 同时执行 N 个任务，但是不意味着开 N 个线程，这 N 个任务会被调度到指定数量的线程上
giant_vector.par_iter().for_each(|value|
    do_thing_with_value(value);
});
```

## 5. 全局变量

`static` 关键字来声明全局变量。需要满足如下要求：

- 全局变量需要是 Sync + 非 mut 的，否则需要 unsafe。

- 必须用常量或是常量函数来初始化全局变量。

  Rust 中可以使用 `const` 修饰符来显式指明一个函数为常量函数，类似 C++ 的 expr。常量函数有如下的限制：
  - 参数给定之后，返回值是能够唯一确定的，可以在编译期完成计算。
  - 不能有泛型
  - 不能进行分配内存的操作
  - 不能操作裸指针，即使是在 unsafe 块中也不能

  一些原子类型、`String` 之类的 `new` 是 const 的（`String::new()` 是创建空字符串，不会进行内存分配，所以是 const 的），而 `Mutex::new()` 却不是，所以需要下面的东西来实现懒加载。

**懒加载**

`std::sync::OnceLock<T>`

- Rust 新版本中的东西
- 需要使用 `get_or_init` 显式初始化

`std::sync::LazyLock<T>`

- 相当于一个语法糖，在上面 `OnceLock` 的基础上，将 `get_or_init` 放到了 `Deref` 中

once_cell

- 第三方 crate，在 `OnceLock` 和 `LazyLock` 进 std 之前，是社区事实标准之一，后来被合入了 std 中。
- 在旧版本的 Rust 中仍然需要。
- 支持 no_std，基于 critical-section，需要配置 critical-section 的后端。

lazy_static

- 第三方 crate，但是目前已经停止维护
- 支持 no_std，基于 `spin::Once`

`tokio::sync::OnceCell`

- 相当于 Tokio 生态中的 `std::sync::OnceLock`
- Tokio 没有提供 LazyLock。常见的方法是拿函数去包裹 `get_or_init`66666

## 6. Thread Local

TODO
