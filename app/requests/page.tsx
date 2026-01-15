"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Request {
  id: string;
  requesterId: string;
  donorId: string | null;
  location: string;
  pointsRequested: number;
  status: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    name: string | null;
    email: string;
  };
  donor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export default function RequestsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCurrentUser(), fetchRequests()]);
    };
    loadData();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/requests");
      const data = await response.json();

      console.log("Requests API response:", { status: response.status, data });

      if (!response.ok) {
        setError(data.error || "Failed to fetch requests");
        return;
      }

      console.log("Setting requests:", data);
      setRequests(data);
      setError("");
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (processingId) return;

    try {
      setProcessingId(requestId);
      const response = await fetch(`/api/requests/${requestId}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to accept request");
        return;
      }

      // Refresh requests list
      await fetchRequests();
      router.refresh();
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (processingId) return;

    try {
      setProcessingId(requestId);
      const response = await fetch(`/api/requests/${requestId}/decline`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to decline request");
        return;
      }

      // Refresh requests list
      await fetchRequests();
      router.refresh();
    } catch (error) {
      console.error("Error declining request:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-green-600";
      case "declined":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  // Separate user's own requests from others' requests
  const myRequests = currentUserId
    ? requests.filter((req) => req.requesterId === currentUserId)
    : [];
  const otherRequests = currentUserId
    ? requests.filter((req) => req.requesterId !== currentUserId)
    : requests;

  // Debug logging
  console.log("Debug info:", {
    currentUserId,
    requestsCount: requests.length,
    myRequestsCount: myRequests.length,
    otherRequestsCount: otherRequests.length,
  });

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex gap-4">
            <Button onClick={fetchRequests} variant="outline" disabled={isLoading}>
              Refresh
            </Button>
            <Button asChild>
              <Link href="/requests/create">Create Request</Link>
            </Button>
          </div>
        </div>

        <h1 className="mb-6 text-3xl font-bold">All Requests</h1>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading requests...</div>
        ) : (
          <>
            {/* My Requests Section */}
            {myRequests.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold">My Requests</h2>
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{request.location}</CardTitle>
                            <CardDescription>
                              You requested {request.pointsRequested} points
                            </CardDescription>
                          </div>
                          <span
                            className={`text-sm font-medium capitalize ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              {request.pointsRequested} points
                            </p>
                          </div>

                          {request.message && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {request.message}
                              </p>
                            </div>
                          )}

                          {request.status === "accepted" && request.donor && (
                            <p className="text-sm text-muted-foreground">
                              Accepted by {request.donor.name || request.donor.email}
                            </p>
                          )}

                          {request.status === "declined" && request.donor && (
                            <p className="text-sm text-muted-foreground">
                              Declined by {request.donor.name || request.donor.email}
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Created {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Other Requests Section */}
            <div>
              <h2 className="mb-4 text-2xl font-semibold">
                {myRequests.length > 0 ? "Other Requests" : "All Requests"}
              </h2>
              {otherRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No requests available. Be the first to create one!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {otherRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.location}</CardTitle>
                      <CardDescription>
                        Requested by {request.requester.name || request.requester.email}
                      </CardDescription>
                    </div>
                    <span
                      className={`text-sm font-medium capitalize ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {request.pointsRequested} points
                      </p>
                    </div>

                    {request.message && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccept(request.id)}
                          disabled={processingId === request.id}
                          size="sm"
                        >
                          {processingId === request.id ? "Processing..." : "Accept"}
                        </Button>
                        <Button
                          onClick={() => handleDecline(request.id)}
                          disabled={processingId === request.id}
                          variant="outline"
                          size="sm"
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {request.status === "accepted" && request.donor && (
                      <p className="text-sm text-muted-foreground">
                        Accepted by {request.donor.name || request.donor.email}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Created {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

