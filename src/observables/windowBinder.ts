import { WidgetMap } from "@src/core/widgetMap";
import { Template } from "@src/templates/template";
import { Id } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { Bindable } from "./bindable";
import { Binder } from "./binder";
import { Binding } from "./binding";
import { Observable } from "./observable";


/**
 * Helper that can bind an observable from a viewmodel to a widget inside a window.
 */
export class WindowBinder implements Binder
{
	private _template: Template | null = null;
	private _bindings?: Binding<WidgetBase, unknown>[];


	add<W extends WidgetBase, K extends keyof W, T>(widget: W, key: K, value: Bindable<T> | undefined, converter?: (value: T) => W[K]): void
	{
		if (value instanceof Observable)
		{
			// bind
			if (!widget.name)
			{
				widget.name = Id.new();
			}
			this.createBinding(widget.name, key, value, converter);
			const val = value.get();
			widget[key] = (converter) ? converter(val) : val as never;
		}
		else if (value !== undefined)
		{
			// just update value
			widget[key] = (converter) ? converter(value) : value as never;
		}
	}


	/**
	 * Add a binding between a observable and a widget's property. An optional converter can be
	 * supplied if the value needs to be converted from fluent ui usage to plugin api usage.
	 */
	private createBinding<W extends WidgetBase, K extends keyof W, T>(widgetName: string, property: K, observable: Observable<T>, converter?: (value: T) => W[K]): void
	{
		function setter(widget: W, value: T): void
		{
			widget[property] = (converter) ? converter(value) : value as never;
		}
		const binding = {
			widgetName: widgetName,
			setter: setter,
			observable: observable,
			unsubscribe: observable.subscribe(v =>
			{
				const template = this._template;
				if (!template || !template.window)
					return;

				// Only update visible widget.
				const widget = template.window.findWidget<W>(widgetName);
				if (!widget)
				{
					Log.debug(`Binder: widget '${widgetName}' not found on window for updating property '${property}' with value '${v}'.`);
					return;
				}
				setter(widget, v);
			})
		} as Binding<WidgetBase, unknown>;

		if (!this._bindings)
		{
			this._bindings = [binding];
		}

		else
		{
			this._bindings.push(binding);
		}
	}


	on<T, W extends WidgetBase, K extends keyof W>(bindable: Bindable<T> | undefined, widgetTemplate: W, property: K, callback: (value: T) => W[K]): void
	{
		if (bindable instanceof Observable)
		{
			const name = widgetTemplate.name;
			if (!name)
				return;

			bindable.subscribe(value =>
			{
				const template = this._template;
				if (template)
				{
					const widget = template.getWidget<W>(name);
					if (widget)
					{
						widget.set(property, callback(value));
					}
				}
			});
		}
		else if (bindable !== undefined)
		{
			// Write callback straight back to the widget template.
			widgetTemplate[property] = callback(bindable);
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
				binding.setter(widget, binding.observable.get());
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
		return (this._bindings !== undefined && this._bindings.length > 0);
	}

	/**
	 * Disposes all subscriptions for this binder.
	 */
	dispose(): void
	{
		if (this._bindings)
		{
			for (const subscription of this._bindings)
			{
				subscription.unsubscribe();
			}
		}
	}
}
