import { FlexibleDirectionalLayoutParams, FlexibleLayoutContainer } from "@src/elements/layouts/flexible/flexible";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Paddable } from "@src/positional/paddable";
import { Rectangle } from "@src/positional/rectangle";
import { Colour } from "@src/utilities/colour";
import * as Log from "@src/utilities/logger";
import { noop } from "@src/utilities/noop";
import { BaseWindowControl, BaseWindowParams } from "../baseWindowControl";
import { FrameBuilder } from "../frames/frameBuilder";
import { createWidgetMap } from "../widgets/widgetMap";
import { getTabSizeOrInheritWindow, setAxisSizeIfAuto, setAxisSizeIfNumber } from "../windowHelpers";
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


/**
 * A window control for windows with tabs.
 */
class TabWindowControl extends BaseWindowControl
{
	private _root: TabLayoutable;
	private _tabs: TabLayoutable[];
	private _selectedTab: number;
	private _tabChange?: (tabIndex: number) => void;
	private _staticWidgetsLayout?: (area: Rectangle) => void;

	constructor(params: TabWindowParams)
	{
		super(params);

		const description = this._description;
		const tabs = params.tabs;
		const startTab = params.startingTab || 0;
		const staticWidgets = params.static;

		let rootLayoutable: TabLayoutable;
		if (staticWidgets) // Create full frame for root
		{
			const builder = new FrameBuilder(this, params, staticWidgets, (<Paddable>staticWidgets).padding);
			description.widgets = builder._widgets;
			this._staticWidgetsLayout = (area: Rectangle): void =>
			{
				this._root.layout(area);
			};
			rootLayoutable = builder.context;
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

		const tabCount = tabs.length;
		const tabList = Array<TabLayoutable>(tabCount);
		const tabDescs = Array<WindowTabDesc>(tabCount);

		for (let idx = 0; idx < tabCount; idx++)
		{
			const tabParams: WindowTabDesc = { image: defaultTabIcon };
			tabList[idx] = tabs[idx](this, tabParams);
			tabDescs[idx] = tabParams;
		}

		description.tabs = tabDescs;
		description.tabIndex = startTab;
		description.onTabChange = (): void => this._tabChanged();
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

		const newWidgets = createWidgetMap(window.widgets);
		const newTabIdx = window.tabIndex;
		const onTabChange = this._tabChange;
		Log.debug("Template.tabChanged() from", this._selectedTab, "to", newTabIdx);
		this._selectedTab = newTabIdx;

		this._forActiveTab(tab =>
		{
			const tabWidth = getTabSizeOrInheritWindow(tab.width, this.width);
			const tabHeight = getTabSizeOrInheritWindow(tab.height, this.height);
			const currentWidth = setAxisSizeIfNumber(window, LayoutDirection.Horizontal, tabWidth);
			const currentHeight = setAxisSizeIfNumber(window, LayoutDirection.Vertical, tabHeight);

			tab.open(newWidgets);
			this._layout(window, currentWidth, currentHeight);
		});

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

	override _layout(window: Window, width: number, height: number): void
	{
		const staticWidgetsLayout = this._staticWidgetsLayout;
		if (staticWidgetsLayout)
		{
			const area = this._createFrameRectangle(width, height);
			staticWidgetsLayout(area);
		}
		this._forActiveTab(tab =>
		{
			const area = this._createFrameRectangle(width, height, defaultTopBarSizeWithTabs);
			const size = tab.layout(area);

			setAxisSizeIfAuto(window, LayoutDirection.Horizontal, this.width, size);
			setAxisSizeIfAuto(window, LayoutDirection.Vertical, this.height, size);
		});
	}
}
