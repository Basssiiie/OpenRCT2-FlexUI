import { BuildOutput } from "@src/core/buildOutput";
import { WidgetMap } from "@src/core/widgetMap";
import { WidgetCreator } from "@src/core/widgetCreator";
import { fillLayout } from "@src/layouts/fillLayout";
import { Observable } from "@src/observables/observable";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Rectangle } from "@src/positional/rectangle";
import { DropdownControl, DropdownParams } from "./dropdown";
import { SpinnerControl, SpinnerParams, SpinnerWrapMode } from "./spinner";


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


export function dropdownSpinner<P = FlexiblePosition>(params: DropdownSpinnerParams & P): WidgetCreator<DropdownSpinnerParams & P>
{
	return {
		params: params,
		create: (output: BuildOutput): DropdownSpinnerControl => new DropdownSpinnerControl(output, params)
	};
}


const spinnerControlsWidth = 24;


/**
 * A dropdown with a spinner control on the side.
 */
class DropdownSpinnerControl extends DropdownControl
{
	spinner: SpinnerControl;

	constructor(output: BuildOutput, params: DropdownSpinnerParams)
	{
		super(output, params);

		// Setup internal spinner control
		const spinParams: SpinnerParams =
		{
			minimum: 0,
			maximum: 0,
			// update dropdown
			onChange: (value: number) => this.onChange(value)
		};
		const items = params.items;
		if (items instanceof Observable)
		{
			const maximum = new Observable(0);
			items.subscribe(v => maximum.set((v) ? v.length : 0));
			spinParams.maximum = maximum;
		}
		else if (items)
		{
			spinParams.maximum = items.length;
		}
		this.spinner = new SpinnerControl(output, spinParams);
	}


	/**
	 * Update spinner when dropdown itme has changed.
	 */
	override onChange(index: number): void
	{
		this.spinner.value.set(index);
		super.onChange(index);
	}


	/**
	 * Positions the two widgets in the proper location.
	 */
	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		// Position dropdown (leave space for spinner controls)
		area.width -= spinnerControlsWidth;
		fillLayout(widgets, this.name, area);

		// Position spinner (only show controls next to dropdown)
		area.x += area.width;
		area.width = spinnerControlsWidth;
		fillLayout(widgets, this.spinner.name, area);
	}
}
