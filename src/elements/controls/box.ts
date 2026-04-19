import { Bindable } from "@src/bindings/bindable";
import { WritableStore } from "@src/bindings/stores/writableStore";
import { Axis } from "@src/positional/axis";
import { Paddable } from "@src/positional/paddable";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../positional/size";
import { redrawEvent } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { ContainerFlags, getDesiredSpaceFromChildForDirection, getInheritanceFlags } from "../layouts/flexible/desiredSpacing";
import { bindFlexiblePosition, FlexFlags, FlexibleContainer } from "../layouts/flexible/flexibleLayout";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { ParsedFlexiblePosition } from "../layouts/flexible/parsedFlexiblePosition";
import { setSizeWithPadding } from "../layouts/paddingHelpers";
import { Control } from "./control";


/**
 * The content to show within the box.
 */
export type BoxContainer = WidgetCreator<FlexiblePosition>;


/**
 * The parameters for configuring a visual box in the user interface.
 */
export interface BoxParams extends ElementParams
{
	/**
	 * The content to show within the box. The content will be padded to `6px`
	 * if `padding` is not set on this content.
	 */
	content: BoxContainer;

	/**
	 * An optionel label to show at the top of the box.
	 * @default undefined
	 */
	text?: Bindable<string>;
}


/**
 * Create a visually drawn box for bringing focus to an inner widget.
 */
export function box(params: BoxContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function box(params: BoxContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function box(params: BoxParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function box(params: BoxParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function box<Position extends SizeParams>(params: (BoxParams | BoxContainer) & Position): WidgetCreator<Position>
{
	return toWidgetCreator(BoxControl, params);
}


const enum BoxFlags
{
	AddTitlePadding = (ContainerFlags.Count << 1)
}

const trimTopWithoutTitle = 4;
let defaultBoxPaddingWithTitle: ParsedPadding | undefined;
let defaultBoxPaddingWithoutTitle: ParsedPadding | undefined;


/**
 * A controller class for a groupbox widget.
 */
export class BoxControl<Position extends SizeParams & Paddable>
	extends Control<GroupBoxDesc, Position>
	implements GroupBoxDesc, FlexibleContainer
{
	text?: string;

	_width?: WritableStore<number | undefined>;
	_height?: WritableStore<number | undefined>;
	_flags: number;

	_position: ParsedFlexiblePosition;
	_layoutable: Layoutable;

	constructor(output: BuildOutput, params: (BoxParams | BoxContainer) & Position)
	{
		const type = "groupbox";
		const content = "content";
		let flags = getInheritanceFlags(params) | FlexFlags.ComputeBoth;
		let creator: WidgetCreator<FlexiblePosition>;

		if (content in params)
		{
			// Is BoxParams (complex object)
			super(type, output, params);
			creator = params[content];

			const binder = output.binder;
			const text = params.text;
			binder.add(this, "text", text);
			flags |= (text) ? BoxFlags.AddTitlePadding : 0;
		}
		else
		{
			// Is BoxContainer (flat params, just a creator)
			super(type, output, <Position>{});
			creator = params;
		}

		this._flags = flags;

		const fallbackPadding = (flags & BoxFlags.AddTitlePadding)
			// Cache default paddings only if used
			? (defaultBoxPaddingWithTitle ||= parsePadding([15, 6, 6, 6]))
			: (defaultBoxPaddingWithoutTitle ||= parsePadding(6));
		const child = creator.create(output); // fixme: the order of these calls matters
		const position = bindFlexiblePosition(this, output.binder, params, creator.position, fallbackPadding);
		const width = this._width;
		const height = this._height;

		this._layoutable = child;
		this._position = position;

		if (width || height)
		{
			// If any axis is computable, bind the redraw callback.
			output.on(redrawEvent, this._recalculate.bind(this));
			this._recalculate();
		}

		// Handle static inheritance for children (without any stores)
		if (!width && (flags & ContainerFlags.InheritWidth))
		{
			params.width = getDesiredSpaceFromChildForDirection(position, Axis.Horizontal);
			Log.debug("Box(", this.name, "): static width is", params.width);
		}
		if (!height && (flags & ContainerFlags.InheritHeight))
		{
			params.height = getDesiredSpaceFromChildForDirection(position, Axis.Vertical);
			Log.debug("Box(", this.name, "): static height is", params.height);
		}
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug("Box(", this.name, ") layout() for area:", Log.stringify(area));
		// Align visual box with layout box, will move label slightly out of bounds.
		const trim = (this._flags & BoxFlags.AddTitlePadding) ? 0 : trimTopWithoutTitle;
		area.y -= trim;
		area.height += trim;
		super.layout(widgets, area);
		area.y += trim;
		area.height -= trim;

		const child = this._layoutable;
		const position = this._position;
		Log.debug("Box(", this.name, ") layout() child size:", position._width, "x", position._height);
		setSizeWithPadding(area, position._width, position._height, position._padding);
		child.layout(widgets, area);
	}

	private _recalculate()
	{
		const flags = this._flags;
		Log.debug("Box(", this.name, "): recalculate size from children ->", !!(flags & FlexFlags.ComputeBoth));
		if (flags & FlexFlags.ComputeWidth)
		{
			const position = this._position;
			const width = this._width;
			const height = this._height;

			if (width && (flags & (FlexFlags.ComputeHeight | ContainerFlags.InheritWidth)) == (FlexFlags.ComputeHeight | ContainerFlags.InheritWidth))
			{
				const newWidth = getDesiredSpaceFromChildForDirection(position, Axis.Horizontal);
				Log.debug("Box(", this.name, "): recalculated width from", width.get(), "to", newWidth);
				width.set(newWidth);
			}
			if (height && (flags & (FlexFlags.ComputeWidth | ContainerFlags.InheritHeight)) == (FlexFlags.ComputeWidth | ContainerFlags.InheritHeight))
			{
				const newHeight = getDesiredSpaceFromChildForDirection(position, Axis.Vertical);
				Log.debug("Box(", this.name, "): recalculated height from", height.get(), "to", newHeight);
				height.set(newHeight);
			}

			// Clear recalculate flag
			this._flags &= ~FlexFlags.ComputeBoth;
		}

	}
}
