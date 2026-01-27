"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Check, Plus, Loader2 } from "lucide-react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(user.phone || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePhoneSubmit = async () => {
        setIsSubmitting(true);
        // Logic to save to your Prisma database would go here
        // e.g., await fetch('/api/user/update', { method: 'POST', body: JSON.stringify({ phone: phoneNumber }) })
        setIsSubmitting(false);
        setIsEditingPhone(false);
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-auto min-w-50 max-w-80 p-4" align="end">
  <div className="space-y-3">
    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
      Account Details
    </h2>
    
    <div className="space-y-2">
      {/* Name */}
      <div className="flex items-center text-sm gap-1.5">
        <span className="font-medium text-muted-foreground whitespace-nowrap">Name:</span>
        <span className="text-muted-foreground">
          {user.name || "N/A"}
        </span>
      </div>

      {/* Email */}
      <div className="flex items-center text-sm gap-1.5">
        <span className="font-medium text-muted-foreground whitespace-nowrap">Email:</span>
        <span className="text-muted-foreground">
          {user.email}
        </span>
      </div>

      {/* Phone */}
        <div className="flex items-center text-sm gap-1.5">
            <span className="font-medium text-muted-foreground">Phone:</span>
            {isEditingPhone ? (
            <div className="flex items-center gap-1">
                <Input 
                className="h-7 w-32 text-xs" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone"
                autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handlePhoneSubmit}>
                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-green-600" />}
                </Button>
            </div>
            ) : (
            <button 
                onClick={() => setIsEditingPhone(true)}
                className="text-blue-600 hover:underline text-xs flex items-center gap-1"
            >
                {phoneNumber ? phoneNumber : (
                <><Plus className="h-3 w-3" /> Add phone number</>
                )}
            </button>
            )}
        </div>
        </div>
    </div>

  <DropdownMenuSeparator className="my-4" />

  <DropdownMenuItem
    className="text-red-600 cursor-pointer focus:text-red-600"
    onClick={() => signOut({ callbackUrl: "/auth/login" })}
  >
    Sign out
  </DropdownMenuItem>
</DropdownMenuContent>
    </DropdownMenu>
  );
}