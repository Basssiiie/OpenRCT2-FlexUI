import { ParentWindow } from "../parentWindow";
import { TabLayoutable } from "./tabLayoutable";


/**
 * Write the specified tab to the output. Should return a layoutable control that can
 * draw the widgets to a specified area.
 */
export type TabCreator = (parent: ParentWindow, output: WindowTabDesc) => TabLayoutable;