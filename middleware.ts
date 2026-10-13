import { NextResponse, type NextRequest } from "next/server";

import { auth0 } from "@/lib/auth0";
import { PERMISSIONS } from "@/lib/permissions";
import { UserWithPermissions } from "@/lib/types/user";

const APP_COOKIES = ["logged", "permissions", "taller", "perfil"];

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    const response = await auth0.middleware(request);
    // El SDK de Auth0 solo limpia su propia sesión; estas cookies las
    // maneja esta app a mano (más abajo) y sobreviven al logout si no las
    // borramos aquí. Sin esto, iniciar sesión con OTRA cuenta en el mismo
    // navegador reutiliza los permisos/taller/perfil de la cuenta anterior,
    // porque el middleware solo vuelve a pedirlos cuando falta "logged".
    if (request.nextUrl.pathname === "/auth/logout") {
      for (const name of APP_COOKIES) {
        response.cookies.delete(name);
      }
    }
    return response;
  }

  // Rewrite all API requests to the backend
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Usar path + query (robusto detrás de cualquier proxy; antes se hacía
    // request.url.replace(APP_BASE_URL,"") que falla si el proxy entrega http interno).
    const url = request.nextUrl.pathname + request.nextUrl.search;

    const session = await auth0.getSession(request);
    if (session) {
      request.headers.set(
        "Authorization",
        `Bearer ${session.tokenSet.accessToken}`,
      );
    }

    request.headers.set("cookie", "");

    return NextResponse.rewrite(new URL(url, process.env.BASE_API_URL), {
      request,
    });
  }

  // Página informativa para usuarios autenticados pero NO registrados en el sistema
  if (request.nextUrl.pathname === "/no-registrado") {
    return NextResponse.next();
  }

  // Rutas públicas (landing y registro de taller): accesibles sin iniciar sesión.
  const PUBLIC_PATHS = ["/", "/registro"];
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Redirect to login if there is no session (volviendo luego a la ruta pedida)
  // En middleware hay que pasar el `request` explícito: la sobrecarga sin
  // argumentos usa next/headers internamente, que no es válido aquí (a
  // diferencia de Server Components/Actions) y el SDK 4.x estable sí lo hace
  // fallar con "headers called outside a request scope" (la beta no lo exigía).
  const session = await auth0.getSession(request);
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  // Cookies que se acaban de resolver en ESTA petición (login recién hecho).
  // Se aplican al final sobre la respuesta que se vaya a devolver -- sea cual
  // sea la rama -- para que el navegador las reciba. request.cookies también
  // se actualiza en el momento, porque el resto de este mismo middleware (el
  // chequeo de permisos de abajo) y el Server Component que se renderice a
  // continuación leen de ahí, no de lo que se le fije a la respuesta: sin
  // esto, la PRIMERA petición tras loguear (o tras cambiar de cuenta/perfil)
  // seguía viendo cookies viejas o vacías hasta que el usuario recargaba.
  const nuevasCookies: { name: string; value: string; secure?: boolean }[] = [];

  // If the user is logged in but the "logged" cookie is not set, authenticate them
  if (!request.cookies.has("logged")) {
    try {
      const resp = await fetch(
        new URL("/api/auth/login", process.env.BASE_API_URL),
        {
          method: "post",
          headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
            token: session.tokenSet.accessToken,
            name: session.user.name,
          }),
        },
      );

      if (resp.ok) {
        const user: UserWithPermissions = await resp.json();

        nuevasCookies.push(
          { name: "logged", value: "true" },
          {
            name: "permissions",
            value: JSON.stringify(user.permissions),
            secure: true,
          },
        );
        if (user.nombreTal) {
          nuevasCookies.push({ name: "taller", value: user.nombreTal });
        }
        if (user.perfil) {
          nuevasCookies.push({ name: "perfil", value: user.perfil });
        }

        for (const cookie of nuevasCookies) {
          request.cookies.set(cookie.name, cookie.value);
        }
      } else if (resp.status === 403) {
        // El backend no reconoce al usuario (correo no registrado en el sistema)
        return NextResponse.redirect(new URL("/no-registrado", request.url));
      } else {
        return NextResponse.redirect(new URL("/auth/logout", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/logout", request.url));
    }
  }

  const aplicarCookies = (response: NextResponse) => {
    for (const cookie of nuevasCookies) {
      response.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        path: "/",
        secure: cookie.secure,
      });
    }
    return response;
  };

  // Check permissions for protected routes (la home del sistema es /inicio y no exige permiso específico)
  if (request.nextUrl.pathname !== "/inicio") {
    const permissions = request.cookies.get("permissions");
    if (!permissions?.value) {
      return aplicarCookies(
        NextResponse.redirect(new URL("/inicio", request.url), { status: 308 }),
      );
    }

    // If there is a valid session, check the permissions
    let parsedPermission: string[] = [];
    try {
      parsedPermission = JSON.parse(permissions.value);
    } catch {
      return aplicarCookies(
        NextResponse.redirect(new URL("/inicio", request.url), { status: 308 }),
      );
    }
    const requiredPathPermissions = PERMISSIONS.find((p) =>
      new RegExp(p.path).test(request.nextUrl.pathname),
    );

    // If the user doesn't have the required permissions or there are no permissions configured for the specific path,
    // redirect to the home page
    if (
      !requiredPathPermissions ||
      !requiredPathPermissions.permissions.some((p) =>
        parsedPermission.includes(p),
      )
    ) {
      return aplicarCookies(
        NextResponse.redirect(new URL("/inicio", request.url), { status: 308 }),
      );
    }
  }

  return aplicarCookies(NextResponse.next({ request }));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|images|sitemap.xml|robots.txt).*)",
  ],
};
