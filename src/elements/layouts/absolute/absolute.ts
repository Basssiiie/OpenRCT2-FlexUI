import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgetCreator";
import { WidgetMap } from "@src/building/widgetMap";
import { WindowContext } from "@src/building/windowContext";
import { VisualElement } from "@src/elements/controls/visualElement";
import { Parsed } from "@src/positional/parsing/parsed";
import { parseScale } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { isArray } from "@src/utilities/type";
import { FlexiblePosition } from "../flexible/flexiblePosition";
import { Positions } from "../positions";
import { absoluteLayout } from "./absoluteLayout";
import { AbsolutePosition } from "./absolutePosition";


/**
 * Array of widgets created that are positioned at absolute locations.
 */
export type AbsoluteLayoutContainer = WidgetCreator<AbsolutePosition>[];


/**
 * The parameters for configuring an absolute layout.
 */
export interface AbsoluteLayoutParams
{
	/**
	 * Specify the child widgets within this box.
	 */
	content: AbsoluteLayoutContainer;
}


/**
 * Add an area with widgets positioned at absolute.
 */
export function absolute(params: AbsoluteLayoutContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function absolute(params: AbsoluteLayoutContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function absolute(params: AbsoluteLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function absolute(params: AbsoluteLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function absolute(params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & Positions): WidgetCreator<Positions>
{
	return (parent, output) => new AbsoluteLayoutControl(parent, output, params);
}


class AbsoluteLayoutControl extends VisualElement implements ParentControl<AbsolutePosition>
{
	_children: Layoutable<AbsolutePosition>[];
	_context: WindowContext;

	constructor(parent: ParentControl, output: BuildOutput, params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & Positions)
	{
		super(parent, params);
		this._context = output.context;

		const childCreators = (isArray(params)) ? params : params.content;
		const count = childCreators.length;
		this._children = Array<Layoutable<AbsolutePosition>>(count);

		for (let i = 0; i < childCreators.length; i++)
		{
			const creator = childCreators[i];
			this._children[i] = creator(this, output);
		}
	}

	parse(position: AbsolutePosition): Parsed<AbsolutePosition>
	{
		return {
			x: parseScale(position.x),
			y: parseScale(position.y),
			width: parseScale(position.width),
			height: parseScale(position.height)
		};
	}

	recalculate(): void
	{
		// Nothing else to recalculate
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		absoluteLayout(this._children, area, widgets);
	}
}