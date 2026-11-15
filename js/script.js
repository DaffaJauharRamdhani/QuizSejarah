
document.addEventListener("DOMContentLoaded", function () {

    console.log("KUIZ SEJARAH berhasil dijalankan.");

    // =========================================
    // 1. KONFIGURASI SISTEM AKUN
    // =========================================

    const USER_KEY = "kuizSejarahUsers";
    const SESSION_KEY = "kuizSejarahSession";

    function getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(USER_KEY));
            return Array.isArray(users) ? users : [];
        } catch (error) {
            console.error("Gagal membaca data akun:", error);
            return [];
        }
    }

    function getCurrentUser() {
        try {
            const user = JSON.parse(sessionStorage.getItem(SESSION_KEY));

            if (
                user &&
                typeof user.name === "string" &&
                typeof user.email === "string"
            ) {
                return user;
            }

            return null;
        } catch (error) {
            console.error("Gagal membaca sesi login:", error);
            return null;
        }
    }

    async function hashPassword(password) {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error(
                "Fitur keamanan tidak tersedia. Jalankan menggunakan Live Server."
            );
        }

        const data = new TextEncoder().encode(password);
        const hash = await crypto.subtle.digest("SHA-256", data);

        return Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }


    // =========================================
    // 2. NOTIFIKASI LOGIN
    // =========================================

    const pendingMessage = sessionStorage.getItem("loginNotice");
    const loginMessageElement = document.getElementById("loginMessage");

    if (pendingMessage && loginMessageElement) {
        loginMessageElement.textContent = pendingMessage;
        sessionStorage.removeItem("loginNotice");
    }


    // =========================================
    // 3. SISTEM LOGIN
    // =========================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("loginEmail")
                .value.trim().toLowerCase();

            const password = document.getElementById("loginPassword").value;
            const message = document.getElementById("loginMessage");

            if (!email || !password) {
                message.textContent = "Semua kolom harus diisi.";
                return;
            }

            try {
                const users = getUsers();

                const user = users.find(function (item) {
                    return item.email === email;
                });

                if (!user) {
                    message.textContent =
                        "Akun belum terdaftar. Silakan daftar terlebih dahulu.";
                    return;
                }

                const passwordHash = await hashPassword(password);

                if (user.password !== passwordHash) {
                    message.textContent =
                        "Email atau password yang kamu masukkan salah.";
                    return;
                }

                sessionStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify({
                        name: user.name,
                        email: user.email
                    })
                );

                message.textContent =
                    "Login berhasil. Mengarahkan ke beranda...";

                window.location.href = "index.html";

            } catch (error) {
                console.error("Login gagal:", error);
                message.textContent =
                    "Terjadi kesalahan. Silakan coba kembali.";
            }
        });
    }


    // =========================================
    // 4. SISTEM PENDAFTARAN AKUN
    // =========================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("registerName")
                .value.trim();

            const email = document.getElementById("registerEmail")
                .value.trim().toLowerCase();

            const password =
                document.getElementById("registerPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const message =
                document.getElementById("registerMessage");

            if (!name || !email || !password || !confirmPassword) {
                message.textContent = "Semua kolom harus diisi.";
                return;
            }

            if (password.length < 6) {
                message.textContent = "Password minimal 6 karakter.";
                return;
            }

            if (password !== confirmPassword) {
                message.textContent =
                    "Konfirmasi password tidak sesuai.";
                return;
            }

            try {
                const users = getUsers();

                const existingUser = users.find(function (item) {
                    return item.email === email;
                });

                if (existingUser) {
                    message.textContent =
                        "Email sudah terdaftar. Silakan masuk.";
                    return;
                }

                const passwordHash = await hashPassword(password);

                const newUser = {
                    name: name,
                    email: email,
                    password: passwordHash
                };

                users.push(newUser);

                localStorage.setItem(
                    USER_KEY,
                    JSON.stringify(users)
                );

                sessionStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify({
                        name: name,
                        email: email
                    })
                );

                message.textContent =
                    "Pendaftaran berhasil. Mengarahkan ke beranda...";

                window.location.href = "index.html";

            } catch (error) {
                console.error("Pendaftaran gagal:", error);
                message.textContent =
                    "Pendaftaran gagal. Silakan coba kembali.";
            }
        });
    }


    // =========================================
    // 5. TAMPILAN AKUN DI BERANDA
    // =========================================

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    const welcomeName =
        document.getElementById("welcomeName");

    const loginNavButton =
        document.getElementById("loginNavButton");

    const heroLoginButton =
        document.getElementById("heroLoginButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const loggedInUser = getCurrentUser();

    if (welcomeMessage && welcomeName) {
        if (loggedInUser) {
            welcomeMessage.hidden = false;
            welcomeName.textContent = loggedInUser.name;

            if (logoutButton) {
                logoutButton.hidden = false;
            }

            if (loginNavButton) {
                loginNavButton.hidden = true;
            }

            if (heroLoginButton) {
                heroLoginButton.hidden = true;
            }

        } else {
            welcomeMessage.hidden = true;

            if (logoutButton) {
                logoutButton.hidden = true;
            }

            if (loginNavButton) {
                loginNavButton.hidden = false;
            }

            if (heroLoginButton) {
                heroLoginButton.hidden = false;
            }
        }
    }


    // =========================================
    // 6. SISTEM LOGOUT
    // =========================================

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            const confirmation = confirm(
                "Apakah kamu yakin ingin keluar dari akun?"
            );

            if (confirmation) {
                sessionStorage.removeItem(SESSION_KEY);
                window.location.href = "index.html";
            }
        });
    }


    // =========================================
    // 7. PEMERIKSAAN AKSES KUIS
    // =========================================

    const currentUser = getCurrentUser();

    const isQuizPage =
        window.location.pathname.endsWith("/kuis.html") ||
        window.location.pathname === "kuis.html";

    if (isQuizPage && !currentUser) {
        sessionStorage.setItem(
            "loginNotice",
            "Anda belum mempunyai akun. Silakan daftar terlebih dahulu atau masuk ke akun kamu."
        );

        window.location.replace("login.html");
        return;
    }

    document.addEventListener("click", function (event) {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const link = target.closest("a");

        if (!link) {
            return;
        }

        const destination = link.getAttribute("href") || "";

        if (
            destination.includes("kuis.html") &&
            !getCurrentUser()
        ) {
            event.preventDefault();

            sessionStorage.setItem(
                "loginNotice",
                "Anda belum mempunyai akun. Silakan daftar terlebih dahulu atau masuk ke akun kamu."
            );

            window.location.href = "login.html";
        }
    });


    // =========================================
    // 8. FUNGSI MEMBUAT SOAL PILIHAN GANDA
    // =========================================

    function mcq(question, options, answer) {
        return {
            question: question,
            options: options,
            answer: answer
        };
    }


    // =========================================
    // 9. BANK SOAL KUIS
    // 10 PILIHAN GANDA PER MATERI
    // =========================================

    const quizData = {

        // =====================================
        // MATERI 1: KERAJAAN NUSANTARA
        // =====================================

        kerajaan: {
            title: "Kerajaan Nusantara",

            description:
                "Mengenal kerajaan Hindu-Buddha dan Islam yang berkembang di Nusantara.",

            questions: [

                mcq(
                    "Kerajaan Hindu tertua di Indonesia yang dibahas dalam materi adalah ...",
                    ["Majapahit", "Kutai", "Sriwijaya", "Demak"],
                    1
                ),

                mcq(
                    "Raja Kutai yang dikenal sebagai raja terbesar adalah ...",
                    ["Kudungga", "Aswawarman", "Mulawarman", "Dharma Setia"],
                    2
                ),

                mcq(
                    "Peninggalan Kerajaan Kutai berupa tujuh prasasti yang disebut ...",
                    ["Prasasti Yupa", "Prasasti Ciaruteun", "Prasasti Tugu", "Prasasti Kedukan Bukit"],
                    0
                ),

                mcq(
                    "Raja terkenal dari Kerajaan Tarumanegara yang membangun saluran irigasi adalah ...",
                    ["Purnawarman", "Balaputradewa", "Hayam Wuruk", "Raden Patah"],
                    0
                ),

                mcq(
                    "Prasasti Ciaruteun merupakan peninggalan kerajaan ...",
                    ["Kutai", "Sriwijaya", "Tarumanegara", "Majapahit"],
                    2
                ),

                mcq(
                    "Kerajaan Sriwijaya berpusat di wilayah ...",
                    ["Trowulan", "Palembang", "Muara Kaman", "Bintara"],
                    1
                ),

                mcq(
                    "Kerajaan Sriwijaya dikenal sebagai kerajaan maritim yang menguasai jalur perdagangan ...",
                    ["Selat Malaka", "Selat Sunda saja", "Laut Jawa saja", "Selat Bali"],
                    0
                ),

                mcq(
                    "Pendiri Kerajaan Majapahit pada tahun 1293 adalah ...",
                    ["Gajah Mada", "Hayam Wuruk", "Raden Wijaya", "Tribhuwana Tunggadewi"],
                    2
                ),

                mcq(
                    "Sumpah Palapa diucapkan oleh tokoh Majapahit bernama ...",
                    ["Gajah Mada", "Raden Patah", "Pati Unus", "Mulawarman"],
                    0
                ),

                mcq(
                    "Kerajaan Islam pertama di Jawa yang dibahas dalam materi adalah ...",
                    ["Demak", "Sriwijaya", "Kutai", "Tarumanegara"],
                    0
                )
            ]
        },


        // =====================================
        // MATERI 2: MASA PENJAJAHAN
        // =====================================

        penjajahan: {
            title: "Masa Penjajahan",

            description:
                "Mengenal kedatangan bangsa asing, kebijakan penjajahan, dan perjuangan rakyat Indonesia.",

            questions: [

                mcq(
                    "Istilah Gold dalam tujuan kedatangan bangsa Eropa berarti ...",
                    ["Penyebaran agama", "Mencari kekayaan", "Memperluas pendidikan", "Mencari wilayah pertanian"],
                    1
                ),

                mcq(
                    "Konstantinopel dikuasai Turki Utsmani pada tahun ...",
                    ["1453", "1511", "1596", "1602"],
                    0
                ),

                mcq(
                    "Portugis tiba di Malaka pada tahun 1511 di bawah pimpinan ...",
                    ["Cornelis de Houtman", "Alfonso de Albuquerque", "Magellan", "Van den Bosch"],
                    1
                ),

                mcq(
                    "Perjanjian Saragosa yang dibuat pada tahun 1529 menyebabkan ...",
                    ["Portugis meninggalkan Maluku", "Spanyol meninggalkan Maluku", "Belanda meninggalkan Banten", "Jepang meninggalkan Indonesia"],
                    1
                ),

                mcq(
                    "Tokoh yang berhasil mengusir Portugis dari Ternate pada tahun 1575 adalah ...",
                    ["Sultan Hasanuddin", "Sultan Baabullah", "Pattimura", "Pangeran Antasari"],
                    1
                ),

                mcq(
                    "Cornelis de Houtman tiba di Banten pada tahun ...",
                    ["1511", "1529", "1596", "1602"],
                    2
                ),

                mcq(
                    "VOC didirikan pada tahun ...",
                    ["1602", "1700", "1799", "1830"],
                    0
                ),

                mcq(
                    "Sistem Tanam Paksa pada tahun 1830 merupakan gagasan dari ...",
                    ["Van den Bosch", "Cornelis de Houtman", "Alfonso de Albuquerque", "Sultan Baabullah"],
                    0
                ),

                mcq(
                    "Kerja paksa pada masa pendudukan Jepang dikenal dengan istilah ...",
                    ["Politik Etis", "Romusha", "Ekstirpasi", "Pelayaran Hongi"],
                    1
                ),

                mcq(
                    "Budi Utomo berdiri pada tanggal ...",
                    ["17 Agustus 1945", "20 Mei 1908", "10 November 1945", "1 Juni 1945"],
                    1
                )
            ]
        },


        // =====================================
        // MATERI 3: KEMERDEKAAN INDONESIA
        // =====================================

        kemerdekaan: {
            title: "Kemerdekaan Indonesia",

            description:
                "Mengenal peristiwa penting menjelang dan setelah Proklamasi Kemerdekaan Indonesia.",

            questions: [

                mcq(
                    "BPUPKI dibentuk pada tanggal ...",
                    ["29 April 1945", "1 Juni 1945", "7 Agustus 1945", "17 Agustus 1945"],
                    0
                ),

                mcq(
                    "Soekarno mengusulkan Pancasila pada tanggal ...",
                    ["29 April 1945", "1 Juni 1945", "7 Agustus 1945", "18 Agustus 1945"],
                    1
                ),

                mcq(
                    "Bom atom dijatuhkan di Hiroshima pada tanggal ...",
                    ["6 Agustus 1945", "9 Agustus 1945", "14 Agustus 1945", "17 Agustus 1945"],
                    0
                ),

                mcq(
                    "Peristiwa Rengasdengklok terjadi pada tanggal ...",
                    ["14 Agustus 1945", "15 Agustus 1945", "16 Agustus 1945", "17 Agustus 1945"],
                    2
                ),

                mcq(
                    "Tujuan golongan muda membawa Soekarno dan Hatta ke Rengasdengklok adalah ...",
                    [
                        "Menjauhkan mereka dari pengaruh Jepang dan mendesak proklamasi segera",
                        "Mempersiapkan pemilihan presiden",
                        "Membentuk organisasi perdagangan",
                        "Mengadakan perjanjian dengan Belanda"
                    ],
                    0
                ),

                mcq(
                    "Perumusan teks Proklamasi dilakukan di rumah ...",
                    ["Soekarno", "Mohammad Hatta", "Laksamana Tadashi Maeda", "Achmad Soebardjo"],
                    2
                ),

                mcq(
                    "Tokoh yang mengetik naskah Proklamasi adalah ...",
                    ["Sukarni", "Sayuti Melik", "Wikana", "B.M. Diah"],
                    1
                ),

                mcq(
                    "Tokoh yang menjahit bendera Merah Putih untuk Proklamasi adalah ...",
                    ["Fatmawati", "R.A. Kartini", "Dewi Sartika", "Cut Nyak Dien"],
                    0
                ),

                mcq(
                    "Proklamasi Kemerdekaan Indonesia dibacakan pada pukul ...",
                    ["08.00 WIB", "09.00 WIB", "10.00 WIB", "12.00 WIB"],
                    2
                ),

                mcq(
                    "Pada tanggal 18 Agustus 1945, PPKI melakukan kegiatan ...",
                    [
                        "Membentuk VOC",
                        "Mengesahkan UUD 1945 dan memilih presiden serta wakil presiden",
                        "Membacakan teks Proklamasi",
                        "Mengadakan Perjanjian Saragosa"
                    ],
                    1
                )
            ]
        },


        // =====================================
        // MATERI 4: TOKOH NASIONAL
        // =====================================

        tokoh: {
            title: "Tokoh Nasional",

            description:
                "Mengenal kehidupan, perjuangan, dan keteladanan para tokoh nasional Indonesia.",

            questions: [

                mcq(
                    "Hari Pahlawan diperingati setiap tanggal ...",
                    ["2 Mei", "10 November", "21 April", "17 Agustus"],
                    1
                ),

                mcq(
                    "Undang-undang yang mengatur gelar, tanda jasa, dan tanda kehormatan dalam materi adalah ...",
                    ["UU No. 20 Tahun 2009", "UU No. 10 Tahun 1945", "UU No. 5 Tahun 1999", "UU No. 1 Tahun 2000"],
                    0
                ),

                mcq(
                    "Soekarno mendirikan Partai Nasional Indonesia pada tahun ...",
                    ["1908", "1922", "1927", "1945"],
                    2
                ),

                mcq(
                    "Mohammad Hatta dikenal dengan julukan ...",
                    ["Bapak Pendidikan Nasional", "Bapak Koperasi Indonesia", "Bapak Pembangunan", "Panglima Besar"],
                    1
                ),

                mcq(
                    "Pangeran Diponegoro memimpin Perang Jawa pada tahun ...",
                    ["1803–1838", "1825–1830", "1848–1855", "1873–1908"],
                    1
                ),

                mcq(
                    "Buku yang berisi kumpulan surat R.A. Kartini adalah ...",
                    ["Indonesia Menggugat", "Babad Diponegoro", "Habis Gelap Terbitlah Terang", "Negarakertagama"],
                    2
                ),

                mcq(
                    "Ki Hajar Dewantara mendirikan Taman Siswa pada tahun ...",
                    ["1908", "1913", "1922", "1945"],
                    2
                ),

                mcq(
                    "Tanggal 2 Mei diperingati sebagai ...",
                    ["Hari Kartini", "Hari Pendidikan Nasional", "Hari Pahlawan", "Hari Kebangkitan Nasional"],
                    1
                ),

                mcq(
                    "Jenderal Soedirman memimpin gerilya setelah peristiwa ...",
                    ["Agresi Militer II", "Perjanjian Saragosa", "Perang Padri", "Perang Bongaya"],
                    0
                ),

                mcq(
                    "Cut Nyak Dien diasingkan ke ...",
                    ["Banten", "Sumedang", "Palembang", "Yogyakarta"],
                    1
                )
            ]
        }

    };


    // =========================================
    // 10. SISTEM KUIS PILIHAN GANDA
    // =========================================

    const questionText = document.getElementById("questionText");

    if (questionText) {

        const params = new URLSearchParams(window.location.search);
        const category = params.get("kategori") || "kerajaan";
        const selectedQuiz = quizData[category];

        const titleElement = document.getElementById("quizTitle");
        const descriptionElement =
            document.getElementById("quizDescription");

        const questionNumber =
            document.getElementById("questionNumber");

        const questionCategory =
            document.getElementById("questionCategory");

        const progressBar =
            document.getElementById("progressBar");

        const answerOptions =
            document.getElementById("answerOptions");

        const answerMessage =
            document.getElementById("answerMessage");

        const nextButton =
            document.getElementById("nextButton");

        const questionArea =
            document.getElementById("questionArea");

        const resultArea =
            document.getElementById("resultArea");

        if (
            !titleElement ||
            !descriptionElement ||
            !questionNumber ||
            !questionCategory ||
            !progressBar ||
            !answerOptions ||
            !nextButton ||
            !questionArea ||
            !resultArea
        ) {
            console.error("Elemen HTML kuis tidak ditemukan.");

        } else if (!selectedQuiz) {

            titleElement.textContent = "Kategori Tidak Ditemukan";

            descriptionElement.textContent =
                "Silakan kembali ke halaman kategori dan pilih kategori yang tersedia.";

            questionArea.hidden = true;
            resultArea.hidden = true;

        } else {

            titleElement.textContent = selectedQuiz.title;
            descriptionElement.textContent = selectedQuiz.description;

            questionCategory.textContent =
                selectedQuiz.title.toUpperCase();

            questionArea.hidden = false;
            resultArea.hidden = true;

            let currentQuestion = 0;
            let score = 0;
            let selectedAnswer = null;

            const letters = ["A", "B", "C", "D"];

            // =================================
            // TAMPILKAN PERTANYAAN
            // =================================

            function showQuestion() {

                const question =
                    selectedQuiz.questions[currentQuestion];

                selectedAnswer = null;

                questionNumber.textContent =
                    `PERTANYAAN ${currentQuestion + 1} DARI ${selectedQuiz.questions.length}`;

                const progress =
                    (currentQuestion / selectedQuiz.questions.length) * 100;

                progressBar.style.width = progress + "%";

                questionText.textContent = question.question;

                answerOptions.innerHTML = "";

                if (answerMessage) {
                    answerMessage.textContent = "";
                    answerMessage.className = "answer-message";
                }

                nextButton.disabled = true;
                nextButton.hidden = false;

                // Tampilkan pilihan jawaban

                question.options.forEach(function (option, index) {

                    const button =
                        document.createElement("button");

                    button.type = "button";
                    button.className = "answer-option";
                    button.dataset.index = index;

                    const letter =
                        document.createElement("span");

                    letter.className = "option-letter";
                    letter.textContent = letters[index] + ".";

                    const answerText =
                        document.createElement("span");

                    answerText.textContent = option;

                    button.appendChild(letter);
                    button.appendChild(answerText);

                    answerOptions.appendChild(button);
                });

                nextButton.textContent =
                    currentQuestion === selectedQuiz.questions.length - 1
                        ? "Selesaikan Kuis →"
                        : "Berikutnya →";
            }


            // =================================
            // MEMILIH JAWABAN
            // =================================

            answerOptions.addEventListener("click", function (event) {

                const target = event.target;

                if (!(target instanceof Element)) {
                    return;
                }

                const button = target.closest(".answer-option");

                if (!button || !answerOptions.contains(button)) {
                    return;
                }

                selectedAnswer = Number(button.dataset.index);

                const allOptions =
                    answerOptions.querySelectorAll(".answer-option");

                allOptions.forEach(function (item) {
                    item.classList.remove("selected");
                });

                button.classList.add("selected");

                nextButton.disabled = false;
            });


            // =================================
            // TOMBOL BERIKUTNYA
            // =================================

            nextButton.addEventListener("click", function () {

                if (selectedAnswer === null) {
                    return;
                }

                const question =
                    selectedQuiz.questions[currentQuestion];

                // Periksa jawaban benar

                if (
                    selectedAnswer === Number(question.answer)
                ) {
                    score++;
                }

                currentQuestion++;

                if (
                    currentQuestion < selectedQuiz.questions.length
                ) {
                    showQuestion();
                } else {
                    showResult();
                }
            });


            // =================================
            // TAMPILKAN HASIL KUIS
            // =================================

            function showResult() {

                questionArea.hidden = true;
                resultArea.hidden = false;

                const totalQuestions =
                    selectedQuiz.questions.length;

                const finalScore =
                    Math.round((score / totalQuestions) * 100);

                const detail =
                    `Kamu telah menyelesaikan ${totalQuestions} soal. ` +
                    `Jawaban benar: ${score} dari ${totalQuestions} soal.`;

                const finalScoreElement =
                    document.getElementById("finalScore");

                const resultDetailElement =
                    document.getElementById("resultDetail");

                if (finalScoreElement) {
                    finalScoreElement.textContent = finalScore;
                }

                if (resultDetailElement) {
                    resultDetailElement.textContent = detail;
                }

                progressBar.style.width = "100%";
                questionNumber.textContent = "KUIS SELESAI";

                const hasilKuis = {
                    score: finalScore,
                    correct: score,
                    totalQuestions: totalQuestions,
                    category: selectedQuiz.title,
                    detail: detail,
                    date: new Date().toLocaleString("id-ID")
                };

                try {
                    sessionStorage.setItem(
                        "hasilKuisTerakhir",
                        JSON.stringify(hasilKuis)
                    );

                } catch (error) {
                    console.error(
                        "Hasil kuis gagal disimpan:",
                        error
                    );
                }

                console.log("Kuis selesai.");
                console.log("Jawaban benar:", score);
                console.log("Nilai akhir:", finalScore);
            }


            // MULAI KUIS
            showQuestion();

        }
    }


    // =========================================
    // 11. HALAMAN HASIL KUIS
    // =========================================

    const resultScore =
        document.getElementById("resultScore");

    if (resultScore) {

        const resultCategory =
            document.getElementById("resultCategory");

        const resultDetail =
            document.getElementById("resultDetail");

        const resultDate =
            document.getElementById("resultDate");

        const dataHasil =
            sessionStorage.getItem("hasilKuisTerakhir");

        if (dataHasil) {

            try {

                const hasil = JSON.parse(dataHasil);

                resultScore.textContent = hasil.score;

                if (resultCategory) {
                    resultCategory.textContent = hasil.category;
                }

                if (resultDetail) {
                    resultDetail.textContent = hasil.detail;
                }

                if (resultDate) {
                    resultDate.textContent = hasil.date;
                }

            } catch (error) {

                resultScore.textContent = "-";

                if (resultCategory) {
                    resultCategory.textContent =
                        "Data tidak dapat dibaca";
                }

                if (resultDetail) {
                    resultDetail.textContent =
                        "Silakan kerjakan kuis kembali.";
                }

                if (resultDate) {
                    resultDate.textContent = "-";
                }

                console.error(
                    "Gagal membaca hasil kuis:",
                    error
                );
            }

        } else {

            resultScore.textContent = "-";

            if (resultCategory) {
                resultCategory.textContent = "Belum ada hasil";
            }

            if (resultDetail) {
                resultDetail.textContent =
                    "Silakan kerjakan kuis terlebih dahulu.";
            }

            if (resultDate) {
                resultDate.textContent = "-";
            }
        }
    }

});
