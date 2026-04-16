// Fragment 示例：当你不想多一个多余的 DOM 元素时使用

// 错误示范：用 div 包裹会多出一层无意义的 DOM
function WithDiv() {
    return (
        <div>
            <dt>React</dt>
            <dd>一个用于构建用户界面的 JavaScript 库</dd>
        </div>
    );
}

// 正确写法一：React.Fragment 完整写法（可以加 key，用于列表）
import { Fragment } from "react";

function WithFragment() {
    return (
        <Fragment>
            <dt>React</dt>
            <dd>一个用于构建用户界面的 JavaScript 库</dd>
        </Fragment>
    );
}

// 正确写法二：短语法 <>...</>（不能加属性/key）
function WithShortFragment() {
    return (
        <>
            <dt>React</dt>
            <dd>一个用于构建用户界面的 JavaScript 库</dd>
        </>
    );
}

// 在列表中使用 Fragment（此时必须用完整写法以便加 key）
interface Term {
    id: number;
    title: string;
    desc: string;
}

export default function GlossaryList() {
    const terms: Term[] = [
        { id: 1, title: "React",  desc: "用于构建 UI 的 JS 库" },
        { id: 2, title: "Vite",   desc: "新一代前端构建工具" },
        { id: 3, title: "JSX",    desc: "JavaScript 的语法扩展" },
    ];

    return (
        <dl>
            {terms.map((term) => (
                // 列表中的 Fragment 必须用完整写法才能加 key
                <Fragment key={term.id}>
                    <dt className="font-bold">{term.title}</dt>
                    <dd className="ml-4 text-gray-600">{term.desc}</dd>
                </Fragment>
            ))}
        </dl>
    );
}
