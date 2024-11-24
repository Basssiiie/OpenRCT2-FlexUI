import { isFunction } from "@src/utilities/type";
import { BaseWindowControl, BaseWindowParams } from "./baseWindowControl";
import { OpenWindow } from "./openWindow";
import { WindowTemplate } from "./windowTemplate";


/**
 * A base template that can spawn new window controls when a window is opened.
 */
export class Template<TModel, TParams extends BaseWindowParams> implements WindowTemplate<TModel>
{
	private readonly _control: new(params: TParams) => BaseWindowControl;
	private readonly _callback: (model: TModel) => TParams;

	private _active?: BaseWindowControl;
	private _mode?: "single" | "multiple";


	constructor(control: new(params: TParams) => BaseWindowControl, params: ((model: TModel) => TParams) | TParams)
	{
		this._control = control;
		this._callback = isFunction(params)
			? params
			: ((): TParams => params);
	}

	open(model: TModel): OpenWindow
	{
		const current = this._active;
		if (current && current._window && this._mode !== "multiple")
		{
			current.focus(); // todo: update model?
			return current;
		}

		const params = this._callback(model);
		const window = new this._control(params);
		this._active = window;
		this._mode = params.mode;
		window._open();

		return window;
	}
}
