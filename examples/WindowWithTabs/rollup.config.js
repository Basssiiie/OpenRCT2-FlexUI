import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";


/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
	input: "./index.ts",
	output: {
		file: "../dist/FUI-WindowWithTabs.js",
		format: "iife",
	},
	plugins: [
		resolve(),
		typescript()
	]
};
export default config;