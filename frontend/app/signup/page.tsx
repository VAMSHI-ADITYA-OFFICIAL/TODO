"use client";
import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Logo from "../components/BigLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toastService } from "../services/toastServices";
import { signupUser } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const schema = z
    .object({
      name: z
        .string()
        .min(3, { message: "Name should be at least 3 characters" }),
      email: z.string().email({ message: "Invalid email address" }).trim(),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .trim(),
      confirmPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .trim(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // field where the error should appear
    });

  type FormValues = z.infer<typeof schema>;

  const submitHandler = async (formdata: FormValues) => {
    const res = await signupUser(formdata);
    if (res.error) {
      toastService.show(res.error, "error");
    } else {
      const { result } = res.result;
      router.push("/login");
      toastService.show("Signup successful!", "success");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
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
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col gap-4 text-white"
          >
            <Input label="Name" type="string" {...register("name")} />
            <Input label="Email" {...register("email")} type="email" />
            <Input label="Password" {...register("password")} type="password" />
            <Input
              label="Confirm Password"
              {...register("confirmPassword")}
              type="password"
            />
            <Button variant="primary" className="h-11" type="submit">
              Submit
            </Button>
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
