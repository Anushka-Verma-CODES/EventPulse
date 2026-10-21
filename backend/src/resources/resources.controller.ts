
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ResourcesService } from "./resources.service";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
    roles: string[];
  };
};

@Controller("resources")
@UseGuards(AuthGuard("jwt"))
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
  ) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.resourcesService.findAll(
      request.user.userId,
    );
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() input: CreateResourceDto,
  ) {
    return this.resourcesService.create(
      request.user.userId,
      input,
    );
  }

  @Patch(":id")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateResourceDto,
  ) {
    return this.resourcesService.update(
      request.user.userId,
      id,
      input,
    );
  }

  @Delete(":id")
  remove(
    @Req() request: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.resourcesService.remove(
      request.user.userId,
      id,
    );
  }
}
