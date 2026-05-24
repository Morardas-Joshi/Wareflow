import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Roles & Permissions
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Full system access',
    },
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@flowcore.com' },
    update: {},
    create: {
      email: 'admin@flowcore.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
    },
  });

  console.log(`👤 Admin user seeded: admin@flowcore.com / admin123`);

  // 2. Categories
  const officeFurniture = await prisma.category.create({
    data: { name: 'Office Furniture', description: 'Ergonomic chairs, desks, and cabinets' },
  });

  const electronics = await prisma.category.create({
    data: { name: 'Electronics', description: 'Computers, screens, and computer accessories' },
  });

  console.log('📁 Categories seeded');

  // 3. Products
  const chair = await prisma.product.create({
    data: {
      sku: 'FURN-CH-001',
      barcode: '987654321001',
      name: 'Ergonomic Office Chair',
      description: 'High-back mesh chair with adjustable lumbar support and armrests',
      unitPrice: 249.99,
      costPrice: 135.00,
      weight: 15.4,
      categoryId: officeFurniture.id,
    },
  });

  const desk = await prisma.product.create({
    data: {
      sku: 'FURN-DK-002',
      barcode: '987654321002',
      name: 'Adjustable Standing Desk',
      description: 'Electric dual-motor height adjustable sit-to-stand desk',
      unitPrice: 499.99,
      costPrice: 280.00,
      weight: 28.5,
      categoryId: officeFurniture.id,
    },
  });

  const laptop = await prisma.product.create({
    data: {
      sku: 'ELEC-LP-003',
      barcode: '987654321003',
      name: 'Enterprise Laptop Pro',
      description: '14-inch developer workhorse with 32GB RAM and 1TB SSD',
      unitPrice: 1499.99,
      costPrice: 950.00,
      weight: 1.4,
      categoryId: electronics.id,
    },
  });

  console.log('📦 Products seeded');

  // 4. Customers
  const acme = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      email: 'procurement@acme.com',
      phone: '+1-555-0100',
      company: 'Acme Corp Inc.',
      taxId: 'US-99887766',
      creditLimit: 10000.0,
      addressLine1: '100 Acme Way',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      postalCode: '78701',
    },
  });

  const wayne = await prisma.customer.create({
    data: {
      name: 'Wayne Enterprises',
      email: 'purchasing@waynecorp.com',
      phone: '+1-555-1939',
      company: 'Wayne Enterprises Ltd.',
      taxId: 'US-88776655',
      creditLimit: 50000.0,
      addressLine1: '1007 Mountain Drive',
      city: 'Gotham',
      state: 'NJ',
      country: 'USA',
      postalCode: '07001',
    },
  });

  console.log('👥 Customers seeded');

  // 5. Vendors
  const steelcase = await prisma.vendor.create({
    data: {
      name: 'Steelcase Inc.',
      email: 'b2b@steelcase.com',
      phone: '+1-800-333-9999',
      company: 'Steelcase',
      paymentTerms: 'Net 30',
      addressLine1: '901 44th St SE',
      city: 'Grand Rapids',
      state: 'MI',
      country: 'USA',
      postalCode: '49508',
    },
  });

  const apple = await prisma.vendor.create({
    data: {
      name: 'Apple Distribution',
      email: 'channel@apple.com',
      phone: '+1-800-692-7753',
      company: 'Apple Inc.',
      paymentTerms: 'Due on Receipt',
      addressLine1: 'One Apple Park Way',
      city: 'Cupertino',
      state: 'CA',
      country: 'USA',
      postalCode: '95014',
    },
  });

  console.log('🏭 Vendors seeded');

  // 6. Warehouses
  const panjimWh = await prisma.warehouse.create({
    data: {
      code: 'WH-PNJ',
      name: 'Panjim Fulfillment Center',
      location: 'Panjim, Goa',
    },
  });

  const vascoWh = await prisma.warehouse.create({
    data: {
      code: 'WH-VSC',
      name: 'Vasco Port Depot',
      location: 'Vasco, Goa',
    },
  });

  const margaoWh = await prisma.warehouse.create({
    data: {
      code: 'WH-MRG',
      name: 'Margao Distribution Hub',
      location: 'Margao, Goa',
    },
  });

  console.log('🏢 Warehouses seeded');

  // 7. Inventory Levels
  await prisma.inventory.createMany({
    data: [
      { productId: chair.id, warehouseId: panjimWh.id, quantityOnHand: 45, quantityAvailable: 45, batchNumber: 'DEFAULT' },
      { productId: desk.id, warehouseId: panjimWh.id, quantityOnHand: 20, quantityAvailable: 20, batchNumber: 'DEFAULT' },
      { productId: laptop.id, warehouseId: panjimWh.id, quantityOnHand: 15, quantityAvailable: 15, batchNumber: 'DEFAULT' },
      { productId: chair.id, warehouseId: vascoWh.id, quantityOnHand: 10, quantityAvailable: 10, batchNumber: 'DEFAULT' },
      { productId: desk.id, warehouseId: vascoWh.id, quantityOnHand: 5, quantityAvailable: 5, batchNumber: 'DEFAULT' },
      { productId: laptop.id, warehouseId: margaoWh.id, quantityOnHand: 12, quantityAvailable: 12, batchNumber: 'DEFAULT' },
    ],
  });

  console.log('📈 Inventory levels seeded');
  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
