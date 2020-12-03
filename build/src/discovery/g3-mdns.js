"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G3AddressPoll$ = exports.IPv6 = exports.IPv4 = void 0;
const poll_mdns_1 = require("./poll-mdns");
const _ = require("lodash");
const operators_1 = require("rxjs/operators");
exports.IPv4 = 'ipv4';
exports.IPv6 = 'ipv6';
const _G3ServiceName = '_tobii-g3api._tcp.local';
const _G3Prefix = 'TG03B';
const _linkLocalIPv6 = /(fe80::[\S]+)/;
const _AnswerTypeTranslation = {
    A: exports.IPv4,
    AAAA: exports.IPv6
};
const _onlyG3Addresses = function (response) {
    const g3Addresses = response.answers.filter((answer) => answer.name.startsWith(_G3Prefix) &&
        Object.keys(_AnswerTypeTranslation).includes(answer.type));
    return {
        ...response,
        answers: g3Addresses
    };
};
const _toG3Adresses = function (response) {
    const reducer = (acc, ans) => {
        const deviceId = /(.+)\.local/.exec(ans.name)[1];
        if (_.isUndefined(acc[deviceId])) {
            acc[deviceId] = {};
        }
        acc[deviceId][_AnswerTypeTranslation[ans.type]] =
            ans.data.replace(_linkLocalIPv6, `$1%${response.rinfo.interface}`);
        return acc;
    };
    return response.answers.reduce(reducer, {});
};
exports.G3AddressPoll$ = function (pollingInterval) {
    return poll_mdns_1.pollMDNS$(_G3ServiceName, pollingInterval).pipe(operators_1.map(_onlyG3Addresses), operators_1.filter((response) => response.answers.length > 0), operators_1.map(_toG3Adresses));
};
//# sourceMappingURL=g3-mdns.js.map