import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    async getInventory() {
        return this.inventoryService.getAllItems();
    }

    @Post(':id/adjust')
    async adjustQuantity(@Param('id') id: string, @Body() body: { delta: number }) {
        return this.inventoryService.updateQuantity(id, body.delta);
    }
}
