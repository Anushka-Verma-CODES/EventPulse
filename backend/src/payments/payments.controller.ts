import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaymentsService } from "./payments.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("orders")
  createOrder(
    @Req() request: { user: { userId: string } },
    @Body() body: CreateOrderDto,
  ) {
    return this.paymentsService.createOrder(request.user.userId, body.eventId);
  }

  @Post("verify")
  verifyPayment(
    @Req() request: { user: { userId: string } },
    @Body() body: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(request.user.userId, body);
  }
}