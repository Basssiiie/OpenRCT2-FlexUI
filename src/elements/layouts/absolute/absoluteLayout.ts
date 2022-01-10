import { isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels, parseScaleOrZero } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { AbsolutePosition } from "./absolutePosition";


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
		const x = parseScaleOrZero(element.x);
		const y = parseScaleOrZero(element.y);
		const width = parseScaleOrZero(element.width);
		const height = parseScaleOrZero(element.height);

		if (isWeighted(width))
		{
			weightedTotalWidth += width[0];
		}
		if (isWeighted(height))
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