import { db } from '@/db';
import { activeRooms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const rooms = await db.select().from(activeRooms).limit(20);
    return NextResponse.json({ success: true, rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, roomCode, hostId, tierId, playerInfo } = body;

    if (action === 'create') {
      const code = roomCode || Math.random().toString(36).substring(2, 8).toUpperCase();
      const newRoom = {
        id: `room_${Date.now()}_${code}`,
        code,
        hostId,
        tier: tierId || 'rookie_10',
        maxPlayers: 4,
        players: [playerInfo],
        status: 'waiting',
      };

      await db.insert(activeRooms).values(newRoom);
      return NextResponse.json({ success: true, room: newRoom });
    }

    if (action === 'join') {
      if (!roomCode) {
        return NextResponse.json({ success: false, error: 'Room code required' }, { status: 400 });
      }

      const found = await db.select().from(activeRooms).where(eq(activeRooms.code, roomCode.toUpperCase())).limit(1);
      if (found.length === 0) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }

      const room = found[0];
      const currentPlayers = (room.players as any[]) || [];
      if (currentPlayers.length >= 4) {
        return NextResponse.json({ success: false, error: 'Room is full' }, { status: 400 });
      }

      const updatedPlayers = [...currentPlayers.filter((p: any) => p.id !== playerInfo.id), playerInfo];
      await db.update(activeRooms).set({
        players: updatedPlayers,
        status: updatedPlayers.length >= 4 ? 'in_game' : 'waiting',
        updatedAt: new Date(),
      }).where(eq(activeRooms.id, room.id));

      return NextResponse.json({ success: true, room: { ...room, players: updatedPlayers } });
    }

    return NextResponse.json({ success: false, error: 'Invalid room action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
