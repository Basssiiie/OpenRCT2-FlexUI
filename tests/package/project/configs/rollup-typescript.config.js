import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";


/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
	input: "./index.ts",
	output: {
		file: process.env.OUTPUT || Error("No output path specified"),
		format: "iife"
	},
	plugins: [
		resolve(),
		typescript()
	],
	treeshake: "smallest"
};
export default config;