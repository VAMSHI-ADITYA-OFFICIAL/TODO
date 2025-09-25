"use client";
import Button from "./Button";
import { CircleCheck, SquareMenu, ClockArrowUp, SquarePen } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TodoProps, deleteTodo, toggleTodo } from "../todos/actions";
import { toastService } from "../services/toastServices";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertDialogBox } from "./AlertBox";

const ActionButtons = ({ todo }: { todo: TodoProps }) => {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const optimisticToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);

    // Optimistic update
    queryClient.setQueryData(["todos"], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          result: page.result.map((t: TodoProps) =>
            t._id === todo._id ? { ...t, completed: !t.completed } : t
          ),
        })),
      };
    });

    try {
      const res = await toggleTodo<string>(todo._id, {
        completed: !todo.completed,
      });
      if (res?.status === "success") {
        toastService.show(
          res.message || "Todo updated successfully",
          "success"
        );
      } else {
        // Rollback on error
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        toastService.show(res?.message || "Something went wrong", "error");
      }
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toastService.show("Failed to update todo", "error");
    } finally {
      setIsToggling(false);
    }
  };

  const optimisticDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    // Store original data for rollback
    const previousData = queryClient.getQueryData(["todos"]);

    // Optimistic update - remove the todo
    queryClient.setQueryData(["todos"], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          result: page.result.filter((t: TodoProps) => t._id !== todo._id),
        })),
      };
    });

    try {
      const res = await deleteTodo<string>(todo._id);
      if (res?.status === "success") {
        toastService.show(
          res.message || "Todo deleted successfully",
          "success"
        );
      } else {
        // Rollback on error
        queryClient.setQueryData(["todos"], previousData);
        toastService.show(res?.message || "Something went wrong", "error");
      }
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(["todos"], previousData);
      toastService.show("Failed to delete todo", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="plane" aria-label="Update todo" title="Update">
        <SquarePen className="dark:text-white text-gray-500" />
      </Button>
      {todo.completed ? (
        <Button
          variant="plane"
          aria-label="Mark todo as pending"
          title="Completed"
          onClick={optimisticToggle}
          disabled={isToggling}
        >
          <CircleCheck aria-hidden="true" className="text-green-500" />
        </Button>
      ) : (
        <Button
          variant="plane"
          aria-label="Mark todo as complete"
          title="Pending"
          onClick={optimisticToggle}
          disabled={isToggling}
        >
          <ClockArrowUp className="dark:text-white text-gray-500" />
        </Button>
      )}
      <AlertDialogBox
        title={"Are you absolutely sure?"}
        description={
          "This action cannot be undone. This will permanently remove todo from our servers."
        }
        submitHandler={optimisticDelete}
      />
    </>
  );
};

export default function TodoCard({ todo }: { todo: TodoProps }) {
  const formattedDate = new Date(todo.createdAt).toDateString();
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-2">
        <div className="flex gap-4 items-center">
          <span
            className={` text-xl ${todo.completed ? "text-green-500" : null}`}
          >
            {todo.title}
          </span>
          <span className=" text-sm opacity-70 text-nowrap">
            {formattedDate}
          </span>
        </div>
        <span className="">{todo.description}</span>
      </div>
      <div className="md:hidden flex ml-auto">
        <Popover>
          <PopoverTrigger aria-label="More Options">
            <SquareMenu />
          </PopoverTrigger>
          <PopoverContent className="flex flex-col bg-gray-600 w-24 gap-2">
            <ActionButtons todo={todo} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="hidden gap-1 md:flex">
        <ActionButtons todo={todo} />
      </div>
    </div>
  );
}
