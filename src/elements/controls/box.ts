import { Bindable } from "@src/bindings/bindable";
import { store } from "@src/bindings/stores/createStore";
import { WritableStore } from "@src/bindings/stores/writableStore";
import { Padding } from "@src/positional/padding";
import { parseScaleOrFallback } from "@src/positional/parsing/parseScale";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import * as Log from "@src/utilities/logger";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../positional/size";
import { defaultScale, redrawEvent } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { getInheritanceFlags, InheritFlags } from "../layouts/flexible/desiredSpacing";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
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
	RecalculateWidth = (InheritFlags.Count << 0),
	RecalculateHeight = (InheritFlags.Count << 1),
	RecalculateBoth = RecalculateWidth | RecalculateHeight,

	UseStoreForWidth = (InheritFlags.Count << 2), // TODO merge with FlexFlags?
	UseStoreForHeight = (InheritFlags.Count << 3),
	UseStoreForBoth = UseStoreForWidth | UseStoreForHeight,

	AddTitlePadding = (InheritFlags.Count << 4)
}

const defaultBoxPadding: Padding = 6;
const paddingWithTitle = 15;
const trimTopWithoutTitle = 4;


/**
 * A controller class for a groupbox widget.
 */
export class BoxControl<Position extends SizeParams>
	extends Control<GroupBoxDesc, Position>
	implements GroupBoxDesc
{
	text?: string;

	_child: Layoutable;
	_width?: WritableStore<Scale | undefined>;
	_height?: WritableStore<Scale | undefined>;
	_widthParsed?: ParsedScale;
	_heightParsed?: ParsedScale;
	_flags: number;

	constructor(output: BuildOutput, params: (BoxParams | BoxContainer) & Position)
	{
		const type = "groupbox";
		const content = "content";
		let flags = getInheritanceFlags(params);
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

		this._flags = (flags | BoxFlags.RecalculateBoth);

		const child = creator.create(output);
		const position = creator.position;
		const binder = output.binder;
		/* const parsed = <ParsedFlexiblePosition>{

		}; */
		binder.on(position.width, (value, store) =>
		{
			this._widthParsed = parseScaleOrFallback(value, defaultScale);
			this._flags |= BoxFlags.RecalculateWidth | (store ? BoxFlags.UseStoreForWidth : 0);
			/* if (isStore)
			{
				const parsed = parseScaleOrFallback(value, defaultScale);
				if (this._width)
				{
					this._width = store(parsed);
				}
				this._width = this._width ? ;
				this._flags |= BoxFlags.RecalculateWidth;
			} */
		});
		binder.on(position.height, (value, store) =>
		{
			this._heightParsed = parseScaleOrFallback(value, defaultScale);
			this._flags |= BoxFlags.RecalculateHeight | (store ? BoxFlags.UseStoreForHeight : 0);
		});
		this._child = child;

		if (flags & BoxFlags.UseStoreForWidth)
		{
			this._width = params.width = store<number>();
		}
		if (flags & BoxFlags.UseStoreForHeight)
		{
			this._height = params.height = store<number>();
		}

		output.on(redrawEvent, () =>
		{
			Log.debug("Box(", this.name, "): recalculate size from children ->", !!(this._flags & BoxFlags.RecalculateBoth));
			if (this._flags & BoxFlags.RecalculateBoth)
			{
				// Clear recalculate flag
				this._flags &= ~BoxFlags.RecalculateBoth;

				if (recalculateInheritedSpaceFromChild(this.position, this._flags, position))
				{
					Log.debug("Box(", this.name, "): recalculated size to", Log.stringify(this.position));
				}
			}
		});
	}

	/* parse(position: FlexiblePosition): Parsed<FlexiblePosition>
	{
		const defaultPadding = parsePadding(defaultBoxPadding);
		if (this._flags & BoxFlags.AddTitlePadding)
		{
			defaultPadding.top = [paddingWithTitle, ScaleType.Pixel];
		}
		return parseFlexiblePosition(position, defaultPadding);
	}

	recalculate(): void
	{
		this._flags |= BoxFlags.RecalculateFromChildren;
		if (this._flags & InheritFlags.All)
		{
			this._parent.recalculate();
		}
	} */

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

		const child = this._child;
		const position = child.position;
		Log.debug("Box(", this.name, ") layout() child size:", position.width, "x", position.height);
		setSizeWithPadding(area, position.width, position.height, position.padding);
		child.layout(widgets, area);
	}
}
