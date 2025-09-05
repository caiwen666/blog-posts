import hljs from "highlight.js";
import MarkdownItFootnote from "markdown-it-footnote";
import MarkdownItContainer from "markdown-it-container";
import MarkdownItImageEnhance, {
	AsyncQueue,
	getImageMetaAsync,
} from "./plugin/MarkdownItImageEnhance.js";
import MarkdownItAnchor from "markdown-it-anchor";
import MarkdownItKatex from "@vscode/markdown-it-katex";
import slugify from "@sindresorhus/slugify";
import pinyin from "pinyin";

import markdownit from "markdown-it";

const md: markdownit = markdownit({
	html: true,
	linkify: true,
	highlight: function (str: string, lang: string) {
		let formattedCode;
		let language;
		if (lang && hljs.getLanguage(lang)) {
			formattedCode = hljs.highlight(str, {
				language: lang,
				ignoreIllegals: true,
			}).value;
			language = lang;
		} else {
			formattedCode = md.utils.escapeHtml(str);
			language = "Unknown";
		}

		const codeLines = str.split("\n");
		let lineDivs = "";
		codeLines.forEach((_, index) => {
			if (_ === "" && index === codeLines.length - 1) return;
			lineDivs += `<div>${index + 1}</div>`;
		});

		return `<pre><div class="head"><div class="language">${language}</div><div class="copy" data="${btoa(encodeURIComponent(str))}"><svg focusable="false" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"></path></svg></div></div><code class="hljs"><div class="lines">${lineDivs}</div><div class="code">${formattedCode}</div></code></pre>`;
	},
})
	.use(MarkdownItFootnote)
	.use(MarkdownItContainer, "alert", {
		validate: function (params: string) {
			const alertTypes = ["info", "success", "warn", "error"];
			return alertTypes.includes(params.trim().split(" ", 1)[0]);
		},

		render: function (
			tokens: {
				[x: number]: { nesting: number; info: string; markup: string };
			},
			idx: number,
		) {
			type IconsKeys = "success" | "info" | "warn" | "error";
			type Icons = { [key in IconsKeys]: string };
			const icons: Icons = {
				success:
					"M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z",
				info: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z",
				warn: "M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z",
				error:
					"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
			};
			if (tokens[idx].nesting === 1) {
				// opening tag
				const headStr = tokens[idx].info.trim();
				const type = headStr.split(" ", 1)[0] as IconsKeys;
				const title = headStr.slice(type.length);
				return `<div class="alert alert-${type}"><div class="icon"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="${icons[type]}"></path></svg></div><div class="message"><div class="title">${title}</div>`;
			} else {
				// closing tag
				return "</div></div>\n";
			}
		},
	})
	.use(MarkdownItImageEnhance)
	.use(MarkdownItAnchor, {
		level: 2,
		slugify: (s: string) => {
			return slugify(
				// @ts-expect-error 这里必须用default和ts-ignore，ts的推断是错误的
				pinyin.default(s, { style: pinyin.STYLE_NORMAL }).join(" "),
			);
		},
	})
	// @ts-expect-error 这里也必须要用 default
	.use(MarkdownItKatex.default, {
		throwOnError: false,
		errorColor: " #cc0000",
	});

export async function compileMarkdown(content: string): Promise<string> {
	AsyncQueue.queue = [];
	AsyncQueue.state = 0;
	AsyncQueue.ok = {};
	md.render(content);
	for (const src of AsyncQueue.queue) {
		const meta = await getImageMetaAsync(src);
		if (
			meta === undefined ||
			meta.height === undefined ||
			meta.width === undefined
		) {
			AsyncQueue.ok[src] = { height: -1, width: -1 };
		} else {
			AsyncQueue.ok[src] = { height: meta.height, width: meta.width };
		}
	}
	AsyncQueue.state = 1;
	const html = md.render(content);
	return html;
}
