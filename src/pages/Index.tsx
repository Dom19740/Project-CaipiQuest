import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400 p-4">
      <div className="text-center bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border-4 border-lime-400 transform hover:scale-102 transition-transform duration-300 ease-in-out">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-6 drop-shadow-lg pb-2">
          Welcome to CaipiQuest Bingo!
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-prose mx-auto">
          Every time you drink a fresh Caipi using a combination of the ingredients on your bingo card, mark the square. First person to get a column, diaganol or the entire card wins. Play for fun, points, bragging rights, or more Caipis!
        </p>
        <Link to="/lobby">
          <Button className="px-8 py-4 text-lg bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Play CaipiQuest
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;