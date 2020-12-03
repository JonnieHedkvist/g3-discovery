"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollMDNS$ = void 0;
const _mdnsServer = require("mdns-server");
const network_interface_monitor_1 = require("./network-interface-monitor");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const _periodicMDNSquery = function (serviceName, pollingInterval) {
    return new rxjs_1.Observable(function (subscriber) {
        let queryInterval;
        const query = function () {
            mdnsService.query({
                questions: [{
                        name: serviceName,
                        type: 'PTR'
                    }]
            });
        };
        const mdnsService = _mdnsServer({
            reuseAddr: true,
            loopback: false,
            noInit: true
        });
        mdnsService.on('error', (err) => subscriber.error(err));
        mdnsService.on('response', ({ answers }, rinfo) => subscriber.next({ answers, rinfo }));
        mdnsService.on('ready', () => {
            query();
            queryInterval = setInterval(() => query(), pollingInterval);
        });
        mdnsService.initServer();
        const teardownLogic = () => {
            clearInterval(queryInterval);
            mdnsService.destroy();
        };
        return teardownLogic;
    });
};
exports.pollMDNS$ = function (serviceName, pollingInterval) {
    return network_interface_monitor_1.networkInterfaces$.pipe(operators_1.switchMap(() => _periodicMDNSquery(serviceName, pollingInterval)));
};
//# sourceMappingURL=poll-mdns.js.map