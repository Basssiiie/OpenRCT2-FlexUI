import { Bindable } from "@src/bindings/bindable";
import { TwoWayBindable } from "@src/bindings/twoway/twowayBindable";
import { Rectangle } from "@src/positional/rectangle";
import { BuildOutput } from "@src/windows/buildOutput";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../positional/size";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Control } from "./control";


/**
 * The parameters for configuring the checkbox.
 */
export interface CheckboxParams extends ElementParams
{
	/**
	 * Optional text on the right side of the checkbox.
	 * @default undefined
	 */
	text?: Bindable<string>;

	/**
	 * Whether the checkbox starts off ticked or not.
	 * @default false
	 */
	isChecked?: TwoWayBindable<boolean>;

	/**
	 * Triggers when the checkbox is toggled.
	 * @default undefined
	 */
	onChange?: (isChecked: boolean) => void;
}


/**
 * Create a checkbox that can toggle a setting or a choice.
 */
export function checkbox(params: CheckboxParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function checkbox(params: CheckboxParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function checkbox<Position extends SizeParams>(params: CheckboxParams & Position): WidgetCreator<Position>
{
	ensureDefaultLineHeight(params); // todo check for different size without text

	return toWidgetCreator(CheckboxControl, params);
}


/**
 * A controller class for a checkbox widget.
 */
class CheckboxControl<Position> extends Control<CheckboxDesc, Position> implements CheckboxDesc, CheckboxParams
{
	text?: string;
	isChecked?: boolean;
	onChange?: (isChecked: boolean) => void;


	constructor(output: BuildOutput, params: CheckboxParams & Position)
	{
		super("checkbox", output, params);

		const binder = output.binder;
		binder.add(this, "text", params.text);
		binder.twoway(this, "isChecked", "onChange", params.isChecked, params.onChange);
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		area.y += 1;
		super.layout(widgets, area);
	}
}
