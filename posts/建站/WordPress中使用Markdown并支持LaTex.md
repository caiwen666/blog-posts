@meta

```json
{
	"id": "wordpress-markdown-latex",
	"createTime": "2022-07-31 21:10",
	"summary": "记录一下如何在wordpress中使用markdown，并且支持latex公式，以及中间遇到的问题",
	"key": ["wordpress", "markdown", "latex"],
	"background": "https://www.caiwen.work/wp-content/uploads/2022/07/15.png",
	"status": "discard"
}
```

wordpress自带的文章编辑器操作比较繁琐，用来随手记笔记的话比较麻烦，还不能插入公式之类的东西。而如果使用markdown记笔记的话，无论是排版还是插入公式都非常轻松。本文就记录一下如何在wordpress中使用markdown，并且支持latex公式，以及中间遇到的问题

## 插件安装

在wordpress后台安装 MathJax-LaTeX 和 WP Githuber MD 这两个插件，并启用

按如下配置MathJax-LaTeX插件

![](https://www.caiwen.work/wp-content/uploads/2022/07/12-1-1024x461.png)

其中`Custom MathJax location?`中填入 `https://cdn.bootcss.com/mathjax/2.7.0/MathJax.js` 这样我们就可以比较快速的加载mathjax的js文件

## LaTex无法显示

在后台写文章时会发现WP Githuber MD的编辑器并不支持显示LaTex，文章保存后在文章界面中MathJax-LaTeX也没有对LaTex进行解析。为此，我们需要进行如下操作

![](https://www.caiwen.work/wp-content/uploads/2022/02/w1.png)

在后台，点击“外观”，选择“主题文件编辑器”，在右侧选择“header.php”

![](https://www.caiwen.work/wp-content/uploads/2022/07/13.png)

在右侧加入如下代码

![](https://www.caiwen.work/wp-content/uploads/2022/07/14.png)

```js
MathJax.Hub.Config({
	tex2jax: {
		inlineMath: [
			["$", "$"],
			["\\(", "\\)"],
		],
		processEscapes: true,
	},
});
```

然后点击“更新文件”

然而这时候我遇到了一个问题

![](https://www.caiwen.work/wp-content/uploads/2022/07/6.png)

我们按照以下方法解决，进入网站管理面板，进入“wp-admin/includes”目录，找到“file.php”文件进行编辑

![](https://www.caiwen.work/wp-content/uploads/2022/07/7.png)

使用搜索功能，查找 `is_active`，然后将 `if ( $is_active && .......}` 这一部分代码删除

![](https://www.caiwen.work/wp-content/uploads/2022/07/8.png)

![删除后](https://www.caiwen.work/wp-content/uploads/2022/07/9.png)

然后保存，在回到wordpress后台，点击“更新文件”就可以了

再回到文章界面，LaTex可以正常显示

![修改前](https://www.caiwen.work/wp-content/uploads/2022/07/5.png)

![修改后](https://www.caiwen.work/wp-content/uploads/2022/07/11.png)

## 更好的Markdown体验

但这样一来仍然无法在编辑文章时在旁边的预览看到LaTex公式。为了拥有在洛谷上一样的markdown体验，我将洛谷的markdown编辑器源码下载下来，并加了个自动保存的功能，作为自己的markdown编辑器

![](https://www.caiwen.work/wp-content/uploads/2022/07/15.png)

编辑好后直接把markdown文本复制到wordpress即可。

编辑器网址：https://www.caiwen.work/tools/markdown

::: error 警告
由于博客已经经过多次搬迁和改动，上述链接已经不可用。
:::

::: info 更好的方案？
事实上用WP editor.md这个插件就不用那么麻烦了
:::
