import { isUndefined, isArray, isObject } from "@src/utilities/type";
import { ParsedScale, parseScaleOrZero, Scale } from "./scale";


/**
 * Specifies the padding to use on each of the four sides of a rectangle area.
 */
export type Padding = Scale
	/* vertical | horizontal */
	| [Scale, Scale]
	/* top | right | bottom | left */
	| [Scale, Scale, Scale, Scale]
	| { top?: Scale; right?: Scale; bottom?: Scale; left?: Scale };


/**
 * Applies to areas that can have a padding.
 */
export interface Paddable
{
	/**
	 * Specify the size of the padding around this widget. For allowed values, see {@link Scale}.
	 *
	 * **Example usage:**
	 *  * `padding: "5px"` - applies same padding (5 pixels) to all 4 sides.
	 *  * `padding: [ 5, "10%" ]` - applies 5 pixels to vertical sides, 10% to horizontal sides.
	 *  * `padding: [ 2, "3w", 4, "5%" ]` - applies in clockwise order; top, right, bottom, left.
	 *  * `padding: { top: 15 }` - applies only to named sides, the rest is default.
	 *
	 * @default "5px" for boxes and window frame, 0 for everything else.
	 */
	padding?: Padding;
}


/**
 * Object that contains the parsed padding values.
 */
export interface ParsedPadding
{
	top?: ParsedScale;
	right?: ParsedScale;
	bottom?: ParsedScale;
	left?: ParsedScale;
}


/**
 * Parses the padding to usable tuples of parsed scales.
 */
export function parsePadding(padding: Padding): ParsedPadding;
export function parsePadding(padding: Padding | undefined): ParsedPadding | undefined;
export function parsePadding(padding: Padding | undefined): ParsedPadding | undefined
{
	let returnValue: ParsedPadding | undefined;
	if (isUndefined(padding))
	{
		// padding not specified, apply no padding.
		returnValue = padding;
	}
	else if (isArray(padding))
	{
		// padding specified as 2 or 4 item tuple.
		const length = padding.length;
		if (length === 2)
		{
			const vertical = parseScaleOrZero(padding[0]);
			const horizontal = parseScaleOrZero(padding[1]);
			returnValue = createParsed(vertical, horizontal, vertical, horizontal);
		}
		else if (length === 4)
		{
			returnValue = createParsed(
				parseScaleOrZero(padding[0]),
				parseScaleOrZero(padding[1]),
				parseScaleOrZero(padding[2]),
				parseScaleOrZero(padding[3])
			);
		}
		else
			throw new Error(`Padding array of unknown length: ${length}. Only lengths of 2 or 4 are supported.`);
	}
	else if (isObject(padding))
	{
		// padding specified as object
		returnValue = createParsed(
			parseScaleOrZero(padding.top),
			parseScaleOrZero(padding.right),
			parseScaleOrZero(padding.bottom),
			parseScaleOrZero(padding.left)
		);
	}
	else
	{
		// padding specified as number or string
		const value = parseScaleOrZero(padding);
		returnValue = createParsed(value, value, value, value);
	}
	return returnValue;
}


/**
 * Create a parsed padding object.
 */
function createParsed(top: ParsedScale, right: ParsedScale, bottom: ParsedScale, left: ParsedScale): ParsedPadding
{
	return { top, right, bottom, left };
}