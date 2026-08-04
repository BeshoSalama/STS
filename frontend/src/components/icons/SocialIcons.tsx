interface IconProps {
  size?: number;
  className?: string;
}

export function TikTokIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.2c-.9-.8-1.4-1.9-1.5-3.2h-3v13.4c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4 0-1.3 1.1-2.4 2.4-2.4.3 0 .5 0 .8.1v-3.1c-.3 0-.5-.1-.8-.1-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5V9.1c1.2.8 2.6 1.3 4.1 1.3V7.4c-1-.1-2-.5-2.7-1.2-.3-.3-.6-.6-.8-1z" />
    </svg>
  );
}

export function SnapchatIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.5c-2.9 0-4.6 2.1-4.7 4.3-.1 1-.1 1.4-.2 1.6-.2.3-.9.5-1.4.6-.3.1-.5.4-.5.7 0 .4.4.7.8.9.2.1.3.3.2.5-.1.4-.5.9-1.3 1.3-.3.1-.5.5-.4.8.2.6 1.2.9 2 1 .1.3.2.6.3.8.1.2.3.3.6.3.4 0 .9-.1 1.5-.1.6 0 1.1.4 1.9.9.6.4 1.3.8 2.2.8.9 0 1.6-.4 2.2-.8.8-.5 1.3-.9 1.9-.9.6 0 1.1.1 1.5.1.3 0 .5-.1.6-.3.1-.2.2-.5.3-.8.8-.1 1.8-.4 2-1 .1-.3-.1-.7-.4-.8-.8-.4-1.2-.9-1.3-1.3-.1-.2 0-.4.2-.5.4-.2.8-.5.8-.9 0-.3-.2-.6-.5-.7-.5-.1-1.2-.3-1.4-.6-.1-.2-.1-.6-.2-1.6-.1-2.2-1.8-4.3-4.7-4.3z" />
    </svg>
  );
}
