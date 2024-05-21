import { defaultScale, defaultWindowPadding } from "@src/elements/constants";
import { FlexibleDirectionalLayoutParams, FlexibleLayoutContainer } from "@src/elements/layouts/flexible/flexible";
import { setAbsolutePaddingForDirection, setSizeWithPaddingForDirection, sizeKeys } from "@src/elements/layouts/paddingHelpers";
import { Axis } from "@src/positional/axis";
import { Paddable } from "@src/positional/paddable";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { Rectangle } from "@src/positional/rectangle";
import { Colour } from "@src/utilities/colour";
import * as Log from "@src/utilities/logger";
import { noop } from "@src/utilities/noop";
import { isUndefined } from "@src/utilities/type";
import { BaseWindowControl, BaseWindowParams, WindowFlags, defaultTopBarSize } from "../baseWindowControl";
import { WindowBinder } from "../binders/windowBinder";
import { FrameBuilder } from "../frames/frameBuilder";
import { FrameRectangle } from "../frames/frameRectangle";
import { WidgetMap, addToWidgetMap } from "../widgets/widgetMap";
import { WindowScaleOptions, autoKey, setAxisSizeIfInheritedNumber } from "../windowHelpers";
import { WindowTemplate } from "../windowTemplate";
import { TabCreator } from "./tabCreator";
import { TabLayoutable } from "./tabLayoutable";


/**
 * The parameters for a window that uses tabs.
 */
export interface TabWindowParams extends BaseWindowParams
{
	/**
	 * The colours of the window.
	 *
	 * Usage:
	 *  1. Used for the window background at the top.
	 *  2. Used for the background of each tab.
	 *  3. Used for widget details and backgrounds.
	 */
	colours?: [Colour, Colour, Colour];

	/**
	 * Specify which tab the window should open on. Starts at 0.
	 * @default 0
	 */
	startingTab?: number;

	/**
	 * Specify the tabs that this window has.
	 */
	tabs: TabCreator[];

	/**
	 * Specify any static widgets that show up regardless of which tab is opened.
	 */
	static?: (FlexibleDirectionalLayoutParams & Paddable) | FlexibleLayoutContainer;

	/**
	 * Event that gets triggered when a new tab is selected.
	 */
	onTabChange?: (tabIndex: number) => void;
}


/**
 * Create a new flexiblely designed window that has tabs.
 */
export function tabwindow(params: TabWindowParams): WindowTemplate
{
	Log.debug("tabwindow() started");
	const startTime = Log.time();

	const template = new TabWindowControl(params);

	Log.debug("tabwindow() creation time:", (Log.time() - startTime), "ms");
	return template;
}


const defaultTabIcon = 16;
const defaultTopBarSizeWithTabs = 44;

const enum TabWindowFlags
{
	HasTabs = (WindowFlags.Count << 0), // Yes, no tabs can happen with an empty tab array
	HasStaticWidgets = (WindowFlags.Count << 1),
}

/**
 * A window control for windows with tabs.
 */
class TabWindowControl extends BaseWindowControl
{
	protected override readonly _descriptionWidgetMap: WidgetMap;
	private readonly _windowWidthOption: WindowScaleOptions;
	private readonly _windowHeightOption: WindowScaleOptions;
	private readonly _padding: ParsedPadding;
	private readonly _root: TabLayoutable;
	private readonly _tabs: TabLayoutable[];
	private readonly _tabChange?: (tabIndex: number) => void;
	private _selectedTab: number;

	constructor(params: TabWindowParams)
	{
		super(params);

		const description = this._description;
		const descriptionWidgetMap: WidgetMap = {};
		const { width, height, tabs, padding } = params;
		const startTab = params.startingTab || 0;
		const staticWidgetParams = params.static;

		let rootLayoutable: TabLayoutable;
		if (staticWidgetParams) // Create full frame for root
		{
			const builder = new FrameBuilder(this, params, staticWidgetParams);
			const staticWidgets = builder._widgets;

			description.widgets = staticWidgets;
			addToWidgetMap<Widget | WidgetDesc>(staticWidgets, descriptionWidgetMap);
			rootLayoutable = builder.context;
			this._flags |= TabWindowFlags.HasStaticWidgets;
		}
		else // Create slimmed down frame for root, core widgets are all in tabs
		{
			rootLayoutable = <TabLayoutable><never>{
				open: (params.onOpen || noop),
				update: (params.onUpdate || noop),
				close: (params.onClose || noop)
			};
		}
		this._root = rootLayoutable;
		this._windowWidthOption = width;
		this._windowHeightOption = height;
		this._padding = parsePadding(isUndefined(padding) ? defaultWindowPadding : padding);

		const tabCount = tabs.length;
		const tabList = Array<TabLayoutable>(tabCount);
		const tabDescs = Array<WindowTabDesc>(tabCount);

		for (let idx = 0; idx < tabCount; idx++)
		{
			const tabParams: WindowTabDesc = { image: defaultTabIcon };
			tabList[idx] = tabs[idx](this, tabParams);
			tabDescs[idx] = tabParams;

			const tabWidgets = tabParams.widgets;
			if (tabWidgets)
			{
				addToWidgetMap<Widget | WidgetDesc>(tabWidgets, descriptionWidgetMap);
			}
		}

		description.tabs = tabDescs;
		description.tabIndex = startTab;
		description.onTabChange = (): void => this._tabChanged();
		this._descriptionWidgetMap = descriptionWidgetMap;
		this._tabs = tabList;
		this._selectedTab = startTab;
		this._tabChange = params.onTabChange;
		this._flags |= (tabCount > 0) ? TabWindowFlags.HasTabs : 0;
	}

	protected override _open(description: WindowDesc, binder: WindowBinder | null): void
	{
		Log.debug("TabWindow.open( tab", this._selectedTab, ")");
		if (this._flags & TabWindowFlags.HasTabs)
		{
			this._openTab(description, this._getActiveTab());
		}
		super._open(description, binder);
	}

	protected override _close(): void
	{
		Log.debug("TabWindow.close()");
		super._close();
		this._selectedTab = this._description.tabIndex || 0;
	}

	protected override _invoke(callback: (frame: TabLayoutable) => void): void
	{
		callback(this._root);
		if (this._flags & TabWindowFlags.HasTabs)
		{
			callback(this._getActiveTab());
		}
	}

	private _openTab(window: Window | WindowDesc, tab: TabLayoutable): void
	{
		const width = setAxisSizeIfInheritedNumber(window, Axis.Horizontal, tab.width, this._windowWidthOption);
		const height = setAxisSizeIfInheritedNumber(window, Axis.Vertical, tab.height, this._windowHeightOption);
		this._setWindowSizeAndFlags(width, height);
	}

	override _layout(window: Window | WindowDesc, widgets: WidgetMap): void
	{
		if (this._flags & TabWindowFlags.HasTabs)
		{
			this._layoutTab(this._getActiveTab(), window, widgets);
		}
		this._layoutStatic(widgets);
	}

	private _layoutTab(tab: TabLayoutable, window: Window | WindowDesc, widgets: WidgetMap): void
	{
		const area = this._createFrameRectangle(this._flags, defaultTopBarSizeWithTabs);
		const padding = this._padding;
		setFramePaddingToDirection(area, padding, Axis.Horizontal);
		setFramePaddingToDirection(area, padding, Axis.Vertical);

		Log.debug("TabWindow.layout() for window:", this._width, "x", this._height, "; active tab", this._selectedTab, "with frame:", Log.stringify(area));
		const size = tab.layout(area, widgets);

		this._setAutoWindowSize(window, size, defaultTopBarSizeWithTabs, padding);
	}

	private _layoutStatic(widgets: WidgetMap): void
	{
		if (!(this._flags & TabWindowFlags.HasStaticWidgets))
		{
			return;
		}

		const area = <Rectangle>this._createFrameRectangle(WindowFlags.None, defaultTopBarSize);
		const padding = this._padding;
		setSizeWithPaddingForDirection(area, Axis.Horizontal, defaultScale, padding);
		setSizeWithPaddingForDirection(area, Axis.Vertical, defaultScale, padding);

		Log.debug("TabWindow.layout() for window:", this._width, "x", this._height, "; static frame:", Log.stringify(area));
		this._root.layout(area, widgets);
	}

	private _tabChanged(): void
	{
		const window = this._window;
		if (!window)
		{
			return;
		}

		const newWidgets = addToWidgetMap(window.widgets);
		const newTabIdx = window.tabIndex;
		this._getActiveTab().close();

		Log.debug("TabWindow.tabChanged() from", this._selectedTab, "to", newTabIdx);
		Log.debug("Widget map:", Log.stringify(Object.keys(newWidgets).map(x => ({ name: newWidgets[x].name, type: newWidgets[x].type }))));
		this._selectedTab = newTabIdx;
		this._activeWidgetMap = newWidgets;

		const newTab = this._getActiveTab();
		const onTabChange = this._tabChange;

		this._openTab(window, newTab);
		this._layoutTab(newTab, window, newWidgets);
		this._layoutStatic(newWidgets);
		newTab.open(window, newWidgets);

		Log.debug("TabWindow.resize(); tab = (" + Log.stringify(newTab.width) + "x" + Log.stringify(newTab.height) + "), window = (" + Log.stringify(this._windowWidthOption) + "x" + Log.stringify(this._windowHeightOption) + ")");
		if (onTabChange)
		{
			onTabChange(newTabIdx);
		}
	}

	private _getActiveTab(): TabLayoutable
	{
		return this._tabs[this._selectedTab];
	}
}


function setFramePaddingToDirection(area: FrameRectangle, padding: ParsedPadding, direction: Axis): void
{
	if (area[sizeKeys[direction]] == autoKey)
	{
		setAbsolutePaddingForDirection(area, padding, direction);
	}
	else
	{
		setSizeWithPaddingForDirection(<Rectangle>area, direction, defaultScale, padding);
	}
}
