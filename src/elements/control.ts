import { BuildOutput } from "@src/core/buildOutput";
import { WidgetContainer } from "@src/core/widgetContainer";
import { Layoutable } from "@src/layouts/layoutable";
import { fillLayout } from "@src/layouts/fillLayout";
import { Rectangle } from "@src/positional/rectangle";
import { Id } from "@src/utilities/identifier";
import { ElementParams } from "./element";


/**
 * Base control that takes care of the base widget properties.
 */
export abstract class Control<T extends WidgetBase> implements WidgetBase, Layoutable
{
	name: string = Id.new();
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
		binder.read(this, "tooltip", params.tooltip);
		binder.read(this, "isDisabled", params.disabled);
		binder.read(this, "isVisible", params.visibility, v => (v === "visible"));

		output.widgets.push(this as Widget);
	}


	layout(widgets: WidgetContainer, area: Rectangle): void
	{
		fillLayout(widgets, this.name, area);
	}
}