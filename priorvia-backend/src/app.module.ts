import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { StatsModule } from './stats/stats.module';
import { EventsModule } from './events/events.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TasksModule,
    TeamsModule,
    StatsModule,
    EventsModule,
    ProjectsModule,
  ],
})
export class AppModule {}
