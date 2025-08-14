import { useState, useEffect } from 'react';

const ROWS = 20;
const COLS = 10;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ]
};

const COLORS = [
  '#00f0f0',
  '#0000f0',
  '#f0a000',
  '#f0f000',
  '#00f000',
  '#a000f0',
  '#f00000'
];

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(''));

const randomPiece = () => {
  const types = Object.keys(SHAPES);
  const index = Math.floor(Math.random() * types.length);
  return { shape: SHAPES[types[index]], color: COLORS[index] };
};

export default function Tetris() {
  const [board, setBoard] = useState(createBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [pos, setPos] = useState({ x: Math.floor(COLS / 2) - 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);

  const collide = (p, position, brd) => {
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < p.shape[y].length; x++) {
        if (p.shape[y][x]) {
          const newY = y + position.y;
          const newX = x + position.x;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (brd[newY][newX]) return true;
        }
      }
    }
    return false;
  };

  const merge = (p, position, brd) => {
    const newBoard = brd.map(row => row.slice());
    p.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) newBoard[y + position.y][x + position.x] = p.color;
      });
    });
    return newBoard;
  };

  const sweep = brd => {
    const newBoard = [];
    for (let y = 0; y < brd.length; y++) {
      if (brd[y].every(cell => cell)) {
        newBoard.unshift(Array(COLS).fill(''));
      } else {
        newBoard.push(brd[y]);
      }
    }
    return newBoard;
  };

  const drop = () => {
    const newPos = { x: pos.x, y: pos.y + 1 };
    if (!collide(piece, newPos, board)) {
      setPos(newPos);
    } else {
      const merged = merge(piece, pos, board);
      const swept = sweep(merged);
      const newPiece = randomPiece();
      const startPos = { x: Math.floor(COLS / 2) - 1, y: 0 };
      if (collide(newPiece, startPos, swept)) {
        setGameOver(true);
      } else {
        setBoard(swept);
        setPiece(newPiece);
        setPos(startPos);
      }
    }
  };

  const move = dir => {
    const newPos = { x: pos.x + dir, y: pos.y };
    if (!collide(piece, newPos, board)) setPos(newPos);
  };

  const rotate = () => {
    const rotated = {
      ...piece,
      shape: piece.shape[0].map((_, idx) => piece.shape.map(row => row[idx]).reverse())
    };
    if (!collide(rotated, pos, board)) setPiece(rotated);
  };

  const handleKey = e => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowDown') drop();
    if (e.key === 'ArrowUp') rotate();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(drop, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div>
      {gameOver && <h2>Game Over</h2>}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${ROWS}, 20px)`,
          gridTemplateColumns: `repeat(${COLS}, 20px)`,
          gap: 1,
          background: '#333',
          width: COLS * 21
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => {
            let color = cell;
            const relY = y - pos.y;
            const relX = x - pos.x;
            if (!color && piece.shape[relY] && piece.shape[relY][relX]) {
              color = piece.color;
            }
            return (
              <div
                key={`${y}-${x}`}
                style={{ width: 20, height: 20, background: color || '#000' }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
