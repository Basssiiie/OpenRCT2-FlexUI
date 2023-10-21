import { Store } from "./store";


/**
 * A store for arrays that can be modified without replacing the entire array.
 */
export interface ArrayStore<T> extends Store<T[]>
{
	/**
	 * Updates the current value to a new one.
	 * Notifies all listeners with the updated array.
	 * @param value The new value.
	 */
	set(array: T[]): void;

	/**
	 * Updates the element at the specified index and returns the value it replaced.
	 * Notifies all listeners with the updated array.
	 */
	set(index: number, item: T): void;

	/**
	 * Inserts one or more elements into the array at the specified index, and returns its new length.
	 * Notifies all listeners with the updated array.
	 */
	insert(index: number, ...items: T[]): number;

	/**
	 * Sets the length of the array to the specified value.
	 * Notifies all listeners with the updated array.
	 */
	resize(length: number): void;

	/**
	 * Appends the new elements to the end of the array and returns its new length.
	 * Notifies all listeners with the updated array.
	 */
	push(...items: T[]): number;

	/**
	 * Removes the last element from the array and returns it.
	 * Notifies all listeners with the updated array.
	 */
	pop(): T | undefined;

	/**
	 * Inserts new elements at the start of the array and returns its new length.
	 * Notifies all listeners with the updated array.
	 */
	unshift(...items: T[]): number;

	/**
	 * Removes the first element from the array and returns it.
	 * Notifies all listeners with the updated array.
	 */
	shift(): T | undefined;

	/**
	 * Removes one or more element at the specified index and returns it. If specified,
	 * any new items will also be inserted at the specified index.
	 * Notifies all listeners with the updated array.
	 */
	splice(start: number, deleteCount?: number): T[];
	splice(start: number, deleteCount: number, ...items: T[]): T[];

	/**
	 * Reorders all items in the array according to the comparison function if specified,
	 * or otherwise in ASCII character order.
	 * Notifies all listeners with the updated array.
	 */
	sort(compareFn?: (a: T, b: T) => number): void;
}
