import { Bindable } from "@src/bindings/bindable";
import { isStore } from "@src/bindings/stores/isStore";
import { BuildOutput } from "@src/building/buildOutput";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import { FrameContext } from "@src/building/frames/frameContext";
import { isNullOrUndefined, isNumber, isObject } from "@src/utilities/type";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";
import { on } from "@src/bindings/stores/on";
import * as Log from "@src/utilities/logger";


const FarAway: CoordsXY = { x: -9000, y: -9000 };


/**
 * Available visibility flags for the viewport.
 */
export const enum ViewportFlags
{
	UndergroundInside = (1 << 0),
	SeeThroughRides = (1 << 1),
	SeeThroughScenery = (1 << 2),
	InvisibleSupports = (1 << 3),
	LandHeights = (1 << 4),
	TrackHeights = (1 << 5),
	PathHeights = (1 << 6),
	Gridlines = (1 << 7),
	LandOwnership = (1 << 8),
	ConstructionRights = (1 << 9),
	SoundOn = (1 << 10),
	InvisiblePeeps = (1 << 11),
	HideBase = (1 << 12),
	HideVertical = (1 << 13),
	InvisibleSprites = (1 << 14),
	//Flag15 = (1 << 15), // not used anywhere in the game's source code
	SeeThroughPaths = (1 << 16),
	ClipView = (1 << 17),
	HighlightPathIssues = (1 << 18),
	TransparentBackground = (1 << 19),
}


/**
 * The parameters for configuring the viewport.
 */
export interface ViewportParams extends ElementParams
{
	/**
	 * The target coordinates or entity id to view within the viewport.
	 */
	target?: Bindable<CoordsXY | CoordsXYZ | number | null>;

	/**
	 * The rotation to set the viewport to, from 0 to 3.
	 */
	rotation?: Bindable<0 | 1 | 2 | 3>;

	/**
	 * The zoom-level to set it to. Available zoom levels are 0 to 3 on all drawing engines.
	 * On OpenGL -1 and -2 are also available, which equal to 0 on other drawing engines.
	 */
	zoom?: Bindable<number>;

	/**
	 * Special visibility flags for this viewport.
	 */
	visibilityFlags?: Bindable<ViewportFlags>;
}


/**
 * Add a viewport for displaying a location somewhere on the map.
 */
export function viewport(params: ViewportParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function viewport(params: ViewportParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function viewport(params: ViewportParams & Positions): WidgetCreator<Positions>
{
	return (parent, output) => new ViewportControl(parent, output, params);
}


/**
 * A controller class for a viewport widget.
 */
class ViewportControl extends Control<ViewportWidget> implements ViewportWidget
{
	viewport = <Viewport>{
		left: FarAway.x,
		top: FarAway.y,
	};

	_target?: CoordsXY | CoordsXYZ | number | null;


	/**
	 * Create a viewport control with the specified parameters.
	 */
	constructor(parent: ParentControl, output: BuildOutput, params: ViewportParams)
	{
		super("viewport", parent, output, params);

		const target = params.target;
		if (isStore(target) || isNumber(target))
		{
			output.on("update", (context) => updateViewport(this, context));
		}
		else if (!isNullOrUndefined(target))
		{
			// Flat coordinates do not need to be updated every frame.
			output.on("open", (context) => updateViewport(this, context));
		}

		const binder = output.binder;
		binder.add(this, "rotation", params.rotation, undefined, getNestedViewport);
		binder.add(this, "zoom", params.zoom, undefined, getNestedViewport);
		binder.add(this, "visibilityFlags", params.visibilityFlags, undefined, getNestedViewport);
		on(target, t => this._target = t);
	}
}


/**
 * Helper for the binder to find the nested viewport.
 */
function getNestedViewport(widget: ViewportWidget): Viewport
{
	Log.assert(!!widget.viewport, `Viewport widget '${widget.name}' does not have a viewport.`);
	return <Viewport>widget.viewport;
}


/**
 * Finds the widget for the specified viewport control to update it.
 */
function updateViewport(control: ViewportControl, context: FrameContext): void
{
	const viewport = context.getWidget<ViewportWidget>(control.name);
	if (!viewport || !viewport.viewport)
		return;

	goToTarget(viewport.viewport, control._target);
}


/**
 * Updates the viewport to target the target.
 */
function goToTarget(viewport: Viewport, target: CoordsXY | CoordsXYZ | number | null | undefined): void
{
	if (!isNullOrUndefined(target))
	{
		if (isNumber(target))
		{
			const entity = map.getEntity(target);
			if (entity)
			{
				viewport.moveTo({
					x: entity.x,
					y: entity.y,
					z: entity.z
				});
				return;
			}
		}
		else if (isObject(target))
		{
			viewport.moveTo(target);
			return;
		}
	}

	viewport.moveTo(FarAway);
}
