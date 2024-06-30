import { IsNotEmpty } from "class-validator"

export class CreateReceivingDto {
    @IsNotEmpty()
    name: string
    @IsNotEmpty()
    quantity: number
    @IsNotEmpty()
    unitPrice: number
}
