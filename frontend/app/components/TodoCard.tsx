import Button from "./Button";
import { Trash2, CircleCheck, SquareMenu } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TodoProps } from "../todos/actions";

const ActionButtons = ({ todo }: { todo: TodoProps }) => {
  return (
    <>
      <Button variant="plane" aria-label="Delete todo" title="Delete">
        <Trash2 aria-hidden="true" className="text-red-500" />
      </Button>

      {!todo.completed && (
        <Button
          variant="plane"
          aria-label="Mark todo as complete"
          title="Complete"
        >
          <CircleCheck aria-hidden="true" className="text-green-500" />
        </Button>
      )}
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
