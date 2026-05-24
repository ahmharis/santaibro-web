export const config = {
  api: {
    // WAJIB: Tingkatkan limit parser bawaan Vercel agar tidak crash saat menerima Base64
    bodyParser: {
      sizeLimit: '5mb', 
    },
  },
};

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Metode dilarang. Gunakan POST.' });
  }

  const URL_RAHASIA_GAS = process.env.SECRET_GAS_URL;

  // DIAGNOSTIK 1: Cek ENV
  if (!URL_RAHASIA_GAS) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Sistem Vercel belum membaca SECRET_GAS_URL. Lakukan proses Redeploy di Vercel.' 
    });
  }

  try {
    // Mencegah double stringification.
    // Jika req.body sudah berupa string (karena frontend tidak pakai header), langsung gunakan.
    // Jika Vercel sudah mem-parsingnya sebagai Object, stringify.
    const payloadBuffer = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const response = await fetch(URL_RAHASIA_GAS, {
      method: 'POST',
      body: payloadBuffer,
      // Beberapa versi GAS membutuhkan redirect ke URL aslinya
      redirect: 'follow' 
    });

    // Ambil respons sebagai teks mentah dulu untuk mencegah crash HTML Google
    const rawText = await response.text();

    try {
      // Coba ubah ke JSON
      const data = JSON.parse(rawText);
      return res.status(200).json(data);
    } catch (parseError) {
      // Jika Google merespons pakai HTML/Teks (misal error script)
      return res.status(500).json({ 
        status: 'error', 
        message: 'Google Apps Script memberikan respons yang tidak valid. Hubungi Developer.',
        debug: rawText.substring(0, 100) // Tampilkan sedikit pesan error asli dari Google
      });
    }
    
  } catch (error) {
    // DIAGNOSTIK 2: Cek koneksi dari Vercel ke Google
    return res.status(500).json({ 
      status: 'error', 
      message: 'Koneksi dari Vercel ke Database Google gagal. Error: ' + error.message 
    });
  }
}
