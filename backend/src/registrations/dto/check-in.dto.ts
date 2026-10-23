import { IsString, IsUUID, Matches } from "class-validator";

export class CheckInDto {
  // QR tokens are generated with randomBytes(32).toString("hex") => 64 hex chars
  @IsString()
  @Matches(/^[a-f0-9]{64}$/i, {
    message: "qrToken must be a valid 64-character ticket token",
  })
  qrToken: string;

  @IsUUID()
  eventId: string;
}