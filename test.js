"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clock_1 = __importDefault(require("./clock"));
const clock = new clock_1.default;
console.log("test begins");
clock.setValue(-5);
clock.start((value) => {
    console.log(value);
    console.log(new Date());
}, 100, {
    endValue: 20,
    endCallback: () => {
        console.log('test ends');
    },
    valueInterval: (last_value, last_interval) => {
        console.log(last_interval);
        return (1);
    }
});
