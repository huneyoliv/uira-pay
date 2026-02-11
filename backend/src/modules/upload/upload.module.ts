import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        MulterModule.register({
            dest: './uploads',
        }),
    ],
    controllers: [UploadController],
})
export class UploadModule { }
