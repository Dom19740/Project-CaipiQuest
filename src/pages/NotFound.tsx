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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-yellow-400 via-orange-500 to-pink-600">
      <div className="text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl border-4 border-lime-600 dark:border-lime-700">
        <h1 className="text-4xl sm:text-5xl mb-4 text-gray-900 dark:text-gray-100">404</h1>
        <p className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-base sm:text-lg">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;