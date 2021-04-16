import { match, pathToRegexp } from "../deps.ts";

export function handle(pathing: RequestPaths) {
  pathing["404"] ??= () => new Response("not found", { status: 404 });

  //@ts-ignore Ignores for IDE errors with FetchEvent not existing
  addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(handleEvent(event.request, pathing));
  });
}

/** Used internally to handle request paths */
function handleEvent(request: Request, requestPaths: RequestPaths) {
  const urlData = new URL(request.url);

  try {
    let res;

    Object.keys(requestPaths.modules).forEach((module) => {
      Object.keys(requestPaths.modules[module]).forEach((path) => {
        const routing = `/${module}/${path}`.replaceAll("//", "/");

        if (pathToRegexp(routing).test(urlData.pathname)) {
          const getParams = match(routing);

          const { params = {} } = getParams(urlData.pathname) as ParamsData;

          try {
            if (requestPaths.modules[module][path][request.method]) {
              res = requestPaths.modules[module][path][request.method](
                request,
                params,
              );
            } else {
              res = new Response(
                JSON.stringify({
                  error:
                    `method ${request.method} not supported for this route`,
                }),
                { status: 400 },
              );
            }
          } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
            });
          }
        }
      });
    });

    res ??= requestPaths["404"]!(request, {});

    return res;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

/** Interface definition for request handler */
export interface RequestPaths {
  /** List of modules and their respective request paths with method */
  modules: Record<string, Record<string, MethodHandler>>;
  404?: WaveRequestHandler;
}

type MethodHandler = Record<string, WaveRequestHandler>;

/** Function definition for request handler */
export type WaveRequestHandler = (
  req: Request,
  params: Record<string, string>,
) => Response;

export type ParamsData = { params: { [key: string]: string } };
