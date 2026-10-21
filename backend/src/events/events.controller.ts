  import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
  } from "@nestjs/common";
  import type { Request } from "express";
  import { EventsService } from "./events.service";
  import { CreateEventDto } from "./dto/create-event.dto";
  import { JwtAuthGuard } from "../auth/jwt-auth.guard";
  import { UpdateEventDto } from "./dto/update-event.dto";

  type AuthenticatedRequest = Request & {
    user: {
      userId: string;
      email: string;
      roles: string[];
    };
  };

  @Controller("events")
  export class EventsController {
    constructor(
      private readonly eventsService: EventsService,
    ) {}

    @Get()
    findAll() {
      return this.eventsService.findAll();
    }

    @Get("my-events")
    @UseGuards(JwtAuthGuard)
    findMyEvents(@Req() request: AuthenticatedRequest) {
      const user = request.user;

      if (!user.roles?.includes("organizer")) {
        throw new ForbiddenException(
          "Only organizers can view their own events.",
        );
      }

      return this.eventsService.findMyEvents(user.userId);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
      return this.eventsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(
      @Body() createEventDto: CreateEventDto,
      @Req() request: AuthenticatedRequest,
    ) {
      const user = request.user;

      if (!user.roles?.includes("organizer")) {
        throw new ForbiddenException(
          "Only organizers can create events.",
        );
      }

      return this.eventsService.create(
        createEventDto,
        user.userId,
      );
    }

    
    @Patch(":id/publish")
    @UseGuards(JwtAuthGuard)
    publish(
      @Param("id") id: string,
      @Req() request: AuthenticatedRequest,
    ) {
    const user = request.user;

    if (!user.roles?.includes("organizer")) {
      throw new ForbiddenException(
        "Only organizers can publish events.",
      );
    }

    return this.eventsService.publish(id, user.userId);
    }

    
    @Patch(":id/cancel")
    @UseGuards(JwtAuthGuard)
    cancel(
      @Param("id") id: string,
      @Req() request: AuthenticatedRequest,
    ) {
      const user = request.user;

      if (!user.roles?.includes("organizer")) {
        throw new ForbiddenException(
          "Only organizers can cancel events.",
        );
      }

      return this.eventsService.cancel(id, user.userId);
    }


    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    update(
    @Param("id") id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() request: AuthenticatedRequest,
    ) {
    const user = request.user;

    if (!user.roles?.includes("organizer")) {
      throw new ForbiddenException(
        "Only organizers can update events.",
      );
    }

    return this.eventsService.update(
      id,
      updateEventDto,
      user.userId,
    );
    }

  }
