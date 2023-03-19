import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import { subscribe } from "@src/bindings/stores/subscribe";
import { getOrConvertToTwoWayBinding } from "@src/bindings/twoway/convertToTwoWay";
import { Rectangle } from "@src/positional/rectangle";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { ensureDefaultLineHeight } from "../constants";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { fillLayout } from "../layouts/fillLayout";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
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


/**
 * Create a dropdown widget with multiple selectable options, which can be navigated
 * through with [+] and [-] buttons from a spinner widget.
 */
export function dropdownSpinner(params: DropdownSpinnerParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function dropdownSpinner(params: DropdownSpinnerParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function dropdownSpinner(params: DropdownSpinnerParams & Positions): WidgetCreator<Positions>
{
	ensureDefaultLineHeight(params);

	return (parent, output) => new DropdownSpinnerControl(parent, output, params);
}


const spinnerControlsWidth = 25;


/**
 * A dropdown with a spinner control on the side.
 */
class DropdownSpinnerControl extends DropdownControl
{
	_spinner: SpinnerControl;

	constructor(parent: ParentControl, output: BuildOutput, params: DropdownSpinnerParams)
	{
		// Ensure selectedIndex is a two-way store to keep the spinner and dropdown in sync.
		const selectedIndex = getOrConvertToTwoWayBinding(params.selectedIndex, 0);

		// Setup internal spinner control
		const spinParams: SpinnerParams =
		{
			tooltip: params.tooltip,
			disabled: params.disabled,
			visibility: params.visibility,
			wrapMode: params.wrapMode || "wrap",
			minimum: 0,
			value: selectedIndex,
			onChange: params.onChange
		};

		// If items is a store, ensure the spinner maximum is always updated
		// when the item list changes.
		const items = params.items;
		if (isStore(items))
		{
			const maximum = store(0);
			subscribe(items, val =>
			{
				const length = val.length;
				maximum.set((val && length > 0) ? (length - 1) : 0);
			});
			spinParams.maximum = maximum;
		}
		else if (items)
		{
			const length = items.length;
			spinParams.maximum = (length > 0) ? (length - 1) : 0;
		}

		// Pass ensured two-way binding to underlying dropdown control.
		params.selectedIndex = selectedIndex;

		const spinner = new SpinnerControl(parent, output, spinParams);
		super(parent, output, params);

		this._spinner = spinner;
	}


	/**
	 * Positions the two widgets in the proper location.
	 */
	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		// Position spinner (only show controls next to dropdown)
		fillLayout(widgets, this._spinner.name, area);

		// Position dropdown (leave space for spinner controls)
		area.width -= spinnerControlsWidth;
		fillLayout(widgets, this.name, area);
	}
}
