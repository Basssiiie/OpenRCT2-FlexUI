import { Bindable } from "@src/bindings/bindable";
import { Binder } from "@src/bindings/binder";
import { Binding } from "@src/bindings/binding";
import { isStore } from "@src/bindings/isStore";
import { Store } from "@src/bindings/store";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { isUndefined } from "@src/utilities/type";
import { Template } from "./template";
import { WidgetMap } from "./widgetMap";


/**
 * Helper that can bind a store from a viewmodel to a widget inside a window.
 */
export class WindowBinder implements Binder
{
	private _template: Template | null = null;
	private _bindings: Binding<WidgetBase, unknown>[] = [];


	add<W extends WidgetBase, K extends keyof W, T>(widget: W, key: K, value: Bindable<T> | undefined, converter?: (value: T) => W[K]): void
	{
		if (isStore(value))
		{
			// bind
			if (!widget.name)
			{
				widget.name = identifier();
			}
			this._createBinding(widget.name, key, value, converter);
			const val = value.get();
			widget[key] = (converter) ? converter(val) : val as never;
		}
		else if (!isUndefined(value))
		{
			// just update value
			widget[key] = (converter) ? converter(value) : value as never;
		}
	}


	/**
	 * Add a binding between a store and a widget's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
	 */
	private _createBinding<W extends WidgetBase, K extends keyof W, T>(widgetName: string, property: K, store: Store<T>, converter?: (value: T) => W[K]): void
	{
		const binding: Binding<WidgetBase, unknown> =
		{
			widgetName,
			store,
			setter: (widget: W, value: T): void =>
			{
				widget[property] = (converter) ? converter(value) : value as never;
			},
			unsubscribe: store.subscribe(v =>
			{
				const template = this._template;
				// Only update if window is open.
				if (!template || !template._window)
					return;

				const editor = template.getWidget<W>(widgetName);
				if (!editor)
				{
					Log.debug(`Binder: widget '${widgetName}' not found on window for updating property '${property}' with value '${v}'.`);
					return;
				}
				const finalValue = (converter) ? converter(v) : v;
				editor.set(property, finalValue as never);
			})
		};

		this._bindings.push(binding);
	}


	on<T>(bindable: Bindable<T> | undefined, callback: (value: T) => void): void
	{
		if (isStore(bindable))
		{
			bindable.subscribe(callback);
		}
		else if (!isUndefined(bindable))
		{
			// Write callback straight back to the widget template.
			callback(bindable);
		}
	}


	/**
	 * Updates all widgets with the values in registered bindings.
	 */
	update(widgets: WidgetMap): void
	{
		if (this._bindings)
		{
			for (let i = 0; i < this._bindings.length; i++)
			{
				const binding = this._bindings[i];
				const widget = widgets[binding.widgetName];
				binding.setter(widget, binding.store.get());
			}
		}
	}

	/**
	 * Bind a window to this binder.
	 */
	bind(template: Template): void
	{
		this._template = template;
	}

	/**
	 * Unbind the current window from this binder.
	 */
	unbind(): void
	{
		this._template = null;
	}

	/**
	 * Returns true if the binder has any bindings, or false if not.
	 */
	hasBindings(): boolean
	{
		return (this._bindings.length > 0);
	}
}
