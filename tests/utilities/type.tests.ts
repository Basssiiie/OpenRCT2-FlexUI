import test from "ava";
import * as Type from "@src/utilities/type";


test("isArray() returns true", t =>
{
	t.true(Type.isArray([ 1, 2, 3 ]));
	t.true(Type.isArray([ "a", "b" ]));
	t.true(Type.isArray([]));
	t.true(Type.isArray(new Array(2)));
});


test("isArray() returns false", t =>
{
	t.false(Type.isArray("array"));
	t.false(Type.isArray(34));
	t.false(Type.isArray({ array: true }));
	t.false(Type.isArray((): [] => []));
	t.false(Type.isArray(null));
	t.false(Type.isArray(undefined));
});


test("isFunction() returns true", t =>
{
	t.true(Type.isFunction(function () { /** no-op */ }));
	t.true(Type.isFunction(() => { /** no-op */ }));
	t.true(Type.isFunction(() => "hello"));
	t.true(Type.isFunction(Type.isFunction));
});


test("isFunction() returns false", t =>
{
	t.false(Type.isFunction("array"));
	t.false(Type.isFunction(34));
	t.false(Type.isFunction({ array: true }));
	t.false(Type.isFunction([ (): [] => [] ]));
	t.false(Type.isFunction(null));
	t.false(Type.isFunction(undefined));
});


test("isNumber() returns true", t =>
{
	t.true(Type.isNumber(44));
	t.true(Type.isNumber(-4542));
	t.true(Type.isNumber(0));
	t.true(Type.isNumber(Number(2)));
	t.true(Type.isNumber(NaN));
	t.true(Type.isNumber(Number.MAX_VALUE));
});


test("isNumber() returns false", t =>
{
	t.false(Type.isNumber("array"));
	t.false(Type.isNumber([ 34 ]));
	t.false(Type.isNumber({ number: true }));
	t.false(Type.isNumber((): [] => []));
	t.false(Type.isNumber(null));
	t.false(Type.isNumber(undefined));
});


class Test
{
	value: number = 5;
}


test("isObject() returns true", t =>
{
	t.true(Type.isObject({ test: 4 }));
	t.true(Type.isObject(new Test()));
	t.true(Type.isObject(new String("que?"))); // anything with `new` is an object too
	t.true(Type.isObject([ 34 ])); // arrays are objects too
	t.true(Type.isObject(null));
});


test("isObject() returns false", t =>
{
	t.false(Type.isObject("array"));
	t.false(Type.isObject(5454));
	t.false(Type.isObject((): [] => []));
	t.false(Type.isObject(undefined));
});


test("isString() returns true", t =>
{
	t.true(Type.isString("hello"));
	t.true(Type.isString(""));
	t.true(Type.isString(String("bonjour")));
});


test("isString() returns false", t =>
{
	t.false(Type.isString([ 34 ]));
	t.false(Type.isNumber({ string: true }));
	t.false(Type.isString(5454));
	t.false(Type.isString((): [] => []));
	t.false(Type.isString(null));
	t.false(Type.isString(undefined));
});