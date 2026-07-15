import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [latestTemp, setLatestTemp] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/readings`);
      const sensorData = response.data;

      setData(sensorData);
      if (sensorData && sensorData.length > 0) {
        setLatestTemp(sensorData[sensorData.length - 1].suhu);
      }
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data", err);
      setError("Gagal terhubung ke sensor backend. Pastikan server aktif (port 3000).");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPaused) return;

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Hitung rata-rata, min, dan max dari data suhu
  const temperatures = data.map((item) => item.suhu);
  const minTemp = temperatures.length ? Math.min(...temperatures) : 0;
  const maxTemp = temperatures.length ? Math.max(...temperatures) : 0;
  const avgTemp = temperatures.length
    ? (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)
    : 0;

  const isWarning = latestTemp > 80;

  // Render Layar Loading Utama
  if (isLoading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Menghubungkan ke Sensor</h2>
          <p className="text-gray-500 text-sm">Sedang memuat data suhu mesin produksi...</p>
        </div>
      </div>
    );
  }

  // Render Layar Error Utama (Jika tidak ada data sama sekali)
  if (error && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sensor Tidak Terhubung</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow transition-colors duration-200"
          >
            Coba Hubungkan Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header Section */}
        <div className="bg-slate-800 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">Monitor Mesin Produksi</h1>
          <div className="flex items-center space-x-4">
            {/* Tombol Jeda / Lanjutkan Aliran Data */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${isPaused
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                }`}
            >
              {isPaused ? '▶️ Lanjutkan' : '⏸️ Jeda Aliran'}
            </button>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWarning ? 'bg-red-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isWarning ? 'bg-red-500' : 'bg-green-500'}`}></span>
              </span>
              <span className="text-sm font-medium">Sensor Aktif</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Banner Error/Warning Sementara (jika server putus tapi kita sudah ada data cache) */}
          {error && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <strong>Peringatan Koneksi:</strong> {error}
              </div>
            </div>
          )}

          {/* Hero Section: Kartu Suhu Utama */}
          <div className={`transition-colors duration-500 ease-in-out border-2 rounded-2xl p-10 text-center shadow-sm mb-6
            ${isWarning ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}
          >
            <h2 className="text-gray-600 text-lg font-semibold uppercase tracking-wider mb-2">
              Suhu Saat Ini
            </h2>

            <div className={`text-7xl font-extrabold mb-4 tracking-tighter
              ${isWarning ? 'text-red-700' : 'text-green-700'}`}
            >
              {latestTemp}°C
            </div>

            <div className="h-8">
              {isWarning ? (
                <p className="text-red-600 font-bold text-lg animate-pulse flex items-center justify-center gap-2">
                  ⚠️ Peringatan: Suhu Melebihi Ambang Aman!
                </p>
              ) : (
                <p className="text-green-600 font-medium">Kondisi Mesin Normal</p>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-4 font-mono">
              Diperbarui: {lastUpdate} {isPaused && <span className="text-amber-600 font-bold">(Dijeda)</span>}
            </p>
          </div>

          {/* Statistik Suhu Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">Rata-Rata</span>
              <span className="text-2xl font-black text-blue-900">{avgTemp}°C</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Minimum</span>
              <span className="text-2xl font-black text-emerald-900">{minTemp}°C</span>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-1">Maksimum</span>
              <span className="text-2xl font-black text-rose-900">{maxTemp}°C</span>
            </div>
          </div>

          {/* Bagian Bawah: Visualisasi Grafik */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Riwayat Suhu</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) => tick.split('T')[1] || tick}
                    stroke="#9ca3af"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[20, 100]}
                    stroke="#9ca3af"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="suhu"
                    stroke={isWarning ? "#ef4444" : "#10b981"}
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className='bg-white border border-gray 100 rounded-xl p-6 shadow-sm mt-6 m-6'>
          <h3 className='text-xl font-bold text-gray-800 mb-6'> List Data Anomali</h3>
          <table className='w-full'>
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className='px-6 py-3 text-left uppercase font-semibold text-gray-500'>Waktu</th>
                <th className='px-6 py-3 text-left uppercase font-semibold text-gray-500'>Suhu Anomali</th>
                <th className='px-6 py-3 text-left uppercase font-semibold text-gray-500'>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...data]
                .filter(item => item.anomali)
                .reverse().map((item, idx) => (
                  <tr key={idx} className='border-b'>
                    <td className='px-6 py-3 text-left'>{item.timestamp}</td>
                    <td className='px-6 py-3 text-left'>{item.suhu}°C</td>
                    <td className='px-6 py-3 text-left'>
                      <input
                        type="checkbox"
                        checked={item.status}
                        className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full" readOnly
                        onChange={(e) => console.log('Anomali di verifikasi:', item.timestamp)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;