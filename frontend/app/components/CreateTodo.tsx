"use client";
import React from "react";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const CreateTodo: React.FC = () => {
  const schema = z.object({
    title: z.string().min(3, { message: "Minimum 3 characters" }),
    description: z.string().min(8, { message: "Minimum 6 characters" }),
    completed: z.boolean(),
  });
  type todoValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<todoValues>({ resolver: zodResolver(schema) });
  return (
    <form
      onSubmit={handleSubmit(() => null)}
      className="flex w-full m-5 justify-center gap-2"
    >
      <div className="flex flex-col relative">
        <input
          id={"title"}
          className={`border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200`}
          {...register("title")}
          placeholder="Enter Description"
        />
        {errors.title?.message && (
          <span className="text-red-500 text-sm mt-1 absolute top-10">
            {errors.title?.message}
          </span>
        )}
      </div>
      <div className="flex flex-col w-4/6 relative">
        <input
          id={"description"}
          className={`border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200`}
          {...register("description")}
          placeholder="Enter Todo"
        />
        {errors.description?.message && (
          <span className="text-red-500 text-sm mt-1 absolute top-10">
            {errors.description?.message}
          </span>
        )}
      </div>
      <Button type="submit">Create</Button>
    </form>
  );
};
