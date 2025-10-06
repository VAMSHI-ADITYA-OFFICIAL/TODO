"use client";

import React from "react";
import { CircleUser } from "lucide-react";
import { UserProps } from "../context/authContext";

export default function UserDetails({
  userDetails,
}: {
  userDetails: UserProps | null;
}) {
  return (
    <div className="md:flex gap-2 hidden">
      <CircleUser />
      {userDetails?.name}
    </div>
  );
}
