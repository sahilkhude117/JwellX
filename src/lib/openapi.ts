// src/lib/openapi/schema.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // API routes folder
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Jewelry Shop POS API Documentation',
        version: '1.0.0',
        description: 'API documentation for the Jewelry Shop POS System',
        contact: {
          name: 'Support',
          email: 'support@jewelrypos.com',
        },
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production' 
            ? 'https://your-production-domain.com' 
            : 'http://localhost:3000',
          description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
        },
      ],
      tags: [
        {
          name: 'Auth',
          description: 'Authentication endpoints',
        },
        {
          name: 'Shop',
          description: 'Shop management endpoints',
        },
        {
          name: 'Inventory',
          description: 'Inventory management endpoints',
        },
        {
          name: 'Sales',
          description: 'Sales and billing endpoints',
        },
        {
          name: 'Customers',
          description: 'Customer management endpoints',
        },
        {
          name: 'Reports',
          description: 'Reporting endpoints',
        },
        {
          name: 'Settings',
          description: 'System settings endpoints',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          // Error responses
          Error: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false,
              },
              error: {
                type: 'string',
                example: 'Error message',
              },
            },
          },
          
          // Shop schemas
          ShopCreate: {
            type: 'object',
            required: ['name', 'address', 'gstin', 'contactNumber'],
            properties: {
              name: {
                type: 'string',
                example: 'Sharma Jewelers',
              },
              address: {
                type: 'string',
                example: '42 Gandhi Road, Mumbai, Maharashtra',
              },
              gstin: {
                type: 'string',
                example: '27AAPFU0939F1ZV',
              },
              contactNumber: {
                type: 'string',
                example: '+91 9876543210',
              },
              email: {
                type: 'string',
                example: 'info@sharmajewelers.com',
              },
            },
          },
          Shop: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
              address: {
                type: 'string',
              },
              gstin: {
                type: 'string',
              },
              contactNumber: {
                type: 'string',
              },
              email: {
                type: 'string',
                nullable: true,
              },
              active: {
                type: 'boolean',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          
          // Settings schemas
          ShopSettings: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              defaultMakingChargeType: {
                type: 'string',
                enum: ['PERCENTAGE', 'PER_GRAM', 'FIXED'],
              },
              defaultMakingChargeValue: {
                type: 'number',
                format: 'float',
              },
              gstGoldRate: {
                type: 'number',
                format: 'float',
              },
              gstMakingRate: {
                type: 'number',
                format: 'float',
              },
              primaryLanguage: {
                type: 'string',
              },
              billingPrefix: {
                type: 'string',
              },
              nextBillNumber: {
                type: 'integer',
              },
            },
          },
          
          // Inventory schemas
          InventoryItemCreate: {
            type: 'object',
            required: ['name', 'category', 'weight', 'purity', 'costPrice', 'sellingPrice', 'makingChargeType', 'makingChargeValue'],
            properties: {
              name: {
                type: 'string',
                example: 'Gold Ring with Diamond',
              },
              itemCode: {
                type: 'string',
                example: 'GR-D001',
              },
              huid: {
                type: 'string',
                example: 'HUID12345678',
              },
              category: {
                type: 'string',
                enum: ['RING', 'CHAIN', 'NECKLACE', 'BANGLE', 'BRACELET', 'EARRING', 'PENDANT', 'OTHER'],
              },
              weight: {
                type: 'number',
                format: 'float',
                example: 5.75,
              },
              purity: {
                type: 'string',
                example: '22K',
              },
              costPrice: {
                type: 'number',
                format: 'float',
                example: 28500,
              },
              sellingPrice: {
                type: 'number',
                format: 'float',
                example: 32000,
              },
              makingChargeType: {
                type: 'string',
                enum: ['PERCENTAGE', 'PER_GRAM', 'FIXED'],
              },
              makingChargeValue: {
                type: 'number',
                format: 'float',
                example: 12.5,
              },
            },
          },
          InventoryItem: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
              itemCode: {
                type: 'string',
                nullable: true,
              },
              huid: {
                type: 'string',
                nullable: true,
              },
              category: {
                type: 'string',
                enum: ['RING', 'CHAIN', 'NECKLACE', 'BANGLE', 'BRACELET', 'EARRING', 'PENDANT', 'OTHER'],
              },
              weight: {
                type: 'number',
                format: 'float',
              },
              purity: {
                type: 'string',
              },
              costPrice: {
                type: 'number',
                format: 'float',
              },
              sellingPrice: {
                type: 'number',
                format: 'float',
              },
              makingChargeType: {
                type: 'string',
                enum: ['PERCENTAGE', 'PER_GRAM', 'FIXED'],
              },
              makingChargeValue: {
                type: 'number',
                format: 'float',
              },
              status: {
                type: 'string',
                enum: ['IN_STOCK', 'SOLD', 'RESERVED'],
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          
          // Sales schemas
          SaleCreate: {
            type: 'object',
            required: ['items', 'paymentMethod'],
            properties: {
              customerId: {
                type: 'string',
                format: 'uuid',
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['itemId'],
                  properties: {
                    itemId: {
                      type: 'string',
                      format: 'uuid',
                    },
                  },
                },
                minItems: 1,
              },
              discount: {
                type: 'number',
                format: 'float',
                default: 0,
              },
              discountType: {
                type: 'string',
                enum: ['PERCENTAGE', 'AMOUNT'],
                default: 'AMOUNT',
              },
              paymentMethod: {
                type: 'string',
                enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER'],
              },
              paymentDetails: {
                type: 'object',
                additionalProperties: true,
              },
            },
          },
          Sale: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              billNumber: {
                type: 'string',
              },
              billPrefix: {
                type: 'string',
              },
              billSeqNumber: {
                type: 'integer',
              },
              saleDate: {
                type: 'string',
                format: 'date-time',
              },
              customerId: {
                type: 'string',
                format: 'uuid',
                nullable: true,
              },
              subtotal: {
                type: 'number',
                format: 'float',
              },
              discount: {
                type: 'number',
                format: 'float',
              },
              discountType: {
                type: 'string',
                enum: ['PERCENTAGE', 'AMOUNT'],
              },
              gstAmount: {
                type: 'number',
                format: 'float',
              },
              totalAmount: {
                type: 'number',
                format: 'float',
              },
              paymentMethod: {
                type: 'string',
                enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER'],
              },
              paymentStatus: {
                type: 'string',
                enum: ['PENDING', 'COMPLETED', 'FAILED'],
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          SaleItem: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              saleId: {
                type: 'string',
                format: 'uuid',
              },
              itemId: {
                type: 'string',
                format: 'uuid',
              },
              goldRate: {
                type: 'number',
                format: 'float',
              },
              goldValue: {
                type: 'number',
                format: 'float',
              },
              makingCharge: {
                type: 'number',
                format: 'float',
              },
              gstOnGold: {
                type: 'number',
                format: 'float',
              },
              gstOnMaking: {
                type: 'number',
                format: 'float',
              },
              totalAmount: {
                type: 'number',
                format: 'float',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          
          // Customer schemas
          CustomerCreate: {
            type: 'object',
            required: ['name', 'phoneNumber'],
            properties: {
              name: {
                type: 'string',
                example: 'Rajesh Kumar',
              },
              phoneNumber: {
                type: 'string',
                example: '+91 9876543210',
              },
              email: {
                type: 'string',
                example: 'rajesh@example.com',
              },
              address: {
                type: 'string',
                example: '123 Main St, Pune, Maharashtra',
              },
            },
          },
          Customer: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
              phoneNumber: {
                type: 'string',
              },
              email: {
                type: 'string',
                nullable: true,
              },
              address: {
                type: 'string',
                nullable: true,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          
          // Auth schemas
          LoginRequest: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: {
                type: 'string',
                example: 'owner',
              },
              password: {
                type: 'string',
                example: 'securepassword',
              },
            },
          },
          LoginResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
              token: {
                type: 'string',
              },
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  username: {
                    type: 'string',
                  },
                  name: {
                    type: 'string',
                  },
                  role: {
                    type: 'string',
                    enum: ['OWNER', 'SALES_STAFF', 'ARTISAN', 'ACCOUNTANT'],
                  },
                },
              },
            },
          },
          
          // Gold Rate schemas
          GoldRateCreate: {
            type: 'object',
            required: ['rate22K', 'rate24K'],
            properties: {
              rate22K: {
                type: 'number',
                format: 'float',
                example: 5650.75,
              },
              rate24K: {
                type: 'number',
                format: 'float',
                example: 6150.50,
              },
              effectiveDate: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          GoldRate: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              rate22K: {
                type: 'number',
                format: 'float',
              },
              rate24K: {
                type: 'number',
                format: 'float',
              },
              effectiveDate: {
                type: 'string',
                format: 'date-time',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
  });
  return spec;
};
