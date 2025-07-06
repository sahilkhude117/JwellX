import { PrismaClient, UserRole, JewelryCategory, ItemStatus, ChargeType, PaymentMethod, PaymentStatus, DiscountType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('🧹 Cleaning existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.goldRate.deleteMany()
  await prisma.user.deleteMany()
  await prisma.shopSettings.deleteMany()
  await prisma.shop.deleteMany()

  // Create Shop
  console.log('🏪 Creating shop...')
  const shop = await prisma.shop.create({
    data: {
      name: 'Golden Jewelry Store',
      address: '123 Main Street, Pune, Maharashtra 411001',
      gstin: '27ABCDE1234F1Z5',
      contactNumber: '+91-9876543210',
      email: 'info@goldenjewelry.com',
      active: true,
    },
  })

  // Create Shop Settings
  console.log('⚙️ Creating shop settings...')
  await prisma.shopSettings.create({
    data: {
      shopId: shop.id,
      defaultMakingChargeType: ChargeType.PERCENTAGE,
      defaultMakingChargeValue: 12.0,
      gstGoldRate: 3.0,
      gstMakingRate: 5.0,
      primaryLanguage: 'en',
      billingPrefix: 'GJS',
      nextBillNumber: 1001,
    },
  })

  // Create Users
  console.log('👤 Creating users...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const ownerUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: 'Shop Owner',
      role: UserRole.OWNER,
      active: true,
      shopId: shop.id,
    },
  })

  const salesStaff = await prisma.user.create({
    data: {
      username: 'sales1',
      password: await bcrypt.hash('sales123', 12),
      name: 'Rahul Sharma',
      role: UserRole.SALES_STAFF,
      active: true,
      shopId: shop.id,
    },
  })

  const accountant = await prisma.user.create({
    data: {
      username: 'accountant',
      password: await bcrypt.hash('acc123', 12),
      name: 'Priya Patel',
      role: UserRole.ACCOUNTANT,
      active: true,
      shopId: shop.id,
    },
  })

  // Create Gold Rates (last 30 days)
  console.log('💰 Creating gold rates...')
  const goldRates = []
  const baseRate22K = 5800
  const baseRate24K = 6300
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Add some realistic fluctuation
    const fluctuation = (Math.random() - 0.5) * 200
    const rate22K = baseRate22K + fluctuation
    const rate24K = baseRate24K + fluctuation
    
    goldRates.push({
      shopId: shop.id,
      rate22K: Math.round(rate22K),
      rate24K: Math.round(rate24K),
      effectiveDate: date,
    })
  }

  await prisma.goldRate.createMany({
    data: goldRates,
  })

  // Create Customers
  console.log('👥 Creating customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Amit Kumar',
        phoneNumber: '9876543210',
        email: 'amit.kumar@email.com',
        address: '456 Park Avenue, Pune, Maharashtra',
        shopId: shop.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sunita Devi',
        phoneNumber: '9876543211',
        email: 'sunita.devi@email.com',
        address: '789 Garden Road, Pune, Maharashtra',
        shopId: shop.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Rajesh Gupta',
        phoneNumber: '9876543212',
        email: 'rajesh.gupta@email.com',
        address: '321 Market Street, Pune, Maharashtra',
        shopId: shop.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Meera Singh',
        phoneNumber: '9876543213',
        address: '654 Temple Road, Pune, Maharashtra',
        shopId: shop.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Vikram Joshi',
        phoneNumber: '9876543214',
        email: 'vikram.joshi@email.com',
        address: '987 Station Road, Pune, Maharashtra',
        shopId: shop.id,
      },
    }),
  ])

  // Create Inventory Items
  console.log('💍 Creating inventory items...')
  const inventoryItems = [
    // Rings
    {
      name: 'Classic Gold Band Ring',
      itemCode: 'R001',
      huid: 'HU001234567890',
      category: JewelryCategory.RING,
      weight: 5.5,
      purity: '22K',
      costPrice: 28000,
      sellingPrice: 32000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 12.0,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    {
      name: 'Diamond Engagement Ring',
      itemCode: 'R002',
      huid: 'HU001234567891',
      category: JewelryCategory.RING,
      weight: 3.2,
      purity: '18K',
      costPrice: 45000,
      sellingPrice: 52000,
      makingChargeType: ChargeType.FIXED,
      makingChargeValue: 5000,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    // Chains
    {
      name: 'Rope Chain 20 inches',
      itemCode: 'C001',
      huid: 'HU001234567892',
      category: JewelryCategory.CHAIN,
      weight: 15.8,
      purity: '22K',
      costPrice: 89000,
      sellingPrice: 98000,
      makingChargeType: ChargeType.PER_GRAM,
      makingChargeValue: 450,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    {
      name: 'Box Chain 18 inches',
      itemCode: 'C002',
      huid: 'HU001234567893',
      category: JewelryCategory.CHAIN,
      weight: 12.5,
      purity: '22K',
      costPrice: 72000,
      sellingPrice: 79000,
      makingChargeType: ChargeType.PER_GRAM,
      makingChargeValue: 400,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    // Necklaces
    {
      name: 'Traditional Kundan Necklace',
      itemCode: 'N001',
      huid: 'HU001234567894',
      category: JewelryCategory.NECKLACE,
      weight: 45.0,
      purity: '22K',
      costPrice: 285000,
      sellingPrice: 320000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 15.0,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    // Bangles
    {
      name: 'Plain Gold Bangle Set (2 pieces)',
      itemCode: 'B001',
      huid: 'HU001234567895',
      category: JewelryCategory.BANGLE,
      weight: 28.0,
      purity: '22K',
      costPrice: 165000,
      sellingPrice: 185000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 10.0,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    {
      name: 'Designer Gold Bangle',
      itemCode: 'B002',
      huid: 'HU001234567896',
      category: JewelryCategory.BANGLE,
      weight: 18.5,
      purity: '22K',
      costPrice: 108000,
      sellingPrice: 125000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 14.0,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    // Earrings
    {
      name: 'Gold Stud Earrings',
      itemCode: 'E001',
      huid: 'HU001234567897',
      category: JewelryCategory.EARRING,
      weight: 6.8,
      purity: '22K',
      costPrice: 38000,
      sellingPrice: 43000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 12.0,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    {
      name: 'Jhumka Earrings',
      itemCode: 'E002',
      huid: 'HU001234567898',
      category: JewelryCategory.EARRING,
      weight: 8.2,
      purity: '22K',
      costPrice: 48000,
      sellingPrice: 55000,
      makingChargeType: ChargeType.FIXED,
      makingChargeValue: 3500,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    // Pendants
    {
      name: 'Om Pendant',
      itemCode: 'P001',
      huid: 'HU001234567899',
      category: JewelryCategory.PENDANT,
      weight: 4.5,
      purity: '22K',
      costPrice: 25000,
      sellingPrice: 28500,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 15.0,
      status: ItemStatus.IN_STOCK,
      shopId: shop.id,
    },
    // Some sold items for sales history
    {
      name: 'Wedding Ring Set',
      itemCode: 'R003',
      huid: 'HU001234567900',
      category: JewelryCategory.RING,
      weight: 8.5,
      purity: '22K',
      costPrice: 48000,
      sellingPrice: 55000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 12.0,
      status: ItemStatus.SOLD,
      shopId: shop.id,
    },
  ]

  const createdItems = await Promise.all(
    inventoryItems.map(item => prisma.inventoryItem.create({ data: item }))
  )

  // Create some sales transactions
  console.log('🛒 Creating sales transactions...')
  
  // Sale 1 - Recent sale
  const sale1 = await prisma.sale.create({
    data: {
      billNumber: 'GJS-1001',
      billPrefix: 'GJS',
      billSeqNumber: 1001,
      saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      customerId: customers[0].id,
      subtotal: 55000,
      discount: 2000,
      discountType: DiscountType.AMOUNT,
      gstAmount: 2650,
      totalAmount: 55650,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.COMPLETED,
      shopId: shop.id,
      userId: salesStaff.id,
    },
  })

  // Sale items for sale 1
  const soldItem = createdItems.find(item => item.status === ItemStatus.SOLD)
  if (soldItem) {
    await prisma.saleItem.create({
      data: {
        saleId: sale1.id,
        itemId: soldItem.id,
        goldRate: 5850,
        goldValue: 49725, // 8.5 * 5850
        makingCharge: 5970, // 12% of gold value
        gstOnGold: 1492, // 3% of gold value
        gstOnMaking: 299, // 5% of making charge
        totalAmount: 55650,
      },
    })
  }

  // Sale 2 - Older sale
  const sale2 = await prisma.sale.create({
    data: {
      billNumber: 'GJS-1002',
      billPrefix: 'GJS',
      billSeqNumber: 1002,
      saleDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      customerId: customers[1].id,
      subtotal: 43000,
      discount: 0,
      discountType: DiscountType.AMOUNT,
      gstAmount: 2150,
      totalAmount: 45150,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.COMPLETED,
      shopId: shop.id,
      userId: ownerUser.id,
    },
  })

  const earringItem = createdItems.find(item => item.itemCode === 'E001')
  if (earringItem) {
    await prisma.saleItem.create({
      data: {
        saleId: sale2.id,
        itemId: earringItem.id,
        goldRate: 5800,
        goldValue: 39440, // 6.8 * 5800
        makingCharge: 4733, // 12% of gold value
        gstOnGold: 1183, // 3% of gold value
        gstOnMaking: 237, // 5% of making charge
        totalAmount: 45150,
      },
    })
  }

  // Create some audit logs
  console.log('📋 Creating audit logs...')
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'LOGIN',
        entityType: 'USER',
        entityId: ownerUser.id,
        description: 'User logged in successfully',
        userId: ownerUser.id,
        metadata: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' },
      },
      {
        action: 'CREATE',
        entityType: 'SALE',
        entityId: sale1.id,
        description: 'New sale created',
        userId: salesStaff.id,
        metadata: { totalAmount: 55650, customerName: 'Amit Kumar' },
      },
      {
        action: 'UPDATE',
        entityType: 'INVENTORY',
        entityId: soldItem?.id || createdItems[0].id,
        description: 'Item status updated to SOLD',
        userId: salesStaff.id,
        metadata: { oldStatus: 'IN_STOCK', newStatus: 'SOLD' },
      },
      {
        action: 'CREATE',
        entityType: 'CUSTOMER',
        entityId: customers[0].id,
        description: 'New customer added',
        userId: salesStaff.id,
        metadata: { customerName: 'Amit Kumar', phone: '9876543210' },
      },
      {
        action: 'UPDATE',
        entityType: 'GOLD_RATE',
        entityId: goldRates[goldRates.length - 1]?.shopId || shop.id,
        description: 'Gold rates updated',
        userId: ownerUser.id,
        metadata: { rate22K: 5850, rate24K: 6350 },
      },
    ],
  })

  console.log('✅ Database seeding completed successfully!')
  
  // Print summary
  console.log('\n📊 Seeding Summary:')
  console.log(`🏪 Shop: ${shop.name}`)
  console.log(`👤 Users: ${await prisma.user.count()} (Owner, Sales Staff, Accountant)`)
  console.log(`💰 Gold Rates: ${goldRates.length} entries (last 30 days)`)
  console.log(`👥 Customers: ${customers.length}`)
  console.log(`💍 Inventory Items: ${createdItems.length}`)
  console.log(`🛒 Sales: ${await prisma.sale.count()}`)
  console.log(`📋 Audit Logs: ${await prisma.auditLog.count()}`)
  
  console.log('\n🔐 Default Login Credentials:')
  console.log('Owner: admin / admin123')
  console.log('Sales Staff: sales1 / sales123')
  console.log('Accountant: accountant / acc123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })