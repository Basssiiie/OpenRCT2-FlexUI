import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { isObservable } from "@src/observables/isObservable";
import { Observable } from "@src/observables/observable";
import { observable } from "@src/observables/observableConstructor";
import { Positions } from "@src/positional/positions";
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
export function toggle<TPos extends Positions>(params: ToggleParams & TPos): WidgetCreator<ToggleParams & TPos>
{
	return {
		params: params,
		create: (output: BuildOutput): ToggleControl => new ToggleControl(output, params)
	};
}


/**
 * A controller class for a toggle button widget.
 */
class ToggleControl extends ButtonControl implements ButtonWidget, ToggleParams
{
	toggled: Observable<boolean>;
	onChange?: (isPressed: boolean) => void;

	constructor(output: BuildOutput, params: ToggleParams & ButtonParams)
	{
		// Ensure isPressed is an observable, so we can update
		// the live widget more easily.
		const pressed = params.isPressed;
		const toggled = (isObservable(pressed))
			? pressed : observable(!!pressed);

		params.isPressed = toggled;
		params.onClick = (): void => updateToggle(this);

		super(output, params);
		this.toggled = toggled;
		this.onChange = params.onChange;
	}
}


/**
 * Callback that toggles the button when it gets pressed.
 */
function updateToggle(toggle: ToggleControl): void
{
	const observable = toggle.toggled;
	const newValue = !observable.get();

	observable.set(newValue);
	if (toggle.onChange)
	{
		toggle.onChange(newValue);
	}
}