import { defaultScale, zeroPadding } from "@src/elements/constants";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { parseScaleOrFallback } from "@src/positional/parsing/parseScale";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { FlexiblePosition } from "./flexiblePosition";


/**
 * Parses the properties used in a flexible layout.
 */
export function parseFlexiblePosition(desired: FlexiblePosition, fallbackPadding?: ParsedPadding): Parsed<FlexiblePosition>
{
	return {
		width: parseScaleOrFallback(desired.width, defaultScale),
		height: parseScaleOrFallback(desired.height, defaultScale),
		padding: parsePadding(desired.padding, fallbackPadding || zeroPadding),
	};
}
