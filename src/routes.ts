import {IndexController} from "./controller/index.controller";

export const Routes = [{
    method: "post",
    route: "/fees",
    controller: IndexController,
    action: "fees"
}, {
    method: "post",
    route: "/compute-transaction-fee",
    controller: IndexController,
    action: "compute"
}];