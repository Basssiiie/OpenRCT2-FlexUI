import { BuildOutput } from "@src/core/buildOutput";
import { WidgetMap } from "@src/core/widgetMap";
import { fillLayout } from "@src/layouts/fillLayout";
import { Layoutable } from "@src/layouts/layoutable";
import { Rectangle } from "@src/positional/rectangle";
import { identifier } from "@src/utilities/identifier";
import { ElementParams } from "./element";


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

	constructor(type: T["type"], output: BuildOutput, params: ElementParams)
	{
		this.type = type;

		const binder = output.binder;
		binder.add(this, "tooltip", params.tooltip);
		binder.add(this, "isDisabled", params.disabled);
		binder.add(this, "isVisible", params.visibility, v => (v === "visible"));

		output.add(<Widget>this);
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		fillLayout(widgets, this.name, area);
	}
}
