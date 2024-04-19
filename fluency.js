import { core } from "./lib/psychojs-2023.2.3.js";
const { PsychoJS } = core;
const psychojs = new PsychoJS;

psychojs.start();
setTimeout(psychojs.experiment.addData("key", "data"), 1000);
