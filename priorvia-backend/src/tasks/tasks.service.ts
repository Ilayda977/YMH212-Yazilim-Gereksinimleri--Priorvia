import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  async create(dto: CreateTaskDto, creatorId: string) {
    const task = await this.prisma.task.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        creatorId,
      },
      include: { assignee: true, creator: true },
    });

    this.events.emitToProject(task.projectId, 'task:created', task);

    await this.prisma.activityLog.create({
      data: { action: `"${task.title}" gorevi olusturuldu`, userId: creatorId },
    });

    return task;
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: { assignee: true, creator: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Gorev bulunamadi.');

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { assignee: true, creator: true },
    });

    this.events.emitToProject(updated.projectId, 'task:updated', updated);

    if (dto.status) {
      await this.prisma.activityLog.create({
        data: {
          action: `"${updated.title}" gorevi "${dto.status}" durumuna tasindi`,
          userId,
        },
      });
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Gorev bulunamadi.');

    await this.prisma.task.delete({ where: { id } });
    this.events.emitToProject(task.projectId, 'task:deleted', { id });

    await this.prisma.activityLog.create({
      data: { action: `"${task.title}" gorevi silindi`, userId },
    });

    return { message: 'Gorev silindi.' };
  }
}
