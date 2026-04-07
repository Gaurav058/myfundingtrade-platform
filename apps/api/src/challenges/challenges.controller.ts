import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List active challenge plans' })
  getPlans() {
    return this.challengesService.getPlans();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get challenges for a specific user' })
  getUserChallenges(@Param('userId') userId: string) {
    return this.challengesService.getUserChallenges(userId);
  }
}
