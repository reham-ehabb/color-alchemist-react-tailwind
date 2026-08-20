import { useState } from 'react';

const PAINTS = [
  { name: 'Red', rgb: [255, 0, 0], swatch: 'bg-red-500' },
  { name: 'Yellow', rgb: [255, 220, 0], swatch: 'bg-yellow-400' },
  { name: 'Blue', rgb: [0, 80, 255], swatch: 'bg-blue-600' },
  { name: 'White', rgb: [255, 255, 255], swatch: 'bg-white border-2 border-gray-300' },
  { name: 'Black', rgb: [0, 0, 0], swatch: 'bg-black' },
];

const DROPS_PER_ROUND = 8;
const TOTAL_ROUNDS = 5;
const MAX_DIST = Math.sqrt(255 ** 2 * 3);

function randomColor() {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
}

function mixOf(drops) {
  if (drops.length === 0) return [255, 255, 255];
  const sum = drops.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0]
  );
  return sum.map((v) => Math.round(v / drops.length));
}

function rgbStr([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

function matchScore(a, b) {
  const dist = Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
  return Math.max(0, Math.round(100 - (dist / MAX_DIST) * 100));
}

export default function App() {
  const [target, setTarget] = useState(randomColor());
  const [drops, setDrops] = useState([]);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResult, setRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const mix = mixOf(drops);
  const dropsLeft = DROPS_PER_ROUND - drops.length;

  function addDrop(rgb) {
    if (dropsLeft <= 0 || roundResult) return;
    setDrops([...drops, rgb]);
  }

  function undoDrop() {
    if (drops.length === 0 || roundResult) return;
    setDrops(drops.slice(0, -1));
  }

  function submitRound() {
    if (roundResult) return;
    const score = matchScore(mix, target);
    setRoundResult(score);
    setTotalScore((s) => s + score);
  }

  function nextRound() {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      return;
    }
    setRound(round + 1);
    setTarget(randomColor());
    setDrops([]);
    setRoundResult(null);
  }

  function restart() {
    setRound(1);
    setTarget(randomColor());
    setDrops([]);
    setTotalScore(0);
    setRoundResult(null);
    setGameOver(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-white">Color Alchemist</h1>

      {gameOver ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-2xl text-gray-100">Final Score</p>
          <p className="text-5xl font-bold text-green-400">
            {totalScore} / {TOTAL_ROUNDS * 100}
          </p>
          <button
            onClick={restart}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Play Again
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-300">
            Round {round} / {TOTAL_ROUNDS} &nbsp;•&nbsp; Score: {totalScore}
          </p>

          <div className="flex gap-8 items-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-300 text-sm">Target</p>
              <div
                className="w-28 h-28 rounded-xl border-4 border-gray-600"
                style={{ backgroundColor: rgbStr(target) }}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-300 text-sm">Your Mix</p>
              <div
                className="w-28 h-28 rounded-xl border-4 border-gray-600"
                style={{ backgroundColor: rgbStr(mix) }}
              />
            </div>
          </div>

          <p className="text-gray-400">Drops left: {dropsLeft}</p>

          <div className="flex gap-3">
            {PAINTS.map((p) => (
              <button
                key={p.name}
                onClick={() => addDrop(p.rgb)}
                disabled={dropsLeft <= 0 || !!roundResult}
                title={p.name}
                className={`w-14 h-14 rounded-full ${p.swatch} hover:scale-110 transition disabled:opacity-30 disabled:hover:scale-100`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={undoDrop}
              disabled={drops.length === 0 || !!roundResult}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-30"
            >
              Undo
            </button>

            {roundResult === null ? (
              <button
                onClick={submitRound}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Submit Mix
              </button>
            ) : (
              <button
                onClick={nextRound}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                {round >= TOTAL_ROUNDS ? 'See Final Score' : 'Next Round'}
              </button>
            )}
          </div>

          {roundResult !== null && (
            <p className="text-xl text-yellow-300 font-semibold">
              Match: {roundResult}%
            </p>
          )}
        </>
      )}
    </div>
  );
}