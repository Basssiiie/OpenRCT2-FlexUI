import { slice } from "@src/utilities/array";
import { store } from "./createStore";
import { Store } from "./store";
import { subscribe } from "./subscribe";
import { WritableStore } from "./writableStore";


/**
 * Creates a new store that subscribes itself to all specified parent stores through a
 * one-way binding. If one of the parent stores dispatches an update, the new store
 * recomputes itself automatically and will notify its subscribers of the change.
 */
export function compute<T, U>(store: Store<T>, callback: (value: T) => U): WritableStore<U>;
export function compute<T1, T2, U>(first: Store<T1>, second: Store<T2>, callback: (first: T1, second: T2) => U): WritableStore<U>;
export function compute<T1, T2, T3, U>(first: Store<T1>, second: Store<T2>, third: Store<T3>, callback: (first: T1, second: T2, third: T3) => U): WritableStore<U>;
export function compute<T1, T2, T3, T4, U>(first: Store<T1>, second: Store<T2>, third: Store<T3>, fourth: Store<T4>, callback: (first: T1, second: T2, third: T3, fourth: T4) => U): WritableStore<U>;
export function compute<T1, T2, T3, T4, T5, U>(first: Store<T1>, second: Store<T2>, third: Store<T3>, fourth: Store<T4>, fifth: Store<T5>, callback: (first: T1, second: T2, third: T3, fourth: T4, fifth: T5) => U): WritableStore<U>;
export function compute<U>(): Store<U>
{
	// Optimized for ES5 minification
	// eslint-disable-next-line prefer-rest-params
	const args = arguments;
	const stores = slice.call(args, 0, -1);
	const storeCount = stores.length;
	const callback = args[storeCount];
	const dependant = store(getComputedValue<U>(stores, callback));
	let idx = 0;

	while (idx < storeCount)
	{
		subscribe(stores[idx++], () =>
		{
			const newComputedValue = getComputedValue<U>(stores, callback);
			return dependant.set(newComputedValue);
		});
	}
	return dependant;
}


/**
 * Calculates a new computed value from all the specified stores.
 */
function getComputedValue<U>(stores: Store<unknown>[], callback: (...values: unknown[]) => U): U
{
	const values = stores.map(s => s.get());
	return callback(...values);
}
