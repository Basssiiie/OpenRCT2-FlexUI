/// <reference path="../../lib/openrct2.d.ts" />
import { DefaultArrayStore } from "@src/bindings/stores/defaultArrayStore";
import test from "ava";


test("insert() adds items at index", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.is(store.insert(1, "Jack", "Jane"), 4);
	t.deepEqual(store.get(), [ "Bob", "Jack", "Jane", "Tom" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("update() changes item at index", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.is(store.update(2, "Patrick"), "Jack");
	t.deepEqual(store.get(), [ "Bob", "Tom", "Patrick", "Jane" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("push() adds items at the end", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.is(store.push("Dany", "Patrick"), 6);
	t.deepEqual(store.get(), [ "Bob", "Tom", "Jack", "Jane", "Dany", "Patrick" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("pop() removes the last item", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.is(store.pop(), "Jane");
	t.deepEqual(store.get(), [ "Bob", "Tom", "Jack" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("unshift() adds items at the start", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.is(store.unshift("Dany", "Patrick"), 6);
	t.deepEqual(store.get(), [ "Dany", "Patrick", "Bob", "Tom", "Jack", "Jane" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("shift() removes the first item", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.is(store.shift(), "Bob");
	t.deepEqual(store.get(), [ "Tom", "Jack", "Jane" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("splice() removes items", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.deepEqual(store.splice(2, 5), [ "Jack", "Jane" ]);
	t.deepEqual(store.get(), [ "Bob", "Tom" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("splice() removes items and adds new", t =>
{
	const store = new DefaultArrayStore([ "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	t.deepEqual(store.splice(1, 2, "Joe", "Dany", "Po"), [ "Tom", "Jack" ]);
	t.deepEqual(store.get(), [ "Bob", "Joe", "Dany", "Po", "Jane" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("sort() reorders the items in ASCII order", t =>
{
	const store = new DefaultArrayStore([ "Dany", "Po", "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	store.sort();
	t.deepEqual(store.get(), [ "Bob", "Dany", "Jack", "Jane", "Po", "Tom" ]);
	t.deepEqual(calls, [ store.get() ]);
});


test("sort() reorders the items in specified order", t =>
{
	const store = new DefaultArrayStore([ "Dany", "Po", "Bob", "Tom", "Jack", "Jane" ]);
	const calls: string[][] = [];
	store.subscribe(v => calls.push(v));

	store.sort((a, b) => a[a.length-1].localeCompare(b[b.length-1]));
	t.deepEqual(store.get(), [ "Bob", "Jane", "Jack", "Tom", "Po", "Dany" ]);
	t.deepEqual(calls, [ store.get() ]);
});
