import { Padding, ParsedPadding } from "./padding";
import { ParsedScale, Scale } from "./scale";

/**
 * All values of type `T` parsed to `[number, ScaleType]`-tuples.
 */
export type Parsed<T extends object> =
{
	[K in keyof T]
		: T[K] extends (Scale) ? (ParsedScale)
		: T[K] extends (Scale | undefined) ? (ParsedScale | undefined)
		: T[K] extends (Padding) ? (ParsedPadding)
		: T[K] extends (Padding | undefined) ? (ParsedPadding | undefined)
		: T[K]
};