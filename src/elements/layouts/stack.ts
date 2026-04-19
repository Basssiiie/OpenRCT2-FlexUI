import { isAbsolute, isPercentile, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";

/**
 *  A parsed stack of widget elements.
 */
export interface ParsedStack
{
	_requestedPixels: number;
	_requestedPercentile: number;
	_requestedWeightTotal: number;
	_visibleElementsCount: number;
}

/**
 * Adds the specified scale to the stack's weighted total or absolute space,
 * depending on whether it's a weighted or absolute scale.
 */
export function addScaleToStack(stack: ParsedStack, scale: ParsedScale, multiplier: number): void
{
	const value = (scale[0] * multiplier);
	if (isWeighted(scale))
	{
		stack._requestedWeightTotal += value;
	}
	else if (isAbsolute(scale))
	{
		stack._requestedPixels += value;
	}
	else if (isPercentile(scale))
	{
		stack._requestedPercentile += value;
	}
}
