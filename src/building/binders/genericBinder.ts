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
	protected readonly _bindings: Binding<TTarget, unknown, unknown>[] = [];
	protected _source: TSource | null = null;


	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: Bindable<V> | undefined, converter?: (value: V) => T[K]): void;
	add<T extends TTarget, K extends string, V, C = V>(target: T, key: K, value: Bindable<V> | undefined, converter?: (value: V) => C, setter?: (target: T, key: K, value: C) => void): void;
	add<T extends TTarget, V, C>(target: T, key: string, value: Bindable<V> | undefined, converter?: (value: V) => C, setter?: (target: T, key: string, value: V | C) => void): void
	{
		if (isStore(value))
		{
			// bind
			const binding = this._createBinding(target, key, value, converter, setter);
			this._bindings.push(<never>binding);

			this._apply(target, key, value.get(), converter, setter);
		}
		else if (!isUndefined(value))
		{
			// just update value
			this._apply(target, key, value, converter, setter);
		}
	}


	/**
	 * Add a binding callback between a store and a target's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	protected abstract _createBinding<T extends TTarget, V, C>(target: T, property: string, store: Store<V>, converter: ((value: V) => C) | undefined, setter: ((target: T, key: string, value: V | C) => void) | undefined): Binding<T, V, C>;


	/**
	 * Applies the value to the target.
	 */
	protected _apply<T, V, C>(target: T, key: string, value: V, converter: ((value: V) => C) | undefined, setter: ((target: T, key: string, value: V | C) => void) | undefined): void
	{
		const result = (converter) ? converter(value) : value;
		if (setter)
		{
			setter(target, key, result);
		}
		else
		{
			(<Record<string, unknown>>target)[key] = result;
		}
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
