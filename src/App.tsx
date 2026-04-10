import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { GameState, Player, PlayerColor } from './types';
import { LudoBoard } from './components/LudoBoard';
import { Dice } from './components/Dice';
import { COLOR_MAP, WIN_POSITION } from './constants';
import confetti from 'canvas-confetti';
import { Trophy, Users, Play, LogOut } from 'lucide-react';

const INITIAL_PIECES: Record<string, number> = {
  '0_0': -1, '0_1': -1, '0_2': -1, '0_3': -1,
  '1_0': -1, '1_1': -1, '1_2': -1, '1_3': -1,
  '2_0': -1, '2_1': -1, '2_2': -1, '2_3': -1,
  '3_0': -1, '3_1': -1, '3_2': -1, '3_3': -1,
};

const COLORS: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rolling, setRolling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        signInAnonymously(auth);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const gameRef = doc(db, 'games', 'ludo-main');
    const unsub = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        setGameState(snap.data() as GameState);
      } else {
        // Initialize game if it doesn't exist
        setDoc(gameRef, {
          players: [],
          pieces: INITIAL_PIECES,
          turn: 0,
          diceValue: 1,
          diceRolled: false,
          status: 'waiting',
          winner: null,
          lastMoveAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const joinGame = async () => {
    if (!user || !gameState || gameState.players.length >= 4) return;
    if (gameState.players.find(p => p.uid === user.uid)) return;

    const newPlayer: Player = {
      uid: user.uid,
      name: `Jugador ${gameState.players.length + 1}`,
      color: COLORS[gameState.players.length],
      index: gameState.players.length,
    };

    const gameRef = doc(db, 'games', 'ludo-main');
    await updateDoc(gameRef, {
      players: [...gameState.players, newPlayer],
    });
  };

  const startGame = async () => {
    if (!gameState || gameState.players.length < 2) return;
    const gameRef = doc(db, 'games', 'ludo-main');
    await updateDoc(gameRef, {
      status: 'playing',
      turn: 0,
    });
  };

  const rollDice = async () => {
    if (!gameState || gameState.diceRolled || rolling) return;
    const myPlayer = gameState.players.find(p => p.uid === user?.uid);
    if (!myPlayer || myPlayer.index !== gameState.turn) return;

    setRolling(true);
    setTimeout(async () => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      const gameRef = doc(db, 'games', 'ludo-main');
      
      // Check if player has any valid moves
      const hasMoves = checkHasMoves(gameState.turn, newValue, gameState.pieces);
      
      if (!hasMoves) {
        // Skip turn if no moves
        await updateDoc(gameRef, {
          diceValue: newValue,
          diceRolled: false,
          turn: (gameState.turn + 1) % gameState.players.length,
          lastMoveAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(gameRef, {
          diceValue: newValue,
          diceRolled: true,
        });
      }
      setRolling(false);
    }, 1000);
  };

  const checkHasMoves = (playerIndex: number, diceValue: number, pieces: Record<string, number>) => {
    for (let i = 0; i < 4; i++) {
      const pos = pieces[`${playerIndex}_${i}`];
      if (pos === -1 && diceValue === 6) return true;
      if (pos !== -1 && pos + diceValue <= WIN_POSITION) return true;
    }
    return false;
  };

  const movePiece = async (playerIndex: number, pieceIndex: number) => {
    if (!gameState || !gameState.diceRolled || rolling) return;
    const myPlayer = gameState.players.find(p => p.uid === user?.uid);
    if (!myPlayer || myPlayer.index !== gameState.turn || playerIndex !== myPlayer.index) return;

    const currentPos = gameState.pieces[`${playerIndex}_${pieceIndex}`] as number;
    const diceValue = gameState.diceValue;
    let newPos = currentPos;

    if (currentPos === -1) {
      if (diceValue === 6) newPos = 0;
      else return; // Can't move out without a 6
    } else {
      newPos = currentPos + diceValue;
    }

    if (newPos > WIN_POSITION) return; // Can't overshoot

    const gameRef = doc(db, 'games', 'ludo-main');
    const newPieces = { ...gameState.pieces };
    newPieces[`${playerIndex}_${pieceIndex}`] = newPos;

    // Handle capturing
    let captured = false;
    if (newPos >= 0 && newPos <= 51) {
      // Calculate global position for this player
      const myOffset = [0, 13, 26, 39][playerIndex];
      const myGlobalPos = (newPos + myOffset) % 52;

      // Safe zones (start positions)
      const isSafe = [0, 13, 26, 39].includes(myGlobalPos);

      if (!isSafe) {
        Object.entries(newPieces).forEach(([key, pos]) => {
          const [pIdxStr, pcIdxStr] = key.split('_');
          const pIdx = parseInt(pIdxStr);
          const currentPiecePos = pos as number;
          if (pIdx === playerIndex) return; // Own piece
          if (currentPiecePos === -1 || currentPiecePos > 51) return; // In base or home stretch

          const otherOffset = [0, 13, 26, 39][pIdx];
          const otherGlobalPos = (currentPiecePos + otherOffset) % 52;

          if (myGlobalPos === otherGlobalPos) {
            newPieces[key] = -1; // Send back to base
            captured = true;
          }
        });
      }
    }

    // Check for win
    const playerPieces = [0, 1, 2, 3].map(i => newPieces[`${playerIndex}_${i}`]);
    const hasWon = playerPieces.every(p => p === WIN_POSITION);

    const nextTurn = (diceValue === 6 || captured || (newPos === WIN_POSITION && currentPos !== WIN_POSITION)) 
      ? playerIndex 
      : (playerIndex + 1) % gameState.players.length;

    if (hasWon) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      await updateDoc(gameRef, {
        pieces: newPieces,
        status: 'finished',
        winner: user.uid,
      });
    } else {
      await updateDoc(gameRef, {
        pieces: newPieces,
        diceRolled: false,
        turn: nextTurn,
        lastMoveAt: new Date().toISOString(),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const myPlayer = gameState?.players.find(p => p.uid === user?.uid);
  const isMyTurn = myPlayer && gameState?.turn === myPlayer.index;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Game Info & Players */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h1 className="text-3xl font-black text-gray-800 mb-2 flex items-center gap-2">
              <Play className="text-indigo-600" fill="currentColor" /> LUDO REAL-TIME
            </h1>
            <p className="text-gray-500 text-sm">Los primeros 4 jugadores juegan. ¡Buena suerte!</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Jugadores ({gameState?.players.length}/4)
              </h2>
            </div>
            <div className="space-y-3">
              {gameState?.players.map((p, i) => (
                <div 
                  key={p.uid} 
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all
                    ${gameState.turn === i ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-transparent bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_MAP[p.color] }} />
                    <span className={`font-bold ${p.uid === user?.uid ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {p.name} {p.uid === user?.uid && '(Tú)'}
                    </span>
                  </div>
                  {gameState.turn === i && (
                    <span className="text-xs font-black text-indigo-600 animate-pulse">TURNO</span>
                  )}
                </div>
              ))}
              {gameState?.players.length === 0 && (
                <p className="text-gray-400 text-center py-4 italic">Esperando jugadores...</p>
              )}
            </div>

            {gameState?.status === 'waiting' && !myPlayer && gameState.players.length < 4 && (
              <button
                onClick={joinGame}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
              >
                Unirse a la Partida
              </button>
            )}

            {gameState?.status === 'waiting' && myPlayer && gameState.players.length >= 2 && (
              <button
                onClick={startGame}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
              >
                Comenzar Juego
              </button>
            )}
          </div>

          {gameState?.status === 'playing' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Control de Dado</h3>
              <Dice 
                value={gameState.diceValue} 
                onRoll={rollDice} 
                disabled={!isMyTurn || gameState.diceRolled}
                rolling={rolling}
              />
              {isMyTurn && gameState.diceRolled && (
                <p className="mt-4 text-indigo-600 font-bold animate-bounce">¡Mueve una ficha!</p>
              )}
            </div>
          )}
        </div>

        {/* Center Panel: Board */}
        <div className="lg:col-span-2 flex items-center justify-center">
          {gameState && (
            <LudoBoard 
              gameState={gameState} 
              onPieceClick={movePiece}
              currentPlayerIndex={myPlayer?.index ?? null}
            />
          )}
        </div>
      </div>

      {/* Winner Modal */}
      {gameState?.status === 'finished' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-4xl font-black text-gray-800 mb-2">¡Tenemos un Ganador!</h2>
            <p className="text-xl text-gray-600 mb-8">
              {gameState.players.find(p => p.uid === gameState.winner)?.name} ha ganado la partida.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all"
            >
              Jugar de Nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
