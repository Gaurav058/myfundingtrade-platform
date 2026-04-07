import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: { ...dto, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined },
      create: {
        userId,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }
}
