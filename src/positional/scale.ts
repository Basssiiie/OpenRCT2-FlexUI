import { isNumber, isUndefined } from "@src/utilities/type";

/**
 * Specifies the scale of a specific property. The value can be either a string or a
 * number. String values can be either pixels, percentages, weighted values or 'inherit'.
 *  - **Pixels:** absolute position or size, like standard widgets;
 *  - **Percentages:** position or size relative to the leftover space within the parent;
 *  - **Weighted:** position or size relative to the total weight of all weighted elements
 *    within the parent, applied to the leftover space within the parent.
 *  - **Inherit**: inherits the value for this field from the parent element.
 *
 * **Leftover space** is all space within the parent after subtracting any absolute sized
 * widgets within the parent.
 *
 * **Example usage:**
 *  * `var absolute = "50px";`
 *     - Always 50 pixels regardless of parent size.
 *  * `var percentage = "20%";`
 *     - If the parent has no absolute sized widgets: (150 * 0.2) = 30 pixels;
 *     - If the parent has another widget with the absolute size of "50px": the
 *       leftover space is (150 - 50) = 100 pixels, and the size of the percentage
 *       sized widget is then (100 * 0.2) = 20 pixels.
 *  * `var weighted = "1w";`
 *     - If this is the only widget within the parent: 150 pixels;
 *     - If the parent has one other widget sized at "50px": 100 pixels; which is 100%
 *       of the leftover space.
 *     - If the parent has 2 widgets sized at "1w" and 1 widget at "30px": both
 *       weighted widgets will get 50% each of the leftover space, which is
 *       ((150 - 30px) * (1w / 2w)) = 60 pixels. The 2 here is the total weight over
 *       all the weighted elements within the parent.
 *  * `var number = 10;`
 *     - Number values are always interpreted as absolute pixel values.
 */
export type Scale = number | `${number}%` | `${number}w` | `${number}px`;


/**
 * Specifies the type of scaling used in a specified scale.
 */
export const enum ScaleType
{
	Pixel = 0,
	Percentage = 1,
	Weight = 2
}


/**
 * A scale value split into the hard number and its type.
 */
export type ParsedScale = [number, ScaleType];


/**
 * Parses an user-defined scale (either string or number) to a tuple of scale value and type.
 */
export function parseScale(value: Scale | undefined, fallback: number = 0, fallbackType: ScaleType = ScaleType.Pixel): ParsedScale
{
	if (isUndefined(value))
	{
		return [fallback, fallbackType];
	}

	// Number = weighted value.
	if (isNumber(value))
	{
		return [value, ScaleType.Pixel];
	}

	const trimmed = value.trim();
	const length = trimmed.length;

	if (length > 1)
	{
		let endIdx: number = (length - 1);
		let type: ScaleType | undefined;
		const last = trimmed[endIdx];

		if (last === "w")
		{
			type = ScaleType.Weight;
		}
		else if (last === "%")
		{
			type = ScaleType.Percentage;
		}
		else if (length > 2)
		{
			endIdx = (length - 2);
			if (last === "x" && trimmed[endIdx] === "p")
			{
				type = ScaleType.Pixel;
			}
		}

		if (!isUndefined(type))
		{
			const num = Number.parseInt(trimmed.substring(0, endIdx));
			return [num, type];
		}
	}

	throw new Error(`Value '${value}' is not a valid scale.`);
}


/**
 * Calculates the pixel scale using the leftover space and weighted total if necessary.
 */
export function convertToPixels(scale: ParsedScale, leftoverSpace: number, weightedTotal?: number): number
{
	switch (scale[1])
	{
		case ScaleType.Pixel:
			return scale[0];

		case ScaleType.Weight:
			return (isUndefined(weightedTotal))
				? leftoverSpace
				: Math.round((scale[0] / weightedTotal) * leftoverSpace);

		case ScaleType.Percentage:
			return Math.round((scale[0] * 0.01) * leftoverSpace);
	}
}