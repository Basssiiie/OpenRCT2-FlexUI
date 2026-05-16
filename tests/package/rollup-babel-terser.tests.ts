import test from "ava";
import { rollup } from "./_integration-helpers";
import { integrations } from "./_integration-tests";


const name = "rollup-babel-terser";
test.before("Build succesfully", t => rollup(name, t));

integrations(test, name);
