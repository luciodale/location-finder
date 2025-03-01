import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type LocationData = {
	organization_name: string;
	country_code: string;
	country_code3: string;
	continent_code: string;
	latitude: string;
	longitude: string;
	accuracy: number;
	asn: number;
	timezone: string;
	ip: string;
	organization: string;
	country: string;
	area_code: string;
};

type Coordinates = {
	lat: number;
	long: number;
};

// Constants
const MARKER_SCALE = {
	MIN: 1,
	MAX: 1.5,
	STEP: 0.02,
};

const CAMERA = {
	FOV: 75,
	NEAR: 0.1,
	FAR: 1000,
	DISTANCE_FACTOR: 2.5,
	MIN_DISTANCE_FACTOR: 1.5,
	MAX_DISTANCE_FACTOR: 4,
};

const COLORS = {
	MARKER: 0x00ff00,
	DARK: 0x0a0a0a,
	LIGHT: 0xffffff,
};

// Animation duration in milliseconds
const CAMERA_ANIMATION_DURATION = 1000;

const MESSAGES = {
	LOADING: "🔍 Looking for you...",
	LOADING_SUB: "Scanning the globe for your location",
	FOUND: "🌍 More or less found you!",
	FOUND_SUB: "Looks like we found your digital footprints...",
	PRECISE_LOCATION: "🎯 More Precision!",
	PRECISE_LOCATION_LOADING: "🕵️ Detective mode activated...",
	PRECISE_FOUND: "👋 Knock knock! Found you!",
	PRECISE_FOUND_SUB: "Wow, you're really there! No hiding now 😄",
};

export function Earth3D() {
	const containerRef = useRef<HTMLDivElement>(null);
	const markerRef = useRef<THREE.Mesh | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const [locationData, setLocationData] = useState<LocationData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPreciseLocationLoading, setIsPreciseLocationLoading] =
		useState(false);
	const [isPreciseLocation, setIsPreciseLocation] = useState(false);
	const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
	const updateMarkerPositionRef = useRef<
		((coords: Coordinates) => void) | null
	>(null);

	// Function to update marker position
	const updatePosition = useCallback((coords: Coordinates) => {
		if (markerRef.current && updateMarkerPositionRef.current) {
			updateMarkerPositionRef.current(coords);
			setCoordinates(coords);
		}
	}, []);

	// Handle precise location request
	const handlePreciseLocation = () => {
		if (!navigator.geolocation) {
			console.error("Geolocation is not supported by your browser");
			return;
		}

		setIsPreciseLocationLoading(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const newCoords = {
					lat: position.coords.latitude,
					long: position.coords.longitude,
				};
				updatePosition(newCoords);
				setIsPreciseLocation(true);
				setIsPreciseLocationLoading(false);
			},
			(error) => {
				console.error("Error getting precise location:", error);
				setIsPreciseLocationLoading(false);
			},
			{ enableHighAccuracy: true },
		);
	};

	useEffect(() => {
		if (!containerRef.current) return;

		const { scene, camera, renderer, controls, radius } = initScene();
		const cleanup = setupThemeObserver(scene);
		const earth = createEarth(radius);
		const marker = createMarker(radius);
		setupLighting(scene);

		scene.add(earth);
		scene.add(marker);
		markerRef.current = marker;
		sceneRef.current = scene;

		// Store the updateMarkerPosition function in the ref
		updateMarkerPositionRef.current = ({ lat, long }: Coordinates) => {
			if (!markerRef.current) return;

			// Convert latitude and longitude to radians
			const latRad = (90 - lat) * (Math.PI / 180);
			const lonRad = (long + 180) * (Math.PI / 180);

			// Convert from spherical to cartesian coordinates
			const x = -(radius * Math.sin(latRad) * Math.cos(lonRad));
			const y = radius * Math.cos(latRad);
			const z = radius * Math.sin(latRad) * Math.sin(lonRad);

			markerRef.current.position.set(x, y, z);
			markerRef.current.lookAt(0, 0, 0);
			markerRef.current.rotateX(Math.PI / 2);

			// Calculate target camera position
			const cameraDistance = radius * CAMERA.DISTANCE_FACTOR;
			const targetX = (x / radius) * cameraDistance;
			const targetY = (y / radius) * cameraDistance;
			const targetZ = (z / radius) * cameraDistance;

			// Store initial camera position
			const startX = camera.position.x;
			const startY = camera.position.y;
			const startZ = camera.position.z;

			// Animation variables
			let startTime: number | null = null;

			function animateCamera(currentTime: number) {
				if (!startTime) startTime = currentTime;
				const elapsed = currentTime - startTime;
				const progress = Math.min(elapsed / CAMERA_ANIMATION_DURATION, 1);

				// Smooth easing function
				const eased = 1 - (1 - progress) ** 3;

				// Interpolate camera position
				camera.position.x = startX + (targetX - startX) * eased;
				camera.position.y = startY + (targetY - startY) * eased;
				camera.position.z = startZ + (targetZ - startZ) * eased;

				camera.lookAt(0, 0, 0);
				controls.update();

				if (progress < 1) {
					requestAnimationFrame(animateCamera);
				}
			}

			requestAnimationFrame(animateCamera);
		};

		// Animation state
		let scale = MARKER_SCALE.MIN;
		let growing = true;
		let animationFrameId: number;

		function initScene() {
			const container = containerRef.current;
			if (!container) throw new Error("Container not found");

			const width = container.clientWidth;
			const height = container.clientHeight;
			const radius = Math.min(width, height) / 3;

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(
				CAMERA.FOV,
				width / height,
				CAMERA.NEAR,
				CAMERA.FAR,
			);
			const renderer = new THREE.WebGLRenderer({ antialias: true });

			renderer.setSize(width, height);
			renderer.setPixelRatio(window.devicePixelRatio);
			container.appendChild(renderer.domElement);

			camera.position.z = radius * CAMERA.DISTANCE_FACTOR;

			const controls = new OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.dampingFactor = 0.05;
			controls.enableZoom = true;
			controls.minDistance = radius * CAMERA.MIN_DISTANCE_FACTOR;
			controls.maxDistance = radius * CAMERA.MAX_DISTANCE_FACTOR;

			return { scene, camera, renderer, controls, radius };
		}

		function createEarth(radius: number) {
			const geometry = new THREE.SphereGeometry(radius, 64, 64);
			const material = new THREE.MeshStandardMaterial({
				roughness: 0.8,
				metalness: 0,
			});
			const earth = new THREE.Mesh(geometry, material);

			new THREE.TextureLoader().load("/earth_texture.jpg", (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;
				material.map = texture;
				material.needsUpdate = true;
			});

			return earth;
		}

		function createMarker(radius: number) {
			const geometry = new THREE.SphereGeometry(radius * 0.03, 16, 16);
			const material = new THREE.MeshBasicMaterial({ color: COLORS.MARKER });
			return new THREE.Mesh(geometry, material);
		}

		function setupLighting(scene: THREE.Scene) {
			const ambientLight = new THREE.AmbientLight(0xffffff, 1);
			const sunLight = new THREE.DirectionalLight(0xffffff, 5);
			sunLight.position.set(1, 0, 1);

			scene.add(ambientLight);
			scene.add(sunLight);
		}

		function setupThemeObserver(scene: THREE.Scene) {
			const isDark = document.documentElement.classList.contains("dark");
			scene.background = new THREE.Color(isDark ? COLORS.DARK : COLORS.LIGHT);

			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					if (mutation.attributeName === "class" && sceneRef.current) {
						const isDark = document.documentElement.classList.contains("dark");
						sceneRef.current.background = new THREE.Color(
							isDark ? COLORS.DARK : COLORS.LIGHT,
						);
					}
				}
			});

			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["class"],
			});

			return () => observer.disconnect();
		}

		function animate() {
			if (markerRef.current) {
				if (growing) {
					scale += MARKER_SCALE.STEP;
					if (scale >= MARKER_SCALE.MAX) growing = false;
				} else {
					scale -= MARKER_SCALE.STEP;
					if (scale <= MARKER_SCALE.MIN) growing = true;
				}
				markerRef.current.scale.set(scale, scale, scale);
			}

			controls.update();
			renderer.render(scene, camera);
			animationFrameId = requestAnimationFrame(animate);
		}

		function handleResize() {
			if (!containerRef.current) return;

			const width = containerRef.current.clientWidth;
			const height = containerRef.current.clientHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		}

		// Start animation
		animate();

		// Fetch initial location data
		fetch("/api/ip", {
			method: "GET",
		})
			.then((res) => res.json())
			.then((data: LocationData) => {
				setLocationData(data);
				const coords = {
					lat: Number.parseFloat(data.latitude),
					long: Number.parseFloat(data.longitude),
				};
				updatePosition(coords);
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));

		// Event listeners
		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => {
			cleanup();
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(animationFrameId);
			if (containerRef.current) {
				containerRef.current.removeChild(renderer.domElement);
			}
		};
	}, [updatePosition]);

	return (
		<div className="flex flex-col items-center space-y-4">
			{isLoading ? (
				<div className="text-center space-y-1 mb-2">
					<h2 className="text-2xl font-bold">{MESSAGES.LOADING}</h2>
					<p className="text-sm text-muted-foreground">
						{MESSAGES.LOADING_SUB}
					</p>
				</div>
			) : (
				locationData && (
					<div className="text-center space-y-1 mb-2">
						<h2 className="text-2xl font-bold">
							{isPreciseLocation ? MESSAGES.PRECISE_FOUND : MESSAGES.FOUND}
						</h2>
						<p className="text-sm text-muted-foreground">
							{isPreciseLocation
								? MESSAGES.PRECISE_FOUND_SUB
								: MESSAGES.FOUND_SUB}
						</p>
					</div>
				)
			)}
			<div ref={containerRef} className="w-[90%] aspect-square" />
			{locationData && (
				<div className="w-[90%] text-center space-y-2">
					<div className="md:grid flex flex-col justify-center md:grid-cols-3 gap-4 text-sm bg-muted rounded-lg p-4">
						<div className={isPreciseLocation ? "md:col-span-3" : ""}>
							<p>Location</p>
							<p className="text-xs">
								{!isPreciseLocation && locationData.country}
							</p>
							<div className="flex flex-col items-center gap-2">
								<p className="text-xs text-muted-foreground">
									{coordinates?.lat.toFixed(3)}°, {coordinates?.long.toFixed(3)}
									°
								</p>
								{isPreciseLocation && coordinates && (
									<a
										href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.long}`}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
										title="Open in Google Maps"
									>
										<span>View on Google Maps</span>
										<span className="text-[10px]">↗</span>
									</a>
								)}
							</div>
						</div>
						{!isPreciseLocation && (
							<>
								<div>
									<p>Network</p>
									<p className="text-xs">{locationData.organization_name}</p>
									<p className="text-xs text-muted-foreground">
										ASN: {locationData.asn}
									</p>
								</div>
								<div>
									<p>Time Zone</p>
									<p className="text-xs">{locationData.timezone}</p>
									<p className="text-xs text-muted-foreground">
										IP: {locationData.ip}
									</p>
								</div>
							</>
						)}
					</div>
					{!isPreciseLocation && (
						<button
							type="button"
							onClick={handlePreciseLocation}
							disabled={isPreciseLocationLoading}
							className={`mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors ${
								isPreciseLocationLoading
									? "opacity-50 cursor-not-allowed"
									: "hover:bg-primary/90"
							}`}
						>
							{isPreciseLocationLoading
								? MESSAGES.PRECISE_LOCATION_LOADING
								: MESSAGES.PRECISE_LOCATION}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
