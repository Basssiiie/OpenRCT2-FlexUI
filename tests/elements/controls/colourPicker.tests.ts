/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { twoway } from "@src/bindings/twoway/twoway";
import { colourPicker } from "@src/elements/controls/colourPicker";
import { Colour } from "@src/utilities/colour";
import { proxy } from "@src/utilities/proxy";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({ colour: Colour.BrightYellow, tooltip: "colourable!" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerWidget;
	t.is(widget.type, "colourpicker");
	t.is(widget.colour, Colour.BrightYellow);
	t.is(widget.tooltip, "colourable!");
});


test("Colour is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const colour = store(Colour.Aquamarine);
	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({ colour })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerWidget;
	t.is(widget.colour, Colour.Aquamarine);

	colour.set(Colour.OliveGreen);
	t.is(widget.colour, Colour.OliveGreen);
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;
	const hits: Colour[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({ onChange: colour => hits.push(colour) })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerDesc;
	call(widget.onChange, Colour.IcyBlue);
	call(widget.onChange, Colour.Black);
	call(widget.onChange, Colour.LightPink);
	call(widget.onChange, Colour.Teal);

	t.deepEqual(hits, [ Colour.IcyBlue, Colour.Black, Colour.LightPink, Colour.Teal ]);
});


test("Assigning bound colour should silence on change", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const hits: number[] = [];
	const colour = store(20);
	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({
				colour: colour,
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerDesc;
	proxy(widget, "colour", v => widget.onChange?.(v!)); // immitate the ingame bubbled callback
	t.is(widget.colour, 20);

	colour.set(5);
	t.is(widget.colour, 5);
	t.deepEqual(hits, []);

	widget.onChange?.(17);
	t.deepEqual(hits, [17]);
});


test("Two-way bindings update colour picker", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const colour = store(Colour.BrightPurple);
	const hits: Colour[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			colourPicker({
				colour: twoway(colour),
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ColourPickerDesc;
	t.is(widget.colour, Colour.BrightPurple);
	t.is(colour.get(), Colour.BrightPurple);
	t.deepEqual(hits, []);

	colour.set(Colour.Black);
	t.is(widget.colour, Colour.Black);
	t.is(colour.get(), Colour.Black);
	t.deepEqual(hits, []);

	widget.onChange!(Colour.Teal);
	t.is(widget.colour, Colour.Teal);
	t.is(colour.get(), Colour.Teal);
	t.deepEqual(hits, [ Colour.Teal ]);

	widget.onChange!(Colour.DarkPink);
	t.is(widget.colour, Colour.DarkPink);
	t.is(colour.get(), Colour.DarkPink);
	t.deepEqual(hits, [ Colour.Teal, Colour.DarkPink ]);

	colour.set(Colour.SaturatedGreen);
	t.is(widget.colour, Colour.SaturatedGreen);
	t.is(colour.get(), Colour.SaturatedGreen);
	t.deepEqual(hits, [ Colour.Teal, Colour.DarkPink ]);
});