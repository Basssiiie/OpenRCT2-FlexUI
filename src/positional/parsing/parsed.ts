import { Padding } from "../padding";
import { Scale } from "../scale";
import { ParsedPadding } from "./parsedPadding";
import { ParsedScale } from "./parsedScale";


/**
 * All values of type `T` parsed to `[number, ScaleType]`-tuples.
 */
export type Parsed<T> =
{
	[K in keyof T]-?: T[K] extends (Scale | undefined)
		? (ParsedScale) : T[K] extends (Padding | undefined)
			? (ParsedPadding) : T[K]
};
