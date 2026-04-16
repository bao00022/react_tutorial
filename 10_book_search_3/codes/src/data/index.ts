export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  year: number;
}

// 确定性伪随机，相同 seed 永远返回相同值，保证书单稳定
function r(seed: number): number {
  return Math.abs((Math.sin(seed) * 43758.5453) % 1);
}

const WORDS_A = ["中国", "现代", "当代", "近代", "古典", "比较", "批判", "转型", "全球", "东方"];
const WORDS_B = ["历史", "政治", "社会", "经济", "文化", "思想", "制度", "哲学", "文明", "伦理"];
const WORDS_C = ["研究", "导论", "新论", "概论", "史论", "反思", "重建", "探析", "述论", "讲义"];
const AUTHORS = ["王明远", "陈光武", "李思哲", "刘文彬", "张秀英", "赵国华", "周建民", "吴清华", "郑晓东", "马力平"];
const CATEGORIES = ["历史", "哲学", "政治学", "经济学", "社会学", "文学"];

export const BOOKS: Book[] = Array.from({ length: 200 }, (_, i) => {
  const s = i + 1;
  return {
    id: `b${String(s).padStart(3, "0")}`,
    title: `${WORDS_A[Math.floor(r(s) * 10)]}${WORDS_B[Math.floor(r(s * 3) * 10)]}${WORDS_C[Math.floor(r(s * 7) * 10)]}`,
    author: AUTHORS[Math.floor(r(s * 11) * 10)],
    category: CATEGORIES[Math.floor(r(s * 13) * 6)],
    price: Math.floor(r(s * 17) * 180) + 20,
    year: Math.floor(r(s * 19) * 35) + 1990,
  };
});
