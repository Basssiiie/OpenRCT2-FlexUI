/// <reference path="../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { ElementVisibility } from "@src/elements/elementParams";
import { mutable } from "@src/utilities/mutable";
import { noop } from "@src/utilities/noop";
import { WidgetBinder } from "@src/windows/binders/widgetBinder";
import { FrameBuilder } from "@src/windows/frames/frameBuilder";
import { ParentWindow } from "@src/windows/parentWindow";
import { addToWidgetMap } from "@src/windows/widgets/widgetMap";
import test from "ava";
import Mock from "openrct2-mocks";


test("read() sets values", t =>
{
	const label: LabelDesc =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100
	};
	const binder = new WidgetBinder();

	binder.add(label, "text", "hello");
	binder.add(label, "textAlign", "centred");
	binder.add(label, "x", 50);
	binder.add(label, "tooltip", undefined);

	t.is(label.text, "hello");
	t.is(label.textAlign, "centred");
	t.is(label.x, 50);
	t.is(label.tooltip, undefined);
	t.is(label.isDisabled, undefined);
});


test("read() adds store to binder", t =>
{
	const label: LabelDesc =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100
	};
	const binder = new WidgetBinder();

	t.deepEqual(binder["_bindings"], []);

	const storeNumber = store(25);
	binder.add(label, "y", storeNumber);
	t.is(binder["_bindings"].length, 1);
});


test("read() sets store in window frame", t =>
{
	globalThis.ui = Mock.ui();
	const label: LabelDesc =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100
	};
	const output = new FrameBuilder(<ParentWindow>{ redraw: noop }, {}, []);
	output.add(label);

	const storeNumber = store(25);
	output.binder.add(label, "x", storeNumber);

	const frame = mutable(output.context);
	frame._binder = output.binder; // prevents the binder to be optimized away internally
	frame.open(<Window>{}, addToWidgetMap(<Widget[]>output._widgets));

	t.is(label.x, 25);

	storeNumber.set(77);
	t.is(label.x, 77);

	storeNumber.set(-50);
	t.is(label.x, -50);
});


test("read() sets store through converter", t =>
{
	globalThis.ui = Mock.ui();
	const label: LabelDesc =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100, isVisible: false
	};
	const output = new FrameBuilder(<ParentWindow>{ redraw: noop }, {}, []);
	output.add(label);

	const storeNumber = store<ElementVisibility>("visible");
	output.binder.add(label, "isVisible", storeNumber, v => (v === "visible"));

	const frame = mutable(output.context);
	frame._binder = output.binder; // prevents the binder to be optimized away internally
	frame.open(<Window>{}, addToWidgetMap(<Widget[]>output._widgets));

	t.true(label.isVisible);

	storeNumber.set("hidden");
	t.false(label.isVisible);

	storeNumber.set("visible");
	t.true(label.isVisible);

	storeNumber.set("none");
	t.false(label.isVisible);
});
