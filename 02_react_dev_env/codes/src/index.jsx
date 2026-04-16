import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App name="ABC"/>);
// 等同于 root.render(App({ name: "ABC" }));
