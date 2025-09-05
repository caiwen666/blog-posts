// eslint.config.mjs

import path from "path";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
	{
		languageOptions: {
			globals: {
				...globals.node, // Node.js 全局变量（如 process, __dirname）
				...globals.es2021, // ES2021 全局变量（如 AggregateError, FinalizationRegistry）
			},
			ecmaVersion: 2021, // 或直接写 2021
			sourceType: "module", // 如果使用 ES Modules
			parser: typescriptEslintParser,
		},
		plugins: {
			"@typescript-eslint": typescriptEslint,
		},
		rules: {
			"no-console": "off",
			"no-unused-vars": "error",
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/ban-ts-comment": "off",
		},
		settings: {
			"import/resolver": {
				node: {
					paths: [path.resolve("./src")], // 配置模块解析的路径
				},
			},
		},
	},
	{ files: ["./src/**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
];
