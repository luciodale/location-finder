import type { TBrowserInfo } from "../types";

export const browserInfo = {
	navigator: {
		userAgent: navigator.userAgent,
		language: navigator.language,
		languages: navigator.languages,
		onLine: navigator.onLine,
		hardwareConcurrency: navigator.hardwareConcurrency,
		maxTouchPoints: navigator.maxTouchPoints,
		pdfViewerEnabled: navigator.pdfViewerEnabled,
		cookieEnabled: navigator.cookieEnabled,
		deviceMemory: (() => {
			if (!("deviceMemory" in navigator)) return "Not available";
			return (navigator as { deviceMemory?: number }).deviceMemory;
		})(),
	},
	window: {
		innerHeight: window.innerHeight,
		innerWidth: window.innerWidth,
		outerHeight: window.outerHeight,
		outerWidth: window.outerWidth,
		scrollX: window.scrollX,
		scrollY: window.scrollY,
		devicePixelRatio: window.devicePixelRatio,
	},
	screen: {
		availHeight: window.screen.availHeight,
		availWidth: window.screen.availWidth,
		colorDepth: window.screen.colorDepth,
		height: window.screen.height,
		width: window.screen.width,
		pixelDepth: window.screen.pixelDepth,
		orientation: {
			type: window.screen.orientation?.type ?? "Not available",
			angle: window.screen.orientation?.angle ?? "Not available",
		},
	},
	connection: (() => {
		if (!("connection" in navigator)) return "Not available";
		const conn = navigator.connection as object | undefined;
		if (!conn) return "Not available";

		const result: Record<string, unknown> = {};
		if ("effectiveType" in conn) result.effectiveType = conn.effectiveType;
		if ("downlink" in conn) result.downlink = conn.downlink;
		if ("rtt" in conn) result.rtt = conn.rtt;
		if ("saveData" in conn) result.saveData = conn.saveData;

		return Object.keys(result).length ? result : "Not available";
	})(),
	battery: (() => {
		if (!("getBattery" in navigator)) return {};
		const nav = navigator as {
			getBattery(): Promise<{
				charging: boolean;
				chargingTime: number;
				dischargingTime: number;
				level: number;
			}>;
		};
		return nav.getBattery().then((battery) => ({
			charging: battery.charging,
			chargingTime: battery.chargingTime,
			dischargingTime: battery.dischargingTime,
			level: battery.level,
		}));
	})(),
	performance: {
		memory: (() => {
			if (!("memory" in performance)) return "Not available";
			const mem = performance.memory as object | undefined;
			if (!mem) return "Not available";

			const result: Record<string, unknown> = {};
			if ("jsHeapSizeLimit" in mem)
				result.jsHeapSizeLimit = mem.jsHeapSizeLimit;
			if ("totalJSHeapSize" in mem)
				result.totalJSHeapSize = mem.totalJSHeapSize;
			if ("usedJSHeapSize" in mem) result.usedJSHeapSize = mem.usedJSHeapSize;

			return Object.keys(result).length ? result : "Not available";
		})(),
	},
	mediaDevices: {
		mediaDevicesSupported: !!navigator.mediaDevices,
	},
	storage: {
		storageEstimate: (async () => {
			if (!("storage" in navigator) || !navigator.storage?.estimate) {
				return {
					quota: "Not available" as const,
					usage: "Not available" as const,
				};
			}
			const estimate = await navigator.storage.estimate();
			return {
				quota: estimate?.quota ?? "Not available",
				usage: estimate?.usage ?? "Not available",
			};
		})(),
		persistentStorage: (async () => {
			if (!("storage" in navigator) || !navigator.storage?.persist) {
				return {
					persisted: "Not Available" as const,
				};
			}
			const persisted = await navigator.storage.persist();
			return {
				persisted: persisted ?? "Not Available",
			};
		})(),
	},
	webGL: (() => {
		try {
			const canvas = document.createElement("canvas");
			const gl = (canvas.getContext("webgl") ||
				canvas.getContext(
					"experimental-webgl",
				)) as WebGLRenderingContext | null;

			if (!gl) return "Not available";

			const result: Record<string, unknown> = {};

			try {
				result.vendor = gl.getParameter(gl.VENDOR);
			} catch {}
			try {
				result.renderer = gl.getParameter(gl.RENDERER);
			} catch {}
			try {
				result.version = gl.getParameter(gl.VERSION);
			} catch {}
			try {
				result.shadingLanguageVersion = gl.getParameter(
					gl.SHADING_LANGUAGE_VERSION,
				);
			} catch {}
			try {
				result.extensions = gl.getSupportedExtensions();
			} catch {}

			return Object.keys(result).length ? result : "Not available";
		} catch {
			return "Not available";
		}
	})(),
	canvas: (() => {
		try {
			const canvas = document.createElement("canvas");
			canvas.width = 200;
			canvas.height = 50;

			const context = canvas.getContext("2d");
			if (!context) return "Not available";

			try {
				context.font = "18px Arial";
				context.fillText("Browser Info", 10, 30);

				return {
					available: true,
					dataURL: "Canvas data available (not shown for privacy)",
				} as const;
			} catch {
				return "Not available";
			}
		} catch {
			return "Not available";
		}
	})(),
	timezone: {
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	},
	sensors: {
		deviceOrientation: "DeviceOrientationEvent" in window,
		deviceMotion: "DeviceMotionEvent" in window,
		absoluteOrientation: "AbsoluteOrientationSensor" in window,
		accelerometer: "Accelerometer" in window,
		gyroscope: "Gyroscope" in window,
		magnetometer: "Magnetometer" in window,
		ambientLightSensor: "AmbientLightSensor" in window,
	},
	hardware: {
		bluetooth: "bluetooth" in navigator,
		usb: "usb" in navigator,
		serial: "serial" in navigator,
		hid: "hid" in navigator,
		nfc: "nfc" in navigator,
	},
	speech: {
		speechRecognition:
			"SpeechRecognition" in window || "webkitSpeechRecognition" in window,
		speechSynthesis: "speechSynthesis" in window,
		voices:
			"speechSynthesis" in window
				? window.speechSynthesis.getVoices().length
				: 0,
	},
	payment: {
		paymentRequest: "PaymentRequest" in window,
	},
	gamepad: {
		api: "getGamepads" in navigator,
		gamepads: "getGamepads" in navigator ? navigator.getGamepads().length : 0,
	},
	fonts: {
		api: "queryLocalFonts" in window,
	},
	vibration: "vibrate" in navigator,
	webShare: {
		share: "share" in navigator,
		shareFiles: "share" in navigator && "canShare" in navigator,
	},
	xr: {
		vrSupported: "xr" in navigator && !!navigator.xr,
	},
	credentials: {
		api: "credentials" in navigator,
		publicKeyCredential: !!window.PublicKeyCredential,
	},
} satisfies TBrowserInfo;
