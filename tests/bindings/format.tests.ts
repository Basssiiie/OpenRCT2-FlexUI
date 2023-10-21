/// <reference path="../../lib/openrct2.d.ts" />
import { store } from "@src/bindings/stores/createStore";
import { format } from "@src/bindings/stores/format";
import test from "ava";
import Mock from "openrct2-mocks";


test("Format store value into string", t =>
{
	globalThis.context = Mock.context();

	const source = store("world");

	const dependant = format("Hello {STRING} !", source);
	t.is(dependant.get(), "Hello {STRING=world} !");
});


test("Format multiple stores", t =>
{
	globalThis.context = Mock.context();

	const a = store(500);
	const b = store(750);
	const c = store(300);

	const dependant = format("Numbers: {INT32}, {INT32}, {INT32}", a, b, c);
	t.is(dependant.get(), "Numbers: {INT32=500}, {INT32=750}, {INT32=300}");

	b.set(10);
	t.is(dependant.get(), "Numbers: {INT32=500}, {INT32=10}, {INT32=300}");
});


test("Format result updates when store updates", t =>
{
	globalThis.context = Mock.context();

	const source = store("world");

	const dependant = format("Hello {STRING} !", source);
	t.is(dependant.get(), "Hello {STRING=world} !");

	source.set("unit test");
	t.is(dependant.get(), "Hello {STRING=unit test} !");
});


test("Format result update triggers subscribe", t =>
{
	globalThis.context = Mock.context();

	const source = store("world");
	const calls: string[] = [];

	const dependant = format("Hello {STRING} !", source);
	dependant.subscribe(v => calls.push(v));

	source.set("unit test");
	t.deepEqual(calls, ["Hello {STRING=unit test} !"]);
});
