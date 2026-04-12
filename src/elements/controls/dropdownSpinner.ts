import { Bindable } from "@src/bindings/bindable";
import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import { subscribe } from "@src/bindings/stores/subscribe";
import { getOrConvertToTwoWayBinding } from "@src/bindings/twoway/convertToTwoWay";
import { Rectangle } from "@src/positional/rectangle";
import { BuildOutput } from "@src/windows/buildOutput";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../positional/size";
import { ensureDefaultLineHeight } from "../constants";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { fillLayout } from "../layouts/fillLayout";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
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
export function dropdownSpinner<Position extends SizeParams>(params: DropdownSpinnerParams & Position): WidgetCreator<Position>
{
	ensureDefaultLineHeight(params);

	return toWidgetCreator(DropdownSpinnerControl, params);
}


const spinnerControlsWidth = 25;


/**
 * A dropdown with a spinner control on the side.
 */
class DropdownSpinnerControl<Position> extends DropdownControl<Position>
{
	_spinner: SpinnerControl<Position>;

	constructor(output: BuildOutput, params: DropdownSpinnerParams & Position)
	{
		// Ensure selectedIndex is a two-way store to keep the spinner and dropdown in sync.
		const selectedIndex = getOrConvertToTwoWayBinding(params.selectedIndex, 0);

		// Setup internal spinner control
		const spinParams: SpinnerParams = {
			tooltip: params.tooltip,
			disabled: params.disabled,
			visibility: params.visibility,
			wrapMode: params.wrapMode || "wrap",
			minimum: 0,
			value: selectedIndex,
			onChange: params.onChange
		};

		// If items is a store, ensure the spinner maximum is always updated when the item list changes.
		const items = <Bindable<string[]> | undefined>params.items;
		if (isStore(items))
		{
			const maximum = store(0);
			subscribe(items, val =>
			{
				const length = val.length;
				maximum.set(length > 0 ? (length - 1) : 0);
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

		const spinner = new SpinnerControl(output, <SpinnerParams & Position>spinParams);
		super(output, params);

		this._spinner = spinner;
	}


	/**
	 * Positions the two widgets in the proper location.
	 */
	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		// Position spinner (only show controls next to dropdown)
		fillLayout(area, widgets, this._spinner.name);

		// Position dropdown (leave space for spinner controls)
		area.width -= spinnerControlsWidth;
		fillLayout(area, widgets, this.name);
	}
}
