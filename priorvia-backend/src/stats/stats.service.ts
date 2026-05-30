import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getProjectStats(projectId: string) {
    const [total, done, inProgress, todo] = await Promise.all([
      this.prisma.task.count({ where: { projectId } }),
      this.prisma.task.count({ where: { projectId, status: 'DONE' } }),
      this.prisma.task.count({ where: { projectId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { projectId, status: 'TODO' } }),
    ]);

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const byPriority = await this.prisma.task.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: { priority: true },
    });

    return {
      total,
      done,
      inProgress,
      todo,
      completionRate,
      byPriority: byPriority.map((p) => ({
        priority: p.priority,
        count: p._count.priority,
      })),
    };
  }

  async getTeamStats(teamId: string) {
    const projects = await this.prisma.project.findMany({
      where: { teamId },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const [total, done] = await Promise.all([
      this.prisma.task.count({ where: { projectId: { in: projectIds } } }),
      this.prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
    ]);

    const memberCount = await this.prisma.teamMember.count({ where: { teamId } });

    return {
      totalTasks: total,
      completedTasks: done,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      totalProjects: projects.length,
      memberCount,
    };
  }

  async getActivityLog(teamId: string, limit = 20) {
    return this.prisma.activityLog.findMany({
      where: { teamId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
