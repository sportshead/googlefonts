import index from "./index.html";
import test from "./test.html";

export interface Env {}

const ALLOWED_DOMAINS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const ALLOWED_DOMAINS_REGEXP = new RegExp(
	`(${ALLOWED_DOMAINS.map((d) => d.replaceAll(".", "\\.")).join("|")})`,
	"g",
);
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			return new Response(index.replaceAll("%HOST%", url.host), {
				headers: { "Content-Type": "text/html" },
			});
		} else if (url.pathname === "/test") {
			return new Response(test.replaceAll("%HOST%", url.host), {
				headers: { "Content-Type": "text/html" },
			});
		}

		const cacheKey = new Request(url.toString(), request);
		const cache = caches.default;

		let response = await cache.match(cacheKey);
		if (response) {
			console.log(`Cache hit for ${request.url}`);
			return response;
		}

		// /fonts.googleapis.com/css2?... -> ["", "fonts.googleapis.com", "css2", ...]
		const domain = url.pathname.split("/")[1];

		if (!ALLOWED_DOMAINS.includes(domain)) {
			return new Response("domain not allowed", {
				status: 403,
			});
		}

		const fetchURL = new URL(url);
		fetchURL.host = domain;
		fetchURL.port = "";
		fetchURL.pathname = url.pathname.split("/").slice(2).join("/");
		console.log(`Cache miss, fetching ${fetchURL}`);

		response = await fetch(fetchURL);
		const body = await response
			.text()
			.then((text) =>
				text.replaceAll(ALLOWED_DOMAINS_REGEXP, `${url.host}/$1`),
			);

		response = new Response(body, response);
		// force caching
		response.headers.set("Cache-Control", "max-age=86400");

		ctx.waitUntil(cache.put(cacheKey, response.clone()));
		return response;
	},
} as ExportedHandler<Env, {}, {}>;
