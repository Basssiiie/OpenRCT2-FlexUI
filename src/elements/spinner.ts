import { BuildOutput } from "@src/core/buildOutput";
import { defaultLineHeight } from "@src/core/defaults";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { isObservable } from "@src/observables/isObservable";
import { Observable } from "@src/observables/observable";
import { observable } from "@src/observables/observableConstructor";
import { Positions } from "@src/positional/positions";
import * as MathHelper from "@src/utilities/math";
import { isUndefined } from "@src/utilities/type";
import { Control } from "./control";
import { ElementParams } from "./element";


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
export function spinner<TPos extends Positions>(params: SpinnerParams & TPos): WidgetCreator<SpinnerParams & TPos>
{
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
	minimum: number = 0;
	maximum: number = 0;

	_value: Observable<number>;
	_wrapMode: SpinnerWrapMode;
	_onChange?: (value: number, adjustment: number) => void;


	constructor(output: BuildOutput, params: SpinnerParams & Positions)
	{
		super("spinner", output, params);

		if (isUndefined(params.height))
			params.height = defaultLineHeight;

		// Make value an observable regardless of user choice,
		// to make updating the text more convenient.
		const value = params.value;
		this._value = (isObservable(value))
			? value : observable(value || 0);

		// Do a standard .toString() if the format function is not provided.
		const format = (params.format)
			? params.format
			: ((value: number): string => value.toString());

		const binder = output.binder;
		binder.add(this, "text", this._value, format);
		binder.add(this, "step", params.step);
		binder.add(this, "minimum", params.minimum);
		binder.add(this, "maximum", params.maximum);
		this._wrapMode = (params.wrapMode) ? params.wrapMode : "wrap";
		this._onChange = params.onChange;
		this.onIncrement = (): void => updateSpinnerValue(this, this.step);
		this.onDecrement = (): void => updateSpinnerValue(this, -this.step);

		if (this.minimum > this.maximum)
		{
			throw Error(`Spinner: minimum ${this.minimum} is equal to or larger than maximum ${this.maximum}.`);
		}
	}
}


/**
 * Callback for when the value of the spinner is incremented or decremented.
 */
function updateSpinnerValue(spinner: SpinnerControl, step: number): void
{
	const min = spinner.minimum;
	const max = spinner.maximum;

	if (min >= max)
		return;

	const oldValue = spinner._value.get();
	const newValue = (oldValue + step);

	let result: number;
	switch (spinner._wrapMode)
	{
		default:
		{
			result = MathHelper.wrap(newValue, min, max);
			break;
		}
		case "clamp":
		{
			result = MathHelper.clamp(newValue, min, max);
			break;
		}
		case "clampThenWrap":
		{
			// Wrap if old value is at the limit, otherwise clamp.
			result = (newValue < min && oldValue === min) || (newValue >= max && oldValue === (max - 1))
				? MathHelper.wrap(newValue, min, max)
				: MathHelper.clamp(newValue, min, max);
			break;
		}
	}
	spinner._value.set(result);

	if (spinner._onChange)
	{
		spinner._onChange(result, step);
	}
}