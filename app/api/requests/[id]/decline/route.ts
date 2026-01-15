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
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Validate: Can't decline your own request
    if (request.requesterId === user.id) {
      return NextResponse.json(
        { error: "You cannot decline your own request" },
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

    // Update request status to declined
    await prisma.request.update({
      where: { id: requestId },
      data: {
        status: "declined",
        donorId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

