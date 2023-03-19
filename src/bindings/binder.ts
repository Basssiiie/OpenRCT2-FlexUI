import { AnyBindable } from "./anyBindable";
import { TwoWayBindable } from "./twoway/twowayBindable";


/**
 * The binder helps with binding stores from a viewmodel to a target inside a window.
 */
export interface Binder<TTarget>
{
	/**
	 * Reads the specified value and writes it to the target. If the value is a store, a one-way
	 * binding will be added. If the target was nameless, an id will be assigned to it. An optional
	 * converter can be supplied if the value is of a different type and to be converted.
	 * @param target The main object to bind to.
	 * @param key The key on the main object to mutate when a binding updates.
	 * @param value A store that can be monitored for changes, or a constant that will be applied immediately.
	 * @param converter If the value is of a different type and needs to be converted, it can be optionaly supplied here.
	 */
	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: AnyBindable<V> | undefined, converter: (value: V) => T[K]): void;
	add<T extends TTarget, K extends keyof T, V extends T[K]>(target: T, key: K, value: AnyBindable<V> | undefined): void;

	/**
	 * If the value is a two-way store, it will be updated whenever the function specified by
	 * `key` is invoked on the target, creating a reverse on-way binding. If the value is not
	 * a two-way store, it will be ignored. If another callback is specified, it will be invoked
	 * after the store is updated.
	 * @param target The main object to bind to.
	 * @param key The key for the callback on the main object to watch for changes.
	 * @param value A store that can be written to for updates.
	 * @param callback An optional callback to be invoked after the callback specified by `key` was invoked.
	 */
	callback<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: TwoWayBindable<V> | undefined, callback: ((arg: V) => void) | undefined): void;
	callback<T extends TTarget, K extends keyof T, F extends ((() => void) & T[K]), V>(target: T, key: K, value: TwoWayBindable<V> | undefined, callback: ((arg: V) => void) | undefined, converter: (arg: Parameters<F>[0]) => V): void;

	/**
	 * Reads the specified value and writes it to the target. If the value is a store, a binding
	 * will be added. If the value is a two-way bindable, the store will automatically be updated
	 * when the out-key callback is called. If the target was nameless, an id will be assigned to it.
	 * This method is effectively calling `add()` and `callback()` in that order.
	 * @param target The main object to bind to.
	 * @param inKey The key on the main object, or nested object, to mutate when a binding updates.
	 * @param outKey The key for the callback on the main object to watch for changes.
	 * @param value A store that can be monitored for changes and written to for updates, or a constant that will be applied immediately.
	 * @param callback An optional callback to be invoked when the value has updated.
	 */
	twoway<T extends TTarget, I extends keyof T, V extends T[I]>(target: T, inKey: I, outKey: keyof T, value: TwoWayBindable<V> | undefined, callback: ((arg: V) => void) | undefined): void;

	/**
	 * Reads the specified value and applies it to the target via a custom callback. If the value is a
	 * store, a binding will be added. If the target was nameless, an id will be assigned to it.
	 * @param target The main object to bind to.
	 * @param value A store that can be monitored for changes, or a constant that will be applied immediately.
	 * @param callback The callback to be invoked when the value has updated.
	 */
	on<T extends TTarget, V>(target: T, value: AnyBindable<V> | undefined, callback: (target: T, value: V) => void): void;
}