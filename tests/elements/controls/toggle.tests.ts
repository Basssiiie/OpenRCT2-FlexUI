/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { window } from "@src/windows/window";
import { toggle } from "@src/elements/controls/toggle";
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
			toggle({ text: "Toggle me!", image: 123, isPressed: true, tooltip: "togglable" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.is(widget.type, "button");
	t.is(widget.text, "Toggle me!");
	t.true(widget.isPressed);
	t.is(widget.tooltip, "togglable");
});


test("Is pressed is still bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const pressed = store(true);
	const template = window({
		width: 100, height: 100,
		content: [
			toggle({ isPressed: pressed })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.true(widget.isPressed);

	pressed.set(false);
	t.false(widget.isPressed);
});


test("Is pressed updates on toggle", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			toggle({ text: "Press me" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonDesc;
	t.falsy(widget.isPressed);

	call(widget.onClick);
	t.true(widget.isPressed);

	call(widget.onClick);
	t.false(widget.isPressed);

	call(widget.onClick);
	t.true(widget.isPressed);
});


test("Is pressed store does not update store", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const hits: boolean[] = [];
	const pressed = store(false);
	const template = window({
		width: 100, height: 100,
		content: [
			toggle({
				isPressed: pressed,
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonDesc;
	t.false(widget.isPressed);

	call(widget.onClick);
	t.true(widget.isPressed);
	t.false(pressed.get());
	t.deepEqual(hits, [ true ]);

	call(widget.onClick);
	t.false(widget.isPressed);
	t.false(pressed.get());
	t.deepEqual(hits, [ true, false ]);

	pressed.set(true); // does react to store changes
	t.true(widget.isPressed);
	t.true(pressed.get());
	t.deepEqual(hits, [ true, false ]);

	call(widget.onClick);
	t.false(widget.isPressed);
	t.true(pressed.get());
	t.deepEqual(hits, [ true, false, false ]);
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;
	const hits: boolean[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			toggle({ onChange: (pressed) => hits.push(pressed) })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonDesc;
	t.deepEqual(hits, []);

	call(widget.onClick);
	t.deepEqual(hits, [ true ]);

	call(widget.onClick);
	call(widget.onClick);
	call(widget.onClick);
	t.deepEqual(hits, [ true, false, true, false ]);
});