import { useEffect, useMemo, useState, useRef } from 'react';
import './App.css';
import Confetti from 'react-confetti';

// List of card colors
const colourlist = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Pink'];

function App() {
  const [cards, setCards] = useState([]);
  const [score, setScore] = useState(0);
  const [hintCounter, setHintCounter] = useState(3);
  const [moves, setMoves] = useState(0);
  const timeout = useRef(null);

  // Function to start the game
  const startGame = () => {
    const duplicateCardList = colourlist.concat(colourlist); // Duplicate list for matching
    const newGameList = [];
    while (newGameList.length < colourlist.length * 2) {
      const randomIndex = Math.floor(Math.random() * duplicateCardList.length);
      newGameList.push({
        colourCard: duplicateCardList[randomIndex],
        flipped: false,
        solved: false,
        position: newGameList.length,
      });
      duplicateCardList.splice(randomIndex, 1);
    }
    setCards(newGameList);
  };

  useEffect(() => {
    startGame();
  }, []);

  // Handle flipping the card
  const handleActiveCard = (card) => {
    const newCards = cards.map((carddata) => {
      if (carddata.position === card.position) {
        carddata.flipped = !carddata.flipped;
      }
      return carddata;
    });
    setCards(newCards);
    setMoves((prevMoves) => prevMoves + 1);
  };

  // Core game logic
  const gameLogic = () => {
    const flippedCards = cards.filter((data) => data.flipped && !data.solved);
    if (flippedCards.length === 2) {
      timeout.current = setTimeout(() => {
        setCards((prevCards) =>
          prevCards.map((card) => {
            if (
              card.position === flippedCards[0].position ||
              card.position === flippedCards[1].position
            ) {
              if (flippedCards[0].colourCard === flippedCards[1].colourCard) {
                card.solved = true;
                setScore((prevScore) => prevScore + 10);
              } else {
                card.flipped = false;
                if (score > 0) {
                  setScore((prevScore) => prevScore - 10);
                }
              }
            }
            return card;
          })
        );
      }, 800);
    }
  };

  useEffect(() => {
    gameLogic();
    return () => clearTimeout(timeout.current);
  }, [cards]);

  // Handle hint button
  const handleHint = (data) => {
    if (hintCounter > 0) {
      const unFlippedCards = data.filter((data) => !data.flipped && !data.solved);
      if (unFlippedCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * unFlippedCards.length);
        const cardToReveal = unFlippedCards[randomIndex];
        const newPieces = [...cards];
        newPieces[cardToReveal.position].flipped = true;
        setCards(newPieces);
        setHintCounter((prevHintCounter) => prevHintCounter - 1);
      }
    }
  };

  // Check if the game is completed
  const isGameCompleted = useMemo(() => {
    if (cards.length > 0 && cards.every((card) => card.solved)) {
      return true;
    }
    return false;
  }, [cards]);

  // Determine text color based on the card background
  const getTextColor = (backgroundColor) => {
    const lightColors = ['yellow', 'pink', 'orange']; // Colors requiring dark text
    return lightColors.includes(backgroundColor.toLowerCase()) ? '#000' : '#fff';
  };

  return (
    <main>
      <h1>Memory Game</h1>
      <div className="scorecontent">
        <h2>Score: {score}</h2>
        <button
          className="hint-button"
          onClick={() => handleHint(cards)}
          disabled={hintCounter === 0}
        >
          Hint
        </button>
      </div>
      <div className="container">
        {cards.map((card, index) => (
          <div
            className={`flip-card ${card.flipped ? 'active' : ''}`}
            key={index}
            onClick={() => handleActiveCard(card)}
          >
            <div className="flip-card-inner">
              <div className="flip-card-front"></div>
              <div
                className="flip-card-back"
                style={{
                  backgroundColor: card.colourCard,
                  color: getTextColor(card.colourCard),
                }}
              >
                {card.colourCard}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hint-counter">Hints Remaining: {hintCounter}</div>
      {isGameCompleted && (
        <div className="gamecompleted">
          {score > 45 ? (
            <>
              <h1>
                YOU WIN!! <br />
                Your Score is {score} <br />
                No. of Moves: {moves}
              </h1>
              <Confetti width={window.innerWidth} height={window.innerHeight} />
            </>
          ) : (
            <>
              <h1>
                OOPS...YOU LOSE!!! <br />
                Your Score is {score} <br />
                No. of Moves: {moves}
              </h1>
            </>
          )}
        </div>
      )}
    </main>
  );
}

export default App;
