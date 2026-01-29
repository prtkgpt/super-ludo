import { NextRequest, NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/lib/db';
import { users, userStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: {
        id: 'mock-user',
        username: 'Player',
        coins: 100,
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          totalCaptures: 0,
        },
      },
    });
  }

  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        ...user[0],
        stats: stats[0] || null,
      },
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: { id: 'mock-user', username: 'Player' },
    });
  }

  try {
    const db = getDb();
    const body = await request.json();
    const { username, email } = body;

    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
      })
      .returning();

    // Create initial stats
    await db.insert(userStats).values({
      userId: newUser[0].id,
    });

    return NextResponse.json({
      success: true,
      data: newUser[0],
    });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      message: 'Database not configured',
    });
  }

  try {
    const db = getDb();
    const body = await request.json();
    const { userId, coins, stats } = body;

    if (coins !== undefined) {
      await db
        .update(users)
        .set({ coins })
        .where(eq(users.id, userId));
    }

    if (stats) {
      await db
        .update(userStats)
        .set({
          ...stats,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, userId));
    }

    return NextResponse.json({
      success: true,
      message: 'User updated',
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
