/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { twoway } from "@src/bindings/twoway/twoway";
import { dropdown } from "@src/elements/controls/dropdown";
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
			dropdown({ items: [ "a", "b", "c" ], selectedIndex: 2, tooltip: "drop me" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.is(widget.type, "dropdown");
	t.deepEqual(widget.items, [ "a", "b", "c" ]);
	t.is(widget.selectedIndex, 2);
	t.is(widget.tooltip, "drop me");
});


test("Items are bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const items = store([ "a", "b", "c" ]);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: items, selectedIndex: 2 })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.deepEqual(widget.items, [ "a", "b", "c" ]);

	items.set([ "q", "p" ]);
	t.deepEqual(widget.items, [ "q", "p" ]);
});


test("Selected index is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const selected = store(2);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b", "c" ], selectedIndex: selected })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.is(widget.selectedIndex, 2);

	selected.set(1);
	t.is(widget.selectedIndex, 1);

	selected.set(0);
	t.is(widget.selectedIndex, 0);
});


test("Select event gets called", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;
	const hits: number[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b", "c" ], selectedIndex: 2, onChange: (i) => hits.push(i) })
		]
	});
	template.open();

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	call(widget.onChange, 1);
	call(widget.onChange, 2);
	call(widget.onChange, 0);
	call(widget.onChange, 2);

	t.deepEqual(hits, [ 1, 2, 0, 2 ]);
});


test("Disable message shows when disabled", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const disabled = store(false);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], disabled: disabled, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.deepEqual(widget.items, [ "a", "b" ]);

	disabled.set(true);
	t.deepEqual(widget.items, [ "Sorry!" ]);

	disabled.set(false);
	t.deepEqual(widget.items, [ "a", "b" ]);
});


test("Disable message shows when always disabled", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], disabled: true, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.deepEqual(widget.items, [ "Sorry!" ]);
});


test("Disable message doesn't show when always enabled", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], disabled: false, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.deepEqual(widget.items, [ "a", "b" ]);
});


test("Disable message shows with items and disabled stores", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const items = store<string[]>([]);
	const disabled = store(false);

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items, disabled, disabledMessage: "Sorry!" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
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
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a" ], autoDisable: "single" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.true(widget.isDisabled);
});


test("Auto disable on single item enabled when more than one item", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a", "b" ], autoDisable: "single" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.false(widget.isDisabled);
});


test("Auto disable on empty disables when empty", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [], autoDisable: "empty" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.true(widget.isDisabled);
});


test("Auto disable on empty enabled when at least one item", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [ "a" ], autoDisable: "empty" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.false(widget.isDisabled);
});


test("Auto disable on never is never disabled", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({ items: [], autoDisable: "never" })
		]
	});
	template.open();

	const widget = <DropdownWidget>mock.createdWindows[0].widgets[0];
	t.falsy(widget.isDisabled);
});


test("Invoke on change if item is at different index in new list", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const items = store([ "a", "b", "c", "d" ]);
	const hits: number[] = [];
	const selected = store(3);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items,
				selectedIndex: selected,
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	proxy(widget, "selectedIndex", v => call(widget.onChange, v!)); // immitate the ingame bubbled callback

	t.deepEqual(widget.items, [ "a", "b", "c", "d" ]);
	t.is(widget.selectedIndex, 3);

	items.set(["c", "d", "e", "f"]);
	t.deepEqual(widget.items, ["c", "d", "e", "f"]);
	t.is(widget.selectedIndex, 1);
	t.deepEqual(hits, [ 1 ]);

	items.set(["a", "a", "a", "a", "a", "d", "a"]);
	t.deepEqual(widget.items, ["a", "a", "a", "a", "a", "d", "a"]);
	t.is(widget.selectedIndex, 5);
	t.deepEqual(hits, [ 1, 5 ]);

	items.set(["a", "a", "d"]);
	t.deepEqual(widget.items, ["a", "a", "d"]);
	t.is(widget.selectedIndex, 2);
	t.deepEqual(hits, [ 1, 5, 2 ]);
});


test("Do not change selected index if item at same index in new list", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const items = store([ "a", "b", "c", "d" ]);
	const hits: number[] = [];
	const selected = store(2);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items,
				selectedIndex: selected,
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	proxy(widget, "selectedIndex", v => call(widget.onChange, v!)); // immitate the ingame bubbled callback

	t.deepEqual(widget.items, [ "a", "b", "c", "d" ]);
	t.is(widget.selectedIndex, 2);

	items.set(["e", "d", "c", "f"]);
	t.deepEqual(widget.items, ["e", "d", "c", "f"]);
	t.is(widget.selectedIndex, 2);
	t.deepEqual(hits, []);
});


test("Reset selected index if item not present in new list", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const items = store([ "a", "b", "c", "d" ]);
	const hits: number[] = [];
	const selected = store(3);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items,
				selectedIndex: selected,
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	proxy(widget, "selectedIndex", v => call(widget.onChange, v!)); // immitate the ingame bubbled callback

	t.deepEqual(widget.items, [ "a", "b", "c", "d" ]);
	t.is(widget.selectedIndex, 3);

	items.set(["e", "f", "c", "b", "a"]);
	t.deepEqual(widget.items, ["e", "f", "c", "b", "a"]);
	t.is(widget.selectedIndex, 0);
	t.deepEqual(hits, [ 0 ]);
});


test("Assigning bound selected index should silence on change", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

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

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	proxy(widget, "selectedIndex", v => call(widget.onChange, v!)); // immitate the ingame bubbled callback
	t.is(widget.selectedIndex, 1);

	selected.set(2);
	t.is(widget.selectedIndex, 2);
	t.deepEqual(hits, []);

	call(widget.onChange, 3);
	t.deepEqual(hits, [3]);
});


test("Assigning bound items should silence on change", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

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

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	proxy(widget, "items", () => call(widget.onChange, 0)); // immitate the ingame bubbled callback
	t.deepEqual(widget.items, [ "a", "b", "c" ]);

	items.set([ "d", "e" ]);
	t.deepEqual(widget.items, [ "d", "e" ]);
	t.deepEqual(hits, []);

	call(widget.onChange, 1);
	t.deepEqual(hits, [1]);
});


test("Items and selected index gets restored when disabled dropdown with message gets enabled", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const disabled = store(false);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items: [ "a", "b", "c", "d" ],
				selectedIndex: 2,
				disabled,
				disabledMessage: "Sorry!"
			})
		]
	});
	template.open();

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	proxy(widget, "items", () => widget.selectedIndex = 0); // immitate the ingame selected reset
	t.is(widget.selectedIndex, 2);

	disabled.set(true);
	t.is(widget.selectedIndex, 0);
	t.deepEqual(widget.items, [ "Sorry!" ]);

	disabled.set(false);
	t.is(widget.selectedIndex, 2);
	t.deepEqual(widget.items, [ "a", "b", "c", "d" ]);
});


test("Dropdown items changed but new selected index should stay the same", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const hits: number[] = [];
	const items = store([ "current" ]);
	const selectedIndex = store(0);
	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items, selectedIndex,
				onChange: v =>
				{
					selectedIndex.set(v);
					hits.push(v);
				}
			})
		]
	});
	template.open();

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	proxy(widget, "items", () => call(widget.onChange, 0)); // immitate the ingame bubbled callback
	proxy(widget, "selectedIndex", i => call(widget.onChange, i!)); // immitate the ingame bubbled callback

	t.is(widget.selectedIndex, 0);
	t.is(selectedIndex.get(), 0);
	t.deepEqual(widget.items, [ "current" ]);
	t.deepEqual(hits, []);

	items.set([ "new", "current" ]);
	t.is(widget.selectedIndex, 1);
	t.is(selectedIndex.get(), 1);
	t.deepEqual(widget.items, [ "new", "current" ]);
	t.deepEqual(hits, [ 1 ]);

	selectedIndex.set(0);
	t.is(widget.selectedIndex, 0);
	t.is(selectedIndex.get(), 0);
	t.deepEqual(widget.items, [ "new", "current" ]);
	t.deepEqual(hits, [ 1 ]);
});


test("Two-way bindings update dropdown", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const selectedIndex = store(1);
	const hits: number[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			dropdown({
				items: [ "a", "b", "c", "d" ],
				selectedIndex: twoway(selectedIndex),
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = <DropdownDesc>mock.createdWindows[0].widgets[0];
	t.is(widget.selectedIndex, 1);
	t.is(selectedIndex.get(), 1);
	t.deepEqual(hits, []);

	selectedIndex.set(3);
	t.is(widget.selectedIndex, 3);
	t.is(selectedIndex.get(), 3);
	t.deepEqual(hits, []);

	call(widget.onChange, 0);
	t.is(widget.selectedIndex, 0);
	t.is(selectedIndex.get(), 0);
	t.deepEqual(hits, [ 0 ]);

	call(widget.onChange, 2);
	t.is(widget.selectedIndex, 2);
	t.is(selectedIndex.get(), 2);
	t.deepEqual(hits, [ 0, 2 ]);

	selectedIndex.set(0);
	t.is(widget.selectedIndex, 0);
	t.is(selectedIndex.get(), 0);
	t.deepEqual(hits, [ 0, 2 ]);
});
