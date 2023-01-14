/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { window } from "@src/building/window";
import { dropdown } from "@src/elements/controls/dropdown";
import { proxy } from "@src/utilities/proxy";
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

	const widget = mock.createdWindows[0].widgets[0] as DropdownDesc;
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


test("Disable message shows with items and disabled stores", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const items = store<string[]>([]);
	const disabled = store(false);

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items, disabled, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, []);
	t.false(widget.isDisabled);

	items.set([ "a", "b" ]);
	t.deepEqual(widget.items, [ "a", "b" ]);
	t.false(widget.isDisabled);

	disabled.set(true);
	t.deepEqual(widget.items, [ "Sorry!" ]);
	t.true(widget.isDisabled);

	items.set([ "c", "d", "e" ]);
	t.deepEqual(widget.items, [ "Sorry!" ]);
	t.true(widget.isDisabled);

	disabled.set(false);
	t.deepEqual(widget.items, [ "c", "d", "e" ]);
	t.false(widget.isDisabled);

	items.set([ "f", "g" ]);
	t.deepEqual(widget.items, [ "f", "g" ]);
	t.false(widget.isDisabled);
});


test("Auto disable on single item disables when just one item", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a" ], autoDisable: "single" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.true(widget.isDisabled);
});


test("Auto disable on single item enabled when more than one item", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], autoDisable: "single" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.false(widget.isDisabled);
});


test("Auto disable on empty disables when empty", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [], autoDisable: "empty" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.true(widget.isDisabled);
});


test("Auto disable on empty enabled when at least one item", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a" ], autoDisable: "empty" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.false(widget.isDisabled);
});


test("Auto disable on never is never disabled", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [], autoDisable: "never" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.falsy(widget.isDisabled);
});


test("Update selected index if item at different index in new list", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const items = store([ "a", "b", "c", "d" ]);
	const selected = store(3);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items, selectedIndex: selected })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, [ "a", "b", "c", "d" ]);
	t.is(widget.selectedIndex, 3);

	items.set(["c", "d", "e", "f"]);
	t.deepEqual(widget.items, ["c", "d", "e", "f"]);
	t.is(widget.selectedIndex, 1);
	t.is(selected.get(), 1);
});


test("Do not change selected index if item at same index in new list", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const items = store([ "a", "b", "c", "d" ]);
	const selected = store(2);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items, selectedIndex: selected })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, [ "a", "b", "c", "d" ]);
	t.is(widget.selectedIndex, 2);

	items.set(["e", "d", "c", "f"]);
	t.deepEqual(widget.items, ["e", "d", "c", "f"]);
	t.is(widget.selectedIndex, 2);
	t.is(selected.get(), 2);
});


test("Reset selected index if item not present in new list", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const items = store([ "a", "b", "c", "d" ]);
	const selected = store(3);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items, selectedIndex: selected })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownWidget;
	t.deepEqual(widget.items, [ "a", "b", "c", "d" ]);
	t.is(widget.selectedIndex, 3);

	items.set(["e", "f", "c", "b", "a"]);
	t.deepEqual(widget.items, ["e", "f", "c", "b", "a"]);
	t.is(widget.selectedIndex, 0);
	t.is(selected.get(), 0);
});


test("Assigning bound selected index should silence on change", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const hits: number[] = [];
	const selected = store(1);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items: [ "a", "b", "c", "d" ],
				selectedIndex: selected,
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownDesc;
	proxy(widget, "selectedIndex", v => widget.onChange?.(v!)); // immitate the ingame bubbled callback
	t.is(widget.selectedIndex, 1);

	selected.set(2);
	t.is(widget.selectedIndex, 2);
	t.deepEqual(hits, []);

	widget.onChange?.(3);
	t.deepEqual(hits, [3]);
});


test("Assigning bound items should silence on change", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const hits: number[] = [];
	const items = store([ "a", "b", "c" ]);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items,
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as DropdownDesc;
	proxy(widget, "items", () => widget.onChange?.(0)); // immitate the ingame bubbled callback
	t.deepEqual(widget.items, [ "a", "b", "c" ]);

	items.set([ "d", "e" ]);
	t.deepEqual(widget.items, [ "d", "e" ]);
	t.deepEqual(hits, []);

	widget.onChange?.(1);
	t.deepEqual(hits, [1]);
});