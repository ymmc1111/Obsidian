import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LedgerModule } from './ledger/ledger.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [LedgerModule, InventoryModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
