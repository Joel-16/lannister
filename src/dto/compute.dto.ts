import { IsEmail, IsString, IsBoolean, IsPositive, Length, IsNumber,IsNotEmptyObject } from 'class-validator';

class payment {
  ID: number

  @IsString({ message: "Value must be of type String" })
  Issuer: string

  @IsString({ message: "Value must be of type String" })
  Brand: string

  @IsString({ message: "Value must be of type String" })
  Number: string

  @Length(6, 6, { message: "SixID isn't of the right length" })
  SixID: number

  @IsString({ message: "Value must be of type String" })
  Type: string

  @IsString({ message: "Value must be of type String" })
  Country: string
}

class customer {
  @IsNumber()
  ID: number

  @IsEmail()
  EmailAddress: string

  @IsString({ message: "Value must be of type String" })
  FullName: string

  @IsBoolean({ message: "Value must be of type Boolean" })
  BearsFee: boolean
}

export class ComputeDto {
  @IsNumber()
  ID: number

  @IsPositive({ message: "Amount must be a postive number" })
  Amount: number

  @IsString({ message: "Value must be of type String" })
  Currency: string

  @IsString({ message: "Value must be of type String" })
  CurrencyCountry: string

  @IsNotEmptyObject()
  Customer: customer

  @IsNotEmptyObject()
  PaymentEntity: payment

}