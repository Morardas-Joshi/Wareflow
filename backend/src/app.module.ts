import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { VendorsModule } from './vendors/vendors.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CustomersModule,
    VendorsModule,
    InventoryModule,
    SalesOrdersModule,
    PurchaseOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
