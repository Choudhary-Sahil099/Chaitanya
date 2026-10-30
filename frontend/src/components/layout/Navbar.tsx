import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import BrandLogo from "../ui/BrandLogo";

const links = [
  { label: "Home", href: "#home", id: "home" },
  { label: "About", href: "#about", id: "about" },
  { label: "Dataset", href: "#dataset", id: "dataset" },
  {
    label: "How It Works",
    href: "#how-it-works",
    id: "how-it-works",
  },
  { label: "Contact", href: "#contact", id: "contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");

  useEffect(() => {
    const updateActiveSection = () => {
      const activationPoint = window.innerHeight * 0.35;
      let currentSection = "Home";

      for (const link of links) {
        const section = document.getElementById(link.id);

        if (!section) continue;

        const rect = section.getBoundingClientRect();

        if (rect.top <= activationPoint) {
          currentSection = link.label;
        }
      }

      setActiveLink(currentSection);
    };

    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  // Close mobile menu when Escape is pressed.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <BrandLogo />

        <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={activeLink === link.label ? "location" : undefined}
              className={`nav-link ${
                activeLink === link.label ? "active" : ""
              }`}
              onClick={() => {
                setActiveLink(link.label);
                setMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          className="button button-nav"
          href="/app"
          onClick={() => setMenuOpen(false)}
        >
          <span>Get Application</span>
          <ArrowRight size={19} strokeWidth={1.8} />
        </a>

        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>
    </header>
  );
}
