/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import { LayoutFactory } from "../../src/layouts/layoutFactory";
import { Padding } from "../../src/positional/padding";
import { Rectangle } from "../../src/positional/rectangle";


test("Apply no padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };
	const padding: Padding = 0;

	LayoutFactory.applyPadding(area, padding);

	t.is(10, area.x);
	t.is(20, area.y);
	t.is(100, area.width);
	t.is(200, area.height);
});


test("Apply basic padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };
	const padding: Padding = 5;

	LayoutFactory.applyPadding(area, padding);

	t.is(15, area.x);
	t.is(25, area.y);
	t.is(90, area.width);
	t.is(190, area.height);
});


test("Apply horizontal and vertical padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };
	const padding: Padding = [20, 15];

	LayoutFactory.applyPadding(area, padding);

	t.is(25, area.x);
	t.is(40, area.y);
	t.is(70, area.width);
	t.is(160, area.height);
});