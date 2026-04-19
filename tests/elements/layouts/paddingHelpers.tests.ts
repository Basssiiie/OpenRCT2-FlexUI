import { applyPaddingToDirection, hasPadding, setSizeWithPaddingForDirection } from "@src/elements/layouts/paddingHelpers";
import { Axis } from "@src/positional/axis";
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
	const value = hasPadding([[1, px], [4, px], [3, w], [2, pc]]);
	t.true(value);
});


test("Has top padding", t =>
{
	const value = hasPadding([[1, px], [0, px], [0, w], [0, pc]]);
	t.true(value);
});


test("Has right padding", t =>
{
	const value = hasPadding([[0, px], [0, px], [0, w], [1, pc]]);
	t.true(value);
});


test("Has bottom padding", t =>
{
	const value = hasPadding([[0, px], [0, px], [1, w], [0, pc]]);
	t.true(value);
});


test("Has left padding", t =>
{
	const value = hasPadding([[0, px], [1, px], [0, w], [0, pc]]);
	t.true(value);
});


test("Has zero padding", t =>
{
	const value = hasPadding([[0, px], [0, px], [0, w], [0, pc]]);
	t.false(value);
});


test("Has no padding", t =>
{
	const value = hasPadding(undefined);
	t.false(value);
});


test("Set horizontal pixel padding on pixel size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const size: ParsedScale = [100, px];
	const padding: ParsedPadding = [[8, px], [2, px], [3, w], [5, px]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 2);
	t.is(area.y, 20);
	t.is(area.width, 100);
	t.is(area.height, 250);
	t.is(total, 2 + 100 + 5);
});


test("Set vertical pixel padding on pixel size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const size: ParsedScale = [100, px];
	const padding: ParsedPadding = [[8, px], [2, px], [23, px], [5, pc]];

	const total = setSizeWithPaddingForDirection(area, Axis.Vertical, size, padding);

	t.is(area.x, 10);
	t.is(area.y, 20 + 8);
	t.is(area.width, 150);
	t.is(area.height, 100);
	t.is(total, 8 + 100 + 23);
});


test("Set weighted padding on horizontal pixel size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const size: ParsedScale = [50, px];
	const padding: ParsedPadding = [[8, px], [2, w], [3, w], [3, w]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 40);
	t.is(area.y, 20);
	t.is(area.width, 50);
	t.is(area.height, 250);
	t.is(total, 40 + 50 + 60);
});


test("Set pixel padding on horizontal weighted size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const size: ParsedScale = [2, w];
	const padding: ParsedPadding = [[8, px], [25, px], [3, px], [30, px]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 95);
	t.is(area.height, 250);
	t.is(total, 25 + 95 + 30);
});


test("Set weighted padding on horizontal weighted size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const size: ParsedScale = [5, w];
	const padding: ParsedPadding = [[8, px], [2, w], [3, w], [3, w]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 40);
	t.is(area.y, 20);
	t.is(area.width, 100);
	t.is(area.height, 250);
	t.is(total, 40 + 100 + 60);
});


test("Set weighted left padding on horizontal pixel size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const size: ParsedScale = [50, px];
	const padding: ParsedPadding = [[8, px], [1, w], [3, px], [15, px]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 135);
	t.is(area.y, 20);
	t.is(area.width, 50);
	t.is(area.height, 250);
	t.is(total, 135 + 50 + 15);
});


test("Set weighted right padding on horizontal pixel size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const size: ParsedScale = [50, px];
	const padding: ParsedPadding = [[8, px], [25, px], [3, px], [1, w]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 50);
	t.is(area.height, 250);
	t.is(total, 25 + 50 + 125);
});


test("Set weighted left padding on horizontal weighted size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const size: ParsedScale = [3, w];
	const padding: ParsedPadding = [[8, px], [2, w], [3, px], [15, px]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 74);
	t.is(area.y, 20);
	t.is(area.width, 111);
	t.is(area.height, 250);
	t.is(total, 74 + 111 + 15);
});


test("Set weighted right padding on horizontal weighted size", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const size: ParsedScale = [3, w];
	const padding: ParsedPadding = [[8, px], [25, px], [3, px], [2, w]];

	const total = setSizeWithPaddingForDirection(area, Axis.Horizontal, size, padding);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 105);
	t.is(area.height, 250);
	t.is(total, 25 + 105 + 70);
});


test("Apply horizontal pixel padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 100, height: 250 };
	const padding: ParsedPadding = [[8, px], [2, px], [3, w], [5, px]];

	const total = applyPaddingToDirection(area, Axis.Horizontal, padding, 0, 0, 0);

	t.is(area.x, 10 + 2);
	t.is(area.y, 20);
	t.is(area.width, 100);
	t.is(area.height, 250);
	t.is(total, 2 + 100 + 5);
});


test("Apply vertical pixel padding", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 100 };
	const padding: ParsedPadding = [[8, px], [2, px], [23, px], [5, pc]];

	const total = applyPaddingToDirection(area, Axis.Vertical, padding, 10, 2, 0);

	t.is(area.x, 10);
	t.is(area.y, 20 + 8);
	t.is(area.width, 150);
	t.is(area.height, 100);
	t.is(total, 8 + 100 + 23);
});


test("Apply weighted padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 150, height: 250 };
	const padding: ParsedPadding = [[8, px], [2, w], [3, w], [3, w]];

	const total = applyPaddingToDirection(area, Axis.Horizontal, padding, 160, 8, 0);

	t.is(area.x, 10 + 40);
	t.is(area.y, 20);
	t.is(area.width, 150);
	t.is(area.height, 250);
	t.is(total, 40 + 150 + 60);
});


test("Apply weighted left padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const padding: ParsedPadding = [[8, px], [1, w], [3, px], [15, px]];

	const total = applyPaddingToDirection(area, Axis.Horizontal, padding, 675, 5, 0);

	t.is(area.x, 10 + 135);
	t.is(area.y, 20);
	t.is(area.width, 200);
	t.is(area.height, 250);
	t.is(total, 135 + 200 + 15);
});


test("Apply weighted right padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 50, height: 250 };
	const padding: ParsedPadding = [[8, px], [25, px], [3, px], [1, w]];

	const total = applyPaddingToDirection(area, Axis.Horizontal, padding, 225, 3, 0);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 50);
	t.is(area.height, 250);
	t.is(total, 25 + 50 + 75);
});


test("Apply percentage left padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 111, height: 250 };
	const padding: ParsedPadding = [[8, px], [25, pc], [3, px], [15, px]];

	const total = applyPaddingToDirection(area, Axis.Horizontal, padding, 120, 3, 0);

	t.is(area.x, 10 + 30);
	t.is(area.y, 20);
	t.is(area.width, 111);
	t.is(area.height, 250);
	t.is(total, 30 + 111 + 15);
});


test("Apply percentage right padding on horizontal pixel space", t =>
{
	const area: Rectangle = { x: 10, y: 20, width: 200, height: 250 };
	const padding: ParsedPadding = [[8, px], [25, px], [3, px], [40, pc]];

	const total = applyPaddingToDirection(area, Axis.Horizontal, padding, 75, 7, 0);

	t.is(area.x, 10 + 25);
	t.is(area.y, 20);
	t.is(area.width, 200);
	t.is(area.height, 250);
	t.is(total, 25 + 200 + 30);
});
