"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const index_controller_1 = require("./controller/index.controller");
exports.Routes = [{
        method: "post",
        route: "/fees",
        controller: index_controller_1.IndexController,
        action: "fees"
    }, {
        method: "post",
        route: "/compute-transaction-fee",
        controller: index_controller_1.IndexController,
        action: "compute"
    }];
//# sourceMappingURL=routes.js.map