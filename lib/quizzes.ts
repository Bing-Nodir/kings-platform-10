// ====================================================
// Kings Education Platform — Quiz Questions
// 5 savol × 8 kurs = 40 ta professional savol
// ====================================================

export interface QuizOption {
  id: string; // "a" | "b" | "c" | "d"
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
}

export interface CourseQuiz {
  courseId: string;
  title: string;
  passingScore: number; // % (masalan: 60)
  questions: QuizQuestion[];
}

export const courseQuizzes: CourseQuiz[] = [
  // ─────────────────────────────────────────────
  // 1. Python Analytics & Automation
  // ─────────────────────────────────────────────
  {
    courseId: "python-analytics-automation",
    title: "Python Analytics — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "py-1",
        question: "Pandas kutubxonasida DataFrame yaratishning to'g'ri usuli qaysi?",
        options: [
          { id: "a", text: "pd.DataFrame({'A': [1,2,3], 'B': [4,5,6]})" },
          { id: "b", text: "DataFrame.create({'A': [1,2,3]})" },
          { id: "c", text: "pandas.make_df([1,2,3])" },
          { id: "d", text: "df = {A: [1,2,3], B: [4,5,6]}" },
        ],
        correctId: "a",
        explanation: "pd.DataFrame() — Pandas'da DataFrame yaratishning standart usuli. Lug'at (dictionary) o'tkaziladi, kalitlar ustun nomlari bo'ladi.",
      },
      {
        id: "py-2",
        question: "Python'da list comprehension qanday ishlaydi?",
        options: [
          { id: "a", text: "for x in range(10): list.add(x)" },
          { id: "b", text: "[x**2 for x in range(10)]" },
          { id: "c", text: "list(range(10), lambda x: x**2)" },
          { id: "d", text: "map(x**2, range(10))" },
        ],
        correctId: "b",
        explanation: "List comprehension — [ifoda for element in iterable] ko'rinishida yoziladi. Bu Python'ning eng samarali va pythonic usullaridan biri.",
      },
      {
        id: "py-3",
        question: "pandas `.groupby()` metodining asosiy vazifasi nima?",
        options: [
          { id: "a", text: "Ma'lumotlarni saralash" },
          { id: "b", text: "DataFrame'ni birlashtirish" },
          { id: "c", text: "Ma'lumotlarni guruhlab, aggregate funksiyalar qo'llash" },
          { id: "d", text: "Ustun nomlarini o'zgartirish" },
        ],
        correctId: "c",
        explanation: ".groupby() — ma'lumotlarni biror ustun bo'yicha guruhlab, har bir guruhga sum, mean, count kabi aggregate funksiyalarni qo'llash imkonini beradi.",
      },
      {
        id: "py-4",
        question: "Python'da fayldan ma'lumot o'qish uchun qaysi metod ishlatiladi?",
        options: [
          { id: "a", text: "file.load('data.csv')" },
          { id: "b", text: "pd.read_csv('data.csv')" },
          { id: "c", text: "open.csv('data.csv')" },
          { id: "d", text: "import('data.csv')" },
        ],
        correctId: "b",
        explanation: "pd.read_csv() — Pandas'ning CSV faylni DataFrame sifatida o'qish funksiyasi. Excel uchun pd.read_excel(), JSON uchun pd.read_json() ishlatiladi.",
      },
      {
        id: "py-5",
        question: "Matplotlib'da grafik ko'rsatish uchun qaysi buyruq ishlatiladi?",
        options: [
          { id: "a", text: "plt.display()" },
          { id: "b", text: "graph.show()" },
          { id: "c", text: "plt.show()" },
          { id: "d", text: "matplotlib.render()" },
        ],
        correctId: "c",
        explanation: "plt.show() — Matplotlib yoki Pyplot orqali qurilgan grafikni ekranda ko'rsatish uchun ishlatiladi. Bu barcha grafik elementlarini render qiladi.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. SQL Querying & Reporting
  // ─────────────────────────────────────────────
  {
    courseId: "sql-querying-reporting",
    title: "SQL Querying — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "sql-1",
        question: "SQL'da o'rtacha qiymatni hisoblash uchun qaysi funksiya ishlatiladi?",
        options: [
          { id: "a", text: "AVERAGE()" },
          { id: "b", text: "MEAN()" },
          { id: "c", text: "AVG()" },
          { id: "d", text: "MEDIAN()" },
        ],
        correctId: "c",
        explanation: "AVG() — SQL'da o'rtacha arifmetik qiymatni hisoblaydigan aggregate funksiya. SELECT AVG(salary) FROM employees kabi ishlatiladi.",
      },
      {
        id: "sql-2",
        question: "INNER JOIN va LEFT JOIN orasidagi asosiy farq nima?",
        options: [
          { id: "a", text: "INNER JOIN tezroq ishlaydi" },
          { id: "b", text: "LEFT JOIN chap jadvalning barcha qatorlarini, INNER JOIN faqat mos keladiganlarni qaytaradi" },
          { id: "c", text: "LEFT JOIN ko'proq xotira ishlatadi" },
          { id: "d", text: "Farqi yo'q, ikkalasi ham bir xil" },
        ],
        correctId: "b",
        explanation: "INNER JOIN — faqat ikki jadvalda ham mos kelgan qatorlarni qaytaradi. LEFT JOIN — chap jadvalning barcha qatorlarini + o'ng jadvaldan mos kelganlarini qaytaradi. Mos kelmagan joylar NULL bo'ladi.",
      },
      {
        id: "sql-3",
        question: "WHERE va HAVING orasidagi farq qaysi?",
        options: [
          { id: "a", text: "HAVING faqat STRING ustunlarda ishlaydi" },
          { id: "b", text: "WHERE GROUP BY dan oldin, HAVING GROUP BY dan keyin filtrlab chiqaradi" },
          { id: "c", text: "WHERE tezroq, HAVING sekinroq" },
          { id: "d", text: "Ikkalasi ham bir xil maqsadda ishlatiladi" },
        ],
        correctId: "b",
        explanation: "WHERE — GROUP BY dan oldin qatorlarni filtrlab chiqaradi. HAVING — GROUP BY dan keyin guruhlarni filtrlab chiqaradi. Masalan: HAVING COUNT(*) > 5 faqat 5 tadan ko'p qatorli guruhlarni qaytaradi.",
      },
      {
        id: "sql-4",
        question: "SQL'da ma'lumotlarni kamayish tartibida saralash uchun qaysi kalit so'z ishlatiladi?",
        options: [
          { id: "a", text: "ORDER BY column ASC" },
          { id: "b", text: "SORT BY column DESC" },
          { id: "c", text: "ORDER BY column DESC" },
          { id: "d", text: "ARRANGE BY column -1" },
        ],
        correctId: "c",
        explanation: "ORDER BY column DESC — kamayish tartibida saralaydi. ASC (ascending) — o'sish tartibi, bu default qiymat. DESC (descending) — kamayish tartibi.",
      },
      {
        id: "sql-5",
        question: "Subquery (ichki so'rov) nima?",
        options: [
          { id: "a", text: "Ikki jadvaldan ma'lumot olish" },
          { id: "b", text: "Boshqa SQL so'rov ichida yozilgan SQL so'rov" },
          { id: "c", text: "Stored procedure yaratish" },
          { id: "d", text: "View yaratish" },
        ],
        correctId: "b",
        explanation: "Subquery — boshqa SQL so'rov ichida joylashgan SQL so'rov. SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) — bu yerda qavslar ichidagi qism subquery.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. Database Design Foundations
  // ─────────────────────────────────────────────
  {
    courseId: "database-design-foundations",
    title: "Ma'lumotlar bazasi — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "db-1",
        question: "3NF (Uchinchi Normal Shakl) nima talab qiladi?",
        options: [
          { id: "a", text: "Barcha ustunlar birlamchi kalit bo'lishi kerak" },
          { id: "b", text: "Tranzitiv bog'liqliklarni yo'q qilish kerak" },
          { id: "c", text: "Jadvalda faqat bitta ustun bo'lishi kerak" },
          { id: "d", text: "Har bir qatorning unikal ID si bo'lishi kerak" },
        ],
        correctId: "b",
        explanation: "3NF — jadval 2NF bo'lishi va birlamchi kalitga bog'liq bo'lmagan tranzitiv bog'liqliklarni yo'q qilishni talab qiladi. Bu ma'lumotlar redundansiyasini kamaytiradi.",
      },
      {
        id: "db-2",
        question: "Foreign Key (tashqi kalit) nimaga xizmat qiladi?",
        options: [
          { id: "a", text: "Ustun qiymatlarini unikal qiladi" },
          { id: "b", text: "Jadvallar o'rtasidagi referential integrity ni ta'minlaydi" },
          { id: "c", text: "Ma'lumotlarni tezroq qidirish uchun" },
          { id: "d", text: "Jadvalning asosiy identifikatori" },
        ],
        correctId: "b",
        explanation: "Foreign Key — bir jadvalning ustuni boshqa jadvalning Primary Key si bilan bog'lanadi. Bu referential integrity (ma'lumotsiz farzand yozuv bo'lmasligi) ni ta'minlaydi.",
      },
      {
        id: "db-3",
        question: "INDEX yaratishning asosiy sababi nima?",
        options: [
          { id: "a", text: "Ma'lumotlar xavfsizligini oshirish" },
          { id: "b", text: "Disk hajmini kamaytirish" },
          { id: "c", text: "SELECT so'rovlar bajarilish tezligini oshirish" },
          { id: "d", text: "Duplikat ma'lumotlarni oldini olish" },
        ],
        correctId: "c",
        explanation: "INDEX — ma'lumotlar bazasidagi qidiruvni tezlashtiradi. Ko'p qatorli jadvallarda WHERE, JOIN va ORDER BY operatsiyalari index orqali sezilarli tezlashadi. Ammo INSERT/UPDATE operatsiyalarini sekinlatadi.",
      },
      {
        id: "db-4",
        question: "ERD (Entity-Relationship Diagram)da 'cardinality' nimani bildiradi?",
        options: [
          { id: "a", text: "Jadvalning ustunlar soni" },
          { id: "b", text: "Entitylar o'rtasidagi munosabat soni va turi (1:1, 1:N, M:N)" },
          { id: "c", text: "Ma'lumotlar bazasining hajmi" },
          { id: "d", text: "Birlamchi kalit turi" },
        ],
        correctId: "b",
        explanation: "Cardinality — ikkita entity o'rtasidagi munosabat turi: 1:1 (bir-biriga), 1:N (birga-ko'p), M:N (ko'pga-ko'p). Bu ma'lumotlar bazasini to'g'ri loyihalashda muhim tushuncha.",
      },
      {
        id: "db-5",
        question: "ACID xususiyatlarida 'Atomicity' nimani anglatadi?",
        options: [
          { id: "a", text: "Tranzaksiya parallel ravishda bajariladi" },
          { id: "b", text: "Tranzaksiya ya to'liq bajariladi, yoki umuman bajarilmaydi" },
          { id: "c", text: "Ma'lumotlar o'zgarmas saqlanadi" },
          { id: "d", text: "Tranzaksiya boshqalardan ajratilgan" },
        ],
        correctId: "b",
        explanation: "Atomicity — tranzaksiya 'all or nothing' prinsipi bo'yicha ishlaydi. Agar bir qadamda xato bo'lsa, butun tranzaksiya rollback qilinadi. Bank o'tkazmalari bunga klassik misol.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. AI for Analysts
  // ─────────────────────────────────────────────
  {
    courseId: "ai-for-analysts",
    title: "AI Analitiklar uchun — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "ai-1",
        question: "Machine Learning'da 'overfitting' muammosi nima?",
        options: [
          { id: "a", text: "Model haddan tashqari sekin ishlashi" },
          { id: "b", text: "Model o'quv ma'lumotlariga juda yaxshi moslashib, yangi ma'lumotlarda yomon ishlashi" },
          { id: "c", text: "Modelda xatolik soni ko'p bo'lishi" },
          { id: "d", text: "O'quv ma'lumotlari kam bo'lishi" },
        ],
        correctId: "b",
        explanation: "Overfitting — model o'quv setiga 'yodlab' oladi va umumlashtira olmaydi. Yangi ma'lumotlarda accuracy keskin tushadi. Dropout, regularization va cross-validation orqali oldini olish mumkin.",
      },
      {
        id: "ai-2",
        question: "Supervised va Unsupervised Learning o'rtasidagi asosiy farq nima?",
        options: [
          { id: "a", text: "Supervised AI'ning bir turi, Unsupervised ML'ning bir turi" },
          { id: "b", text: "Supervised — yorliqli ma'lumotlar bilan, Unsupervised — yorliqsiz ma'lumotlar bilan o'rganadi" },
          { id: "c", text: "Supervised tezroq, Unsupervised aniqroq" },
          { id: "d", text: "Supervised ko'proq ma'lumot talab qiladi" },
        ],
        correctId: "b",
        explanation: "Supervised Learning — har bir misol uchun to'g'ri javob (label) beriladi. Model o'sha labellardan o'rganadi. Unsupervised — labelsiz ma'lumotlarda yashirin patternlarni topadi (clustering, dimensionality reduction).",
      },
      {
        id: "ai-3",
        question: "Analitikada NLP (Natural Language Processing) qanday qo'llaniladi?",
        options: [
          { id: "a", text: "Faqat rasm tahlili uchun" },
          { id: "b", text: "Video ma'lumotlarni qayta ishlash uchun" },
          { id: "c", text: "Matn ma'lumotlarini tahlil qilish: sentiment analysis, topic modeling, summarization" },
          { id: "d", text: "Faqat tarjima qilish uchun" },
        ],
        correctId: "c",
        explanation: "NLP — matnni mashina tushunishi va qayta ishlashi uchun. Analitikada: mijoz sharhlarini tahlil qilish (sentiment), qidiruv tizimi, chatbot, hisobotlardan ma'lumot chiqarish kabi ishlarda qo'llaniladi.",
      },
      {
        id: "ai-4",
        question: "ChatGPT/Claude kabi LLM modellarda 'prompt engineering' nima?",
        options: [
          { id: "a", text: "Modelni qayta o'rgatish jarayoni" },
          { id: "b", text: "AI modeldan yaxshiroq natija olish uchun so'rovni to'g'ri shakllantirish san'ati" },
          { id: "c", text: "Yangi AI model yaratish" },
          { id: "d", text: "Modelning parametrlarini o'zgartirish" },
        ],
        correctId: "b",
        explanation: "Prompt Engineering — LLM dan kerakli, aniq va foydali javob olish uchun so'rovni to'g'ri yozish. Zero-shot, few-shot, chain-of-thought kabi texnikalar qo'llaniladi. Bu analitiklar uchun muhim ko'nikma.",
      },
      {
        id: "ai-5",
        question: "A/B test natijalarini baholashda p-value nimani bildiradi?",
        options: [
          { id: "a", text: "Test aniqligi foizi" },
          { id: "b", text: "Null gipoteza to'g'ri bo'lsa, natija tasodifan paydo bo'lish ehtimolligi" },
          { id: "c", text: "B variant A dan qanchalik yaxshiligi" },
          { id: "d", text: "O'zgarish miqdori" },
        ],
        correctId: "b",
        explanation: "p-value — null gipoteza to'g'ri bo'lsa, shu yoki bundan ham ekstremal natija tasodifan kuzatilish ehtimolligi. p < 0.05 bo'lsa statistik jihatdan muhim hisoblanadi. Bu A/B testlarda qaror qabul qilishda asosiy ko'rsatkich.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. Power BI Decision Dashboards
  // ─────────────────────────────────────────────
  {
    courseId: "power-bi-decision-dashboards",
    title: "Power BI Dashboardlar — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "pbi-1",
        question: "Power BI'da DAX (Data Analysis Expressions) nima uchun ishlatiladi?",
        options: [
          { id: "a", text: "Vizualizatsiya dizaynini o'zgartirish" },
          { id: "b", text: "Ma'lumotlarni import qilish" },
          { id: "c", text: "Hisoblangan ustunlar, o'lchovlar (measures) va jadvallar yaratish" },
          { id: "d", text: "Dashboard ulashish" },
        ],
        correctId: "c",
        explanation: "DAX — Power BI'ning formula tili. Hisoblangan ustunlar (calculated columns), measures (CALCULATE, SUM, FILTER), va hisoblangan jadvallar yaratish uchun ishlatiladi. Excel formulasiga o'xshash, lekin ma'lumotlar modeli bilan ishlaydi.",
      },
      {
        id: "pbi-2",
        question: "Power BI'da 'Star Schema' dizayni qanday afzalliklarga ega?",
        options: [
          { id: "a", text: "Disk hajmini kamaytiradi" },
          { id: "b", text: "Vizualizatsiya tezroq yuklanadi" },
          { id: "c", text: "So'rovlar tezligi oshadi, DAX qulayroq yoziladi, o'qish osonlashadi" },
          { id: "d", text: "Ko'proq ma'lumot saqlash imkoni" },
        ],
        correctId: "c",
        explanation: "Star Schema — markazda fact jadval, uning atrofida dimension jadvallar. Bu ma'lumotlar modelini sodda qiladi, DAX formulalari qisqa bo'ladi va query engine samaraliroq ishlaydi.",
      },
      {
        id: "pbi-3",
        question: "CALCULATE funksiyasining asosiy vazifasi nima?",
        options: [
          { id: "a", text: "Ikki sonni ko'paytirish" },
          { id: "b", text: "Filtr kontekstini o'zgartirib hisob-kitob bajarish" },
          { id: "c", text: "Yangi ustun qo'shish" },
          { id: "d", text: "Jadvallarni birlashtirish" },
        ],
        correctId: "b",
        explanation: "CALCULATE — DAX'ning eng muhim funksiyasi. U mavjud filtr kontekstini o'zgartirib, ma'lumotlarni qayta hisoblaydi. CALCULATE(SUM(Sales), Region='North') — faqat North regiondagi savdoni hisoblab beradi.",
      },
      {
        id: "pbi-4",
        question: "Power BI Service'da Row-Level Security (RLS) nima uchun kerak?",
        options: [
          { id: "a", text: "Dashboard tezligini oshirish" },
          { id: "b", text: "Har bir foydalanuvchi faqat o'z tegishli ma'lumotlarini ko'rsin deb" },
          { id: "c", text: "Ma'lumotlarni zaxiralash" },
          { id: "d", text: "Vizualizatsiyalarni himoyalash" },
        ],
        correctId: "b",
        explanation: "RLS — foydalanuvchi o'z regionidagi, departamentidagi yoki rol bo'yicha ma'lumotlarnigina ko'rishi uchun. Masalan: Toshkent menejer faqat Toshkent savdo ma'lumotlarini, Samarqand menejer faqat Samarqand ma'lumotlarini ko'radi.",
      },
      {
        id: "pbi-5",
        question: "Yaxshi dashboard dizaynining asosiy prinsipi qaysi?",
        options: [
          { id: "a", text: "Imkon qadar ko'p vizualizatsiya qo'shish" },
          { id: "b", text: "Rangli va bezakli bo'lishi kerak" },
          { id: "c", text: "Bitta savol — bitta dashboard; foydalanuvchi 5 soniyada asosiy topingni tushunishi kerak" },
          { id: "d", text: "Barcha ma'lumotlarni bitta sahifada ko'rsatish" },
        ],
        correctId: "c",
        explanation: "Yaxshi dashboard — bitta aniq maqsadga xizmat qiladi, ortiqcha vizualizatsiyasiz. Foydalanuvchi bir nazar tashlabda asosiy KPI ni tushunishi kerak. 'Less is more' prinsipi Data Visualization'ning oltin qoidasi.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. Data Analytics Professional
  // ─────────────────────────────────────────────
  {
    courseId: "data-analytics-professional",
    title: "Data Analytics Professional — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "dap-1",
        question: "KPI (Key Performance Indicator) to'g'ri ta'rifi qaysi?",
        options: [
          { id: "a", text: "IT tizimlarning ishlash ko'rsatkichi" },
          { id: "b", text: "Kompaniya maqsadlariga erishish darajasini o'lchash uchun ishlatiladigan miqdoriy ko'rsatkich" },
          { id: "c", text: "Moliyaviy ko'rsatkichlar ro'yxati" },
          { id: "d", text: "Xodimlarning ish natijasi" },
        ],
        correctId: "b",
        explanation: "KPI — kompaniya yoki jarayonning strategik maqsadlarga erishish darajasini o'lchash uchun tanlangan eng muhim ko'rsatkichlar. Yaxshi KPI: SMART (Specific, Measurable, Achievable, Relevant, Time-bound) bo'lishi kerak.",
      },
      {
        id: "dap-2",
        question: "Data warehouse va operational database o'rtasidagi farq nima?",
        options: [
          { id: "a", text: "Data warehouse kichikroq bo'ladi" },
          { id: "b", text: "Operational DB real vaqtda transaksiyalar uchun, Data Warehouse tahlil va hisobot uchun optimallashtirilgan" },
          { id: "c", text: "Data warehouse tezroq ishlaydi" },
          { id: "d", text: "Farqi yo'q, bir xil maqsadda ishlatiladi" },
        ],
        correctId: "b",
        explanation: "Operational DB (OLTP) — kun sayin transaksiyalar (insert, update, delete) uchun. Data Warehouse (OLAP) — tarixiy ma'lumotlarni saqlash va tahlil qilish uchun. Warehouse denormalized, tarixiy, read-heavy bo'ladi.",
      },
      {
        id: "dap-3",
        question: "ETL jarayonida 'Transform' bosqichi nima qiladi?",
        options: [
          { id: "a", text: "Ma'lumotlarni manbadan o'qiydi" },
          { id: "b", text: "Ma'lumotlarni tozalaydi, formatlaydi va business qoidalarini qo'llaydi" },
          { id: "c", text: "Ma'lumotlarni data warehouse ga yuklaydi" },
          { id: "d", text: "Ma'lumotlarni zaxiralaydi" },
        ],
        correctId: "b",
        explanation: "ETL = Extract → Transform → Load. Transform bosqichi: ma'lumotlarni tozalash (duplicates, nulls), formatlash (standartlashtirish), business qoidalarini qo'llash (categorization, calculations) va boshqa manba formatlarini birlashtirishni o'z ichiga oladi.",
      },
      {
        id: "dap-4",
        question: "Cohort analysis (kohort tahlil) qanday savolga javob beradi?",
        options: [
          { id: "a", text: "Kompaniyaning umumiy daromadi qancha?" },
          { id: "b", text: "Bir vaqtda boshlagan foydalanuvchilar guruhi vaqt o'tishi bilan qanday xatti-harakat qiladi?" },
          { id: "c", text: "Qaysi mahsulot eng ko'p sotiladi?" },
          { id: "d", text: "Xodimlar qancha vaqt ishlaydi?" },
        ],
        correctId: "b",
        explanation: "Cohort Analysis — bir vaqtda qo'shilgan yoki biror xususiyatni baham ko'rgan foydalanuvchilar guruhini vaqt o'tishi bilan kuzatadi. Retention rate, churn, LTV ni o'rganishda qo'llaniladi.",
      },
      {
        id: "dap-5",
        question: "Funnel analysis (voronka tahlil) qaysi biznes jarayonni o'lchaydi?",
        options: [
          { id: "a", text: "Mahsulot sifatini" },
          { id: "b", text: "Foydalanuvchilarning bir bosqichdan ikkinchisiga o'tish konversiyasini" },
          { id: "c", text: "Xodimlar samaradorligini" },
          { id: "d", text: "Moliyaviy natijalarni" },
        ],
        correctId: "b",
        explanation: "Funnel Analysis — foydalanuvchi sayto tashrif buyurishdan to maqsad harakatni (xarid, ro'yxatdan o'tish) bajarishgacha bo'lgan har bir bosqichdagi konversiyani o'lchaydi. Bu conversion rate optimization uchun asosiy vosita.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. Data Science Foundations
  // ─────────────────────────────────────────────
  {
    courseId: "data-science-foundations",
    title: "Data Science asoslari — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "ds-1",
        question: "Linear regression'da 'R-squared' (R²) nimani bildiradi?",
        options: [
          { id: "a", text: "Xatolar soni" },
          { id: "b", text: "Modelning dependent variable'ning variansini qanchalik tushuntira olishi (0 dan 1 gacha)" },
          { id: "c", text: "O'rtacha xato miqdori" },
          { id: "d", text: "Model parametrlari soni" },
        ],
        correctId: "b",
        explanation: "R² — 0 dan 1 gacha bo'lgan qiymat. 1 ga yaqin bo'lsa, model target variable'ning variansini yaxshi tushuntiradi. R²=0.85 — model 85% variansni tushuntiradi degani. Ammo high R² overfitting belgisi ham bo'lishi mumkin.",
      },
      {
        id: "ds-2",
        question: "Cross-validation nima uchun kerak?",
        options: [
          { id: "a", text: "Ma'lumotlarni tezroq yuklash uchun" },
          { id: "b", text: "Modelning yangi ma'lumotlardagi real ishlashini baholash va overfittingni aniqlash uchun" },
          { id: "c", text: "Ortiqcha ma'lumotlarni o'chirish uchun" },
          { id: "d", text: "Model parametrlarini avtomatik sozlash uchun" },
        ],
        correctId: "b",
        explanation: "Cross-validation — ma'lumotlarni k ta qismga bo'lib, har safar birini test sifatida, qolganlarini train sifatida ishlatadi. Bu modelling haqiqiy umumlashtirishini ko'rsatadi va overfittingni aniqlashga yordam beradi.",
      },
      {
        id: "ds-3",
        question: "Feature engineering nima?",
        options: [
          { id: "a", text: "Yangi ML algoritmlar yaratish" },
          { id: "b", text: "Ma'lumotlardan modelga foydali bo'lgan yangi o'zgaruvchilar (features) yaratish" },
          { id: "c", text: "Model arxitekturasini loyihalash" },
          { id: "d", text: "GPU sozlash" },
        ],
        correctId: "b",
        explanation: "Feature Engineering — xom ma'lumotlardan model uchun foydali yangi belgilar (features) yaratish. Masalan: 'tug'ilgan yil' dan 'yosh' ni chiqarish, 'sana' dan 'hafta kuni' ni ajratish. Ko'pincha ML natijasini model tanlashdan ko'ra ko'proq yaxshilaydi.",
      },
      {
        id: "ds-4",
        question: "Random Forest algoritmining asosiy g'oyasi nima?",
        options: [
          { id: "a", text: "Yagona kuchli qaror daraxti yaratish" },
          { id: "b", text: "Ko'plab mustaqil qaror daraxtlari yaratib, ularning natijalarini birlashtirish (ensemble method)" },
          { id: "c", text: "Ma'lumotlarni random tartiblash" },
          { id: "d", text: "Neyron tarmoq yaratish" },
        ],
        correctId: "b",
        explanation: "Random Forest — 'ensemble' metod. Ko'plab qaror daraxtlari (decision trees) yaratiladi, har biri random subset ma'lumotlar va xususiyatlar bilan o'rgatiladi. Barcha daraxtlarning bashoratlarining o'rtachasi/majority vote olinadi. Bu overfittingni kamaytiradi.",
      },
      {
        id: "ds-5",
        question: "Precision va Recall o'rtasidagi farq qaysi?",
        options: [
          { id: "a", text: "Precision tezlik, Recall aniqlik o'lchovi" },
          { id: "b", text: "Precision — ijobiy bashoratlar orasida to'g'rilari ulushi; Recall — haqiqiy ijobiy holatlarni aniqlash qobiliyati" },
          { id: "c", text: "Ikkalasi ham bir xil narsani o'lchaydi" },
          { id: "d", text: "Precision classification, Recall regression uchun" },
        ],
        correctId: "b",
        explanation: "Precision = TP/(TP+FP) — model 'ijobiy' degan narsalarning qanchalik to'g'riligi. Recall = TP/(TP+FN) — barcha haqiqiy ijobiy holatlarning qanchasi aniqlanganiga. Spam detection'da Precision muhim (false positive kam bo'lsin), kasallik aniqlagichda Recall muhim (barcha bemorlar aniqlansin).",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. ACCA IFRS Financial Reporting
  // ─────────────────────────────────────────────
  {
    courseId: "acca-ifrs-financial-reporting",
    title: "ACCA IFRS — Bilimni tekshirish",
    passingScore: 60,
    questions: [
      {
        id: "acca-1",
        question: "IFRS 15 (Mijozlar bilan tuzilgan shartnomalardan tushumlar) bo'yicha 5 bosqichli model nima?",
        options: [
          { id: "a", text: "Aktivni baholash, majburiyatni tan olish, kechiktirish, hisoblash, e'lon qilish" },
          { id: "b", text: "Shartnomani aniqlash → Majburiyatlarni ajratish → Narxni aniqlash → Narxni taqsimlash → Tushumni tan olish" },
          { id: "c", text: "Hisoblash → Tekshirish → Baholash → Tasdiqlash → Hisobot berish" },
          { id: "d", text: "Invoice → To'lov → Yozuv → Yakunlash → Audit" },
        ],
        correctId: "b",
        explanation: "IFRS 15 ning 5 bosqichi: 1) Mijoz bilan shartnomani aniqlash, 2) Shartnomadagi bajarish majburiyatlarini ajratish, 3) Tranzaksiya narxini aniqlash, 4) Narxni bajarish majburiyatlariga taqsimlash, 5) Majburiyat bajarilganda tushumni tan olish.",
      },
      {
        id: "acca-2",
        question: "IAS 36 bo'yicha aktivning 'impairment' (qadrsizlanish) ni aniqlash qanday amalga oshiriladi?",
        options: [
          { id: "a", text: "Aktivni bozorga sotish" },
          { id: "b", text: "Kitob qiymati Recoverable Amount dan oshib ketganda impairment yo'qotish tan olinadi" },
          { id: "c", text: "Har yili barcha aktivlarni qayta baholash" },
          { id: "d", text: "Faqat amortizatsiya qilinmaydigan aktivlar tekshiriladi" },
        ],
        correctId: "b",
        explanation: "IAS 36 — Aktivlarning qadrsizlanishi. Recoverable Amount = max(Fair Value less costs to sell, Value in Use). Agar kitob qiymati > Recoverable Amount bo'lsa, farq impairment yo'qotish sifatida P&L da tan olinadi.",
      },
      {
        id: "acca-3",
        question: "IFRS 16 (Lizing) bo'yicha ijara oluvchi (lessee) nima tan olishi kerak?",
        options: [
          { id: "a", text: "Faqat ijara xarajatini tan oladi" },
          { id: "b", text: "Faqat qisqa muddatli lizinglar balansga kiritiladi" },
          { id: "c", text: "Foydalanish huquqi aktivini (Right-of-Use Asset) va lizing majburiyatini balansga kiritadi" },
          { id: "d", text: "Hech narsa — ijara shartnomasi off-balance sheet" },
        ],
        correctId: "c",
        explanation: "IFRS 16 — 2019 yildan kuchga kirgan. Ijara oluvchi 12 oydan ortiq barcha lizinglarni balansga kiritishi kerak: ROU Asset (foydalanish huquqi aktivi) va mos lizing majburiyatini. Bu 'off-balance sheet' financing imkonini cheklaydi.",
      },
      {
        id: "acca-4",
        question: "IAS 2 bo'yicha inventarni baholashda qaysi usullar ruxsat etilgan?",
        options: [
          { id: "a", text: "FIFO va LIFO" },
          { id: "b", text: "FIFO va Weighted Average Cost" },
          { id: "c", text: "LIFO, FIFO va Specific Identification" },
          { id: "d", text: "Faqat Specific Identification" },
        ],
        correctId: "b",
        explanation: "IAS 2 — LIFO usulini taqiqlaydi. Ruxsat etilgan usullar: FIFO (First-In, First-Out) va Weighted Average Cost. LIFO IFRS'da man etilgan, lekin US GAAP'da hali ham ruxsat berilgan — bu IFRS va US GAAP o'rtasidagi asosiy farqlardan biri.",
      },
      {
        id: "acca-5",
        question: "Konsolidatsiya (IFRS 10) bo'yicha 'control' tushunchasi nimani anglatadi?",
        options: [
          { id: "a", text: "Kompaniyaning 50%+ aksiyalariga ega bo'lish" },
          { id: "b", text: "Investee ustidan power, variable returns va power-returns bog'liqligiga ega bo'lish" },
          { id: "c", text: "Boshqaruv kengashida ko'pchilik o'ringa ega bo'lish" },
          { id: "d", text: "100% sho'ba kompaniyaga ega bo'lish" },
        ],
        correctId: "b",
        explanation: "IFRS 10 bo'yicha control 3 elementdan iborat: 1) Investee ustidan Power (qaror qabul qilish huquqi), 2) Variable returns (dividends, kurs farqlari), 3) Power va returns o'rtasidagi bog'liqlik. 50%+ aksiya bo'lmasa ham control bo'lishi mumkin.",
      },
    ],
  },
];

export function getQuizByCourseId(courseId: string): CourseQuiz | undefined {
  return courseQuizzes.find((q) => q.courseId === courseId);
}

export function calculateScore(quiz: CourseQuiz, answers: Record<string, string>): {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  results: { questionId: string; correct: boolean; yourAnswer: string; correctAnswer: string }[];
} {
  const results = quiz.questions.map((q) => {
    const yourAnswer = answers[q.id] ?? "";
    const correct = yourAnswer === q.correctId;
    return { questionId: q.id, correct, yourAnswer, correctAnswer: q.correctId };
  });

  const score = results.filter((r) => r.correct).length;
  const total = quiz.questions.length;
  const percent = Math.round((score / total) * 100);
  const passed = percent >= quiz.passingScore;

  return { score, total, percent, passed, results };
}
