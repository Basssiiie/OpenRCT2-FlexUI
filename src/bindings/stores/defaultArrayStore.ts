import { ArrayStore } from "./arrayStore";
import { DefaultStore } from "./defaultStore";


/**
 * A store implementation that manages a cached array.
 */
export class DefaultArrayStore<T> extends DefaultStore<T[]> implements ArrayStore<T>
{
	insert(index: number, ...values: T[]): number
	{
		this._value.splice(index, 0, ...values);
		this._updateListeners();
		return this._value.length;
	}

	update(index: number, value: T): T
	{
		const oldValue = this._value[index];
		this._value[index] = value;
		this._updateListeners();
		return oldValue;
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
			const arrayMethod = <(...arg: unknown[]) => unknown>store._value[<keyof Array<T>>method];
			const value = arrayMethod.apply(store._value, args);
			store._updateListeners();
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
