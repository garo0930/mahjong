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
} from 'firebase/firestore';

export default function Games() {
  const [players, setPlayers] = useState(['あなた', '友人']);
  const [scores, setScores] = useState(['', '']);
  const [ranks, setRanks] = useState([1, 2]);
  const [games, setGames] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // ✅ 保存中フラグ

  const handleSubmit = async () => {
    if (scores.some(score => score === '')) {
      alert('素点をすべて入力してください。');
      return;
    }

    setIsSaving(true); // ✅ 保存中に切り替え

    const results = players.map((name, index) => ({
      name,
      score: parseInt(scores[index]),
      rank: ranks[index],
    }));

    const newGame = {
      date: Timestamp.now(),
      results,
    };

    try {
      await addDoc(collection(db, 'games'), newGame);
      alert('保存しました');
      setGames([{ date: new Date().toLocaleDateString(), results }, ...games]);
      setScores(['', '']);
      setRanks([1, 2]);
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false); // ✅ 保存完了
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      const q = query(collection(db, 'games'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedGames = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date.toDate().toLocaleDateString(),
          results: data.results,
        };
      });
      setGames(fetchedGames);
    };

    fetchGames();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">麻雀成績入力</h1>

      {players.map((name, i) => (
        <div key={i} className="mb-2 flex gap-4 items-center">
          <span className="w-16">{name}</span>
          <input
            type="number"
            className="border p-1 w-24"
            placeholder="素点"
            value={scores[i]}
            onChange={(e) => {
              const newScores = [...scores];
              newScores[i] = e.target.value;
              setScores(newScores);
            }}
          />
          <select
            className="border p-1"
            value={ranks[i]}
            onChange={(e) => {
              const newRanks = [...ranks];
              newRanks[i] = parseInt(e.target.value);
              setRanks(newRanks);
            }}
          >
            {[1, 2, 3, 4].map((r) => (
              <option key={r} value={r}>{r}位</option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className={`px-4 py-2 rounded mt-4 text-white ${
          isSaving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isSaving ? '保存中…' : '保存'}
      </button>

      <hr className="my-6" />
      <h2 className="text-lg font-semibold mb-2">記録一覧</h2>
      {games.map((g, idx) => (
        <div key={idx} className="mb-3 border p-3 rounded">
          <div className="font-semibold mb-1">{g.date}</div>
          {g.results.map((r, i) => (
            <div key={i}>
              {r.name} - 素点: {r.score}点 / 順位: {r.rank}位
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
