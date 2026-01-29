import { NextRequest, NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/lib/db';
import { leaderboard } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  // Check if database is configured
  if (!isDatabaseConfigured()) {
    // Return mock data for development
    return NextResponse.json({
      success: true,
      data: [
        { id: 1, username: 'LudoMaster', wins: 150, gamesPlayed: 200, rank: 1 },
        { id: 2, username: 'DiceKing', wins: 120, gamesPlayed: 180, rank: 2 },
        { id: 3, username: 'TokenTerror', wins: 100, gamesPlayed: 150, rank: 3 },
        { id: 4, username: 'RushBot', wins: 80, gamesPlayed: 120, rank: 4 },
        { id: 5, username: 'StarChaser', wins: 60, gamesPlayed: 100, rank: 5 },
      ],
    });
  }

  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const entries = await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.wins))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      message: 'Database not configured - score not saved',
    });
  }

  try {
    const db = getDb();
    const body = await request.json();
    const { userId, username, wins, gamesPlayed, totalCaptures, fastestWin } = body;

    // Upsert leaderboard entry
    await db
      .insert(leaderboard)
      .values({
        userId,
        username,
        wins,
        gamesPlayed,
        totalCaptures,
        fastestWin,
      })
      .onConflictDoUpdate({
        target: leaderboard.userId,
        set: {
          wins,
          gamesPlayed,
          totalCaptures,
          fastestWin,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Leaderboard updated',
    });
  } catch (error) {
    console.error('Leaderboard update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}
