import { BuildOutput } from "../core/buildOutput";
import { WidgetFactory } from "../core/widgetFactory";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Bindable } from "../observables/bindable";
import { Observable } from "../observables/observable";
import * as Log from "../utilities/logger";
import * as MathHelper from "../utilities/math";
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
	 */
	format?: (value: number) => string;
}


export const SpinnerFactory: WidgetFactory<SpinnerParams> =
{
	create(output: BuildOutput, params: SpinnerParams): LayoutFunction
	{
		const control = new SpinnerControl(output, params);
		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, control.name, area);
	}
};


/**
 * A controller class for a spinner widget.
 */
class SpinnerControl extends Control<SpinnerWidget> implements SpinnerWidget, SpinnerParams
{
	text?: string;
	value: Observable<number>;
	increment: number = 1;
	minimum: number = 0;
	maximum: number = 0;
	wrapMode: SpinnerWrapMode;
	onChange?: (value: number, adjustment: number) => void;

	/**
	 * Create a spinner control with the specified parameters.
	 */
	constructor(output: BuildOutput, params: SpinnerParams)
	{
		super("spinner", output, params);

		this.value = (params.value instanceof Observable)
			? params.value
			: new Observable((params.value) ? params.value : 0);

		const binder = output.binder;
		binder.read(this, "text", this.value, params.format);
		binder.read(this, "increment", params.increment);
		binder.read(this, "minimum", params.minimum);
		binder.read(this, "maximum", params.maximum);
		this.wrapMode = (params.wrapMode) ? params.wrapMode : "wrap";
		this.onChange = params.onChange;
	}

	/**
	 * Called when the spinner value is incremented by the user.
	 */
	onIncrement(): void
	{
		this.onUpdate(this.value.get() + this.increment);
	}

	/**
	 * Called when the spinner value is decremented by the user.
	 */
	onDecrement(): void
	{
		this.onUpdate(this.value.get() - this.increment);
	}

	/**
	 * Callback for when the value of the spinner is incremented or decremented.
	 */
	private onUpdate(value: number): void
	{
		const min = this.minimum;
		const max = this.maximum;

		if (min >= max)
		{
			Log.debug(`(${this.name}) Minimum ${min} is equal to or larger than maximum ${max}, value ${value} was not applied.`);
			return;
		}

		let result: number;
		switch (this.wrapMode)
		{
			default:
			{
				result = MathHelper.wrap(value, min, max);
				break;
			}
			case "clamp":
			{
				result = MathHelper.clamp(value, min, max);
				break;
			}
			case "clampThenWrap":
			{
				const oldValue = this.value.get();
				// Wrap if old value is at the limit, otherwise clamp.
				result = (value < min && oldValue === min) || (value >= max && oldValue === (max - 1))
					? MathHelper.wrap(value, min, max)
					: MathHelper.clamp(value, min, max);
				break;
			}
		}
		this.value.set(result);
		if (this.onChange)
		{
			this.onChange(result, this.increment);
		}
	}
}
