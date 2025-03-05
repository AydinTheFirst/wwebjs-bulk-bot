import { User } from "@/types";
import { IsArray, IsString } from "class-validator";

export class SendMessageDto {
  @IsString()
  message: string;

  @IsArray()
  users: User[];
}
