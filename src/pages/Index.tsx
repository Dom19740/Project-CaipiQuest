import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 via-yellow-400 via-orange-500 to-pink-600 p-4 sm:p-6 md:p-8">
      <div className="text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl border-4 border-lime-600 dark:border-lime-700 transform hover:scale-102 transition-transform duration-300 ease-in-out max-w-3xl w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-800 to-emerald-900 mb-6 drop-shadow-lg pb-2">
          Welcome to CaipiQuest Bingo!
        </h1>
        <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-8 max-w-prose mx-auto leading-relaxed">
          Pick your favorite fruits to play.
          <br /><br />
          Each time you drink a fresh Caipi using a combo of your fruits - mark your card.
          <br /><br />
          First person to get a line, diagonal or the entire card wins. Play for fun, points, bragging rights, or more Caipis!
        </p>
        <img
          src="/welcome_grid.jpg"
          alt="CaipiQuest Bingo Grid Example"
          className="mx-auto my-8 max-w-full h-auto rounded-lg shadow-lg border-2 border-lime-500 dark:border-lime-800"
        />
        <Link to="/lobby">
          <Button className="w-full sm:w-auto px-10 py-5 text-lg bg-lime-700 hover:bg-lime-800 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 h-14">
            Play CaipiQuest
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;