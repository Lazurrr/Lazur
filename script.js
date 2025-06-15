document.addEventListener("DOMContentLoaded", () => {
  let allSongs = [];

  async function fetchSongs() {
    try {
      const response = await fetch("music.json");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}.`);
      }
      const data = await response.json();
      allSongs = data;
      console.log("Data lagu berhasil dimuat:", allSongs);
      if (allSongs.length === 0) {
        console.warn(
          "File music.json dimuat, tetapi tidak ada data lagu di dalamnya."
        );
      }
    } catch (error) {
      console.error("Gagal memuat data lagu:", error);
      musicListContainer.innerHTML =
        "<p>Gagal memuat data musik. Silakan periksa konsol browser untuk detail error.</p>";
    }
  }

  const weights = { w1: 0.4, w2: 0.3, w3: 0.2, w4: 0.1 };

  function objective(song) {
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

  async function jalankanSimulasiGreedy() {
    if (allSongs.length === 0) {
      await fetchSongs();
    }

    const jumlahRekomendasi = 4;
    let sisa = [...allSongs];
    let hasil = [];

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
        sisa = sisa.filter((l) => l !== terbaik);
      } else {
        break;
      }
    }
    return hasil;
  }

  const musicListContainer = document.querySelector(".music-list");

  async function displayMusicRecommendations() {
    musicListContainer.innerHTML = "<p>Memuat rekomendasi...</p>";
    const recommendedSongs = await jalankanSimulasiGreedy();
    musicListContainer.innerHTML = "";

    if (recommendedSongs.length === 0) {
      musicListContainer.innerHTML =
        "<p>Tidak ada rekomendasi musik saat ini. Pastikan file music.json berisi data yang valid.</p>";
      return;
    }

    let outputHTML = `<h2>${recommendedSongs.length} Lagu Rekomendasi Teratas:</h2><ol>`;
    recommendedSongs.forEach((lagu, index) => {
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
  const backToHomeBtn = document.getElementById("backToHomeBtn");
  const introSection = document.getElementById("intro-section");
  const runRecommendationBtn = document.getElementById("runRecommendationBtn");

  const container = document.querySelector(".container");
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  function showHomePage() {
    introSection.classList.remove("hidden");
    musicRecommendationsSection.classList.add("hidden");
    sidebarDetailContentSection.classList.add("hidden");
    backToHomeBtn.classList.remove("show");
    sidebarLinks.forEach((l) => l.classList.remove("active"));
    sidebar.classList.remove("active");
    container.classList.remove("sidebar-open");
  }

  function showMusicRecommendationsPage() {
    introSection.classList.add("hidden");
    musicRecommendationsSection.classList.remove("hidden");
    sidebarDetailContentSection.classList.add("hidden");
    backToHomeBtn.classList.remove("show");
    sidebarLinks.forEach((l) => l.classList.remove("active"));
    sidebar.classList.remove("active");
    container.classList.remove("sidebar-open");
  }

  showHomePage();
  fetchSongs();

  sidebarToggle.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      sidebar.classList.toggle("active");
    } else {
      container.classList.toggle("sidebar-open");
    }
  });

  runRecommendationBtn.addEventListener("click", async () => {
    if (allSongs.length === 0) {
      await fetchSongs();
    }
    displayMusicRecommendations();
    showMusicRecommendationsPage();
  });

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const contentType = link.dataset.content;
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      introSection.classList.add("hidden");
      musicRecommendationsSection.classList.add("hidden");
      sidebarContentPlaceholder.innerHTML = sidebarContent[contentType];
      sidebarDetailContentSection.classList.remove("hidden");
      backToHomeBtn.classList.add("show");
      sidebar.classList.remove("active");
      container.classList.remove("sidebar-open");
    });
  });

  backToHomeBtn.addEventListener("click", showMusicRecommendationsPage);
});
