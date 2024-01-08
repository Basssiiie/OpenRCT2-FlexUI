import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Parsed } from "@src/positional/parsing/parsed";
import { isWeighted } from "@src/positional/parsing/parsedScale";
import { Rectangle } from "@src/positional/rectangle";
import { Layoutable } from "@src/windows/layoutable";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { AbsolutePosition } from "./absolutePosition";


/**
 * Lay out all elements over at absolute positions relative to the parent area, then calls apply for each element.
 */
export function absoluteLayout(elements: Layoutable<Parsed<AbsolutePosition>>[], parentArea: Rectangle, widgetMap: WidgetMap): void
{
	const elementCount = elements.length;
	const leftoverWidth = parentArea.width;
	const leftoverHeight = parentArea.height;
	const parsedElements = Array<Parsed<AbsolutePosition>>(elementCount);

	// First pass: collect and parse positional data
	let weightedTotalWidth = 0, weightedTotalHeight = 0;
	for (let i = 0; i < elementCount; i++)
	{
		const element = elements[i];
		if (element.skip)
			continue;

		const position = element.position, { width, height } = position;
		if (isWeighted(width))
		{
			weightedTotalWidth += width[0];
		}
		if (isWeighted(height))
		{
			weightedTotalHeight += height[0];
		}
		parsedElements[i] = position;
	}

	// Second pass: calculate position and apply it
	const rect = <Rectangle>{}; // Reuse the rect for every element to reduce allocation.
	for (let i = 0; i < elementCount; i++)
	{
		const element = parsedElements[i];

		rect.x = (parentArea.x + convertToPixels(element.x, leftoverWidth, weightedTotalWidth, 0));
		rect.y = (parentArea.y + convertToPixels(element.y, leftoverHeight, weightedTotalHeight, 0));
		rect.width = convertToPixels(element.width, leftoverWidth, weightedTotalWidth, 0);
		rect.height = convertToPixels(element.height, leftoverHeight, weightedTotalHeight, 0);

		elements[i].layout(widgetMap, rect);
	}
}
