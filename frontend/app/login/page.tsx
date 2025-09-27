"use client";
import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Logo from "../components/BigLogo";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toastService } from "../services/toastServices";
import { useAuth } from "../context/authContext";
import { loginUser } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const { setUserDetails } = useAuth();
  const schema = z.object({
    email: z.email("Invalid email address").trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .trim(),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submitHandler = async (formdata: FormValues) => {
    const res = await loginUser(formdata);
    if (res.error) {
      toastService.show(res.error, "error");
    } else {
      const { result } = res.result;
      localStorage.setItem("userInfo", JSON.stringify(result));
      setUserDetails(res.result);
      router.push("/todos");
      toastService.show("Login successful!", "success");
    }
  };

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
            Login
          </h1>
          <form
            className="flex flex-col gap-4 text-white"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
            <Button className="py-2" type="submit">
              Submit
            </Button>
          </form>
          <div className="m-2 flex justify-center">
            <Link href={"/signup"}>Signup</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
