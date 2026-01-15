"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function UpdatePointsForm({ currentBalance }: { currentBalance: number }) {
  const router = useRouter();
  const [balance, setBalance] = useState(currentBalance.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const points = parseInt(balance, 10);

      if (isNaN(points) || points < 0) {
        setError("Balance must be a non-negative number");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ balance: points }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update balance");
        setIsLoading(false);
        return;
      }

      // Refresh the page to show updated balance
      router.refresh();
    } catch (error) {
      console.error("Error updating points:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="balance">Update Balance</Label>
        <div className="flex gap-2">
          <Input
            id="balance"
            type="number"
            min="0"
            step="1"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Enter new balance"
            required
          />
          <Button type="submit" disabled={isLoading} size="default">
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </form>
  );
}

