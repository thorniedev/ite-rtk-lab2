"use client";

// Importing the resetState action creator from the CounterSlice
import { resetState } from "@/lib/features/counter/counterSlice";
import { useDispatch } from "react-redux";

export default function ResetButton() {
  const dispatch = useDispatch();

  return (
    <div>
      <h1 className="text-center mb-4 text-gray-700 dark:text-gray-200">
        Component 3
      </h1>

      <div className="flex flex-col items-center border p-10 rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md">
        <button
          onClick={() => dispatch(resetState())}
          className="w-40 h-10 border rounded bg-red-400 dark:bg-red-600 text-white font-semibold"
        >
          Reset Counter
        </button>
      </div>
    </div>
  );
}