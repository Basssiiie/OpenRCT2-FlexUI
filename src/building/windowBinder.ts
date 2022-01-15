import { Bindable } from "@src/observables/bindable";
import { Binder } from "@src/observables/binder";
import { Binding } from "@src/observables/binding";
import { isObservable } from "@src/observables/isObservable";
import { Observable } from "@src/observables/observable";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { isUndefined } from "@src/utilities/type";
import { WidgetMap } from "./widgetMap";
import { Template } from "./template";


/**
 * Helper that can bind an observable from a viewmodel to a widget inside a window.
 */
export class WindowBinder implements Binder
{
	private _template: Template | null = null;
	private _bindings?: Binding<WidgetBase, unknown>[];


	add<W extends WidgetBase, K extends keyof W, T>(widget: W, key: K, value: Bindable<T> | undefined, converter?: (value: T) => W[K]): void
	{
		if (isObservable(value))
		{
			// bind
			if (!widget.name)
			{
				widget.name = identifier();
			}
			this.createBinding(widget.name, key, value, converter);
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
	 * Add a binding between a observable and a widget's property. An optional converter can be
	 * supplied if the value needs to be converted from an internal value to a different visual
	 * representation of it.
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
		if (isObservable(bindable))
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
		else if (!isUndefined(bindable))
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
		return (!isUndefined(this._bindings) && this._bindings.length > 0);
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
