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
	 * @param target The main object to bind to.
	 * @param key The key on the main object, or nested object, to mutate when a binding updates.
	 * @param value A store that can be monitored for changes, or a constant that will be applied immediately.
	 * @param converter If the value is of a different type and needs to be converted, it can be optionaly supplied here.
	 * @param nested If the property to mutate is not on the root object, a function to retrieve a nested object can be specified optionally.
	 */
	add<T extends TTarget, N, K extends keyof N, V>(target: T, key: K, value: Bindable<V> | undefined, converter?: (value: V) => N[K], nested?: (target: T) => N): void;
	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: Bindable<V> | undefined, converter?: (value: V) => T[K]): void;
	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: Bindable<V> | undefined): void;
}