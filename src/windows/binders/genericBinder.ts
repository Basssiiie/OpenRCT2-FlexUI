import { AnyBindable } from "@src/bindings/anyBindable";
import { Binder } from "@src/bindings/binder";
import { Binding } from "@src/bindings/binding";
import { Store } from "@src/bindings/stores/store";
import { isTwoWay } from "@src/bindings/twoway/isTwoWay";
import { TwoWayBindable } from "@src/bindings/twoway/twowayBindable";
import { unwrap } from "@src/bindings/twoway/unwrap";
import { isUndefined } from "@src/utilities/type";
import { isStore } from "../../bindings/stores/isStore";


/**
 * Generic binder that can bind to a specific target.
 */
export abstract class GenericBinder<TSource, TTarget> implements Binder<TTarget>
{
	protected readonly _bindings: Binding<TTarget, unknown>[] = [];
	protected _source: TSource | null = null;


	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: AnyBindable<V> | undefined, converter?: (value: V) => T[K]): void
	{
		this.on(target, value, (actualTarget, actualValue) =>
		{
			const result = (converter) ? converter(actualValue) : actualValue;
			actualTarget[key] = <T[K]>result;
		});
	}

	callback<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: TwoWayBindable<V> | undefined, callback: ((arg: V) => void) | undefined, converter?: (value: unknown) => V): void
	{
		if (isTwoWay(value))
		{
			target[key] = <T[K]>((arg: V): void =>
			{
				const result = (converter) ? converter(arg) : arg;
				value.twoway.set(result);
				if (callback)
				{
					callback(result);
				}
			});
		}
		else if (callback)
		{
			target[key] = <T[K]>((converter)
				? ((v: V): void => callback(converter(v)))
				: callback
			);
		}
	}

	twoway<T extends TTarget, K extends keyof T, V extends T[K]>(target: T, inKey: K, outKey: keyof T, value: TwoWayBindable<V> | undefined, callback: ((arg: V) => void) | undefined): void
	{
		this.add(target, inKey, value);
		this.callback(target, outKey, value, callback);
	}

	on<T extends TTarget, V>(target: T, value: AnyBindable<V> | undefined, callback: (target: T, value: V) => void): void
	{
		const underlying = unwrap(value);
		if (isStore(underlying))
		{
			// bind
			const binding = this._createBinding(target, underlying, callback);
			this._bindings.push(<never>binding);

			callback(target, underlying.get());
		}
		else if (!isUndefined(underlying))
		{
			// just update value
			callback(target, underlying);
		}
	}

	/**
	 * Add a binding callback between a store and a target's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	protected abstract _createBinding<T extends TTarget, V>(target: T, store: Store<V>, callback: (target: T, value: V) => void): Binding<T, V>;

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
