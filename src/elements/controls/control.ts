import { isStore } from "@src/bindings/stores/isStore";
import { on } from "@src/bindings/stores/on";
import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { WidgetMap } from "@src/building/widgetMap";
import { WindowContext } from "@src/building/windowContext";
import { Rectangle } from "@src/positional/rectangle";
import { identifier } from "@src/utilities/identifier";
import { ElementParams } from "../elementParams";
import { fillLayout } from "../layouts/fillLayout";


/**
 * Base control that takes care of the base widget properties.
 */
export abstract class Control<T extends WidgetBase> implements WidgetBase, Layoutable
{
	name: string = identifier();
	type: T["type"];
	x: number = 0;
	y: number = 0;
	width: number = 0;
	height: number = 0;

	tooltip?: string;
	isDisabled?: boolean;
	isVisible?: boolean;

	skip?: boolean;
	_context?: WindowContext | null;

	constructor(type: T["type"], output: BuildOutput, params: ElementParams)
	{
		this.type = type;

		const binder = output.binder, visibility = params.visibility;
		binder.add(this, "tooltip", params.tooltip);
		binder.add(this, "isDisabled", params.disabled);
		binder.add(this, "isVisible", visibility, v => (v === "visible"));

		// Redraw UI if the visibility changes to and from "none"
		on(visibility, v =>
		{
			const oldValue = this.skip;
			const newValue = (v === "none");
			this.skip = newValue;

			if (this._context && (oldValue || newValue))
			{
				this._context.redraw();
			}
		});
		if (isStore(visibility))
		{
			output.on("open", c => this._context = c);
			output.on("close", () => this._context = null);
		}

		output.add(this);
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		fillLayout(widgets, this.name, area);
	}
}
