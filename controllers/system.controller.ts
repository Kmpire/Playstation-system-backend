import { Controller, Route, Tags, Get } from "tsoa";
import type { HealthResponse } from "../types/system.types.js";

@Route("api/v1/health")
@Tags("System")
export class SystemController extends Controller {
  @Get("")
  public async getHealth(): Promise<HealthResponse> {
    return {
      status: "ok",
      service: "playstation-system-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
