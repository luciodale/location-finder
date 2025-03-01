import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";

const node = document.getElementById("root");

if (!node) throw new Error("root node not found in html");

ReactDOM.createRoot(node).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
