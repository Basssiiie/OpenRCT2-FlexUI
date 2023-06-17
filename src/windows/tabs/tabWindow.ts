import { defaultScale, defaultWindowPadding } from "@src/elements/constants";
import { FlexibleDirectionalLayoutParams, FlexibleLayoutContainer } from "@src/elements/layouts/flexible/flexible";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { setAbsolutePaddingForDirection, setSizeWithPaddingForDirection } from "@src/elements/layouts/paddingHelpers";
import { Paddable } from "@src/positional/paddable";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { Rectangle } from "@src/positional/rectangle";
import { Colour } from "@src/utilities/colour";
import * as Log from "@src/utilities/logger";
import { noop } from "@src/utilities/noop";
import { isUndefined } from "@src/utilities/type";
import { BaseWindowControl, BaseWindowParams, WindowFlags } from "../baseWindowControl";
import { FrameBuilder } from "../frames/frameBuilder";
import { FrameRectangle } from "../frames/frameRectangle";
import { WidgetMap, addToWidgetMap } from "../widgets/widgetMap";
import { WindowScaleOptions, autoKey, getAxisSizeWithInheritance, setAxisSizeIfAuto, setAxisSizeIfInheritedNumber } from "../windowHelpers";
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


const defaultTabIcon = 16;
const defaultTopBarSizeWithTabs = 44;


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


const enum TabWindowFlags
{
	HasStaticWidgets = (WindowFlags.Count << 0)
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
			addToWidgetMap(staticWidgets, descriptionWidgetMap);
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
				addToWidgetMap(tabWidgets, descriptionWidgetMap);
			}
		}

		description.tabs = tabDescs;
		description.tabIndex = startTab;
		description.onTabChange = (): void => this._tabChanged();
		this._descriptionWidgetMap = descriptionWidgetMap;
		this._tabs = tabList;
		this._selectedTab = startTab;
		this._tabChange = params.onTabChange;
	}

	override close(): void
	{
		super.close();
		this._selectedTab = this._description.tabIndex || 0;
	}

	private _tabChanged(): void
	{
		const window = this._window;
		if (!window)
		{
			return;
		}
		this._forActiveTab(tab => tab.close());

		const newWidgets = addToWidgetMap(window.widgets);
		const newTabIdx = window.tabIndex;
		const onTabChange = this._tabChange;
		Log.debug("TabWindow.tabChanged() from", this._selectedTab, "to", newTabIdx);
		Log.debug("Widget map:", Log.stringify(Object.keys(newWidgets).map(x => ({ name: newWidgets[x].name, type: newWidgets[x].type }))));
		this._selectedTab = newTabIdx;
		this._activeWidgetMap = newWidgets;

		this._forActiveTab(tab =>
		{
			const width = setAxisSizeIfInheritedNumber(window, LayoutDirection.Horizontal, tab.width, this._windowWidthOption);
			const height = setAxisSizeIfInheritedNumber(window, LayoutDirection.Vertical, tab.height, this._windowHeightOption);
			Log.debug("TabWindow.resize(); tab = (" + Log.stringify(tab.width) + "x" + Log.stringify(tab.height) + "), window = (" + Log.stringify(this._windowWidthOption) + "x" + Log.stringify(this._windowHeightOption) + ")");

			this._layoutTab(tab, window, newWidgets, width, height);
			tab.open(window, newWidgets);
		});
		this._layoutStatic(newWidgets);

		if (onTabChange)
		{
			onTabChange(newTabIdx);
		}
	}

	private _forActiveTab(callback: (tab: TabLayoutable) => void): void
	{
		const selectedTab = this._tabs[this._selectedTab];
		if (selectedTab)
		{
			callback(selectedTab);
		}
	}

	protected override _invoke(callback: (frame: TabLayoutable) => void): void
	{
		callback(this._root);
		this._forActiveTab(callback);
	}

	override _layout(window: Window | WindowDesc, widgets: WidgetMap, width: number | "auto", height: number | "auto"): void
	{
		this._forActiveTab(tab => this._layoutTab(tab, window, widgets, width, height));
		this._layoutStatic(widgets);
	}

	private _layoutTab(tab: TabLayoutable, window: Window | WindowDesc, widgets: WidgetMap, width: number | "auto", height: number | "auto"): void
	{
		const tabWidth = getAxisSizeWithInheritance(width, tab.width);
		const tabHeight = getAxisSizeWithInheritance(height, tab.height);

		// todo: same as window.layout()
		const area = this._createFrameRectangle(tabWidth, tabHeight, defaultTopBarSizeWithTabs);
		const padding = this._padding;
		applyTabPaddingToDirection(area, tabWidth, padding, LayoutDirection.Horizontal);
		applyTabPaddingToDirection(area, tabHeight, padding, LayoutDirection.Vertical);

		Log.debug("TabWindow.layout() for window:", width, "x", height, "; active tab", this._selectedTab, "with frame:", Log.stringify(area));
		const size = tab.layout(area, widgets);

		this._lastWidth = setAxisSizeIfAuto(window, LayoutDirection.Horizontal, tabWidth, size, padding, 0);
		this._lastHeight = setAxisSizeIfAuto(window, LayoutDirection.Vertical, tabHeight, size, padding, defaultTopBarSizeWithTabs);
	}

	private _layoutStatic(widgets: WidgetMap): void
	{
		if (!(this._flags & TabWindowFlags.HasStaticWidgets))
		{
			return;
		}

		// todo: this create rect could be simplified since there's no auto
		const area = <Rectangle>this._createFrameRectangle(this._lastWidth, this._lastHeight);
		const padding = this._padding;
		setSizeWithPaddingForDirection(area, LayoutDirection.Horizontal, defaultScale, padding);
		setSizeWithPaddingForDirection(area, LayoutDirection.Vertical, defaultScale, padding);

		Log.debug("TabWindow.layout() for window:", this._lastWidth, "x", this._lastHeight, "; static frame:", Log.stringify(area));
		this._root.layout(area, widgets);
	}
}


function applyTabPaddingToDirection(area: FrameRectangle, value: number | "auto", padding: ParsedPadding, direction: LayoutDirection): void
{
	// todo: statement also present in framecontrol.ts
	if (value == autoKey)
	{
		setAbsolutePaddingForDirection(area, padding, direction);
	}
	else
	{
		setSizeWithPaddingForDirection(<Rectangle>area, direction, defaultScale, padding);
	}
}