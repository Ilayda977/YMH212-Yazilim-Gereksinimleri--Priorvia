import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, ownerId: string) {
    const team = await this.prisma.team.create({
      data: {
        name,
        members: { create: { userId: ownerId, role: 'OWNER' } },
      },
      include: { members: { include: { user: true } } },
    });

    await this.prisma.activityLog.create({
      data: { action: `"${name}" takimi olusturuldu`, userId: ownerId, teamId: team.id },
    });

    return team;
  }

  async findMyTeams(userId: string) {
    return this.prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { members: { include: { user: true } }, projects: true },
    });
  }

  async inviteMember(teamId: string, inviteeEmail: string, inviterId: string) {
    const user = await this.prisma.user.findUnique({ where: { email: inviteeEmail } });
    if (!user) throw new NotFoundException('Kullanici bulunamadi.');

    const existing = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: user.id, teamId } },
    });
    if (existing) throw new ConflictException('Kullanici zaten takimda.');

    const member = await this.prisma.teamMember.create({
      data: { userId: user.id, teamId },
      include: { user: true },
    });

    await this.prisma.activityLog.create({
      data: {
        action: `${user.name} takima davet edildi`,
        userId: inviterId,
        teamId,
      },
    });

    return member;
  }

  async removeMember(teamId: string, userId: string, removerId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
      include: { user: true },
    });
    if (!member) throw new NotFoundException('Uye bulunamadi.');

    await this.prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId } },
    });

    await this.prisma.activityLog.create({
      data: {
        action: `${member.user.name} takimdan cikarildi`,
        userId: removerId,
        teamId,
      },
    });

    return { message: 'Uye takimdan cikarildi.' };
  }
}
