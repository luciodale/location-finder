import { BrowserInfoDisplay } from "./components/BrowserInfoDisplay";
import { Earth3D } from "./components/Earth3D";
import { ThemeToggler } from "./components/ThemeToggler";
import { Card } from "./components/ui/card";

export function App() {
	return (
		<div className="max-w-screen-xl mx-auto p-4">
			<ThemeToggler />

			<div className="text-center mb-4">
				<h1 className="text-3xl font-bold">🕵️‍♂️ Browser Detective</h1>
				<p className="text-lg text-muted-foreground mt-2">
					Peek behind the curtain - you won't believe what your browser reveals!
				</p>
			</div>

			<div className="flex flex-col-reverse lg:flex-row gap-4 justify-center items-stretch">
				<div className="w-full">
					<BrowserInfoDisplay />
				</div>
				<Card className="lg:w-[50%]">
					<Earth3D />
				</Card>
			</div>
		</div>
	);
}
