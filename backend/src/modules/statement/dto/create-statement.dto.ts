import { IsNotEmpty } from "class-validator";

export class CreateStatementDto {
    @IsNotEmpty()
    name: string
    @IsNotEmpty()
    quantity: number
    @IsNotEmpty()
    unitPrice: number
}
