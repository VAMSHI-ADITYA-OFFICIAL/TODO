"use client";
import Button from "./Button";
import { CircleCheck, SquareMenu, ClockArrowUp, SquarePen } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TodoProps,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from "../todos/actions";
import { toastService } from "../services/toastServices";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import {
  updateTodoInCache,
  removeTodoFromCache,
  updateCountsInCache,
  withOptimisticUpdate,
} from "../../lib/queryCacheHelpers";
import { AlertDialogBox } from "./AlertBox";
import { Switch } from "@/components/ui/switch";

const ActionButtons = ({
  todo,
  onEdit,
}: {
  todo: TodoProps;
  onEdit: () => void;
}) => {
  const queryClient = useQueryClient();
  const [isToggling, _setIsToggling] = useState(false);

  const handleToggle = withOptimisticUpdate(
    queryClient,
    () => {
      updateTodoInCache(queryClient, todo._id, (t) => ({
        ...t,
        completed: !t.completed,
      }));
      updateCountsInCache(queryClient, (counts) => ({
        count: counts.count,
        completedCount: todo.completed
          ? counts.completedCount - 1
          : counts.completedCount + 1,
      }));
    },
    () => toggleTodo<string>(todo._id, { completed: !todo.completed }),
    (res) => {
      if (res?.status === "success") {
        toastService.show(
          res.message || "Todo updated successfully",
          "success"
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        toastService.show(res?.message || "Something went wrong", "error");
      }
    },
    () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toastService.show("Failed to update todo", "error");
    }
  );

  const handleDelete = withOptimisticUpdate(
    queryClient,
    () => {
      removeTodoFromCache(queryClient, todo._id);
    },
    () => deleteTodo<string>(todo._id),
    (res) => {
      if (res?.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        toastService.show(
          res.message || "Todo deleted successfully",
          "success"
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        toastService.show(res?.message || "Something went wrong", "error");
      }
    },
    () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toastService.show("Failed to delete todo", "error");
    }
  );

  return (
    <>
      <Button
        variant="plane"
        aria-label="Update todo"
        title="Update"
        onClick={onEdit}
      >
        <SquarePen className="dark:text-white text-gray-500" />
      </Button>
      {todo.completed ? (
        <Button
          variant="plane"
          aria-label="Mark todo as pending"
          title="Completed"
          onClick={handleToggle}
          disabled={isToggling}
        >
          <CircleCheck aria-hidden="true" className="text-green-500" />
        </Button>
      ) : (
        <Button
          variant="plane"
          aria-label="Mark todo as complete"
          title="Pending"
          onClick={handleToggle}
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
        submitHandler={handleDelete}
      />
    </>
  );
};

export default function TodoCard({ todo }: { todo: TodoProps }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
  });
  const [isUpdating, _setIsUpdating] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const formattedDate = new Date(todo.createdAt).toDateString();

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
    });
  };

  const handleSaveEdit = withOptimisticUpdate(
    queryClient,
    () => {
      updateTodoInCache(queryClient, todo._id, (t) => ({
        ...t,
        title: editData.title,
        description: editData.description,
        completed: editData.completed,
      }));
    },
    () =>
      updateTodo<string>(todo._id, {
        title: editData.title,
        description: editData.description,
        completed: todo.completed,
      }),
    (res) => {
      if (res?.status === "success") {
        setIsEditing(false);
        toastService.show(
          res.message || "Todo updated successfully",
          "success"
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        toastService.show(res?.message || "Something went wrong", "error");
      }
    },
    () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toastService.show("Failed to update todo", "error");
    }
  );

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-2 flex-1">
        {isEditing ? (
          <div className="flex flex-col gap-2" onKeyDown={handleKeyDown}>
            <input
              ref={titleInputRef}
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="border rounded-xl md:w-1/2 px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
              placeholder="Todo title"
            />
            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
              placeholder="Todo description"
              rows={2}
            />
            <div className="flex gap-2 items-center">
              <div className="flex gap-2 items-center">
                <label htmlFor="complete">Toggle to change todo status</label>
                <Switch
                  name={"complete"}
                  id={"complete"}
                  className="md:top-2.5 md:right-4 right-24 top-18 transition-colors"
                  checked={editData.completed}
                  onCheckedChange={(checked) => {
                    setEditData((prev) => ({
                      ...prev,
                      completed: checked,
                    }));
                  }}
                />
              </div>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="text-sm px-3 py-1"
                variant="primary"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="text-sm px-3 py-1"
                variant="danger"
              >
                Cancel
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Press Ctrl+Enter to save, Esc to cancel
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4 items-center">
              <span
                className={`text-xl ${
                  todo.completed ? "text-green-500 line-through" : ""
                }`}
              >
                {todo.title}
              </span>
              <span className="text-sm opacity-70 text-nowrap">
                {formattedDate}
              </span>
            </div>
            <span
              className={`${todo.completed ? "line-through opacity-60" : ""}`}
            >
              {todo.description}
            </span>
          </>
        )}
      </div>
      {!isEditing && (
        <>
          <div className="md:hidden flex ml-auto">
            <Popover>
              <PopoverTrigger aria-label="More Options">
                <SquareMenu />
              </PopoverTrigger>
              <PopoverContent className="flex flex-col bg-gray-600 w-24 gap-2">
                <ActionButtons todo={todo} onEdit={handleEdit} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="hidden gap-1 md:flex">
            <ActionButtons todo={todo} onEdit={handleEdit} />
          </div>
        </>
      )}
    </div>
  );
}
