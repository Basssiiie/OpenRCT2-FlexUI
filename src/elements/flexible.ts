import { BuildOutput } from "@src/core/buildOutput";
import { WidgetMap } from "@src/core/widgetMap";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Layoutable } from "@src/layouts/layoutable";
import { flexibleLayout } from "@src/layouts/flexibleLayout";
import { Direction } from "@src/positional/direction";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Positions } from "@src/positional/positions";
import { Rectangle } from "@src/positional/rectangle";
import { ButtonParams } from "./button";
import { DropdownParams } from "./dropdown";
import { LabelParams } from "./label";


export type FlexibleLayoutParams = WidgetCreator<FlexiblePosition>[] |
{
	/**
	 * Specify the child widgets within this box.
	 */
	content: WidgetCreator<FlexiblePosition>[];
};


/** @deprecated */
export interface FlexibleLayoutBuilder
{
	/**
	 * Add a clickable button widget.
	 */
	button(params: ButtonParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a dropdown widget with one or more selectable options.
	 */
	dropdown(params: DropdownParams & FlexiblePosition): FlexibleLayoutBuilder;

	horizontal(params: FlexibleLayoutParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a textual label widget.
	 */
	label(params: LabelParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a listbox for displaying data in rows and columns.
	 */
	//listview(params: ListViewParams & FlexiblePosition): FlexibleLayoutBuilder;

	//spinner(params: SpinnerParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a viewport for displaying a location somewhere on the map.
	 */
	//viewport(params: ViewportParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a static custom widget.
	 */
	//widget<TWidget extends WidgetParams>(params: TWidget & FlexiblePosition): FlexibleLayoutBuilder;


	vertical(params: FlexibleLayoutParams & FlexiblePosition): FlexibleLayoutBuilder;
}


/**
 * Add a horizontal row with one or more child widgets.
 */
export function horizontal(params: FlexibleLayoutParams & Positions): WidgetCreator<FlexibleLayoutParams & Positions>
{
	return flexible(params, Direction.Horizontal);
}


/**
 * Add a vertical row with one or more child widgets.
 */
export function vertical(params: FlexibleLayoutParams & Positions): WidgetCreator<FlexibleLayoutParams & Positions>
{
	return flexible(params, Direction.Vertical);
}


/**
 * Add a flexible row with one or more child widgets in the specified direction.
 */
export function flexible(params: FlexibleLayoutParams & Positions, direction: Direction): WidgetCreator<FlexibleLayoutParams & Positions>
{
	return {
		params: params,
		create: (output: BuildOutput): FlexibleLayoutControl => new FlexibleLayoutControl(output, params, direction)
	};
}


export class FlexibleLayoutControl implements Layoutable
{
	params: FlexiblePosition[];
	children: Layoutable[];
	direction: Direction;

	constructor(output: BuildOutput, children: FlexibleLayoutParams, direction: Direction)
	{
		this.direction = direction;

		const items = (Array.isArray(children)) ? children : children.content;
		const count = items.length;
		this.params = Array<FlexiblePosition>(count);
		this.children = Array<Layoutable>(count);

		for (let i = 0; i < items.length; i++)
		{
			const child = items[i];
			this.params[i] = child.params;
			this.children[i] = child.create(output);
		}
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		flexibleLayout(this.params, area, this.direction, (idx, subarea) =>
		{
			this.children[idx].layout(widgets, subarea);
		});
	}
}