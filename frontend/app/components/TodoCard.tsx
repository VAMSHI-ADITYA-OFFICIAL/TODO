"use client";
import Button from "./Button";
import {
  Trash2,
  CircleCheck,
  SquareMenu,
  ClockArrowUp,
  SquarePen,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TodoProps } from "../todos/actions";
import { AlertDialogBox } from "./AlertBox";

const ActionButtons = ({ todo }: { todo: TodoProps }) => {
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
        >
          <CircleCheck aria-hidden="true" className="text-green-500" />
        </Button>
      ) : (
        <Button
          variant="plane"
          aria-label="Mark todo as complete"
          title="Pending"
        >
          <ClockArrowUp className="dark:text-white text-gray-500" />
        </Button>
      )}
      <AlertDialogBox
        title={"Are you absolutely sure?"}
        description={
          "This action cannot be undone. This will permanently remove todo from our servers."
        }
        submitHandler={() => null}
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
          <span className=" text-xl">{todo.title}</span>
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
