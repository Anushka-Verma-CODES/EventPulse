import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { IncidentsService } from "./incidents.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    roles: string[];
  };
}

@Controller("incidents")
@UseGuards(AuthGuard("jwt"))
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query("eventId") eventId?: string,
  ) {
    return this.incidentsService.findAll(req.user.userId, eventId);
  }

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(req.user.userId, dto);
  }

  @Patch(":id")
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") incidentId: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(req.user.userId, incidentId, dto);
  }

  @Delete(":id")
  remove(
    @Req() req: AuthenticatedRequest,
    @Param("id") incidentId: string,
  ) {
    return this.incidentsService.remove(req.user.userId, incidentId);
  }
}