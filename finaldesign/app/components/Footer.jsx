const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Brand Kit", "Press Kit"],
  },
  {
    title: "Resources",
    links: ["Whitepaper", "Documentation", "Blog", "Newsroom"],
  },
  {
    title: "Legal",
    links: [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "Risk Disclosure",
    ],
  },
];

const SOCIALS = [
  {
    label: "X",
    path: <path d="M5 4L19 20M19 4L5 20" />,
  },
  {
    label: "Telegram",
    path: (
      <>
        <path d="M21 4L3 11.2L10 14L13 21L21 4Z" />
        <path d="M10 14L21 4" />
      </>
    ),
  },
  {
    label: "Discord",
    path: (
      <>
        <path d="M5 18C4 15 4 9 6 6C9 5 15 5 18 6C20 9 20 15 19 18C17 19 15 20 13 20L12 18L11 20C9 20 7 19 5 18Z" />
        <path d="M8.5 13.5H8.51M15.5 13.5H15.51" />
      </>
    ),
  },
  {
    label: "YouTube",
    path: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M10 9L16 12L10 15V9Z" />
      </>
    ),
  },
  {
    label: "Medium",
    path: <path d="M5 7H8L12 17L16 7H19M6 7V17M18 7V17" />,
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/novax-logo.png" alt="World Liberty Token" />
          <p>
            Building a world of digital liberty,
            <br />
            empowering individuals, uniting communities,
            <br />
            and transforming the future.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div className="footer-column" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              <a href="#" key={link}>
                {link}
              </a>
            ))}
          </div>
        ))}
        <div className="footer-community">
          <h3>Join The Community</h3>
          <div className="footer-socials">
            {SOCIALS.map((social) => (
              <a href="#" aria-label={social.label} key={social.label}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {social.path}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} World Liberty Token. All rights
        reserved.
      </div>
    </footer>
  );
}
