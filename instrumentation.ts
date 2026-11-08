export async function register() {}

export async function onRequestError(
  error: { digest?: string } & Error,
  request: { path?: string; method?: string },
  context: { routeType?: string },
) {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { recordError } = await import("./lib/error-log");
  await recordError({
    message: error?.message || "Unknown server error",
    stack: error?.stack,
    source: context.routeType === "route" ? "api" : "server",
    path: `${request.method || "GET"} ${request.path || "/"}`,
    status: 500,
    digest: error?.digest,
  });
}
