import { Scale } from "./scale";


/**
 * Specifies an absolute position relative to the parent area.
 */
export interface AbsolutePosition
{
	/**
	 * The position on the horizontal axis of the top-left corner of the widget,
	 * relative to the top-left corner of the parent area.
	 * @see {@link Scale} for examples of allowed values.
	 */
	x: Scale;

	/**
	 * The position on the vertical axis of the top-left corner of the widget,
	 * relative to the top-left corner of the parent area.
	 * @see {@link Scale} for examples of allowed values.
	 */
	y: Scale;

	/**
	 * The width of this widget on the horizontal axis.
	 * @see {@link Scale} for examples of allowed values.
	 */
	width: Scale;

	/**
	 * The height of this widget on the vertical axis.
	 * @see {@link Scale} for examples of allowed values.
	 */
	height: Scale;
}
