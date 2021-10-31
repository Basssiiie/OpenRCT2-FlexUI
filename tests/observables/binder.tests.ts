/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import { BuildContainer } from "@src/core/buildContainer";
import { WindowBinder } from "@src/observables/windowBinder";
import { ObservableInstance } from "@src/observables/observableInstance";
import { ElementVisibility } from "@src/elements/element";
import Mock from "openrct2-mocks";


test("read() sets values", t =>
{
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
	};
	const binder = new WindowBinder();

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


test("read() adds observable to binder", t =>
{
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
	};
	const binder = new WindowBinder();

	t.falsy(binder["_bindings"]);

	const observableNumber = new ObservableInstance(25);
	binder.add(label, "y", observableNumber);

	t.truthy(binder["_bindings"]);
	t.is(binder["_bindings"]?.length, 1);
});


test("read() sets observable in window template", t =>
{
	global.ui = Mock.ui();
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
	};
	const output = new BuildContainer({ widgets: [ label ] } as WindowDesc);
	output.widgets.push(label);

	const observableNumber = new ObservableInstance(25);
	output.binder.add(label, "x", observableNumber);
	output.binder.bind(output.template);

	output.template.open();
	t.is(label.x, 25);

	observableNumber.set(77);
	t.is(label.x, 77);

	observableNumber.set(-50);
	t.is(label.x, -50);
});


test("read() sets observable through converter", t =>
{
	global.ui = Mock.ui();
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100, isVisible: false
	};
	const output = new BuildContainer({ widgets: [ label ] } as WindowDesc);
	output.widgets.push(label);

	const observableNumber = new ObservableInstance<ElementVisibility>("visible");
	output.binder.add(label, "isVisible", observableNumber, v => (v === "visible"));
	output.binder.bind(output.template);

	output.template.open();
	t.true(label.isVisible);

	observableNumber.set("hidden");
	t.false(label.isVisible);

	observableNumber.set("visible");
	t.true(label.isVisible);

	observableNumber.set("none");
	t.false(label.isVisible);
});