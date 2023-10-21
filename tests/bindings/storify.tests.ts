/// <reference path="../../lib/openrct2.d.ts" />
import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import { storify } from "@src/bindings/stores/storify";
import test from "ava";


test("Storify returns store for value", t =>
{
	const original = "John Doe";
	const storified = storify(original);

	t.true(isStore(storified));
	t.is(storified.get(), original);
});


test("Storify returns itself for store", t =>
{
	const original = store("Bob");
	const storified = storify(original);

	t.is(storified, original);
});
