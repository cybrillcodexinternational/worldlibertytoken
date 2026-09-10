"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Tokenomics", href: "/tokenomics" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Whitepapers", href: "#" },
  { label: "Echosystem", href: "/echosystem" },
  { label: "News", href: "/news" },
  { label: "Blog", href: "/blog" },
  { label: "Faq", href: "/faq" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <section className="header">
      <div className="container-fluid">
        <div className="row main-header">
          <div className="col-md-2 logo-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/novax-logo.png"
              alt="World Liberty Token logo"
              className="logo-img"
            />
          </div>
          <div className="col-md-7 navigation-area">
            <div className="navigation">
              <nav className="main-nav">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li
                      className={
                        isActive
                          ? "navigation-item is-active"
                          : "navigation-item"
                      }
                      key={item.label}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="col-md-3 buttons-header">
            <div className="h-buttons">
              <Link className="login-btn" href="/login">
                Login
              </Link>
              <Link className="colored-btn" href="/register">
                CREATE Account <span aria-hidden="true">&#8594;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
