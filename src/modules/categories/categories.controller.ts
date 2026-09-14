import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoriesService, SeedCatalogResult } from './categories.service';
import {
  CategoryResponseDto,
  ProblemTypeResponseDto,
} from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🔒 [ADMIN] Create a new service category',
    description: '🔒 **Access:** Admin / Catalog Manager\n\nCreates a custom service category (e.g. Pest Control, Salon at Home).',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.createCategory(dto);
  }

  @Public()
  @Post(':id/problems')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🔒 [ADMIN] Create a problem type under a category',
    description: '🔒 **Access:** Admin / Catalog Manager\n\nAdds a new problem type with estimated price range under the specified category ID or slug.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID or URL slug',
    example: 'ac-repair',
  })
  @ApiResponse({
    status: 201,
    description: 'Problem type created successfully',
    type: ProblemTypeResponseDto,
  })
  async createProblem(
    @Param('id') id: string,
    @Body() dto: CreateProblemTypeDto,
  ): Promise<ProblemTypeResponseDto> {
    return this.categoriesService.createProblemType(id, dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌐 [PUBLIC] List all service categories',
    description: '🌐 **Access:** Public\n\nReturns all active categories with problem type count for home/discovery catalog. Optional ?filter= query (e.g. repairs, appliances, cleaning, automotive, tech, interiors).',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filter categories by sector/domain (repairs, appliances, cleaning, automotive, tech, interiors)',
    example: 'appliances',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active categories',
    type: [CategoryResponseDto],
  })
  async findAll(@Query('filter') filter?: string): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll(filter);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌐 [PUBLIC] Get category by ID or slug',
    description: '🌐 **Access:** Public\n\nRetrieves a single service category with its active problem types using UUID or slug (e.g. "ac-repair").',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID or URL slug (e.g. ac-repair, electrician)',
    example: 'ac-repair',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details with problem types',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findByIdOrSlug(id);
  }

  @Public()
  @Get(':id/problems')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌐 [PUBLIC] Get problems by category ID or slug',
    description: '🌐 **Access:** Public\n\nReturns all problem types belonging to the specified category ID or slug.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID or URL slug',
    example: 'ac-repair',
  })
  @ApiResponse({
    status: 200,
    description: 'List of problem types under the category',
    type: [ProblemTypeResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findProblems(@Param('id') id: string): Promise<ProblemTypeResponseDto[]> {
    return this.categoriesService.findProblemsByCategoryId(id);
  }

  @Public()
  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '⚡ [ADMIN / DEV] Seed initial catalog data',
    description: '⚡ **Access:** Admin / DevOps Setup\n\nSeeds the database with essential home service categories and problem types (AC, Electrician, Plumber, etc.).',
  })
  @ApiResponse({
    status: 201,
    description: 'Catalog seeded successfully',
  })
  async seed(): Promise<SeedCatalogResult> {
    return this.categoriesService.seedCatalog();
  }
}
