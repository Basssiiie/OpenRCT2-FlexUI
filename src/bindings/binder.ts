import { Bindable } from "./bindable";


/**
 * The binder helps with binding stores from a viewmodel to a widget inside a window.
 */
export interface Binder
{
	/**
	 * Reads the specfied value and writes it to the widget. If the value is a store, a binding
	 * will be added. If the widget was nameless, an id will be assigned to it. An optional converter
	 * can be supplied if the value is of a different type and to be converted.
	 */
	add<W extends WidgetBase, K extends keyof W, T>(widget: W, key: K, value: Bindable<T> | undefined, converter?: (value: T) => W[K]): void;

	/**
	 * Adds a callback that responds to the state of the bindable.
	 * If it's a store, it will subscribe. If it's a constant, it will be immediately applied.
	 */
	on<T>(bindable: Bindable<T> | undefined, callback: (value: T) => void): void;
}