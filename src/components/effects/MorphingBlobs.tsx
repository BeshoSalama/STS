interface BlobConfig {
  className: string;
  duration: string;
  delay?: string;
}

const defaultBlobs: BlobConfig[] = [
  { className: "left-[-10%] top-[-15%] h-[420px] w-[420px] bg-violet-gradient opacity-[0.16]", duration: "22s" },
  { className: "right-[-15%] top-[10%] h-[380px] w-[380px] bg-violet-400/[0.18]", duration: "26s", delay: "-6s" },
  { className: "left-[20%] bottom-[-20%] h-[460px] w-[460px] bg-violet-700/[0.12]", duration: "30s", delay: "-12s" },
];

export function MorphingBlobs({ blobs = defaultBlobs }: { blobs?: BlobConfig[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={`animate-blob absolute blur-3xl ${blob.className}`}
          style={{ animationDuration: blob.duration, animationDelay: blob.delay }}
        />
      ))}
    </div>
  );
}
