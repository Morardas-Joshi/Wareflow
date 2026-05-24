// Client-side local data storage with localStorage persistence to support interactive, zero-setup CRUD.

const STORAGE_KEYS = {
  PRODUCTS: 'flowcore_products',
  CATEGORIES: 'flowcore_categories',
  CUSTOMERS: 'flowcore_customers',
  VENDORS: 'flowcore_vendors',
  WAREHOUSES: 'flowcore_warehouses',
  INVENTORY: 'flowcore_inventory',
  SALES_ORDERS: 'flowcore_sales_orders',
  PURCHASE_ORDERS: 'flowcore_purchase_orders',
  STOCK_TRANSFERS: 'flowcore_stock_transfers',
};

// Initial Seed Data (Matches Prisma schema seeds)
const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Office Furniture', description: 'Ergonomic chairs, desks, and cabinets' },
  { id: 'cat-2', name: 'Electronics', description: 'Computers, screens, and computer accessories' },
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    sku: 'FURN-CH-001',
    barcode: '987654321001',
    name: 'Ergonomic Office Chair',
    description: 'High-back mesh chair with adjustable lumbar support and armrests',
    unitPrice: 249.99,
    costPrice: 135.00,
    weight: 15.4,
    categoryId: 'cat-1',
    category: { name: 'Office Furniture' },
    isActive: true,
  },
  {
    id: 'prod-2',
    sku: 'FURN-DK-002',
    barcode: '987654321002',
    name: 'Adjustable Standing Desk',
    description: 'Electric dual-motor height adjustable sit-to-stand desk',
    unitPrice: 499.99,
    costPrice: 280.00,
    weight: 28.5,
    categoryId: 'cat-1',
    category: { name: 'Office Furniture' },
    isActive: true,
  },
  {
    id: 'prod-3',
    sku: 'ELEC-LP-003',
    barcode: '987654321003',
    name: 'Enterprise Laptop Pro',
    description: '14-inch developer workhorse with 32GB RAM and 1TB SSD',
    unitPrice: 1499.99,
    costPrice: 950.00,
    weight: 1.4,
    categoryId: 'cat-2',
    category: { name: 'Electronics' },
    isActive: true,
  },
];

const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Acme Corporation',
    email: 'procurement@acme.com',
    phone: '+1-555-0100',
    company: 'Acme Corp Inc.',
    taxId: 'GST-30AAACF9988Z',
    creditLimit: 100000.0,
    addressLine1: '100 Acme Way',
    city: 'Panjim',
    state: 'Goa',
    country: 'India',
    postalCode: '403001',
  },
  {
    id: 'cust-2',
    name: 'Wayne Enterprises',
    email: 'purchasing@waynecorp.com',
    phone: '+1-555-1939',
    company: 'Wayne Enterprises Ltd.',
    taxId: 'GST-30BBBCF8877Y',
    creditLimit: 500000.0,
    addressLine1: '1007 Mountain Drive',
    city: 'Margao',
    state: 'Goa',
    country: 'India',
    postalCode: '403601',
  },
];

const INITIAL_VENDORS = [
  {
    id: 'vend-1',
    name: 'Steelcase Inc.',
    email: 'b2b@steelcase.com',
    phone: '+1-800-333-9999',
    company: 'Steelcase',
    paymentTerms: 'Net 30',
    addressLine1: '901 44th St SE',
    city: 'Vasco',
    state: 'Goa',
    country: 'India',
    postalCode: '403802',
  },
  {
    id: 'vend-2',
    name: 'Apple Distribution',
    email: 'channel@apple.com',
    phone: '+1-800-692-7753',
    company: 'Apple Inc.',
    paymentTerms: 'Due on Receipt',
    addressLine1: 'One Apple Park Way',
    city: 'Panjim',
    state: 'Goa',
    country: 'India',
    postalCode: '403001',
  },
];

const INITIAL_WAREHOUSES = [
  { id: 'wh-1', code: 'WH-PNJ', name: 'Panjim Fulfillment Center', location: 'Panjim, Goa', isActive: true },
  { id: 'wh-2', code: 'WH-VSC', name: 'Vasco Port Depot', location: 'Vasco, Goa', isActive: true },
  { id: 'wh-3', code: 'WH-MRG', name: 'Margao Distribution Hub', location: 'Margao, Goa', isActive: true },
];

const INITIAL_INVENTORY = [
  { id: 'inv-1', productId: 'prod-1', warehouseId: 'wh-1', quantityOnHand: 45, quantityAvailable: 45, batchNumber: 'DEFAULT' },
  { id: 'inv-2', productId: 'prod-2', warehouseId: 'wh-1', quantityOnHand: 20, quantityAvailable: 20, batchNumber: 'DEFAULT' },
  { id: 'inv-3', productId: 'prod-3', warehouseId: 'wh-1', quantityOnHand: 15, quantityAvailable: 15, batchNumber: 'DEFAULT' },
  { id: 'inv-4', productId: 'prod-1', warehouseId: 'wh-2', quantityOnHand: 10, quantityAvailable: 10, batchNumber: 'DEFAULT' },
  { id: 'inv-5', productId: 'prod-2', warehouseId: 'wh-2', quantityOnHand: 5, quantityAvailable: 5, batchNumber: 'DEFAULT' },
  { id: 'inv-6', productId: 'prod-3', warehouseId: 'wh-3', quantityOnHand: 12, quantityAvailable: 12, batchNumber: 'DEFAULT' },
];

const INITIAL_SALES_ORDERS = [
  {
    id: 'so-1',
    soNumber: 'SO-100452',
    status: 'CONFIRMED',
    orderDate: '2026-05-18T10:30:00.000Z',
    deliveryDate: '2026-05-22T00:00:00.000Z',
    customerId: 'cust-1',
    customer: { name: 'Acme Corporation' },
    subtotal: 1249.95,
    discountAmount: 50.00,
    taxAmount: 95.99,
    totalAmount: 1295.94,
    shippingAddress: '100 Acme Way, Panjim, Goa',
    billingAddress: '100 Acme Way, Panjim, Goa',
    notes: 'Standard delivery',
    lines: [
      { id: 'sol-1', productId: 'prod-1', product: { name: 'Ergonomic Office Chair', sku: 'FURN-CH-001' }, quantityOrdered: 5, unitPrice: 249.99, discount: 10.0, totalPrice: 1199.95 }
    ]
  }
];

const INITIAL_PURCHASE_ORDERS = [
  {
    id: 'po-1',
    poNumber: 'PO-200914',
    status: 'APPROVED',
    orderDate: '2026-05-15T14:20:00.000Z',
    expectedDate: '2026-05-25T00:00:00.000Z',
    vendorId: 'vend-1',
    vendor: { name: 'Steelcase Inc.' },
    subtotal: 1350.00,
    taxAmount: 108.00,
    totalAmount: 1458.00,
    notes: 'Restocking office chairs',
    terms: 'Net 30',
    lines: [
      { id: 'pol-1', productId: 'prod-1', product: { name: 'Ergonomic Office Chair', sku: 'FURN-CH-001' }, quantityOrdered: 10, quantityReceived: 0, unitPrice: 135.00, totalPrice: 1350.00 }
    ]
  }
];

const INITIAL_TRANSFERS = [
  {
    id: 'tr-1',
    referenceNumber: 'TR-481902',
    status: 'COMPLETED',
    sourceId: 'wh-1',
    source: { name: 'Panjim Fulfillment Center', code: 'WH-PNJ' },
    destinationId: 'wh-2',
    destination: { name: 'Vasco Port Depot', code: 'WH-VSC' },
    createdAt: '2026-05-19T11:00:00.000Z',
    notes: 'Stock balancing',
    lines: [
      { id: 'trl-1', productId: 'prod-1', product: { name: 'Ergonomic Office Chair', sku: 'FURN-CH-001' }, quantity: 5 }
    ]
  }
];

// Helper to initialize and retrieve from localStorage
const getLocalData = (key: string, initialData: any) => {
  if (typeof window === 'undefined') return initialData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialData;
  }
};

const setLocalData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// ==========================================
// HYBRID BACKEND SYNC HELPERS
// ==========================================
const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001/api/v1';
  return localStorage.getItem('settings_api_url') || 'http://localhost:3001/api/v1';
};

const getMode = () => {
  if (typeof window === 'undefined') return 'local';
  return localStorage.getItem('settings_connection_mode') || 'local';
};

const syncWithBackend = async (key: string, path: string) => {
  if (getMode() !== 'backend') return;
  try {
    const url = `${getApiUrl()}${path}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setLocalData(key, data);
    }
  } catch (e) {
    console.warn('Backend sync failed. Using cached client state.', e);
  }
};

const sendMutation = async (path: string, method: string, body: any) => {
  if (getMode() !== 'backend') return null;
  try {
    const url = `${getApiUrl()}${path}`;
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.error('Backend mutation failed:', e);
  }
  return null;
};

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================

export const api = {
  // PRODUCTS CRUD
  getProducts: () => {
    syncWithBackend(STORAGE_KEYS.PRODUCTS, '/products');
    return getLocalData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  createProduct: (data: any) => {
    const list = api.getProducts();
    const categories = api.getCategories();
    const category = categories.find((c: any) => c.id === data.categoryId) || { name: 'Uncategorized' };
    const newProduct = {
      ...data,
      id: `prod-${Date.now()}`,
      category: { name: category.name },
      isActive: true,
      unitPrice: Number(data.unitPrice),
      costPrice: Number(data.costPrice),
      weight: data.weight ? Number(data.weight) : 0,
    };
    list.push(newProduct);
    setLocalData(STORAGE_KEYS.PRODUCTS, list);

    // Sync backend
    sendMutation('/products', 'POST', data);

    // Initialize inventory record
    const warehouses = api.getWarehouses();
    if (warehouses.length > 0) {
      api.adjustInventory({
        warehouseId: warehouses[0].id,
        productId: newProduct.id,
        quantityOnHand: 0,
        batchNumber: 'DEFAULT'
      });
    }

    return newProduct;
  },
  updateProduct: (id: string, data: any) => {
    const list = api.getProducts();
    const categories = api.getCategories();
    const index = list.findIndex((p: any) => p.id === id);
    if (index === -1) return null;
    const category = categories.find((c: any) => c.id === data.categoryId) || list[index].category;
    list[index] = {
      ...list[index],
      ...data,
      category: { name: category.name },
      unitPrice: Number(data.unitPrice),
      costPrice: Number(data.costPrice),
      weight: data.weight ? Number(data.weight) : list[index].weight,
    };
    setLocalData(STORAGE_KEYS.PRODUCTS, list);

    // Sync backend
    sendMutation(`/products/${id}`, 'PATCH', data);

    return list[index];
  },
  deleteProduct: (id: string) => {
    const list = api.getProducts();
    const updated = list.filter((p: any) => p.id !== id);
    setLocalData(STORAGE_KEYS.PRODUCTS, updated);

    // Sync backend
    sendMutation(`/products/${id}`, 'DELETE', null);

    return true;
  },

  // CATEGORIES CRUD
  getCategories: () => {
    syncWithBackend(STORAGE_KEYS.CATEGORIES, '/categories');
    return getLocalData(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  createCategory: (data: any) => {
    const list = api.getCategories();
    const newCat = { ...data, id: `cat-${Date.now()}` };
    list.push(newCat);
    setLocalData(STORAGE_KEYS.CATEGORIES, list);
    
    // Sync backend
    sendMutation('/categories', 'POST', data);

    return newCat;
  },

  // CUSTOMERS CRUD
  getCustomers: () => {
    syncWithBackend(STORAGE_KEYS.CUSTOMERS, '/customers');
    return getLocalData(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  createCustomer: (data: any) => {
    const list = api.getCustomers();
    const newItem = { ...data, id: `cust-${Date.now()}`, outstandingBal: 0 };
    list.push(newItem);
    setLocalData(STORAGE_KEYS.CUSTOMERS, list);

    // Sync backend
    sendMutation('/customers', 'POST', data);

    return newItem;
  },
  updateCustomer: (id: string, data: any) => {
    const list = api.getCustomers();
    const index = list.findIndex((c: any) => c.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...data };
    setLocalData(STORAGE_KEYS.CUSTOMERS, list);

    // Sync backend
    sendMutation(`/customers/${id}`, 'PATCH', data);

    return list[index];
  },
  deleteCustomer: (id: string) => {
    const list = api.getCustomers();
    const updated = list.filter((c: any) => c.id !== id);
    setLocalData(STORAGE_KEYS.CUSTOMERS, updated);

    // Sync backend
    sendMutation(`/customers/${id}`, 'DELETE', null);

    return true;
  },

  // VENDORS CRUD
  getVendors: () => {
    syncWithBackend(STORAGE_KEYS.VENDORS, '/vendors');
    return getLocalData(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  },
  createVendor: (data: any) => {
    const list = api.getVendors();
    const newItem = { ...data, id: `vend-${Date.now()}` };
    list.push(newItem);
    setLocalData(STORAGE_KEYS.VENDORS, list);

    // Sync backend
    sendMutation('/vendors', 'POST', data);

    return newItem;
  },
  updateVendor: (id: string, data: any) => {
    const list = api.getVendors();
    const index = list.findIndex((v: any) => v.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...data };
    setLocalData(STORAGE_KEYS.VENDORS, list);

    // Sync backend
    sendMutation(`/vendors/${id}`, 'PATCH', data);

    return list[index];
  },
  deleteVendor: (id: string) => {
    const list = api.getVendors();
    const updated = list.filter((v: any) => v.id !== id);
    setLocalData(STORAGE_KEYS.VENDORS, updated);

    // Sync backend
    sendMutation(`/vendors/${id}`, 'DELETE', null);

    return true;
  },

  // WAREHOUSES
  getWarehouses: () => {
    syncWithBackend(STORAGE_KEYS.WAREHOUSES, '/inventory/warehouses');
    return getLocalData(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
  },
  createWarehouse: (data: any) => {
    const list = api.getWarehouses();
    const newItem = { ...data, id: `wh-${Date.now()}`, isActive: true };
    list.push(newItem);
    setLocalData(STORAGE_KEYS.WAREHOUSES, list);

    // Sync backend
    sendMutation('/inventory/warehouses', 'POST', data);

    return newItem;
  },

  // INVENTORY
  getInventoryLevels: () => {
    syncWithBackend(STORAGE_KEYS.INVENTORY, '/inventory');
    const inventory = getLocalData(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const products = api.getProducts();
    const warehouses = api.getWarehouses();
    
    return inventory.map((inv: any) => {
      const product = products.find((p: any) => p.id === inv.productId) || { name: 'Unknown Product', sku: 'N/A', unitPrice: 0 };
      const warehouse = warehouses.find((w: any) => w.id === inv.warehouseId) || { name: 'Unknown Warehouse', code: 'N/A' };
      return {
        ...inv,
        product,
        warehouse,
      };
    });
  },
  adjustInventory: (data: any) => {
    const list = getLocalData(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const { productId, warehouseId, quantityOnHand, batchNumber = 'DEFAULT' } = data;
    
    const index = list.findIndex(
      (inv: any) => inv.productId === productId && inv.warehouseId === warehouseId && inv.batchNumber === batchNumber
    );

    const qty = Number(quantityOnHand);

    if (index !== -1) {
      list[index].quantityOnHand = qty;
      list[index].quantityAvailable = qty;
    } else {
      list.push({
        id: `inv-${Date.now()}`,
        productId,
        warehouseId,
        batchNumber,
        quantityOnHand: qty,
        quantityAvailable: qty,
      });
    }
    setLocalData(STORAGE_KEYS.INVENTORY, list);

    // Sync backend
    sendMutation('/inventory/adjust', 'POST', {
      productId,
      warehouseId,
      quantityOnHand: qty,
      batchNumber
    });

    return true;
  },

  // TRANSFERS CRUD
  getStockTransfers: () => {
    syncWithBackend(STORAGE_KEYS.STOCK_TRANSFERS, '/inventory/transfers');
    return getLocalData(STORAGE_KEYS.STOCK_TRANSFERS, INITIAL_TRANSFERS);
  },
  createStockTransfer: (data: any) => {
    const transfers = api.getStockTransfers();
    const warehouses = api.getWarehouses();
    const products = api.getProducts();
    const inventory = getLocalData(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);

    const srcWh = warehouses.find((w: any) => w.id === data.sourceId) || { name: 'Source', code: 'SRC' };
    const dstWh = warehouses.find((w: any) => w.id === data.destinationId) || { name: 'Destination', code: 'DST' };

    // Deduct stock from source and add to destination
    data.lines.forEach((line: any) => {
      const srcIndex = inventory.findIndex((inv: any) => inv.productId === line.productId && inv.warehouseId === data.sourceId);
      if (srcIndex !== -1) {
        inventory[srcIndex].quantityOnHand = Math.max(0, inventory[srcIndex].quantityOnHand - Number(line.quantity));
        inventory[srcIndex].quantityAvailable = inventory[srcIndex].quantityOnHand;
      }

      const dstIndex = inventory.findIndex((inv: any) => inv.productId === line.productId && inv.warehouseId === data.destinationId);
      if (dstIndex !== -1) {
        inventory[dstIndex].quantityOnHand += Number(line.quantity);
        inventory[dstIndex].quantityAvailable = inventory[dstIndex].quantityOnHand;
      } else {
        inventory.push({
          id: `inv-${Date.now()}-${line.productId}`,
          productId: line.productId,
          warehouseId: data.destinationId,
          batchNumber: 'DEFAULT',
          quantityOnHand: Number(line.quantity),
          quantityAvailable: Number(line.quantity)
        });
      }
    });

    setLocalData(STORAGE_KEYS.INVENTORY, inventory);

    const newTransfer = {
      id: `tr-${Date.now()}`,
      referenceNumber: `TR-${Date.now().toString().slice(-6)}`,
      status: 'COMPLETED',
      sourceId: data.sourceId,
      source: { name: srcWh.name, code: srcWh.code },
      destinationId: data.destinationId,
      destination: { name: dstWh.name, code: dstWh.code },
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
      lines: data.lines.map((l: any, idx: number) => {
        const prod = products.find((p: any) => p.id === l.productId) || { name: 'Unknown Product', sku: 'N/A' };
        return {
          id: `trl-${Date.now()}-${idx}`,
          productId: l.productId,
          product: { name: prod.name, sku: prod.sku },
          quantity: Number(l.quantity)
        };
      })
    };

    transfers.push(newTransfer);
    setLocalData(STORAGE_KEYS.STOCK_TRANSFERS, transfers);

    // Sync backend
    sendMutation('/inventory/transfer', 'POST', {
      sourceId: data.sourceId,
      destinationId: data.destinationId,
      notes: data.notes,
      lines: data.lines.map((l: any) => ({
        productId: l.productId,
        quantity: Number(l.quantity)
      }))
    });

    return newTransfer;
  },

  // SALES ORDERS CRUD
  getSalesOrders: () => {
    syncWithBackend(STORAGE_KEYS.SALES_ORDERS, '/sales-orders');
    return getLocalData(STORAGE_KEYS.SALES_ORDERS, INITIAL_SALES_ORDERS);
  },
  createSalesOrder: (data: any) => {
    const list = api.getSalesOrders();
    const customers = api.getCustomers();
    const products = api.getProducts();

    const customer = customers.find((c: any) => c.id === data.customerId) || { name: 'Walk-in Customer' };
    
    // Process totals
    let subtotal = 0;
    const lines = data.lines.map((l: any, idx: number) => {
      const prod = products.find((p: any) => p.id === l.productId) || { name: 'Product', sku: 'SKU' };
      const price = Number(l.unitPrice);
      const discount = Number(l.discount || 0);
      const qty = Number(l.quantityOrdered);
      const total = (price - discount) * qty;
      subtotal += total;

      return {
        id: `sol-${Date.now()}-${idx}`,
        productId: l.productId,
        product: { name: prod.name, sku: prod.sku },
        quantityOrdered: qty,
        unitPrice: price,
        discount,
        totalPrice: total,
      };
    });

    const taxAmount = Number(data.taxAmount || 0);
    const discountAmount = Number(data.discountAmount || 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    const newOrder = {
      id: `so-${Date.now()}`,
      soNumber: `SO-${Date.now().toString().slice(-6)}`,
      status: 'DRAFT',
      orderDate: new Date().toISOString(),
      deliveryDate: data.deliveryDate || null,
      customerId: data.customerId,
      customer: { name: customer.name },
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      shippingAddress: data.shippingAddress || '',
      billingAddress: data.billingAddress || '',
      notes: data.notes || '',
      lines,
    };

    list.push(newOrder);
    setLocalData(STORAGE_KEYS.SALES_ORDERS, list);

    // Sync backend
    sendMutation('/sales-orders', 'POST', {
      customerId: data.customerId,
      deliveryDate: data.deliveryDate,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      notes: data.notes,
      discountAmount,
      taxAmount,
      lines: data.lines.map((l: any) => ({
        productId: l.productId,
        quantityOrdered: Number(l.quantityOrdered),
        unitPrice: Number(l.unitPrice),
        discount: Number(l.discount || 0)
      }))
    });

    return newOrder;
  },
  updateSalesOrder: (id: string, data: any) => {
    const list = api.getSalesOrders();
    const index = list.findIndex((o: any) => o.id === id);
    if (index === -1) return null;

    const currentStatus = list[index].status;
    const nextStatus = data.status || currentStatus;

    // Allocate / Deduct stock if transitions to CONFIRMED
    if (nextStatus === 'CONFIRMED' && currentStatus === 'DRAFT') {
      const inventory = getLocalData(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
      const warehouses = api.getWarehouses();
      const defaultWhId = warehouses[0]?.id;

      if (defaultWhId) {
        list[index].lines.forEach((line: any) => {
          const invIndex = inventory.findIndex((inv: any) => inv.productId === line.productId && inv.warehouseId === defaultWhId);
          if (invIndex !== -1) {
            inventory[invIndex].quantityOnHand = Math.max(0, inventory[invIndex].quantityOnHand - line.quantityOrdered);
            inventory[invIndex].quantityAvailable = inventory[invIndex].quantityOnHand;
          }
        });
        setLocalData(STORAGE_KEYS.INVENTORY, inventory);
      }
    }

    list[index] = { ...list[index], ...data };
    setLocalData(STORAGE_KEYS.SALES_ORDERS, list);

    // Sync backend status
    if (data.status) {
      sendMutation(`/sales-orders/${id}/status`, 'PATCH', { status: data.status });
    }

    return list[index];
  },
  deleteSalesOrder: (id: string) => {
    const list = api.getSalesOrders();
    const updated = list.filter((o: any) => o.id !== id);
    setLocalData(STORAGE_KEYS.SALES_ORDERS, updated);

    // Sync backend
    sendMutation(`/sales-orders/${id}`, 'DELETE', null);

    return true;
  },

  // PURCHASE ORDERS CRUD
  getPurchaseOrders: () => {
    syncWithBackend(STORAGE_KEYS.PURCHASE_ORDERS, '/purchase-orders');
    return getLocalData(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
  },
  createPurchaseOrder: (data: any) => {
    const list = api.getPurchaseOrders();
    const vendors = api.getVendors();
    const products = api.getProducts();

    const vendor = vendors.find((v: any) => v.id === data.vendorId) || { name: 'Supplier' };
    
    let subtotal = 0;
    const lines = data.lines.map((l: any, idx: number) => {
      const prod = products.find((p: any) => p.id === l.productId) || { name: 'Product', sku: 'SKU' };
      const price = Number(l.unitPrice);
      const qty = Number(l.quantityOrdered);
      const total = price * qty;
      subtotal += total;

      return {
        id: `pol-${Date.now()}-${idx}`,
        productId: l.productId,
        product: { name: prod.name, sku: prod.sku },
        quantityOrdered: qty,
        quantityReceived: 0,
        unitPrice: price,
        totalPrice: total,
      };
    });

    const taxAmount = Number(data.taxAmount || 0);
    const totalAmount = subtotal + taxAmount;

    const newOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      status: 'DRAFT',
      orderDate: new Date().toISOString(),
      expectedDate: data.expectedDate || null,
      vendorId: data.vendorId,
      vendor: { name: vendor.name },
      subtotal,
      taxAmount,
      totalAmount,
      notes: data.notes || '',
      terms: data.terms || '',
      lines,
    };

    list.push(newOrder);
    setLocalData(STORAGE_KEYS.PURCHASE_ORDERS, list);

    // Sync backend
    sendMutation('/purchase-orders', 'POST', {
      vendorId: data.vendorId,
      expectedDate: data.expectedDate,
      terms: data.terms,
      notes: data.notes,
      taxAmount,
      lines: data.lines.map((l: any) => ({
        productId: l.productId,
        quantityOrdered: Number(l.quantityOrdered),
        unitPrice: Number(l.unitPrice)
      }))
    });

    return newOrder;
  },
  updatePurchaseOrder: (id: string, data: any) => {
    const list = api.getPurchaseOrders();
    const index = list.findIndex((o: any) => o.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...data };
    setLocalData(STORAGE_KEYS.PURCHASE_ORDERS, list);

    // Sync backend status
    if (data.status) {
      sendMutation(`/purchase-orders/${id}/status`, 'PATCH', { status: data.status });
    }

    return list[index];
  },
  receivePurchaseOrderItems: (id: string, data: { warehouseId: string, items: Array<{ productId: string, quantityReceived: number }> }) => {
    const list = api.getPurchaseOrders();
    const index = list.findIndex((o: any) => o.id === id);
    if (index === -1) return null;

    const po = list[index];
    const inventory = getLocalData(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);

    data.items.forEach((item: any) => {
      // 1. Update received quantity on PO line
      const line = po.lines.find((l: any) => l.productId === item.productId);
      if (line) {
        line.quantityReceived = Math.min(line.quantityOrdered, line.quantityReceived + Number(item.quantityReceived));
      }

      // 2. Add to inventory warehouse
      const invIndex = inventory.findIndex((inv: any) => inv.productId === item.productId && inv.warehouseId === data.warehouseId);
      if (invIndex !== -1) {
        inventory[invIndex].quantityOnHand += Number(item.quantityReceived);
        inventory[invIndex].quantityAvailable = inventory[invIndex].quantityOnHand;
      } else {
        inventory.push({
          id: `inv-${Date.now()}-${item.productId}`,
          productId: item.productId,
          warehouseId: data.warehouseId,
          batchNumber: 'DEFAULT',
          quantityOnHand: Number(item.quantityReceived),
          quantityAvailable: Number(item.quantityReceived)
        });
      }
    });

    // Check overall receipt status
    const totalOrdered = po.lines.reduce((sum: number, l: any) => sum + l.quantityOrdered, 0);
    const totalReceived = po.lines.reduce((sum: number, l: any) => sum + l.quantityReceived, 0);

    if (totalReceived >= totalOrdered) {
      po.status = 'RECEIVED';
    } else if (totalReceived > 0) {
      po.status = 'PARTIAL_RECEIPT';
    }

    setLocalData(STORAGE_KEYS.INVENTORY, inventory);
    setLocalData(STORAGE_KEYS.PURCHASE_ORDERS, list);

    // Sync backend receipt
    sendMutation(`/purchase-orders/${id}/receive`, 'POST', {
      warehouseId: data.warehouseId,
      items: data.items.map((it: any) => ({
        productId: it.productId,
        quantityReceived: Number(it.quantityReceived)
      }))
    });

    return po;
  },
  deletePurchaseOrder: (id: string) => {
    const list = api.getPurchaseOrders();
    const updated = list.filter((o: any) => o.id !== id);
    setLocalData(STORAGE_KEYS.PURCHASE_ORDERS, updated);

    // Sync backend
    sendMutation(`/purchase-orders/${id}`, 'DELETE', null);

    return true;
  }
};
