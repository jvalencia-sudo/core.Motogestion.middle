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
    const url = request.url.replace(process.env.APP_BASE_URL as never, "");

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

  // Redirect to login if there is no session
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
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
      } else {
        return NextResponse.redirect(new URL("/auth/logout", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/logout", request.url));
    }
  }

  // Check permissions for protected routes
  if (request.nextUrl.pathname !== "/") {
    const permissions = request.cookies.get("permissions");
    if (!permissions) {
      return NextResponse.redirect(new URL("/", request.url), { status: 308 });
    }

    // If there is a valid session, check the permissions
    const parsedPermission = JSON.parse(permissions.value);
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
      return NextResponse.redirect(new URL("/", request.url), { status: 308 });
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
    "/((?!_next/static|_next/image|favicon.ico|images|sitemap.xml|robots.txt|quotation).*)",
  ],
};
