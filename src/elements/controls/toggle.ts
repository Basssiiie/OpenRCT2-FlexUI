import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import { Store } from "@src/bindings/stores/store";
import { BuildOutput } from "@src/building/buildOutput";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgetCreator";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { ButtonControl, ButtonParams } from "./button";


/**
 * The parameters for configuring the toggle button.
 */
export interface ToggleParams extends Omit<ButtonParams, "onClick">
{
	/**
	 * Triggers when the toggle button is pressed down or released.
	 */
	onChange?: (isPressed: boolean) => void;
}


/**
 * Add a button that can be toggled on and off.
 */
export function toggle(params: ToggleParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function toggle(params: ToggleParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function toggle(params: ToggleParams & Positions): WidgetCreator<Positions>
{
	return (parent, output) => new ToggleControl(parent, output, params);
}


/**
 * A controller class for a toggle button widget.
 */
class ToggleControl extends ButtonControl implements ButtonWidget, ToggleParams
{
	onChange?: (isPressed: boolean) => void;

	_toggled: Store<boolean>;

	constructor(parent: ParentControl, output: BuildOutput, params: ToggleParams & ButtonParams)
	{
		// Ensure isPressed is a store, so we can update
		// the live widget more easily.
		const pressed = params.isPressed;
		const toggled = (isStore(pressed))
			? pressed : store(!!pressed);

		params.isPressed = toggled;
		params.onClick = (): void => updateToggle(this);

		super(parent, output, params);
		this._toggled = toggled;
		this.onChange = params.onChange;
	}
}


/**
 * Callback that toggles the button when it gets pressed.
 */
function updateToggle(toggle: ToggleControl): void
{
	const store = toggle._toggled;
	const newValue = !store.get();

	store.set(newValue);
	if (toggle.onChange)
	{
		toggle.onChange(newValue);
	}
}