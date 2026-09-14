import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { ProblemDetailResponseDto } from './dto/category-response.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Problems')
@Controller('problems')
export class ProblemsController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌐 [PUBLIC] Get problem type by ID',
    description: '🌐 **Access:** Public\n\nRetrieves problem type details including parent category context and estimated price range.',
  })
  @ApiParam({
    name: 'id',
    description: 'Problem Type UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Problem type details',
    type: ProblemDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Problem type not found',
  })
  async findOne(@Param('id') id: string): Promise<ProblemDetailResponseDto> {
    return this.categoriesService.findProblemById(id);
  }
}
