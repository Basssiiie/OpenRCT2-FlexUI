
import { applyHorizontalPadding, applyVerticalPadding, hasPadding } from "@src/elements/layouts/paddingHelpers";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { Rectangle } from "@src/positional/rectangle";
import test from "ava";


// Shortcuts
const px = ScaleType.Pixel;
const pc = ScaleType.Percentage;
const w = ScaleType.Weight;


test("Has all padding", t =>
{
	const value = hasPadding({ top: [1, px], right: [2, pc], bottom: [3, w], left: [4, px] });
	t.true(value);
});


test("Has top padding", t =>
{
	const value = hasPadding({ top: [1, px], right: [0, pc], bottom: [0, w], left: [0, px] });
	t.true(value);
});


test("Has right padding", t =>
{
	const value = hasPadding({ top: [0, px], right: [1, pc], bottom: [0, w], left: [0, px] });
	t.true(value);
});


test("Has bottom padding", t =>
{
	const value = hasPadding({ top: [0, px], right: [0, pc], bottom: [1, w], left: [0, px] });
	t.true(value);
});


test("Has left padding", t =>
{
	const value = hasPadding({ top: [0, px], right: [0, pc], bottom: [0, w], left: [1, px] });
	t.true(value);
});


test("Has zero padding", t =>
{
	const value = hasPadding({ top: [0, px], right: [0, pc], bottom: [0, w], left: [0, px] });
	t.false(value);
});


test("Has no padding", t =>
{
	const value = hasPadding(undefined);
	t.false(value);
});


test("Apply horizontal pixel padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const contentSpace: ParsedScale = [100, px];
	const padding: ParsedPadding = { top: [8, px], right: [5, pc], bottom: [3, w], left: [2, px] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 2);
	t.is(area.y, 20);
	t.is(area.width, 100);
	t.is(area.height, 250);
});


test("Apply vertical pixel padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const contentSpace: ParsedScale = [100, px];
	const padding: ParsedPadding = { top: [8, px], right: [5, pc], bottom: [3, w], left: [2, px] };

	applyVerticalPadding(area, contentSpace, padding);

	t.is(area.x, 10);
	t.is(area.y, 20 + 8);
	t.is(area.width, 150);
	t.is(area.height, 100);
});


test("Apply weighted padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const contentSpace: ParsedScale = [50, px];
	const padding: ParsedPadding = { top: [8, px], right: [3, w], bottom: [3, w], left: [2, w] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 40);
	t.is(area.y, 20);
	t.is(area.width, 50);
	t.is(area.height, 250);
});


test("Apply pixel padding on horizontal weighted space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const contentSpace: ParsedScale = [2, w];
	const padding: ParsedPadding = { top: [8, px], right: [30, px], bottom: [3, px], left: [25, px] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 95);
	t.is(area.height, 250);
});


test("Apply weighted padding on horizontal weighted space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const contentSpace: ParsedScale = [5, w];
	const padding: ParsedPadding = { top: [8, px], right: [3, w], bottom: [3, w], left: [2, w] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 40);
	t.is(area.y, 20);
	t.is(area.width, 100);
	t.is(area.height, 250);
});


test("Apply weighted left padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const contentSpace: ParsedScale = [50, px];
	const padding: ParsedPadding = { top: [8, px], right: [15, px], bottom: [3, px], left: [1, w] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 135);
	t.is(area.y, 20);
	t.is(area.width, 50);
	t.is(area.height, 250);
});


test("Apply weighted right padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const contentSpace: ParsedScale = [50, px];
	const padding: ParsedPadding = { top: [8, px], right: [1, w], bottom: [3, px], left: [25, px] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 50);
	t.is(area.height, 250);
});


test("Apply weighted left padding on horizontal weighted space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const contentSpace: ParsedScale = [3, w];
	const padding: ParsedPadding = { top: [8, px], right: [15, px], bottom: [3, px], left: [2, w] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 74);
	t.is(area.y, 20);
	t.is(area.width, 111);
	t.is(area.height, 250);
});


test("Apply weighted right padding on horizontal weighted space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const contentSpace: ParsedScale = [3, w];
	const padding: ParsedPadding = { top: [8, px], right: [2, w], bottom: [3, px], left: [25, px] };

	applyHorizontalPadding(area, contentSpace, padding);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 105);
	t.is(area.height, 250);
});