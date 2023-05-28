import { Bindable } from "@src/bindings/bindable";
import { on } from "@src/bindings/stores/on";
import { read } from "@src/bindings/stores/read";
import { wrap } from "@src/bindings/stores/wrap";
import { WritableStore } from "@src/bindings/stores/writableStore";
import { isTwoWay } from "@src/bindings/twoway/isTwoWay";
import { TwoWayBindable } from "@src/bindings/twoway/twowayBindable";
import * as Log from "@src/utilities/logger";
import * as MathUtils from "@src/utilities/math";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { SizeParams } from "../../positional/size";
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
	value?: TwoWayBindable<number>;

	/**
	 * The minimum possible value that the spinner can reach. This number is inclusive.
	 * @default -(2^31) (min. 32-bit signed integer)
	 */
	minimum?: Bindable<number>;


	/**
	 * The maximum possible value that the spinner can reach. This number is inclusive.
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
export function spinner<I extends SizeParams, P>(params: SpinnerParams & I): WidgetCreator<I, P>
{
	ensureDefaultLineHeight(params);

	return (parent, output) => new SpinnerControl(parent, output, params);
}


/**
 * A controller class for a spinner widget.
 */
export class SpinnerControl<I, P> extends Control<SpinnerDesc, I, P> implements SpinnerDesc
{
	text?: string;
	onIncrement: () => void;
	onDecrement: () => void;

	_step: number = 1;
	_minimum: number = -(2 ** 31); // min. 32-bit signed integer
	_maximum: number = (2 ** 31) - 1; // max. 32-bit signed integer

	_value: WritableStore<number>;
	_wrapMode: SpinnerWrapMode;
	_onChange?: (value: number, adjustment: number) => void;


	constructor(parent: ParentControl<I, P>, output: BuildOutput, params: SpinnerParams & I)
	{
		super("spinner", parent, output, params);

		// Make value a store regardless of user choice,
		// to make updating the text more convenient.
		const original = params.value;
		const value = (isTwoWay(original)) ? original.twoway : wrap(original || 0);

		// Do a standard .toString() if the format function is not provided.
		let format = (params.format || ((value: number): string => value.toString()));

		const binder = output.binder;
		const { disabledMessage, minimum, maximum } = params;
		if (disabledMessage)
		{
			// If disabled, it should show a special message, if not show the (binded) text.
			const disabled = params.disabled;
			binder.add(this, "text", disabled, (isDisabled) =>
			{
				Log.debug("Spinner", this.name, "isDisabled has changed, set disabled message:", isDisabled);
				return (isDisabled) ? disabledMessage : format(value.get());
			});
			const originalFormat = format;
			format = (val: number): string => (read(disabled)) ? disabledMessage : originalFormat(val);
		}

		this._value = value;
		binder.add(this, "text", value, format);

		on(params.step, s => this._step = s);
		on(minimum, min =>
		{
			const current = value.get();
			this._minimum = min;
			if (current < min)
			{
				this._updateValueAndTriggerChange(min, min - current);
			}
		});
		on(maximum, max =>
		{
			const current = value.get();
			this._maximum = max;
			if (current > max)
			{
				this._updateValueAndTriggerChange(max, max - current);
			}
		});

		this._wrapMode = (params.wrapMode || "clamp");
		this._onChange = params.onChange;

		this.onIncrement = (): void => this._onUserInput(1);
		this.onDecrement = (): void => this._onUserInput(-1);

		if (this._minimum > this._maximum)
		{
			Log.thrown("Spinner: minimum " + this._minimum + " is larger than maximum " + this._maximum);
		}
	}

	/**
	 * Callback for when the value of the spinner is incremented or decremented.
	 */
	private _onUserInput(direction: number): void
	{
		const min = this._minimum, max = this._maximum;
		if (min >= max)
			return;

		const step = (this._step * direction);
		const oldValue = this._value.get();
		const newValue = (oldValue + step);

		let result: number;
		switch (this._wrapMode)
		{
			case "wrap":
			{
				result = MathUtils.wrap(newValue, min, max);
				break;
			}
			case "clampThenWrap":
			{
				// Wrap if old value is at the limit, otherwise clamp.
				result = (newValue < min && oldValue === min) || (newValue > max && oldValue === max)
					? MathUtils.wrap(newValue, min, max)
					: MathUtils.clamp(newValue, min, max);
				break;
			}
			default:
			{
				result = MathUtils.clamp(newValue, min, max);
				break;
			}
		}
		this._updateValueAndTriggerChange(result, step);
	}

	/**
	 * Updates the internal spinner value and triggers an external update.
	 */
	private _updateValueAndTriggerChange(value: number, step: number): void
	{
		this._value.set(value);
		if (this._onChange)
		{
			this._onChange(value, step);
		}
	}
}
