/**
 * Gets index of the first matching item. Returns null if no items match the predicate.
 * @param array The array to check.
 * @param predicate The function to match the items against.
 */
export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number | null
{
	for (let i = 0, e = array.length; i < e; i++)
	{
		if (predicate(array[i]))
		{
			return i;
		}
	}
	return null;
}


/**
 * Gets the first matching item. Returns null if no items match the predicate.
 * @param array The array to check.
 * @param predicate The function to match the items against.
 */
export function find<T>(array: T[], predicate: (item: T) => boolean): T | null
{
	const idx = findIndex(array, predicate);
	return (idx === null) ? null : array[idx];
}