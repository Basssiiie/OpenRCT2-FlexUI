/// <reference path="../../lib/openrct2.d.ts" />
import { compute } from "@src/bindings/stores/compute";
import { arrayStore } from "@src/bindings/stores/createArrayStore";
import { store } from "@src/bindings/stores/createStore";
import { isStore, isWritableStore } from "@src/bindings/stores/isStore";
import test from "ava";


test("Store string is true", t =>
{
	const source = store("Bob");
	t.true(isStore(source));
});


test("Store number is true", t =>
{
	const source = store(54);
	t.true(isStore(source));
});


test("Array store is true", t =>
{
	const source = arrayStore([ "a", "b" ]);
	t.true(isStore(source));
});


test("Compute store is true", t =>
{
	const child = store(54);
	const source = compute(child, v => v * 15);
	t.true(isStore(source));
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


test("Store contract without set() is true", t =>
{
	const store =
	{
		get: () => t.fail("Calling get is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.true(isStore(store));
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


test("Writable store contract without get() is false", t =>
{
	const store =
	{
		set: () => t.fail("Calling set is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isWritableStore(store));
});


test("Writable store contract without set() is false", t =>
{
	const store =
	{
		get: () => t.fail("Calling get is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isWritableStore(store));
});


test("Writable contract without subscribe() is false", t =>
{
	const store =
	{
		get: () => t.fail("Calling get is not allowed"),
		set: () => t.fail("Calling set is not allowed"),
	};
	t.false(isWritableStore(store));
});
