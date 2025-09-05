import MarkdownIt from "markdown-it";
// @ts-expect-error 这里这么写没问题
import { Token } from "markdown-it/lib/token";
import sharp from "sharp";
import * as fs from "node:fs";
import * as https from "node:https";
import * as http from "node:http";
import * as tmp from "tmp";

export const AsyncQueue = {
	state: 0,
	queue: [] as string[],
	ok: {} as { [src: string]: { width: number; height: number } },
};

export async function getImageMetaAsync(url: string) {
	try {
		const client = url.startsWith("https") ? https : http;
		const tempFile = tmp.fileSync();
		const _promise = new Promise((resolve, reject) => {
			client.get(url, (res) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const chunks: any[] = [];
				res.on("data", (chunk) => {
					chunks.push(chunk);
				});

				res.on("end", () => {
					const buffer = Buffer.concat(chunks); // 合并所有数据块为一个 Buffer 对象
					fs.writeFile(tempFile.name, buffer, (err) => {
						if (err) {
							reject(err);
						} else {
							resolve("Download complete");
						}
					});
				});

				res.on("error", (err) => {
					reject(err);
				});
			});
		});

		await _promise;
		// 使用 sharp 获取图片尺寸
		const image = sharp(tempFile.name);
		const metadata = await image.metadata();
		console.log("Image dimensions:", metadata.width, "x", metadata.height);
		// 返回图片尺寸
		return {
			width: metadata.width,
			height: metadata.height,
		};
	} catch (error) {
		console.error("Error while downloading or processing image:", error);
	}
}

export default function MarkdownItImageEnhance(md: MarkdownIt) {
	const regex = /^\{[^}]*\}/;
	md.renderer.rules.image = (tokens: Token[], idx: number): string => {
		const token = tokens[idx];

		let src: string = token.attrGet("src").trim();
		// 自动 http 转为 https
		if (src.startsWith("http://")) {
			src = src.replace("http://", "https://");
		}
		//获取图片的宽高
		//由于这里需要异步，和markdownit不兼容，所以采用二次渲染解决方案，第一次渲染时得到所有图片链接
		//然后获取图片的宽高，再次渲染，第二次渲染时直接使用图片的宽高
		let width = 0;
		let height = 0;
		if (AsyncQueue.state === 0) {
			AsyncQueue.queue.push(src);
		} else {
			width = AsyncQueue.ok[src].width;
			height = AsyncQueue.ok[src].height;
		}

		const alt = token.content.trim();
		const match = alt.match(regex);

		let scale: number = 1;
		let title = alt;

		if (match) {
			title = alt.slice(match[0].length).trim();
			const configs = match[0]
				.replace(/^\{/, "")
				.replace(/\}$/, "")
				.split(",")
				.map((item: string) => {
					const kv = item.split(":");
					if (kv.length !== 2) {
						return;
					}
					const [key, value] = kv;
					return { key: key.trim(), value: value.trim() };
				});
			for (const config of configs) {
				if (config.key === "scale") {
					scale = parseFloat(config.value);
				}
			}
		}

		let info;

		if (width <= 0 || height <= 0) {
			info = "";
		} else {
			info = "width=" + width + " height=" + height;
		}

		title = title === "" ? "" : `<div class="img-title">${title}</div>`;

		//故意拼错，直接使用data-src可能会与其他的什么东西发生冲突
		return `<div class="img-box"><img class="lazy" date-src="${src}" style="transform: scale(${scale})" ${info}>${title}</div>`;
	};
}
