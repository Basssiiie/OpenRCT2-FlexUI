import { slice } from "@src/utilities/array";
import { compute } from "./compute";
import { Store } from "./store";


/**
 * Create a formatted string that subscribes itself to all specified parent stores
 * through a one-way binding. If one of the parent stores dispatches an update, the
 * store with the formatted string reformats itself automatically and will notify
 * its subscribers of the string.
 *
 * Tip: Stores work best if you only use them for binding a model to your user
 * interface, and nowhere else.
 *
 * This utility store uses OpenRCT2's `context.formatString()` under the hood, and
 * thus supports the same tokens, for example:
 *  * Numbers: `{COMMA32}`, `{INT32}`, `COMMA2DP32`
 *  * Strings: `{STRING}`
 *  * Localised strings: `{STRINGID}`
 *  * Localised currency: `{CURRENCY}`, `{CURRENCY2DP}`
 *  * Localised in-game dates: `{MONTH}`, `{MONTHYEAR}`, `{REALTIME}`, `{DURATION}`
 *  * Localised ride metrics: `{LENGTH}`, `{VELOCITY}`
 *  * Inline sprites: `{SPRITE}`, `{INLINE_SPRITE}`
 *  * Colours: `{RED}`, `{YELLOW}`, `{WINDOW_COLOUR_1}`
 *  * Font sizes: `{MEDIUMFONT}`, `{SMALLFONT}`, `{TINYFONT}`
 *
 * @see {@link https://github.com/OpenRCT2/OpenRCT2/blob/develop/src/openrct2/localisation/FormatCodes.cpp#L20-L64 | All available format tokens for OpenRCT2}
 * @see {@link https://github.com/OpenRCT2/OpenRCT2/blob/develop/data/language/en-GB.txt | Examples in OpenRCT2's language file}
 */
export function format<T>(format: string, store: Store<T>): Store<string>;
export function format<T1, T2>(format: string, first: Store<T1>, second: Store<T2>): Store<string>;
export function format<T1, T2, T3>(format: string, first: Store<T1>, second: Store<T2>, third: Store<T3>): Store<string>;
export function format<T1, T2, T3, T4>(format: string, first: Store<T1>, second: Store<T2>, third: Store<T3>, fourth: Store<T4>): Store<string>;
export function format<T1, T2, T3, T4, T5>(format: string, first: Store<T1>, second: Store<T2>, third: Store<T3>, fourth: Store<T4>, fifth: Store<T5>): Store<string>;
export function format(format: string): Store<string>
{
	// Optimized for ES5 minification
	// eslint-disable-next-line prefer-rest-params
	const args = arguments;
	const storesAndCallback = slice.call(args, 1);
	const length = storesAndCallback.length;

	// Insert formatting callback at end of parameters.
	storesAndCallback[length] = function(): string
	{
		// eslint-disable-next-line prefer-rest-params
		const values = <[string, ...unknown[]]>slice.call(arguments);
		values.unshift(format);
		// eslint-disable-next-line prefer-spread
		return context.formatString.apply(context, values);
	};
	// eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any
	return compute.apply<undefined, any[], Store<string>>(undefined, storesAndCallback);
}
