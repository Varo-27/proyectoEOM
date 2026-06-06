import {
  EOM_LOGO_URL,
  footerNavLinks,
  licenseUrl,
  podcastLinks,
  privacyUrl,
  socialLinks,
  subscribeUrl,
} from "./footerLinks"

function ExternalLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const allIcons = [...socialLinks, ...podcastLinks]

  return (
    <footer className="eom-footer">
      <div className="eom-footer__inner">
        <div className="eom-footer__bar">
          <ExternalLink
            href="https://elordenmundial.com/"
            className="eom-footer__logo-link"
            ariaLabel="El Orden Mundial — inicio"
          >
            <img
              src={EOM_LOGO_URL}
              alt="El Orden Mundial"
              className="eom-footer__logo"
              width={101}
              height={36}
              loading="lazy"
            />
          </ExternalLink>

          <nav className="eom-footer__nav" aria-label="Enlaces del sitio">
            {footerNavLinks.map(({ label, href }) => (
              <ExternalLink key={href} href={href} className="eom-footer__nav-link">
                {label}
              </ExternalLink>
            ))}
          </nav>

          <ul className="eom-footer__icons" aria-label="Redes sociales y podcast">
            {allIcons.map(({ icon: Icon, href, label }) => (
              <li key={href}>
                <ExternalLink href={href} className="eom-footer__icon-btn" ariaLabel={label}>
                  <Icon className="size-3.5" aria-hidden />
                </ExternalLink>
              </li>
            ))}
          </ul>

          <ExternalLink href={subscribeUrl} className="eom-footer__cta-btn">
            Suscríbete
          </ExternalLink>
        </div>

        <p className="eom-footer__legal">
          2012–{currentYear}, El Orden Mundial en el Siglo XXI.{" "}
          <ExternalLink href={licenseUrl} className="eom-footer__legal-link">
            CC BY-NC-ND
          </ExternalLink>
          {" · "}
          <ExternalLink href={privacyUrl} className="eom-footer__legal-link">
            Privacidad
          </ExternalLink>
        </p>
      </div>
    </footer>
  )
}
