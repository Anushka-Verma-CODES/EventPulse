import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";

import {
  createHmac,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";

import { EntityManager, Repository } from "typeorm";
import Razorpay from "razorpay";

import { Event, EventStatus } from "../events/entities/event.entity";
import { Registration } from "../registrations/entities/registration.entity";
import { TicketListing } from "../ticket-listings/ticket-listing.entity";

import {
  Payment,
  PaymentStatus,
} from "./entities/payment.entity";

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

    @InjectRepository(TicketListing)
    private readonly ticketListingsRepository: Repository<TicketListing>,
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

  // =========================================================
  // NORMAL EVENT PAYMENT
  // =========================================================

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

    const registrationCount =
      await this.registrationsRepository.count({
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

  // =========================================================
  // RESALE TICKET PAYMENT - CREATE RAZORPAY ORDER
  // =========================================================

  async createResaleOrder(
    attendeeId: string,
    listingId: string,
  ) {
    const listing = await this.ticketListingsRepository.findOne({
      where: {
        id: listingId,
        status: "AVAILABLE",
      },
    });

    if (!listing) {
      throw new NotFoundException(
        "This resale ticket is no longer available.",
      );
    }

    // Fetch the original event.
    const event = await this.eventsRepository.findOne({
      where: {
        id: listing.eventId,
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found.");
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        "Tickets can only be purchased for published events.",
      );
    }

    // Enforce the maximum resale price.
    const resalePrice = Number(listing.price);
    const originalPrice = Number(event.price);

    if (
      !Number.isFinite(resalePrice) ||
      !Number.isFinite(originalPrice) ||
      resalePrice <= 0
    ) {
      throw new BadRequestException(
        "The resale listing has an invalid price.",
      );
    }

    if (resalePrice > originalPrice) {
      throw new BadRequestException(
        `Resale price cannot exceed the original ticket price of ₹${originalPrice}.`,
      );
    }

    // Verify that the seller owns the original ticket.
    const sellerRegistrationId =
      await this.findRegistrationIdFromTicketCode(
        this.registrationsRepository.manager,
        listing,
      );

    if (!sellerRegistrationId) {
      throw new BadRequestException(
        "The seller's original ticket could not be verified.",
      );
    }

    const sellerRegistration =
      await this.registrationsRepository.findOne({
        where: {
          id: sellerRegistrationId,
          eventId: listing.eventId,
        },
      });

    if (
      !sellerRegistration ||
      !sellerRegistration.qrToken
    ) {
      throw new ConflictException(
        "The seller's ticket is no longer valid.",
      );
    }

    if (sellerRegistration.attendeeId === attendeeId) {
      throw new BadRequestException(
        "You cannot purchase your own resale ticket.",
      );
    }

    const amountPaise = Math.round(resalePrice * 100);

    if (
      !Number.isSafeInteger(amountPaise) ||
      amountPaise <= 0
    ) {
      throw new BadRequestException(
        "This resale listing has an invalid price.",
      );
    }

    // Check whether the buyer already owns a ticket.
    const existingRegistration =
      await this.registrationsRepository.findOne({
        where: {
          attendeeId,
          eventId: listing.eventId,
        },
      });

    if (existingRegistration) {
      throw new ConflictException(
        "You already have a ticket for this event.",
      );
    }

    // Create Razorpay order.
    const order = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `resale_${Date.now()}_${attendeeId.slice(0, 8)}`,
      notes: {
        listingId,
        eventId: listing.eventId,
        buyerId: attendeeId,
      },
    });

    // Save pending payment.
    const payment = this.paymentsRepository.create({
      attendeeId,
      eventId: listing.eventId,
      resaleListingId: listing.id,
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
      ticketCode: listing.ticketCode,
    };
  }

  // =========================================================
  // RESALE TICKET PAYMENT - VERIFY AND TRANSFER
  // =========================================================

  async verifyResalePayment(
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

    if (!payment || !payment.resaleListingId) {
      throw new NotFoundException(
        "Resale payment order not found.",
      );
    }

    if (payment.status === PaymentStatus.PAID) {
      if (
        payment.razorpayPaymentId ===
        details.razorpay_payment_id
      ) {
        return {
          message: "Resale payment already verified.",
        };
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

    // Verify Razorpay signature.
    const expectedSignature = createHmac(
      "sha256",
      this.keySecret,
    )
      .update(
        `${payment.razorpayOrderId}|${details.razorpay_payment_id}`,
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8",
    );

    const receivedBuffer = Buffer.from(
      details.razorpay_signature,
      "utf8",
    );

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new BadRequestException(
        "Invalid payment signature.",
      );
    }

    // Verify the actual Razorpay payment.
    const razorpayPayment =
      await this.razorpay.payments.fetch(
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

    // Transfer registration and update records atomically.
    const result =
      await this.paymentsRepository.manager.transaction(
        async (manager) => {
          const currentPayment = await manager.findOne(
            Payment,
            {
              where: {
                id: payment.id,
                attendeeId,
              },
              lock: {
                mode: "pessimistic_write",
              },
            },
          );

          if (
            !currentPayment ||
            !currentPayment.resaleListingId
          ) {
            throw new NotFoundException(
              "Resale payment order not found.",
            );
          }

          if (currentPayment.status === PaymentStatus.PAID) {
            if (
              currentPayment.razorpayPaymentId ===
              details.razorpay_payment_id
            ) {
              return {
                message: "Resale payment already verified.",
              };
            }

            throw new ConflictException(
              "This order has already been paid.",
            );
          }

          if (
            currentPayment.status ===
            PaymentStatus.REFUND_PENDING
          ) {
            throw new ConflictException(
              "This payment requires a refund. Please contact support.",
            );
          }

          const listing = await manager.findOne(
            TicketListing,
            {
              where: {
                id: currentPayment.resaleListingId,
              },
              lock: {
                mode: "pessimistic_write",
              },
            },
          );

          if (
            !listing ||
            listing.status !== "AVAILABLE"
          ) {
            currentPayment.razorpayPaymentId =
              details.razorpay_payment_id;

            currentPayment.status =
              PaymentStatus.REFUND_PENDING;

            await manager.save(Payment, currentPayment);

            return {
              refundRequired: true as const,
              message:
                "This ticket was sold to someone else. Your captured payment requires a refund.",
            };
          }

          // Recheck the original event price at payment verification.
          const event = await manager.findOne(Event, {
            where: {
              id: listing.eventId,
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

          if (
            !event ||
            Number(listing.price) > Number(event.price)
          ) {
            currentPayment.razorpayPaymentId =
              details.razorpay_payment_id;

            currentPayment.status =
              PaymentStatus.REFUND_PENDING;

            await manager.save(Payment, currentPayment);

            return {
              refundRequired: true as const,
              message:
                "The resale price is now higher than the event's original ticket price. Your captured payment requires a refund.",
            };
          }

          const existingBuyerRegistration =
            await manager.findOne(Registration, {
              where: {
                attendeeId,
                eventId: listing.eventId,
              },
            });

          if (existingBuyerRegistration) {
            currentPayment.razorpayPaymentId =
              details.razorpay_payment_id;

            currentPayment.status =
              PaymentStatus.REFUND_PENDING;

            await manager.save(Payment, currentPayment);

            return {
              refundRequired: true as const,
              message:
                "You already have a ticket for this event. Your captured payment requires a refund.",
            };
          }

          // Find the seller's original registration.
          const sellerRegistrationId =
            await this.findRegistrationIdFromTicketCode(
              manager,
              listing,
            );

          if (!sellerRegistrationId) {
            currentPayment.razorpayPaymentId =
              details.razorpay_payment_id;

            currentPayment.status =
              PaymentStatus.REFUND_PENDING;

            await manager.save(Payment, currentPayment);

            return {
              refundRequired: true as const,
              message:
                "The seller's original ticket could not be verified. Your captured payment requires a refund.",
            };
          }

          const sellerRegistration =
            await manager.findOne(Registration, {
              where: {
                id: sellerRegistrationId,
                eventId: listing.eventId,
              },
              lock: {
                mode: "pessimistic_write",
              },
            });

          if (
            !sellerRegistration ||
            !sellerRegistration.qrToken
          ) {
            currentPayment.razorpayPaymentId =
              details.razorpay_payment_id;

            currentPayment.status =
              PaymentStatus.REFUND_PENDING;

            await manager.save(Payment, currentPayment);

            return {
              refundRequired: true as const,
              message:
                "The seller's ticket is no longer valid. Your captured payment requires a refund.",
            };
          }

          // Transfer existing registration to the buyer.
          sellerRegistration.attendeeId = attendeeId;

          // Generate a new QR token.
          // The seller's previous QR becomes invalid.
          sellerRegistration.qrToken =
            randomBytes(32).toString("hex");

          sellerRegistration.isCheckedIn = false;
          sellerRegistration.checkedInAt = null;

          await manager.save(
            Registration,
            sellerRegistration,
          );

          // Mark listing as sold.
          listing.status = "SOLD";

          await manager.save(
            TicketListing,
            listing,
          );

          // Mark payment as paid.
          currentPayment.razorpayPaymentId =
            details.razorpay_payment_id;

          currentPayment.status = PaymentStatus.PAID;

          await manager.save(
            Payment,
            currentPayment,
          );

          return {
            message:
              "Payment verified. The resale ticket has been transferred to your account.",
            registrationId: sellerRegistration.id,
          };
        },
      );

    if ("refundRequired" in result) {
      throw new BadRequestException(result.message);
    }

    return result;
  }

  // =========================================================
  // FIND SELLER REGISTRATION USING TICKET CODE
  // =========================================================

  private async findRegistrationIdFromTicketCode(
    manager: EntityManager,
    listing: TicketListing,
  ): Promise<string | null> {
    const registration = await manager
      .createQueryBuilder(Registration, "registration")
      .where(
        "registration.eventId = :eventId",
        {
          eventId: listing.eventId,
        },
      )
      .andWhere("registration.qrToken IS NOT NULL")
      .andWhere(
        "CONCAT('EP-', UPPER(SUBSTRING(REPLACE(registration.id::text, '-', ''), 1, 8))) = :ticketCode",
        {
          ticketCode: listing.ticketCode,
        },
      )
      .getOne();

    return registration?.id ?? null;
  }

  // =========================================================
  // NORMAL EVENT PAYMENT - VERIFY
  // =========================================================

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
      throw new NotFoundException(
        "Payment order not found.",
      );
    }

    if (payment.status === PaymentStatus.PAID) {
      if (
        payment.razorpayPaymentId ===
        details.razorpay_payment_id
      ) {
        return {
          message: "Payment already verified.",
        };
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

    const expectedSignature = createHmac(
      "sha256",
      this.keySecret,
    )
      .update(
        `${payment.razorpayOrderId}|${details.razorpay_payment_id}`,
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8",
    );

    const receivedBuffer = Buffer.from(
      details.razorpay_signature,
      "utf8",
    );

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new BadRequestException(
        "Invalid payment signature.",
      );
    }

    const razorpayPayment =
      await this.razorpay.payments.fetch(
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

    const result =
      await this.paymentsRepository.manager.transaction(
        async (manager) => {
          const currentPayment = await manager.findOne(
            Payment,
            {
              where: {
                id: payment.id,
                attendeeId,
              },
              lock: {
                mode: "pessimistic_write",
              },
            },
          );

          if (!currentPayment) {
            throw new NotFoundException(
              "Payment order not found.",
            );
          }

          if (currentPayment.status === PaymentStatus.PAID) {
            if (
              currentPayment.razorpayPaymentId ===
              details.razorpay_payment_id
            ) {
              return {
                message: "Payment already verified.",
              };
            }

            throw new ConflictException(
              "This order has already been paid.",
            );
          }

          if (
            currentPayment.status ===
            PaymentStatus.REFUND_PENDING
          ) {
            throw new ConflictException(
              "This payment requires a refund. Please contact support.",
            );
          }

          const event = await manager.findOne(Event, {
            where: {
              id: currentPayment.eventId,
            },
            lock: {
              mode: "pessimistic_write",
            },
          });

          if (
            !event ||
            event.status !== EventStatus.PUBLISHED
          ) {
            currentPayment.razorpayPaymentId =
              details.razorpay_payment_id;

            currentPayment.status =
              PaymentStatus.REFUND_PENDING;

            await manager.save(
              Payment,
              currentPayment,
            );

            return {
              refundRequired: true as const,
              message:
                "Payment was captured, but this event is no longer available. Your refund requires processing.",
            };
          }

          const existingRegistration =
            await manager.findOne(Registration, {
              where: {
                attendeeId,
                eventId: currentPayment.eventId,
              },
            });

          if (existingRegistration) {
            throw new ConflictException(
              "You are already registered for this event.",
            );
          }

          const registrationCount =
            await manager.count(Registration, {
              where: {
                eventId: currentPayment.eventId,
              },
            });

          if (registrationCount >= event.capacity) {
            currentPayment.razorpayPaymentId =
              details.razorpay_payment_id;

            currentPayment.status =
              PaymentStatus.REFUND_PENDING;

            await manager.save(
              Payment,
              currentPayment,
            );

            return {
              refundRequired: true as const,
              message:
                "Payment was captured, but the event is full. Your refund requires processing.",
            };
          }

          const registration = manager.create(
            Registration,
            {
              attendeeId,
              eventId: currentPayment.eventId,
              qrToken: randomBytes(32).toString("hex"),
              isCheckedIn: false,
              checkedInAt: null,
            },
          );

          await manager.save(
            Registration,
            registration,
          );

          currentPayment.razorpayPaymentId =
            details.razorpay_payment_id;

          currentPayment.status = PaymentStatus.PAID;

          await manager.save(
            Payment,
            currentPayment,
          );

          return {
            message:
              "Payment verified and registration completed.",
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
