"use client";

// Importing the RootState type from the store definition
import { RootState } from "@/lib/store";
// Importing the useSelector hook from react-redux to access the Redux store's state
import { useSelector } from "react-redux";

export default function Result() {
  // Using the useSelector hook to extract the counter value from the Redux store's state
  const countState = useSelector((state: RootState) => state.counter.value);

  return (
    <div className="mt-4">
      <h1 className="text-center mb-4 text-gray-700 dark:text-gray-200">
        Component 2
      </h1>

      <div className="bg-yellow-100 dark:bg-yellow-700 flex flex-col items-center border p-10 w-64 rounded-lg border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md">
        <h2 className="text-center py-1 px-4 font-semibold text-gray-700 dark:text-gray-200">
          Result
        </h2>
        <p className="border py-2 px-4 text-gray-700 dark:text-gray-200 font-bold bg-gray-50 dark:bg-gray-800 rounded w-full text-center">
          {countState}
        </p>
      </div>
    </div>
  );
}