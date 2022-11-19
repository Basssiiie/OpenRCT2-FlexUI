import { Bindable } from "@src/bindings/bindable";
import { Binder } from "@src/bindings/binder";
import { Binding } from "@src/bindings/binding";
import { isUndefined } from "@src/utilities/type";
import { isStore } from "../../bindings/stores/isStore";
import { Store } from "../../bindings/stores/store";


/**
 * Generic binder that can bind to a specific target.
 */
export abstract class GenericBinder<TSource, TTarget> implements Binder<TTarget>
{
	protected readonly _bindings: Binding<TTarget, keyof TTarget, unknown>[] = [];
	protected _source: TSource | null = null;


	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: Bindable<V> | undefined, converter?: (value: V) => T[K]): void
	{
		if (isStore(value))
		{
			// bind
			const binding = this._createBinding(target, key, value, converter);
			this._bindings.push(<never>binding);

			this._apply(target, key, value.get(), converter);
		}
		else if (!isUndefined(value))
		{
			// just update value
			this._apply(target, key, value, converter);
		}
	}


	/**
	 * Add a binding callback between a store and a target's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	protected abstract _createBinding<T extends TTarget, K extends keyof T, V>(target: T, property: K, store: Store<V>, converter: ((value: V) => T[K]) | undefined): Binding<T, K, V>;


	/**
	 * Converts the value using the converter, if one is supplied.
	 */
	protected _convert<T, K extends keyof T, V>(value: V, converter: ((value: V) => T[K]) | undefined): T[K]
	{
		return (converter) ? converter(value) : value as never;
	}


	/**
	 * Applies the value to the target.
	 */
	protected _apply<T, K extends keyof T, V>(target: T, key: K, value: V, converter: ((value: V) => T[K]) | undefined): void
	{
		target[key] = this._convert(value, converter);
	}


	/**
	 * Bind a source instance to this binder.
	 */
	abstract _bind(source: TSource): void;


	/**
	 * Unbind the current window from this binder.
	 */
	_unbind(): void
	{
		this._source = null;
	}

	/**
	 * Returns true if the binder has any bindings, or false if not.
	 */
	_hasBindings(): boolean
	{
		return (this._bindings.length > 0);
	}
}
