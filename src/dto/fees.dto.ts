import { IsEmail, IsString, IsBoolean, IsPositive, Length } from 'class-validator';

export class FeesDto {
   id: string

   currency: string

   locale: string

   entity: string

   property: string

   type: string

   value: string

}