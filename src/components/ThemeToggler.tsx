import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggler() {
	const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
		if (typeof window !== "undefined") {
			return localStorage.theme || "system";
		}
		return "system";
	});

	useEffect(() => {
		const root = window.document.documentElement;
		if (theme === "system") {
			localStorage.removeItem("theme");
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		} else {
			localStorage.theme = theme;
			if (theme === "dark") {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		}
	}, [theme]);

	const toggleTheme = (newTheme: "light" | "dark" | "system") => {
		setTheme(newTheme);
	};

	return (
		<div className="mx-auto mt-4 flex justify-center items-center w-fit space-x-2 p-2 mb-4 dark:bg-neutral-900 bg-gray-100 rounded-md">
			<button
				type="button"
				onClick={() => toggleTheme("light")}
				className={`p-2 rounded-md transition-colors ${
					theme === "light"
						? "bg-red-100 text-red-600"
						: "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
				}`}
				aria-label="Light mode"
			>
				<Sun size={20} />
			</button>
			<button
				type="button"
				onClick={() => toggleTheme("dark")}
				className={`p-2 rounded-md transition-colors ${
					theme === "dark"
						? "bg-red-100 text-red-600"
						: "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
				}`}
				aria-label="Dark mode"
			>
				<Moon size={20} />
			</button>
			<button
				type="button"
				onClick={() => toggleTheme("system")}
				className={`p-2 rounded-md transition-colors ${
					theme === "system"
						? "bg-red-100 text-red-600"
						: "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
				}`}
				aria-label="System preference"
			>
				<Monitor size={20} />
			</button>
		</div>
	);
}
