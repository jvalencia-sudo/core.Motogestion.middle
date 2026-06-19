"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useMemo } from "react";
import React from "react";
import Link from "next/link";

export default function DynamicBreadcrumb() {
  const path = usePathname();

  const breadcrumbs = useMemo(() => {
    const pathWithoutQuery = path.split("?")[0];

    const asPathNestedRoutes = pathWithoutQuery
      .split("/")
      .filter((v) => v.length > 0);

    const crumbList = asPathNestedRoutes.map((subpath, id) => {
      const href = "/" + asPathNestedRoutes.slice(0, id + 1).join("/");
      const title = subpath;
      return { href, title };
    });

    return [{ href: "/", title: "Home" }, ...crumbList];
  }, [path]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className="hidden md:block capitalize">
              {idx === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
