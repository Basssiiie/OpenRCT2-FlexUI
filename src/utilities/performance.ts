import * as Environment from "./environment";


/**
 * Allows acces to the exposed performance timing api.
 */
declare const performance: Performance;

/**
 * Allows acces to the exposed performance timing api.
 */
interface Performance
{
	/**
	 * Gets the monotonic time in milliseconds, including fractions.
	 */
	now(): number;
}

/**
 * Returns the current time on milliseconds, including fractions. Useful for performance timing.
 */
export function time(): number
{
	if (Environment.isDevelopment)
	{
		return performance.now();
	}
	return 0;
}
