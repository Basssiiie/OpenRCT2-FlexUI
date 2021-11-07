import { AbsolutePosition } from "@src/positional/absolutePosition";
import { Rectangle } from "@src/positional/rectangle";
import { convertToPixels, ParsedScale, parseScale, ScaleType } from "@src/positional/scale";


/**
 * Lay out all elements over at absolute positions relative to the parent area, then calls apply for each element.
 */
export function absoluteLayout(elements: AbsolutePosition[], parentArea: Rectangle, apply: (index: number, childArea: Rectangle) => void): void
{
	const elementCount = elements.length;
	const leftoverWidth = parentArea.width;
	const leftoverHeight = parentArea.height;
	const parsedElements = Array<ParsedAbsoluteElement>(elementCount);

	// First pass: collect and parse positional data
	let weightedTotalWidth = 0, weightedTotalHeight = 0;
	for (let i = 0; i < elementCount; i++)
	{
		const element = elements[i];
		const x = parseScale(element.x);
		const y = parseScale(element.y);
		const width = parseScale(element.width);
		const height = parseScale(element.height);

		if (width[1] === ScaleType.Weight)
		{
			weightedTotalWidth += width[0];
		}
		if (height[1] === ScaleType.Weight)
		{
			weightedTotalHeight += height[0];
		}

		const parsed: ParsedAbsoluteElement = { x, y, width, height };
		parsedElements[i] = parsed;
	}

	// Second pass: calculate position and apply it
	for (let i = 0; i < elementCount; i++)
	{
		// (Reuse the same already allocated object...)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const element = <Record<keyof Rectangle, any>>parsedElements[i];
		element.x = (parentArea.x + convertToPixels(element.x, leftoverWidth, weightedTotalWidth));
		element.y = (parentArea.y + convertToPixels(element.y, leftoverHeight, weightedTotalHeight));
		element.width = convertToPixels(element.width, leftoverWidth, weightedTotalWidth);
		element.height = convertToPixels(element.height, leftoverHeight, weightedTotalHeight);

		apply(i, <Rectangle>element);
	}
}


interface ParsedAbsoluteElement
{
	x: ParsedScale;
	y: ParsedScale;
	width: ParsedScale;
	height: ParsedScale;
}