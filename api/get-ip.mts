import type { Config, Context, Handler } from "@netlify/functions";

export default async (req: Request, context: Context) => {
	try {
		const clientIP = req.headers.get("x-nf-client-connection-ip");

		if (!clientIP) throw new Error("IP not found in headers");

		const parsedClientIP = clientIP === "::1" ? "63.116.61.253" : clientIP;

		const iPBasedLocationRes = await fetch(
			`https://get.geojs.io/v1/ip/geo/${parsedClientIP}.json`,
		);

		const iPBasedLocation = await iPBasedLocationRes.json();
		console.log("in here", iPBasedLocation);
		return new Response(JSON.stringify(iPBasedLocation));
	} catch (error) {
		return new Response(JSON.stringify({ error: "Something went wrong" }), {
			status: 500,
			headers: {
				"content-type": "application/json",
			},
		});
	}
};

export const config: Config = {
	path: "/api/ip",
	method: "GET",
};
