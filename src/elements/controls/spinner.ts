import { Bindable } from "@src/bindings/bindable";
import { Store } from "@src/bindings/stores/store";
import { storify } from "@src/bindings/stores/storify";
import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import * as Log from "@src/utilities/logger";
import { clamp, wrap } from "@src/utilities/math";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


/**
 * Determines whether the spinner value wraps around or clamps to its boundaries.
 */
export type SpinnerWrapMode = "wrap" | "clamp" | "clampThenWrap";


/**
 * The parameters for configuring the spinner.
 */
export interface SpinnerParams extends ElementParams
{
	/**
	 * The value within the spinner.
	 * @default 0
	 */
	value?: Bindable<number>;

	/**
	 * The minimum possible value that the spinner can reach. (Inclusive)
	 * @default 0
	 */
	minimum?: Bindable<number>;


	/**
	 * The maximum possible value that the spinner can reach. (Exclusive)
	 */
	maximum: Bindable<number>;


	/**
	 * The amount to increment or decrement per interaction.
	 * @default 1
	 */
	step?: Bindable<number>;


	/**
	 * Sets whether the spinner value wraps around or clamps to its boundaries.
	 * @default "wrap"
	 */
	wrapMode?: SpinnerWrapMode;


	/**
	 * Sets the message that will show when the spinner is not available.
	 * @default undefined
	 * @todo Implement.
	 */
	disabledMessage?: string;


	/**
	 * Triggers when the spinner value changes. The adjustment specifies the change
	 * that has been applied to the value in the spinner.
	 */
	onChange?: (value: number, adjustment: number) => void;


	/**
	 * Allows for a custom formatted display every time the value gets refreshed.
	 * @default value.toString()
	 */
	format?: (value: number) => string;
}


/**
 * Add a spinner widget with [+] and [-] buttons.
 */
export function spinner(params: SpinnerParams & FlexiblePosition): WidgetCreator<SpinnerParams & FlexiblePosition>;
export function spinner(params: SpinnerParams & AbsolutePosition): WidgetCreator<SpinnerParams & AbsolutePosition>;
export function spinner(params: SpinnerParams & Positions): WidgetCreator<SpinnerParams>
{
	ensureDefaultLineHeight(params);

	return {
		params: params,
		create: (output: BuildOutput): SpinnerControl => new SpinnerControl(output, params)
	};
}


/**
 * A controller class for a spinner widget.
 */
export class SpinnerControl extends Control<SpinnerWidget> implements SpinnerWidget
{
	text?: string;
	onIncrement: () => void;
	onDecrement: () => void;

	step: number = 1;
	min: number = 0;
	max: number = 0;

	_value: Store<number>;
	_wrapMode: SpinnerWrapMode;
	_onChange?: (value: number, adjustment: number) => void;


	constructor(output: BuildOutput, params: SpinnerParams)
	{
		super("spinner", output, params);

		// Make value a store regardless of user choice,
		// to make updating the text more convenient.
		this._value = storify(params.value || 0);

		// Do a standard .toString() if the format function is not provided.
		let format = (params.format || ((value: number): string => value.toString()));

		const binder = output.binder;
		const disabledMessage = params.disabledMessage;
		if (disabledMessage)
		{
			// If disabled, it should show a special message, if not show the (binded) items.
			binder.add(this, "text", params.disabled, (isDisabled) =>
			{
				Log.debug(`Spinner '${this.name}' isDisabled has changed, set disabled message: ${isDisabled}`);
				return (isDisabled) ? disabledMessage : format(this._value.get());
			});
			const originalFormat = format;
			format = (val: number): string => (this.isDisabled) ? disabledMessage : originalFormat(val);
		}

		binder.add(this, "text", this._value, format);
		binder.add(this, "step", params.step);
		binder.add(this, "min", params.minimum);
		binder.add(this, "max", params.maximum);

		this._wrapMode = (params.wrapMode) ? params.wrapMode : "wrap";
		this._onChange = params.onChange;

		this.onIncrement = (): void => updateSpinnerValue(this, 1);
		this.onDecrement = (): void => updateSpinnerValue(this, -1);

		if (this.min > this.max)
		{
			throw Error(`Spinner: minimum ${this.min} is larger than maximum ${this.max}.`);
		}
	}
}


/**
 * Callback for when the value of the spinner is incremented or decremented.
 */
function updateSpinnerValue(spinner: SpinnerControl, direction: number): void
{
	const min = spinner.min, max = spinner.max;
	if (min >= max)
		return;

	const step = (spinner.step * direction);
	const oldValue = spinner._value.get();
	const newValue = (oldValue + step);

	let result: number;
	switch (spinner._wrapMode)
	{
		default:
		{
			result = wrap(newValue, min, max);
			break;
		}
		case "clamp":
		{
			result = clamp(newValue, min, max);
			break;
		}
		case "clampThenWrap":
		{
			// Wrap if old value is at the limit, otherwise clamp.
			result = (newValue < min && oldValue === min) || (newValue >= max && oldValue === (max - 1))
				? wrap(newValue, min, max)
				: clamp(newValue, min, max);
			break;
		}
	}
	spinner._value.set(result);

	if (spinner._onChange)
	{
		spinner._onChange(result, step);
	}
}