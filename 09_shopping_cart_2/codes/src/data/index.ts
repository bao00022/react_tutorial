import book1 from "../assets/book1.jpg";
import book2 from "../assets/book2.jpg";
import book3 from "../assets/book3.jpg";
import book4 from "../assets/book4.jpg";
import book5 from "../assets/book5.png";
import book6 from "../assets/book6.jpg";

export interface Product {
  id: string;
  image: string;
  title: string;
  price: number;
  description: string;
}

export interface CartItem {
  item: Product;
  quantity: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    image: book1,
    title: "秦汉史讲义",
    price: 29.99,
    description: "通过分析秦汉制度与社会结构，揭示中国早期大一统体制中专制权力与民间活力之间的张力。",
  },
  {
    id: "p2",
    image: book2,
    title: "田园诗与狂想曲",
    price: 39.99,
    description: "以理想化的“田园乌托邦”与现实制度困境的对照，反思绝对平均主义与自由缺失带来的问题。",
  },
  {
    id: "p3",
    image: book3,
    title: "共同的底线",
    price: 49.99,
    description: "在多元价值冲突中，应先确立保障自由、法治与基本人权的“最低共识”，作为社会运行的共同底线。",
  },
  {
    id: "p4",
    image: book4,
    title: "南非的启示",
    price: 19.99,
    description: "通过反思南非转型经验，强调在历史不公与现实矛盾中，必须兼顾正义与和解，才能实现社会的平稳转型。",
  },
  {
    id: "p5",
    image: book5,
    title: "传统十论",
    price: 59.99,
    description: "从历史与现实的双重视角反思中国传统社会结构及其对现代制度与价值选择的深层影响。",
  },
  {
    id: "p6",
    image: book6,
    title: "娜拉出走以后",
    price: 32.99,
    description: "真正的问题不在“娜拉是否出走”，而在缺乏制度性保障的社会里，出走之后的人如何生存与获得尊严。",
  },
];
