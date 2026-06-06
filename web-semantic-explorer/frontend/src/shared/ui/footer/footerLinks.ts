import type { IconType } from "react-icons"
import {
  FaApple,
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaSpotify,
  FaTelegram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa"
import { FaPodcast, FaXTwitter } from "react-icons/fa6"

const EOM = "https://elordenmundial.com"

export const EOM_LOGO_URL =
  "https://elordenmundial.com/wp-content/themes/eom/img/logo.svg"

export const footerNavLinks = [
  { label: "¿Quiénes somos?", href: `${EOM}/quienes-somos/` },
  { label: "Anúnciate en EOM", href: `${EOM}/publicidad/` },
  { label: "Contáctanos", href: "mailto:contacto@elordenmundial.com" },
  { label: "Preguntas frecuentes", href: `${EOM}/preguntas-frecuentes/` },
] as const

export type SocialLink = {
  icon: IconType
  href: string
  label: string
}

export const socialLinks: SocialLink[] = [
  {
    icon: FaXTwitter,
    href: "https://x.com/elOrdenMundial",
    label: "X (Twitter)",
  },
  {
    icon: FaFacebook,
    href: "https://www.facebook.com/elordenmundial/",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/elordenmundial/",
    label: "Instagram",
  },
  {
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/company/elordenmundial/",
    label: "LinkedIn",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/@elordenmundial",
    label: "YouTube",
  },
  {
    icon: FaTelegram,
    href: "https://t.me/elordenmundialeom",
    label: "Telegram",
  },
  {
    icon: FaTiktok,
    href: "https://www.tiktok.com/@elordenmundiall",
    label: "TikTok",
  },
]

export const podcastLinks: SocialLink[] = [
  {
    icon: FaSpotify,
    href: "https://open.spotify.com/show/5dbvpKwtqz3X3hcX1BSEzf",
    label: "No es el fin del mundo en Spotify",
  },
  {
    icon: FaPodcast,
    href: "https://go.ivoox.com/sq/1941059",
    label: "No es el fin del mundo en iVoox",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/channel/UCU4sBmrCdWKibChqSCp5Y3w",
    label: "No es el fin del mundo en YouTube",
  },
  {
    icon: FaApple,
    href: "https://podcasts.apple.com/es/podcast/no-es-el-fin-del-mundo/id1687260829",
    label: "No es el fin del mundo en Apple Podcasts",
  },
]

export const subscribeUrl = `${EOM}/suscribete/`
export const privacyUrl = `${EOM}/privacidad/`
export const licenseUrl =
  "https://creativecommons.org/licenses/by-nc-nd/2.5/es/"
