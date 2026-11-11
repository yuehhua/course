/**
 * lessons.ts — per-course lesson slides and pages.
 * Content policy: module overview + one featured clinical translation case
 * per module. No operational info (textbook, hours, grading) on public pages.
 */
import type { L } from './content';

export interface LessonCase {
  week: string; // e.g. 'W1'
  title: L<string>;
  body: L<string>;
}

export interface LessonModule {
  num: string; // e.g. 'M1'
  weeks: string; // e.g. 'W1–W3' or a date '2026/09/30'
  name: L<string>;
  summary: L<string>;
  /** Featured translation case — optional (seminar-style courses may have none). */
  case?: LessonCase;
}

export interface Lesson {
  slug: string;
  accent: 'sky' | 'leaf';
  name: L<string>;
  tagline: L<string>;
  goal: L<string>;
  modules: LessonModule[];
}

export const lessonUi = {
  heroEyebrow: { zh: 'TMU 課程', en: 'TMU COURSE' },
  goalLabel: { zh: '課程目標', en: 'Course goal' },
  courseMap: { zh: '課程地圖', en: 'Course map' },
  clinicalCase: { zh: '臨床與生醫轉譯', en: 'Clinical & biomedical translation' },
  backToCourses: { zh: '回課程', en: 'Back to lessons' },
  meetLab: { zh: '認識 ISB Lab', en: 'About ISB Lab' },
  viewCourse: { zh: '查看完整課程', en: 'View full course' },
} satisfies Record<string, L<string>>;

/** Deck order of the lesson slides (also their anchor ids in the deck). */
export const lessonOrder = [
  'discrete-math',
  'data-structures-algorithms',
  'bioinformatics',
  'smart-healthcare-big-data',
] as const;

export const bioinformatics: Lesson = {
  slug: 'bioinformatics',
  accent: 'leaf',
  name: { zh: '生物資訊', en: 'Bioinformatics' },
  tagline: {
    zh: '從序列分析、基因體學到單細胞資料分析的入門，銜接實驗室目前的研究主題。',
    en: 'From sequence analysis and genomics to single-cell data analysis, connecting directly to the lab’s current research.',
  },
  goal: {
    zh: '從序列到細胞——走過基因體、轉錄體到單細胞與空間轉錄體的完整分析視野，銜接實驗室的研究主題。',
    en: 'From sequences to cells—a full analytical arc through genomics, transcriptomics, single-cell and spatial data, connecting directly to the lab’s research.',
  },
  modules: [
    {
      num: 'M1',
      weeks: '2026/09/30',
      name: { zh: '定序技術', en: 'Sequencing Technologies' },
      summary: {
        zh: '次世代高通量定序（NGS）與第三代長讀取定序（PacBio、Oxford Nanopore）的原理與應用。',
        en: 'Next-generation high-throughput sequencing (NGS) and third-generation long-read platforms (PacBio, Oxford Nanopore)—principles and applications.',
      },
    },
    {
      num: 'M2',
      weeks: '2026/10/07',
      name: { zh: '基因體組裝與比較基因體學', en: 'Genome Assembly & Comparative Genomics' },
      summary: {
        zh: 'Mapping、variant calling 與 synteny analysis；以 IGV、UCSC Genome Browser、Circos plots 進行視覺化。',
        en: 'Mapping, variant calling and synteny analysis, visualized with IGV, UCSC Genome Browser and Circos plots.',
      },
    },
    {
      num: 'M3',
      weeks: '2026/10/14',
      name: { zh: '轉錄體學', en: 'Transcriptomics' },
      summary: {
        zh: '序列比對與定量——從 reads 到基因表現量的完整工作流程。',
        en: 'Alignment and quantification—the full workflow from reads to gene expression.',
      },
    },
    {
      num: 'M4',
      weeks: '2026/10/21',
      name: { zh: '網路生物學', en: 'Network Biology' },
      summary: {
        zh: '生物系統的網路建模與分析——從蛋白質交互作用到基因調控網路。',
        en: 'Network modeling of biological systems—from protein interactions to gene regulation.',
      },
    },
    {
      num: 'M5',
      weeks: '2026/11/04',
      name: { zh: '單細胞 RNA 定序分析', en: 'Single-Cell RNA-Seq' },
      summary: {
        zh: '降維與分群——在單細胞解析度下辨識細胞型態與狀態。',
        en: 'Dimensionality reduction and clustering—identifying cell types and states at single-cell resolution.',
      },
    },
    {
      num: 'M6',
      weeks: '2026/11/11',
      name: { zh: '空間轉錄體學', en: 'Spatial Transcriptomics' },
      summary: {
        zh: '保留空間資訊的基因表現分析——把細胞放回組織原位。',
        en: 'Gene expression with spatial context—putting cells back in place within the tissue.',
      },
    },
  ],
};

export const dataStructuresAlgorithms: Lesson = {
  slug: 'data-structures-algorithms',
  accent: 'leaf',
  name: { zh: '資料結構與演算法', en: 'Data Structures and Algorithms' },
  tagline: {
    zh: '記憶體模型到動態規劃的實作導向課程；每種資料結構都對應生醫應用——急診檢傷佇列（heap）、病房巡房名單（linked list）、醫學詞彙自動完成（Trie）。',
    en: 'Implementation-driven course from memory models to dynamic programming; each data structure maps to a biomedical build—ER triage queues (heaps), ward round lists (linked lists), medical-term autocomplete (tries).',
  },
  goal: {
    zh: '將邏輯化為演算法，並解決問題——每種資料結構都親手實作一次，用程式把抽象結構變成可運作的系統。',
    en: 'Turn logic into algorithms that solve problems—implement every data structure yourself and build abstract structures into working systems.',
  },
  modules: [
    {
      num: 'M1',
      weeks: 'W1–W4',
      name: { zh: '基礎線性資料結構與記憶體操作', en: 'Linear Structures & Memory' },
      summary: {
        zh: '記憶體模型、陣列與指標、堆疊佇列與鏈結串列——親手操作記憶體，理解資料「怎麼被放」。',
        en: 'Memory models, arrays and pointers, stacks/queues and linked lists—handle memory yourself and see how data actually lives.',
      },
      case: {
        week: 'W4',
        title: { zh: '病房巡房名單', en: 'The ward-round list' },
        body: {
          zh: '以鏈結串列實作可動態增刪病患的巡房名單——出入院只是改兩個指標的事。',
          en: 'A linked-list ward-round list that grows and shrinks with every admission—insertion and deletion are just a couple of pointer updates.',
        },
      },
    },
    {
      num: 'M2',
      weeks: 'W5–W7',
      name: { zh: '搜尋與樹狀結構', en: 'Search & Trees' },
      summary: {
        zh: '從二分搜尋到二元搜尋樹與字典樹——把「找東西」變成對數時間的藝術。',
        en: 'From binary search to BSTs and tries—turning “look it up” into logarithmic-time art.',
      },
      case: {
        week: 'W6',
        title: { zh: '醫學詞彙自動完成', en: 'Medical autocomplete' },
        body: {
          zh: '輸入法為什麼能在一毫秒內跳出 “Taipei”？用 Trie（字典樹）為醫學專有名詞與基因片段打造自動完成檢索。',
          en: 'How does a keyboard suggest “Taipei” in a millisecond? Build autocomplete for medical terms and genetic motifs with a trie.',
        },
      },
    },
    {
      num: 'M3',
      weeks: 'W8–W13',
      name: { zh: '排序與動態規劃', en: 'Sorting & Dynamic Programming' },
      summary: {
        zh: '分治、堆積、貪婪到動態規劃——從排序的極限走向最佳化問題的核心方法。',
        en: 'Divide-and-conquer, heaps, greedy and dynamic programming—from the limits of sorting to the core of optimization.',
      },
      case: {
        week: 'W9',
        title: { zh: '急診檢傷佇列', en: 'The ER triage queue' },
        body: {
          zh: '以 Max-Heap 實作急診檢傷分類佇列，確保最危險的病患永遠排在隊伍最前面。',
          en: 'A max-heap triage queue for the emergency room, guaranteeing the most critical patient is always first in line.',
        },
      },
    },
    {
      num: 'M4',
      weeks: 'W14–W16',
      name: { zh: '圖論演算法', en: 'Graph Algorithms' },
      summary: {
        zh: '圖的走訪、拓撲排序與最短路徑——用圖建模一切會連動的系統。',
        en: 'Traversals, topological sort and shortest paths—modeling any system that connects.',
      },
      case: {
        week: 'W15',
        title: { zh: '代謝網路的最短路徑', en: 'Shortest paths in metabolism' },
        body: {
          zh: '把反應的能耗當作邊的權重，用 Dijkstra 在代謝網路中找出能量消耗最小的反應路徑。',
          en: 'Weight reactions by their energy cost and let Dijkstra find the cheapest path through the metabolic network.',
        },
      },
    },
  ],
};

export const smartHealthcareBigData: Lesson = {
  slug: 'smart-healthcare-big-data',
  accent: 'sky',
  name: { zh: '智慧醫療大數據分析與實務', en: 'Big Data Analytics for Smart Healthcare' },
  tagline: {
    zh: '醫療資料的取得、清理、分析到視覺化的完整實務流程。',
    en: 'Hands-on pipeline for healthcare data: acquisition, cleaning, analysis and visualization.',
  },
  goal: {
    zh: '從臨床場景出發，親手走過醫療大數據的完整實務——取得、清理、分析到視覺化。',
    en: 'Starting from real clinical scenarios, work hands-on through healthcare big data—acquisition, cleaning, analysis and visualization.',
  },
  modules: [
    {
      num: 'M1',
      weeks: '2026/09/15',
      name: { zh: '基因體學介紹與臨床應用場景', en: 'Genomics & Clinical Scenarios' },
      summary: {
        zh: '基因體學基礎與臨床應用場景導覽。',
        en: 'Foundations of genomics and a tour of clinical application scenarios.',
      },
    },
    {
      num: 'M2',
      weeks: '2026/09/22',
      name: { zh: '數據儲存庫與序列比對演算法', en: 'Data Repositories & Sequence Alignment' },
      summary: {
        zh: '公開基因體數據儲存庫，與序列比對演算法的核心邏輯。',
        en: 'Public genomics data repositories and the core logic of sequence alignment algorithms.',
      },
    },
    {
      num: 'M3',
      weeks: '2026/09/29',
      name: { zh: '變異點偵測與基因標記', en: 'Variant Detection & Genetic Markers' },
      summary: {
        zh: '從定序資料偵測變異點，連結疾病風險的基因標記。',
        en: 'Detecting variants from sequencing data and linking them to disease-risk markers.',
      },
    },
    {
      num: 'M4',
      weeks: '2026/10/06',
      name: { zh: '單細胞基因體學', en: 'Single-Cell Genomics' },
      summary: {
        zh: '在單細胞解析度下分析基因體數據。',
        en: 'Analyzing genomic data at single-cell resolution.',
      },
    },
  ],
};

export const discreteMath: Lesson = {
  slug: 'discrete-math',
  accent: 'sky',
  name: { zh: '離散數學', en: 'Discrete Mathematics' },
  tagline: {
    zh: '從邏輯與證明到圖論與組合最佳化；每週搭配臨床與生醫轉譯案例——醫療 AI 的邏輯誤區、GWAS 基因檢索、V(D)J 重組的組合學、德布魯因圖基因體組裝。',
    en: 'From logic and proofs to graph theory and combinatorial optimization, with weekly clinical and biomedical translation cases—logic pitfalls in medical AI, GWAS retrieval, combinatorics of V(D)J recombination, de Bruijn-graph genome assembly.',
  },
  goal: {
    zh: '用邏輯拆解問題——建立嚴謹的數學思維，掌握演算法底層的離散結構，並能將真實世界問題（特別是生醫問題）抽象化為數學模型。',
    en: 'Learn to take problems apart with logic—build rigorous mathematical thinking, master the discrete structures beneath algorithms, and translate real-world (especially biomedical) problems into mathematical models.',
  },
  modules: [
    {
      num: 'M1',
      weeks: 'W1–W3',
      name: { zh: '邏輯、證明與基本結構', en: 'Logic, Proofs, and Foundations' },
      summary: {
        zh: '命題與述詞邏輯、證明方法、集合與函數——後續所有單元共通的語言基礎。',
        en: 'Propositional and predicate logic, proof techniques, sets and functions—the shared language for everything that follows.',
      },
      case: {
        week: 'W1',
        title: { zh: '醫療 AI 的邏輯誤區', en: 'When medical AI gets its logic wrong' },
        body: {
          zh: '臨床決策支援系統中，把 AND 與 OR 搞混（誤用 De Morgan 定律）看似小錯，卻可能釀成致命的給藥錯誤。',
          en: 'In clinical decision-support rules, mixing up AND with OR (misapplying De Morgan’s laws) is a small slip that can cause a fatal medication error.',
        },
      },
    },
    {
      num: 'M2',
      weeks: 'W4–W6',
      name: { zh: '演算法、數論與遞迴', en: 'Algorithms, Number Theory, and Recursion' },
      summary: {
        zh: '時間複雜度分析、同餘運算與進位制、數學歸納法與遞迴——演算法設計的數學底層。',
        en: 'Complexity analysis, modular arithmetic and number bases, induction and recursion—the mathematics beneath algorithm design.',
      },
      case: {
        week: 'W5',
        title: { zh: 'DNA 的 2-bit 壓縮', en: 'DNA as 2-bit code' },
        body: {
          zh: '以二進位與位元運算將 A、C、G、T 編碼為 2 位元，讓全基因體大數據塞進有限的記憶體。',
          en: 'Encoding A, C, G, T as two bits each—bit-level arithmetic that fits whole-genome data into memory.',
        },
      },
    },
    {
      num: 'M3',
      weeks: 'W7–W8',
      name: { zh: '計數與機率', en: 'Counting and Discrete Probability' },
      summary: {
        zh: '排列組合、鴿籠原理、條件機率與貝氏定理——刻畫「可能性」的工具箱。',
        en: 'Combinatorics, the pigeonhole principle, conditional probability and Bayes’ theorem—a toolkit for reasoning about possibility.',
      },
      case: {
        week: 'W7',
        title: { zh: '免疫系統的組合學', en: 'The combinatorics of immunity' },
        body: {
          zh: 'B 細胞透過 V(D)J 基因重組產生數十億種抗體；同一套計數原理，也決定了抗癌藥物雞尾酒療法要搜索的組合空間。',
          en: 'B cells generate billions of antibodies through V(D)J recombination; the same counting shows how vast the search space of cancer drug cocktails really is.',
        },
      },
    },
    {
      num: 'M4',
      weeks: 'W10–W11',
      name: { zh: '進階計數與關係', en: 'Advanced Counting & Relations' },
      summary: {
        zh: '遞迴關係與分治法、關係與等價——用數學結構描述會成長、會分岔的系統。',
        en: 'Recurrence relations, divide-and-conquer, relations and equivalence—mathematical structure for systems that grow and branch.',
      },
      case: {
        week: 'W10',
        title: { zh: '癌細胞增生與 R₀', en: 'Cancer growth and R₀' },
        body: {
          zh: '以遞迴關係式模擬癌細胞在離散時間點的分裂增長；同樣的數學，也預測傳染病的基本傳染數 R₀。',
          en: 'Recurrence relations model how cancer cells divide across discrete time steps—the same math predicts an epidemic’s basic reproduction number R₀.',
        },
      },
    },
    {
      num: 'M5',
      weeks: 'W12–W16',
      name: { zh: '圖論與樹狀結構', en: 'Graph Theory and Trees' },
      summary: {
        zh: '圖的表示與走訪、最短路徑、樹狀結構、布林代數與有限狀態機——網路世界的完整工具箱。',
        en: 'Graph representations and traversals, shortest paths, trees, Boolean algebra and finite-state machines—the complete toolkit for networked systems.',
      },
      case: {
        week: 'W13',
        title: { zh: '從七橋問題到基因體組裝', en: 'From the Seven Bridges to genome assembly' },
        body: {
          zh: '以德布魯因圖與尤拉路徑，在線性時間內將 30 億個被打碎的 DNA 短序列拼回完整基因體。',
          en: 'De Bruijn graphs and Euler paths reassemble billions of shattered DNA reads into a complete genome in linear time.',
        },
      },
    },
  ],
};
