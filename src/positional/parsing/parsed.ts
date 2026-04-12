

/**
 * All values of type `T` parsed to `[number, ScaleType]`-tuples.
 * @todo remove in favour of custom parsed interfaces
 */
/* export type Parsed<T> = {
	[K in keyof T]-?: T[K] extends (Scale | undefined)
		? (ParsedScale) : T[K] extends (Padding | undefined)
			? (ParsedPadding) : T[K] extends (number | [number, number] | { index: number; span: number } | undefined)
				? (ParsedSpan) : T[K]
};
 */
