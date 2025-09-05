import "dotenv/config";
import Path from "path";
import { build } from "./build.js";
import { exit } from "process";

const usage = "Usage: node index.js <path> { all | target <target> }";

const argv = process.argv;

if (argv.length < 4) {
	console.error(usage);
	process.exit(1);
}

const cwd = Path.join(process.cwd(), argv[2]);

const option = argv[3];
if (option === "all") {
	build(cwd).then(() => {
		exit(0);
	});
} else if (option === "target") {
	const target = argv[4];
	if (target === undefined) {
		console.error(usage);
		process.exit(1);
	}
	build(cwd, target).then(() => {
		exit(0);
	});
} else {
	console.error(usage);
	process.exit(1);
}
