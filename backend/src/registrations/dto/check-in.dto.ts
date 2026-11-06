import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from "class-validator";

export class CheckInDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-f0-9]{64}$/i, {
    message: "qrToken must be a valid 64-character ticket token",
  })
  qrToken?: string;

  @IsOptional()
  @IsString()
  @Matches(/^EP-[A-F0-9]{8}$/i, {
    message: "ticketId must be a valid Ticket ID (EP-XXXXXXXX)",
  })
  ticketId?: string;

  @IsUUID()
  eventId: string;
}