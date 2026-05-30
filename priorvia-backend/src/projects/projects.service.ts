import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: dto,
      include: { team: true },
    });

    await this.prisma.activityLog.create({
      data: { action: `"${project.name}" projesi olusturuldu`, userId, teamId: dto.teamId },
    });

    return project;
  }

  async findByTeam(teamId: string) {
    return this.prisma.project.findMany({
      where: { teamId },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { tasks: { include: { assignee: true, creator: true } } },
    });
    if (!project) throw new NotFoundException('Proje bulunamadi.');
    return project;
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Proje bulunamadi.');
    await this.prisma.project.delete({ where: { id } });
    await this.prisma.activityLog.create({
      data: { action: `"${project.name}" projesi silindi`, userId, teamId: project.teamId },
    });
    return { message: 'Proje silindi.' };
  }
}
