import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-2xl border-4 border-lime-300">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-6 drop-shadow-lg">
          Welcome to CaipiQuest!
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-prose mx-auto">
          Embark on a fruity bingo adventure. Click the button below to start your quest!
        </p>
        <Link to="/caipiquest">
          <Button className="px-8 py-4 text-lg bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Start CaipiQuest
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;