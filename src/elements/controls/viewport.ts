import { Bindable } from "@src/bindings/bindable";
import { isStore } from "@src/bindings/isStore";
import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import { WindowContext } from "@src/building/windowContext";
import { isNullOrUndefined, isNumber, isObject } from "@src/utilities/type";
import { ElementParams } from "../element";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


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
export function viewport(params: ViewportParams & FlexiblePosition): WidgetCreator<ViewportParams & FlexiblePosition>;
export function viewport(params: ViewportParams & AbsolutePosition): WidgetCreator<ViewportParams & AbsolutePosition>;
export function viewport(params: ViewportParams & Positions): WidgetCreator<ViewportParams>
{
	return {
		params: params,
		create: (output: BuildOutput): ViewportControl => new ViewportControl(output, params)
	};
}


/**
 * A controller class for a viewport widget.
 */
class ViewportControl extends Control<ViewportWidget> implements ViewportWidget, ViewportParams
{
	// template variables
	target?: CoordsXY | CoordsXYZ | number;
	rotation?: 0 | 1 | 2 | 3;
	zoom?: number;
	visibilityFlags?: ViewportFlags;

	left = FarAway.x;
	top = FarAway.y;
	viewport = <Viewport><unknown>this;


	/**
	 * Create a viewport control with the specified parameters.
	 */
	constructor(output: BuildOutput, params: ViewportParams)
	{
		super("viewport", output, params);

		const name = this.name;
		const target = params.target;
		if (isStore(target) || isNumber(target))
		{
			output.on("update", (context) => updateViewport(context, name, target));
		}
		else if (!isNullOrUndefined(target))
		{
			// Flat coordinates do not need to be updated every frame.
			output.on("open", (context) => updateViewport(context, name, target));
		}

		const binder = output.binder;
		binder.add(this, "target", target);
		binder.add(this, "rotation", params.rotation);
		binder.add(this, "zoom", params.zoom);
		binder.add(this, "visibilityFlags", params.visibilityFlags);

		console.log(`${this.target} <- ${target}`);
	}
}


/**
 * Finds the widget for the specified viewport control to update it.
 */
function updateViewport(context: WindowContext, widgetName: string, target: Bindable<CoordsXY | CoordsXYZ | number | null>): void
{
	const widget = context.getWidget<ViewportWidget>(widgetName);
	if (!widget)
		return;

	const viewport = widget.active;
	if (!viewport || !viewport.viewport)
		return;

	const targ = isStore(target) ? target.get() : target;
	goToTarget(viewport.viewport, targ);
}


/**
 * Updates the viewport to target the target.
 */
function goToTarget(viewport: Viewport, target: CoordsXY | CoordsXYZ | number | null): void
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
