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
import { AlertDialogBox } from "./AlertBox";

const ActionButtons = ({ todo }: { todo: TodoProps }) => {
  const queryClient = useQueryClient();
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
          onClick={async () => {
            const res = await toggleTodo<string>(todo._id, {
              completed: !todo.completed,
            });
            if (res?.status === "success") {
              toastService.show(
                res.message || "Todo updated successfully",
                "success"
              );
              queryClient.invalidateQueries({ queryKey: ["todos"] });
            } else {
              toastService.show(
                res?.message || "Something went wrong",
                "error"
              );
            }
          }}
        >
          <CircleCheck aria-hidden="true" className="text-green-500" />
        </Button>
      ) : (
        <Button
          variant="plane"
          aria-label="Mark todo as complete"
          title="Pending"
          onClick={async () => {
            const res = await toggleTodo<string>(todo._id, {
              completed: !todo.completed,
            });
            if (res?.status === "success") {
              toastService.show(
                res.message || "Todo updated successfully",
                "success"
              );
              queryClient.invalidateQueries({ queryKey: ["todos"] });
            } else {
              toastService.show(
                res?.message || "Something went wrong",
                "error"
              );
            }
          }}
        >
          <ClockArrowUp className="dark:text-white text-gray-500" />
        </Button>
      )}
      <AlertDialogBox
        title={"Are you absolutely sure?"}
        description={
          "This action cannot be undone. This will permanently remove todo from our servers."
        }
        submitHandler={async () => {
          const res = await deleteTodo<string>(todo._id);
          if (res?.status === "success") {
            toastService.show(
              res.message || "Todo deleted successfully",
              "success"
            );
            queryClient.invalidateQueries({ queryKey: ["todos"] });
          } else {
            toastService.show(res?.message || "Something went wrong", "error");
          }
        }}
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
