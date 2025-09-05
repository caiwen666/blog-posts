export interface Tag {
	value: string; //标签名
	color:
		| "primary"
		| "default"
		| "secondary"
		| "error"
		| "info"
		| "success"
		| "warning"; //标签颜色
}

export interface Recommend {
	// recommend.json
	top: string[]; //首页推荐
	article: { [id: string]: string[] }; //文章推荐，对于每个文章都为其生成推荐文章列表
}

export interface Article {
	type: "Article";
	title: string; //标题
	id: string; //文章ID，用于文章永久链接
	createTime: Date; //文章创建时间，用于文章序列的排序
	updateTime: Date; //文章最后更新时间
	content: string; //文章的markdown内容，用于全文搜索，去掉了文章的meta
	summary: string; //文章的简介，用于列表展示和seo优化
	key: string[]; //文章的关键字，用于同类推荐和seo优化
	tags: Tag[]; //文章的标签，用于列表展示
	path: string[]; //文章的路径
	background: string; //文章的背景图片
	recommend: boolean; //是否推荐
	status: "published" | "draft" | "discard"; //文章状态
}

//从根目录构成的树形结构 -> tree.json
export interface Category {
	type: "Category";
	title: string; //分类名，直接用于链接
	count: number; //分类下的文章数量
	updateTime: Date; //分类最后更新时间
	subArticle: string[]; //分类下的文章，仅存储文章ID
	subCategory: Category[]; //子分类
}

export type ArticleList = Article[]; //全部文章数据，按创建时间排序 -> data.json

//文章id到文章列表索引的映射 -> index.json
export interface ArticleMap {
	[id: string]: number;
}

export type Optional<T> = { [P in keyof T]?: T[P] };

export type ArticleDTO = Omit<Article, "content">;

export interface SearchDTO {
	id: string;
	title: string;
	path: string[];
	content: string;
}

export interface SearchResponse {
	hits: SearchDTO[];
	total: number;
}

export interface BuildCache {
	meta: Article;
	md5: string; // md5
}
