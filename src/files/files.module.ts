import { Module } from '@nestjs/common';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  // imports: [ServeStaticModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
