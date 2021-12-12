/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import { ParsedPadding, parsePadding } from "@src/positional/padding";
import { Rectangle } from "@src/positional/rectangle";
import { applyPadding } from "@src/elements/layouts/flexible/flexibleLayout";


test("Apply no padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };

	const padding: ParsedPadding = parsePadding(0);
	applyPadding(area, padding);

	t.is(area.x, 10);
	t.is(area.y, 20);
	t.is(area.width, 100);
	t.is(area.height, 200);
});


test("Apply basic padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };

	const padding: ParsedPadding = parsePadding(5);
	applyPadding(area, padding);

	t.is(area.x, 15);
	t.is(area.y, 25);
	t.is(area.width, 90);
	t.is(area.height, 190);
});


test("Apply horizontal and vertical padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };

	const padding: ParsedPadding = parsePadding([20, 15]);
	applyPadding(area, padding);

	t.is(area.x, 25);
	t.is(area.y, 40);
	t.is(area.width, 70);
	t.is(area.height, 160);
});