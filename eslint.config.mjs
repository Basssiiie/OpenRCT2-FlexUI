import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 5,
				projectService: true,
			}
		},
		rules: {
			"@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "angle-bracket" }],
			"@typescript-eslint/prefer-includes": "off", // not in es5
			"@typescript-eslint/prefer-nullish-coalescing": "off", // verbose in es5
			"@typescript-eslint/prefer-optional-chain": "off", // verbose in es5
    		"@typescript-eslint/no-inferrable-types": "warn",
			"@typescript-eslint/no-unnecessary-condition": "warn",
			"@typescript-eslint/no-unsafe-enum-comparison": "off", // enums are only used as labelled numbers
			"@typescript-eslint/restrict-template-expressions": ["warn", { allowArray: true, allowBoolean: true, allowNullish: true, allowNumber: true }],
    		"@typescript-eslint/triple-slash-reference": "off", // needed for openrct2 symbols
		}
	},
	{
		ignores: [
			"**/dist/**",
			"**/lib/**",
			"**/tests/**",
			"**/rollup.config.js",
			"eslint.config.mjs"
		]
	}
);
