"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeDto = void 0;
const class_validator_1 = require("class-validator");
class payment {
}
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], payment.prototype, "Issuer", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], payment.prototype, "Brand", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], payment.prototype, "Number", void 0);
__decorate([
    (0, class_validator_1.Length)(6, 6, { message: "SixID isn't of the right length" }),
    __metadata("design:type", Number)
], payment.prototype, "SixID", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], payment.prototype, "Type", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], payment.prototype, "Country", void 0);
class customer {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], customer.prototype, "ID", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], customer.prototype, "EmailAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], customer.prototype, "FullName", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: "Value must be of type Boolean" }),
    __metadata("design:type", Boolean)
], customer.prototype, "BearsFee", void 0);
class ComputeDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ComputeDto.prototype, "ID", void 0);
__decorate([
    (0, class_validator_1.IsPositive)({ message: "Amount must be a postive number" }),
    __metadata("design:type", Number)
], ComputeDto.prototype, "Amount", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], ComputeDto.prototype, "Currency", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Value must be of type String" }),
    __metadata("design:type", String)
], ComputeDto.prototype, "CurrencyCountry", void 0);
__decorate([
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", customer)
], ComputeDto.prototype, "Customer", void 0);
__decorate([
    (0, class_validator_1.IsNotEmptyObject)(),
    __metadata("design:type", payment)
], ComputeDto.prototype, "PaymentEntity", void 0);
exports.ComputeDto = ComputeDto;
//# sourceMappingURL=compute.dto.js.map