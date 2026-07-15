const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware untuk parsing JSON body

// Data awal dari soal
let sensorData = [
  {"timestamp": "2026-06-21T10:00:00", "suhu": 28.4},
  {"timestamp": "2026-06-21T10:00:05", "suhu": 28.6},
  {"timestamp": "2026-06-21T10:00:10", "suhu": 29.1},
  {"timestamp": "2026-06-21T10:00:15", "suhu": 30.2},
  {"timestamp": "2026-06-21T10:00:20", "suhu": 31.0}
];

// Simulasi sensor: tambah data baru setiap 5 detik
setInterval(() => {
  const newTemp = (Math.random() * (90 - 25) + 25).toFixed(1); // Acak 25 - 90
  const newTimestamp = new Date().toISOString().split('.')[0]; // Format ISO tanpa milidetik
  const parsedTemp = parseFloat(newTemp);

  sensorData.push({
    timestamp: newTimestamp,
    suhu: parsedTemp,
    anomali: parsedTemp > 80 // Deteksi anomali sisi server
  });

  // Jaga agar data tidak terlalu bengkak (simpan 20 terakhir saja)
  if (sensorData.length > 20) {
    sensorData.shift(); 
  }
}, 5000);

// Endpoint 1: Ambil semua data pembacaan
app.get('/readings', (req, res) => {
  if (!sensorData || sensorData.length === 0) {
    return res.json([]); // Penanganan kasus data kosong dengan wajar
  }
  res.json(sensorData);
});

// Endpoint 2: Ambil suhu terbaru saja
app.get('/latest', (req, res) => {
  if (!sensorData || sensorData.length === 0) {
    return res.status(404).json({ error: "Belum ada data sensor." });
  }
  res.json(sensorData[sensorData.length - 1]);
});

// Endpoint 3: Menerima pembacaan baru (POST /readings) untuk simulasi manual
app.post('/readings', (req, res) => {
  const { suhu, timestamp } = req.body;

  // Validasi Input
  if (suhu === undefined || isNaN(Number(suhu))) {
    return res.status(400).json({ error: "Suhu tidak valid. Harus berupa angka." });
  }

  const parsedSuhu = parseFloat(suhu);
  const parsedTimestamp = timestamp || new Date().toISOString().split('.')[0];

  const newReading = {
    timestamp: parsedTimestamp,
    suhu: parsedSuhu,
    anomali: parsedSuhu > 80 // Deteksi anomali
  };

  sensorData.push(newReading);

  // Batasi panjang array
  if (sensorData.length > 20) {
    sensorData.shift();
  }

  res.status(201).json({
    message: "Data sensor berhasil ditambahkan",
    data: newReading
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server jalan di port ${PORT}`);
});