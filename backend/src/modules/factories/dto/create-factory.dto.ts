import { IsNotEmpty, IsString } from "class-validator";

export class CreateFactoryDto {
    @IsNotEmpty()
    @IsString()
    name: string
}
