import { Bindable } from "./bindable";


/**
 * The binder helps with binding stores from a viewmodel to a target inside a window.
 */
export interface Binder<TTarget>
{
	/**
	 * Reads the specfied value and writes it to the target. If the value is a store, a binding
	 * will be added. If the target was nameless, an id will be assigned to it. An optional converter
	 * can be supplied if the value is of a different type and to be converted.
	 */
	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: Bindable<V> | undefined, converter?: (value: V) => T[K]): void;
}