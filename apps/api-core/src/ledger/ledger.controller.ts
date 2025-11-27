import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { DoubleSigService } from './double-sig.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ledger')
export class LedgerController {
    constructor(
        private readonly ledgerService: LedgerService,
        private readonly doubleSigService: DoubleSigService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('event')
    async createEvent(@Request() req: any, @Body() body: any) {
        // Direct execution (Single Sig) - Restricted in production
        return this.ledgerService.recordEvent({
            action_type: body.action_type,
            actor_id: req.user.userId, // Use authenticated user ID
            secondary_actor_id: body.secondary_actor_id,
            payload: body.payload,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('request-approval')
    async requestApproval(@Request() req: any, @Body() body: any) {
        return this.doubleSigService.createPendingAction({
            initiator_id: req.user.userId, // Use authenticated user ID
            action_type: body.action_type,
            payload: body.payload,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('approve/:id')
    async approveAction(@Request() req: any, @Param('id') id: string) {
        return this.doubleSigService.approveAction(id, req.user.userId); // Use authenticated user ID
    }

    @Get('pending')
    async getPending() {
        return this.doubleSigService.getPendingActions();
    }

    @Get('events')
    async getEvents() {
        return this.ledgerService.getLatestEvents();
    }
}
