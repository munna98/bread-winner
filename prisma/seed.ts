// seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Company Settings
  const companySettings = await prisma.companySettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      companyName: 'My Retail Store',
      address: '123 Main Street, City, State, 123456',
      phone: '9876543210',
      email: 'info@myretailstore.com',
      gstNumber: '22AAAAA0000A1Z5',
      taxRate: 18.0,
      currencySymbol: '₹',
      enableGST: true,
      enableProduction: true,
      enableOrders: true,
      invoicePrefix: 'INV',
      orderPrefix: 'ORD',
      purchasePrefix: 'PUR',
    },
  });

  console.log('Company settings created:', companySettings);

  // Create Users
  const adminPassword = await hash('admin123', 10);
  const managerPassword = await hash('manager123', 10);
  const cashierPassword = await hash('cashier123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@myretailstore.com' },
    update: {},
    create: {
      email: 'admin@myretailstore.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@myretailstore.com' },
    update: {},
    create: {
      email: 'manager@myretailstore.com',
      password: managerPassword,
      name: 'Manager User',
      role: 'MANAGER',
    },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@myretailstore.com' },
    update: {},
    create: {
      email: 'cashier@myretailstore.com',
      password: cashierPassword,
      name: 'Cashier User',
      role: 'CASHIER',
    },
  });

  console.log('Users created:', { adminUser, managerUser, cashierUser });

  // Create Customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      phone: '9876543210',
      email: 'customer1@example.com',
      address: '123 Customer Street, City',
      gstNumber: '22BBBBB0000B1Z5',
      openingBalance: 0,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      phone: '8765432109',
      email: 'customer2@example.com',
      openingBalance: 5000.0,
    },
  });

  console.log('Customers created:', { customer1, customer2 });

  // Create Suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { email: 'supplier1@example.com' },
    update: {},
    create: {
      name: 'Wholesale Distributors',
      phone: '7654321098',
      email: 'supplier1@example.com',
      address: '456 Supplier Avenue, Industrial Area',
      gstNumber: '22CCCCC0000C1Z5',
      openingBalance: 0,
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { email: 'supplier2@example.com' },
    update: {},
    create: {
      name: 'Manufacturer Direct',
      phone: '6543210987',
      email: 'supplier2@example.com',
      openingBalance: 10000.0,
    },
  });

  console.log('Suppliers created:', { supplier1, supplier2 });

  // Create Products
  const product1 = await prisma.product.upsert({
    where: { name: 'Premium Notebook' },
    update: {},
    create: {
      name: 'Premium Notebook',
      category: 'Stationery',
      unit: 'pcs',
      sellingPrice: 120.0,
      costPrice: 80.0,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { name: 'Ballpoint Pen' },
    update: {},
    create: {
      name: 'Ballpoint Pen',
      category: 'Stationery',
      unit: 'pcs',
      sellingPrice: 15.0,
      costPrice: 8.0,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { name: 'A4 Paper Pack' },
    update: {},
    create: {
      name: 'A4 Paper Pack',
      category: 'Stationery',
      unit: 'pcs',
      sellingPrice: 250.0,
      costPrice: 180.0,
    },
  });

  console.log('Products created:', { product1, product2, product3 });

  // Create Expense Categories
  const expenseCategory1 = await prisma.expenseCategory.upsert({
    where: { name: 'Rent' },
    update: {},
    create: {
      name: 'Rent',
    },
  });

  const expenseCategory2 = await prisma.expenseCategory.upsert({
    where: { name: 'Utilities' },
    update: {},
    create: {
      name: 'Utilities',
    },
  });

  const expenseCategory3 = await prisma.expenseCategory.upsert({
    where: { name: 'Salaries' },
    update: {},
    create: {
      name: 'Salaries',
    },
  });

  console.log('Expense categories created:', { expenseCategory1, expenseCategory2, expenseCategory3 });

  // Create Accounts
  const cashAccount = await prisma.account.upsert({
    where: { name: 'Cash Account' },
    update: {},
    create: {
      name: 'Cash Account',
      accountType: 'ASSET',
      openingBalance: 100000.0,
    },
  });

  const bankAccount = await prisma.account.upsert({
    where: { name: 'Bank Account' },
    update: {},
    create: {
      name: 'Bank Account',
      accountType: 'ASSET',
      openingBalance: 500000.0,
    },
  });

  const salesAccount = await prisma.account.upsert({
    where: { name: 'Sales Account' },
    update: {},
    create: {
      name: 'Sales Account',
      accountType: 'INCOME',
    },
  });

  const purchaseAccount = await prisma.account.upsert({
    where: { name: 'Purchase Account' },
    update: {},
    create: {
      name: 'Purchase Account',
      accountType: 'EXPENSE',
    },
  });

  const customerAccount = await prisma.account.upsert({
    where: { name: 'Customers' },
    update: {},
    create: {
      name: 'Customers',
      accountType: 'ASSET',
    },
  });

  const supplierAccount = await prisma.account.upsert({
    where: { name: 'Suppliers' },
    update: {},
    create: {
      name: 'Suppliers',
      accountType: 'LIABILITY',
    },
  });

  console.log('Accounts created:', {
    cashAccount,
    bankAccount,
    salesAccount,
    purchaseAccount,
    customerAccount,
    supplierAccount,
  });

  // Create a Sales Order
  const salesOrder = await prisma.salesOrder.create({
    data: {
      orderNumber: 'ORD-0001',
      orderDate: new Date(),
      customerId: customer1.id,
      subtotal: 370.0,
      total: 370.0,
      status: 'PENDING',
      userId: adminUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 2,
            rate: 120.0,
            amount: 240.0,
          },
          {
            productId: product2.id,
            quantity: 5,
            rate: 15.0,
            amount: 75.0,
          },
          {
            productId: product3.id,
            quantity: 1,
            rate: 250.0,
            amount: 250.0,
          },
        ],
      },
    },
  });

  console.log('Sales order created:', salesOrder);

  // Create a Purchase
  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber: 'PUR-0001',
      purchaseDate: new Date(),
      supplierId: supplier1.id,
      subtotal: 800.0,
      total: 800.0,
      paidAmount: 800.0,
      paymentMode: 'BANK_TRANSFER',
      userId: adminUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 10,
            rate: 80.0,
            amount: 800.0,
          },
        ],
      },
    },
  });

  console.log('Purchase created:', purchase);

  // Create a Sales Bill
  const salesBill = await prisma.salesBill.create({
    data: {
      billNumber: 'INV-0001',
      billDate: new Date(),
      customerId: customer1.id,
      subtotal: 370.0,
      total: 370.0,
      paidAmount: 370.0,
      paymentMode: 'CASH',
      status: 'COMPLETED',
      userId: cashierUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 2,
            rate: 120.0,
            amount: 240.0,
          },
          {
            productId: product2.id,
            quantity: 5,
            rate: 15.0,
            amount: 75.0,
          },
          {
            productId: product3.id,
            quantity: 1,
            rate: 250.0,
            amount: 250.0,
          },
        ],
      },
    },
  });

  console.log('Sales bill created:', salesBill);

  // Create an Expense
  const expense = await prisma.expense.create({
    data: {
      date: new Date(),
      categoryId: expenseCategory1.id,
      amount: 20000.0,
      description: 'Monthly rent payment',
      paymentMode: 'BANK_TRANSFER',
      userId: managerUser.id,
    },
  });

  console.log('Expense created:', expense);

  // Create Production Log
  const productionLog = await prisma.productionLog.create({
    data: {
      date: new Date(),
      productId: product1.id,
      quantity: 100,
      notes: 'Initial production run',
      userId: managerUser.id,
    },
  });

  console.log('Production log created:', productionLog);

  // Create Ledger Entries
  // Sales Bill Entry
  const salesLedgerEntry = await prisma.ledgerEntry.create({
    data: {
      voucherNumber: salesBill.billNumber,
      voucherType: 'SALES',
      date: salesBill.billDate,
      debitAccountId: cashAccount.id,
      creditAccountId: salesAccount.id,
      amount: salesBill.total,
      narration: 'Sales invoice payment',
      salesBillId: salesBill.id,
      customerId: customer1.id,
    },
  });

  // Purchase Entry
  const purchaseLedgerEntry = await prisma.ledgerEntry.create({
    data: {
      voucherNumber: purchase.purchaseNumber,
      voucherType: 'PURCHASE',
      date: purchase.purchaseDate,
      debitAccountId: purchaseAccount.id,
      creditAccountId: bankAccount.id,
      amount: purchase.total,
      narration: 'Purchase payment',
      purchaseId: purchase.id,
      supplierId: supplier1.id,
    },
  });

  // Expense Entry
  const expenseLedgerEntry = await prisma.ledgerEntry.create({
    data: {
      voucherNumber: `EXP-${expense.id.substring(0, 4)}`,
      voucherType: 'PAYMENT',
      date: expense.date,
      debitAccountId: expenseCategory1.id,
      creditAccountId: bankAccount.id,
      amount: expense.amount,
      narration: expense.description,
      expenseId: expense.id,
    },
  });

  console.log('Ledger entries created:', {
    salesLedgerEntry,
    purchaseLedgerEntry,
    expenseLedgerEntry,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });