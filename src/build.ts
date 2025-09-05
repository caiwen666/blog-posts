import * as fs from "node:fs";
import Path from "path";
import { compileMarkdown } from "./markdown/index.js";
import {
	Article,
	ArticleList,
	ArticleMap,
	BuildCache,
	Category,
	Recommend,
} from "@/entity";
import {
	md5,
	parseArticle,
	readFileSync,
	writeFileWithDirsSync,
} from "./utils.js";
import { generateSummary } from "./ai.js";

const MAX_RECOMMEND = 10; //最大推荐数量

const articleList: ArticleList = []; //data.json
const articleMap: ArticleMap = {}; //index.json
let category: Category | null = null; //tree.json
let recommend: Recommend | null = null;
const home: string[] = []; //home.json
const discard: string[] = []; //discard.json
const draft: string[] = []; //draft.json
let cache: { [key: string]: BuildCache } = {}; // 指定 id 的文章内容的 md5，用于判断是否要重新编译，cache.json

//构建整个博客的数据
//文章的所有数据应存储在工作目录/posts中
//编译后的数据存储在工作目录/build中
export async function build(
	path: string,
	target: string | undefined = undefined,
) {
	console.log(`Building in ${path}...`);
	cache = JSON.parse(
		readFileSync(Path.join(path, "build", "cache.json"), "{}"),
	);
	if (target !== undefined) {
		delete cache[target];
	}
	category = (await buildTree(Path.join(path, "posts"), [], path)) as Category;
	//文章排序
	articleList.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
	const topRecommend: string[] = [];
	const keyTable: { [key: string]: string[] } = {}; //关键字表，关键字到文章id的映射
	for (let i = 0; i < articleList.length; i++) {
		if (articleMap[articleList[i].id] === undefined) {
			//生成文章索引
			articleMap[articleList[i].id] = i;
			//首页列表
			switch (articleList[i].status) {
				case "published":
					home.push(articleList[i].id);
					break;
				case "draft":
					draft.push(articleList[i].id);
					break;
				case "discard":
					discard.push(articleList[i].id);
					break;
			}
			//筛出首页推荐
			if (articleList[i].recommend && topRecommend.length < MAX_RECOMMEND) {
				topRecommend.push(articleList[i].id);
			}
			for (const key in articleList[i].key) {
				if (keyTable[articleList[i].key[key]] === undefined) {
					keyTable[articleList[i].key[key]] = [];
				}
				keyTable[articleList[i].key[key]].push(articleList[i].id);
			}
		} else {
			console.error("Warning: id 存在重复");
			console.error(articleList[i]);
			process.exit(-1);
		}
	}
	//生成推荐数据
	recommend = { top: topRecommend, article: {} };
	for (const article of articleList) {
		const recommendList: string[] = [];
		for (const key of article.key) {
			for (const id of keyTable[key]) {
				if (
					id !== article.id &&
					!recommendList.includes(id) &&
					recommendList.length < MAX_RECOMMEND
				) {
					recommendList.push(id);
				}
			}
		}
		recommend.article[article.id] = recommendList;
	}
	//写入数据
	writeFileWithDirsSync(
		Path.join(path, "build", "data.json"),
		JSON.stringify(articleList),
	);
	writeFileWithDirsSync(
		Path.join(path, "build", "index.json"),
		JSON.stringify(articleMap),
	);
	writeFileWithDirsSync(
		Path.join(path, "build", "tree.json"),
		JSON.stringify(category),
	);
	writeFileWithDirsSync(
		Path.join(path, "build", "recommend.json"),
		JSON.stringify(recommend),
	);
	writeFileWithDirsSync(
		Path.join(path, "build", "home.json"),
		JSON.stringify(home),
	);
	writeFileWithDirsSync(
		Path.join(path, "build", "discard.json"),
		JSON.stringify(discard),
	);
	writeFileWithDirsSync(
		Path.join(path, "build", "draft.json"),
		JSON.stringify(draft),
	);
	writeFileWithDirsSync(
		Path.join(path, "build", "cache.json"),
		JSON.stringify(cache),
	);
	console.log("Done.");
}

//递归遍历目录树
async function buildTree(
	path: string,
	dir: string[],
	main: string,
	bar?: string,
): Promise<Article | Category | null> {
	if (bar === undefined) {
		bar = "";
	}
	const stats = fs.statSync(path);
	if (stats.isFile()) {
		// 判断是否为md文件
		if (!path.endsWith(".md")) {
			return null; // 忽略所有非md文件
		}
		console.log(bar + ">" + path);
		const data = readFileSync(path, "");
		const { meta, content } = await parseArticle(data);
		// 判断是否命中缓存
		let article: Article;
		if (cache[meta.id] !== undefined && cache[meta.id].md5 === md5(data)) {
			article = cache[meta.id].meta;
			article.createTime = new Date(article.createTime);
			article.updateTime = new Date(article.updateTime);
			console.log("Cache hit for " + meta.id);
		} else {
			// 校验 + 自动填充
			if (meta.id === undefined) {
				console.error("Error: id is required in meta");
				process.exit(-1);
			}
			if (meta.summary === undefined) {
				meta.summary = await generateSummary(content);
			}
			if (
				meta.status !== undefined &&
				!["published", "draft", "discard"].includes(meta.status)
			) {
				console.error("Error: status is invalid in meta");
				process.exit(-1);
			}
			article = {
				type: "Article",
				title: Path.basename(path, ".md"),
				id: meta.id,
				createTime:
					meta.createTime === undefined
						? stats.birthtime
						: new Date(meta.createTime),
				updateTime: stats.mtime,
				content: content,
				summary: meta.summary === undefined ? "" : meta.summary,
				key: meta.key === undefined ? [] : meta.key,
				tags: meta.tags === undefined ? [] : meta.tags,
				path: dir,
				background:
					meta.background === undefined
						? "https://pic.caiwen.work/i/2025/01/22/67909e51b8f1c.jpg"
						: meta.background,
				recommend: meta.recommend === undefined ? false : meta.recommend,
				status: meta.status === undefined ? "published" : meta.status,
			};
			// 编译markdown
			const html = await compileMarkdown(content);
			writeFileWithDirsSync(
				Path.join(main, "build", "html", `${meta.id}.html`),
				html,
			);
			// 更新缓存
			cache[meta.id] = {
				meta: article,
				md5: md5(data),
			};
		}
		articleList.push(article);
		return article;
	} else {
		console.log(bar + ">" + path);
		const category: Category = {
			type: "Category",
			title: Path.basename(path),
			count: 0,
			updateTime: stats.mtime,
			subArticle: [],
			subCategory: [],
		};
		for (const item of fs.readdirSync(path)) {
			const target = Path.join(path, item);
			const sub = await buildTree(target, [...dir, item], main, bar + "-");
			if (sub === null) continue;
			if (sub.type === "Article") {
				category.subArticle.push(sub.id);
				category.count++;
			}
			if (sub.type === "Category") {
				category.subCategory.push(sub);
				category.count += sub.count;
			}
			if (sub.updateTime > category.updateTime) {
				category.updateTime = sub.updateTime;
			}
		}
		return category;
	}
}
