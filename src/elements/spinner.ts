import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { Observable } from "@src/observables/observable";
import { Positions } from "@src/positional/positions";
import * as MathHelper from "@src/utilities/math";
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
	increment?: Bindable<number>;


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
export function spinner(params: SpinnerParams & Positions): WidgetCreator<SpinnerParams & Positions>
{
	return {
		params: params,
		create: (output: BuildOutput): SpinnerControl => new SpinnerControl(output, params)
	};
}


/**
 * A controller class for a spinner widget.
 */
export class SpinnerControl extends Control<SpinnerWidget> implements SpinnerWidget, SpinnerParams
{
	text?: string;
	value: Observable<number>;
	increment: number = 1;
	minimum: number = 0;
	maximum: number = 0;
	wrapMode: SpinnerWrapMode;
	onChange?: (value: number, adjustment: number) => void;


	constructor(output: BuildOutput, params: SpinnerParams)
	{
		super("spinner", output, params);

		// Make value an observable regardless of user choice,
		// to make updating the text more convenient.
		this.value = (params.value instanceof Observable)
			? params.value
			: new Observable((params.value) ? params.value : 0);

		// Do a standard .toString() if the format function is not provided.
		const format = (params.format)
			? params.format
			: ((value: number): string => value.toString());

		const binder = output.binder;
		binder.add(this, "text", this.value, format);
		binder.add(this, "increment", params.increment);
		binder.add(this, "minimum", params.minimum);
		binder.add(this, "maximum", params.maximum);
		this.wrapMode = (params.wrapMode) ? params.wrapMode : "wrap";
		this.onChange = params.onChange;

		if (this.minimum >= this.maximum)
		{
			throw Error(`Spinner: minimum ${this.minimum} is equal to or larger than maximum ${this.maximum}.`);
		}
	}

	/**
	 * Called when the spinner value is incremented by the user.
	 */
	onIncrement(): void
	{
		updateSpinnerValue(this, this.increment);
	}

	/**
	 * Called when the spinner value is decremented by the user.
	 */
	onDecrement(): void
	{
		updateSpinnerValue(this, -this.increment);
	}
}


/**
 * Callback for when the value of the spinner is incremented or decremented.
 */
function updateSpinnerValue(spinner: SpinnerControl, increment: number): void
{
	const min = spinner.minimum;
	const max = spinner.maximum;

	if (min >= max)
		return;

	const oldValue = spinner.value.get();
	const newValue = (oldValue + increment);

	let result: number;
	switch (spinner.wrapMode)
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
	spinner.value.set(result);

	if (spinner.onChange)
	{
		spinner.onChange(result, increment);
	}
}