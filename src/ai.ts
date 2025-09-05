import OpenAI from "openai";

export const generateSummary = async (content: string): Promise<string> => {
	const openai = new OpenAI({
		baseURL: "https://api.deepseek.com",
		apiKey: process.env.DEEPSEEK_TOKEN,
	});
	let res = "";
	while (true) {
		console.log("Generating summary...");
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content:
						"现在你是一个专业的文章摘要生成器，你需要为用户提供一段文章的摘要。请确保摘要简洁明了，涵盖文章的主要内容。字数不应该太多，在50字左右。尽量不要分点叙述，因为这样的话会占用字数。需要是中文。下面给出的内容是文章的markdown格式。",
				},
				{ role: "user", content: content },
			],
			model: "deepseek-chat",
		});
		const summary = completion.choices[0].message.content?.trim();
		if (!summary) {
			console.error("Failed to generate summary, retrying...");
			continue; // Retry if summary is empty
		}
		console.log("Generated summary:", summary);
		console.log("Accept?: (y/n)");
		const userInput = await new Promise<string>((resolve) => {
			process.stdin.once("data", (data) => {
				resolve(data.toString().trim());
			});
		});
		if (userInput.toLowerCase() === "y") {
			res = summary;
			break;
		}
	}
	return res;
};
