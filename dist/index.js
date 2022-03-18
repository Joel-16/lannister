"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
app.use(bodyParser.json());
routes_1.Routes.forEach(route => {
    app[route.method](route.route, (req, res, next) => {
        const result = (new route.controller)[route.action](req, res, next);
        if (result instanceof Promise) {
            result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);
        }
        else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
});
app.listen(process.env.PORT || 3000, () => {
    console.log("Express server has started on port 3000. ");
});
//# sourceMappingURL=index.js.map