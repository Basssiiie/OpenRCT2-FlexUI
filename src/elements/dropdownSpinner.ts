import { BuildOutput } from "../core/buildOutput";
import { WidgetFactory } from "../core/widgetFactory";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { DropdownControl, DropdownParams } from "./dropdown";
import { SpinnerWrapMode } from "./spinner";


/**
 * The parameters for configuring the spinner.
 */
export interface DropdownSpinnerParams extends DropdownParams
{
	/**
	 * Sets whether the spinner value wraps around or clamps to its boundaries.
	 * @default "wrap"
	 */
	wrapMode?: SpinnerWrapMode;
}


export const DropdownSpinnerFactory: WidgetFactory<DropdownSpinnerParams> =
{
	create(output: BuildOutput, params: DropdownSpinnerParams): LayoutFunction
	{
		const control = new DropdownSpinnerControl(output, params);
		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, control.name, area);
	}
};



/**
 * A dropdown with a spinner control on the side.
 */
class DropdownSpinnerControl extends DropdownControl
{
}
