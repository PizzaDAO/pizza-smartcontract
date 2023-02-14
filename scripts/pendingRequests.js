"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require("dotenv/config");
var ethers_1 = require("ethers");
var OrderAPIConsumer_json_1 = require("../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json");
var OrderAPIOracle_json_1 = require("../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json");
// Get the pending requests from the OrderAPIConsumer contract
var getPendingRequests = function (contract) { return __awaiter(void 0, void 0, void 0, function () {
    var requestedFilter, requestedEvents, fulfilledFilter, fulfilledLogs, pendingRequests, _loop_1, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestedFilter = contract.filters.ChainlinkRequested();
                return [4 /*yield*/, contract.queryFilter(requestedFilter)];
            case 1:
                requestedEvents = _a.sent();
                fulfilledFilter = contract.filters.ChainlinkFulfilled();
                return [4 /*yield*/, contract.queryFilter(fulfilledFilter)];
            case 2:
                fulfilledLogs = _a.sent();
                pendingRequests = [];
                _loop_1 = function (i) {
                    var requestedEvent = requestedEvents[i];
                    var requestId = requestedEvent.topics[1];
                    var fulfilledRequest = fulfilledLogs.find(function (log) {
                        var event = contract.interface.parseLog(log);
                        var args = event.args;
                        return args.id === requestId;
                    });
                    if (!fulfilledRequest) {
                        pendingRequests.push(requestedEvent);
                    }
                };
                // Loop through the requested events and check if the requestId is in the fulfilled events
                for (i = 0; i < requestedEvents.length; i++) {
                    _loop_1(i);
                }
                return [2 /*return*/, pendingRequests];
        }
    });
}); };
// Get the oracle request data from the OrderAPIOracle contract for the IDs of the given events
var getOracleRequests = function (contract, requestIds) { return __awaiter(void 0, void 0, void 0, function () {
    var requestFilter, oracleRequests, matchedOracleRequests, _loop_2, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestFilter = contract.filters.OracleRequest();
                return [4 /*yield*/, contract.queryFilter(requestFilter)];
            case 1:
                oracleRequests = _a.sent();
                matchedOracleRequests = [];
                _loop_2 = function (i) {
                    var requestId = requestIds[i];
                    var oracleRequest = oracleRequests.find(function (log) {
                        var event = contract.interface.parseLog(log);
                        var args = event.args;
                        return args.requestId === requestId;
                    });
                    if (oracleRequest) {
                        matchedOracleRequests.push(oracleRequest);
                    }
                };
                // Loop through the pending requests and check if the requestId is in the oracle requests
                for (i = 0; i < requestIds.length; i++) {
                    _loop_2(i);
                }
                return [2 /*return*/, matchedOracleRequests];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var provider, consumerContract, oracleContract, pendingRequests, requestIds, oracleRequests;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                provider = new ethers_1.ethers.providers.AlchemyProvider('mainnet', process.env.ALCHEMY_MAINNET_KEY);
                consumerContract = new ethers_1.ethers.Contract(process.env.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS, OrderAPIConsumer_json_1.abi, provider);
                oracleContract = new ethers_1.ethers.Contract(process.env.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS, OrderAPIOracle_json_1.abi, provider);
                return [4 /*yield*/, getPendingRequests(consumerContract)];
            case 1:
                pendingRequests = _a.sent();
                requestIds = pendingRequests.map(function (event) {
                    return event.topics[1];
                });
                return [4 /*yield*/, getOracleRequests(oracleContract, requestIds)];
            case 2:
                oracleRequests = _a.sent();
                console.log(oracleRequests, "This many requests: " + oracleRequests.length);
                return [2 /*return*/];
        }
    });
}); };
main()
    .then(function () { return process.exit(0); })["catch"](function (error) {
    console.error(error);
    process.exit(1);
});
