// File: api/proxy.js
export default async function handler(req, res) {
  // Hanya menerima metode POST dari frontend
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mengambil URL Rahasia dari sistem keamanan Vercel
  const URL_RAHASIA_GAS = process.env.SECRET_GAS_URL;

  try {
    // Meneruskan (Proxying) data dari HTML ke Google Apps Script secara diam-diam
    const response = await fetch(URL_RAHASIA_GAS, {
      method: 'POST',
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    // Mengembalikan jawaban dari Google ke HTML
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Koneksi ke server pusat terputus.' });
  }
}
