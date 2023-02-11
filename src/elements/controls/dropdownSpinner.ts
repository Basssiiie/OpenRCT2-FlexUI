import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import { Store } from "@src/bindings/stores/store";
import { storify } from "@src/bindings/stores/storify";
import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import { WidgetMap } from "@src/building/widgets/widgetMap";
import { Rectangle } from "@src/positional/rectangle";
import { ensureDefaultLineHeight } from "../constants";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { fillLayout } from "../layouts/fillLayout";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { DropdownControl, DropdownParams } from "./dropdown";
import { SpinnerControl, SpinnerParams, SpinnerWrapMode } from "./spinner";
import * as Log from "@src/utilities/logger";
import { ParentControl } from "@src/building/parentControl";
import { subscribe } from "@src/bindings/stores/subscribe";


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
	_selectedIndex: Store<number>;
	_userOnChange?: (index: number) => void;

	constructor(parent: ParentControl, output: BuildOutput, params: DropdownSpinnerParams)
	{
		// Ensure selectedIndex is a store, so we can update it easily when
		// the spinner is used.
		const selected = params.selectedIndex;
		const selectedStore = storify(selected || 0);
		params.selectedIndex = selectedStore;

		// Setup internal spinner control
		const spinParams: SpinnerParams =
		{
			tooltip: params.tooltip,
			disabled: params.disabled,
			visibility: params.visibility,
			wrapMode: params.wrapMode || "wrap",
			minimum: 0,
			value: selectedStore,
			onChange: (value: number) =>
			{
				// Changing selectedIndex triggers an onChange; setting this boolean
				// makes the control ignore that onChange event.
				Log.debug("Dropdown spinner", this.name, "spin value has changed:", this._selectedIndex.get(), "->", value);
				this._selectedIndex.set(value);
				if (this._userOnChange)
				{
					this._userOnChange(value);
				}
			}
		};

		// Setup dropdown callback
		const userOnChange = params.onChange;
		params.onChange = (idx): void =>
		{
			Log.debug("Dropdown spinner", this.name, "selectedIndex has changed:", this._selectedIndex.get(), "->", idx);
			this._selectedIndex.set(idx);
			if (this._userOnChange)
			{
				this._userOnChange(idx);
			}
		};

		// If items is a store, ensure the spinner maximum is always updated
		// when the item list changes.
		const items = params.items;
		if (isStore(items))
		{
			const maximum = store(0);
			subscribe(items, v => maximum.set((v) ? v.length : 0));
			spinParams.maximum = maximum;
		}
		else if (items)
		{
			spinParams.maximum = items.length;
		}

		const spinner = new SpinnerControl(parent, output, spinParams);
		super(parent, output, params);

		this._spinner = spinner;
		this._selectedIndex = selectedStore;
		this._userOnChange = userOnChange;
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
