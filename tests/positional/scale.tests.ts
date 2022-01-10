/// <reference path="../../lib/openrct2.d.ts" />

import { parseScale } from "@src/positional/parsing/parseScale";
import { ScaleType } from "@src/positional/parsing/scaleType";
import test from "ava";


test("Parse 10", t =>
{
	const scale = parseScale(10);
	t.is(scale[0], 10);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse 353", t =>
{
	const scale = parseScale(353);
	t.is(scale[0], 353);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse -99", t =>
{
	const scale = parseScale(-99);
	t.is(scale[0], -99);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse 0", t =>
{
	const scale = parseScale(0);
	t.is(scale[0], 0);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse 50%", t =>
{
	const scale = parseScale("50%");
	t.is(scale[0], 50);
	t.is(scale[1], ScaleType.Percentage);
});


test("Parse 2 %", t =>
{
	const scale = parseScale("2 %");
	t.is(scale[0], 2);
	t.is(scale[1], ScaleType.Percentage);
});


test("Parse 98.1%", t =>
{
	const scale = parseScale(" 98.1%");
	t.is(scale[0], 98.1);
	t.is(scale[1], ScaleType.Percentage);
});


test("Parse 0%", t =>
{
	const scale = parseScale("0%");
	t.is(scale[0], 0);
	t.is(scale[1], ScaleType.Percentage);
});


test("Parse 2w", t =>
{
	const scale = parseScale("2w");
	t.is(scale[0], 2);
	t.is(scale[1], ScaleType.Weight);
});


test("Parse 0.4w", t =>
{
	const scale = parseScale("0.4w");
	t.is(scale[0], 0.4);
	t.is(scale[1], ScaleType.Weight);
});


test("Parse 0.8 w", t =>
{
	const scale = parseScale("0.8 w");
	t.is(scale[0], 0.8);
	t.is(scale[1], ScaleType.Weight);
});


test("Parse 0w", t =>
{
	const scale = parseScale("0w");
	t.is(scale[0], 0);
	t.is(scale[1], ScaleType.Weight);
});


test("Parse 10px", t =>
{
	const scale = parseScale("10px");
	t.is(scale[0], 10);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse 55.5 px", t =>
{
	const scale = parseScale(" 55.5 px");
	t.is(scale[0], 55.5);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse -1 px", t =>
{
	const scale = parseScale("-1 px");
	t.is(scale[0], -1);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse 0px", t =>
{
	const scale = parseScale("0px");
	t.is(scale[0], 0);
	t.is(scale[1], ScaleType.Pixel);
});


test("Parse undefined", t =>
{
	const scale = parseScale(undefined);
	t.is(scale, undefined);
});