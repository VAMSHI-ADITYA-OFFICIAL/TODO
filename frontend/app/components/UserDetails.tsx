"use client";

import React, { useEffect, useState } from "react";
import { UserProps } from "../context/authContext";
import { CircleUser } from "lucide-react";

export default function UserDetails() {
  const [userDetails, setUserDetails] = useState<UserProps | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      setUserDetails(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="md:flex gap-2 hidden">
      <CircleUser />
      {userDetails?.name}
    </div>
  );
}
