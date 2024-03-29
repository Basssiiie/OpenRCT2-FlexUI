import { Size } from "@src/positional/size";
import { FrameRectangle } from "../frames/frameRectangle";
import { WidgetMap } from "../widgets/widgetMap";
import { WindowScale } from "../windowScale";


/**
 * A layoutable interface to interact with a tab.
 */
export interface TabLayoutable
{
	/**
	 * Indicates the preferred width setup of the tab.
	 */
	readonly width: number | WindowScale | "auto" | "inherit";

	/**
	 * Indicates the preferred height setup of the tab.
	 */
	readonly height: number | WindowScale | "auto" | "inherit";

	/**
	 * Called when the tab is opened.
	 * @param window A reference to the internal window that just opened. Be aware that any
	 * unexpected changes to this object may break FlexUI.
	 * @param widgets The set of widgets of the window, which can be used to find the widgets
	 * used within the tab. This map contains all widgets currently active for the window.
	 */
	open(window: Window, widgets: WidgetMap): void;

	/**
	 * Called when the tab is to be relayouted within the specified area.
	 * @param area The positional area where the tab's widgets are expected to be layed out.
	 * @param widgets A set of widgets that should be layed out over the area.
	 * @returns The actual size the tab layout ended up being.
	 */
	layout(area: FrameRectangle, widgets: WidgetMap): Size;

	/**
	 * Called every game frame the tab is open. Use with caution.
	 */
	update(): void;

	/**
	 * Called when the tab or the window is closed.
	 */
	close(): void;
}