"use client";
import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center h-screen justify-center gap-4">
      <h1>Login/Signup</h1>
      <form className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" />
        <Input label="password" name="password" type={"password"} />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
