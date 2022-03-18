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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexController = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const HttpException_1 = require("../exceptions/HttpException");
const client = new ioredis_1.default({ host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT), password: process.env.REDIS_PASSWORD });
class IndexController {
    fees(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = req.body;
            let fcs = data.FeeConfigurationSpec.split('\n');
            yield client.flushall();
            try {
                for (let i = 0; i < fcs.length; ++i) {
                    let parsedData = fcs[i].split(' ');
                    let entity = parsedData[3].split('(');
                    if (parsedData[0].length != 8) {
                        throw new HttpException_1.HttpException(400, "Unsupported FEE_ID value at one of the FEE_ID values");
                    }
                    if (!(['CREDIT-CARD', 'DEBIT-CARD', 'BANK-ACCOUNT', 'USSD', 'WALLET-ID', '*'].includes(entity[0]))) {
                        throw new HttpException_1.HttpException(400, "Unsupported FEE_ENTITY value at one of the FEE_ENTITY values");
                    }
                    if (!(['FLAT', 'PERC', 'FLAT_PERC'].includes(parsedData[6]))) {
                        throw new HttpException_1.HttpException(400, "Unsupported FEE_TYPE value at one of the FEE_TYPE values");
                    }
                    let stuff = {
                        id: parsedData[0],
                        currency: parsedData[1],
                        locale: parsedData[2],
                        entity: entity[0],
                        property: entity[1].slice(0, -1),
                        type: parsedData[6],
                        value: parsedData[7]
                    };
                    yield client.set(stuff.id, JSON.stringify(stuff));
                }
            }
            catch (error) {
                next(error);
            }
            res.status(200).json({ status: "ok" });
        });
    }
    compute(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const values = yield client.mget(yield client.keys('*'));
            let data = [];
            for (let i = 0; i < values.length; ++i) {
                data.push(JSON.parse(values[i]));
            }
            const payload = req.body;
            let main = {
                currency: '',
                locale: '',
                entity: '',
                property: ''
            };
            main.currency = payload.Currency;
            if (payload.Currency.includes(payload.CurrencyCountry)) {
                main.locale = 'LOCL';
            }
            else {
                main.locale = 'INTL';
            }
            let result = {
                AppliedFeeID: "",
                AppliedFeeValue: 0,
                ChargeAmount: 0,
                SettlementAmount: 0
            };
            let test = [];
            for (let i = 0; i < data.length; ++i) {
                if (data[i].currency === payload.Currency) {
                    if (data[i].locale === main.locale) {
                        if (data[i].entity === payload.PaymentEntity.Type) {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                        else if (data[i].entity === '*') {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                    }
                    else if (data[i].locale === '*') {
                        if (data[i].entity === payload.PaymentEntity.Type) {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                        else if (data[i].entity === '*') {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                    }
                }
                else if (data[i].currency === '*') {
                    if (data[i].locale === main.locale) {
                        if (data[i].entity === payload.PaymentEntity.Type) {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                        else if (data[i].entity === '*') {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                    }
                    else if (data[i].locale === '*') {
                        console.log('got here');
                        if (data[i].entity === payload.PaymentEntity.Type) {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                        else if (data[i].entity === '*') {
                            if (data[i].property === payload.PaymentEntity.Issuer) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Brand) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === payload.PaymentEntity.Number) {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                            else if (data[i].property === '*') {
                                if (data[i].type === 'FLAT') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value);
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = (Number(data[i].value) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                                else if (data[i].type === 'FLAT_PERC') {
                                    result.AppliedFeeID = data[i].id;
                                    result.AppliedFeeValue = Number(data[i].value.split(':')[0]) + (Number(data[i].value.split(':')[1]) * payload.Amount) / 100;
                                    if (payload.Customer.BearsFee) {
                                        result.ChargeAmount = payload.Amount + result.AppliedFeeValue;
                                    }
                                    else {
                                        result.ChargeAmount = payload.Amount;
                                    }
                                    result.SettlementAmount = result.ChargeAmount - result.AppliedFeeValue;
                                    res.status(200).json(result);
                                    break;
                                }
                            }
                        }
                    }
                }
                test.push(false);
            }
            if (test.length === data.length) {
                res.status(400).json({
                    "Error": "No fee configuration for this transactions."
                });
            }
        });
    }
}
exports.IndexController = IndexController;
//# sourceMappingURL=index.controller.js.map