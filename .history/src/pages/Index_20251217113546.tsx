import React from "react";
import MadeWithDyad from "@/components/made-with-dyad"; // Changed to default import
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 via-yellow-400 via-orange-500 to-pink-600 p-4 sm:p-6 md:p-8">
      <div className="text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl border-4 border-lime-600 dark:border-lime-700 transform hover:scale-102 transition-transform duration-300 ease-in-out max-w-3xl w-full">
        <img
          src="/title_caipiquest_welcome.png"
          alt="Welcome to CaipiQuest Bingo!"
          className="mx-auto max-w-full h-auto w-80 sm:w-96 md:w-[400px] lg:w-[450px] xl:w-[500px] drop-shadow-lg mb-6"
        />
        <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-8 max-w-prose mx-auto leading-relaxed">
          Explore hundreds of delicious fruit combinations in this social, flavor-testing bingo game. 
          <br /><br />
          Pick your favorite fruits to play.
          <br /><br />
          Each time you drink a new combo of your fruits - mark your card.
          <br /><br />
          First person to get a line, diagonal or the entire card wins. Play for fun, points or bragging rights among your friends!
        </p>
        <img
          src="/welcome_grid.gif"
          alt="CaipiQuest Bingo Grid Example"
          className="mx-auto my-8 max-w-full h-auto rounded-lg shadow-lg border-2 border-lime-500 dark:border-lime-800"
        />
        <Link to="/lobby">
          <Button className="w-full sm:w-auto px-10 py-5 text-lg bg-caipi hover:bg-caipi-hover text-white rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 h-14">
            Play CaipiQuest
          </Button>
        </Link>
                <p className="text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-8 max-w-prose mx-auto leading-relaxed">
          Explore hundreds of delicious fruit combinations in this social, flavor-testing bingo game. 
          <br /><br />
          Pick your favorite fruits to play.
          <br /><br />
          Each time you drink a new combo of your fruits - mark your card.
          <br /><br />
          First person to get a line, diagonal or the entire card wins. Play for fun, points or bragging rights among your friends!
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;