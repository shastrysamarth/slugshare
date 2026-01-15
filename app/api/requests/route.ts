import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all requests with requester info
    const requests = await prisma.request.findMany({
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Fetched ${requests.length} requests from database`);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
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
    const { location, pointsRequested, message } = body;

    // Validate input
    if (!location || typeof location !== "string" || location.trim().length === 0) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    if (
      typeof pointsRequested !== "number" ||
      pointsRequested <= 0 ||
      !Number.isInteger(pointsRequested)
    ) {
      return NextResponse.json(
        { error: "Points requested must be a positive integer" },
        { status: 400 }
      );
    }

    // Create request
    const newRequest = await prisma.request.create({
      data: {
        requesterId: user.id,
        location: location.trim(),
        pointsRequested,
        message: message?.trim() || null,
        status: "pending",
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

