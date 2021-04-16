# wave
A module-based Deno Deploy routing library, built for web APIs

```ts
import { handle } from "https://deno.land/x/wave@0.1.0/mod.ts"

import { getUserFunction } from "path/to/usermodule.ts"

//Hande requests
handle({
    modules: {
        "users": {
            "/:userid": {
                "GET": (request, params) => new Response(getUserFunction(params.userid))
            }
        }
    },
    404: () => new Response("Page not Found", {status: 404})
});
```