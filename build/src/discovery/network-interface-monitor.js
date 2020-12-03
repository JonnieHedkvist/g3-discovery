"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkInterfaces$ = void 0;
const os_1 = require("os");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
exports.networkInterfaces$ = rxjs_1.timer(0, 1000).pipe(operators_1.map(() => os_1.networkInterfaces()), operators_1.share());
//# sourceMappingURL=network-interface-monitor.js.map