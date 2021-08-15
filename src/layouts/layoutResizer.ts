import { LayoutNode } from "./layoutNode";

/**
 * A simple stack collection that can push and pop.
 */
export class LayoutResizer
{
	private _nodes?: LayoutNode[];


	/**
	 * Returns the top of the stack without popping it.
	 */
	get top(): LayoutNode | undefined
	{
		return (this._nodes) ? this._nodes[this._nodes.length - 1] : undefined;
	}


	/**
	 * Returns the size of the stack.
	 */
	get length(): number | undefined
	{
		return (this._nodes) ? this._nodes.length : 0;
	}

	/*
	add(widgetName: string, layoutFunction: (widgets: Record<string, Widget>, area: Rectangle) => void): void
	{

	}
	*/

	/**
	 * Create a new layout node under the current node.
	 */
	push(item: LayoutNode): void
	{
		if (this._nodes)
		{
			this._nodes.push(item);
		}
		else
		{
			this._nodes = [ item ];
		}
	}


	/**
	 * Pops the top node off the stack and returns it. Returns 'undefined' if the stack is empty.
	 */
	pop(): LayoutNode | undefined
	{
		return (this._nodes) ? this._nodes.pop() : undefined;
	}
}