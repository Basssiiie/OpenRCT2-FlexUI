import { AnyBindable } from "@src/bindings/anyBindable";
import { Binder } from "@src/bindings/binder";
import { Binding } from "@src/bindings/binding";
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
	protected readonly _bindings: Binding<unknown>[] = [];
	protected _source: TSource | null = null;


	add<T extends TTarget, K extends keyof T, V>(target: T, key: K, value: AnyBindable<V> | undefined, converter?: (value: V) => T[K]): void
	{
		this.for(target, value, (actualTarget, actualValue) =>
		{
			const result = (converter) ? converter(actualValue) : actualValue;
			actualTarget[key] = <T[K]>result;
		});
	}

	callback<T extends TTarget, V, P extends unknown[]>(target: T, key: keyof T, value: TwoWayBindable<V> | undefined, callback: ((a: V) => void) | undefined, converter?: (arg1: P[0], arg2: P[1]) => V): void
	{
		// Implementation note: callback only allows up to two parameters! Add more once necessary.
		if (isTwoWay(value))
		{
			target[key] = <T[keyof T]>((a: V | P[0], b: P[1]): void =>
			{
				// If no converter present, take just the first one. Multiple parameters must be converted anyway to fit into one store.
				const result = ((converter) ? converter(<P[0]>a, b) : <V>a);
				value.twoway.set(result);
				if (callback)
				{
					callback(result);
				}
			});
		}
		else if (callback)
		{
			target[key] = <T[keyof T]>((converter)
				? ((a?: P[0], b?: P[1]): void => callback(converter(a, b)))
				: callback
			);
		}
	}

	twoway<T extends TTarget, K extends keyof T, V extends T[K]>(target: T, inKey: K, outKey: keyof T, value: TwoWayBindable<V> | undefined, callback: ((arg: V) => void) | undefined): void
	{
		this.add(target, inKey, value);
		this.callback(target, outKey, value, callback);
	}

	for<T extends TTarget, V>(target: T, value: AnyBindable<V> | undefined, callback: (target: T, value: V, isStore: boolean) => void): void
	{
		this._createBinding<T, V>(value, <never>callback, target);
	}

	on<T>(value: AnyBindable<T> | undefined, callback: (value: T, isStore: boolean) => void): void
	{
		this._createBinding(value, (_, val, store) => callback(val, store));
	}

	private _createBinding<T extends TTarget, V>(value: AnyBindable<V>, callback: (target: T | undefined, value: V, isStore: boolean) => void, target?: T)
	{
		const underlying = unwrap(value);
		if (isStore(underlying))
		{
			// bind
			const getTarget = target ? this._getBindTarget(target) : undefined;
			const binding = new Binding<V, TSource, T>(underlying, callback, getTarget);
			this._bindings.push(<Binding<unknown>>binding);

			callback(target, underlying.get(), true);
		}
		else if (!isUndefined(underlying))
		{
			// just update value
			callback(target, underlying, false);
		}
	}

	/**
	 * Add a binding callback between a store and a target's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	protected abstract _getBindTarget<T extends TTarget>(target: T): (source: TSource) => T | null; // maybe not necessary if we pass frame/widget map to bind?

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
