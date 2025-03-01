import { useState, useEffect, useCallback } from "react";
import { browserInfo } from "../utils/browserInfo";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { nanoid } from "nanoid";
import type { TBrowserInfo } from "../types";

const ADJECTIVES = [
	"happy",
	"sleepy",
	"bouncy",
	"clever",
	"silly",
	"friendly",
	"sneaky",
	"fluffy",
];
const COLORS = [
	"red",
	"blue",
	"green",
	"purple",
	"golden",
	"silver",
	"rainbow",
	"cosmic",
];
const ANIMALS = [
	"panda",
	"fox",
	"penguin",
	"koala",
	"tiger",
	"dragon",
	"unicorn",
	"cat",
];

function generateFunId() {
	const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
	const color = COLORS[Math.floor(Math.random() * COLORS.length)];
	const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
	const id = nanoid(6);
	return `${adjective}-${color}-${animal}-${id}`;
}

// Custom hook for persistent user identity
function usePersistentIdentity() {
	const [userId, setUserId] = useState<string | null>(null);

	// Function to store ID in localStorage
	const storeId = useCallback((id: string) => {
		try {
			localStorage.setItem("userId", id);
		} catch (error) {
			console.error("Error storing identity:", error);
		}
	}, []);

	// Function to retrieve ID from localStorage
	const retrieveId = useCallback((): string | null => {
		try {
			return localStorage.getItem("userId");
		} catch (error) {
			console.error("Error retrieving identity:", error);
			return null;
		}
	}, []);

	useEffect(() => {
		// Initial load of user ID
		const id = retrieveId();
		if (id) setUserId(id);

		// Listen for storage events (in case another tab changes the ID)
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === "userId" && event.newValue) {
				setUserId(event.newValue);
			}
		};

		// Listen for visibility changes
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden" && userId) {
				storeId(userId);
			}
		};

		// Listen for beforeunload
		const handleBeforeUnload = () => {
			if (userId) {
				storeId(userId);
			}
		};

		// Listen for focus/blur
		const handleBlur = () => {
			if (userId) {
				storeId(userId);
			}
		};

		// Set up listeners
		window.addEventListener("storage", handleStorageChange);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("beforeunload", handleBeforeUnload);
		window.addEventListener("blur", handleBlur);

		// Check periodically for localStorage changes
		const interval = setInterval(() => {
			const storedId = localStorage.getItem("userId");
			if (!storedId && userId) {
				// If ID was cleared, restore it
				storeId(userId);
			}
		}, 1000);

		// Cleanup
		return () => {
			window.removeEventListener("storage", handleStorageChange);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("blur", handleBlur);
			clearInterval(interval);
		};
	}, [userId, storeId, retrieveId]);

	const handleRememberMe = () => {
		const newUserId = generateFunId();
		storeId(newUserId);
		setUserId(newUserId);
	};

	return { userId, handleRememberMe };
}

export function BrowserInfoDisplay() {
	const [info, setInfo] = useState<TBrowserInfo | null>(null);
	const { userId, handleRememberMe } = usePersistentIdentity();

	useEffect(() => {
		const fetchInfo = async () => {
			const baseInfo = { ...browserInfo };
			const batteryInfo = await baseInfo.battery;
			const storageEstimate = await baseInfo.storage.storageEstimate;
			const persistentStorage = await baseInfo.storage.persistentStorage;

			setInfo({
				...baseInfo,
				battery: batteryInfo,
				storage: {
					storageEstimate,
					persistentStorage,
				},
			});
		};

		fetchInfo();
	}, []);

	if (!info) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading...
			</div>
		);
	}

	const camelToSpacedWords = (str: string): string => {
		return (
			str
				// Insert space before capital letters
				.replace(/([A-Z])/g, " $1")

				// Capitalize first letter and handle acronyms
				.replace(/^./, (str) => str.toUpperCase())
				// Handle special acronyms
				.replace(/\bXr\b/g, "XR")
				.replace(/\bWebgl\b/g, "WebGL")
				.replace(/\bApi\b/g, "API")
				.replace(/\bRtt\b/g, "RTT")
				.replace(/\bJsHeap\b/g, "JS Heap")
				.replace(/\bU R L\b/g, "URL")
				.trim()
		);
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const renderValue = (value: any): React.ReactNode => {
		if (value === null || value === undefined || value === "Not available") {
			return <span className="text-muted-foreground">Not available</span>;
		}
		if (typeof value === "boolean") {
			return value ? "Yes" : "No";
		}
		if (typeof value === "object" && !Array.isArray(value)) {
			return <div className="pt-1">{renderObject(value, true)}</div>;
		}
		if (Array.isArray(value)) {
			return value.join(", ");
		}
		return String(value);
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const renderObject = (obj: Record<string, any>, isNested?: boolean) => {
		if (!obj || typeof obj !== "object") {
			return <span className="text-muted-foreground">Not available</span>;
		}

		return (
			<div className="space-y-1">
				{Object.entries(obj).map(([key, value]) => (
					<div key={key} className="grid grid-cols-2 gap-2">
						<span
							className={`font-medium ${isNested ? "text-xs" : "text-sm"} break-words`}
						>
							{camelToSpacedWords(key)}:
						</span>
						<span className={isNested ? "text-xs" : "text-sm"}>
							{renderValue(value)}
						</span>
					</div>
				))}
			</div>
		);
	};

	return (
		<Card className="w-full">
			<CardContent className="text-left px-6">
				<Tabs defaultValue="fingerprint">
					<TabsList className="mx-auto grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-6 mb-4">
						<TabsTrigger value="fingerprint">Identity</TabsTrigger>
						<TabsTrigger value="navigator">Navigator</TabsTrigger>
						<TabsTrigger value="window">Window</TabsTrigger>
						<TabsTrigger value="screen">Screen</TabsTrigger>
						<TabsTrigger value="hardware">Hardware</TabsTrigger>
						<TabsTrigger value="performance">Performance</TabsTrigger>
						<TabsTrigger value="apis">APIs</TabsTrigger>
					</TabsList>
					<div className="mx-auto md:w-xl overflow-y-auto min-h-[600px] max-h-[600px] mt-30 md:mt-0">
						<TabsContent value="fingerprint">
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold mb-2">
										{userId ? "Welcome back!" : "Hello stranger!"}
									</h3>
									{userId ? (
										<div className="space-y-4">
											<p className="text-lg">
												Welcome back,{" "}
												<span className="font-medium text-primary">
													{userId}
												</span>
												! 👋
											</p>
											<p className="text-sm text-muted-foreground">
												I remember you from your last visit! Want to play hide
												and seek again?
											</p>
										</div>
									) : (
										<div className="space-y-4">
											<p className="text-sm text-muted-foreground mb-4">
												Click the button below and I'll remember you next time
												you visit!
											</p>
											<button
												type="button"
												onClick={handleRememberMe}
												className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
											>
												Remember me! 🎭
											</button>
										</div>
									)}
								</div>
							</div>
						</TabsContent>
						<TabsContent value="navigator">
							<h3 className="text-lg font-semibold mb-2">
								Navigator Information
							</h3>
							{renderObject(info.navigator)}
						</TabsContent>
						<TabsContent value="window">
							<h3 className="text-lg font-semibold mb-2">Window Properties</h3>
							{renderObject(info.window)}
						</TabsContent>
						<TabsContent value="screen">
							<h3 className="text-lg font-semibold mb-2">Screen Information</h3>
							{renderObject(info.screen)}
						</TabsContent>
						<TabsContent value="hardware">
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold mb-2">Connection</h3>
									{typeof info.connection === "string"
										? info.connection
										: renderObject(info.connection)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Battery</h3>
									{typeof info.battery === "string"
										? info.battery
										: renderObject(info.battery)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">
										Hardware Interfaces
									</h3>
									{renderObject(info.hardware)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Sensors</h3>
									{renderObject(info.sensors)}
								</div>
							</div>
						</TabsContent>
						<TabsContent value="performance">
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold mb-2">Performance</h3>
									{renderObject(info.performance)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Storage</h3>
									{renderObject(info.storage)}
								</div>
							</div>
						</TabsContent>
						<TabsContent value="apis">
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold mb-2">WebGL</h3>
									{typeof info.webGL === "string"
										? info.webGL
										: renderObject(info.webGL)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Canvas</h3>
									{typeof info.canvas === "string"
										? info.canvas
										: renderObject(info.canvas)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Media Devices</h3>
									{renderObject(info.mediaDevices)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Speech</h3>
									{renderObject(info.speech)}
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Other APIs</h3>
									{renderObject({
										payment: info.payment,
										gamepad: info.gamepad,
										fonts: info.fonts,
										vibration: info.vibration,
										webShare: info.webShare,
										xr: info.xr,
										credentials: info.credentials,
									})}
								</div>
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</CardContent>
		</Card>
	);
}
