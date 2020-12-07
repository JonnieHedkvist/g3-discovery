"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delays = void 0;
const g3_discovery_1 = require("./discovery/g3-discovery");
var Delays;
(function (Delays) {
    Delays[Delays["Short"] = 500] = "Short";
    Delays[Delays["Medium"] = 2000] = "Medium";
    Delays[Delays["Long"] = 5000] = "Long";
})(Delays = exports.Delays || (exports.Delays = {}));
console.log(new Date(), 'HELLOOO!');
g3_discovery_1.foundAndLost$.subscribe({
    next: (msg) => {
        console.info('DISCOVERY_MESSAGE_TYPE', msg);
    }
});
//# sourceMappingURL=main.js.map
