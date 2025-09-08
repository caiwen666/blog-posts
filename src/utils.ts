import { Article } from "@/entity";
import * as Fs from "node:fs";
import Path from "path";
import crypto from "node:crypto";

/**
 * 解析文章文件，返回文章的元数据和内容
 * @param data 文件内容
 * @returns 包含文章元数据和内容的对象
 */
export const parseArticle = async (
	data: string,
): Promise<{ meta: Article; content: string }> => {
	let meta = "";
	let content = "";
	let flag = 0;
	const lines = data.split("\n"); // 按行拆分
	lines.forEach((line) => {
		if (flag === -1) {
			content += line + "\n";
		}
		if (flag === 2) {
			if (line.trim() === "```") {
				flag = -1;
			} else {
				meta += line + "\n";
			}
		}
		if (flag === 1) {
			if (line.trim() === "```json") {
				flag = 2;
			}
		}
		if (flag === 0) {
			if (line.trim() === "@meta") {
				flag = 1;
			} else {
				flag = -1;
				content += line + "\n";
			}
		}
	});
	const metaObj = JSON.parse(meta);
	const keys = [
		"id",
		"createTime",
		"key",
		"tags",
		"background",
		"recommend",
		"status",
	];
	for (const i in metaObj.keys) {
		if (!keys.includes(i)) {
			console.log("Invalid meta key: " + i);
			process.exit(-1);
		}
	}
	return { meta: metaObj as Article, content };
};

export const readFileSync = (path: string, defaultv: string): string => {
	if (Fs.existsSync(path)) {
		return Fs.readFileSync(path, "utf-8");
	} else {
		return defaultv;
	}
};

export const writeFileWithDirsSync = (filePath: string, data: string) => {
	try {
		// 获取文件所在目录
		const dir = Path.dirname(filePath);
		// 确保目录存在，递归创建目录
		Fs.mkdirSync(dir, { recursive: true });
		// 写入文件，文件不存在则创建，存在则覆盖
		Fs.writeFileSync(filePath, data);
	} catch (error) {
		console.error("Error writing file:", error);
	}
};

export const md5 = (text: string): string => {
	const hash = crypto.createHash("md5");
	hash.update(text, "utf-8");
	return hash.digest("hex");
};
