export type IPInfo = {
	ip: string;
	city: string;
	region: string;
	country_name: string;
	org: string;
};

export type Location = {
	lat: number;
	lng: number;
	accuracy?: number;
	timestamp?: string;
};

export type TBrowserInfo = {
	navigator: {
		userAgent: string;
		language: string;
		languages: readonly string[];
		onLine: boolean;
		hardwareConcurrency: number;
		maxTouchPoints: number;
		pdfViewerEnabled: boolean;
		cookieEnabled: boolean;
		deviceMemory?: number | "Not available";
	};
	window: {
		innerHeight: number;
		innerWidth: number;
		outerHeight: number;
		outerWidth: number;
		scrollX: number;
		scrollY: number;
		devicePixelRatio: number;
	};
	screen: {
		availHeight: number;
		availWidth: number;
		colorDepth: number;
		height: number;
		width: number;
		pixelDepth: number;
		orientation: {
			type?: OrientationType;
			angle?: number;
		};
	};
	connection:
		| {
				effectiveType?: string;
				downlink?: number;
				rtt?: number;
				saveData?: boolean;
		  }
		| "Not available";
	battery:
		| {
				charging?: boolean;
				chargingTime?: number;
				dischargingTime?: number;
				level?: number;
		  }
		| "Not available";
	performance: {
		memory?:
			| {
					jsHeapSizeLimit?: number;
					totalJSHeapSize?: number;
					usedJSHeapSize?: number;
			  }
			| "Not available";
	};
	mediaDevices: {
		mediaDevicesSupported: boolean;
	};
	storage: {
		storageEstimate:
			| Promise<{
					quota: number | "Not available";
					usage: number | "Not available";
			  }>
			| {
					quota: number | "Not available";
					usage: number | "Not available";
			  };
		persistentStorage:
			| Promise<{
					persisted: boolean | "Not Available";
			  }>
			| {
					persisted: boolean | "Not Available";
			  };
	};
	webGL:
		| {
				vendor?: string;
				renderer?: string;
				version?: string;
				shadingLanguageVersion?: string;
				extensions?: string[];
		  }
		| "Not available";
	canvas:
		| {
				available: boolean;
				dataURL: string;
		  }
		| "Not available";
	timezone: {
		timezone: string;
	};
	sensors: {
		deviceOrientation: boolean;
		deviceMotion: boolean;
		absoluteOrientation: boolean;
		accelerometer: boolean;
		gyroscope: boolean;
		magnetometer: boolean;
		ambientLightSensor: boolean;
	};
	hardware: {
		bluetooth: boolean;
		usb: boolean;
		serial: boolean;
		hid: boolean;
		nfc: boolean;
	};
	speech: {
		speechRecognition: boolean;
		speechSynthesis: boolean;
		voices: number;
	};
	payment: {
		paymentRequest: boolean;
	};
	gamepad: {
		api: boolean;
		gamepads: number;
	};
	fonts: {
		api: boolean;
	};
	vibration: boolean;
	webShare: {
		share: boolean;
		shareFiles: boolean;
	};
	xr: {
		vrSupported: boolean;
	};
	credentials: {
		api: boolean;
		publicKeyCredential: boolean;
	};
};
