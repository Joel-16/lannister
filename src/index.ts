import "reflect-metadata";
import 'dotenv/config'
import express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";

const app = express();
app.use(bodyParser.json());


Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
        const result = (new (route.controller as any))[route.action](req, res, next);
        if (result instanceof Promise) {
            result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

        } else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Express server has started on port 3000. ");
});




