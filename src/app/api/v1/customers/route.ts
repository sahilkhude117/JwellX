import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/utils/auth-utils';
import { createCustomerSchema } from '@/lib/validations/customers';
import { Prisma } from '@/generated/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await requirePermission('VIEW_CUSTOMERS');
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const isActive = searchParams.get('isActive');
        const sortBy = searchParams.get('sortBy') || 'registrationDate';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        const where: any = {
            shopId: session.user.shopId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Date range filter for registration date
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Get customers with purchase statistics
        const customers = await prisma.customer.findMany({
            where,
            include: {
                sales: {
                    select: {
                        id: true,
                        totalAmount: true,
                        saleDate: true,
                    },
                    orderBy: { saleDate: 'desc' },
                },
            },
            skip,
            take: limit,
            orderBy: getSortConfig(sortBy, sortOrder),
        });

        // Calculate statistics for each customer
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        type CustomerWithSales = Prisma.CustomerGetPayload<{
            include: {
                sales: {
                    select: {
                        id: true;
                        totalAmount: true;
                        saleDate: true;
                    }
                }
            }
        }>;

        const customersWithStats = (customers as CustomerWithSales[]).map(customer => {
            const totalPurchases = customer.sales.length;
            const totalSpent = customer.sales.reduce((sum: number, sale) => sum + sale.totalAmount, 0);
            const lastPurchaseDate = customer.sales.length > 0 ? customer.sales[0].saleDate : null;
            const recentPurchases = customer.sales.filter((sale) => new Date(sale.saleDate) >= sixMonthsAgo);
            const isActiveCustomer = recentPurchases.length > 0;

            return {
                ...customer,
                sales: undefined, // Remove sales data from response
                totalPurchases,
                totalSpent: totalSpent / 100, // Convert from cents
                lastPurchaseDate,
                isActive: isActiveCustomer,
            };
        });

        // Filter by activity status if specified
        const filteredCustomers = isActive && isActive !== 'all'
            ? customersWithStats.filter(customer => 
                isActive === 'true' ? customer.isActive : !customer.isActive
            )
            : customersWithStats;

        // Get total count for pagination
        const totalCount = await prisma.customer.count({
            where: {
                ...where,
                ...(isActive && isActive !== 'all' ? {
                    sales: isActive === 'true' ? {
                        some: {
                            saleDate: { gte: sixMonthsAgo }
                        }
                    } : {
                        none: {
                            saleDate: { gte: sixMonthsAgo }
                        }
                    }
                } : {})
            }
        });

        return NextResponse.json({
            customers: filteredCustomers,
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requirePermission('CREATE_CUSTOMERS');
        const body = await request.json();
        
        const validatedData = createCustomerSchema.parse(body);

        // Check if customer already exists (by phoneNumber or email)
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                shopId: session.user.shopId,
                OR: [
                    ...(validatedData.phoneNumber ? [{ phoneNumber: validatedData.phoneNumber }] : []),
                    ...(validatedData.email ? [{ email: validatedData.email }] : []),
                ],
            },
        });

        if (existingCustomer) {
            const conflictField = existingCustomer.phoneNumber === validatedData.phoneNumber ? 'phoneNumber' : 'email';
            return NextResponse.json(
                { error: `Customer with this ${conflictField} already exists` },
                { status: 409 }
            );
        }

        const customer = await prisma.customer.create({
            data: {
                ...validatedData,
                shopId: session.user.shopId,
            },
        });

        // Return customer with default stats
        const customerWithStats = {
            ...customer,
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchaseDate: null,
            isActive: false,
        };

        return NextResponse.json({ customer: customerWithStats }, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
}

function getSortConfig(sortBy: string, sortOrder: string): Prisma.CustomerOrderByWithRelationInput {
    const order = (sortOrder === 'asc' ? 'asc' : 'desc') as Prisma.SortOrder;
    
    switch (sortBy) {
        case 'name':
            return { name: order };
        case 'registrationDate':
            return { createdAt: order };
        case 'lastPurchase':
            // For now, sort by creation date - proper sorting would require aggregation
            return { createdAt: order };
        case 'totalSpent':
            // For now, sort by creation date - proper sorting would require aggregation
            return { createdAt: order };
        default:
            return { createdAt: 'desc' };
    }
}