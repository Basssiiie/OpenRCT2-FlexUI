import { Bindable } from "@src/bindings/bindable";
import { isStore } from "@src/bindings/stores/isStore";
import { read } from "@src/bindings/stores/read";
import { BuildOutput } from "@src/building/buildOutput";
import { FrameContext } from "@src/building/frames/frameContext";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import * as Log from "@src/utilities/logger";
import { isNullOrUndefined, isNumber, isObject } from "@src/utilities/type";
import { ElementParams } from "../elementParams";
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
	Gridlines = (1 << 7),
	UndergroundInside = (1 << 0),
	HideBase = (1 << 12),
	HideVertical = (1 << 13),

	SoundOn = (1 << 10),
	LandOwnership = (1 << 8),
	ConstructionRights = (1 << 9),
	InvisibleEntities = (1 << 14),
	ClipView = (1 << 17),
	HighlightPathIssues = (1 << 18),
	TransparentBackground = (1 << 19),

	LandHeights = (1 << 4),
	TrackHeights = (1 << 5),
	PathHeights = (1 << 6),

	SeeThroughRides = (1 << 1),
	SeeThroughVehicles = (1 << 20),
	SeeThroughVegetation = (1 << 21),
	SeeThroughScenery = (1 << 2),
	SeeThroughPaths = (1 << 16),
	SeeThroughSupports = (1 << 3),

	InvisibleGuests = (1 << 11),
	InvisibleStaff = (1 << 23),
	InvisibleRides = SeeThroughRides | (1 << 24),
    InvisibleVehicles = SeeThroughVehicles | (1 << 25),
    InvisibleVegetation = SeeThroughVegetation | (1 << 26),
    InvisibleScenery = SeeThroughScenery | (1 << 27),
    InvisiblePaths = SeeThroughPaths | (1 << 28),
    InvisibleSupports = SeeThroughSupports | (1 << 29),
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


const disabledFlags = ViewportFlags.HideBase | ViewportFlags.HideVertical
	| ViewportFlags.InvisibleGuests | ViewportFlags.InvisibleStaff
	| ViewportFlags.InvisibleRides | ViewportFlags.InvisibleVehicles
	| ViewportFlags.InvisibleVegetation | ViewportFlags.InvisibleScenery
	| ViewportFlags.InvisiblePaths | ViewportFlags.SeeThroughSupports;


/**
 * A controller class for a viewport widget.
 */
class ViewportControl extends Control<ViewportDesc> implements ViewportDesc
{
	_target?: CoordsXY | CoordsXYZ | number | null;


	/**
	 * Create a viewport control with the specified parameters.
	 */
	constructor(parent: ParentControl, output: BuildOutput, params: ViewportParams)
	{
		super("viewport", parent, output, params);

		const binder = output.binder;
		const { target, visibilityFlags, disabled, zoom } = params;

		const viewportSetter = (widget: ViewportWidget): void =>
		{
			this._updateViewport(widget.viewport, target, visibilityFlags, disabled);
		};

		binder.on(<ViewportWidget><unknown>this, visibilityFlags, viewportSetter);
		binder.on(<ViewportWidget><unknown>this, disabled, viewportSetter);
		binder.on(<ViewportWidget><unknown>this, target, viewportSetter);
		binder.on(<ViewportWidget><unknown>this, zoom, (widget: ViewportWidget, value: number) =>
		{
			const viewport = widget.viewport;
			if (viewport)
			{
				viewport.zoom = value;
			}
		});

		output.on("open", (context) =>
		{
			const viewport = this._getViewportFromContext(context);
			if (viewport && zoom)
			{
				viewport.zoom = read(zoom);
			}
			this._updateViewport(viewport, target, visibilityFlags, disabled);
		});

		if (isStore(target) || isNumber(target))
		{
			output.on("update", (context) =>
			{
				const viewport = this._getViewportFromContext(context);
				this._updateViewport(viewport, target, visibilityFlags, disabled);
			});
		}
	}

	private _updateViewport(viewport: Viewport | null, target: Bindable<number | CoordsXY | CoordsXYZ | null> | undefined, visibilityFlags: Bindable<ViewportFlags> | undefined, disabled: Bindable<boolean> | undefined): void
	{
		if (!viewport)
		{
			Log.debug("Viewport", this.name, "not available");
			return;
		}
		const location = this._getTargetLocation(read(target));
		const flagsValue = read(visibilityFlags);
		const disabledValue = read(disabled);

		Log.debug(`target: ${location}, flags: ${flagsValue}, disabled ${disabledValue}`);
		this._setViewportLocation(viewport, location, flagsValue, disabledValue);
	}

	/**
	 * Get the coordinate location of the target.
	 */
	private _getTargetLocation(target: CoordsXY | CoordsXYZ | number | null | undefined): CoordsXY | null
	{
		let moveToLocation: CoordsXY | null = null;
		if (!isNullOrUndefined(target))
		{
			if (isNumber(target))
			{
				const entity = map.getEntity(target);
				if (entity)
				{
					moveToLocation = <CoordsXYZ>{
						x: entity.x,
						y: entity.y,
						z: entity.z
					};
				}
			}
			else if (isObject(target))
			{
				moveToLocation = target;
			}
		}
		return moveToLocation;
	}

	private _setViewportLocation(viewport: Viewport, target: CoordsXY | null, flags: ViewportFlags | undefined, disabled: boolean | undefined): void
	{
		if (disabled || !target)
		{
			flags = disabledFlags;
			target = FarAway;
		}
		viewport.moveTo(target);
		viewport.visibilityFlags = flags || 0;
	}

	/**
	 * Gets the viewport from the active window frame.
	 */
	private _getViewportFromContext(context: FrameContext): Viewport | null
	{
		const widget = context.getWidget<ViewportWidget>(this.name);
		if (widget)
		{
			return widget.viewport;
		}
		return null;
	}
}