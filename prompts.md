Role: You are a expert in jwellery shop pos busniess. You are building pos system for indian jwellery owner and you know all their workflows promblems and how can we handle them in our solution. you have 20 years of experience in this field.
Task: Your task is to analyse  first draft of solution which has lot of mistakes built by your team. address those mistakes and explain the team that how the flow is going to be for instance log in -> onboarding -> add product etc. you need to give specific details in each step like what are fields will be their which shadcn component will be used there etc. also your team have some doubts resolve those too. 
Instructions:
1. be consise but cover everything
2. give answer in bullet points
3. solution should help user use our solution in best way possible
4. mention standard practices.
Data: 
SideBar => 
 1. Dashboard
 2. Sales 
    a. point of sale
    b. invoices
    c. transactions
 3. Inventory
    a. stock overview
    b. purchase history
    c. stock adjustment
 4. Products
    a. product list
    b. categories
    c. materials & gemstones
 5. Customers
 6. Orders & Repairs
    a. custom orders
    b. repair orders
 7. Reports 
    a. sales reports
    b. inventory reports
    c. customer reports
 8. Settings
    a. user management
    b. daily metal rates
    c. general settings
 9. Logout

What is implemented till now =>
 1. user management
 2. daily metal rates (give daily rate of gold(22k, 24k) and silver)
 3. general settings (has inv prefix and all)
 4. products/categories 
    - add categories
        - name 
        - description (optional)
    - add brands
        - name 
        - description (optional)
 5. products/ materials & gemstones
    - add material
        - name
        - type (GOLD, SILVER etc)
        - Purity
        - Unit (optional)
    - add gemstone
        - name
        - shape
        - size
        - clarity (optional)
        - color (optional)
        - unit (optional)
 6. products/product-list
    - table (name, category, brand, variants, stock, status)
 7. products/product-list/add-products
    - contextual setup bar
        - category
        - brand (optional)
    - product details
        - name
        - sku
        - hsn code (optional)
        - description (optional)
    - attributes
        - occasion (wedding etc)
        - gender (male, female etc)
        - style (classic etc)
    - product contains gemstones or not
    - customizable
    - variants
        - sku
        - total weight
        - quantity
        - materials
            - material (from created materials)
            - purity
            - weight 
            - rate
        - gemstones
            - gemstone (from created gemstones)
            - carat weight
            - rate
            - cut
            - color 
            - clarity
        - pricing
            - making charge
            - wastage 
            - total material cost (calculated based on rate)
            - total gemstone cost (calculated based on rate)
            - total cost (material + gemstone + making charge)

Database schema => 
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator seed {
    provider = "prisma-client-js"
}

// User Management
model User {
  id            String     @id @default(uuid()) 
  username      String     @unique
  email         String?     @unique
  emailVerified Boolean    @default(false)
  verificationToken String?
  password      String
  name          String
  resetToken    String?
  resetTokenExpiry DateTime?
  role          UserRole
  active        Boolean    @default(true)
  lastLoginAt   DateTime?
  hasCompletedOnboarding Boolean @default(false)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  shop          Shop       @relation(fields: [shopId], references: [id])
  shopId        String
  sales         Sale[]
  auditLogs     AuditLog[]

  @@index([shopId, role, active])
  @@index([username])
}

enum UserRole {
  OWNER
  SALES_STAFF
  ARTISAN     // For future use
  ACCOUNTANT  // For future use
}

// Shop Settings
model Shop {
  id            String         @id @default(uuid())
  name          String
  address       String?
  gstin         String?        @unique
  contactNumber String?  
  email         String?
  logoUrl       String?
  active        Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  settings      ShopSettings?
  users         User[]
  inventory     InventoryItem[]
  sales         Sale[]
  customers     Customer[]

  categories    Category[]
  brands        Brand[]
  products      Product[]
  materials     Material[]
  gemstones     Gemstone[]

  @@index([active])
}

model ShopSettings {
  id                        String     @id @default(uuid())
  defaultMakingChargeType   ChargeType @default(PERCENTAGE)
  defaultMakingChargeValue  Float      @default(10.0)
  gstGoldRate               Float      @default(3.0)
  gstMakingRate             Float      @default(5.0)
  primaryLanguage           String     @default("en") // For language preference
  billingPrefix             String     @default("INV") // For bill numbering
  nextBillNumber            Int        @default(1)    // Auto-increment counter for billing
  invoiceTemplateId         String?
  shop                      Shop       @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId                    String     @unique
  createdAt                 DateTime   @default(now())
  updatedAt                 DateTime   @updatedAt
}

model InvoiceTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?
  previewUrl  String   // URL to preview image
  templateType String  // 'classic', 'modern', 'minimal', etc.
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive, templateType])
}

enum ChargeType {
  PERCENTAGE
  PER_GRAM
  FIXED
}

model Category {
  id            String         @id @default(uuid())
  name          String
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  shop          Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId        String

  products      Product[]

  @@index([shopId])
  @@unique([shopId, name])
}

model Brand {
  id            String  @id @default(uuid())
  name          String
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  shop        Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId      String

  products    Product[]

  @@unique([shopId, name])
  @@index([shopId])
}

model Material {
  id            String @id @default(uuid())
  name          String
  type          MaterialType
  purity        String
  defaultRate   Float @default(0) // last enter purchase/base rate
  unit          String @default("g")
  created       DateTime @default(now())
  updatedAt     DateTime @updatedAt

  shop        Shop         @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId      String

  variantMaterials VariantMaterial[]

  @@unique([shopId, name, purity])
  @@index([shopId])
}

enum MaterialType {
  GOLD
  SILVER
  PLATINUM
  PALLADIUM
  OTHER
}

model Gemstone {
  id           String @id @default(uuid())
  name         String
  shape        GemstoneShape
  size         String
  clarity      String?
  color        String?
  defaultRate  Float @default(0)
  unit         String @default("ct")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  shop        Shop           @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId      String

  variantGemstones VariantGemstone[]

  @@unique([shopId, name, shape, size])
  @@index([shopId])
}

enum GemstoneShape {
  ROUND
  OVAL
  PEAR 
  EMERALD
  PRINCESS
  MARQUISE
  OTHER
}

model Product {
  id          String @id @default(uuid())
  name        String
  sku         String @unique
  description String? 
  hsnCode     String?
  imageUrls   String[]
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  brandId     String?
  brand       Brand?   @relation(fields: [brandId], references: [id])

  shop        Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  shopId      String

  attributes  ProductAttribute[]
  variants    Variant[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([shopId, sku])
  @@index([shopId])
}

model ProductAttribute {
  id           String @id @default(uuid())
  productId    String
  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  name         String
  value        String

  @@unique([productId, name])
}

model Variant {
  id           String @id @default(uuid())
  productId    String
  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku          String @unique
  totalWeight  Float
  makingCharge Float
  wastage      Float?
  quantity     Int

  materials    VariantMaterial[]
  gemstones    VariantGemstone[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([productId])
}

model VariantMaterial {
  id           String @id @default(uuid())
  variantId    String
  variant      Variant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  materialId   String
  material     Material @relation(fields: [materialId], references: [id])

  purity       String
  weight       Float
  rate         Float

  @@unique([variantId, materialId, purity])
}

model VariantGemstone {
  id           String @id @default(uuid())
  variantId    String
  variant      Variant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  gemstoneId   String
  gemstone     Gemstone @relation(fields: [gemstoneId], references: [id])

  caratWeight  Float
  cut          String?
  color           String?
  clarity         String?
  certificationId String?
  rate            Float 

  @@unique([variantId, gemstoneId, caratWeight, cut, color, clarity])
}

model InventoryItem {
  id              String          @id @default(uuid())
  name            String
  itemCode        String?         // Optional internal code
  huid            String?         // HUID from hallmarking
  category        JewelryCategory
  weight          Float           // Weight in grams
  purity          String          // e.g., "22K", "24K", "18K"
  costPrice       Float
  sellingPrice    Float
  makingChargeType ChargeType
  makingChargeValue Float
  status          ItemStatus      @default(IN_STOCK)
  shop            Shop            @relation(fields: [shopId], references: [id])
  shopId          String
  saleItems       SaleItem[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Optimized indexes for common query patterns
  @@index([shopId, status])
  @@index([shopId, category, status])
  @@index([huid]) 

}

enum JewelryCategory {
  RING
  CHAIN
  NECKLACE
  BANGLE
  BRACELET
  EARRING
  PENDANT
  OTHER
}

enum ItemStatus {
  IN_STOCK
  SOLD
  RESERVED
}

// Sales Management with partitioning strategy for high volume
model Sale {
  id            String        @id @default(uuid())
  billNumber    String       
  billPrefix    String       // Store prefix separate for better querying
  billSeqNumber Int          // Store sequence number separate for better querying
  saleDate      DateTime      @default(now())
  customer      Customer?     @relation(fields: [customerId], references: [id])
  customerId    String?
  items         SaleItem[]
  subtotal      Float
  discount      Float         @default(0)
  discountType  DiscountType  @default(AMOUNT)
  gstAmount     Float
  totalAmount   Float
  paymentMethod PaymentMethod
  paymentStatus PaymentStatus @default(COMPLETED)
  paymentDetails Json?        // For storing payment gateway details
  shop          Shop          @relation(fields: [shopId], references: [id])
  shopId        String
  createdBy     User          @relation(fields: [userId], references: [id])
  userId        String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Optimized for high-volume querying
  @@unique([shopId, billNumber])
  @@index([shopId, billSeqNumber(sort: Desc)])
  @@index([shopId, saleDate(sort: Desc)])
  @@index([customerId, saleDate(sort: Desc)])
  @@index([shopId, paymentStatus])
  @@index([userId, saleDate(sort: Desc)])
}

model SaleItem {
  id              String        @id @default(uuid())
  sale            Sale          @relation(fields: [saleId], references: [id], onDelete: Cascade)
  saleId          String
  item            InventoryItem @relation(fields: [itemId], references: [id])
  itemId          String
  goldRate        Float         // Rate at the time of sale
  goldValue       Float         // Gold value portion
  makingCharge    Float         // Making charge portion
  gstOnGold       Float         // GST amount on gold
  gstOnMaking     Float         // GST amount on making
  totalAmount     Float
  createdAt       DateTime      @default(now())

  @@index([saleId])
  @@index([itemId, saleId])
}

enum DiscountType {
  PERCENTAGE
  AMOUNT
}

enum PaymentMethod {
  CASH
  CARD
  UPI
  BANK_TRANSFER
  OTHER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}

// Customer Management with optimized search capabilities
model Customer {
  id            String    @id @default(uuid())
  name          String
  phoneNumber   String
  email         String?
  address       String?
  shop          Shop      @relation(fields: [shopId], references: [id])
  shopId        String
  sales         Sale[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([shopId, phoneNumber]) // Trigram index for fast name search
}

// Audit Logging with retention policy support
model AuditLog {
  id            String    @id @default(uuid())
  action        String
  entityType    String
  entityId      String
  description   String
  metadata      Json?
  user          User      @relation(fields: [userId], references: [id])
  userId        String
  createdAt     DateTime  @default(now())
  // Month partition for efficient pruning of old logs
  yearMonth     String    @default(dbgenerated("to_char(now(), 'YYYY-MM')"))

  @@index([userId, createdAt(sort: Desc)])
  @@index([entityType, entityId])
  @@index([yearMonth, createdAt]) // For efficient log retention management
}

Doubts => 
 1. we are creating materials and gemstones without taking rates and then asking rates while creating product but rates keep changing. so i think we should skip this part of asking rates and showing total consts and all.
 2. in inventory we can take rates for other materials. maybe
 3. also we have live metal rates of gold 22k,24k and silver should we use it at pos time or what?
 4. how should be inventory work and should we keep products to just to proudct not shoiwng inventory
 5. and let user add inventory after creating product. also use the things like purity, and color cut etch for materials and gemstones from materials and gemsonte ssection and just take wieght of them from user while creating product.
 6. give
        