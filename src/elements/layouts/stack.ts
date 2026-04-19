import { isAbsolute, isPercentile, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";


// todo: re-review this file with grid.ts


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


export function createStack(size: number, spacing: ParsedScale): ParsedStack
{
	const stack = {
		_requestedPixels: 0,
		_requestedPercentile: 0,
		_requestedWeightTotal: 0
	};

	// Parse spacing in between elements
	addScaleToStack(stack, spacing, (size - 1));

	return stack;
}

export function resetStack(stack: ParsedStack, size: number, spacing: ParsedScale): void
{
	stack._requestedPixels = 0;
	stack._requestedPercentile = 0;
	stack._requestedWeightTotal = 0;

	// Parse spacing in between elements
	addScaleToStack(stack, spacing, (size - 1));
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
