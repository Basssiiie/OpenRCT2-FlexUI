import test from "ava";
import { rollup } from "./_integration-helpers";
import { integrations } from "./_integration-tests";


const name = "rollup-typescript";
test.before("Build succesfully", () => rollup(name));

integrations(test, name);