"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Play, Trash2, Upload, Video, X } from "lucide-react";
import type { MediaItem } from "@/lib/content/projectCaseStudy";

type MediaAction = (formData: FormData) => void | Promise<void>;

function mediaLabel(media: MediaItem) {
  return media.title || media.src.split("/").pop() || "Media item";
}

function isYoutube(src: string) {
  return src.includes("youtube.com") || src.includes("youtu.be");
}

function getVideoEmbedUrl(url: string) {
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("youtube.com/watch")) {
    try {
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const videoId = new URL(normalizedUrl).searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  return url;
}

function selectedLabel(files: FileList | null, emptyLabel: string) {
  if (!files || files.length === 0) return emptyLabel;
  if (files.length === 1) return files[0]?.name ?? emptyLabel;
  return `${files.length} files selected`;
}

export function ProjectMediaManager({
  media,
  canEdit,
  projectId,
  projectSlug,
  projectImage,
  projectImageAlt,
  placeholderCount,
  uploadAction,
  deleteAction,
}: {
  media: MediaItem[];
  canEdit: boolean;
  projectId?: string;
  projectSlug: string;
  projectImage: string;
  projectImageAlt: string;
  placeholderCount: number;
  uploadAction: MediaAction;
  deleteAction: MediaAction;
}) {
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [imageFilesLabel, setImageFilesLabel] = useState("No images selected");
  const [videoFilesLabel, setVideoFilesLabel] = useState("No videos selected");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const hasMedia = media.length > 0;

  return (
    <div className="grid gap-4">
      {canEdit && projectId && (
        <div className="rounded-[8px] border border-violet-200/15 bg-black/22 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100/70">Media manager</p>
              <h3 className="mt-1 font-display text-xl font-black text-white">Images and videos</h3>
              <p className="mt-1 text-xs font-semibold text-white/50">{media.length} uploaded item{media.length === 1 ? "" : "s"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => imageInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-violet-gradient px-4 text-sm font-black text-white">
                <ImagePlus size={16} />
                Add Image
              </button>
              <button type="button" onClick={() => videoInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-violet-200/20 bg-white/[0.06] px-4 text-sm font-black text-white">
                <Video size={16} />
                Add Video
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <form action={uploadAction} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-3">
              <input type="hidden" name="id" value={projectId} />
              <input type="hidden" name="slug" value={projectSlug} />
              <input name="title" placeholder="Image title" className="mb-3 min-h-10 w-full rounded-[8px] border border-violet-200/15 bg-black/25 px-3 text-sm font-bold text-white outline-none placeholder:text-white/35" />
              <input ref={imageInputRef} name="files" type="file" accept="image/*" multiple required className="sr-only" onChange={(event) => setImageFilesLabel(selectedLabel(event.target.files, "No images selected"))} />
              <div className="mb-3 flex min-h-11 items-center gap-3 rounded-[8px] border border-violet-200/15 bg-black/25 p-1.5 pl-3">
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/58">{imageFilesLabel}</span>
                <button type="button" onClick={() => imageInputRef.current?.click()} className="inline-flex min-h-8 items-center gap-2 rounded-[8px] bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15">
                  <ImagePlus size={14} />
                  Browse
                </button>
              </div>
              <button className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-violet-gradient px-4 text-sm font-black text-white">
                <Upload size={16} />
                Add Images
              </button>
            </form>
            <form action={uploadAction} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-3">
              <input type="hidden" name="id" value={projectId} />
              <input type="hidden" name="slug" value={projectSlug} />
              <input name="title" placeholder="Video title" className="mb-3 min-h-10 w-full rounded-[8px] border border-violet-200/15 bg-black/25 px-3 text-sm font-bold text-white outline-none placeholder:text-white/35" />
              <input ref={videoInputRef} name="files" type="file" accept="video/*" multiple required className="sr-only" onChange={(event) => setVideoFilesLabel(selectedLabel(event.target.files, "No videos selected"))} />
              <div className="mb-3 flex min-h-11 items-center gap-3 rounded-[8px] border border-violet-200/15 bg-black/25 p-1.5 pl-3">
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/58">{videoFilesLabel}</span>
                <button type="button" onClick={() => videoInputRef.current?.click()} className="inline-flex min-h-8 items-center gap-2 rounded-[8px] bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15">
                  <Video size={14} />
                  Browse
                </button>
              </div>
              <button className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-violet-200/20 bg-white/[0.07] px-4 text-sm font-black text-white">
                <Upload size={16} />
                Add Videos
              </button>
            </form>
          </div>
        </div>
      )}

      {!hasMedia && canEdit && (
        <div className="rounded-[8px] border border-dashed border-violet-200/25 bg-white/[0.025] p-5 text-center">
          <p className="text-sm font-black text-white">No uploaded media yet</p>
          <p className="mt-1 text-xs font-semibold text-white/50">The preview grid is restored below. Upload real images or videos to replace it.</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {hasMedia
          ? media.map((item) => (
              <div key={`${item.id ?? item.src}-${item.title}`} className="group relative aspect-[1.08] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.035]">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item)}
                    className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-red-300/35 bg-red-500/25 text-red-50 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-red-500/40"
                    aria-label={`Delete ${mediaLabel(item)}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                {item.type === "video" ? (
                  isYoutube(item.src) ? (
                    <iframe src={getVideoEmbedUrl(item.src)} title={mediaLabel(item)} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  ) : (
                    <video src={item.src} controls className="h-full w-full bg-black object-cover" />
                  )
                ) : (
                  <Image src={item.src} alt={mediaLabel(item)} fill sizes="(min-width: 1024px) 16vw, 45vw" className="object-contain p-5 transition duration-500 group-hover:scale-105" />
                )}
                <div className="absolute inset-x-3 bottom-3 rounded-[8px] border border-white/10 bg-black/55 px-3 py-2 text-xs font-black text-white backdrop-blur">
                  {mediaLabel(item)}
                </div>
              </div>
            ))
          : Array.from({ length: Math.max(1, placeholderCount) }).map((_, index) => (
              <div key={index} className="group relative aspect-[1.08] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.035]">
                <Image src={projectImage} alt={projectImageAlt} fill sizes="(min-width: 1024px) 16vw, 45vw" className="object-contain p-5 opacity-80 transition duration-500 group-hover:scale-105" />
                {index % 3 === 1 && (
                  <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur">
                    <Play size={18} fill="currentColor" />
                  </span>
                )}
              </div>
            ))}
      </div>

      {pendingDelete && projectId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-sm">
          <div className="w-[min(92vw,440px)] rounded-[8px] border border-red-300/25 bg-[#120519] p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-100/70">Confirm delete</p>
                <h3 className="mt-2 font-display text-2xl font-black">Delete this media?</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{mediaLabel(pendingDelete)} will be removed from this brand page.</p>
              </div>
              <button type="button" onClick={() => setPendingDelete(null)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70">
                <X size={15} />
              </button>
            </div>
            <form action={deleteAction} className="mt-5 flex gap-3">
              <input type="hidden" name="id" value={projectId} />
              <input type="hidden" name="slug" value={projectSlug} />
              <input type="hidden" name="mediaId" value={pendingDelete.id ?? ""} />
              <input type="hidden" name="mediaSrc" value={pendingDelete.src} />
              <button type="button" onClick={() => setPendingDelete(null)} className="flex-1 rounded-[8px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/75">
                Cancel
              </button>
              <button className="flex-1 rounded-[8px] border border-red-300/35 bg-red-500/20 px-4 py-3 text-sm font-black text-red-50">
                Delete
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
