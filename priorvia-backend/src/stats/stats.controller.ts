import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('project/:projectId')
  getProjectStats(@Param('projectId') projectId: string) {
    return this.statsService.getProjectStats(projectId);
  }

  @Get('team/:teamId')
  getTeamStats(@Param('teamId') teamId: string) {
    return this.statsService.getTeamStats(teamId);
  }

  @Get('team/:teamId/activity')
  getActivity(@Param('teamId') teamId: string, @Query('limit') limit: string) {
    return this.statsService.getActivityLog(teamId, limit ? parseInt(limit) : 20);
  }
}
