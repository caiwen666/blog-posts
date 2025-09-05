@meta

```json
{
	"id": "wordpress-low-speed",
	"createTime": "2022-02-27 13:48",
	"summary": "通过更改wordpress的头像源可以加快页面的加载速度",
	"key": ["wordpress", "慢", "加载"],
	"background": "https://www.caiwen.work/wp-content/uploads/2022/02/w1.png"
}
```

使用wordpress搭建博客。发现打开网站，尤其是进入网站后台进行管理时浏览器的标签页上一直在转圈，网页加载速度非常慢。而服务器本身网速并不慢。

## 原因

进入浏览器-F12-network，发现网页一直在等待一个来自gravatar.com的文件加载完毕。等待数十秒后加载失败，整个网页瞬间完成加载。

经过搜索得知，wordpress上的所有头像都来自gravatar.com这个网站。gravatar.com可以根据邮箱来获取到相应的头像（比如你留下的是qq邮箱，就会直接使用你的qq的头像）。而这个网站应该是被墙了，无法正常打开。也是因为此从而拖慢了整个网页加载的速度。

## 解决方法

在wordpress后台，点击“外观”->“主题文件编辑器”

![](https://www.caiwen.work/wp-content/uploads/2022/02/w1.png)

在“主题文件”一栏中点击“模板函数”

![](https://www.caiwen.work/wp-content/uploads/2022/02/w2.png)

在最下面加上如下的代码

![](https://www.caiwen.work/wp-content/uploads/2022/02/w3.png)

```php
// 替换 WordPress Gravatar 为国内头像源
function theme_get_ssl_avatar(avatar) {avatar = str_replace(array("www.gravatar.com", "0.gravatar.com", "1.gravatar.com", "2.gravatar.com", "secure.gravatar.com"), "cravatar.cn", avatar);
	return avatar;
}
add_filter('get_avatar', 'theme_get_ssl_avatar');
```

这样我们就替换为gravatar的国内镜像.
