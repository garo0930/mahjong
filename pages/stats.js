// pages/stats.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

export default function Stats() {
  const [games, setGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return today;
  });

  useEffect(() => {
    const fetchGames = async () => {
      const q = query(collection(db, 'games'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedGames = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date.toDate(),
          results: data.results,
        };
      });
      setGames(fetchedGames);
    };

    fetchGames();
  }, []);

  const filteredGames = games.filter(g => {
    const gameDate = g.date;
    const gameDateStr = `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, '0')}-${String(gameDate.getDate()).padStart(2, '0')}`;
    return gameDateStr === selectedDate;
  });

  const statsMap = {};

  filteredGames.forEach(g => {
    g.results.forEach(r => {
      const point = 5 - r.rank;
      if (!statsMap[r.name]) {
        statsMap[r.name] = {
          totalScore: 0,
          totalRank: 0,
          totalPoint: 0,
          count: 0,
          rankCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
        };
      }
      statsMap[r.name].totalScore += r.score;
      statsMap[r.name].totalRank += r.rank;
      statsMap[r.name].totalPoint += point;
      statsMap[r.name].count += 1;
      statsMap[r.name].rankCounts[r.rank] += 1;
    });
  });

  const stats = Object.entries(statsMap).map(([name, data]) => ({
    name,
    avgScore: (data.totalScore / data.count).toFixed(1),
    avgRank: (data.totalRank / data.count).toFixed(2),
    totalPoint: data.totalPoint,
    count: data.count,
    ranks: data.rankCounts,
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">統計ページ</h1>

      <label className="block mb-2">
        対象日を選択：
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border p-1 ml-2"
        />
      </label>

      <hr className="my-4" />

      {stats.length === 0 ? (
        <p>該当日のデータはありません。</p>
      ) : (
        <table className="w-full border mt-4 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">プレイヤー</th>
              <th className="border px-2 py-1 text-right">平均素点</th>
              <th className="border px-2 py-1 text-right">平均順位</th>
              <th className="border px-2 py-1 text-right">合計順位点</th>
              <th className="border px-2 py-1 text-right">対局数</th>
              <th className="border px-2 py-1 text-right">1位</th>
              <th className="border px-2 py-1 text-right">2位</th>
              <th className="border px-2 py-1 text-right">3位</th>
              <th className="border px-2 py-1 text-right">4位</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{s.name}</td>
                <td className="border px-2 py-1 text-right">{s.avgScore}</td>
                <td className="border px-2 py-1 text-right">{s.avgRank}</td>
                <td className="border px-2 py-1 text-right">{s.totalPoint}</td>
                <td className="border px-2 py-1 text-right">{s.count}</td>
                <td className="border px-2 py-1 text-right">{s.ranks[1]}</td>
                <td className="border px-2 py-1 text-right">{s.ranks[2]}</td>
                <td className="border px-2 py-1 text-right">{s.ranks[3]}</td>
                <td className="border px-2 py-1 text-right">{s.ranks[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
