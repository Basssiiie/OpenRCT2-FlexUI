import { Observable } from "./observable";
import * as Log from "../utilities/logger";
import { Bindable } from "./bindable";
import { Id } from "../utilities/identifier";
import { WidgetContainer } from "../core/widgetContainer";


/**
 * Helper that can bind an observable from a viewmodel to a widget inside a window.
 */
export class Binder
{
	private _window: Window | null = null;
	private _bindings?: RegisteredBinding<WidgetBase, unknown>[];


	/**
	 * Reads the specfied value and writes it to the widget. If the value is an observable, a binding
	 * will be added. If the widget was nameless, an id will be assigned to it. An optional converter
	 * can be supplied if the value needs to be converted from fluent ui usage to plugin api usage.
	 */
	read<W extends WidgetBase, K extends keyof W, T>(widget: W, key: K, value: Bindable<T> | undefined, converter?: (value: T) => W[K]): void
	{
		if (value instanceof Observable)
		{
			if (widget.name === undefined)
			{
				widget.name = Id.new();
			}
			this.add(widget.name, key, value, converter);
			widget[key] = value.get() as never;
		}
		else if (value !== undefined)
		{
			widget[key] = (converter) ? converter(value) : value as never;
		}
	}

	/**
	 * Add a binding between a observable and a widget's property. An optional converter can be
	 * supplied if the value needs to be converted from fluent ui usage to plugin api usage.
	 */
	add<W extends WidgetBase, K extends keyof W, T>(widgetName: string, property: K, observable: Observable<T>, converter?: (value: T) => W[K]): void
	{
		const setter = (widget: W, value: T): void =>
		{
			widget[property] = (converter) ? converter(value) : value as never;
		};
		const binding =
		{
			widgetName: widgetName,
			setter: setter,
			observable: observable,
			unsubscribe: observable.subscribe(v =>
			{
				if (!this._window)
					return;

				const widget = this._window.findWidget<W>(widgetName);
				if (!widget)
				{
					Log.debug(`Binder: widget '${widgetName}' not found on window for updating property '${property}' with value '${v}'.`);
					return;
				}
				setter(widget, v);
			})
		} as RegisteredBinding<WidgetBase, unknown>;

		if (!this._bindings)
		{
			this._bindings = [ binding ];
		}
		else
		{
			this._bindings.push(binding);
		}
	}

	/**
	 * Updates all widgets with the values in registered bindings.
	 */
	update(widgets: WidgetContainer): void
	{
		if (this._bindings)
		{
			for (let i = 0; i < this._bindings.length; i++)
			{
				const binding = this._bindings[i];
				const widget = widgets.get(binding.widgetName);
				binding.setter(widget, binding.observable.get());
			}
		}
	}

	/**
	 * Bind a window to this binder.
	 */
	bind(window: Window): void
	{
		this._window = window;
	}

	/**
	 * Unbind the current window from this binder.
	 */
	unbind(): void
	{
		this._window = null;
	}

	/**
	 * Returns true if the binder has any bindings, or false if not.
	 */
	hasBindings(): boolean
	{
		return (this._bindings !== undefined && this._bindings.length > 0);
	}

	/**
	 * Disposes all subscriptions for this binder.
	 */
	dispose(): void
	{
		if (this._bindings !== undefined)
		{
			for (const subscription of this._bindings)
			{
				subscription.unsubscribe();
			}
		}
	}
}


interface RegisteredBinding<W extends WidgetBase, T>
{
	readonly widgetName: string;
	readonly observable: Observable<T>;
	setter(widget: W, value: T): void;
	unsubscribe(): void;
}