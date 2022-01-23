import { DefaultStore } from "./defaultStore";
import { Store } from "./store";


/**
 * Creates a new store that subscribes itself to all specifide parent stores through a
 * one-way binding. If one of the parent stores dispatches an update, the new store
 * recomputes itself automatically and will notify its subscribers of the change.
 */
export function compute<T, U>(store: Store<T>, callback: (value: T) => U): Store<U>;
export function compute<T1, T2, U>(first: Store<T1>, second: Store<T2>, callback: (first: T1, second: T2) => U): Store<U>;
export function compute<T1, T2, T3, U>(first: Store<T1>, second: Store<T2>, third: Store<T3>, callback: (first: T1, second: T2, third: T3) => U): Store<U>;
export function compute<T1, T2, T3, T4, U>(first: Store<T1>, second: Store<T2>, third: Store<T3>, fourth: Store<T4>, callback: (first: T1, second: T2, third: T3, fourth: T4) => U): Store<U>;
export function compute<T1, T2, T3, T4, T5, U>(first: Store<T1>, second: Store<T2>, third: Store<T3>, fourth: Store<T4>, fifth: Store<T5>, callback: (first: T1, second: T2, third: T3, fourth: T4, fifth: T5) => U): Store<U>;
export function compute<U>(...args: [...Store<unknown>[], ((...values: unknown[]) => U)]): Store<U>
{
	const stores = <Store<unknown>[]>args.slice(0, -1);
	const storeCount = stores.length;

	const callback = <(...values: unknown[]) => U>args[storeCount];
	const dependant = new DefaultStore(getComputedValue(stores, callback));

	for (let i = 0; i < storeCount; i++)
	{
		stores[i].subscribe(() =>
		{
			const newComputedValue = getComputedValue(stores, callback);
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