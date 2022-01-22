import { isStore } from "@src/bindings/isStore";
import { Store } from "@src/bindings/store";

/**
 * Small editor that allows editing both the template and active widget, if present.
 */
export class WidgetEditor<T extends Widget>
{
	constructor(readonly template: T, readonly active: T | undefined)
	{
	}

	get<K extends keyof T>(key: K): T[K]
	{
		return this.template[key];
	}

	set<K extends keyof T>(key: K, value: T[K] | Store<T[K]>): void
	{
		const actual = (isStore(value)) ? value.get() : value;
		if (this.active)
		{
			(this.active)[key] = actual;
		}
		this.template[key] = actual;
	}
}
