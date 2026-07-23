import Link from "next/link";
import { Facebook, Github, Linkedin, Mail, Phone } from "lucide-react";

const contacts = [
  { href: "https://github.com/GalibDev", label: "GitHub", Icon: Github },
  { href: "https://www.linkedin.com/in/md-mirza-galib-palash/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://www.facebook.com/share/1PeDLUgjp7/?mibextid=wwXIfr", label: "Facebook", Icon: Facebook },
  { href: "mailto:mirza.galib.palash@gmail.com", label: "Email", Icon: Mail },
  { href: "tel:+8801577088342", label: "Phone", Icon: Phone },
];

export default function Footer() {
  return (
    <footer className="mt-6 bg-ink text-white">
      <div className="container-app grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="text-2xl font-black"><span className="text-lime">F</span>undora</div>
          <p className="mt-3 max-w-sm text-white/60">Backing brave ideas with transparent, community-powered funding.</p>
        </div>
        <div className="flex flex-col gap-2 text-white/70">
          <Link href="/explore">Explore projects</Link>
          <Link href="/register">Start a campaign</Link>
          <Link href="/login">Sign in</Link>
          <a href="https://github.com/GalibDev/Fundora" target="_blank" rel="noreferrer">Join as developer</a>
          <a href="mailto:mirza.galib.palash@gmail.com">mirza.galib.palash@gmail.com</a>
          <a href="tel:+8801577088342">01577088342</a>
        </div>
        <div className="flex gap-4 md:justify-end">
          {contacts.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="transition-colors hover:text-lime"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-white/50">
        © 2026 Fundora. Built for ideas worth backing.
      </div>
    </footer>
  );
}
