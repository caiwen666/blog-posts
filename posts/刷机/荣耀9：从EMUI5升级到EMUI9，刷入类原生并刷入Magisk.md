@meta

```json
{
	"id": "huawei_honor_9",
	"createTime": "2022-08-23 11:03",
	"summary": "将华为荣耀9手机从EMUI5升级到EMUI9，刷入类原生并刷入Magisk",
	"key": ["华为", "荣耀9", "emui", "刷机", "root", "magisk", "类原生"],
	"background": "https://www.caiwen.work/wp-content/uploads/2022/08/QQ截图20220823103605.png",
	"recommend": true,
	"tags": [{ "value": "精选", "color": "success" }]
}
```

华为手机解锁bl锁似乎一直都只能依赖淘宝付费解锁。我在前天发现了一种不需要花任何钱就可以解bl锁的方法，为此我突然想玩一下刷机。但中间遇到了一些问题，写个文章记录一下。

::: info 注意

我所使用的是华为荣耀9，型号为STF-AL10。其他型号的手机也可以参考本文的思路

:::

一般来说荣耀9都会有emui8或者emui9，甚至鸿蒙系统的系统推送。但是需要申请，而花粉俱乐部现在已经死了。我的手机一直没有收到推送，还处于emui5版本。

## 解锁bootloader

对于处理器为麒麟960及以下的华为手机，我们可以使用一个叫PotatoNV的工具，强行向手机中注入一个解锁码，这样我们就可以用注入的解锁码来解锁bootloader

首先安装驱动，https://syxz.lanzoui.com/iS6s0nq4ofc

然后进入PotatoNV的项目地址，https://github.com/mashed-potatoes/PotatoNV

其中可以看到支持的CPU和肯定不支持的CPU，荣耀9的CPU是麒麟960，刚好支持

![支持的](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220823082322.png)

![肯定不支持的](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220823082332.png)

在右侧Releases中下载

然后，我们需要将手机短接。需要将手机后盖拆开，并找一个能导电的东西来短接。建议选择镊子，但我这里没有镊子，就找了个铜丝

你需要有一张TP短接图来告诉你短接哪个位点。对于荣耀9，我这里找到了一个

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220823083338.png)

上图的意思是，你需要将导体（我这里是铜丝）的一端接触图上画红圈的点，然后另一端往旁边金属壳随便一接触即可。

注意，你需要在手机关机状态下，数据线不可以连接电脑，然后短接，不能只短接一下，你需要一直让导体接触这两个地方，然后再连接数据线。你可以提前打开设备管理器观察。当连接数据线时，如果设备管理器出现下面这个东西，说明短接成功。

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220821133550.png)

接着你就可以打开PotatoNV，选择好Target device和处理器，点击Start就会进行解锁码注入

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E5%9B%BE%E7%89%8720220823084121.png)

保存好你的解锁码，以后可能还会用

接着就可以解锁bl了。下载工具箱：https://pan.baidu.com/s/1u4rHv2r6vjWCuiulgaqTiA，提取码：myty

启动手机，将手机连接到电脑，确保usb调试打开，然后打开工具箱，点击解除bootloader，输入解锁码并确定。如果一切顺利的话手机会重启进入fastboot模式，询问你是否要解锁bl，选择YES即可

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220821205732.png)

如果没有重启，你可以自行进入fastboot模式。

::: success 一个比较优雅的进入fastboot的方法
在关机状态下，不连接数据线，按住音量-键，不按电源键，然后再把数据线插进去，就可以100%进入fastboot模式
:::

.

::: warn 注意

开启bl锁之后，手机每次开机都会出现警告，但无伤大雅。当你解锁bl后，手机会自动进行恢复出厂设置，注意数据的备份
:::

## 升级到EMUI8

如果想要刷入类原生系统，则必须需要手机支持ProjectTreble。而这个东西是安卓8才有的.为此我们需要先升级到emui8

### 刷入TWRP

对于emui5，网上可用的twrp比较少（大多数都是emui8的twrp，不能用到emui5上），这里我用的是KVIP的twrp，链接：https://pan.baidu.com/s/1hsABt20

下载完成后，点击其中的Run.bat按照提示进行刷入即可。

::: info 注意
我在xda论坛看到，这个twrp的作者由于没有对应的设备，所以没有进行测试。实际上，这个twrp并不支持中文，而且也不能挂载手机的分区。但我们后面会想办法解决
:::

.

::: warn 注意

刷入之后手机的触摸按键和手电筒将不可用。不过你可以选择使用悬浮按钮来代替触摸按键。相关问题的修复方法可以参考：

https://forum.xda-developers.com/t/oreo-twrp-3-2-1-0-0-3-capacitive-fix.3754483/

:::

### 刷入EMUI8

我们需要准备emui8的强刷包，链接：https://pan.baidu.com/s/1Ia8Q0MSgBArdZjieQbWgEQ

> 荣耀9 EMUI8.0 B350官方固件包
>
> 公共文件一：下载 update.zip 不用改名
> http://update.hicloud.com:8180/TDS/data/files/p3/s15/G2310/g1699/v150213/f1/full/update.zip
>
> 公共文件二：下载 update_data_full_public.zip 并改名为：update_data_public.zip
> http://update.hicloud.com:8180/TDS/data/files/p3/s15/G2310/g1699/v150213/f1/full/public/update_data_full_public.zip
>
> 公共文件三：根据自己的手机型号下载对应文件，并改名为：update_all_hw.zip（手机型号可以在：”设置-关于手机里面“看到，或者手机背后可以看到）
>
> 型号：STF-AL10 下载此文件并改名为：update_all_hw.zip
> http://update.hicloud.com:8180/TDS/data/files/p3/s15/G2310/g1699/v150213/f1/full/STF-AL10_all_cn/update_full_STF-AL10_all_cn.zip
>
> 型号：STF-AL00 下载此文件并改名为：update_all_hw.zip
> http://update.hicloud.com:8180/TDS/data/files/p3/s15/G2310/g1699/v150213/f1/full/STF-AL00_all_cn/update_full_STF-AL00_all_cn.zip
>
> 型号：STF-TL10 下载此文件并改名为：update_all_hw.zip
> http://update.hicloud.com:8180/TDS/data/files/p3/s15/G2310/g1699/v150213/f1/full/STF-TL10_cmcc_cn/update_full_STF-TL10_cmcc_cn.zip

如果你直接点进这个链接进行下载的话，会弹出下面这个界面

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220823091646.png)

你需要使用迅雷。将你要下载的文件先离线下载到迅雷云盘上，再从迅雷云盘上下载（迅雷云盘好像不限速，好评

再下载HuRUpdater，https://pan.baidu.com/s/1KqLBhbhtIzwMSyeKMjpESA?fid=653326701347000

这些都下载完后，按照上面所说的修改文件名，并把这四个文件放到一个文件夹中，并复制到u盘（或者sd卡都可以）

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220823092112.png)

然后将u盘通过otg线连接到手机。进入twrp，点击”Mount“，将其中的”USB OTG“打上对勾。然后返回，点击”Install“，选择u盘中的HuRUpdater_0.3.zip进行刷机。脚本执行完毕之后，就可以进入手机了。

你会发现系统成功升级为emui8，并且数据甚至都没有丢失

### 使用更好的TWRP

刷入emui8之后，之前刷入的twrp就会被新的官方recovery覆盖。如果你还需要使用twrp的话，你可以再刷一个更好用的twrp

你可以到这里：https://cloud.189.cn/web/share?code=7r6BfmBvEFvi 下载由wzsx150大神适配的twrp。下载后依然可以直接使用压缩包内自带的bat脚本进行刷入。这里不多解释

值得注意的是，如果你是emui5的话，你是不能直接刷入这个twrp的。这就是为什么我们要先刷一个差点的twrp然后升级到emui8

### 救砖

emui8已经可以支持ProjectTreble了，于是我直接用twrp将DotOS直接刷到system分区，手机就不断进行重启了。并且rec进不去，卡在启动界面。erecovery也不能恢复。三键强刷也没有成功。

这时候你需要另一个神奇的twrp

链接：https://pan.baidu.com/s/1FAWCr-snmD9C0GhSZzcPqA?pwd=t0pd
提取码：t0pd

下载后，将手机进入fastboot模式并连接电脑，在命令行中输入fastboot flash recovery_ramdisk 文件路径 进行刷入，然后重启进入recovery模式，就进到了这个twrp了

你可以在这个twrp中再次重复上面的步骤把emui8刷进去

## 升级到EMUI9

首先你需要官方固件包。在万维论坛中可以找到。链接：https://www.rom100.com/forum.php

你可以在其中搜索你的手机型号，就可以找到对应的固件包

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220823094755.png)

但是你需要回复帖子才能获得下载链接，而回复需要登录，等于需要邀请码，邀请码付费。你可以去加一些有关刷机的群，在群里向大佬们借一个论坛账号。我在这里给到我所用的固件包的下载链接

链接：https://pan.baidu.com/s/1bEU-GzU2JCg1KTi7JdffDQ?pwd=d1wp
提取码：d1wp

（可能会有解压密码，解压密码就是压缩包里有个没扩展名的文件的文件名）

::: info “高维禁用”
”高维禁用“指的是这个固件包是华为高级维修店专用的刷机包，禁止公开的意思。可以不用理会这四个字
:::

使用百度云下载速度很是问题。我最终选择向百度云妥协，交了25块钱。如果你不想向百度云妥协，你可以选择antdownload，目前可用的一个下载百度云工具

链接：https://www.aliyundrive.com/s/sjwN7DRipCU
提取码：6666

下载完毕后，解压，将压缩包中的dload文件夹复制到u盘上。然后，进入twrp，选择”安装“。先点击”update_sd.zip“，然后，再添加一个压缩包，再把”update_sd_STF-AL10_all_cn.zip“加进去，再进行刷入。

如果你u盘速度比较慢的话，会卡在”skipping digest check: no digest file found“这里。如果一小时之后，或者手机电量快不足了，还卡在这里没有动静，你就可以直接把u盘拔掉重启。重启后就是emui9了

如果在刷的时候报错，出现了一堆红字，并且最终显示”Fail”的话，不去管他，直接重启，就进入emui9了

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E6%88%AA%E5%9B%BE20220823103605.png)

## 刷入类原生

在刷入类原生之前，你需要确保recovery是官方的recovery，这很重要！

首先下载treble check，链接：https://www.cr173.com/soft/938868.html

安装后可以看到系统是否支持ProjectTreble。实际上emui8及以后的版本都支持

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E5%9B%BE%E7%89%8720220823101815-scaled.jpg)

比如我这个是这样的。虽然是A Only分区，但是由于System-as-root的存在，还是需要刷入AB的GSI的包。

你可以去网上自行寻找想刷的类原生系统。我这里使用Havoc OS 2.9。

一般你会下载到一个.xz格式的文件，使用压缩工具解压，得到.img文件。将手机进入fastboot模式，连接电脑，输入 `fastboot flash system` 文件路径 即可进行刷入

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E5%9B%BE%E7%89%8720220823102559.jpg)

如果出现cannot load错误，如下图，你可能需要换一个类原生系统

![](https://www.caiwen.work/wp-content/uploads/2022/08/QQ%E5%9B%BE%E7%89%8720220823102516.png)

刷完后直接重启即可。

如果手机不断黑屏由重启，那么可能有下面原因

- 你刷的系统和你原来的系统的安卓版本对不上。比如我拿emui8刷havoc就无限重启。但是升级到emui9就可以正常刷入了

- 没有清理data分区。你需要清理data分区。但是不要使用twrp上的清理data分区。你需要在官方recovery中选择恢复出厂设置，这就是为什么要保持rec为官方的

- 你刷的类原生系统不适配你的手机

此时你可能需要按照上面所说的救砖步骤，重新刷回emui了

由于我刷完havoc，系统非常不稳定，有一堆问题，所以选择回到EMUI9了

## 刷入面具

首先你需要解包工具，链接：http://www.mz6.net/soft/18553.html#downurl

下载完毕后打开工具，你需要先按照如下设置

![](https://www.caiwen.work/wp-content/uploads/2022/08/%E6%8D%951%E8%8E%B7.png)

然后，在你之前下载到的”update_sd.zip“中，将”UPDATE.APP“解压出来，然后用这个解包工具打开”UPDATE.APP“，在其中找到这个

![](https://www.caiwen.work/wp-content/uploads/2022/08/%E6%8D%95%E8%8E%B7.png)

右键，将其提取出来并传到手机上

接着，在手机中安装Magisk，点击”安装“，”下一步“，”选择并修补一个文件“，选择刚才提取出来的那个文件。等待Magisk修复完之后，再把修复好的文件传到电脑上

手机进入fastboot模式，连接到电脑，命令行输入 `fastboot flash recovery_ramdisk` 文件路径 把面具修复好的rec刷进去。注意，刷完之后重启不能直接进入系统，你必须要首先进入recovery模式，进去之后面具会自动引导你进入系统，并成功安装好面具。

如果你手残直接进入了系统，你需要重新刷一遍recovery

::: info 补充
网上大多数面具安装教程都是修补boot.img。但你会发现使用解包工具，没有看到boot.img。实际上，华为对此进行了魔改，你只需要修复recovery即可。另外，如果你强行使用将boot.img导出并用面具修补，然后在刷入，你的手机会变砖
:::

## 参考

- https://zhuanlan.zhihu.com/p/397173427

- http://www.rootbbs.com/?id=343

- 【【全网首发】华为刷机入门【保姆级教程】华为手机刷机-魔鬼级难度刷机-小白也能看懂！】 https://www.bilibili.com/video/BV1HV4y1E7uo?share_source=copy_web

- 【玩机必看！带你入坑安卓刷机，小白也能看懂的ROOT基础指南来啦！】 https://www.bilibili.com/video/BV1BY4y1H7Mc?share_source=copy_web

- https://www.bilibili.com/read/cv15133756
