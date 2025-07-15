import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function StatsPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'games'));
      const data = querySnapshot.docs.map(doc => doc.data());
      setGames(data);
    };
    fetchData();
  }, []);

  const filterGamesByDate = (dateStr) => {
    return games.filter(game => game.date === dateStr);
  };

  const calculateStats = (data) => {
    const stats = {};
    data.forEach(game => {
      Object.entries(game.scores).forEach(([player, scoreInfo]) => {
        const { score = 0, rank } = scoreInfo;
        if (!stats[player]) {
          stats[player] = {
            totalScore: 0,
            totalRank: 0,
            count: 0,
            rankCounts: [0, 0, 0, 0],
          };
        }
        stats[player].totalScore += Number(score);
        stats[player].totalRank += Number(rank);
        stats[player].count += 1;
        if (rank >= 1 && rank <= 4) {
          stats[player].rankCounts[rank - 1]++;
        }
      });
    });

    return Object.entries(stats).map(([player, { totalScore, totalRank, count, rankCounts }]) => ({
      player,
      avgScore: (totalScore / count).toFixed(1),
      avgRank: (totalRank / count).toFixed(2),
      totalRankPoint: totalRank,
      count,
      rankCounts,
    }));
  };

  const dailyStats = calculateStats(filterGamesByDate(selectedDate));
  const overallStats = calculateStats(games);

  const renderTable = (title, stats) => (
    <>
      <h2 className="text-xl font-bold mt-8 mb-2">{title}</h2>
      {stats.length === 0 ? (
        <p>該当するデータはありません。</p>
      ) : (
        <table className="table-auto border border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">プレイヤー</th>
              <th className="border px-4 py-2">平均素点</th>
              <th className="border px-4 py-2">平均順位</th>
              <th className="border px-4 py-2">合計順位点</th>
              <th className="border px-4 py-2">対局数</th>
              <th className="border px-4 py-2">1位</th>
              <th className="border px-4 py-2">2位</th>
              <th className="border px-4 py-2">3位</th>
              <th className="border px-4 py-2">4位</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(stat => (
              <tr key={stat.player}>
                <td className="border px-4 py-2">{stat.player}</td>
                <td className="border px-4 py-2">{stat.avgScore}</td>
                <td className="border px-4 py-2">{stat.avgRank}</td>
                <td className="border px-4 py-2">{stat.totalRankPoint}</td>
                <td className="border px-4 py-2">{stat.count}</td>
                <td className="border px-4 py-2">{stat.rankCounts[0]}</td>
                <td className="border px-4 py-2">{stat.rankCounts[1]}</td>
                <td className="border px-4 py-2">{stat.rankCounts[2]}</td>
                <td className="border px-4 py-2">{stat.rankCounts[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">統計ページ</h1>

      <label className="block mb-2">
        対象日を選択：
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="ml-2 p-1 border rounded"
        />
      </label>

      <hr className="my-4" />

      {renderTable(`${selectedDate} の統計`, dailyStats)}

      <hr className="my-6 border-black" />

      {renderTable(`通算統計`, overallStats)}
    </div>
  );
}
