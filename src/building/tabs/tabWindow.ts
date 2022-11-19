import { FlexibleLayoutContainer, FlexibleLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { Colour } from "@src/utilities/colour";
import { Event, invoke } from "@src/utilities/event";
import * as Log from "@src/utilities/logger";
import { BaseWindowControl, BaseWindowParams } from "../baseWindowControl";
import { FrameBuilder } from "../frames/frameBuilder";
import { FrameContext } from "../frames/frameContext";
import { createWidgetMap } from "../widgets/widgetMap";
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
	static?: FlexibleLayoutParams | FlexibleLayoutContainer;

	/**
	 * Event that gets triggered when a new tab is selected.
	 */
	onTabChange?: () => void;
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

	Log.debug(`tabwindow() creation time: ${Log.time() - startTime} ms`);
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
	private _tabChange?: () => void;

	_layoutRoot?: () => void;

	constructor(params: TabWindowParams)
	{
		const open: Event<FrameContext> = [];
		const update: Event<FrameContext> = [];
		const close: Event<FrameContext> = [];
		super(params, open, update, close);

		const tabs = params.tabs;
		const staticWidgets = params.static;
		let rootLayoutable: TabLayoutable;
		if (staticWidgets)
		{
			const builder = new FrameBuilder(staticWidgets, open, update, close);
			this._description.widgets = builder._widgets;
			this._layoutRoot = (): void =>
			{
				const area = this._getWindowWidgetRectangle();
				this._root.layout(area);
			};
			rootLayoutable = builder.context;
		}
		else
		{
			rootLayoutable = <TabLayoutable>{
				open: (): void => invoke(open),
				update: (): void => invoke(update),
				close: (): void => invoke(close),
				layout() { /* nothing */ }
			};
		}
		this._root = rootLayoutable;

		const tabCount = tabs.length;
		const tabList = Array<TabLayoutable>(tabCount);
		const tabDescs = Array<WindowTabDesc>(tabCount);

		for (let idx = 0; idx < tabCount; idx++)
		{
			const tabParams: WindowTabDesc = { image: defaultTabIcon };
			tabList[idx] = tabs[idx](tabParams);
			tabDescs[idx] = tabParams;
		}

		const description = this._description;
		const startTab = params.startingTab || 0;
		description.tabs = tabDescs;
		description.tabIndex = startTab;
		description.onTabChange = (): void => this._tabChanged();
		this._tabs = tabList;
		this._selectedTab = startTab;
		this._tabChange = params.onTabChange;
	}


	private _tabChanged(): void
	{
		const window = this._window;
		if (!window)
			return;

		this._forActiveTab(tab => tab.close());

		const newWidgets = createWidgetMap(window.widgets);
		Log.debug(`Template.tabChanged() from ${this._selectedTab} to ${window.tabIndex}`);
		this._selectedTab = window.tabIndex;

		this._forActiveTab(tab =>
		{
			tab.open(newWidgets);
			this._layoutTab(tab);
		});

		const onTabChange = this._tabChange;
		if (onTabChange)
		{
			onTabChange();
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

	private _layoutTab(tab: TabLayoutable): void
	{
		const area = this._getWindowWidgetRectangle(defaultTopBarSizeWithTabs);
		tab.layout(area);
	}

	protected _invoke(callback: (frame: TabLayoutable) => void): void
	{
		callback(this._root);
		this._forActiveTab(callback);
	}

	_layout(): void
	{
		const rootFunction = this._layoutRoot;
		if (rootFunction)
		{
			rootFunction();
		}
		this._forActiveTab(tab => this._layoutTab(tab));
	}
}
