/// <reference path="../../lib/openrct2.d.ts" />
import { DefaultStore } from "@src/bindings/stores/defaultStore";
import { decorate } from "@src/bindings/stores/decorate";
import test from "ava";


test("Decorate calls in order", t =>
{
	const hits: string[] = [];
	const store = new DefaultStore(12);
	store.subscribe(v => hits.push(`store ${v}`));

	const decorator = decorate(store, (v, c) =>
	{
		hits.push(`before ${v}`);
		c(v * 10);
		hits.push(`after ${v}`);
	});
	decorator.subscribe(v => hits.push(`decorator ${v}`));

	t.deepEqual(hits, []);
	t.is(decorator.get(), 12);
	t.is(store.get(), 12);

	decorator.set(5);
	t.deepEqual(hits, ["store 5", "before 5", "decorator 50", "after 5"]);
	t.is(decorator.get(), 50);
	t.is(store.get(), 5);

	decorator.set(2);
	t.deepEqual(hits, ["store 5", "before 5", "decorator 50", "after 5", "store 2", "before 2", "decorator 20", "after 2"]);
	t.is(decorator.get(), 20);
	t.is(store.get(), 2);

	hits.length = 0;
	store.set(8);
	t.deepEqual(hits, ["store 8", "before 8", "decorator 80", "after 8"]);
	t.is(decorator.get(), 80);
	t.is(store.get(), 8);

	hits.length = 0;
	store.set(7);
	t.deepEqual(hits, ["store 7", "before 7", "decorator 70", "after 7"]);
	t.is(decorator.get(), 70);
	t.is(store.get(), 7);
});


test("Decorate can silence inner calls", t =>
{
	const hits: string[] = [];
	const store = new DefaultStore(12);
	store.subscribe(v => hits.push(`store ${v}`));

	const decorator = decorate(store, (v) =>
	{
		hits.push(`before ${v}`);
		hits.push(`after ${v}`);
	});
	decorator.subscribe(v => hits.push(`decorator ${v}`));

	t.deepEqual(hits, []);
	t.is(decorator.get(), 12);
	t.is(store.get(), 12);

	decorator.set(5);
	t.deepEqual(hits, ["store 5", "before 5", "after 5"]);
	t.is(decorator.get(), 12);
	t.is(store.get(), 5);

	decorator.set(2);
	t.deepEqual(hits, ["store 5", "before 5", "after 5", "store 2", "before 2", "after 2"]);
	t.is(decorator.get(), 12);
	t.is(store.get(), 2);

	hits.length = 0;
	store.set(8);
	t.deepEqual(hits, ["store 8", "before 8", "after 8"]);
	t.is(decorator.get(), 12);
	t.is(store.get(), 8);

	hits.length = 0;
	store.set(7);
	t.deepEqual(hits, ["store 7", "before 7", "after 7"]);
	t.is(decorator.get(), 12);
	t.is(store.get(), 7);
});


test("Decorate can silence only odd calls", t =>
{
	const hits: string[] = [];
	const store = new DefaultStore(12);
	store.subscribe(v => hits.push(`store ${v}`));

	const decorator = decorate(store, (v, c) =>
	{
		hits.push(`before ${v}`);
		if (v % 2 === 0)
		{
			c(v + 2);
		}
		hits.push(`after ${v}`);
	});
	decorator.subscribe(v => hits.push(`decorator ${v}`));

	t.deepEqual(hits, []);
	t.is(decorator.get(), 12);
	t.is(store.get(), 12);

	decorator.set(5);
	t.deepEqual(hits, ["store 5", "before 5", "after 5"]);
	t.is(decorator.get(), 12);
	t.is(store.get(), 5);

	decorator.set(2);
	t.deepEqual(hits, ["store 5", "before 5", "after 5", "store 2", "before 2", "decorator 4", "after 2"]);
	t.is(decorator.get(), 4);
	t.is(store.get(), 2);

	hits.length = 0;
	store.set(8);
	t.deepEqual(hits, ["store 8", "before 8", "decorator 10", "after 8"]);
	t.is(decorator.get(), 10);
	t.is(store.get(), 8);

	hits.length = 0;
	store.set(7);
	t.deepEqual(hits, ["store 7", "before 7", "after 7"]);
	t.is(decorator.get(), 10);
	t.is(store.get(), 7);
});