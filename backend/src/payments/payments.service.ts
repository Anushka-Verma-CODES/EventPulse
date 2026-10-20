import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Repository } from "typeorm";
import Razorpay from "razorpay";
import { Event, EventStatus } from "../events/entities/event.entity";
import { Registration } from "../registrations/entities/registration.entity";
import { Payment, PaymentStatus } from "./entities/payment.entity";

@Injectable()
export class PaymentsService {
  private readonly razorpay: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,

    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
  ) {
    this.keyId =
      this.configService.get<string>("RAZORPAY_KEY_ID") ?? "";

    this.keySecret =
      this.configService.get<string>("RAZORPAY_KEY_SECRET") ?? "";

    if (!this.keyId || !this.keySecret) {
      throw new ServiceUnavailableException(
        "Razorpay credentials are not configured.",
      );
    }

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(attendeeId: string, eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        "You can only purchase tickets for published events.",
      );
    }

    const amountPaise = Math.round(Number(event.price) * 100);

    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      throw new BadRequestException(
        "This event does not have a valid paid ticket price.",
      );
    }

    const existingRegistration =
      await this.registrationsRepository.findOne({
        where: { attendeeId, eventId },
      });

    if (existingRegistration) {
      throw new ConflictException(
        "You are already registered for this event.",
      );
    }

    const registrationCount = await this.registrationsRepository.count({
      where: { eventId },
    });

    if (registrationCount >= event.capacity) {
      throw new BadRequestException("This event is full.");
    }

    const receipt = `evt_${Date.now()}_${attendeeId.slice(0, 8)}`;

    const order = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        eventId,
        attendeeId,
      },
    });

    const payment = this.paymentsRepository.create({
      attendeeId,
      eventId,
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      amountPaise,
      status: PaymentStatus.PENDING,
    });

    await this.paymentsRepository.save(payment);

    return {
      keyId: this.keyId,
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      eventName: event.title,
    };
  }

  async verifyPayment(
    attendeeId: string,
    details: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    const payment = await this.paymentsRepository.findOne({
      where: {
        razorpayOrderId: details.razorpay_order_id,
        attendeeId,
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment order not found.");
    }

    if (payment.status === PaymentStatus.PAID) {
      if (
        payment.razorpayPaymentId === details.razorpay_payment_id
      ) {
        return { message: "Payment already verified." };
      }

      throw new ConflictException(
        "This order has already been paid.",
      );
    }

    if (payment.status === PaymentStatus.REFUND_PENDING) {
      throw new ConflictException(
        "This payment requires a refund. Please contact support.",
      );
    }

    if (
      !details.razorpay_payment_id ||
      !details.razorpay_signature
    ) {
      throw new BadRequestException(
        "Payment verification details are incomplete.",
      );
    }

    const expectedSignature = createHmac("sha256", this.keySecret)
      .update(
        `${payment.razorpayOrderId}|${details.razorpay_payment_id}`,
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(
      details.razorpay_signature,
      "utf8",
    );

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new BadRequestException("Invalid payment signature.");
    }

    const razorpayPayment = await this.razorpay.payments.fetch(
      details.razorpay_payment_id,
    );

    if (
      razorpayPayment.order_id !== payment.razorpayOrderId ||
      razorpayPayment.amount !== payment.amountPaise ||
      razorpayPayment.currency !== "INR" ||
      razorpayPayment.status !== "captured"
    ) {
      throw new BadRequestException(
        "Payment could not be verified as captured.",
      );
    }

    const result = await this.paymentsRepository.manager.transaction(
      async (manager) => {
        const currentPayment = await manager.findOne(Payment, {
          where: {
            id: payment.id,
            attendeeId,
          },
          lock: { mode: "pessimistic_write" },
        });

        if (!currentPayment) {
          throw new NotFoundException("Payment order not found.");
        }

        if (currentPayment.status === PaymentStatus.PAID) {
          if (
            currentPayment.razorpayPaymentId ===
            details.razorpay_payment_id
          ) {
            return { message: "Payment already verified." };
          }

          throw new ConflictException(
            "This order has already been paid.",
          );
        }

        if (
          currentPayment.status === PaymentStatus.REFUND_PENDING
        ) {
          throw new ConflictException(
            "This payment requires a refund. Please contact support.",
          );
        }

        const event = await manager.findOne(Event, {
          where: { id: currentPayment.eventId },
          lock: { mode: "pessimistic_write" },
        });

        if (!event || event.status !== EventStatus.PUBLISHED) {
          currentPayment.razorpayPaymentId =
            details.razorpay_payment_id;
          currentPayment.status = PaymentStatus.REFUND_PENDING;

          await manager.save(Payment, currentPayment);

          return {
            refundRequired: true as const,
            message:
              "Payment was captured, but this event is no longer available. Your refund requires processing.",
          };
        }

        const existingRegistration = await manager.findOne(
          Registration,
          {
            where: {
              attendeeId,
              eventId: currentPayment.eventId,
            },
          },
        );

        if (existingRegistration) {
          throw new ConflictException(
            "You are already registered for this event.",
          );
        }

        const registrationCount = await manager.count(Registration, {
          where: { eventId: currentPayment.eventId },
        });

        if (registrationCount >= event.capacity) {
          currentPayment.razorpayPaymentId =
            details.razorpay_payment_id;
          currentPayment.status = PaymentStatus.REFUND_PENDING;

          await manager.save(Payment, currentPayment);

          return {
            refundRequired: true as const,
            message:
              "Payment was captured, but the event is full. Your refund requires processing.",
          };
        }

        const registration = manager.create(Registration, {
          attendeeId,
          eventId: currentPayment.eventId,
        });

        await manager.save(Registration, registration);

        currentPayment.razorpayPaymentId =
          details.razorpay_payment_id;
        currentPayment.status = PaymentStatus.PAID;

        await manager.save(Payment, currentPayment);

        return {
          message: "Payment verified and registration completed.",
          registrationId: registration.id,
        };
      },
    );

    if ("refundRequired" in result) {
      throw new BadRequestException(result.message);
    }

    return result;
  }
}