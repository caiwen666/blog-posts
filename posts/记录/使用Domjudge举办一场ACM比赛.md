@meta

```json
{
	"id": "domjudge",
	"createTime": "2025-12-29 10:32",
	"key": ["domjudge", "腾讯云", "acm", "icpc", "评测机"],
	"background": "https://api.file.caiwen.work/picture/2026/01/01/632b47f6580e87bcd976d84a260de3e5.png"
}
```

## 1. 前言

之前的校赛一直在老 OJ 上举行。老 OJ 是好几年前的老学长的毕业设计，功能特别少，页面老旧，并且体验感也特别差，比如排行榜上只能显示队伍编号，不知道编号对应的是谁。更重要的是，评测机速度特别慢，去年的新生赛比赛时竟然有 6 页的 pending，交一发要等十几分钟，所以今年下定决心做出点改变。

目前正式比赛的 OJ 一般有三种选择：Domjudge，CCPC OJ，Hydro。Hydro 今年刚开始使用，貌似还没有正式对外公布用于比赛的 Hydro 版本。Domjudge 一眼看上去有点复杂，所以最开始选择使用 CCPC OJ。不过 CCPC OJ 的大屏展示、滚榜不是 ICPC Tools，少点感觉，并且 CCPC OJ 不能测交互题，而且中间测试感觉 CCPC OJ 的体验感也不是很好，于是又打算改用 Domjudge。

## 2. 服务器

虽然作为 985（甚至还有一个超算中心），但学校的服务器配置都很低，难以作为评测机。于是考虑直接在网上买公网服务器。最开始考虑的是阿里云，但是有文章说[^1] 可能阿里云的服务器会出现问题，于是又考虑使用腾讯云的服务器。

直接包月买肯定买不起了，而且也没必要，我们可以按量付费。我买的是计算型 C6 （ C6.LARGE8）这个服务器。腾讯云的可用地区里貌似离湖南最近的地区就是广州了，于是地域选的是广州。然后把硬盘容量调成最低（20GB），镜像用的 Ubuntu，公网流量也按量付费，把带宽上限拉到最大（200Mbps）：

![配置清单](https://api.file.caiwen.work/picture/2025/12/29/image-20251229111023348.png)

这样下来一小时只有 0.75，感觉还可以接受。

后面我在服务器上安装了一个宝塔面板，然后在宝塔面板里又安装了一个 Docker，随后部分都是以 Docker 容器的形式部署的。

前期在准备比赛的时候可能会时不时用一下服务器上传或者更新的功能，但总的来说用的比较少。服务器不用的时候可以选择关机不收费（其实硬盘的费用还是要收的，不过没那么多就是了）。服务器每次启动的时候 IP 可能会变，可以考虑开通一个弹性公网 IP（这个只有没有绑定服务器才会收费，服务器处于关机状态的话应该是不收费的）

## 3. Domjudge

### 3.1 部署

Domjudge 的配置过程比我想象中简单不少。首先部署数据库：

```sh
docker run --restart=always -d -it --name dj-mariadb \
-e MYSQL_ROOT_PASSWORD=domjudge114514 \
-e MYSQL_USER=domjudge \
-e CONTAINER_TIMEZONE=Asia/Shanghai \
-e MYSQL_PASSWORD=domjudge114514 \
-e MYSQL_DATABASE=domjudge -p 3306:3306 \
mariadb  --max-connections=1000 --max-allowed-packet=102400000 --innodb-log-file-size=202400000
```

- `max-connections` 设为 1000，确保能够顺利进行数据库连接
- `max-allowed-packet` 的单位是 B，一般设为最大测试点的两倍
- `innodb-log-file-size` 的单位是 B，一般设为最大测试点的十倍
- 由于我们使用 Docker 进行部署，所以上述的参数最好在开始就想好，后面再改动的话就会非常麻烦

然后部署 Domjudge：

```sh
docker run --restart=always --link dj-mariadb:mariadb -d -it \
-e MYSQL_HOST=mariadb \
-e MYSQL_USER=domjudge \
-e MYSQL_DATABASE=domjudge \
-e CONTAINER_TIMEZONE=Asia/Shanghai \
-e MYSQL_PASSWORD=domjudge114514 \
-e MYSQL_ROOT_PASSWORD=domjudge114514 \
-p 80:80 --name domserver domjudge/domserver:8.3.1
```

然后 Domjudge 就顺利跑起来了。

然后我们还需要执行下面这些命令来获取初始的管理员密码和评测机连接的密钥：

```sh
docker exec -it domserver cat /opt/domjudge/domserver/etc/initial_admin_password.secret
# 下面这条命令获取的就是评测机连接的密钥
docker exec -it domserver cat /opt/domjudge/domserver/etc/restapi.secret
```

### 3.2 配置

进入 domjudge 后台，点击 Configuration settings。

首先在 Scoring 这里，domjudge 中的内存超限可能会返回 RE 的结果，于是打算直接把 MLE 映射成 RE，然后赛前提醒选手这种情况。同时还把输出超限和没有输出给映射到 WA。

![评测结果映射](https://api.file.caiwen.work/picture/2025/12/29/image-20251229130138414.png)

然后在 Judging 这里，建议调大 Output limit，因为默认的 Output limit 可能不太大（大概 8MB），且后面导入题目的时候，可能很多题目没有特别去设置 Output limit，如果此时测试点的答案本身就超过了这个 Output limit，就会出现问题。

在 Clarifications 这里可以提前设置一下快捷回复。

在 Display 这里，首先关闭 Show flags，打开 Show affiliations 和 Show affiliation logos，这样榜单的样子就和区域赛的比较接近了。同时我还将 Show compile 设为 always，以及打开了 Allow team submission download。

## 4. 评测机

### 4.1 部署

首先需要在 `/etc/default/grub` 这个文件中，在 `GRUB_CMDLINE_LINUX_DEFAULT` 那里，将 `quiet cgroup_enable=memory swapaccount=1 systemd.unified_cgroup_hierarchy=0` 追加到后面，然后执行：

```sh
update-grub
reboot
```

随后服务器将会重启。重启后再执行：

```sh
docker run -d --restart=always -it --privileged \
-v /sys/fs/cgroup:/sys/fs/cgroup:rw \
--name judgehost-0 \
--link domserver:domserver \
-e DAEMON_ID=2 \
-e JUDGEDAEMON_PASSWORD=rynmkGPP4icVoS8BgIth9AkEeF3icUpY \
-e CONTAINER_TIMEZONE=Asia/Chendu \
domjudge/judgehost:8.3.1
```

- `--name` 是设置容器名称，可以自行设置，只要不重复就可以
- `JUDGEDAEMON_PASSWORD` 那里写上面获得的评测机连接密钥
- `DAEMON_ID=2` 这里设置评测机在哪个 CPU 核心上执行，这里的数字是从下标 0 开始的。值得注意的是，云服务器的厂商在服务器配置那里写的核心数量大概率是超线程过的。比如我买的服务器是 4 核心的，但其实只有两个物理核心。我们可以执行 `cat /sys/devices/system/cpu/cpu*/topology/thread_siblings_list` 查看哪几个虚拟核心是同属于一个物理核心，然后一个物理核心只绑定一个评测机，确保评测的速度。

### 4.2 扩容

考虑到我们是购买公网服务器，所以扩容也是非常方便的。我们可以再买一台服务器（需要和 domjudge 所在的主服务器的地域是一样的），专门用来放评测机。在这台服务器上执行：

```sh
docker run -d --restart=always -it --privileged \
-v /sys/fs/cgroup:/sys/fs/cgroup:rw \
--name judgehost-0 \
--network=host \
-e DAEMON_ID=0 \
-e JUDGEDAEMON_PASSWORD=rynmkGPP4icVoS8BgIth9AkEeF3icUpY \
-e DOMSERVER_BASEURL=http://172.16.0.10/ \
-e CONTAINER_TIMEZONE=Asia/Chendu \
domjudge/judgehost:8.3.1
```

- `DOMSERVER_BASEURL` 这里需要填主服务器的内网 ip
- `--network=host` 让容器可以通过局域网连接到主服务器

然后我们可以对服务器制作镜像，然后创建一个快速启动模板。赛时需要扩容的话鼠标一点，创建新的服务器就可以了，非常方便。（不过如果要缩容的话不能直接把服务器释放，因为可能释放的时候服务器上的评测机正在跑评测任务，可能会出意外。感觉先在 domjudge 后台禁用掉评测机以后再释放会不会好一点？）

## 5. 大屏展示

大屏展示就是区域赛现场会放的倒计时、Judge Queue 之类的。

### 5.1 CDS

首先我们需要搞一个叫做 CDS 的东西。本来一开始打算不用 Docker 部署，于是光 Java 版本就搞了半天。成功启动之后又发现页面有问题...总之又改用 Docker 了。

CDS 的镜像是放在 Github 上的，于是这就有了网络的麻烦。还好南京大学提供了镜像源。我们执行：

```sh
docker run \
    --name cds \
    -d -it \
    --network=host \
    -p 8080:8080 \
    -p 8443:8443 \
    -e CCS_URL=http://localhost/api/contests/1 \
    -e CCS_USER=admin \
    -e CCS_PASSWORD=admin_password \
    ghcr.nju.edu.cn/icpctools/cds:2.6.1331
```

- `CCS_PASSWORD` 要设置成 domjudge 的管理员账号的密码

- `CCS_URL` 的 `1` 表示的是比赛的 ID，可以在 domjudge 的后台看到

然后再进入容器中：

```sh
docker exec -it cds bash
```

执行：

```sh
cat /opt/wlp/usr/servers/cds/config/accounts.yaml
```

就能看到 CDS 的账号信息，我们需要记录一下 `admin`、`presAdmin` 和 `presentation` 的密码。

然后执行：

```sh
vim /opt/wlp/usr/servers/cds/config/cdsConfig.xml
```

将其中 `ccs` 的 `url` 和 `password` 设为与上面的 `CCS_URL` 和 `CCS_PASSWORD` 一致，然后保存。（`cds` 的镜像里是没有 `vim` 的，需要先自己在容器里安装）

注意，当服务器关机又重启之后，CDS 这个容器可能不会自动启动，需要自己在后台手动启动一下。

### 5.2 Presentation Client

后面需要注意，CDS 和后面要说的 Presentation Client、Presentation Admin、Resolver 这些都属于 ICPC Tools，他们之间的版本要保持一致（而且最好是最新版，不是最新版的话在启动时可能会触发自动更新，比较麻烦）。这些工具是基于 Java 的，所以大屏展示工具和滚榜工具在运行前需要安装 Java，而且 Java 的版本好还要对应好。

我用的 ICPC Tools 的版本号都是 2.6.1331 的，对应的 Java 版本是 JDK 17。

首先安装好 Java，然后去 [The ICPC Tools | Home](https://tools.icpc.global/) 这里下载 Presentation Client，这是大屏展示的客户端。下载解压后在对应的目录下执行：

```cmd
set "ICPC_FONT=DengXian" && client.bat https://ip:8443/api/contests/1 presentation password
```

- ICPC Tools 中除了 CDS 在服务器上跑，其他的都在个人电脑的 Windows 下跑就可以
- 上面这个指令要在 cmd 中运行，不能在 power shell 中运行
- `set "ICPC_FONT=DengXian"` 以做到可以显示中文
- `ip` 要替换成 cds 服务器所在的 ip
- `1` 也要替换成对应的比赛 id，和上面 `CCS_URL` 的保持一致
- `password` 要填上面获得到的 cds 的 `presentation` 密码

然后稍等片刻即可进入大屏展示的界面。

### 5.3 Presentation Admin

开始时大屏展示上是只显示 ICPC Tools 的图标的，需要我们自行为其设置页面。

有两种方法，一种是在 ICPC Tools 的网站中下载 Presentation Admin，然后解压，运行：

```cmd
set "ICPC_FONT=DengXian" && presAdmin.bat https://ip:8443 presAdmin password
```

- `ip` 要替换成 cds 服务器所在的 ip

- `password` 要填上面获得到的 cds 的 `presAdmin` 密码

稍等片刻即可打开大屏展示的后台管理界面，在这个界面中可以设置每个大屏展示客户端显示什么内容。

另一种方法是直接打开 `https://ip:8443`，可以来到 CDS 面板，点击 `Sign in` ，输入 CDS 的 `admin` 账号和密码，登录，然后就可以在左边菜单中看到 `Presentation Admin`，然后就可以在里面选择对所有的大屏展示设置成某个界面。

注意，上面提到 `CCS_URL`、`/opt/wlp/usr/servers/cds/config/cdsConfig.xml` 、`Presentation Client` 的命令行中，这些地方都需要填比赛 id，一定要记得在比赛前将这些地方改好。

## 6. 数据导入

### 6.1 题目导入

一般题目是在 Polygon 上出的，然后有现成的工具可以将 Polygon 的题目转换成 domjudge 的题目。直接参考：

[Polygon2DOMjudge/README.cn.md at master · cn-xcpc-tools/Polygon2DOMjudge](https://github.com/cn-xcpc-tools/Polygon2DOMjudge/blob/master/README.cn.md)

值得注意的是，需要在 Polygon 上构建 Full Package 而不是 Standard Package，然后下载 Full Package 的 Linux 版本，然后再用这个工具进行转换。转换成 domjudge 的格式之后就可以直接导入 domjudge 中。

可以在题目的编辑界面下方重新导入题目，这样的话题目将会被更新。

![](https://api.file.caiwen.work/picture/2025/12/29/image-20251229132401625.png)

### 6.2 队伍/账号导入

首先先在 Domjudge 的后台 Configuration settings -> External systems -> Data source ，将其设为 configuration data external，这样将会在 domjudge 的很多界面中新增 external id 这个字段。

在 Team Categories 中可以添加队伍种类：

![添加页面](https://api.file.caiwen.work/picture/2025/12/29/image-20251229131437425.png)

- External ID 可以自己设置
- 不同 Sortorder 的分类的选手，在排行榜上会显示在不同的区域。不过区域赛中，一般都是打星选手和正是选手混在一个区域的，所以 Sortorder 都可以设为 0

在 Team Affiliations 中可以添加学校信息：

![添加界面](https://api.file.caiwen.work/picture/2025/12/29/image-20251229131815305.png)

- External ID 可以自己设置
- Logo 这里建议在创建的时候不上传（疑似是 domjudge 的 bug，因为只有更新页面上传 logo 才有用，创建页面上传 logo 没用），而是创建完之后再点编辑再上传。可以在 [中国大学矢量校徽大全](https://www.urongda.com/) 这里找到大多数学校的校徽矢量图。

由于我们本次比赛的学校种类数比较少，所以手动添加即可。如果要批量添加的话可以参考官方文档：[Adding contest data in bulk — DOMjudge 8.3.2/0152847a5 documentation](https://www.domjudge.org/docs/manual/8.3/import.html#importing-team-affiliations)

接下来导入队伍，我们可以用 python 之类的将报名数据生成一个 json 数组，格式如下：

```json
[
	{
		"id": "dup4team001",
		"group_ids": ["3"],
		"name": "dup4team001",
		"display_name": "dup4team001",
		"organization_id": "3",
		"label": "",
		"members": "",
		"location.description": ""
	}
]
```

- domjudge 后台的 Teams 页面中的 `id` 一列是导入时 domjudge 自己生成的，无法自定义。上面 `id` 字段设置的是 `external ID`
- `group_ids` 设置该队伍的分类。一个队伍可以有多个分类。里面的元素是 Team Categories 的 external ID。
- `name` 和 `display_name` 都表示队伍的名称。虽然官方文档中说 `display_name` 是可选的，但是如果不设置的话，榜单上将不会显示队伍名称。
- `label` 是队伍标签，一般可以填队伍的位置。`location.description` 也表示队伍位置。不过前者基本出现在 domjudge 后台所有显示队伍名称的前面，而后者貌似只会出现在气球分发的页面。
- `members` 的内容其实会显示在队伍描述那里。可以填队伍的成员名称。
- `organization_id`：填队伍对应的 team affiliations 的 external id。

然后在后台的 Import / export 中导入。

接下来导入队伍账号。虽然官方文档中账号的导入没说支持 json 格式，但是这篇文章[^2] 提到了 json 格式的导入方法。格式如下：

```json
[
	{
		"id": "dup4account001",
		"username": "dup4account001",
		"password": "P3xm33imve",
		"type": "team",
		"name": "dup4account001",
		"team_id": "dup4team001"
	}
]
```

- `id` 将会设置账号的 external id
- `username` 和 `password` 设置账号的用户名和密码
- `name` 应该是账号的昵称，感觉直接和用户名保持一致就好
- `team_id` 是账号对应队伍的 external_id

然后在后台的 Import / export 中导入。

值得一提的是，使用 json 导入的时候 domjudge 不会对密码的安全性进行检查（比如检查是否大于多少位之类的）

如果中间导入出了什么问题的话，可以考虑直接发 http 请求来批量操作数据（）

如果你在将 Data source 设为 configuration data external 之前已经创建了比赛，那么这个比赛是没有设置 external id 的，于是你在操作这个比赛时（编辑/查看榜单之类的）就会出现类似于下图的问题：

![](https://api.file.caiwen.work/picture/2025/12/29/image-20251229141330490.png)

此时我们只需要把 Data source 改为原来的就好了。

## 7. 滚榜

需要把比赛结束之后的数据转成 ICPC Tools 的 Resolver 接受的数据。ICPC Tools 中貌似已经有对应的工具，但是不太好用。我使用了这个工具：[Lanly109/icpc-resolver-from-domjudge](https://github.com/Lanly109/icpc-resolver-from-domjudge)

不过这个工具感觉也不太好使用。我打算后面再专门做一个处理滚榜的工具，所以关于滚榜的内容这里就暂时不讲了......

## 8. 其他

赛前如果要在 domjudge 上开测试比赛的话，需要记得后面把测试比赛的 public 和 enable 都给关了。同时如果赛前开了些测试账号和队伍，也需要把这些账号和队伍 enable 给关了，并放入 jury 或者其他什么分类中（不然上面的滚榜工具还会把测试队伍给导入进去）。目前还有个问题是，如果不删除测试账号/队伍的话，那么大屏展示显示排行榜的时候还会显示。

由于是使用公网 IP，所以赛后需要检查一下选手登录的 IP，防止有人赛时提前离场然后在考场外面继续答题。

同时由于是使用腾讯云的按量付费服务器，赛后需要把服务器释放掉，不然一直扣费。释放前可能还需要把选手的提交记录什么的都给存档下来。

上面两个我自己写了一个工具：[caiwen666/domjudge-tools](https://github.com/caiwen666/domjudge-tools)，后面还会继续更新。

[^1]: [计算机 · DOMjudge Docker 配置 - 知乎](https://zhuanlan.zhihu.com/p/258024151)

[^2]: [DOMjudge Team Account Import Guide - Dup4's Blog](https://dup4.com/blog/2022/5/domjudge-team-account-import-guide/)
