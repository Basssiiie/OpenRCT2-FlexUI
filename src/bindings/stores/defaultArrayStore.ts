import { isArray } from "@src/utilities/type";
import { ArrayStore } from "./arrayStore";
import { DefaultStore } from "./defaultStore";


/**
 * A store implementation that manages a cached array.
 */
export class DefaultArrayStore<T> extends DefaultStore<T[]> implements ArrayStore<T>
{
	set(array: T[]): void;
	set(index: number, item: T): void;
	set(indexOrArray: number | T[], optionalItem?: T): void
	{
		if (isArray(indexOrArray))
		{
			this._value = indexOrArray;
		}
		else
		{
			this._value[indexOrArray] = <T>optionalItem;
		}
		this._updateListeners(this._value);
	}

	insert(index: number, ...values: T[]): number
	{
		const array = this._value;
		// eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any
		array.splice.apply(array, (<any>[index, 0]).concat(values));
		this._updateListeners(array);
		return array.length;
	}

	resize(length: number): void
	{
		const array = this._value;
		array.length = length;
		this._updateListeners(array);
	}

	/**
	 * Call the underlying array method with the same name using the supplied arguments.
	 */
	private _wrapArrayMethod<K extends keyof ArrayStore<T>>(method: K): (...args: Parameters<ArrayStore<T>[K]>) => ReturnType<ArrayStore<T>[K]>
	{
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const store = this;
		return function(...args: unknown[]): never
		{
			const array = store._value;
			const arrayMethod = <(...arg: unknown[]) => unknown>array[<keyof Array<T>>method];
			const value = arrayMethod.apply(array, args);
			store._updateListeners(array);
			return <never>value;
		};
	}

	push = this._wrapArrayMethod("push");
	pop = this._wrapArrayMethod("pop");
	unshift = this._wrapArrayMethod("unshift");
	shift = this._wrapArrayMethod("shift");
	splice = this._wrapArrayMethod("splice");
	sort = this._wrapArrayMethod("sort");
}
