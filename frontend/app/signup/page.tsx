"use client";
import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Logo from "../components/BigLogo";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex w-full items-center h-screen gap-4 md:flex-row flex-col">
      <div
        className="flex w-1/3 gap-2 justify-center transition-transform duration-500 ease-in-out
         rotate-0 md:rotate-[-45deg] md:mb-28 mt-5"
      >
        <Logo />
      </div>
      <div className="flex md:w-2/3 flex-col items-center h-screen md:mt-[20rem] mt-9 p-10">
        <div className=" bg-gray-900 p-12 rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300 hover:-translate-y-2">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">
            Signup
          </h1>
          <form className="flex flex-col gap-4 text-white">
            <Input label="Email" name="email" type="email" />
            <Input label="Password" name="password" type="password" />
            <Input label="Confirm Password" name="password" type="password" />
            <Button type="submit">Submit</Button>
          </form>
          <div className="m-2 flex items-center">
            <span className="text-xs mr-6">Already have an account?</span>
            <Link href={"/login"}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
