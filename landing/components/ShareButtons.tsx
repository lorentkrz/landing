"use client";

type Props = { link: string };

const shareTargets = [
  {
    label: "Copy",
    href: (url: string) => url,
    icon: "⧉",
    type: "copy",
  },
  {
    label: "WhatsApp",
    href: (url: string) => `https://wa.me/?text=${encodeURIComponent(url)}`,
    icon: "",
    type: "link",
  },
  {
    label: "IG DM",
    href: (url: string) => `https://www.instagram.com/direct/new/?text=${encodeURIComponent(url)}`,
    icon: "✦",
    type: "link",
  },
];

export function ShareButtons({ link }: Props) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {shareTargets.map((item) =>
        item.type === "copy" ? (
          <button
            key={item.label}
            onClick={onCopy}
            className="btn heading-font rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white"
          >
            {item.icon} {item.label}
          </button>
        ) : (
          <a
            key={item.label}
            href={item.href(link)}
            target="_blank"
            rel="noreferrer"
            className="btn heading-font rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white"
          >
            {item.icon} {item.label}
          </a>
        )
      )}
    </div>
  );
}
