// This file handles DELETE requests to remove a request from the database
// The route is: /api/requests/[id] where [id] is the request ID

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// This function handles DELETE HTTP requests
// When a user clicks "Delete" on a request, this function runs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Check if the user is logged in
    // getCurrentUser() gets the logged-in user's information from their session
    const user = await getCurrentUser();

    // If no user is logged in, return an error (401 = Unauthorized)
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Get the request ID from the URL
    // The [id] in the route becomes available in params
    // Example: DELETE /api/requests/abc123 -> requestId = "abc123"
    const { id: requestId } = await params;

    // Step 3: Look up the request in the database
    // findUnique finds one specific request by its ID
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    // If the request doesn't exist, return an error (404 = Not Found)
    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Step 4: Security check - Make sure the user owns this request
    // Only the person who created the request should be able to delete it
    // requesterId is the ID of the user who created the request
    if (request.requesterId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own requests" },
        { status: 403 } // 403 = Forbidden (you're logged in, but not allowed)
      );
    }

    // Step 5: Business logic check - Only allow deleting pending requests
    // We don't want users to delete requests that have already been accepted
    // because points may have already been transferred
    if (request.status !== "pending") {
      return NextResponse.json(
        { error: "You can only delete pending requests" },
        { status: 400 } // 400 = Bad Request (invalid operation)
      );
    }

    // Step 6: Actually delete the request from the database
    // This removes the request record permanently
    await prisma.request.delete({
      where: { id: requestId },
    });

    // Step 7: Return success message to the frontend
    return NextResponse.json({ success: true });
  } catch (error) {
    // If anything goes wrong (database error, etc.), catch it here
    // Log the error for debugging, then return a generic error message
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 } // 500 = Internal Server Error
    );
  }
}
