import { Bindable } from "@src/bindings/bindable";
import { BuildOutput } from "@src/building/buildOutput";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgetCreator";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
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
	isChecked?: Bindable<boolean>;

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
export function checkbox(params: CheckboxParams & Positions): WidgetCreator<Positions>
{
	ensureDefaultLineHeight(params); // todo check for different size without text

	return (parent, output) => new CheckboxControl(parent, output, params);
}


/**
 * A controller class for a checkbox widget.
 */
export class CheckboxControl extends Control<CheckboxWidget> implements CheckboxWidget, CheckboxParams
{
	text?: string;
	isChecked?: boolean;
	onChange?: (isChecked: boolean) => void;


	constructor(parent: ParentControl, output: BuildOutput, params: CheckboxParams)
	{
		super("checkbox", parent, output, params);

		const binder = output.binder;
		binder.add(this, "text", params.text);
		binder.add(this, "isChecked", params.isChecked);
		this.onChange = params.onChange;
	}
}