import { BuildOutput } from "../core/buildOutput";
import { WidgetFactory } from "../core/widgetFactory";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Bindable } from "../observables/bindable";
import { Observable } from "../observables/observable";
import { Template } from "../templates/template";
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


export const ViewportFactory: WidgetFactory<ViewportParams> =
{
	create(output: BuildOutput, params: ViewportParams): LayoutFunction
	{
		const control = new ViewportControl(output, params);
		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, control.name, area);
	}
};


/**
 * A controller class for a viewport widget.
 */
export default class ViewportControl extends Control<ViewportWidget> implements ViewportWidget, ViewportParams
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
		const template = output.template;
		if (target instanceof Observable)
		{
			output.update.push((): void => this.goToTarget(template));
		}
		else
		{
			output.open.push((): void => this.goToTarget(template));
		}

		const binder = output.binder;
		binder.read(this, "target", params.target);
		binder.read(this, "rotation", params.rotation);
		binder.read(this, "zoom", params.zoom);
		binder.read(this, "visibilityFlags", params.visibilityFlags);
	}


	/**
	 * Makes sure the viewport always targets the target.
	 */
	private goToTarget(template: Template): void
	{
		const widget = template.getWidget<ViewportWidget>(this.name);
		if (!widget)
			return;

		const viewport = widget.active;
		if (!viewport || !viewport.viewport)
			return;

		const target = this.target;
		if (target !== undefined)
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
