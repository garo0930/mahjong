// pages/games.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export default function Games() {
  const [players, setPlayers] = useState([
    { name: 'あなた', score: '', rank: 1 },
    { name: '友人', score: '', rank: 2 },
  ]);
  const [games, setGames] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const handleInputChange = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index][field] = field === 'rank' ? parseInt(value) : value;
    setPlayers(updatedPlayers);
  };

  const saveGame = async () => {
    const results = players.map((p) => ({
      name: p.name,
      score: p.score === '' ? null : Number(p.score),
      rank: p.rank,
    }));

    await addDoc(collection(db, 'games'), {
      date: Timestamp.fromDate(new Date(date)),
      results,
    });

    setPlayers(players.map((p) => ({ ...p, score: '', rank: 1 })));
    fetchGames(); // 保存後に再取得
  };

  const fetchGames = async () => {
    const q = query(collection(db, 'games'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const gamesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGames(gamesList);
  };

  const handleDelete = async (id) => {
    if (confirm('この記録を削除しますか？')) {
      await deleteDoc(doc(db, 'games', id));
      setGames(games.filter((g) => g.id !== id));
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">成績入力</h1>

      <label className="block mb-2">
        対局日：
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="ml-2 border p-1"
        />
      </label>

      {players.map((player, index) => (
        <div key={index} className="mb-2 flex gap-2 items-center">
          <span>{player.name}：</span>
          <input
            type="number"
            value={player.score}
            onChange={(e) =>
              handleInputChange(index, 'score', e.target.value)
            }
            placeholder="素点"
            className="border p-1 w-24"
          />
          <select
            value={player.rank}
            onChange={(e) =>
              handleInputChange(index, 'rank', e.target.value)
            }
            className="border p-1"
          >
            {[1, 2, 3, 4].map((r) => (
              <option key={r} value={r}>
                {r}位
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={saveGame}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700"
      >
        保存
      </button>

      <h2 className="text-lg font-bold mt-8">記録一覧</h2>

      {games.map((game) => (
        <div key={game.id} className="border p-4 my-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {game.date?.toDate().toLocaleDateString()}
            </p>
            <button
              onClick={() => handleDelete(game.id)}
              className="text-red-600 hover:underline"
            >
              🗑️削除
            </button>
          </div>
          {game.results.map((r, i) => (
            <div key={i} className="pl-4">
              {r.name}：{r.score ?? '—'}点（{r.rank}位）
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
