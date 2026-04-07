import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    return setting;
  }

  async getAll() {
    return this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async getPublic() {
    return this.prisma.systemSetting.findMany({
      where: { isPublic: true },
      orderBy: { key: 'asc' },
    });
  }

  async upsert(key: string, value: any, description?: string, isPublic?: boolean) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: stringValue, description, isPublic: isPublic ?? false },
      update: { value: stringValue, description, isPublic },
    });
  }

  async remove(key: string) {
    return this.prisma.systemSetting.delete({ where: { key } });
  }
}
