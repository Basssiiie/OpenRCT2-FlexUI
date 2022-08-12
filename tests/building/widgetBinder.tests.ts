/// <reference path="../../lib/openrct2.d.ts" />

import { DefaultStore } from "@src/bindings/stores/defaultStore";
import { BuildContainer } from "@src/building/buildContainer";
import { WidgetBinder } from "@src/building/binders/widgetBinder";
import { ElementVisibility } from "@src/elements/elementParams";
import test from "ava";
import Mock from "openrct2-mocks";


test("read() sets values", t =>
{
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
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
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
	};
	const binder = new WidgetBinder();

	t.deepEqual(binder["_bindings"], []);

	const storeNumber = new DefaultStore(25);
	binder.add(label, "y", storeNumber);
	t.is(binder["_bindings"].length, 1);
});


test("read() sets store in window template", t =>
{
	global.ui = Mock.ui();
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
	};
	const output = new BuildContainer({ widgets: [ label ] } as WindowDesc);
	output.add(label);

	const storeNumber = new DefaultStore(25);
	output.binder.add(label, "x", storeNumber);
	output.binder._bind(output.context);

	output.context._build();
	output.context.open();
	t.is(label.x, 25);

	storeNumber.set(77);
	t.is(label.x, 77);

	storeNumber.set(-50);
	t.is(label.x, -50);
});


test("read() sets store through converter", t =>
{
	global.ui = Mock.ui();
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100, isVisible: false
	};
	const output = new BuildContainer({ widgets: [ label ] } as WindowDesc);
	output.add(label);

	const storeNumber = new DefaultStore<ElementVisibility>("visible");
	output.binder.add(label, "isVisible", storeNumber, v => (v === "visible"));
	output.binder._bind(output.context);

	output.context._build();
	output.context.open();
	t.true(label.isVisible);

	storeNumber.set("hidden");
	t.false(label.isVisible);

	storeNumber.set("visible");
	t.true(label.isVisible);

	storeNumber.set("none");
	t.false(label.isVisible);
});