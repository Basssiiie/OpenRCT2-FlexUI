/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/createStore";
import { window } from "@src/building/window";
import { dropdown } from "@src/elements/controls/dropdown";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b", "c" ], selectedIndex: 2, tooltip: "drop me" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.is(widget.type, "dropdown");
	t.deepEqual(widget.items, [ "a", "b", "c" ]);
	t.is(widget.selectedIndex, 2);
	t.is(widget.tooltip, "drop me");
});


test("Items are bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const items = store([ "a", "b", "c" ]);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: items, selectedIndex: 2 })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, [ "a", "b", "c" ]);

	items.set([ "q", "p" ]);
	t.deepEqual(widget.items, [ "q", "p" ]);
});


test("Selected index is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const selected = store(2);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b", "c" ], selectedIndex: selected })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.is(widget.selectedIndex, 2);

	selected.set(1);
	t.is(widget.selectedIndex, 1);

	selected.set(0);
	t.is(widget.selectedIndex, 0);
});


test("Select event gets called", t =>
{
	const mock = Mock.ui();
	global.ui = mock;
	const hits: number[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b", "c" ], selectedIndex: 2, onChange: (i) => hits.push(i) })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	call(widget.onChange, 1);
	call(widget.onChange, 2);
	call(widget.onChange, 0);
	call(widget.onChange, 2);

	t.deepEqual(hits, [ 1, 2, 0, 2 ]);
});


test("Disable message shows when disabled", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const disabled = store(false);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], disabled: disabled, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, [ "a", "b" ]);

	disabled.set(true);
	t.deepEqual(widget.items, [ "Sorry!" ]);

	disabled.set(false);
	t.deepEqual(widget.items, [ "a", "b" ]);
});


test("Disable message shows when always disabled", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], disabled: true, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, [ "Sorry!" ]);
});


test("Disable message doesn't show when always enabled", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], disabled: false, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, [ "a", "b" ]);
});


test("Disable single item disables when just one item", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a" ], disableSingleItem: true })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.true(widget.isDisabled);
});


test("Disable single item enabled when more than one item", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], disableSingleItem: true })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.false(widget.isDisabled);
});