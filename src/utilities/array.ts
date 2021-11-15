/**
 * Gets the first matching item. Returns null if no items match the predicate.
 * @param array The array to check.
 * @param predicate The function to match the items against.
 */
export function find<T>(array: T[], predicate: (item: T) => boolean): T | null
{
	for (let i = 0; i < array.length; i++)
	{
		const item = array[i];
		if (predicate(item))
		{
			return item;
		}
	}
	return null;
}