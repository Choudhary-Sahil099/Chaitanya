import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
  UsersRound,
  ShieldCheck,
} from "lucide-react";

import BrandLogo from "../ui/BrandLogo";
import "../../styles/contact-footer.css";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Dataset", href: "#dataset" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const contactDetails = [
  {
    icon: Mail,
    title: "Email",
    description: "skinsight.ai@gmail.com",
    color: "blue",
    href: "mailto:skinsight.ai@gmail.com",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Himachal Pradesh, India",
    color: "green",
  },
  {
    icon: UsersRound,
    title: "For Collaboration",
    description: "We are open to academic and research collaboration.",
    color: "purple",
  },
];

const socialLinks = [
  { icon: Mail, label: "Email", href: "mailto:skinsight.ai@gmail.com" },
];

export default function ContactFooter() {
  return (
    <footer className="contact-footer" id="contact">
      <div className="footer-container">
        {/* MAIN FOOTER CONTENT */}

        <div className="footer-main">
          {/* BRAND COLUMN */}

          <div className="footer-brand-column">
            <div className="footer-brand">
              <BrandLogo />
            </div>

            <p className="footer-tagline">AI FOR HEALTHIER SKIN</p>

            <p className="footer-description">
              An AI-powered web application for skin lesion classification using
              the HAM10000 dataset. Providing prediction confidence, visual
              explanations, and uncertainty assessment for educational and
              research purposes.
            </p>

            <div className="footer-socials">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="social-link"
                  aria-label={label}
                  title={label}
                  target={label === "Email" ? undefined : "_blank"}
                  rel={label === "Email" ? undefined : "noreferrer"}
                >
                  <Icon size={25} strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}

          <div className="footer-links-column">
            <h3 className="footer-column-title">Quick Links</h3>

            <div className="footer-links">
              {quickLinks.map((link) => (
                <a
                  href={link.href}
                  key={link.label}
                  className="footer-nav-link"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight size={19} />
                </a>
              ))}
            </div>
          </div>

          {/* CONTACT DETAILS */}

          <div className="footer-contact-column">
            <h3 className="footer-column-title">Get in Touch</h3>

            <div className="contact-details">
              {contactDetails.map((detail) => {
                const Icon = detail.icon;

                const content = (
                  <>
                    <div className={`contact-detail-icon ${detail.color}`}>
                      <Icon size={29} strokeWidth={2} />
                    </div>

                    <div className="contact-detail-content">
                      <h4>{detail.title}</h4>
                      <p>{detail.description}</p>
                    </div>
                  </>
                );

                return detail.href ? (
                  <a
                    key={detail.title}
                    href={detail.href}
                    className="contact-detail"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="contact-detail" key={detail.title}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          {/* APPLICATION CARD */}

          <div className="footer-cta-card">
            <div className="footer-cta-icon">
              <ShieldCheck size={42} strokeWidth={1.9} />
            </div>

            <h3>Stay Connected</h3>

            <p>
              Have questions or suggestions? Feel free to reach out. We'd love
              to hear from you!
            </p>

            <a href="/app" className="button footer-cta-button">
              Get Application
              <ArrowRight size={21} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 SkinSight. All rights reserved.</p>

          <div className="legal-links">
            <a href="#privacy-policy">Privacy Policy</a>
            <a href="#terms-of-use">Terms of Use</a>
            <a href="#disclaimer">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
