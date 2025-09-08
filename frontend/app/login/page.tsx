"use client";
import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";

export default function LoginPage() {
  return (
    <div className="flex w-full items-center h-screen gap-4">
      <div className="flex w-1/3 gap-2 -rotate-45">
        <svg
          width="128"
          height="128"
          viewBox="0 0 24 24"
          fill="none"
          className="mr-2"
        >
          <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
          <path
            d="M8 12l2 2 4-4"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-9xl font-bold text-blue-600 dark:text-blue-400">
          TODO
        </span>
      </div>
      <div className="flex w-2/3 flex-col items-center h-screen justify-center gap-4">
        <h1>Login/Signup</h1>
        <form className="flex flex-col gap-4 w-1/2">
          <Input label="Email" name="email" type="email" />
          <Input label="password" name="password" type={"password"} />
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </div>
  );
}
