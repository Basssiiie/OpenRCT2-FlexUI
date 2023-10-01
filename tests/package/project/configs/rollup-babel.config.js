import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";


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
		babel({
			babelrc: false,
			babelHelpers: "bundled",
			presets: [
				"@babel/preset-env",
				["@babel/preset-typescript", { optimizeConstEnums: true }]
			]
		})
	],
	treeshake: "smallest"
};
export default config;
