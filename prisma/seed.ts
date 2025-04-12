import { PrismaClient, Prisma } from '../src/generated/prisma'
import { 
  UserRole, 
  ChargeType,           
  JewelryCategory, 
  ItemStatus, 
  DiscountType, 
  PaymentMethod, 
  PaymentStatus 
} from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Create Shops first since they're required for most relationships
  const shopData: Prisma.ShopCreateInput[] = [
    {
      name: 'Elegant Jewelers',
      address: '123 Main Street, Mumbai, Maharashtra',
      gstin: '27AAPFU0939F1ZV',
      contactNumber: '9876543210',
      email: 'contact@elegantjewelers.com',
      active: true,
      settings: {
        create: {
          defaultMakingChargeType: ChargeType.PERCENTAGE,
          defaultMakingChargeValue: 12.5,
          gstGoldRate: 3.0,
          gstMakingRate: 5.0,
          primaryLanguage: 'en',
          billingPrefix: 'EJ',
          nextBillNumber: 1001
        }
      }
    },
    {
      name: 'Ornate Gold House',
      address: '45 Jewelry Lane, Delhi',
      gstin: '07BBBPS1206Q1ZK',
      contactNumber: '8765432109',
      email: 'sales@ornategold.com',
      active: true,
      settings: {
        create: {
          defaultMakingChargeType: ChargeType.PER_GRAM,
          defaultMakingChargeValue: 500,
          gstGoldRate: 3.0,
          gstMakingRate: 5.0,
          primaryLanguage: 'hi',
          billingPrefix: 'OGH',
          nextBillNumber: 101
        }
      }
    }
  ]

  // Create shops
  const shops = []
  for (const shop of shopData) {
    const createdShop = await prisma.shop.create({ data: shop })
    shops.push(createdShop)
  }

  // Create Gold Rates for each shop
  const goldRateData: Prisma.GoldRateCreateInput[] = [
    {
      rate22K: 5950.00,
      rate24K: 6480.00,
      effectiveDate: new Date(),
      shop: { connect: { id: shops[0].id } }
    },
    {
      rate22K: 5925.00,
      rate24K: 6450.00,
      effectiveDate: new Date(),
      shop: { connect: { id: shops[1].id } }
    }
  ]

  // Create gold rates
  for (const rate of goldRateData) {
    await prisma.goldRate.create({ data: rate })
  }

  // Create Users
  const userData: Prisma.UserCreateInput[] = [
    {
      username: 'rajesh.owner',
      password: '$2a$12$Hf.5Xm9.j5VLO7xzHID/7OFyLwO/Z9QCqBjcwqZfF5QNQg5EuLwPG', // hashed 'password123'
      name: 'Rajesh Kumar',
      role: UserRole.OWNER,
      active: true,
      lastLoginAt: new Date(),
      shop: { connect: { id: shops[0].id } }
    },
    {
      username: 'priya.sales',
      password: '$2a$12$QZF6Eyn9.j5VLO7xzHID/7OhSzKL/UaQCqBjcwqZfF5QNQg5Eh9oK', // hashed 'staffpass'
      name: 'Priya Singh',
      role: UserRole.SALES_STAFF,
      active: true,
      lastLoginAt: new Date(),
      shop: { connect: { id: shops[0].id } }
    },
    {
      username: 'amit.owner',
      password: '$2a$12$QZF6Eyn9.j5VLO7xzHID/7OhSzKL/UaQCqBjcwqZfF5QNQg5Eh9oK', // hashed 'ownerpass'
      name: 'Amit Sharma',
      role: UserRole.OWNER,
      active: true,
      lastLoginAt: new Date(),
      shop: { connect: { id: shops[1].id } }
    }
  ]

  // Create users
  const users = []
  for (const user of userData) {
    const createdUser = await prisma.user.create({ data: user })
    users.push(createdUser)
  }

  // Create Customers
  const customerData: Prisma.CustomerCreateInput[] = [
    {
      name: 'Anita Desai',
      phoneNumber: '9876543211',
      email: 'anita.desai@gmail.com',
      address: '456 Park Avenue, Mumbai',
      shop: { connect: { id: shops[0].id } }
    },
    {
      name: 'Vijay Mehta',
      phoneNumber: '9876543212',
      email: 'vijay.mehta@yahoo.com',
      address: '789 Market Street, Mumbai',
      shop: { connect: { id: shops[0].id } }
    },
    {
      name: 'Sunita Patel',
      phoneNumber: '9876543213',
      shop: { connect: { id: shops[1].id } }
    }
  ]

  // Create customers
  const customers = []
  for (const customer of customerData) {
    const createdCustomer = await prisma.customer.create({ data: customer })
    customers.push(createdCustomer)
  }

  // Create Inventory Items
  const inventoryData: Prisma.InventoryItemCreateInput[] = [
    {
      name: 'Diamond Studded Gold Ring',
      itemCode: 'R001',
      huid: 'HUID98765432101',
      category: JewelryCategory.RING,
      weight: 8.5,
      purity: '22K',
      costPrice: 48000,
      sellingPrice: 52000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 15,
      status: ItemStatus.IN_STOCK,
      shop: { connect: { id: shops[0].id } }
    },
    {
      name: 'Gold Chain',
      itemCode: 'C001',
      huid: 'HUID98765432102',
      category: JewelryCategory.CHAIN,
      weight: 12.75,
      purity: '22K',
      costPrice: 72000,
      sellingPrice: 78000,
      makingChargeType: ChargeType.PER_GRAM,
      makingChargeValue: 450,
      status: ItemStatus.IN_STOCK,
      shop: { connect: { id: shops[0].id } }
    },
    {
      name: 'Ruby Necklace',
      itemCode: 'N001',
      huid: 'HUID98765432103',
      category: JewelryCategory.NECKLACE,
      weight: 32.5,
      purity: '22K',
      costPrice: 180000,
      sellingPrice: 195000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 12,
      status: ItemStatus.IN_STOCK,
      shop: { connect: { id: shops[0].id } }
    },
    {
      name: 'Gold Bangle Set',
      itemCode: 'B001',
      huid: 'HUID98765432104',
      category: JewelryCategory.BANGLE,
      weight: 45.0,
      purity: '22K',
      costPrice: 245000,
      sellingPrice: 265000,
      makingChargeType: ChargeType.PERCENTAGE,
      makingChargeValue: 10,
      status: ItemStatus.IN_STOCK,
      shop: { connect: { id: shops[1].id } }
    }
  ]

  // Create inventory items
  const inventoryItems = []
  for (const item of inventoryData) {
    const createdItem = await prisma.inventoryItem.create({ data: item })
    inventoryItems.push(createdItem)
  }

  // Create Sales with SaleItems
  const saleData: Prisma.SaleCreateInput[] = [
    {
      billNumber: 'EJ1001',
      billPrefix: 'EJ',
      billSeqNumber: 1001,
      saleDate: new Date('2025-04-10'),
      subtotal: 52000,
      discount: 2000,
      discountType: DiscountType.AMOUNT,
      gstAmount: 2280, // (3% on gold value + 5% on making)
      totalAmount: 52280,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentDetails: { 
        cardType: 'VISA',
        transactionId: 'TXN123456789'
      },
      customer: { connect: { id: customers[0].id } },
      shop: { connect: { id: shops[0].id } },
      createdBy: { connect: { id: users[0].id } },
      items: {
        create: [
          {
            item: { connect: { id: inventoryItems[0].id } },
            goldRate: 5950.00,
            goldValue: 45000, // weight * goldRate 
            makingCharge: 7000, // 15% of goldValue
            gstOnGold: 1350, // 3% of goldValue
            gstOnMaking: 350, // 5% of makingCharge
            totalAmount: 52000 // gold + making + GST - discount
          }
        ]
      }
    },
    {
      billNumber: 'EJ1002',
      billPrefix: 'EJ',
      billSeqNumber: 1002,
      saleDate: new Date('2025-04-11'),
      subtotal: 78000,
      discount: 0,
      discountType: DiscountType.AMOUNT,
      gstAmount: 2870, // (3% on gold value + 5% on making)
      totalAmount: 80870,
      paymentMethod: PaymentMethod.UPI,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentDetails: { 
        upiId: 'customer@upi',
        transactionId: 'UPI987654321'
      },
      customer: { connect: { id: customers[1].id } },
      shop: { connect: { id: shops[0].id } },
      createdBy: { connect: { id: users[1].id } },
      items: {
        create: [
          {
            item: { connect: { id: inventoryItems[1].id } },
            goldRate: 5950.00,
            goldValue: 72000, // weight * goldRate
            makingCharge: 6000, // per gram * weight
            gstOnGold: 2160, // 3% of goldValue
            gstOnMaking: 300, // 5% of makingCharge
            totalAmount: 80460 // gold + making + GST
          }
        ]
      }
    }
  ]

  // Create sales
  for (const sale of saleData) {
    await prisma.sale.create({ data: sale })
  }

  // Create Audit Logs
  const auditLogData: Prisma.AuditLogCreateInput[] = [
    {
      action: 'ITEM_CREATED',
      entityType: 'InventoryItem',
      entityId: inventoryItems[0].id,
      description: 'Added new inventory item: Diamond Studded Gold Ring',
      metadata: { itemId: inventoryItems[0].id, itemCode: 'R001' },
      user: { connect: { id: users[0].id } }
    },
    {
      action: 'SALE_COMPLETED',
      entityType: 'Sale',
      entityId: 'EJ1001',
      description: 'Completed sale for customer Anita Desai',
      metadata: { billNumber: 'EJ1001', amount: 52280 },
      user: { connect: { id: users[0].id } }
    }
  ]

  // Create audit logs
  for (const log of auditLogData) {
    await prisma.auditLog.create({ data: log })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })