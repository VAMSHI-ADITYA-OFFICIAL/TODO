"use client";
import React from "react";
import Button from "./Button";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastService } from "../services/toastServices";
import { createTodos } from "../todos/actions";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";

export const CreateTodo: React.FC = () => {
  const queryClient = useQueryClient();
  const schema = z.object({
    title: z.string().min(3, { message: "Minimum 3 characters" }).trim(),
    description: z.string().min(8, { message: "Minimum 8 characters" }).trim(),
    completed: z.boolean(),
  });
  type todoValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<todoValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      completed: false,
    },
  });
  const submitHandler = async (formdata: todoValues) => {
    try {
      const res = await createTodos(formdata);
      if (res?.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        reset();
        toastService.show(res.message || "Created successful!", "success");
      } else {
        toastService.show(res?.message || "Something went wrong", "error");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toastService.show(errorMessage, "error");
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="flex flex-col md:w-[90%] w-7/8 md:flex-row m-5 gap-4 justify-center items-start"
    >
      <div className="flex flex-col md:flex-[1] w-full relative">
        <input
          id="title"
          className="border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
          {...register("title")}
          placeholder="Enter title"
        />
        {errors.title?.message && (
          <span className="text-red-500 text-sm mt-1">
            {errors.title?.message}
          </span>
        )}
      </div>

      <div className="flex relative md:flex-[2] w-full">
        <div className="flex flex-col w-full  relative">
          <input
            id="description"
            className="border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
            {...register("description")}
            placeholder="Enter description"
          />
          {errors.description?.message && (
            <span className="text-red-500 text-sm mt-1">
              {errors.description?.message}
            </span>
          )}
        </div>
        <label htmlFor="completed" className="hidden">
          Completed
        </label>
        <Controller
          name="completed"
          control={control}
          render={({ field }) => (
            <Switch
              name={field.name}
              id={field.name}
              className="absolute md:top-2.5 md:right-4 right-24 top-18 transition-colors"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <Button type="submit" className="h-11 ml-auto">
        Create
      </Button>
    </form>
  );
};
