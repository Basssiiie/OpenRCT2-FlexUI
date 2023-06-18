import { Bindable } from "@src/bindings/bindable";
import { isStore } from "@src/bindings/stores/isStore";
import { read } from "@src/bindings/stores/read";
import * as Log from "@src/utilities/logger";
import { isNullOrUndefined, isNumber, isObject } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { FrameContext } from "@src/windows/frames/frameContext";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { openEvent, updateEvent } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Control } from "./control";
import { ViewportFlags } from "./enums/viewportFlags";


const FarAway: CoordsXY = { x: -9000, y: -9000 };


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
export function viewport<I, P>(params: ViewportParams & I): WidgetCreator<I, P>
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
class ViewportControl<I, P> extends Control<ViewportDesc, I, P> implements ViewportDesc
{
	_target?: CoordsXY | CoordsXYZ | number | null;


	/**
	 * Create a viewport control with the specified parameters.
	 */
	constructor(parent: ParentControl<I, P>, output: BuildOutput, params: ViewportParams & I)
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

		output.on(openEvent, (context) =>
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
			output.on(updateEvent, (context) =>
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

	/**
	 * Set the viewport to the specified location if enabled, or to black if disabled.
	 */
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