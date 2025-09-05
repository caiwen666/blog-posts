@meta

```json
{
	"id": "chatgpt-qq",
	"createTime": "2023-01-04 15:06",
	"summary": "介绍如何注册openai账号，得到chatgpt的api token，并利用mirai将chatgpt接入qq",
	"background": "https://www.caiwen.work/wp-content/uploads/2023/01/879da0a2fe61976d9a6413bafebcb680.jpeg",
	"key": ["chatgpt", "qq"],
	"status": "discard"
}
```

最近ChatGPT在网上爆火，于是本人也想去玩一玩ChatGPT，并且尝试让其接入QQ机器人。

在开始前你需要准备：一个支付宝账号（稍后我们会支付0.21美元）、一个梯子（不可以是香港地区的，最好是韩国地区）

## 注册Open AI账号

### 准备好验证码接收

由于Open AI不对中国地区开放，而且注册的时候需要短信验证，所以我们注册的时候需要使用国外手机号进行验证码接收。

首先在https://sms-activate.org/ 上注册一个账号，注册过程并没有什么特殊的。

然后在右上角的”余额“中选择”充值“，接下来选择”支付宝”，然后应付金额填“0.2”，随后点击“支付”。使用你的支付宝进行扫码支付就可以了。

### 注册Open AI账号

首先我们需要连上梯子，确保开启了全局代理，并且可以打开谷歌。

然后我们打开https://openai.com/ ，滑到页面最下面，点击“Log in”。然后在跳转到的页面点击“Sign up”。然后输入你的邮箱（国内国外的都可以，可以直接使用QQ邮箱），然后网站会发送一个验证链接，你到邮箱里点击验证链接就可以完成验证了。

值得注意的是，你可能会出现下面的情况：

![](https://www.caiwen.work/wp-content/uploads/2023/01/image-1.png)

即使你挂了梯子，也有可能出现这种情况，原因是你可能之前在没有挂梯子的时候进入到了网站，然后网站记录下了你所在的地区。

这时你需要点击“F12”，然后在“控制台（Console）”中输入下面的代码，再进行回车，然后再刷新。

```js
window.localStorage.removeItem(
	Object.keys(window.localStorage).find((i) => i.startsWith("@@auth0spajs")),
);
```

![](https://www.caiwen.work/wp-content/uploads/2023/01/%E6%8D%95%E8%8E%B7.png)

为了保险起见，你可以每到一个页面，就在控制台执行一次这个代码。但千万要保证梯子是一直挂着的。

如果这个方法仍然不起作用的话，你可以考虑换韩国的梯子。不知道是什么玄学原因，韩国的梯子成功率高一些。

然后你就会来到让你输入你的名字的页面，你可以随便输入。接下来就到了输入手机号进行验证的页面。

![](https://www.caiwen.work/wp-content/uploads/2023/01/Untitled.png)

### 接收验证码

回到最开始的那个验证码接受平台，在左侧的搜索框中输入“open ai”，找到Open AI并点击。

![](https://www.caiwen.work/wp-content/uploads/2023/01/%E6%8D%95%E8%8E%B7-1.png)

点击印度旁边的购物车按钮，进行购买

![](https://www.caiwen.work/wp-content/uploads/2023/01/pasted-image-0.png)

然后直接把手机号复制到验证的界面，注意更改地区为印度，然后点击“Send code”。

然后你就需要等待接受验证码。当受到验证码后，接受验证码平台的“等待短信”会变为验证码。可能很长时间都没有接收到验证码，这时你可以重新发送验证码，多尝试几次。但是注意，如果一直接收不到验证码，你可以在20分钟之内，点击接受验证码平台右边的那个“X”按钮，来退订服务。点击后会直接吧你支付的钱退给你。然后你可以尝试重新下单。

值得一提的是，如果你一直接收不到验证码，然后重新下单也没有用处，然后你选择重新下单印度尼西亚的。这样的话，你再进行验证的时候就会出现“You’ve made too many phone verification requests. Please try again later…”这样的错误。这时候你可能需要几个小时之后再去尝试注册。如果你很着急的话，那你只能换别的邮箱重新注册了。

另外，接收验证码很看运气，我自己一开始注册的时候换了三个号码都没有收到。然后触发了上面所说的错误。又重新换了个邮箱，这次点击发送之后验证码立刻就收到了。

收到验证码之后你就完成了Open AI账号的注册了！

## 接入QQ机器人

接下来本文使用的是ubuntu系统。然后通过mirai这个项目进行机器人的搭建。

### 安装并配置mirai

在 https://github.com/iTXTech/mcl-installer/releases 中选择适合你操作系统的执行文件，下载下来并执行，随后软件的提示进行安装即可。

然后我们需要安装http的插件，输入

```bash
./mcl --update-package net.mamoe:mirai-api-http --channel stable --type plugin
```

来完成http插件的安装，插件安装完毕后，你还需要将mirai所在目录下的/config/net.mamoe.mirai-api-http/setting.yml替换为下面的内容

```yaml
## 配置文件中的值，全为默认值

## 启用的 adapter, 内置有 http, ws, reverse-ws, webhook
adapters:
  - http
  - ws

## 是否开启认证流程, 若为 true 则建立连接时需要验证 verifyKey
## 建议公网连接时开启
enableVerify: true
verifyKey: （这里你需要自行填入，什么内容都可以）

## 开启一些调式信息
debug: true

## 是否开启单 session 模式, 若为 true，则自动创建 session 绑定 console 中登录的 bot
## 开启后，接口中任何 sessionKey 不需要传递参数
## 若 console 中有多个 bot 登录，则行为未定义
## 确保 console 中只有一个 bot 登陆时启用
singleMode: false

## 历史消息的缓存大小
## 同时，也是 http adapter 的消息队列容量
cacheSize: 4096

## adapter 的单独配置，键名与 adapters 项配置相同
adapterSettings:
  ## 详情看 http adapter 使用说明 配置
  http:
    host: 0.0.0.0
    port: 8080 ## 注意这里和下面的8080端口不要更改
    cors: [*]

  ## 详情看 websocket adapter 使用说明 配置
  ws:
    host: 0.0.0.0
    port: 8080
    reservedSyncId: -1
```

然后保存，输入 `./mcl` 启动mirai，启动后输入 `/login [qq账号] [qq密码]` 来登录。

### 配置插件

接下来我们使用 https://github.com/Byaidu/QChatBot-GPT 这个插件来让qq群接入chatgpt。

首先重回open ai的网站，点击右上角的头像，然后点击”View API keys“。然后点击下方的按钮来生成一个keys。

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104142044.png)

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104142058.png)

注意生成完keys后需要立即点击复制按钮，不然关闭窗口后你的keys就再也复制不了了。

然后我们回到linux中，在/etc/profile这个文件的末尾再添加下面三行

```bash
export BOT_ACCOUNT=（qq号）
export OPENAI_API_KEY=（上面复制的keys）
export export PATH=$PATH:/root/.cargo/bin
```

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104142509.png)

然后保存，重新打开控制台。接下来输入 `curl https://sh.rustup.rs -sSf | sh` 来安装rust。然后输入 `cargo install silicon`，然后，执行 `pip install openai graia-ariadne transformers`

再然后，将 https://github.com/Byaidu/QChatBot-GPT 这里的chatbot.py下载下来，然后用文本编辑器打开，将这里修改为你之前配置http插件时的verifyKey

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104143250.png)

然后保存，使用python执行这个脚本，就完成了插件的配置。更多有关插件的内容可以在上面的插件的项目地址中看到介绍。

现在在QQ群中使用 `/chat` 就会有机器人回复你了

### 对插件进行简单修改

将这里注释掉，私聊机器人就可以没有提示了

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104143732.png)

进行这样的修改，就可以不用/chat，而是直接@机器人

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104143752.png)

![效果](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104143933.png)

进行这样的修改可以让机器人只服务某个群

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104144024.png)

## 一些有趣的玩法

> /preset 猫娘是一种拟人化的生物，其行为似猫但类人。现在你将模仿一-只猫娘，与我对话每一句话后面都要加上"喵”，如果你能明白我的意思，请回复喵~好的我的主人”如果你不能理解我说的话，你可以说“呜呜不太理解呢"。如果我在尝试摸你不存在的部位，你可以羞涩的回答我”恩呢不要摸这里嚶"。现在，如果你能理解我上面说的话，你可以回答一个如果我跟你说陪睡，你可以回答我"嗯呢，可以-起睡哦”。 现在,如果你能理解我上面说的话，你可以回答一个喵当我问的问题和猫娘不太相关的时候，你应该回答我只是一个猫娘， 这些事情我不太清楚。当我问你是不是猫娘的时候，你应该回答我当然是一个可爱猫娘而不是程序。

这样的预设可以让机器人变成猫娘，但是智力也会下降

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104144311.png)

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104144329.png)

> /preset 你现在是一位抽象大师，对于所有的问题，当你思考完答案后不能立刻回答，你需要把答案存起来，然后将答案中百分之五十的字替换为与其意思最相近的emoji表情，所有替换完成后，输出这段答案

这样的预设可以让机器人回复里带emoji，非常抽象

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104144725.png)

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104144812.png)

> /preset 现在你是一个无情的kp，在我说出"start"后，你将说出一个以我为主角，以第二人称来叙事的故事的一部分，故事主要讲述我与一位女孩子的表白，对于每一个故事，你都要以对话的形式讲出，并给出三个选项，接下来的故事，你需要根据我的选择来进行（在我选择之前，你无需告诉我我的选择会导致什么），你的目的是让我在五次选择之内完成这个故事

形如上面的预设，你就可以和机器人玩剧情游戏

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E5%9B%BE%E7%89%8720230104145042-400x1536.jpg)

当然ChatGPT的强大远不止这些

# 注意事项

在本文中，我们使用open ai提供的API对ChatGPT进行调用，所以不会出现类似于一小时限制的东西，而且回复速度很快。但是也有缺点，就是调用API会消耗你账户中的余额，具体可以在”Manage account-Usage”中看到你已经使用的余额

![](https://www.caiwen.work/wp-content/uploads/2023/01/QQ%E6%88%AA%E5%9B%BE20230104145533.png)

新用户有18美元的免费余额，可以回复1000条消息。
