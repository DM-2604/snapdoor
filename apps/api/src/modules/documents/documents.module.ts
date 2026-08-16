// Implements v3 — Documents module

import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

import { StoreDocumentsController } from './store-documents.controller';

@Module({
  controllers: [DocumentsController, StoreDocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
