import { Bindable } from "@src/bindings/bindable";
import { on } from "@src/bindings/stores/on";
import { Store } from "@src/bindings/stores/store";
import { storify } from "@src/bindings/stores/storify";
import { BuildOutput } from "@src/building/buildOutput";
import { ParentControl } from "@src/building/parentControl";
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
	 * @default -(2^31) (min. 32-bit signed integer)
	 */
	minimum?: Bindable<number>;


	/**
	 * The maximum possible value that the spinner can reach. (Exclusive)
	 * @default (2^31) (max. 32-bit signed integer)
	 */
	maximum?: Bindable<number>;


	/**
	 * The amount to increment or decrement per interaction.
	 * @default 1
	 */
	step?: Bindable<number>;


	/**
	 * Sets whether the spinner value wraps around or clamps to its boundaries.
	 * @default "clamp"
	 */
	wrapMode?: SpinnerWrapMode;


	/**
	 * Sets the message that will show when the spinner is not available.
	 * @default undefined
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
export function spinner(params: SpinnerParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function spinner(params: SpinnerParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function spinner(params: SpinnerParams & Positions): WidgetCreator<Positions>
{
	ensureDefaultLineHeight(params);

	return (parent, output) => new SpinnerControl(parent, output, params);
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
	min: number = -(2 ** 31); // min. 32-bit signed integer
	max: number = (2 ** 31); // max. 32-bit signed integer

	_value: Store<number>;
	_wrapMode: SpinnerWrapMode;
	_onChange?: (value: number, adjustment: number) => void;


	constructor(parent: ParentControl, output: BuildOutput, params: SpinnerParams)
	{
		super("spinner", parent, output, params);

		// Make value a store regardless of user choice,
		// to make updating the text more convenient.
		this._value = storify(params.value || 0);

		// Do a standard .toString() if the format function is not provided.
		let format = (params.format || ((value: number): string => value.toString()));

		const binder = output.binder;
		const { disabledMessage, minimum, maximum } = params;
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
		binder.add(this, "min", minimum);
		binder.add(this, "max", maximum);

		on(minimum, min =>
		{
			if (this._value.get() < min)
			{
				this._value.set(min);
			}
		});
		on(maximum, max =>
		{
			if (this._value.get() >= max)
			{
				this._value.set(max - 1);
			}
		});

		this._wrapMode = (params.wrapMode || "clamp");
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
	const { min, max } = spinner;
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
			result = clamp(newValue, min, max);
			break;
		}
		case "wrap":
		{
			result = wrap(newValue, min, max);
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