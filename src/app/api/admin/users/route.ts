import { NextRequest, NextResponse } from 'next/server';

import { AdminService } from '@/services/admin.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') || undefined;
    let sortDirection = searchParams.get('sortDirection') || undefined;
    if (sortDirection !== 'asc' && sortDirection !== 'desc') {
      sortDirection = undefined;
    }
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const email = searchParams.get('email') || undefined;
    const name = searchParams.get('name') || undefined;

    const { users, total } = await AdminService.listUsers({
      limit,
      offset,
      sortBy,
      sortDirection,
      role,
      status,
      email,
      name,
    });

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
