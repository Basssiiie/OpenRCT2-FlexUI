import { Binding } from "@src/bindings/binding";
import { Store } from "@src/bindings/stores/store";
import { BaseWindowControl } from "../baseWindowControl";
import { GenericBinder } from "./genericBinder";


/**
 * Binder for OpenRCT2 windows.
 */
export class WindowBinder extends GenericBinder<BaseWindowControl, Window | WindowDesc>
{
	/**
	 * Bind a window control to this binder.
	 */
	override _bind(control: BaseWindowControl): void
	{
		const window = control._description;
		if (window)
		{
			this._refresh(window);
		}
		this._source = control;
	}

	protected override _createBinding<T extends Window | WindowDesc, V, C>(_target: T, property: string, store: Store<V>, converter: ((value: V) => C) | undefined, setter: ((target: T, key: string, value: V | C) => void) | undefined): Binding<T, V, C>
	{
		const callback = (value: V): void =>
		{
			const control = this._source;
			// Only update if window is open.
			if (!control || !control._window)
				return;

			this._apply(<T>control._window, property, value, converter, setter);
		};
		return new Binding<T, V, C>("", property, store, converter, setter, callback);
	}


	/**
	 * Updates the window with the values in registered bindings.
	 */
	private _refresh(window: Window | WindowDesc): void
	{
		const bindings = this._bindings;
		if (bindings)
		{
			for (const binding of bindings)
			{
				this._apply(window, binding._key, binding._store.get(), binding._converter, binding._setter);
			}
		}
	}
}