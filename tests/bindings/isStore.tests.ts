/* eslint-disable @typescript-eslint/explicit-function-return-type */
/// <reference path="../../lib/openrct2.d.ts" />
import { DefaultArrayStore } from "@src/bindings/stores/defaultArrayStore";
import { DefaultStore } from "@src/bindings/stores/defaultStore";
import { isStore } from "@src/bindings/stores/isStore";
import test from "ava";


test("Store string is true", t =>
{
	const store = new DefaultStore("Bob");
	t.true(isStore(store));
});


test("Store number is true", t =>
{
	const store = new DefaultStore(54);
	t.true(isStore(store));
});


test("Array store is true", t =>
{
	const store = new DefaultArrayStore([ "a", "b" ]);
	t.true(isStore(store));
});


test("Null is false", t =>
{
	t.false(isStore(null));
});


test("Undefined is false", t =>
{
	t.false(isStore(undefined));
});


test("Object is false", t =>
{
	t.false(isStore({ store: true }));
});


test("String is false", t =>
{
	t.false(isStore("store"));
});


test("Number is false", t =>
{
	t.false(isStore(12345));
});


test("Store contract is true", t =>
{
	const store =
	{
		get: () => t.fail("Calling get is not allowed"),
		set: () => t.fail("Calling set is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.true(isStore(store));
});


test("Store contract without get() is false", t =>
{
	const store =
	{
		set: () => t.fail("Calling set is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isStore(store));
});


test("Store contract without set() is false", t =>
{
	const store =
	{
		get: () => t.fail("Calling get is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isStore(store));
});


test("Store contract without subscribe() is false", t =>
{
	const store =
	{
		get: () => t.fail("Calling get is not allowed"),
		set: () => t.fail("Calling set is not allowed"),
	};
	t.false(isStore(store));
});
