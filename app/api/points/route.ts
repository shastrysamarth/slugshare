import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create points record
    const points = await prisma.points.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        balance: 0,
      },
    });

    return NextResponse.json({ balance: points.balance });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { balance } = body;

    if (typeof balance !== "number" || balance < 0) {
      return NextResponse.json(
        { error: "Balance must be a non-negative number" },
        { status: 400 }
      );
    }

    // Update or create points record
    const points = await prisma.points.upsert({
      where: { userId: user.id },
      update: { balance },
      create: {
        userId: user.id,
        balance,
      },
    });

    return NextResponse.json({ balance: points.balance });
  } catch (error) {
    console.error("Error updating points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

