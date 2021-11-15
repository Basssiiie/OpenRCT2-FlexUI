import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { WindowContext } from "@src/core/windowContext";
import { Bindable } from "@src/observables/bindable";
import { isObservable } from "@src/observables/isObservable";
import { Positions } from "@src/positional/positions";
import { isUndefined } from "@src/utilities/type";
import { Control } from "./control";
import { ElementParams } from "./element";


const FarAway: CoordsXY = { x: -9000, y: -9000 };


/**
 * Available visibility flags for the viewport.
 */
export const enum ViewportFlags
{
	UndergroundInside = (1 << 0),
	SeethroughRides = (1 << 1),
	SeethroughScenery = (1 << 2),
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
	//Flag15 = (1 << 15),
	SeethroughPaths = (1 << 16),
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
	target?: Bindable<CoordsXY | CoordsXYZ | number>;

	/**
	 * The rotation to set the viewport to, from 0 to 3.
	 */
	rotation?: Bindable<number>;

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
export function viewport<TPos extends Positions>(params: ViewportParams & TPos): WidgetCreator<ViewportParams & TPos>
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
	target?: CoordsXY | CoordsXYZ | number;
	rotation?: number;
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

		const target = params.target;
		if (isObservable(target))
		{
			output.on("update", (context) => this.goToTarget(context));
		}
		else
		{
			output.on("open", (context) => this.goToTarget(context));
		}

		const binder = output.binder;
		binder.add(this, "target", params.target);
		binder.add(this, "rotation", params.rotation);
		binder.add(this, "zoom", params.zoom);
		binder.add(this, "visibilityFlags", params.visibilityFlags);
	}


	/**
	 * Makes sure the viewport always targets the target.
	 */
	private goToTarget(context: WindowContext): void
	{
		const widget = context.getWidget<ViewportWidget>(this.name);
		if (!widget)
			return;

		const viewport = widget.active;
		if (!viewport || !viewport.viewport)
			return;

		const target = this.target;
		if (!isUndefined(target))
		{
			const type = (typeof target);
			if (type === "number")
			{
				const entity = map.getEntity(target as number);

				if (entity)
				{
					viewport.viewport.scrollTo({
						x: entity.x,
						y: entity.y,
						z: entity.z
					});
					return;
				}
			}
			else if (type === "object")
			{
				viewport.viewport.moveTo(target as CoordsXY);
				return;
			}
		}

		viewport.viewport.moveTo(FarAway);
	}
}
