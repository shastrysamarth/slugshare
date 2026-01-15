import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;

    // Get the request
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Validate: Can't accept your own request
    if (request.requesterId === user.id) {
      return NextResponse.json(
        { error: "You cannot accept your own request" },
        { status: 400 }
      );
    }

    // Validate: Request must be pending
    if (request.status !== "pending") {
      return NextResponse.json(
        { error: "Request is no longer pending" },
        { status: 400 }
      );
    }

    // Get or create donor's points
    const donorPoints = await prisma.points.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        balance: 0,
      },
    });

    // Validate: Donor must have enough points
    if (donorPoints.balance < request.pointsRequested) {
      return NextResponse.json(
        { error: "Insufficient points balance" },
        { status: 400 }
      );
    }

    // Get or create requester's points
    const requesterPoints = await prisma.points.upsert({
      where: { userId: request.requesterId },
      update: {},
      create: {
        userId: request.requesterId,
        balance: 0,
      },
    });

    // Perform atomic transaction: transfer points and update request
    await prisma.$transaction([
      // Decrease donor's balance
      prisma.points.update({
        where: { userId: user.id },
        data: {
          balance: {
            decrement: request.pointsRequested,
          },
        },
      }),
      // Increase requester's balance
      prisma.points.update({
        where: { userId: request.requesterId },
        data: {
          balance: {
            increment: request.pointsRequested,
          },
        },
      }),
      // Update request status and donor
      prisma.request.update({
        where: { id: requestId },
        data: {
          status: "accepted",
          donorId: user.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

