import { NextResponse, type NextRequest } from "next/server";

import { auth0 } from "@/lib/auth0";
import { PERMISSIONS } from "@/lib/permissions";
import { UserWithPermissions } from "@/lib/types/user";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes("/auth")) {
    return await auth0.middleware(request);
  }

  // Rewrite all API requests to the backend
  if (request.nextUrl.pathname.includes("/api")) {
    // Usar path + query (robusto detrás de cualquier proxy; antes se hacía
    // request.url.replace(APP_BASE_URL,"") que falla si el proxy entrega http interno).
    const url = request.nextUrl.pathname + request.nextUrl.search;

    const session = await auth0.getSession();
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

  // Allow access to public endpoints without authentication
  if (request.nextUrl.pathname.startsWith("/api/public")) {
    return NextResponse.next();
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
  const session = await auth0.getSession();
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  // If the user is logged in but the "logged" cookie is not set, authenticate them
  const cookiesStore = await cookies();
  if (!cookiesStore.has("logged")) {
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
        cookiesStore.set({
          name: "logged",
          value: "true",
          httpOnly: true,
          path: "/",
        });

        const user: UserWithPermissions = await resp.json();
        cookiesStore.set({
          name: "permissions",
          value: JSON.stringify(user.permissions),
          httpOnly: true,
          path: "/",
          secure: true,
        });

        if (user.nombreTal) {
          cookiesStore.set({
            name: "taller",
            value: user.nombreTal,
            httpOnly: true,
            path: "/",
          });
        }

        if (user.perfil) {
          cookiesStore.set({
            name: "perfil",
            value: user.perfil,
            httpOnly: true,
            path: "/",
          });
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

  // Check permissions for protected routes (la home del sistema es /inicio y no exige permiso específico)
  if (request.nextUrl.pathname !== "/inicio") {
    const permissions = request.cookies.get("permissions");
    if (!permissions?.value) {
      return NextResponse.redirect(new URL("/inicio", request.url), { status: 308 });
    }

    // If there is a valid session, check the permissions
    let parsedPermission: string[] = [];
    try {
      parsedPermission = JSON.parse(permissions.value);
    } catch {
      return NextResponse.redirect(new URL("/inicio", request.url), { status: 308 });
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
      return NextResponse.redirect(new URL("/inicio", request.url), { status: 308 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|images|sitemap.xml|robots.txt|quotation).*)",
  ],
};
