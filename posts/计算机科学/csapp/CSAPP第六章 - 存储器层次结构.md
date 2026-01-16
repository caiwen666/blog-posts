@meta

```json
{
    "id": "csapp-6",
    "createTime": "2025-08-05 15:18",
    "key": ["csapp", "cache lab", "缓存", "存储"],
    "background": "http://pic.caiwen.work/i/2025/09/05/68baf76d55c95.png"
}
```





## 存储技术

### 随机访问存储器

#### SRAM

SRAM 是静态的随机访问寄存器，速度比 DRAM 快，常用作 CPU 内的缓存。

SRAM 将每个位存储在一个双稳态的存储器中，每个存储单元是用一个六晶体管电路来实现。这个存储器的结构类似于一个倒转的钟摆，可以无限期地保持在两种电压状态之一，其他的所有状态都是不稳定的，并可以立刻由不稳定状态转移到稳定状态：

![](http://pic.caiwen.work/i/2025/08/07/689403975cff0.png)

原则上，钟摆还可以在垂直位置一直保持平衡。但是这个状态是亚稳态的，一旦有任何细微的扰动也会使钟摆倒下，而且一旦倒下就不会恢复到垂直状态。

SRAM 这个双稳态的特性使得其只要有电，就能一直保持他的值，并且抗干扰的能力很强。干扰结束之后就能立刻恢复到原来的值。

#### DRAM

DRAM 将每个位存储为对一个非常小的电容的充电，每个存储单元由一个电容和一个访问晶体管组成。DRAM 存储单元对干扰非常敏感，电容的电压被扰乱之后就永远不会恢复了。

DRAM 上的电容会漏电，每 10 到 100 毫秒就会丢失电荷，使得数据丢失。不过 CPU 的时钟周期是以纳秒来衡量的，所以 DRAM 的数据保持时间相对来说还是比较长。CPU 需要定期读出数据，并重写来刷新内存中的每一位。

一个 DRAM 可以被分成 $d$ 个超单元。每个超单元可以存储 $w$ 位的信息。因此一个 DRAM 的存储 $dw$ 位。为了节省寻址电路，超单元是二维排列的，排列成 $r$ 行 $c$ 列的长方形，$rc=d$。每个超单元都可以用一个坐标 $(i,j)$ 进行定位。

![](http://pic.caiwen.work/i/2025/08/07/6894075bdb427.png)

每个 DRAM 芯片都连接有一个内存控制器，每次可以从 DRAM 写入或者读出一个超单元。

对于 $(i,j)$ 位置的超单元操作时，内存控制器会首先将行地址 $i$ 通过 addr 电路发送到 DRAM 中（这一步称为 RAS 请求），DRAM 将会将 $i$ 行的超单元全部复制到内部的行缓冲区中。随后，由通过相同的 addr 电路将列地址 $j$ 发送（这一步称为 CAS 请求），DRAM 将会从内部行缓冲区中将第 $j$ 个数据读出到 data 电路上，或是从 data 电路中写入。

addr 的电路宽度只需要可以容纳行数和列数中较大的那个就可以了。所以 DRAM 的行数和列数应该尽可能接近以减小 addr 电路引脚数量的浪费。

多个 DRAM 组合成我们熟悉的内存：

![](http://pic.caiwen.work/i/2025/08/07/6894098ec281c.png)

读写某个内存地址时，内存控制器将会把一个内存地址转成 DRAM 上的 $(i,j)$ 形式，并发送到每个 DRAM 芯片上。上面的内存中，每个超单元存储一个字节，内存由 8 个 DRAM 芯片组成，所以内存每次能同时读出 8 个字节。这可能也是一些体系结构（如 risc-v）要求内存对齐的原因。

上面这是传统的 DRAM。而实际应用中更多使用改进后的 DRAM ：

- **FPM DRAM（快页模式 DRAM）**：传统的 DRAM 中，如果连续读写相同行的超单元，DRAM 会反复载入内部行缓冲区。FPM DRAM 则会识别到如果某一行已经载入到内部行缓冲区中则不再重新载入。
- **EDO DRAM（扩展数据输出 DRAM）**：FPM DRAM 的加强版，允许 CAS 信号在时间上靠得更近一点。
- **SDRAM（同步 DRAM）**：DRAM、FPM DRAM、EDO RAM 都是异步的，也就是他们的控制信号和内存控制器的时钟信号的频率无关。而 SDRAM 是同步的，使用与内存控制器时钟信号的上升沿来代替许多的控制信号。具体细节不深入探讨。这样带来的效果是 SDRAM 比上面三种更快。
- **DDR SDRAM（双倍数据速率同步 DRAM）**：是 SDRAM 的增强版，他使用两个时钟沿作为控制信号，使得 DRAM 的速度翻倍。
- **VRAM（视频 RAM）**：用在图形系统的帧缓冲区中。他基本思想和 FPM DRAM 类似，但有两个主要区别：首先是 VRAM 的输出是通过依次对内部缓冲区的整个内容进行移位得到的；其次是 VRAM 允许对内存进行并行读和写，这使得系统可以在写 VRAM 的同时，用 VRAM 中的数据更新屏幕。

#### ROM

SRAM 和 DRAM 都属于易失性存储器，在断电后就会失去存储的信息。ROM 是非易失性存储器，断电后数据仍保持。非易失性存储器既可以读又可以写，但是由于历史原因，习惯被称为只读存储器，即 ROM。ROM 有如下几类：

- **PROM（可编程 ROM）** 每个存储器单元都一种熔丝，可被高电流熔断。PROM 只能被编程一次。
- **EPROM（可擦写可编程 ROM）** 每个存储单元有一个透明的石英窗口，允许光到达存储单元，当紫外线光照射窗口时，存储单元数据就被清零。写入存储单元需要额外的特殊设备。EPROM 擦除和重编程次数的数量级可达到 1000 次。
- **EEPROM（电子可擦除 ROM）** 类似 EPROM ，但不需要额外的设备进行写入，可以直接在 EEPROM 的电路卡上进行编程。EEPROM 能够被编程的次数的数量级可以达到 $10^5$ 次。现在的经常使用的闪存就是基于 EEPROM

### 磁盘

磁盘的结构如下：

- 一个磁盘有若干个**盘片**。

- 每个盘片有两面，称为**表面**。

- 每个面上划分若干个同心圆，称为**磁道**。

- 每个磁道被划分为一组**扇区**，每个扇区存储相等数量的数据（通常是 512 字节）。

- 扇区之间由一些**间隙**分隔开，这些间隙中不存储数据位，而是用来标识扇区的格式化位。

- 术语**柱面**指的是所有盘片表面上到主轴中心的距离相等的磁道集合。

![](http://pic.caiwen.work/i/2025/08/07/68941482e7741.png)

磁盘容量由如下因素决定：

- **记录密度**：磁道一英寸的段中可以放入的位数
- **磁道密度**：从盘片中心出发沿半径方向上，一英寸的段内可以有的磁道数

我们定义面密度为记录密度和磁道密度的乘积。

在之前，每个磁道上拥有的扇区数量都相同。但是由于磁道从内到外半径依次增大，这使得越外侧的磁道上扇区之间的间隙越来越大，会造成很严重的浪费。

现代大容量磁盘使用了一种称为多区记录的技术。我们把一些连续的磁道划分成一个区，同一个区内磁道上的扇区数量一致，由最靠近中心的磁道的扇区数量一致。不同区的磁道的扇区数量不一致。所以现代磁盘的一个参数是平均扇区数。

在磁盘上进行数据读写是以扇区为单位的。读写时会先寻找到目标地址所对应的扇区，有如下过程：磁盘上的读写头移动到目标扇区所在的磁道上，然后整个磁盘进行旋转，直到目标扇区到达读写头下。对于有多个盘片的磁盘，每个盘面都有一个读写头，读写头垂直排列，一致行动，很像内存同时读若干个 DRAM 芯片一样。

![](http://pic.caiwen.work/i/2025/08/07/6894189c344d1.png)

由于读写头距离盘面的高度只有 0.1 微米。因此哪怕是一粒微小的灰尘都会撞击到读写头。所以磁盘总是密封的。

磁盘读写扇区的时间由如下组成：

- 寻道时间：读写头移动到目标扇区所在的磁道的时间。现代磁盘的平均寻道时间是通过多次对随机扇区进行寻道，并统计耗时的平均值得到的，一般为 $3\sim 9\text{ms}$。一次寻道的最大时间可达到 $20\text{ms}$。
- 旋转时间：旋转盘片使得目标扇区到达读写头下的时间（准确来说是读写头到达目标扇区开头的时间）。由于盘片总是沿一个方向旋转，所以最坏情况下，读写头正好错过了目标扇区，需要整个旋转一圈，最大旋转时间根据磁盘的 RPM（每分钟旋转的圈数）计算。平均旋转时间是最大旋转时间的一半
- 传送时间：读写头读取一个扇区的时间。可根据 RPM 和磁道上的扇区数来进行计算

其中的传送时间很小，可以忽略不记。平均寻道时间一般作为磁盘的参数由制造商公布。旋转时间和平均寻道时间近似。因此将平均寻道时间乘 2 可以用来估计磁盘访问的时间。

### 固态硬盘

固态硬盘基于闪存技术。一个固态硬盘由闪存翻译层和闪存两部分组成。

其中闪存由若干个块组成，每个块又由若干个页组成。一个页的大小大概是 512 字节到 4KB 之间。一个块由 $32\sim 128$ 个页组成。

数据以页为单位进行读写。写入时，需要把一个块进行擦除才能写这个块内的页。一个块大约进行 $10^5$ 次擦写后就会被损坏。一个块被损坏之后就不能用了。当写操作试图修改一个已经包含数据的页时，这个页所属的块，整个都需要先复制到另一个已经被擦除的块中，然后再对目标页进行写。这也就使得固态硬盘的随机写速度很慢。闪存翻译层中实现了很复杂的逻辑，尽可能最小化写的代价，但是写的速度还是没读的速度快。

![](http://pic.caiwen.work/i/2025/08/07/68941d82ca4bd.png)

## CPU 总线

CPU 通过总线与外部的设备进行交互。总线结构如下：

![](http://pic.caiwen.work/i/2025/08/07/689449a2df047.png)

在读内存时，CPU 会将目标地址放到系统总线上，IO 桥将信号传递到内存总线，主存受到信号之后进行读取并将数据放到内存总线，IO 桥再将数据传回系统总线。写内存时同理。系统总线和内存总线与 CPU 相关。

其他的，如鼠标键盘、显卡、磁盘等，是连接到 IO 总线上的。IO 总线与 CPU 无关。IO 总线要比内存总线慢很多。

CPU 使用内存映射 IO 的技术来向 IO 设备发送命令。地址空间中有一块地址是用来与 IO 设备进行通信的，这被称为 IO 端口。一个设备可能会与一个或者多个 IO 端口相关联。

CPU 在操作 IO 设备时（如读磁盘），会向 IO 接口发送指令，表明要进行的操作、操作目标、参数等，IO 总线不会将对应的内存操作发送到内存总线，而是转而发送到相应的 IO 设备上。由于 IO 设备执行速度相比 CPU 的时钟周期来说相当慢，所以发完指令之后 CPU 继续做其他事情。IO 设备进行完操作之后会自行把数据放到内存中而并不需要 CPU 干涉（这也被称为 DMA（直接内存访问）技术）。数据完全准备完毕之后则会给 CPU 发送一个中断信号。

![](http://pic.caiwen.work/i/2025/08/07/68944d15b89a5.png)

## 缓存

### 存储器层次结构的缓存

存储器的层次结构如下：

![](http://pic.caiwen.work/i/2025/08/07/6894235e81679.png)

一般而言，上层的存储作为下层存储的缓存。

缓存既可以对数据进行缓存，又可以对指令进行缓存。前者称为 d-cache ，后者称为 i-cache。即缓存数据又缓存指令的缓存称为统一缓存。

![](http://pic.caiwen.work/i/2025/08/07/6894386edbf43.png)

如果访问第 $k+1$ 层数据的时候，第 $k$ 层已经有了，那么可以直接从第 $k$ 层获取，这成为**缓存命中**。

反之我们称为**缓存不命中**，缓存不命中又分为如下的类型：

- 如果第 $k$ 层是空的，那么任何的数据访问请求都会缓存不命中。我们称这样的第 $k$ 层为**冷缓存**，这样的缓存不命中称为**强制不命中**或是**冷不命中**
- 第 $k$ 层决定缓存数据时，必须选择一个缓存的放置策略。最好的放置策略是第 $k$ 层的任何地方都可以放置缓存，但是这样的策略过于灵活，不好实现，且缓存定位起来代价也较高。硬件缓存一般使用的是比较严格的放置策略，第 $k+1$ 层的块 $i$ 在第 $k$ 层放置的位置取决于块编号 $i$。将一个块载入缓存时，如果放置的位置已经存在了数据，那么就会把原来被缓存的数据**驱逐**。这样会出现一个问题，就是可能 $k+1$ 层存在两个块使用了 $k$ 层的同一个位置。反复读取这两个块就会使得缓存一直不命中。这种缓存不命中称为**冲突不命中**
- 程序在运行过程中，可能会反复使用某个数据（比如循环反复访问一个数组），这个数据称为这个阶段的**工作集**，当工作集的大小超过缓存的大小时，会出现缓存不命中，这种被称为**容量不命中**

上面主要是关注读取。写入数据时，会出现两种情况：

- 要写入的位置已经位于缓存中，我们称之为**写命中**，此时又有两种策略：
  - **直写**：修改位于缓存中的块，然后立刻把这个块写回低一层。优点是简单，缺点是每次写都会引起总线的流量。
  - **写回**：修改位于缓存中的块，但是不立刻写回到低一层，而是等该缓存被驱逐时，才会写回到低一层。优点是可以减少总线的流量，缺点是增加了复杂性，需要额外维护缓存是否被修改过
- 要写入的位置没有在缓存中，即**写不命中**，此时也有两种策略：
  - **写分配**：把要写入的位置加载到缓存中，再进行修改。写分配通常和写回配合。
  - **非写分配**：避开缓存，直接修改低一层。非写分配通常和直写配合

一般写回+写分配策略是比较常用的。因为对低一层的存储器进行写消耗的时间比较大，且写回+写分配与处理读的方式更加统一，且写回+写分配导致的电路复杂性在现代电路中已经不算障碍了。

### 缓存结构

假设一个计算机系统每个存储器地址有 $m$ 位，形成 $M=2^m$ 个不同的地址。

一个缓存有 $S=2^s$ 个缓存组。

每个缓存组有 $E$ 个缓存行。

每个缓存行包含三部分：有效位、标记、$B=2^b$ 个缓存块。

![](http://pic.caiwen.work/i/2025/08/07/68943b631c56e.png)

从缓存中读一个地址的时候，我们把这个地址分成三部分。其中 $s$ 和 $b$ 是缓存的参数，$t=m-s-b$

![](http://pic.caiwen.work/i/2025/08/07/68943be38bd56.png)

根据取到的组索引选择相应的缓存组，然后在该组内的缓存行中搜索，找到有效位为 1 且标记部分和地址的标记部分相同的缓存行。找到了则说明缓存命中，并根据块偏移读取缓存行中相应的块。反之说明缓存不命中，从下一层存储器读取数据并载入缓存。从下一层存储器读取数据时，不光要读取要访问的块，还需要把其对应的缓存行中其他的缓存块也读入，这样下次读入上次地址附近的数据时缓存就命中了。

#### 直接映射缓存

当 $E=1$ 即每个缓存组只有一个缓存行时，我们将这种缓存称为直接映射缓存。

![](http://pic.caiwen.work/i/2025/08/07/6894409ac44ee.png)

这种缓存容易产生冲突不命中。如：

![](http://pic.caiwen.work/i/2025/08/07/68943e54e0a33.png)

假设缓存只有两个缓存组，一个缓存行有 16 个块（存放 16 个字节，即可以存放 4 个单精度浮点数）。如果上述函数的 x 和 y 在内存中连续放置的话，则有：

![](http://pic.caiwen.work/i/2025/08/07/68943f2b1ecaf.png)

于是就会发现第七行代码会使得缓存不断发生冲突不命中。我们称程序在 x 和 y 之间进行抖动。抖动可能会使程序运行速度下降 2 或 3 倍。一个简单的解决方法是在 x 后面填充一些数据，填充大小与一个缓存行的所有块大小一致。比如我们定义为 `float x[12]`，就有：

![](http://pic.caiwen.work/i/2025/08/07/68944037a0f74.png)

这样就不会发生抖动了

#### 全相连缓存

缓存只有一个缓存组，称为全相连缓存：

![](http://pic.caiwen.work/i/2025/08/07/689440e579c11.png)

缓存在硬件实现上，是并行地判断缓存行的标记和地址上的标记是否匹配。全相连缓存的缓存行非常多，这会使得标记匹配的电路的实现又贵又困难。全相连缓存只适合做小的缓存，如虚拟内存的快表（TLB）就是全相连缓存。

#### 组相连缓存

除了上面两种情况的缓存就是组相连缓存。有 $E$ 个缓存组的缓存被称为 $E$ 路组相联缓存。

![](http://pic.caiwen.work/i/2025/08/07/689442a00c550.png)

像组相联缓存和全相连缓存，一个缓存组内有多个缓存行这种，在缓存不命中的时候，如果存在有效位为 0 的缓存行，我们就可以把新载入的数据放到这个缓存行中。如果没有的话，我们需要选择驱逐哪个缓存行，需要确定一个替换策略。替换策略有两种：

- **LFU（最不常使用策略）**：替换在过去某个时间窗口内引用次数最少的缓存行
- **LRU（最近最少使用策略）**：替换最后一次访问时间最久远的缓存行

### 缓存性能

有如下指标来衡量缓存的性能：

- 不命中率：$\frac{\text{不命中数量}}{\text{引用数量}}$
- 命中率：$1-\text{不命中率}$
- 命中时间：从缓存传送一个字到 CPU 所需要的时间，包含组选择、行确认、字选择、字传送的时间
- 不命中处罚：由于不命中所需要的额外时间，包含从下一层存储读数据、进行替换等时间

对于缓存大小，一方面，较大缓存大小可以提高缓存命中率。另一方面，大存储器的命中时间会长一点。因此层次越高的存储器大小越小。

对于单个缓存行的块数量，一方面，较多的块数量可以提高命中率。另一方面，也会增加不命中处罚。

对于相连度（即单个缓存组中缓存行的数量大小），一方面，相连度较大的话可以降低冲突不命中的抖动。另一方面，较高的相连度实现起来复杂又昂贵，这会增加命中时间，且选择被替换的行的复杂性也增加了，这会增加不命中时间。一般层次越高的缓存使用较低的相连度，层次较低的缓存使用较高的相连度。

## 程序利用缓存

一个良好的程序应当具有良好的局部性。局部性有两种形式：

- 空间局部性：如果一个内存位置被引用了一次，那么程序在不远的将来会引用这个内存位置附近的内存位置（这个内存位置被引用后必然存在缓存中，那么其附近的数据可能在同一个缓存行中）
- 时间局部性：某个内存位置被引用之后，后续还可能会多次引用这个内存位置（这个内存位置已经被载入缓存）

### 时间局部性

下表展示了时间局部性：

![](http://pic.caiwen.work/i/2025/08/07/689453adc8ff4.png)

这表明，工作集越小，越能够放进更高层的缓存中，使得访问速度更快。我们应该考虑将访问频繁的数据放入 L1 缓存中。

步长为 1 进行访问时，即使访问的工作集已经远远超过 L1 缓存大小，但是测试会发现仍可以获得 L1 缓存的访问速率。这是因为现代的处理器有硬件级的预取机制，能够自动识别步长为 1 的访问模式，进而在下一次访问开始之前就把数据加入到缓存中。

### 空间局部性

下表展示了空间局部性：

![](http://pic.caiwen.work/i/2025/08/07/689455bf8ff2c.png)

吞吐量的降低是由于缓存不命中次数的增加。步长从 8 开始，每次访问都会导致缓存不命中，读吞吐量退化到和直接读取较低层存储器一样了。我们应该考虑尽可能让访问比较连续，以增加空间局部性。

如：

![](http://pic.caiwen.work/i/2025/08/07/6894500008761.png)

第三章学习过，多维数组在内存中的放置是按最后一个下标连续放置的，所以上面的代码会连续访问内存，代码有很好的空间局部性。但是没有很好的时间局部性，因为每个地址只会被访问一次。一般空间局部性和时间局部性有一个就可以。

其缓存命中情况如下：

![](http://pic.caiwen.work/i/2025/08/07/6894508c60b5d.png)

而如果我们交换循环顺序：

![](http://pic.caiwen.work/i/2025/08/07/689450ac6dacf.png)

代码会跳跃式地访问内存，空间局部性变得很差。缓存命中情况也很糟糕：

![](http://pic.caiwen.work/i/2025/08/07/689450ffee4b8.png)

在一些机器上，前者会比后者快 25 倍。

## Cache Lab

### Part A

第一部分要求我们手动实现一个缓存的模拟器，还是比较简单的：

```c
#include "cachelab.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef unsigned long long u64;

typedef struct {
    int valid, last_time;
    u64 tag;
} CacheRow;

typedef struct {
    CacheRow *rows;
} CacheGroup;

int s, E, b, time_stamp, group_cnt, hit_cnt, miss_cnt, eviction_cnt;
char *file_name;
CacheGroup *groups;

int str2int(char *str) {
    int len = strlen(str);
    int res = 0;
    for (int i = 0; i < len; i ++){
        res *= 10;
        res += str[i] - '0';
    }
    return res;
}
// int hex2int(char *str) {
//     int len = strlen(str);
//     int res = 0;
//     for (int i = 0; i < len; i ++) {
//         res *= 16;

//     }
//     return res;
// }
void parseArguments(int argc, char* argv[]) {
    for (int i = 1; i < argc; i += 2) {
        if (argv[i][1] == 't') {
            file_name = argv[i + 1];
        } else {
            int val = str2int(argv[i + 1]);
            switch (argv[i][1]) {
                case 's':
                    s = val;
                    break;
                case 'E':
                    E = val;
                    break;
                case 'b':
                    b = val;
                    break;
            }
        }
    }
    group_cnt = 1 << s;
}
void initCache() {
    groups = malloc(sizeof(CacheGroup) * group_cnt);
    for (int i = 0; i < group_cnt; i ++) {
        CacheRow *rows = malloc(sizeof(CacheRow) * E);
        for (int j = 0; j < E; j ++) {
            rows[j].valid = 0;
        }
        groups[i].rows = rows;
    }
}
void touchCache(u64 group_index, u64 tag) {
    time_stamp ++;
    CacheRow *rows = groups[group_index].rows;
    for (int i = 0; i < E; i ++) {
        if (rows[i].valid && rows[i].tag == tag) {
            hit_cnt ++;
            rows[i].last_time = time_stamp;
            return;
        }
    }
    miss_cnt ++;
    for (int i = 0; i < E; i ++) {
        if (!rows[i].valid) {
            rows[i].valid = 1;
            rows[i].tag = tag;
            rows[i].last_time = time_stamp;
            return;
        }
    }
    eviction_cnt ++;
    int eviction_target = 0;
    for (int i = 1; i < E; i ++) {
        if (rows[i].last_time < rows[eviction_target].last_time) {
            eviction_target = i;
        }
    }
    rows[eviction_target].tag = tag;
    rows[eviction_target].last_time = time_stamp;
}
void readTrace() {
    FILE *file = fopen(file_name, "r");
    char line[256];
    while (fgets(line, sizeof(line), file)) {
        if (line[0] == 'I') continue;
        int len = strlen(line);
        char op = line[1];
        u64 addr = 0;
        for (int i = 3; i < len; i ++) {
            if (line[i] == ',') break;
            addr *= 16;
            if (line[i] <= '9') addr += line[i] - '0';
            else addr += line[i] - 'a' + 10;
        }
        //u64 block_index = addr & (((u64)1 << b) - 1);
        u64 group_index = (addr >> b) & (((u64)1 << s) - 1);
        u64 tag = addr >> (b + s);
        if (op == 'L' || op == 'S') touchCache(group_index, tag);
        else if (op == 'M') touchCache(group_index, tag), touchCache(group_index, tag);
    }
}
int main(int argc, char* argv[])
{
    parseArguments(argc, argv);
    initCache();
    readTrace();
    printSummary(hit_cnt, miss_cnt, eviction_cnt);
    return 0;
}

```

### Part B

这一部分要求我们去优化一个矩阵转置函数，使其缓存的不命中次数尽可能少。输入的矩阵大小只有 $32\times 32$ 、$64\times 64$、$61\times 67$ 三种，允许我们针对这三种特定情况进行优化。

为了方便观察内存地址的访问情况，我写了个 rust 程序，可以将 trace 中每个地址的标记、组索引、块偏移计算出来：

```rust
use std::io::BufRead;

fn main() {
    let mut lines = vec![];
    let mut max_line_len = 0;
    for line in std::io::stdin().lock().lines() {
        let line = line.unwrap();
        if !line.starts_with('L') && !line.contains('S') {
            continue;
        }
        max_line_len = max_line_len.max(line.len());
        lines.push(line);
    }
    max_line_len += 2;
    for line in lines {
        let part: u64 = line
            .split_ascii_whitespace()
            .filter(|s| s.len() >= 2)
            .collect::<Vec<_>>()
            .join("")
            .split(',')
            .next()
            .unwrap()
            .chars()
            .map(|c| c.to_digit(16).unwrap() as u64)
            .fold(0u64, |acc, d| acc * 16 + d) as u64;
        let block_index = part & ((1 << 5) - 1);
        let group_index = (part >> 5) & ((1 << 5) - 1);
        let tag = part >> 10;
        println!("{}{}{:015b} {:05b} {:05b}\ttag={},group={}", line, " ".repeat(max_line_len - line.len()), tag, group_index, block_index, tag, group_index);
    }
}
```

然后我们可以这么运行：

```bash
make
./test-trans -N 32 -M 32
./csim-ref -v -s 5 -E 1 -b 5 -t trace.f1 | cargo run > trace_fmt
```

然后在 `trace_fmt` 文件中就可以看到相应的信息了：

![](http://pic.caiwen.work/i/2025/08/05/6891b2300eafb.png)

#### 32 x 32

上图展示了最朴素的转置函数的缓存命中情况。从第六行开始应该是和转置函数有关。其中 `L` 开头的应该是访问数组 `A`，`S` 开头的应该是访问数组 `B`。我们发现后者基本从来没命中过缓存，而前者缓存命中率很高。

```cpp
/*
 * trans - A simple baseline transpose function, not optimized for the cache.
 */
char trans_desc[] = "Simple row-wise scan transpose";
void trans(int M, int N, int A[N][M], int B[M][N])
{
    int i, j, tmp;

    for (i = 0; i < N; i++) {
        for (j = 0; j < M; j++) {
            tmp = A[i][j];
            B[j][i] = tmp;
        }
    }

}
```

原因也很明显，对 `A` 的访问是连续的，但是由于对 `B` 的访问是跳行的，所以 `B` 一次的访问根本用不到上次的访问时加载的缓存。

实验的文档中给了个提示，说是分块技术可能对实验有帮助。我没仔细看，只是大概了解了一下分块的思想，并想到了优化方案。由于缓存的块偏移有 $b=5$ 位，int 大小为 4 字节，所以每个缓存行可以缓存 $\frac{2^5}{4} = 8$ 个元素。我们按 $8\times8$ 的分块大小将 $32\times 32$ 的矩阵划分成 $4\times 4$ 部分。对于一个块的全部元素进行置换，被置换的元素仍在 `B` 中的某个块中。

对于一个块，我们先把他一行的全部元素进行读取，存到变量中。然后我们再按列方向，把置换后的元素写入 `B` 的对应位置，由于是按列，缓存可能全没有命中（比如第一次时），但是此时 `B` 的块中的每一行都被载入缓存了。然后我们再从 `A` 中读取下一行，因为缓存仍未命中，于是将这一行加入缓存（假设加入了缓存组 $x$），然后再把这一行元素全部读取到变量。接下来在 `B` 中按列方向进行写入时，由于上一次已经把 `B` 的块中的每一行载入缓存了，所以大部分的缓存都是命中的，唯独缓存组 $x$ 对应的那个行，被 `A` 中元素覆盖了，未命中缓存。这样一来，我们的缓存命中次数会很高。

```c
/*
 * transpose_submit - This is the solution transpose function that you
 *     will be graded on for Part B of the assignment. Do not change
 *     the description string "Transpose submission", as the driver
 *     searches for that string to identify the transpose function to
 *     be graded.
 */
char transpose_submit_desc[] = "Transpose submission";
void transpose_submit(int M, int N, int A[N][M], int B[M][N])
{
    int col, row, p, e1, e2, e3, e4, e5, e6, e7, e8;

    for (row = 0; row < N; row += 8) {
        for (col = 0; col < M; col += 8) {
            for (p = 0; p < 8; p ++) {
                e1 = A[row + p][col];
                e2 = A[row + p][col + 1];
                e3 = A[row + p][col + 2];
                e4 = A[row + p][col + 3];
                e5 = A[row + p][col + 4];
                e6 = A[row + p][col + 5];
                e7 = A[row + p][col + 6];
                e8 = A[row + p][col + 7];
                B[col][row + p] = e1;
                B[col + 1][row + p] = e2;
                B[col + 2][row + p] = e3;
                B[col + 3][row + p] = e4;
                B[col + 4][row + p] = e5;
                B[col + 5][row + p] = e6;
                B[col + 6][row + p] = e7;
                B[col + 7][row + p] = e8;
            }
        }
    }
}
```

测试的 misses 只有 288

#### 64 x 64

当矩阵大小为 $64\times 64$ 时，上面的优化方案竟然和朴素做法相差不大。

实际上，$32\times 32$ 时，每个元素会存放到的缓存组分布如下：

```
5  6  7  8
9  10 11 12
13 14 15 16
17 18 19 20
21 22 23 24
25 26 27 28
29 30 31 0
1  2  3  4
```

其中每行代表一个元素，每列代表 8 个元素。

而 $64\times 64$ 时，则为：

```
5  6  7  8  9  10 11 12
13 14 15 16 17 18 19 20
21 22 23 24 25 26 27 28
29 30 31 0  1  2  3  4
5  6  7  8  9  10 11 12
13 14 15 16 17 18 19 20
21 22 23 24 25 26 27 28
29 30 31 0  1  2  3  4
```

前者 $8\times 8$ 的一个块中，列方向有 $8$ 个不同的缓存组。而后者只有 $4$ 个不同的缓存组。在按列方向写 `B` 时，后 4 行会因为与前 4 行共用了一个缓存组，导致缓存命中率很低（甚至根本无法命中）

一个方案是我们改成 $4\times 4$ 分块。但是这样做 misses 还是有 1700，无法获得满分

我们在列方向上最多只能反复写 $4$ 行，不然缓存就会不断地载入又被驱逐

所以一个想法是使用 $8\times 4$ 的分块，这样做 misses 有 1600 多。随后我加了一点优化：

![](http://pic.caiwen.work/i/2025/08/06/68932d7852690.png)

我们按绿色箭头的方向进行读取，而不是一律从上到下进行读取。因为读完最后一个的时候，整个行上的 $8$ 个元素都载入到缓存了，这样做可以增大缓存的利用率。

同时，我考虑每次读两行，这样可能能够减少缓存不命中。于是有了如下代码：

```c
for (row = 0; row < N; row += 8) {
    now = 0;
    for (col = 0; col < row; col += 4) {
        for (now? (p = 8 - 1) : (p = 0); now? (p >= 0) : (p < 8); now? (p -= 2) : (p += 2)) {
            e1 = A[row + p][col];
            e2 = A[row + p][col + 1];
            e3 = A[row + p][col + 2];
            e4 = A[row + p][col + 3];
            e5 = A[row + p + (now? -1:1)][col];
            e6 = A[row + p + (now? -1:1)][col + 1];
            e7 = A[row + p + (now? -1:1)][col + 2];
            e8 = A[row + p + (now? -1:1)][col + 3];
            B[col][row + p] = e1;
            B[col + 1][row + p] = e2;
            B[col + 2][row + p] = e3;
            B[col + 3][row + p] = e4;
            B[col][row + p + (now? -1:1)] = e5;
            B[col + 1][row + p + (now? -1:1)] = e6;
            B[col + 2][row + p + (now? -1:1)] = e7;
            B[col + 3][row + p + (now? -1:1)] = e8;
        }
        now = 1 - now;
    }
}
```

这样做的 misses 为 1412，距离满分还差一点距离。

后续实验就遇到了瓶颈。经过观察，我们发现，如果把 $64\times 64$ 的矩阵按 $8\times 8$ 划分之后

![](http://pic.caiwen.work/i/2025/08/06/689330d373dfe.png)

非对角线上，置换前后位置使用的是不同的缓存组，而对角线上则相反。因此，很多 misses 是由于对角线上置换导致的冲突不命中。

一个对角线块上，会进行两次对于 $8\times 4$ 分块的运算。每次处理 $8\times 4$ 分块都会带来大约 $(4 + 1) + (1 + 1) \times 7=19$ 的缓存不命中次数。那么一个对角线块就产生 $38$ 次缓存不命中。

接下来的关注点就在于如何科学地处理对角线块。中间我试了很多种神奇的处理方式，但经过计算和代码验证都不如目前的 $8\times 4$ 分块。

想了很久之后我突然有一个想法，我们能否把一个对角线块置换后的结果先放入 B 中的一个区域中，然后再把这个区域复制到其正确的位置上。这个区域就充当一个中转功能，并且由于使用和对角线块不同的缓存组，缓存的冲突不命中次数将会很低。

后来经过尝试发现，我们不能直接把对角线块的置换结果放入中转区域，因为我们按行读对角线块的时候，中转区域是按列方向，反复对 $8$ 行进行写入，这会和 $8\times 8$ 分块一样带来严重的冲突不命中。

不过后续我很快想到了解决方案，我们可以选定两个 $4\times 8$ 的中转区域，然后把对角线块按 $4\times 4$ 划分成四个区域，将置换结果放入中转区域中。这样做的话，对于每个对角线块，我们只会带来 $8+8+8=24$ 个缓存不命中。实际上，由于我们会反复利用同一个中转区域，后续由于写中转区域所带来的缓存不命中基本没有。同时我们合理调整写入顺序的话，缓存不命中次数还能更少。

这里我选择前 $4$ 行最靠右的两个区域作为中转区域：

![](http://pic.caiwen.work/i/2025/08/06/6893375a873df.png)

注意转置的时候我们是一行一行的来，因为 AB 和 CD 之间的使用同一个缓存组。从中转区域复制回来的时候要先复制下面一行，因为我们之前是后处理下面一行的，这样还能利用上之前的缓存。

不过这样会有个问题，就是当处理倒数两个对角线块的时候，对角线块使用的缓存组和中转区域的缓存组冲突，会导致严重的冲突不命中。所以我们需要特殊处理，改为选用别的中转区域来处理最后两个对角线块

```c
    int col, row, now = 0, p, e1, e2, e3, e4, e5, e6, e7, e8;
    // 单独处理对角块
    // 我们选择前 8 行的后 16 列作为中转块
    for (p = 0; p < N - 16; p += 8) {
        // 左上
        for (row = p; row < p + 4; row ++) {
            for (col = p; col < p + 4; col ++) {
                now = A[row][col];
                B[col - p][row - p + 48] = now;
            }
        }
        // 右上
        for (row = p; row < p + 4; row ++) {
            for (col = p + 4; col < p + 8; col ++) {
                now = A[row][col];
                B[col - p - 4][row - p + 48 + 4] = now;
            }
        }
        // 左下
        for (row = p + 4; row < p + 8; row ++) {
            for (col = p; col < p + 4; col ++) {
                now = A[row][col];
                B[col - p][row - p + 56 - 4] = now;
            }
        }
        // 右下
        for (row = p + 4; row < p + 8; row ++) {
            for (col = p + 4; col < p + 8; col ++) {
                now = A[row][col];
                B[col - p - 4][row - p + 56] = now;
            }
        }
        // 然后复制回来
        // B
        for (row = 0; row < 4; row ++) {
            for (col = 48 + 4; col < 48 + 8; col ++) {
                now = B[row][col];
                B[row + p + 4][col - 48 + p - 4] = now;
            }
        }
        // D
        for (row = 0; row < 4; row ++) {
            for (col = 56 + 4; col < 56 + 8; col ++) {
                now = B[row][col];
                B[row + p + 4][col - 56 + p] = now;
            }
        }
        // A
        for (row = 0; row < 4; row ++) {
            for (col = 48; col < 48 + 4; col ++) {
                now = B[row][col];
                B[row + p][col - 48 + p] = now;
            }
        }
        // C
        for (row = 0; row < 4; row ++) {
            for (col = 56; col < 56 + 4; col ++) {
                now = B[row][col];
                B[row + p][col - 56 + p + 4] = now;
            }
        }
    }
    // 最后两个对角线需要再特殊处理一下
    for (p = N - 16; p < N; p += 8) {
        // 左上
        for (row = p; row < p + 4; row ++) {
            for (col = p; col < p + 4; col ++) {
                now = A[row][col];
                B[col - p][row - p + 8] = now;
            }
        }
        // 右上
        for (row = p; row < p + 4; row ++) {
            for (col = p + 4; col < p + 8; col ++) {
                now = A[row][col];
                B[col - p - 4][row - p + 8 + 4] = now;
            }
        }
        // 左下
        for (row = p + 4; row < p + 8; row ++) {
            for (col = p; col < p + 4; col ++) {
                now = A[row][col];
                B[col - p][row - p + 16 - 4] = now;
            }
        }
        // 右下
        for (row = p + 4; row < p + 8; row ++) {
            for (col = p + 4; col < p + 8; col ++) {
                now = A[row][col];
                B[col - p - 4][row - p + 16] = now;
            }
        }
        // 然后复制回来
        // B
        for (row = 0; row < 4; row ++) {
            for (col = 8 + 4; col < 8 + 8; col ++) {
                now = B[row][col];
                B[row + p + 4][col - 8 + p - 4] = now;
            }
        }
        // D
        for (row = 0; row < 4; row ++) {
            for (col = 16 + 4; col < 16 + 8; col ++) {
                now = B[row][col];
                B[row + p + 4][col - 16 + p] = now;
            }
        }
        // A
        for (row = 0; row < 4; row ++) {
            for (col = 8; col < 8 + 4; col ++) {
                now = B[row][col];
                B[row + p][col - 8 + p] = now;
            }
        }
        // C
        for (row = 0; row < 4; row ++) {
            for (col = 16; col < 16 + 4; col ++) {
                now = B[row][col];
                B[row + p][col - 16 + p + 4] = now;
            }
        }
    }
    for (row = 0; row < N; row += 8) {
        // 对角线之前
        now = 0;
        for (col = 0; col < row; col += 4) {
            for (now? (p = 8 - 1) : (p = 0); now? (p >= 0) : (p < 8); now? (p -= 2) : (p += 2)) {
                e1 = A[row + p][col];
                e2 = A[row + p][col + 1];
                e3 = A[row + p][col + 2];
                e4 = A[row + p][col + 3];
                e5 = A[row + p + (now? -1:1)][col];
                e6 = A[row + p + (now? -1:1)][col + 1];
                e7 = A[row + p + (now? -1:1)][col + 2];
                e8 = A[row + p + (now? -1:1)][col + 3];
                B[col][row + p] = e1;
                B[col + 1][row + p] = e2;
                B[col + 2][row + p] = e3;
                B[col + 3][row + p] = e4;
                B[col][row + p + (now? -1:1)] = e5;
                B[col + 1][row + p + (now? -1:1)] = e6;
                B[col + 2][row + p + (now? -1:1)] = e7;
                B[col + 3][row + p + (now? -1:1)] = e8;
            }
            now = 1 - now;
        }
        // 对角线之后
        for (col = row + 8; col < M; col += 4) {
            for (now? (p = 8 - 1) : (p = 0); now? (p >= 0) : (p < 8); now? (p -= 2) : (p += 2)) {
                e1 = A[row + p][col];
                e2 = A[row + p][col + 1];
                e3 = A[row + p][col + 2];
                e4 = A[row + p][col + 3];
                e5 = A[row + p + (now? -1:1)][col];
                e6 = A[row + p + (now? -1:1)][col + 1];
                e7 = A[row + p + (now? -1:1)][col + 2];
                e8 = A[row + p + (now? -1:1)][col + 3];
                B[col][row + p] = e1;
                B[col + 1][row + p] = e2;
                B[col + 2][row + p] = e3;
                B[col + 3][row + p] = e4;
                B[col][row + p + (now? -1:1)] = e5;
                B[col + 1][row + p + (now? -1:1)] = e6;
                B[col + 2][row + p + (now? -1:1)] = e7;
                B[col + 3][row + p + (now? -1:1)] = e8;
            }
            now = 1 - now;
        }
    }
```

misses 只有 1268，获得满分

#### 61 x 67

感觉这种情况下，矩阵每个位置使用的缓存组很没有规律。我甚至还用 react 画了一下分布情况：

![](http://pic.caiwen.work/i/2025/08/06/689356732e597.png)

果然很没有规律。

我考虑直接沿用之前的 $8\times 8$ 的分块，之后整个矩阵还有最右边和最下面有一块没有覆盖到。再单独开一个循环处理。处理最右边的部分时我们逐行处理，处理最下面的部分时我们逐列处理。这样做的 misses 为 2066，很接近满分。

于是我又试了一下其他大小的分块，效果都没有 $8\times 8$ 的好。考虑到目前已经开了 $11$ 个变量，于是打算把 $12$ 个变量的限制用满，再开一个变量，搞个 $9\times 9$ 的分块：

```c
const int BLOCK_N = 9;
const int BLOCK_M = 9;
const int LIMIT_N = 61 / BLOCK_N * BLOCK_N;
const int LIMIT_M = 67 / BLOCK_M * BLOCK_M;
//const int REM_N = 61 - LIMIT_N;
//const int REM_M = 67 - LIMIT_M;
int col, row, p, e1, e2, e3, e4, e5, e6, e7, e8, e9;
for (row = 0; row < LIMIT_N; row += BLOCK_N) {
    for (col = 0; col < LIMIT_M; col += BLOCK_M) {
        for (p = 0; p < BLOCK_N; p ++) {
            e1 = A[row + p][col];
            e2 = A[row + p][col + 1];
            e3 = A[row + p][col + 2];
            e4 = A[row + p][col + 3];
            e5 = A[row + p][col + 4];
            e6 = A[row + p][col + 5];
            e7 = A[row + p][col + 6];
            e8 = A[row + p][col + 7];
            e9 = A[row + p][col + 8];
            B[col][row + p] = e1;
            B[col + 1][row + p] = e2;
            B[col + 2][row + p] = e3;
            B[col + 3][row + p] = e4;
            B[col + 4][row + p] = e5;
            B[col + 5][row + p] = e6;
            B[col + 6][row + p] = e7;
            B[col + 7][row + p] = e8;
            B[col + 8][row + p] = e9;
        }
    }
}
for (row = 0; row < N; row++) {
    for (col = LIMIT_M; col < M; col++) {
        B[col][row] = A[row][col];
    }
}
for (col = 0; col < LIMIT_M; col ++){
    for (row = LIMIT_N; row < N; row++) {
        B[col][row] = A[row][col];
    }
}
```

结果 misses 直接到 1992，直接满分，比想象的简单（）

（后来发现做反了，应该是 67 行，61 列，但是做法还是正确的）
