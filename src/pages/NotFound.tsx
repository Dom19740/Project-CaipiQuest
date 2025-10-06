import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100">404</h1>
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline text-base sm:text-lg">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;