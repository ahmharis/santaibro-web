export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode dilarang. Gunakan POST.' });
  }

  const URL_RAHASIA_GAS = process.env.SECRET_GAS_URL;

  // DIAGNOSTIK 1: Cek apakah Vercel berhasil membaca ENV
  if (!URL_RAHASIA_GAS) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Sistem Vercel belum membaca SECRET_GAS_URL. Lakukan proses Redeploy di Vercel.' 
    });
  }

  try {
    const response = await fetch(URL_RAHASIA_GAS, {
      method: 'POST',
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    // DIAGNOSTIK 2: Cek apakah Google Apps Script yang menolak
    res.status(500).json({ 
      status: 'error', 
      message: 'Jalur Vercel aman, tetapi Google Apps Script menolak koneksi. Error: ' + error.message 
    });
  }
}
