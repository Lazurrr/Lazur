document.addEventListener("DOMContentLoaded", () => {
  let allSongs = []; // Variabel global untuk menyimpan data lagu dari music.json

  // Fungsi untuk mengambil data lagu dari file music.json
  async function fetchSongs() {
    try {
      const response = await fetch("music.json"); // Ambil file music.json
      if (!response.ok) {
        // Jika respons tidak OK (misal: 404 Not Found), lempar error
        throw new Error(
          `HTTP error! Status: ${response.status}. Pastikan 'music.json' ada di direktori yang sama.`
        );
      }
      const data = await response.json();
      allSongs = data; // Simpan data yang diambil ke variabel allSongs
      console.log("Data lagu berhasil dimuat:", allSongs);
      if (allSongs.length === 0) {
        console.warn(
          "File music.json dimuat, tetapi tidak ada data lagu di dalamnya."
        );
      }
    } catch (error) {
      console.error("Gagal memuat data lagu:", error);
      // Tampilkan pesan error di UI jika perlu
      musicListContainer.innerHTML =
        "<p>Gagal memuat data musik. Silakan periksa konsol browser untuk detail error.</p>";
    }
  }

  // Bobot untuk algoritma Greedy, sesuai yang Anda berikan
  const weights = { w1: 0.4, w2: 0.3, w3: 0.2, w4: 0.1 };

  // Fungsi objektif untuk menghitung skor rekomendasi, sesuai rumus Anda
  // Menggunakan properti 'Streams', 'Peak Position', 'Lyrics Sentiment', 'TikTok Virality'
  function objective(song) {
    // Penting: Normalisasi data sering diperlukan untuk metrik dengan skala sangat berbeda.
    // Untuk demo ini, kita menggunakan nilai mentah sesuai rumus Anda.
    // Jika Streams sangat besar, ia akan mendominasi skor.
    // Pastikan properti ada sebelum mengaksesnya untuk menghindari error.
    const streams = song["Streams"] || 0;
    const peakPosition = song["Peak Position"] || 0;
    const lyricsSentiment = song["Lyrics Sentiment"] || 0;
    const tiktokVirality = song["TikTok Virality"] || 0;

    return (
      weights.w1 * streams +
      weights.w2 * peakPosition +
      weights.w3 * lyricsSentiment +
      weights.w4 * tiktokVirality
    );
  }

  // Fungsi untuk menjalankan simulasi Greedy dan mendapatkan rekomendasi terurut
  async function jalankanSimulasiGreedy() {
    if (allSongs.length === 0) {
      await fetchSongs(); // Pastikan data sudah dimuat sebelum menjalankan simulasi
    }

    const jumlahRekomendasi = 4; // Jumlah rekomendasi yang diinginkan: 4
    let sisa = [...allSongs]; // Menggunakan allSongs sebagai sumber, salin array
    let hasil = []; // Array untuk menyimpan hasil rekomendasi

    // Jika tidak ada lagu yang tersedia setelah fetch, keluar
    if (sisa.length === 0) {
      console.warn("Tidak ada lagu yang tersedia untuk direkomendasikan.");
      return [];
    }

    for (let i = 0; i < jumlahRekomendasi; i++) {
      let terbaik = null;
      let skorTertinggi = -Infinity;

      for (let lagu of sisa) {
        let skor = objective(lagu);
        if (skor > skorTertinggi) {
          skorTertinggi = skor;
          terbaik = lagu;
        }
      }

      if (terbaik) {
        hasil.push(terbaik);
        // Hapus lagu yang sudah terpilih dari daftar sisa
        sisa = sisa.filter((l) => l !== terbaik);
      } else {
        // Jika tidak ada lagu yang tersisa atau tidak dapat menemukan yang terbaik (misal semua skor -Infinity)
        break;
      }
    }
    return hasil; // Mengembalikan daftar lagu yang direkomendasikan secara berurutan
  }

  const musicListContainer = document.querySelector(".music-list");

  // Fungsi untuk menampilkan rekomendasi musik yang sudah diurutkan
  async function displayMusicRecommendations() {
    musicListContainer.innerHTML = "<p>Memuat rekomendasi...</p>"; // Tampilkan pesan loading
    const recommendedSongs = await jalankanSimulasiGreedy(); // Panggil fungsi Greedy

    musicListContainer.innerHTML = ""; // Bersihkan konten sebelumnya

    if (recommendedSongs.length === 0) {
      musicListContainer.innerHTML =
        "<p>Tidak ada rekomendasi musik saat ini. Pastikan file music.json berisi data yang valid.</p>";
      return;
    }

    // Output HTML untuk daftar berurutan
    // Judul disesuaikan dengan jumlah rekomendasi (4 lagu)
    let outputHTML = `<h2>${recommendedSongs.length} Lagu Rekomendasi Teratas:</h2><ol>`;
    recommendedSongs.forEach((lagu, index) => {
      // Tambahkan 'index' sebagai parameter
      // Penanganan jika Song atau Artist undefined/null
      const songTitle = lagu["Song"] || "Unknown Song";
      const artistName = lagu["Artist"] || "Unknown Artist";

      outputHTML += `<li>${
        index + 1
      }. <b>${songTitle}</b> from ${artistName} (skor: ${objective(
        lagu
      ).toFixed(2)})</li>`;
    });
    outputHTML += "</ol>";

    musicListContainer.innerHTML = outputHTML;
  }

  // --- Konten Sidebar ---
  const sidebarContent = {
    "keterangan-website": `
          <h3>Keterangan Website</h3>
          <p>Website ini dirancang untuk menampilkan rekomendasi musik
          dengan pendekatan yang terinspirasi dari <strong>Algoritma Greedy</strong>. Dalam
          penerapan algoritma greedy kombinatorial menggunakan JavaScript untuk membuat
          sistem rekomendasi, dihasilkan sebuah output yang menampilkan empat rekomendasi
          lagu teratas. Hasil implementasi algoritma greedy dalam ruang lingkup
          kombinatorial pada sistem rekomendasi musik menunjukan performa yang efektif
          dalam menghasilkan rekomendasi lagu berdasarkan nilai fungsi objektif (streams,
          peak position, lyrics sentiment, dan TikTok virality).</p>
      `,
    dataset: `
          <h3>Dataset</h3>
          <p>Data rekomendasi musik yang digunakan dalam contoh ini
          diambil dari website kaggle dataset Billboard Top Songs yang diperoleh melalui
          Kaggle. Dataset ini menyediakan banyak informasi, seperti judul lagu, artis, posisi puncak di tangga lagu,
          serta metadata seperti tahun rilis dan genre. Data yang digunakan untuk
          rekomendasi musik ada empat, yaitu:</p>
          <ul>
              <li><strong>Streams:</strong> Seberapa banyak lagu diputar.</li>
              <li><strong>Lyrics Sentiment:</strong> Makna dari lirik lagu.</li>
              <li><strong>TikTok Virality:</strong> Seberapa populer lagu tersebut di TikTok.</li>
              <li><strong>Peak Position:</strong> Posisi tertinggi yang pernah dicapai sebuah lagu.</li>
          </ul>
          <p>Informasi lengkap mengenai data set dapat dikunjungi pada halaman website berikut <a href="https://www.kaggle.com/datasets/samayashar/billboard-top-songs" target="_blank">https://www.kaggle.com/datasets/samayashar/billboard-top-songs</a>.</p>
      `,
    "anggota-kelompok": `
          <h3>Anggota Kelompok</h3>
          <p>Kelompok 7 :</p>
          <ul>
              <li>Abdul karim (1247050017)</li>
              <li>Afdhal Jihadi (1247050111)</li>
              <li>Aika Rienasari (1247050085)</li>
              <li>Aldila Zahirra Shaffa (1247050001)</li>
              <li>Athar Abdullah (1247050096)</li>
          </ul>
      `,
  };

  const sidebarLinks = document.querySelectorAll(".sidebar nav ul li a");
  const musicRecommendationsSection = document.getElementById(
    "music-recommendations"
  );
  const sidebarDetailContentSection = document.getElementById(
    "sidebar-detail-content"
  );
  const sidebarContentPlaceholder = document.getElementById(
    "sidebar-content-placeholder"
  );
  const backToHomeBtn = document.getElementById("backToHomeBtn"); // Tombol kembali
  const introSection = document.getElementById("intro-section"); // Bagian intro
  const runRecommendationBtn = document.getElementById("runRecommendationBtn"); // Tombol menjalankan rekomendasi

  const container = document.querySelector(".container"); // Dapatkan elemen container
  const sidebar = document.getElementById("sidebar"); // Dapatkan elemen sidebar
  const sidebarToggle = document.querySelector(".sidebar-toggle"); // Dapatkan tombol toggle

  // Fungsi untuk menampilkan halaman utama (intro atau rekomendasi setelah dijalankan)
  function showHomePage() {
    introSection.classList.remove("hidden"); // Tampilkan intro secara default
    musicRecommendationsSection.classList.add("hidden"); // Sembunyikan rekomendasi
    sidebarDetailContentSection.classList.add("hidden"); // Sembunyikan detail sidebar
    backToHomeBtn.classList.remove("show"); // Sembunyikan tombol kembali
    sidebarLinks.forEach((l) => l.classList.remove("active")); // Hapus highlight link sidebar

    // Pastikan sidebar tertutup (untuk desktop dan mobile)
    sidebar.classList.remove("active"); // Untuk mobile overlay
    container.classList.remove("sidebar-open"); // Untuk desktop push effect
  }

  // Fungsi untuk menampilkan bagian rekomendasi musik
  function showMusicRecommendationsPage() {
    introSection.classList.add("hidden"); // Sembunyikan intro
    musicRecommendationsSection.classList.remove("hidden"); // Tampilkan rekomendasi
    sidebarDetailContentSection.classList.add("hidden"); // Sembunyikan detail sidebar
    backToHomeBtn.classList.remove("show"); // Sembunyikan tombol kembali
    sidebarLinks.forEach((l) => l.classList.remove("active")); // Hapus highlight link sidebar

    // Pastikan sidebar tertutup
    sidebar.classList.remove("active");
    container.classList.remove("sidebar-open");
  }

  // Tampilkan halaman intro saat halaman dimuat pertama kali dan muat data
  showHomePage();
  fetchSongs(); // Mulai memuat data saat DOMContentLoaded

  // Event listener untuk tombol toggle sidebar
  sidebarToggle.addEventListener("click", () => {
    // Deteksi apakah sedang dalam tampilan mobile atau desktop berdasarkan lebar layar
    if (window.matchMedia("(max-width: 768px)").matches) {
      // Mobile: Gunakan kelas 'active' untuk overlay sidebar
      sidebar.classList.toggle("active");
    } else {
      // Desktop: Gunakan kelas 'sidebar-open' pada container untuk push effect (sidebar mendorong konten)
      container.classList.toggle("sidebar-open");
    }
  });

  // Event listener untuk tombol "Jalankan Rekomendasi Musik"
  runRecommendationBtn.addEventListener("click", async () => {
    // Pastikan data sudah dimuat sebelum mencoba menampilkan rekomendasi
    if (allSongs.length === 0) {
      await fetchSongs(); // Coba muat lagi jika belum ada data
    }
    displayMusicRecommendations(); // Jalankan fungsi rekomendasi (asinkron)
    showMusicRecommendationsPage(); // Tampilkan halaman rekomendasi
  });

  // Event listener untuk setiap tautan sidebar
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // Mencegah perilaku default tautan (pindah halaman)
      const contentType = link.dataset.content; // Ambil nilai dari atribut data-content

      sidebarLinks.forEach((l) => l.classList.remove("active")); // Hapus highlight link sidebar
      link.classList.add("active"); // Tambahkan highlight ke link yang diklik

      introSection.classList.add("hidden"); // Sembunyikan intro
      musicRecommendationsSection.classList.add("hidden"); // Sembunyikan bagian rekomendasi musik
      sidebarContentPlaceholder.innerHTML = sidebarContent[contentType]; // Isi konten detail sidebar
      sidebarDetailContentSection.classList.remove("hidden"); // Tampilkan bagian detail sidebar
      backToHomeBtn.classList.add("show"); // Tampilkan tombol kembali

      // Tutup sidebar setelah link diklik (untuk desktop dan mobile)
      sidebar.classList.remove("active"); // Untuk mobile overlay
      container.classList.remove("sidebar-open"); // Untuk desktop push effect
    });
  });

  // Event listener untuk tombol "Kembali ke Rekomendasi"
  backToHomeBtn.addEventListener("click", showMusicRecommendationsPage); // Kembali ke halaman rekomendasi setelah tombol dijalankan
});
