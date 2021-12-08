/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import { ParsedPadding, parsePadding } from "@src/positional/padding";
import { Rectangle } from "@src/positional/rectangle";
import { applyPadding } from "@src/layouts/flexibleLayout";


test("Apply no padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };

	const padding: ParsedPadding = parsePadding(0);
	applyPadding(area, padding);

	t.is(10, area.x);
	t.is(20, area.y);
	t.is(100, area.width);
	t.is(200, area.height);
});


test("Apply basic padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };

	const padding: ParsedPadding = parsePadding(5);
	applyPadding(area, padding);

	t.is(15, area.x);
	t.is(25, area.y);
	t.is(90, area.width);
	t.is(190, area.height);
});


test("Apply horizontal and vertical padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 200 };

	const padding: ParsedPadding = parsePadding([20, 15]);
	applyPadding(area, padding);

	t.is(25, area.x);
	t.is(40, area.y);
	t.is(70, area.width);
	t.is(160, area.height);
});