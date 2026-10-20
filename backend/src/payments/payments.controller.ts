import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaymentsService } from "./payments.service";

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post("orders")
  createOrder(
    @Req() request: { user: { userId: string } },
    @Body() body: { eventId: string },
  ) {
    return this.paymentsService.createOrder(
      request.user.userId,
      body.eventId,
    );
  }

  @Post("verify")
  verifyPayment(
    @Req() request: { user: { userId: string } },
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    return this.paymentsService.verifyPayment(
      request.user.userId,
      body,
    );
  }
}
