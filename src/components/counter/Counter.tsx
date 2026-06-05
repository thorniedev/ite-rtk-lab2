"use client";

// Importing decrement and increment action creators from the CounterSlice
import {
  decrement,
  increment,
} from "@/lib/features/counter/counterSlice";
import { RootState } from "@/lib/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Counter() {

  const dispatch = useDispatch();

  const [val, setVal] = useState<number>(1);
  const countState = useSelector((state: RootState) => state.counter.value);

  return (
    <div className="flex gap-8 items-center">
      {/* Counter Display */}
      <div>
        <div className="flex flex-col items-center border p-10 rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md">
          <h2 className="text-center py-1 px-4 font-semibold text-gray-700 dark:text-gray-200">
            Counter Value
          </h2>
          <div className="flex gap-4 justify-center items-center mt-4">
            <button
              onClick={() => dispatch(decrement(val))}
              className="w-10 h-10 border rounded bg-green-400 dark:bg-green-600 text-white font-bold"
            >
              -
            </button>
            <h2 className="border rounded h-10 text-center py-1 px-4 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700">
              {countState}
            </h2>
            <button
              onClick={() => dispatch(increment(val))}
              className="w-10 h-10 border rounded bg-green-400 dark:bg-green-600 text-white font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Increment Selector */}
      <div>
        <div className="flex flex-col items-center border p-10 rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md">
          <h2 className="text-center py-1 px-4 font-semibold text-gray-700 dark:text-gray-200">
            Increment by
          </h2>
          <div className="flex gap-4 justify-center items-center mt-4">
            <button
              onClick={() => setVal(val - 1)}
              className="w-10 h-10 border rounded bg-cyan-400 dark:bg-cyan-600 text-white font-bold"
            >
              -
            </button>
            <h2 className="border rounded h-10 text-center py-1 px-4 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700">
              {val}
            </h2>
            <button
              onClick={() => setVal(val + 1)}
              className="w-10 h-10 border rounded bg-cyan-400 dark:bg-cyan-600 text-white font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}