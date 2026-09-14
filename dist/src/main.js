"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: true,
        credentials: true,
    });
    const apiPrefix = configService.get('app.apiPrefix') || 'api';
    const apiVersion = configService.get('app.apiVersion') || '1';
    app.setGlobalPrefix(apiPrefix);
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: apiVersion,
    });
    app.useGlobalPipes((0, validation_pipe_1.createValidationPipe)());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('First Choose API')
        .setDescription('Production-grade API for First Choose Platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'First Choose API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            showRequestDuration: true,
        },
    });
    const port = configService.get('app.port') || 3000;
    await app.listen(port);
    logger.log(`====================================================`);
    logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}/v${apiVersion}`);
    logger.log(`📚 Swagger Docs available on: http://localhost:${port}/api/docs`);
    logger.log(`🩺 Health check available on: http://localhost:${port}/${apiPrefix}/v${apiVersion}/health`);
    logger.log(`====================================================`);
}
void bootstrap();
//# sourceMappingURL=main.js.map