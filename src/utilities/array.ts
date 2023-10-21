/**
 * Returns a copy of a section of an array.
 * For both start and end, a negative index can be used to indicate an offset from the end of the array.
 * For example, -2 refers to the second to last element of the array.
 * @param start The beginning index of the specified portion of the array.
 * If start is undefined, then the slice begins at index 0.
 * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'.
 * If end is undefined, then the slice extends to the end of the array.
 */
export const slice = Array.prototype.slice;

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


/**
 * Returns a copy of a section of an array.
 */
/* export function slice<T>(array: ArrayLike<T>, start: number, end?: number): T[]
{
	end ||= array.length;

	const result = Array<T>(end - start);
	let idx = start;

	for (; idx < end; idx++)
	{
		result[idx - start] = array[idx];
	}

	return result;
}
 */
