import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  create(@Body('name') name: string, @Request() req) {
    return this.teamsService.create(name, req.user.id);
  }

  @Get('my')
  findMyTeams(@Request() req) {
    return this.teamsService.findMyTeams(req.user.id);
  }

  @Post(':id/invite')
  invite(@Param('id') teamId: string, @Body('email') email: string, @Request() req) {
    return this.teamsService.inviteMember(teamId, email, req.user.id);
  }

  @Delete(':teamId/members/:userId')
  removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.teamsService.removeMember(teamId, userId, req.user.id);
  }
}
