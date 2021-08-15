/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { BuildOutput } from "../../src/core/buildOutput";
import { Binder } from "../../src/observables/binder";
import { Observable } from "../../src/observables/observable";


test("read() sets values", t =>
{
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
	};
	const binder = new Binder();

	binder.read(label, "text", "hello");
	binder.read(label, "textAlign", "centred");
	binder.read(label, "x", 50);
	binder.read(label, "tooltip", undefined);

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
	const binder = new Binder();

	t.falsy(binder["_bindings"]);

	const observableNumber = new Observable(25);
	binder.read(label, "y", observableNumber);

	t.truthy(binder["_bindings"]);
	t.is(binder["_bindings"]?.length, 1);
});


test("read() sets observable in window template", t =>
{
	const label: LabelWidget =
	{
		type: "label",
		x: 0, y: 0, height: 10, width: 100,
	};
	const output = new BuildOutput({} as WindowDesc);
	output.widgets.push(label);
	const window = Mock.window({ widgets: output.widgets });

	const observableNumber = new Observable(25);
	output.binder.read(label, "x", observableNumber);
	output.binder.bind(window);

	t.is(label.x, 25);

	observableNumber.set(77);
	t.is(label.x, 77);

	observableNumber.set(-50);
	t.is(label.x, -50);
});