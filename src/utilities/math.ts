/**
 * Clamps the specified value in a range from 'minimum' to 'maximum'.
 * @param value The specified value.
 * @param minimum The minimum amount of the range (inclusive).
 * @param maximum The maximum amount of the range (inclusive).
 */
export function clamp(value: number, minimum: number, maximum: number): number
{
	if (value < minimum)
	{
		value = minimum;
	}
	else if (value > maximum)
	{
		value = maximum;
	}
	return value;
}


/**
 * Wraps the specified value in a range from 'minimum' to 'maximum'. When the
 * value is larger than the maximum, it is set to the minimum, and vice versa.
 * @param value The specified value.
 * @param minimum The minimum amount of the range (inclusive).
 * @param maximum The maximum amount of the range (inclusive).
 */
export function wrap(value: number, minimum: number, maximum: number): number
{
	if (value < minimum)
	{
		value = maximum;
	}
	else if (value > maximum)
	{
		value = minimum;
	}
	return value;
}


/**
 * Shortcut for `Math.round()`.
 * @see {@link Math.round}
 */
export const round = Math.round;