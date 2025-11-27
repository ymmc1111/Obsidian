import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { CryptoService } from '../crypto/crypto.service';
import { DoubleSigService } from './double-sig.service';

@Module({
    controllers: [LedgerController],
    providers: [LedgerService, CryptoService, DoubleSigService],
    exports: [LedgerService, DoubleSigService],
})
export class LedgerModule { }
