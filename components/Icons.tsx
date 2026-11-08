import Image from "next/image";

export function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6.5 3.8h2.3c.5 0 .9.3 1 .8l.8 2.6c.1.5 0 1-.4 1.3L8.8 10c1.3 2.4 3.3 4.3 5.7 5.6l1.5-1.4c.3-.4.8-.5 1.3-.4l2.6.8c.5.1.8.5.8 1v2.3c0 .6-.5 1.1-1.1 1-6.2-.8-11.2-5.8-12-12-.1-.6.4-1.1 1-1.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.45 1.33 4.95L2 22l5.37-1.4a10 10 0 0 0 4.67 1.19h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm5.76 14.07c-.24.68-1.4 1.3-1.94 1.34-.5.04-1.12.06-1.81-.11-.42-.11-.95-.31-1.64-.6-2.89-1.24-4.77-4.13-4.92-4.32-.14-.19-1.18-1.57-1.18-3 0-1.42.74-2.12 1.01-2.41.26-.29.58-.36.77-.36h.56c.18 0 .42 0 .64.49.24.54.81 1.98.88 2.12.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.16-.3.37-.42.49-.14.14-.29.29-.12.56.16.27.73 1.2 1.56 1.94 1.08.96 1.98 1.26 2.26 1.4.28.14.44.12.6-.07.17-.19.7-.81.89-1.09.19-.28.37-.23.63-.14.26.09 1.66.78 1.95.92.28.14.47.21.54.33.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 6 4.39 10.97 10.13 11.86v-8.39H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.96h-1.52c-1.49 0-1.95.93-1.95 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.04 24 18.07 24 12.07Z" />
    </svg>
  );
}

export function LogoMark({
  className = "h-11 w-11",
  src = "/assets/logo.jpeg",
  alt = "ونس",
  priority = false,
}: {
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src || "/assets/logo.jpeg"}
      alt={alt}
      width={88}
      height={88}
      className={`rounded-full object-cover ${className}`}
      priority={priority}
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}

export function CartIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.5 5h1.6l1.2 11.2a1.8 1.8 0 0 0 1.8 1.6h9.2a1.8 1.8 0 0 0 1.8-1.5L20.5 8H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 20.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8ZM17 20.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SunIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.2v2.2M12 18.6v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3.2 12h2.2M18.6 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M19.2 14.2A7.4 7.4 0 0 1 9.8 4.8 7.5 7.5 0 1 0 19.2 14.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LangIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 12h15M12 3.8c2.2 2.4 3.3 5.1 3.3 8.2s-1.1 5.8-3.3 8.2c-2.2-2.4-3.3-5.1-3.3-8.2S9.8 6.2 12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShopIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 9.5 6 4.8h12l1.5 4.7M5 9.5h14v8.2A1.8 1.8 0 0 1 17.2 19.5H6.8A1.8 1.8 0 0 1 5 17.7V9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 13.2v2.6M15 13.2v2.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckoutIcon({
  className = "h-[18px] w-[18px]",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 7h13l-1.2 8.2a1.8 1.8 0 0 1-1.8 1.5H9.2A1.8 1.8 0 0 1 7.4 15L6 4.5H3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10.2 11.2 1.8 1.8 3.4-3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 15.5V6.8A1.8 1.8 0 0 1 7.3 5h8.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m5.5 12.5 4.2 4.2 8.8-9.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 8v4.5l3 1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
