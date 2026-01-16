@meta

```json
{
    "id": "csapp-4",
    "createTime": "2025-07-19 16:32",
    "key": ["csapp", "arch lab", "体系架构", "流水线", "cpu", "指令集"],
    "background": "http://pic.caiwen.work/i/2025/09/05/68bafb018b40f.png"
}
```





## 准备

### Y86-64

本章首先介绍了一个简化的指令集：Y86-64

![](http://pic.caiwen.work/i/2025/07/23/688069a7c877d.png)

其中 `OPq` 、`jxx`、`cmovXX` 是三个大类，每个种类都共享第一个字节的高位，具体功能的不同取决于这个字节的低位。其中 `rrmovq` 视为 `cmovXX` 一类，可以看成是无条件数据传送

![](http://pic.caiwen.work/i/2025/07/23/68806a4ae1372.png)

上述的 `rA` 和 `rB` 表示寄存器编号。寄存器名称和编号的对应如下：

![](http://pic.caiwen.work/i/2025/07/23/68806a959d346.png)

其中无寄存器的表示可以在后面设计电路的时候带来便利

同时还有状态码寄存器 `CF`，`SF` 和 `OF`

还有 `PC` 寄存器表示下一条指令的地址。`Stat` 寄存器描述当前处理器的状态，取值如下：

![](http://pic.caiwen.work/i/2025/07/23/68806bd4abda7.png)

其他地方大多与 X86-64 相同

### HCL

这一章还自己搞了个硬件控制语言 HCL，用来描述电路的控制逻辑

与或非是电路中基本的逻辑门，其电路表示和对应的 HCL 表述如下：

![](http://pic.caiwen.work/i/2025/07/23/68806d5079ecc.png)

其中 a 和 b 是一个 bit

将逻辑门进行组合就得到组合电路。组合电路的构建有如下的要求：

- 每个逻辑门的输入比如是主输入，或者另一个逻辑门的输出，或者是某个存储单元的输出
- 两个或者多个逻辑门的输出不能连在一起，否则线上的信号会产生矛盾
- 组合电路必须是无环的

比如有：

![](http://pic.caiwen.work/i/2025/07/23/68806e5c341f3.png)

对应的 HCL 为 `bool eq = (a && b) || (!a && !b);`，可以检测是否位相等

还有：

![](http://pic.caiwen.work/i/2025/07/23/68806ea2c9291.png)

对应的 HCL 为 `bool out= (s && a) || (!s && b);`，可以进行多路复用

我们可以把单个的逻辑门组合成一个大的字级计算的组合电路

![](http://pic.caiwen.work/i/2025/07/23/68806f15c92f9.png)

HCL 中可以直接表示，`bool Eq = (A == B);`

字级的多路复用：

![](http://pic.caiwen.work/i/2025/07/23/68807079d8c9d.png)

HCL 中可以直接类似下面这样写：

```
word Out = [
	!s1 && !s0: A;
	!s1: B;
	!s0: C;
	1: D;
]
```

这个表达式是按顺序求值的，只选择第一个为 1 的情况。最后的 1 表示默认情况

组合逻辑电路还可以进行一些运算，不过具体的原理这里被忽略了，我们只抽象出一种叫做 算数/逻辑单元（ALU）的东西，它可以进行如下的操作：

![](http://pic.caiwen.work/i/2025/07/23/6880724693add.png)

HCL 还支持集合关系语法：

```
bool s1 = code in { 2, 3 };
bool s0 = code in { 1, 3 };
```

## 指令设计

我们把每个指令的处理统一成 6 个阶段：

- 取值：从内存中读取指令
- 译码：将指令中涉及到的寄存器具体的值取出
- 执行：进行运算相关操作，比如运算指令，或者是地址的计算，增加或减少栈指针。对于有关条件的指令，对条件码的判断也在这个阶段
- 访存：读取或者是写入内存
- 写回：将数据写入到寄存器中
- 更新 PC

然后各个指令的设计如下：

![](http://pic.caiwen.work/i/2025/07/23/68807910123cb.png)

![](http://pic.caiwen.work/i/2025/07/23/688090049cf5f.png)

![](http://pic.caiwen.work/i/2025/07/23/688090aeb307e.png)

![](http://pic.caiwen.work/i/2025/07/23/6880a1da13afa.png)

![](http://pic.caiwen.work/i/2025/07/23/688093bc2e989.png)

## SEQ

一个最简单的处理器设计如下：

![](http://pic.caiwen.work/i/2025/07/23/6880955359f74.png)

其中虚线表示单个位，细线表示单个字节，粗线表示一个字

下表是一些常量：

![](http://pic.caiwen.work/i/2025/07/23/688096180341b.png)

### 取指阶段

![](http://pic.caiwen.work/i/2025/07/23/68809652daa41.png)

取指阶段首先根据 PC 来读一条指令的第一个字节，并拆分成 `icode` 和 `ifun` 两部分。如果之前 PC 指向的内存地址错误的话，那么指令内存会发生 `imem_error` 信号，这个信号将设置 `icode` 为 `nop`（无操作）指令

如果 `icode` 是个非法指令的话，那么就会产生 `instr_valid` 信号

合法的话，`icode` 将会决定这个指令是否用到寄存器和具体的数字。如果用到寄存器的话，产生 `need_regids` 信号，传递到 `align` ，使其读取后面一个字节（如果不传给 `align` 的话，那么 `align` 产生的值 `rA` 和 `rB` 均为 `F`，即无寄存器）。只需要一个寄存器的指令在我们之前的设计中已经要求字节的低位编码为 `F` 了，所以直接读就可以

但是 `icode` 还会产生 `need_valc` 信号。但是这个信号不会决定 `align` 是否继续再向后读八个字节。我认为 `align` 会一直读后面八个字节的，因为多读没关系，PC 增加器才决定下一条地址从哪里读取

`need_valc` 和 `need_regids` 共同决定 PC 增加的值

总之，取值阶段完成之后我们可以得到 `icode`、`ifun`、`rA`、`rB`、`valC` 还有下一个 PC 值 `valP`

### 译码和写回阶段

![](http://pic.caiwen.work/i/2025/07/23/68809a975034e.png)

首先是根据 `icode` 和 `rA` 计算 `srcA` 以获得 `valA`。我们还要考虑 `icode` 的原因在于一些指令没有寄存器作为操作数，但是还是需要使用到寄存器的值，比如 `ret` 指令需要 `%rsp` 的值。`valB` 同理

在写回阶段，我们也是根据 `icode` 和 `rA` 决定写回的寄存器 `dstM`。另一个 `dstE` 同理。`valE` 和 `valM` 需要通过别的阶段来获得。但值得注意的是 `Cnd` 信号也会影响到 `dstE` 的选取，`Cnd` 是后续执行阶段，根据条件码和 `ifun` 计算出来的信号，在这里用来实现条件传送

译码阶段结束，我们就可以得到 `valA` 和 `valB` 了。同时我们也知道稍后在写回阶段要写入的目标 `dstM` 和 `dstE`

### 执行阶段

![](http://pic.caiwen.work/i/2025/07/23/68809df2c940c.png)

首先要根据 `icode` 判断 `aluA`

- 取 `valA` （`OPq`、`rrmovq`、`cmovXX`）
- 取 `valC`（`mrmovq` 和 `rmmovq` 计算地址，`irmovq`）
- 取 `-8`、`+8`（`call` 、 `ret` 、`popq` 、`pushq` 有栈操作）

根据 `icode` 判断 `aluB`

- 取 `valB`
- 取 `0`（`irmovq` 象征性的加上 `0` 以使得 `valE` 和 `valC` 相等，统一设计。或是 `rrmovq` 和 `cmovXX` 使得 `valE` 和译码得到的 `valA` 相等）

同时根据 `icode` 和 `ifun` 计算 `alu_fun`，表示要执行的操作

还会根据 `icode` 计算 `setCC` 表示是否要更新条件码。状态码将会根据 `setCC` 和计算得到的 `valE` 设置。新的条件码将在下一个时钟周期更新

然后我们还会计算 `cnd`，这个值综合 `ifun` 和条件码，决定是否进行条件传送和条件跳转。综合 `ifun` 的原因是我们会有 `rrmovq` 这样的无条件传送和 `jmp` 这样的直接跳转

经过这一阶段后，我们可以获得运算后的结果 `valE`

### 访存阶段

![](http://pic.caiwen.work/i/2025/07/23/6880a7646cc58.png)

首先可以根据 `icode` 来决定是读还是写内存

然后根据 `icode` 选择内存地址：

- 取 `valE`（`pushq` 和 `call` ，`valE` 为开栈后栈顶的地址。`rmmovq` 和 `mrmovq` 为计算得到的目标内存地址）
- 取 `valA`（`popq` 和 `ret` 用到的 `%rsp` 的值）

如果要写数据的话，选择写入的内容

- 取 `valA` （`pushq` 和 `rmmovq` 用到的寄存器）
- 取 `valP`（`call` 把下一条指令的地址压入）

经过这个阶段，如果我们是读内存的话，就得到了 `valM` 的值

此外，我们还将综合之前产生的异常信号 `imem_err` 、`instr_valid` 和 `dmem_err` 和 `icode` 设置处理器状态。综合 `icode` 是由于要实现 `hlt` 指令

### 更新 PC 阶段

![](http://pic.caiwen.work/i/2025/07/23/6880aca57fd53.png)

用 HCL 描述：

```
word new_pc = [
    # Call. Use instruction constant
    icode == ICALL : valC;
    # Taken branch. Use instruction constant
    icode == IJXX && Cnd: valC;
    # Completion of RET instruction. Use value from stack
    icode == IRET : valM;
    # Default: Use incremented PC
    1 : valP;
];
```

根据 `icode` 值选用不同的值更新 PC

- 对于 `call` 指令，直接取 `valC` 更新
- 对于 `IJXX` 指令，如果可以进行跳转的话，也取 `valC`
- 对于 `IRET` 指令，选取 `valM` 更新
- 对于其他情况，选取 `valP` 更新

## Pipeline

### 流水线效率

信号通过组合逻辑电路需要消耗一定的时间。我们假设上述 SEQ 的组合逻辑电路完成计算好耗时 300ps，同时寄存器的加载需要 20ps 的时间，那么总的延迟就是 320ps。我们定义吞吐量为每条指令发射间隔时间的倒数，即

$$
\text{吞吐量} = \frac{\text{1 条指令}}{(300+20)ps}\cdot \frac{1000ps}{1ns}\approx 3.12GIPS
$$

其中延时意味着一条指令从发射到完全指令的耗时，吞吐量为每秒可以处理掉多少的指令。

我们考虑一种优化，即我们把一个大的组合逻辑分成若干个小的组合逻辑，同时在中间加上寄存器。一个阶段执行完毕之后，就把计算出来的中间结果放入到寄存器中。在下一个时钟上升沿，上一阶段的结果作为下一段的输入数据，继续进行下一阶段的计算，而由于中间插入的寄存器可以把数据隔离开，上一阶段的电路可以继续处理下一条指令。这样就形成了一个类似流水线的东西，电路可以同时计算不同指令的不同部分，不存在电路是空闲的：

![](http://pic.caiwen.work/i/2025/07/27/68857ccf49dab.png)

延迟稍有提高，但是

$$
\text{吞吐量} = \frac{\text{1 条指令}}{(100+20)ps}\cdot \frac{1000ps}{1ns}\approx 8.33GIPS
$$

提高了不少

不过像这样改进流水线还需要一些注意点。

首先指令发射间隔时间需要取决于流水线中耗时最长的一部分，不能太短，不然会存在有的电路还没完成计算，就遇到下一个时钟上升沿，此时寄存器的数据就是错的。

也因为如此，我们希望流水线的划分应当使得各个部分的耗时尽可能一致。比如同样是分成三阶段，下面的这个划分延迟更高，吞吐量更低：

![](http://pic.caiwen.work/i/2025/07/27/68857e1013231.png)

其次，流水线也不建议划分过多阶段，使得流水线过深。尽管阶段越多吞吐量越高，但是吞吐量的增加随着划分阶段数的增加是一个先快后慢的关系，到后期会存在划分阶段很多，硬件成本很高，但是吞吐量提升不大的局面。

### 流水线概览

直接在原有的 SEQ 上简单给各个阶段之间插入寄存器的话会出很多问题。

其中一个问题是，根据流水线涉及，前一个指令取指阶段执行完毕进入译码阶段后，后一个指令立刻进入流水线进程取指。而取指阶段需要的 PC 需要等待上一条指令走到最后的更新 PC 阶段才可以得到。我们先不考虑原先的更新 PC 阶段，并把写回阶段拿出来作为流水线的最后阶段，于是我们流水线的阶段划分大致为：取值（F），译码（D），执行（E），访存（M），写回（W）五个阶段。在五个阶段之间插入寄存器，最终的结果大概如下：

![](http://pic.caiwen.work/i/2025/07/27/688585d725d4e.png)

其中 F 阶段开始前插入的寄存器称为 F 寄存器，D 阶段之前插入的寄存器为 D 寄存器，以此类推，插入的这些寄存器称为流水线寄存器。然后为了方便，我们用大写字母开头表示某个流水线寄存器的值，用小写字母开头表示某个阶段的运算结果。比如 M_stat 是流水线寄存器 M 上的某个值，而 m_stat 表示 M 阶段中经过 stat 运算单元得到的信号。

在新的流水线架构中，在 D 阶段，我们通过 `icode` 和 `rA` 、`rB` 得到 `dstE` 和 `dstM` 之后，并不是直接将该信号传给寄存器中，毕竟还没过 E 和 M 阶段拿到要写入的数据。我们在后面的阶段中也传递 `dstE` 和 `dstM`，其中 E 阶段直接计算出条件码之后，通过 D 阶段传递过来的 `dstE` 计算新的 `dstE`（是否进行分支传送）继续传到后续的 M 和 W 阶段。其中寄存器写入目标的信号来自于 W 阶段的 `dstE` 和 `dstM`。图中省略了相关线路。

另一个小改动是，我们在 D 阶段通过 Select 单元将 valP 和 valA 合并成 valA。这样合并的依据是，只有 `call` 指令和跳转指令会用到 valP，而这两个指令同时又不使用 valA。

### 冒险

#### 控制冒险

上面我们提到上一条指令刚过了 F 阶段进入 D 阶段后，下一条指令紧接着又需要取指了，所以上一条指令在 F 阶段也必须把下一条指令的 PC 算出来。对于一般的指令，我们都可以直接通过当前 PC 加上根据 `icode` 和 `ifun` 计算出来的当前指令长度，得到下一个 PC。但是有一些例外。`call` 和 `jmp` 指令，我们需要取 `valC` 为下一个 PC。

对于 `jXX` （条件跳转）指令，我们就有点棘手，因为是否跳转取决于状态码，而状态码需要在 E 阶段才能被计算。我们这里需要进行分支预测。这里用到的分支预测是 AT （Always Taken）策略，有研究表明这种策略预测成功概率为 60%。相反，NT（Never Taken）策略成功概率为 40%。书中还提到有更复杂的预测策略，有一个名为反向选择正向不选择（BTFNT）的策略，如果要跳转的地址比不跳转时下一条地址低的话就预测进行分支跳转，反之不跳转，这种策略的预测成功概率有 65%。

对于 `ret` 指令，由于指令随后跳转到的地址是根据 `%rsp` 的值在内存中进行获取，而前面的一些指令还没完成访存和写回阶段，无法直接获取，且根本不可能预测返回指令在哪里。因此，我们暂且先不处理这一点。不过我们考虑其实返回地址并非不可预测，因为 `call` 和 `ret` 指令应该是成对出现的，`ret` 指令大多时候都会跳转到其对应的 `call` 指令位置（除了我们上一章缓冲区溢出的情况）。因此，一些高性能处理器运用了这个性质，其在取值单元放入一个硬件栈，`call` 时将地址压入栈中，`ret` 时将地址从栈中取回，这样来进行预测。

#### 数据冒险

**程序寄存器**

我们来看这样的一个例子

![](http://pic.caiwen.work/i/2025/07/28/6886de97dcc6e.png)

在 `addq` 指令到达译码阶段时，前两条对于 `%rdx` 和对于 `%rax` 进行修改的指令还未完成写回阶段，所以译码阶段无法获得正确的值。这就是一个数据冒险。

一般有两种方法来解决数据冒险。

第一种是暂停技术，感性地理解就是，对于上述的情况，我们让 `addq` 指令暂停在译码阶段，直到所依赖的寄存器完成了写回。

第二种是转发技术。我们发现，对于 `irmovq` 、 `rrmovq` 、 `cmovXX` 和 `OPq` 指令，这些指令要把一个寄存器修改为的值，已经在执行阶段获得，后续的访存阶段什么也不干。那么，我们可以直接把 E 阶段已经计算但还没来的及写入的值，直接转发到 D 阶段。而对于 `mrmovq` 指令，我们需要在 M 阶段才能得到要修改为的值，所以还可以把 M 阶段已经从内存中读出来的数据转发到 D 阶段。

对于转发技术，我们考虑如下的几个值作为转发目标

- `e_valE` 和 `M_valE` ：这两个值看似是相同的，但其实是两个指令的 `valE`，都需要转发
- `W_valE` 和 `W_valM`：虽然到了写回阶段，但是新的值仍然需要到达下一个时钟上升沿才会存到寄存器中。那么当前这个时钟周期内位于 D 阶段的指令仍然需要数据转发
- `m_valM`

上述两种操作的具体细节在后文解释。

**内存**

对于内存不会发生数据冒险，因为读写内存都在一个阶段进行，前面一条指令一定是经过了 M 阶段写入数据后，后面一条指令才在 M 阶段读出数据。

不过还有种特殊情况，有可能前一条指令对内存进行修改，而修改的目标恰好是代码所在的内存，这种情况下，前一条指令还未到达 M 阶段应用修改，后一条指令就在 F 阶段完成取指，产生了数据冒险。对于这种情况，可能需要比较复杂的手段进行处理。但为了简便，我们假设这种情况不存在。

**条件码寄存器**

对于条件码寄存器也不会发生数据冒险。在新的架构下，E 阶段计算出条件码之后又立刻使用条件码计算新的 `dstE`，产生和使用都是在同一阶段中，因此不会有冒险。在 SEQ 中，更新 PC 寄存器也需要条件码，以实现条件跳转，但是在新的流水线架构下，我们预测分支，并不需要知道最新的条件码。（但是条件码依然对取指产生影响。我们可以后面根据条件码判断是否预测失败，如果预测失败采取一些手段撤销错误取出的指令， 这个后面会说）

#### 异常处理

关于状态寄存器的数据冒险，涉及到异常处理

异常处理有如下几个细节问题：

- 可能有多个指令都出现了异常
- 取出一个指令，该指令导致了异常，但是后来又由于分支预测错误，撤销了这个指令

对于上述两种情况，我们不让异常直接影响到处理器的当前状态，而是在每个阶段都存储当前指令所对应的状态信息，直到指令一直走到 W 阶段才将状态应用到当前处理器。这么做可以确保只考虑最先触发异常的指令，同时确保了如果指令被撤销，那么也不会产生影响

- 有可能一个指令触发了异常，但是由于还没走到 W 阶段，所以后面的指令也正常执行，但修改了程序员可见状态（后面的指令本不应该执行，更不应该发生修改）

对于这种情况，我们考虑，会修改程序员可见状态的阶段只有 E 阶段（修改条件码），M 阶段（写内存），W 阶段（写回寄存器）。如果前面有异常指令的话，那么后面的指令必然到不了 W 阶段。当后一条指令到达 E 或是 M 阶段时，前面那条发生异常的指令大概到了 M 和 W 阶段。所以我们需要判断，如果 M 和 W 阶段指令发生异常的话，应该禁止 E 和 M 阶段修改程序员可见状态

### 取指阶段

![](http://pic.caiwen.work/i/2025/07/28/68877ac07472c.png)

和 SEQ 不同，我们在取指阶段就根据指令本身的信息计算出下一个 PC 值，这其中也包括了根据 `icode` 判断是否是条件传送分支，然后进行预测。预测后的 PC 值放入 F 寄存器中来给下一个 F 阶段使用。

在 Select PC 单元，我们还需要其他阶段的信息，来处理先前已经发射的 `ret` 指令和条件跳转预测失败的情况。对应的 HCL 如下：

![](http://pic.caiwen.work/i/2025/07/28/68877bf24191d.png)

其中第一个表示，先前发射的条件跳转语句（如今已经执行到 M 阶段）预测错误，先前预测应该是执行条件跳转，但其实应该不执行。所以我们需要立刻把当前 PC 更新为当时指令对应的 `valP`，即 `M_valA`（因为 `valA` 和 `valP` 已经在 D 阶段被合并）来进行纠正。（不过我们还是发射了一些本应不该发射的指令，这些指令后面会说怎么取消）

第二个则表示，先前发射的 `ret` 语句如今已经完成 M 阶段，拿到了内存中的返回地址，执行到了 W 阶段。此时我们立刻将 PC 置为 `W_valM`

对于 `F_predPC`，其 HCL 如下：

![](http://pic.caiwen.work/i/2025/07/28/68877e275fb5a.png)

### 译码和写回阶段

![](http://pic.caiwen.work/i/2025/07/28/68877e89e6c26.png)

`Sel` 为合并 `valA` 和 `valP`，已经在前文讲过

`Fwd A` 和 `Fwd B` 两个单元负责选择是从寄存器中读数据还是选择转发过来的数据。转发数据时同时转发了数据对应的寄存器编号。转发的选择优先级比较重要：

![](http://pic.caiwen.work/i/2025/07/28/6887804d41886.png)

我们要选择比较早的阶段转发来的数据。因为比较早阶段执行的指令后发射。

对于写回阶段，我们之前已经说过大致流程。

### 执行阶段

![](http://pic.caiwen.work/i/2025/07/28/6887864232475.png)

和 SEQ 大致相同。数据转发和新的 `dstE` 计算已经在前文讲过。需要注意的是 `W_stat` 和 `m_stat` 是配合异常处理，来防止条件码写入

### 访存阶段

![](http://pic.caiwen.work/i/2025/07/28/688786e8ccbc9.png)

和 SEQ 的一个区别在于这里没有 Data 块。SEQ 中的 Data 块是用来选择 `valP` 和 `valA` 的。

其中的 `M_valE` 和 `M_dstE` 、 `m_valM` 和 `M_dstM` 是用来转发的，`M_valA` 是用来纠正分支预测错误的

这里没有像执行阶段那样，引一个其他状态的异常信号过来以禁止发生异常后对内存的写入。我们稍后会使用别的

### 流水线控制

我们着重考虑如下情况：

- 加载/使用冒险：对于数据冒险，一般数据转发就足够了。但是会有这样一种情况，前一条指令是 `mrmovq` ，后一条指令使用到了前面指令操作的寄存器，此时转发就不奏效了，因为后一条指令在 D 阶段，前一条指令才到 E 阶段，而到 M 阶段才知道应该给到什么值。我们将这种情形称为加载/使用冒险

- 处理 `ret`：对于 `ret` 指令，我们考虑当 `ret` 指令触发之后，流水线暂停，不再处理新的指令
- 分支预测错误：根据前面设计，当我们意识到分支预测错误时，已经发射了几条错误指令了，我们需要考虑如何取消前面的这些指令
- 异常处理：前面已经讲了异常处理大概的应对方法，这里再细化一下。当异常传播到访存阶段时，由于前一条指令已经开始执行 E 阶段，所以此时必须直接传一个信号过去禁止条件码改变。同时我们考虑往 M 阶段插一个气泡，这个气泡的意思表示，当下一条指令到 M 阶段后就变为 `nop` 指令向后传播，这也就达到了禁止写入内存的目的。当写回阶段有异常指令时，我们暂停整个流水线。

这四个情况的判定条件如下：

![](http://pic.caiwen.work/i/2025/07/29/6888245895208.png)

`ret` 指令到达 D 阶段时就应该立刻被发现。对于加载/使用冒险，如果发生，后面使用寄存器的指令到达 D 阶段时，前面那条 `mrmovq` 到达 E 阶段，此时应该让 D 阶段暂停一次。分支预测错误的条件看似和前面取指阶段的 HCL 不一样，但其实 `E_icode` 和 `M_icode` 相同，`e_Cnd` 和 `M_Cnd` 相同。对于异常情况，只需要判断 M 和 W 阶段发生的异常，我们这里主要是要考虑禁止发生异常后程序员可见状态被改变。

对于流水线寄存器，我们改进一下，使得其能再接受两个信号：

![](http://pic.caiwen.work/i/2025/07/29/68882767e3a32.png)

(上图有一点印刷错误)

如果给到一个暂停信号，那么下一个时钟上升沿之后，寄存器仍输出之前的数据而不输出新的数据。如果给到一个气泡信号，那么下一个时钟上升沿后，寄存器输出情况与 `nop` 指令相同。也就是说，暂停信号起到了重复状态的效果，气泡信号起到了撤销指令的结果。

上面四种情况，需要的暂停/气泡情况如下：

![](http://pic.caiwen.work/i/2025/07/29/68882b84be4c1.png)

对于异常，表中没写，应该是其他阶段正常，M 阶段插入气泡。气泡可以撤销当前指令，但整个流水线继续往前走。暂停+气泡可以使得流水线前面的部分待在原地一周期，前面的部分继续往前走，中间空出来的用气泡补充。

注意图中设置了气泡/暂停状态后，下一个时钟上升沿才会产生对应效果

其中处理 `ret` 对应的例子是：

![](http://pic.caiwen.work/i/2025/07/29/68882be7ccf36.png)

加载/使用冒险对应的例子：

![](http://pic.caiwen.work/i/2025/07/29/68882cf308ff8.png)

分支预测错误对应的例子：

![](http://pic.caiwen.work/i/2025/07/29/68882d2b87374.png)

然后我们考虑这些情况发生组合。对于异常，在异常处理部分已经讨论过一些细节。然后考虑剩下的情况组合。剩余情况需要满足的条件如图所示，一些条件是互斥的，不可能发生组合

![](http://pic.caiwen.work/i/2025/07/29/68882e4357891.png)

我们可以按照 暂停>气泡>正常 的优先级合并：

组合 A

![](http://pic.caiwen.work/i/2025/07/29/688832d73f5f8.png)

组合 B

![](http://pic.caiwen.work/i/2025/07/29/688832fccd0e4.png)

由于组合 B，在写流水线寄存器 D 的气泡和暂停情况的 HCL 代码的时候需要特判一下组合 B 的情况，或者调整优先级

然后我们把流水线控制模块加入流水线结构中：

![](http://pic.caiwen.work/i/2025/07/29/688837f865c1b.png)

### 性能分析

我们使用 CPI （完成一条指令平均需要多少周期）来衡量处理器性能。一般来说 CPI 为 1，但是由于我们上面出现的 加载/使用冒险、`ret` 指令，分支预测错误等因素，导致插入了一些气泡，这些气泡会使得 CPI 上升。一般来说，我们有：

$$
CPI=1.0+lp+mp+rp
$$

其中 $lp$ 为加载处罚（由于加载/使用冒险，插入气泡的平均数），$mp$ 为分支预测错误处罚（由于分支预测错误，插入气泡的平均数），$rp$ 为返回处罚（由于 `ret` 指令，插入气泡的平均数）

根据统计，我们有：

- 加载指令（`mrmovq` 和 `popq`）占所有执行指令的 25%，其中 20% 会导致加载/使用冒险
- 条件分支指令占所有指令指令的 20%，其中 60% 会选择分支，有 40% 的概率是预测错误的
- 返回指令占所有执行指令的 2%

![](http://pic.caiwen.work/i/2025/07/29/68887dcdcb394.png)

于是我们可以求得处罚总和为 0.27，于是 CPI 为 1.27。进一步的优化是尽可能增加预测的成功率。但传统的流水线处理器优化的尽头也就是完全没有气泡产生，CPI 到达 1。现代的处理器支持超标量，即同时并行执行多个指令，此时 CPI 有可能降到 1 以下，并将衡量处理器性能的标准从 1 转化为 CPI 的倒数，即 IPC ，每个周期执行的指令条数，越大越好。

## ArchLab

### 环境

### 配置

这个实验首先的难点就是环境配置，在配置环境中遇到这几个问题：

首先是出现了 `lineno` 的重复定义的问题，导致编译不过去（不知道 CMU 大神怎么会犯这种错误）。在 stackoverflow 上得知可以修改 misc 目录下的 Makefile 文件：

```makefile
CFLAGS=-Wall -O1 -g -fcommon
LCFLAGS=-O1 -fcommon
```

加上 `-fcommon` 参数

然后 readme 上说本次实验用到的工具有 tty 版本和 gui 版本，gui 版本会更好用一些，于是我考虑编译 gui 版本的工具。我们需要安装 tcl 和 tk 这两个工具，然后我发现 wsl 上已经自带了，于是编译，发现编译不过去，编译的报错信息大概是 tcl 或者 tk 的库缺少了函数。盲猜是版本问题，因为 lab 里用的 tcl/tk 版本是 8.5 的而 wsl 自带的是 8.6 的。apt 上没有 8.5 版本，所以我们可能需要自行编译安装

我选择了 cmu 这个课程开始之前的 tcl/tk 版本，5.8.17。源码的地址在 https://sourceforge.net/projects/tcl/files/Tcl/8.5.17/，我们下载 tcl8.5.17-src.tar.gz 和 tk8.5.17-src.tar.gz 这两个文件并解压

```bash
# tcl 的安装
cd tcl8.5.17/unix
./configure --prefix=/usr/local
make
sudo make install
# tk 的安装
# 同理编译安装 Tk
cd ../../tk8.5.17/unix
./configure --prefix=/usr/local --with-tcl=/usr/local/lib
make
sudo make install
```

然后修改 lab 的最外层目录的 makefile 文件

```makefile
TKLIBS=-L/usr/local/lib -ltk8.5 -ltcl8.5
TKINC=-isystem /usr/local/include
```

然后再编译，发现又报错了，这次说是 matherr 这个函数没有定义。询问 ai 得知最新的 glibc 已经把这个函数移除了，为了让我们能通过编译的话，我们只能是自己定义一个

```c
int matherr(struct __exception *e) {
    return 0;  // 始终返回 0，表示错误未处理
}
```

把这个函数加到 seq/ssim.c 和 pipe/psim.c 中，然后终于通过编译

### PartA

让用 y86-64 汇编写三个程序，非常简单，没什么可说的：

sum.ys:

```assembly
    .pos 0
    irmovq stack,%rsp
    irmovq ele1,%rdi
    call sum_list
    halt

# Sample linked list
    .align 8
ele1:
    .quad 0x00a
    .quad ele2
ele2:
    .quad 0x0b0
    .quad ele3
ele3:
    .quad 0xc00
    .quad 0

sum_list:
    xorq %rax,%rax
    jmp test

loop:
    mrmovq (%rdi),%r8
    addq %r8,%rax
    mrmovq 8(%rdi),%rdi
    jmp test

test:
    andq %rdi,%rdi
    jne loop
    ret

    .pos 0x200
stack:

```

rsum.ys:

```assembly
    .pos 0
    irmovq stack,%rsp
    irmovq ele1,%rdi
    call rsum_list
    halt

# Sample linked list
    .align 8
ele1:
    .quad 0x00a
    .quad ele2
ele2:
    .quad 0x0b0
    .quad ele3
ele3:
    .quad 0xc00
    .quad 0

rsum_list:
    andq %rdi,%rdi
    je s1
    pushq %rdi
    mrmovq 8(%rdi),%rdi
    call rsum_list
    popq %rdi
    mrmovq (%rdi),%r8
    addq %r8,%rax
    ret
s1:
    irmovq $0,%rax
    ret

    .pos 0x200
stack:

```

### PartB

这一部分需要我们在 SEQ 实现上添加 `iaddq` 指令。指令的具体定义见书上的练习题4.3。`iaddq` 和 `irmovq` 的大致实现比较类似，所以我们仿照 `irmovq` 各个阶段的实现。取指和译码阶段类似，执行阶段将 `valC` 和 `valB` 相加得到 `valE`，访存阶段没有操作，最后是一样的写回阶段。修改 `seq-full.hcl` 如下：

```
bool need_regids =
	icode in { IRRMOVQ, IOPQ, IPUSHQ, IPOPQ,
		     IIRMOVQ, IRMMOVQ, IMRMOVQ, IIADDQ };

bool need_valC =
	icode in { IIRMOVQ, IRMMOVQ, IMRMOVQ, IJXX, ICALL, IIADDQ };

word srcB = [
	icode in { IOPQ, IRMMOVQ, IMRMOVQ, IIADDQ  } : rB;
	icode in { IPUSHQ, IPOPQ, ICALL, IRET } : RRSP;
	1 : RNONE;  # Don't need register
];

word dstE = [
	icode in { IRRMOVQ } && Cnd : rB;
	icode in { IIRMOVQ, IOPQ, IIADDQ} : rB;
	icode in { IPUSHQ, IPOPQ, ICALL, IRET } : RRSP;
	1 : RNONE;  # Don't write any register
];

word aluA = [
	icode in { IRRMOVQ, IOPQ } : valA;
	icode in { IIRMOVQ, IRMMOVQ, IMRMOVQ, IIADDQ } : valC;
	icode in { ICALL, IPUSHQ } : -8;
	icode in { IRET, IPOPQ } : 8;
	# Other instructions don't need ALU
];

word aluB = [
	icode in { IRMMOVQ, IMRMOVQ, IOPQ, ICALL,
		      IPUSHQ, IRET, IPOPQ, IIADDQ } : valB;
	icode in { IRRMOVQ, IIRMOVQ } : 0;
	# Other instructions don't need ALU
];

bool set_cc = icode in { IOPQ, IIADDQ };
```

### PartC

这一部分需要我们优化处理器和一个复制数组的代码，使得 CPE 尽可能的小。在 pipe 目录下，执行 `make VERSION=full` 可以重新编译处理器和被评测的代码，然后 `../misc/yis sdriver.yo` 可以测试小样例，如果最后显示 `%rax` 为 `2` 则说明通过。`../misc/yis ldriver.yo` 可以测试大样例，如果最后显示 `%rax` 为 `0x1f` 则说明通过。然后我们通过 `./correctness.pl` 可以先测试被评测的代码 `ncopy.ys` 是否能正确执行。然后 `./benchmark.pl` 可以计算分数

我首先考虑从 `ncopy.ys` 入手，首先对于 `if (val > 0) count++;` 这一部分，原代码中这里使用的条件跳转实现的。我考虑使用条件转移，于是有：

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	andq %rdx,%rdx		# len <= 0?
	irmovq $1,%r8
	jle Done		# if so, goto Done:

Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rmmovq %r10, (%rsi)	# ...and store it to dst
	rrmovq %rax,%r11
	addq %r8,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	subq %r8, %rdx		# len--
	irmovq $8, %r10
	addq %r10, %rdi		# src++
	addq %r10, %rsi		# dst++
	andq %rdx,%rdx		# len > 0?
	jg Loop			# if so, goto Loop:
```

不过这个小优化似乎用处不大，跑一下发现 CPE 只是从 15.18 优化到 14.33

刚才的思路其实算有点偏门的。更直接的，我们应该尽可能减少 Loop 内的指令数量。

然后发现 `irmovq $8, %r10` 可以被优化掉：

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	andq %rdx,%rdx		# len <= 0?
	irmovq $1,%r8
	irmovq $8,%r9
	jle Done		# if so, goto Done:

Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rmmovq %r10, (%rsi)	# ...and store it to dst
	rrmovq %rax,%r11
	addq %r8,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	subq %r8, %rdx		# len--
	addq %r9, %rdi		# src++
	addq %r9, %rsi		# dst++
	andq %rdx,%rdx		# len > 0?
	jg Loop			# if so, goto Loop:
```

测了一下从 14.33 优化到 13.41

又发现如果把 `subq %r8, %rdx` 后移，那么 `andq %rdx,%rdx` 就没有必要：

```assembly
Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rmmovq %r10, (%rsi)	# ...and store it to dst
	rrmovq %rax,%r11
	addq %r8,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	addq %r9, %rdi		# src++
	addq %r9, %rsi		# dst++
	subq %r8, %rdx		# len--
	jg Loop			# if so, goto Loop:
```

从 13.41 优化到 12.41

然后我有考虑实现 `iaddq` 指令，具体实现方法和 PartB 类似，然后使用 `iaddq` 指令来减少代码指令数：

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	andq %rdx,%rdx		# len <= 0?
	jle Done		# if so, goto Done:

Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rmmovq %r10, (%rsi)	# ...and store it to dst
	rrmovq %rax,%r11
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	iaddq $8, %rdi		# src++
	iaddq $8, %rsi		# dst++
	iaddq $-1, %rdx		# len--
	jg Loop			# if so, goto Loop:
```

这样只能从 12.41 优化到 12.26

然后我发现 `jle Done` 这个基本上开始时是预测失败的，所以改为：

```assembly
# You can modify this portion
	# Loop header
	xorq %rax,%rax		# count = 0;
	andq %rdx,%rdx
	jg Loop
	ret

Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rmmovq %r10, (%rsi)	# ...and store it to dst
	rrmovq %rax,%r11
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	iaddq $8, %rdi		# src++
	iaddq $8, %rsi		# dst++
	iaddq $-1, %rdx		# len--
	jg Loop			# if so, goto Loop:
```

但也只是从 12.26 优化到 12.11

后面我又考虑一个优化，这是我看书的时候发现的一点。书中的取指阶段的 HCL 是这样的：

```
word f_pc = [
	# Mispredicted branch.  Fetch at incremented PC
	M_icode == IJXX && !M_Cnd : M_valA;
	# Completion of RET instruction
	W_icode == IRET : W_valM;
	# Default: Use predicted value of PC
	1 : F_predPC;
];
```

其中分支预测错误，需要等到分支跳转指令到达 M 阶段才能被发现。而我们考虑其实 E 阶段就可以计算出条件码，判断出分支预测失败了。于是我修改成：

```
word f_pc = [
	# Mispredicted branch.  Fetch at incremented PC
	E_icode == IJXX && !e_Cnd : E_valA;
	# Completion of RET instruction
	W_icode == IRET : W_valM;
	# Default: Use predicted value of PC
	1 : F_predPC;
];
```

这样一来可以提前发现分支预测错误，那么就会少发射一个错误指令。此时 D 阶段的气泡就不需要了，给相应的逻辑注释掉：

```
bool D_bubble =
	# Mispredicted branch
	# (E_icode == IJXX && !e_Cnd) ||
	# Stalling at fetch while ret passes through pipeline
	# but not condition for a load/use hazard
	!(E_icode in { IMRMOVQ, IPOPQ } && E_dstM in { d_srcA, d_srcB }) &&
	  IRET in { D_icode, E_icode, M_icode };
```

结果发现模拟器并没有按照预期的去执行。我怀疑这是这个优化是非预期的，且这个实验的实现并没有完全模拟数字电路。

到这里就进入瓶颈了，不知道该从哪里下手，能做的似乎都做完了。于是我让 AI 给我一个最小的提示，实验从而继续进行。

AI 提示我要尽可能利用数据转发。于是我考虑到原来代码中从一段内存复制到另一段内存的时候， `mrmovq` 和 `rmmovq` 之间的间隔太小，使得出现了加载/使用冒险，导致处理器暂停了一下。我们在两者之间插入一条指令。

```
Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	iaddq $8, %rdi		# src++
	iaddq $8, %rsi		# dst++
	iaddq $-1, %rdx		# len--
	jg Loop			# if so, goto Loop:
```

CPE 从 12.11 优化到 11.11

随后好像 AI 也给不出什么提示了。思考了很久，目前这个情形下，单纯地考虑减小指令数量基本做不到

不过后来突然发现指导书上说，第五章的循环展开可能对本次实验很有帮助，于是我尝试了一下，先进行三次的循环展开：

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	rrmovq %rdx,%r12
	iaddq $-3,%r12
	jg Loop3
	andq %rdx,%rdx
	jg Loop
	ret

Loop3:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $24, %rdi		# src++
	iaddq $24, %rsi		# dst++
	iaddq $-3, %rdx		# len--
	iaddq $-3, %r12
	jg Loop3			# if so, goto Loop
	andq %rdx,%rdx
	jg Loop

Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	iaddq $8, %rdi		# src++
	iaddq $8, %rsi		# dst++
	iaddq $-1, %rdx		# len--
	jg Loop			# if so, goto Loop:
```

其中 Loop3 是三个三个地进行。Loop 是一个一个地进行

CPE 从 11.11 降到了 9.46，效果非常显著，并获得了 20.7 分

我们如法炮制，进行 5 次循环展开，CPE 到达了 9.05。进行 6 次循环展开，CPE 到达了 8.99。进行 7 次循环展开，CPE 到达了 8.97。似乎已经到头了

然后我们发现，如果元素个数小于 7 的话，那么就会跑 Loop 部分。于是我考虑，用一个类似跳表的数据结构，根据最后的这个元素个数，把循环拆掉。但是 `jmp` 指令只能跳到常数地址处，跳表结构不好使。

于是我又考虑分段，走个 7 次的循环展开，个数小于 7 了再走个 3 次的循环展开：

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	rrmovq %rdx,%r12
	iaddq $-7,%r12
	jge Loop7
	andq %rdx,%rdx
	jg Loop
	ret

Loop3:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $24, %rdi		# src++
	iaddq $24, %rsi		# dst++
	iaddq $-3, %rdx		# len--
	iaddq $-3, %r12
	jg Loop3			# if so, goto Loop
	andq %rdx,%rdx
	jg Loop
	ret

Loop7:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 24(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 24(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 32(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 40(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 40(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 48(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 48(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $56, %rdi		# src++
	iaddq $56, %rsi		# dst++
	iaddq $-7, %rdx		# len--
	iaddq $-7, %r12
	jg Loop7			# if so, goto Loop
	rrmovq %rdx,%r12
	iaddq $-3,%r12
	jge Loop3
	andq %rdx,%rdx
	jg Loop
	ret

Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	iaddq $8, %rdi		# src++
	iaddq $8, %rsi		# dst++
	iaddq $-1, %rdx		# len--
	jg Loop			# if so, goto Loop:
```

不过这么搞的话，CPE 只是从 8.99 到了 8.91。

调成了10次循环展开+3次循环展开，只进步到了 8.89

调成 12 次 + 3 次循环展开，反而退步了

然后我又调成了 12 次 + 6次，依然是没 8.89 高的。然后考虑 6 次那个循环必然只会有一次，删掉了多余的跳转之后 CPE 只来到了 8.88

又加了一层，变成 10 + 6 + 3，CPE 来到了 8.85

随后我又参考了这篇文章的做法[^1] ，得到了一个优化方法：上面的 `r12` 寄存器是没必要的，我们可以直接在 `%rdx` 上减去 10，后面再加上 10。这样的维护方法应该是比多维护一个 `r12` 寄存器指令数要少的。

上面 10+6+3 的循环展开的话，会使得代码编译出来的产物过大（本次实验有这个限制），因此我调整为 10+3 的循环展开：

```
	# Loop header
	xorq %rax,%rax		# count = 0;
	iaddq $-10,%rdx
	jge Loop10
	iaddq $7,%rdx
	jge Loop3
	iaddq $3,%rdx
	jg Loop
	ret

Loop:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax
	iaddq $8, %rdi		# src++
	iaddq $8, %rsi		# dst++
	iaddq $-1, %rdx		# len--
	jg Loop			# if so, goto Loop:
	ret

Loop3:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $24, %rdi		# src++
	iaddq $24, %rsi		# dst++
	iaddq $-3, %rdx		# len--
	jg Loop3			# if so, goto Loop
	iaddq $3, %rdx
	jg Loop
	ret

Loop10:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 24(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 24(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 32(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 40(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 40(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 48(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 48(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 56(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 56(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 64(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 64(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 72(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 72(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $80, %rdi		# src++
	iaddq $80, %rsi		# dst++
	iaddq $-10, %rdx		# len--
	jge Loop10			# if so, goto Loop
	iaddq $7,%rdx
	jge Loop3
	iaddq $3,%rdx
	jg Loop
	ret
```

我们的 CPE 从 8.85 进步到了 8.62

后续仍然毫无头绪了。于是我参考了这篇文章[^2] 。这篇文章指出，当前主要的瓶颈就是，循环展开后，剩余的散的元素的处理比较耗时。其实我们上面进行了两三次的循环展开都是为了处理这个情况。

对于 $k$ 阶循环展开，我们最后剩余的元素数量一定是 $0\sim k-1$ 的。一个想法就是，我想把更新 `dst` 、 `src`、`%rdx` 的指令去掉，做法就是根据剩余元素的数量，把循环拆开，之前我们已经考虑过，但当时考虑的是跳表，无法实现。这篇文章作者提出其实可以使用 `push` + `ret` 的手段来实现跳转到动态的地址处。不过这种方法的话可能反而增加了 CPE。

于是这篇文章的作者提出，可以使用三叉搜索树来解决。不用二叉搜索树的原因是导致指令数增加。三叉搜索树每个父节点有三个子节点，分别对应于小于父节点，等于父节点，大于父节点。

现在考虑 9 阶循环展开（10 阶循环展开的话代码长度会超出限制），那么我们相当于是将一个数字在 $0\sim 8$ 这些数字里面搜索。建立如下的三叉搜索树：

![](http://pic.caiwen.work/i/2025/07/30/688a138b5808b.png)

每个节点的高度意味着需要几次询问，或者说是几次跳转才能到达。由于分支预测错误的惩罚不小，所以我们肯定是希望询问次数尽可能小。考虑测试的时候，给出的数组的长度是从 0 开始连续往上增的，因此我们把数字小的高度调低点，这样应该是尽可能优的。

于是就有了如下的代码。注意我们用到了点优化代码长度的小技巧，比如跳到 6？的时候，说明当前数字最小也是 4，所以我们可以直接进行四次操作，而不必把非要搜到叶子节点才进行这四个操作。

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	iaddq $-9,%rdx
	jge Loop9
	iaddq $6,%rdx

Root:
	jl Q1
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	andq %rdx,%rdx
	jg Q2

	ret

Q1:
	iaddq $2,%rdx
	jl Done
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	andq %rdx,%rdx
	je Done

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	ret

Q2:
	mrmovq 24(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 24(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $-3,%rdx
	jl Q3

	mrmovq 32(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 40(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 40(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	andq %rdx,%rdx
	jg Q4
	ret

Q3:
	iaddq $2,%rdx
	je Done

	mrmovq 32(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	ret

Q4:
	mrmovq 48(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 48(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $-1,%rdx
	je Done

	mrmovq 56(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 56(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	ret

Loop9:
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 24(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 24(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 32(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 40(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 40(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 48(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 48(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 56(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 56(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	mrmovq 64(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 64(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $72, %rdi		# src++
	iaddq $72, %rsi		# dst++
	iaddq $-9, %rdx		# len--
	jge Loop9			# if so, goto Loop
	iaddq $6,%rdx
	jmp Root
```

CPE 从 8.62 进步到了 8.22，虽然也是不小的进步，但是相比上面文章作者将近 7.5 的 CPE 还是差了很多。我观察到上面参考的两篇文章都直接使用条件跳转而没有使用条件传送。按理说使用条件传送应该更优。不过我又考虑，使用条件传送的话，消耗的指令就都是一样的。但是使用条件分支，如果预测成功的话，那么就能减少指令数量，预测失败的话会带来惩罚，但其实也就两个指令的惩罚，均摊下来可能还是比条件传送好一点。所以我又把代码改用条件分支。不过改的时候有一个注意点，你还是需要避免 加载/使用 冒险。我这里打算让两个位置的数组拷贝交叉进行，但是如果数量是单数，还是会出现一个 加载/使用冒险，但是加载/使用冒险不去除的话，条件传送改成条件跳转收益就不大了，所以仍保留条件传送：

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	iaddq $-9,%rdx
	jge Loop9
	iaddq $6,%rdx

Root:
	jl Q1
	mrmovq (%rdi), %r10	# read val from src...
	mrmovq 8(%rdi), %r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	rmmovq %r11, 8(%rsi)
	andq %r10,%r10
	jle Next01
	iaddq $1,%rax
Next01:
	andq %r11, %r11
	jle Next02
	iaddq $1,%rax
Next02:

	mrmovq 16(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	andq %rdx,%rdx
	jg Q2

	ret

Q1:
	iaddq $2,%rdx
	jl Done
	mrmovq (%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, (%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	andq %rdx,%rdx
	je Done

	mrmovq 8(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 8(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	ret

Q2:
	mrmovq 24(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 24(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $-3,%rdx
	jl Q3

	mrmovq 32(%rdi), %r10	# read val from src...
	mrmovq 40(%rdi), %r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	rmmovq %r11, 40(%rsi)
	andq %r10, %r10		# val <= 0?
	jle Next21
	iaddq $1,%rax
Next21:
	andq %r11, %r11		# val <= 0?
	jle Next22
	iaddq $1,%rax
Next22:

	andq %rdx,%rdx
	jg Q4
	ret

Q3:
	iaddq $2,%rdx
	je Done

	mrmovq 32(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	ret

Q4:
	mrmovq 48(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 48(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $-1,%rdx
	je Done

	mrmovq 56(%rdi), %r10	# read val from src...
	rrmovq %rax,%r11
	rmmovq %r10, 56(%rsi)	# ...and store it to dst
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	ret

Loop9:
	mrmovq (%rdi), %r10
	mrmovq 8(%rdi), %r11
	rmmovq %r10, (%rsi)
	rmmovq %r11, 8(%rsi)
	andq %r10, %r10
	jle Next91
	iaddq $1,%rax
Next91:
	andq %r11, %r11
	jle Next92
	iaddq $1,%rax
Next92:

	mrmovq 16(%rdi), %r10	# read val from src...
	mrmovq 24(%rdi), %r11
	rmmovq %r10, 16(%rsi)	# ...and store it to dst
	rmmovq %r11, 24(%rsi)
	andq %r10, %r10
	jle Next93
	iaddq $1,%rax
Next93:
	andq %r11, %r11
	jle Next94
	iaddq $1,%rax

Next94:
	mrmovq 32(%rdi), %r10	# read val from src...
	mrmovq 40(%rdi), %r11
	rmmovq %r10, 32(%rsi)	# ...and store it to dst
	rmmovq %r11, 40(%rsi)
	andq %r10, %r10		# val <= 0?
	jle Next95
	iaddq $1,%rax
Next95:
	addq %r11,%r11
	jle Next96
	iaddq $1,%rax
Next96:

	mrmovq 48(%rdi), %r10	# read val from src...
	mrmovq 56(%rdi), %r11
	rmmovq %r10, 48(%rsi)	# ...and store it to dst
	rmmovq %r11, 56(%rsi)
	andq %r10, %r10		# val <= 0?
	jle Next97
	iaddq $1,%rax
Next97:
	andq %r11, %r11		# val <= 0?
	jle Next98
	iaddq $1,%rax
Next98:

	mrmovq 64(%rdi), %r10
	rrmovq %rax,%r11
	rmmovq %r10, 64(%rsi)
	iaddq $1,%r11
	andq %r10, %r10		# val <= 0?
	cmovg %r11,%rax

	iaddq $72, %rdi		# src++
	iaddq $72, %rsi		# dst++
	iaddq $-9, %rdx		# len--
	jge Loop9			# if so, goto Loop
	iaddq $6,%rdx
	jmp Root
```

CPE 从 8.22 优化到 7.83。距离满分还差一步

我们观察到上述代码中，剩余的条件传送还是比较多。后来发现上面文章中评论区网友的提示说，可以根据书上的练习题 4.57 进行优化。

书上的 练习题4.57 指出了这样的一个优化方法，对于 加载/使用冒险，如果后一条指令需要的寄存器的数据仅仅是为了再写入内存，例如 `rmmovq` 和 `pushq` ，那么我们可以有一个加载转发技术。

![](http://pic.caiwen.work/i/2025/07/31/688ae7416ceda.png)

前一个指令在访存阶段取出数据后，后一个指令可以直接将其转发到 `M_valA` 上以替代原来的 `valA`

注意的是，并非所有的加载/使用冒险都可以使用加载转发技术优化。如果一条指令获取寄存器的数据是为了将其进行运算，那么就不能使用。所以我们发现只有 `rmmovq` 和 `pushq` 两个指令是可以的。

然后我们仍然注意，`rmmovq` 的 `rB` 是用来计算内存地址的，`pushq` 虽然没有 `rB`，但是在译码阶段计算出的 `srcB` 是 `%rsp`，也是要参与执行阶段的运算。所以我们只能将加载转发作用在这两个的 `rA` 上。

所以我们得到了加载转发的条件：`E_icode in { IPUSHQ, IRMMOVQ } && E_srcA == M_dstM && E_srcB != M_dstM`

修改 HCL：

```
word e_valA = [
	# 判定是否可以进行加载转发
	E_icode in { IPUSHQ, IRMMOVQ } && E_srcA == M_dstM && E_srcB != M_dstM: m_valM;
	1 : E_valA;  # Use valA from stage pipe register
];

bool F_stall =
	# Conditions for a load/use hazard
	E_icode in { IMRMOVQ, IPOPQ } &&
	 E_dstM in { d_srcA, d_srcB } &&
	 !(D_icode in { IPUSHQ, IRMMOVQ } && d_srcA == E_dstM && d_srcB != E_dstM) ||
	# Stalling at fetch while ret passes through pipeline
	IRET in { D_icode, E_icode, M_icode };

# Should I stall or inject a bubble into Pipeline Register D?
# At most one of these can be true.
bool D_stall =
	# Conditions for a load/use hazard
	E_icode in { IMRMOVQ, IPOPQ } &&
	 E_dstM in { d_srcA, d_srcB } &&
	 !(D_icode in { IPUSHQ, IRMMOVQ } && d_srcA == E_dstM && d_srcB != E_dstM);

# Should I stall or inject a bubble into Pipeline Register E?
# At most one of these can be true.
bool E_stall = 0;
bool E_bubble =
	# Mispredicted branch
	(E_icode == IJXX && !e_Cnd) ||
	# Conditions for a load/use hazard
	E_icode in { IMRMOVQ, IPOPQ } &&
	 E_dstM in { d_srcA, d_srcB } &&
	 !(D_icode in { IPUSHQ, IRMMOVQ } && d_srcA == E_dstM && d_srcB != E_dstM);
```

然后我们就能把代码中所有的条件传送删掉了

不过随后又发现代码大小又超出限制了。于是又在这里卡了一会...后面我参考这篇文章[^3]，发现其用到了一个代码优化技巧。我们可以把最后处理余数的部分的代码串起来，在三叉搜索树搜索到的时候直接跳到对应位置

```assembly
	# Loop header
	xorq %rax,%rax		# count = 0;
	iaddq $-9,%rdx
	jge P9

Root:
	iaddq $6,%rdx
	jl Q1
	jg Q2
	jmp R3
Q1:
	iaddq $2,%rdx
	je R1
	jg R2
	ret
Q2:
	iaddq $-3,%rdx
	jl Q3
	jg Q4
	jmp R6
Q3:
	iaddq $2,%rdx
	je R4
	jmp R5
Q4:
	iaddq $-1,%rdx
	je R7
	jmp R8

P9:
	mrmovq 64(%rdi), %r10
	rmmovq %r10, 64(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P8
	iaddq $1,%rax
P8:
	mrmovq 56(%rdi), %r10
	rmmovq %r10, 56(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P7
	iaddq $1,%rax
P7:
	mrmovq 48(%rdi), %r10
	rmmovq %r10, 48(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P6
	iaddq $1,%rax
P6:
	mrmovq 40(%rdi), %r10
	rmmovq %r10, 40(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P5
	iaddq $1,%rax
P5:
	mrmovq 32(%rdi), %r10
	rmmovq %r10, 32(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P4
	iaddq $1,%rax
P4:
	mrmovq 24(%rdi), %r10
	rmmovq %r10, 24(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P3
	iaddq $1,%rax
P3:
	mrmovq 16(%rdi), %r10
	rmmovq %r10, 16(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P2
	iaddq $1,%rax
P2:
	mrmovq 8(%rdi), %r10
	rmmovq %r10, 8(%rsi)
	andq %r10, %r10		# val <= 0?
	jle P1
	iaddq $1,%rax
P1:
	mrmovq (%rdi), %r10
	rmmovq %r10, (%rsi)
	andq %r10, %r10		# val <= 0?
	jle P0
	iaddq $1,%rax
P0:
	iaddq $72, %rdi		# src++
	iaddq $72, %rsi		# dst++
	iaddq $-9, %rdx		# len--
	jge P9			# if so, goto Loop
	jmp Root

#----------------------------------------------

R9:
	mrmovq 64(%rdi), %r10
	rmmovq %r10, 64(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R8
	iaddq $1,%rax
R8:
	mrmovq 56(%rdi), %r10
	rmmovq %r10, 56(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R7
	iaddq $1,%rax
R7:
	mrmovq 48(%rdi), %r10
	rmmovq %r10, 48(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R6
	iaddq $1,%rax
R6:
	mrmovq 40(%rdi), %r10
	rmmovq %r10, 40(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R5
	iaddq $1,%rax
R5:
	mrmovq 32(%rdi), %r10
	rmmovq %r10, 32(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R4
	iaddq $1,%rax
R4:
	mrmovq 24(%rdi), %r10
	rmmovq %r10, 24(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R3
	iaddq $1,%rax
R3:
	mrmovq 16(%rdi), %r10
	rmmovq %r10, 16(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R2
	iaddq $1,%rax
R2:
	mrmovq 8(%rdi), %r10
	rmmovq %r10, 8(%rsi)
	andq %r10, %r10		# val <= 0?
	jle R1
	iaddq $1,%rax
R1:
	mrmovq (%rdi), %r10
	rmmovq %r10, (%rsi)
	andq %r10, %r10		# val <= 0?
	jle Done
	iaddq $1,%rax
```

注意我们没有选择去复用前面循环展开的代码，因为这么做的话会使得每次处理完余数之后都要再跑一遍 `P0` 那个位置的代码。这样的话反而会让 CPE 升到 8 以上。

这么做之后 CPE 从 7.83 优化到了 7.54，距离满分仍然还有一段距离。

后面我又在网上搜索了很多讲解本实验的文章，还可用的手段基本是：在 HCL 中添加对于 `ret` 指令和对分支预测失败时的优化（后者我们上面就提到过。不过由于本章模拟器有点问题，这么做不可行，除非修改模拟器的代码，但实验其实不允许这么做），使用十阶循环展开（目前我的代码光是添加十阶循环展开的代码就已经超出限制了，而且我并没有发现当前代码还有哪里可以继续优化。我怀疑这种做法是假的）。

后来我发现很多人把开头的 `xorq %rax,%rax` 删除了。一开始我认为这种优化是不行的，因为这样做的话 ncopy 这个函数其实就是错的，而且我感觉这个小优化应该作用不大。但我试了一下，没想到 CPE 直接从 7.54 优化到 7.47，获得满分。虽然我个人不太认可这样做，但也没什么别的好办法了，本次实验就告一段落....

[^1]: [csapp-Archlab | Little csd's blog](https://littlecsd.net/2019/01/18/csapp-Archlab/)

[^2]: [csapp archlab Part C - 知乎](https://zhuanlan.zhihu.com/p/33751460)

[^3]: [csapp archlab 60分解答 - 知乎](https://zhuanlan.zhihu.com/p/77072339)
