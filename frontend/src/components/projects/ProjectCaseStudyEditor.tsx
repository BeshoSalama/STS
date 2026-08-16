"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { ImagePlus, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { ProjectCaseStudyData, ProjectIconKey } from "@/lib/content/projectCaseStudy";

type SaveAction = (formData: FormData) => void | Promise<void>;
type SectionKey = "hero" | "journey" | "results" | "campaigns" | "content" | "dashboard" | "people";

const inputClass =
  "min-h-10 rounded-[8px] border border-violet-200/12 bg-black/20 px-3 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-violet-300/55";
const textAreaClass =
  "min-h-24 rounded-[8px] border border-violet-200/12 bg-black/20 px-3 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-white/35 focus:border-violet-300/55";
const panelClass = "border-t border-violet-200/12 py-5";

const iconOptions: ProjectIconKey[] = ["calendar", "crown", "map", "sparkles", "handshake", "shield", "rocket", "camera", "target", "chart", "trophy", "message", "play", "users"];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

function updateAt<T>(items: T[], index: number, next: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? next : item));
}

function removeAt<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function ProjectCaseStudyEditor({
  projectId,
  projectSlug,
  projectName,
  projectImage,
  projectImageAlt,
  projectVideoUrl,
  data,
  action,
  initialSection = "hero",
  triggerLabel = "Edit",
  singleSection = true,
}: {
  projectId: string;
  projectSlug: string;
  projectName: string;
  projectImage: string;
  projectImageAlt: string;
  projectVideoUrl?: string | null;
  data: ProjectCaseStudyData;
  action: SaveAction;
  initialSection?: SectionKey;
  triggerLabel?: string;
  singleSection?: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProjectCaseStudyData>(data);
  const [projectMedia, setProjectMedia] = useState({
    image: projectImage,
    imageAlt: projectImageAlt,
    videoUrl: projectVideoUrl ?? "",
  });
  const [heroImageLabel, setHeroImageLabel] = useState("No new image selected");
  const [heroVideoLabel, setHeroVideoLabel] = useState("No new video selected");
  const [section, setSection] = useState<SectionKey>(initialSection);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function patch(next: Partial<ProjectCaseStudyData>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function resetDraft() {
    setDraft(data);
    setProjectMedia({
      image: projectImage,
      imageAlt: projectImageAlt,
      videoUrl: projectVideoUrl ?? "",
    });
    setHeroImageLabel("No new image selected");
    setHeroVideoLabel("No new video selected");
    setSection(initialSection);
    setSaveError("");
    setIsEditing(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");
    try {
      await action(new FormData(event.currentTarget));
      router.refresh();
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  const tabs: { key: SectionKey; label: string }[] = [
    { key: "hero", label: "Hero" },
    { key: "journey", label: "Journey" },
    { key: "results", label: "Results" },
    { key: "campaigns", label: "Campaigns" },
    { key: "content", label: "Content" },
    { key: "dashboard", label: "Dashboard" },
    { key: "people", label: "People" },
  ];

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/20 px-4 py-2 text-sm font-black text-violet-50 shadow-[0_18px_46px_rgba(109,63,196,0.22)] transition hover:bg-violet-500/30"
      >
        <Pencil size={15} />
        {triggerLabel}
      </button>

      {isEditing && (
        <form
          dir="ltr"
          onSubmit={handleSubmit}
          className="mt-5 w-full border-y border-violet-200/12 py-5 text-left text-white"
        >
          <input type="hidden" name="id" value={projectId} />
          <input type="hidden" name="slug" value={projectSlug} />
          <input type="hidden" name="image" value={projectMedia.image} />
          <input type="hidden" name="imageAlt" value={projectMedia.imageAlt} />
          <input type="hidden" name="videoUrl" value={projectMedia.videoUrl} />
          <input type="hidden" name="caseStudyData" value={JSON.stringify(draft)} />

          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#dac7f5]/80">Brand Case Study</p>
              <h3 className="mt-2 font-display text-2xl font-black sm:text-3xl">Edit {projectName}</h3>
            </div>
            <button
              type="button"
              onClick={resetDraft}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close editor"
            >
              <X size={17} />
            </button>
          </div>

          {!singleSection && <div className="mb-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSection(tab.key)}
                className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                  section === tab.key ? "border-violet-300/45 bg-violet-500/25 text-white" : "border-white/10 bg-white/[0.035] text-white/58 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>}

          {section === "hero" && (
            <div className="grid gap-4">
              <div className={`${panelClass} grid gap-4 lg:grid-cols-[280px_1fr]`}>
                <div className="overflow-hidden rounded-[8px] border border-white/10 bg-black/25">
                  <div className="relative aspect-[1.15]">
                    <Image src={projectMedia.image} alt={projectMedia.imageAlt} fill sizes="280px" className="object-contain p-5" />
                  </div>
                </div>
                <div className="grid content-start gap-3">
                  <div>
                    <h4 className="font-display text-xl font-black">Hero Media</h4>
                    <p className="mt-1 text-xs font-semibold text-white/50">Change the main brand image or upload a hero video from your device.</p>
                  </div>
                  <input value={projectMedia.imageAlt} onChange={(event) => setProjectMedia((current) => ({ ...current, imageAlt: event.target.value }))} className={inputClass} placeholder="Image alt text" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid min-h-24 cursor-pointer place-items-center rounded-[8px] border border-violet-300/25 bg-violet-500/12 p-4 text-center transition hover:bg-violet-500/18">
                      <ImagePlus className="mb-2 text-violet-100" size={20} />
                      <span className="text-sm font-black text-white">Browse Image</span>
                      <span className="mt-1 max-w-full truncate text-xs font-semibold text-white/48">{heroImageLabel}</span>
                      <input name="heroImage" type="file" accept="image/*" className="sr-only" onChange={(event) => setHeroImageLabel(event.target.files?.[0]?.name ?? "No new image selected")} />
                    </label>
                    <label className="grid min-h-24 cursor-pointer place-items-center rounded-[8px] border border-violet-300/25 bg-white/[0.045] p-4 text-center transition hover:bg-white/[0.07]">
                      <ImagePlus className="mb-2 text-violet-100" size={20} />
                      <span className="text-sm font-black text-white">Browse Video</span>
                      <span className="mt-1 max-w-full truncate text-xs font-semibold text-white/48">{heroVideoLabel}</span>
                      <input name="heroVideo" type="file" accept="video/*" className="sr-only" onChange={(event) => setHeroVideoLabel(event.target.files?.[0]?.name ?? "No new video selected")} />
                    </label>
                  </div>
                  {projectMedia.videoUrl && (
                    <button type="button" onClick={() => setProjectMedia((current) => ({ ...current, videoUrl: "" }))} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-red-300/30 bg-red-500/10 px-4 text-sm font-black text-red-100">
                      <Trash2 size={14} />
                      Remove Hero Video
                    </button>
                  )}
                </div>
              </div>

              <div className={`${panelClass} grid gap-3 md:grid-cols-3`}>
                <h4 className="font-display text-xl font-black md:col-span-3">Hero Text</h4>
                <input value={draft.hero.badge} onChange={(event) => patch({ hero: { ...draft.hero, badge: event.target.value } })} className={inputClass} placeholder="Badge" />
                <input value={draft.hero.titleTop} onChange={(event) => patch({ hero: { ...draft.hero, titleTop: event.target.value } })} className={inputClass} placeholder="Title top" />
                <input value={draft.hero.titleHighlight} onChange={(event) => patch({ hero: { ...draft.hero, titleHighlight: event.target.value } })} className={inputClass} placeholder="Title highlight" />
                <textarea value={draft.hero.intro} onChange={(event) => patch({ hero: { ...draft.hero, intro: event.target.value } })} className={`${textAreaClass} md:col-span-3`} placeholder="Intro" />
                <input value={draft.hero.primaryCta} onChange={(event) => patch({ hero: { ...draft.hero, primaryCta: event.target.value } })} className={inputClass} placeholder="Primary CTA" />
                <input value={draft.hero.secondaryCta} onChange={(event) => patch({ hero: { ...draft.hero, secondaryCta: event.target.value } })} className={inputClass} placeholder="Secondary CTA" />
                <input value={draft.hero.websiteHref} onChange={(event) => patch({ hero: { ...draft.hero, websiteHref: event.target.value } })} className={inputClass} placeholder="Website URL" />
              </div>

              <EditableRows
                title="Hero Metrics"
                items={draft.heroMetrics}
                addLabel="Add Metric"
                onAdd={() => patch({ heroMetrics: [...draft.heroMetrics, { label: "New metric", value: "0", icon: "sparkles" }] })}
                render={(item, index) => (
                  <>
                    <input value={item.label} onChange={(event) => patch({ heroMetrics: updateAt(draft.heroMetrics, index, { ...item, label: event.target.value }) })} className={inputClass} />
                    <input value={item.value} onChange={(event) => patch({ heroMetrics: updateAt(draft.heroMetrics, index, { ...item, value: event.target.value }) })} className={inputClass} />
                    <select value={item.icon} onChange={(event) => patch({ heroMetrics: updateAt(draft.heroMetrics, index, { ...item, icon: event.target.value as never }) })} className={inputClass}>
                      {iconOptions.map((icon) => <option key={icon}>{icon}</option>)}
                    </select>
                    <label className="flex items-center gap-2 rounded-[8px] border border-violet-200/15 bg-black/20 px-3 text-xs font-bold text-white/72">
                      <input type="checkbox" checked={Boolean(item.useCategory)} onChange={(event) => patch({ heroMetrics: updateAt(draft.heroMetrics, index, { ...item, useCategory: event.target.checked }) })} />
                      Use category
                    </label>
                  </>
                )}
                onDelete={(index) => patch({ heroMetrics: removeAt(draft.heroMetrics, index) })}
              />
            </div>
          )}

          {section === "journey" && (
            <SectionWithRows
              sectionData={draft.journey}
              onSectionChange={(journey) => patch({ journey })}
              rows={draft.journey.items}
              addLabel="Add Step"
              newRow={{ title: "New step", description: "Step description", icon: "rocket" }}
              onRowsChange={(items) => patch({ journey: { ...draft.journey, items: items as ProjectCaseStudyData["journey"]["items"] } })}
              renderRow={(item, index, setRows) => (
                <>
                  <input value={item.title} onChange={(event) => setRows(updateAt(draft.journey.items, index, { ...item, title: event.target.value }))} className={inputClass} />
                  <input value={item.description} onChange={(event) => setRows(updateAt(draft.journey.items, index, { ...item, description: event.target.value }))} className={`${inputClass} md:col-span-2`} />
                  <select value={item.icon} onChange={(event) => setRows(updateAt(draft.journey.items, index, { ...item, icon: event.target.value as never }))} className={inputClass}>
                    {iconOptions.map((icon) => <option key={icon}>{icon}</option>)}
                  </select>
                </>
              )}
            />
          )}

          {section === "results" && (
            <SectionWithRows
              sectionData={draft.results}
              onSectionChange={(results) => patch({ results })}
              rows={draft.results.metrics}
              addLabel="Add Result"
              newRow={{ label: "New result", value: "+0", change: "+0%", icon: "chart" }}
              onRowsChange={(metrics) => patch({ results: { ...draft.results, metrics: metrics as ProjectCaseStudyData["results"]["metrics"] } })}
              renderRow={(item, index, setRows) => (
                <>
                  <input value={item.label} onChange={(event) => setRows(updateAt(draft.results.metrics, index, { ...item, label: event.target.value }))} className={inputClass} />
                  <input value={item.value} onChange={(event) => setRows(updateAt(draft.results.metrics, index, { ...item, value: event.target.value }))} className={inputClass} />
                  <input value={item.change} onChange={(event) => setRows(updateAt(draft.results.metrics, index, { ...item, change: event.target.value }))} className={inputClass} />
                  <select value={item.icon} onChange={(event) => setRows(updateAt(draft.results.metrics, index, { ...item, icon: event.target.value as never }))} className={inputClass}>
                    {iconOptions.map((icon) => <option key={icon}>{icon}</option>)}
                  </select>
                </>
              )}
            />
          )}

          {section === "campaigns" && (
            <SectionWithRows
              sectionData={draft.campaigns}
              onSectionChange={(campaigns) => patch({ campaigns })}
              rows={draft.campaigns.items}
              addLabel="Add Campaign"
              newRow={{ title: "New campaign", budget: "0 EGP", spend: "0 EGP", stats: ["ROAS 0", "CTR 0%", "CPC 0"] }}
              onRowsChange={(items) => patch({ campaigns: { ...draft.campaigns, items: items as ProjectCaseStudyData["campaigns"]["items"] } })}
              renderRow={(item, index, setRows) => (
                <>
                  <input value={item.title} onChange={(event) => setRows(updateAt(draft.campaigns.items, index, { ...item, title: event.target.value }))} className={inputClass} />
                  <input value={item.budget} onChange={(event) => setRows(updateAt(draft.campaigns.items, index, { ...item, budget: event.target.value }))} className={inputClass} />
                  <input value={item.spend} onChange={(event) => setRows(updateAt(draft.campaigns.items, index, { ...item, spend: event.target.value }))} className={inputClass} />
                  <textarea value={joinLines(item.stats)} onChange={(event) => setRows(updateAt(draft.campaigns.items, index, { ...item, stats: splitLines(event.target.value) }))} className={`${textAreaClass} md:col-span-4`} />
                </>
              )}
            />
          )}

          {section === "content" && (
            <div className="grid gap-4">
              <div className={`${panelClass} grid gap-3 md:grid-cols-3`}>
                <input value={draft.contentLibrary.eyebrow} onChange={(event) => patch({ contentLibrary: { ...draft.contentLibrary, eyebrow: event.target.value } })} className={inputClass} />
                <input value={draft.contentLibrary.title} onChange={(event) => patch({ contentLibrary: { ...draft.contentLibrary, title: event.target.value } })} className={`${inputClass} md:col-span-2`} />
                <textarea value={draft.contentLibrary.description} onChange={(event) => patch({ contentLibrary: { ...draft.contentLibrary, description: event.target.value } })} className={`${textAreaClass} md:col-span-3`} />
                <textarea value={joinLines(draft.contentLibrary.tabs)} onChange={(event) => patch({ contentLibrary: { ...draft.contentLibrary, tabs: splitLines(event.target.value) } })} className={`${textAreaClass} md:col-span-2`} />
                <input type="number" min="0" value={draft.contentLibrary.count} onChange={(event) => patch({ contentLibrary: { ...draft.contentLibrary, count: Number(event.target.value) } })} className={inputClass} />
              </div>
              <BeforeAfterEditor data={draft} setData={setDraft} />
            </div>
          )}

          {section === "dashboard" && (
            <div className="grid gap-4">
              <SimpleSectionHeader sectionData={draft.map} onChange={(map) => patch({ map })} />
              <EditableRows
                title="Map Locations"
                items={draft.map.locations}
                addLabel="Add Location"
                onAdd={() => patch({ map: { ...draft.map, locations: [...draft.map.locations, { city: "New city", value: "0", width: "50%" }] } })}
                render={(item, index) => (
                  <>
                    <input value={item.city} onChange={(event) => patch({ map: { ...draft.map, locations: updateAt(draft.map.locations, index, { ...item, city: event.target.value }) } })} className={inputClass} />
                    <input value={item.value} onChange={(event) => patch({ map: { ...draft.map, locations: updateAt(draft.map.locations, index, { ...item, value: event.target.value }) } })} className={inputClass} />
                    <input value={item.width} onChange={(event) => patch({ map: { ...draft.map, locations: updateAt(draft.map.locations, index, { ...item, width: event.target.value }) } })} className={inputClass} />
                  </>
                )}
                onDelete={(index) => patch({ map: { ...draft.map, locations: removeAt(draft.map.locations, index) } })}
              />
              <DashboardEditor data={draft} setData={setDraft} />
            </div>
          )}

          {section === "people" && (
            <div className="grid gap-4">
              <TextListEditor title="Documents" sectionData={draft.documents} onChange={(documents) => patch({ documents })} />
              <TextListEditor title="Team" sectionData={draft.team} onChange={(team) => patch({ team })} />
              <TextListEditor title="Awards" sectionData={draft.awards} onChange={(awards) => patch({ awards })} />
              <div className={`${panelClass} grid gap-3 md:grid-cols-2`}>
                <input value={draft.testimonial.eyebrow} onChange={(event) => patch({ testimonial: { ...draft.testimonial, eyebrow: event.target.value } })} className={inputClass} />
                <input value={draft.testimonial.title} onChange={(event) => patch({ testimonial: { ...draft.testimonial, title: event.target.value } })} className={inputClass} />
                <textarea value={draft.testimonial.quote} onChange={(event) => patch({ testimonial: { ...draft.testimonial, quote: event.target.value } })} className={`${textAreaClass} md:col-span-2`} />
                <input value={draft.testimonial.authorRole} onChange={(event) => patch({ testimonial: { ...draft.testimonial, authorRole: event.target.value } })} className={inputClass} />
              </div>
            </div>
          )}

          <div className="sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#07020e]/95 px-0 py-4 backdrop-blur">
            {saveError ? <p className="max-w-[520px] text-sm font-bold text-red-200">{saveError}</p> : <span />}
            <div className="flex gap-3">
            <button type="button" disabled={isSaving} onClick={resetDraft} className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
              Cancel
            </button>
            <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-[8px] bg-violet-gradient px-6 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(109,63,196,0.32)] disabled:cursor-not-allowed disabled:opacity-60">
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Brand Page"}
            </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function SimpleSectionHeader<T extends { eyebrow: string; title: string; description?: string }>({ sectionData, onChange }: { sectionData: T; onChange: (next: T) => void }) {
  return (
    <div className={`${panelClass} grid gap-3 md:grid-cols-3`}>
      <input value={sectionData.eyebrow} onChange={(event) => onChange({ ...sectionData, eyebrow: event.target.value })} className={inputClass} />
      <input value={sectionData.title} onChange={(event) => onChange({ ...sectionData, title: event.target.value })} className={`${inputClass} md:col-span-2`} />
      {"description" in sectionData && (
        <textarea value={sectionData.description ?? ""} onChange={(event) => onChange({ ...sectionData, description: event.target.value })} className={`${textAreaClass} md:col-span-3`} />
      )}
    </div>
  );
}

function EditableRows<T>({
  title,
  items,
  addLabel,
  onAdd,
  render,
  onDelete,
}: {
  title: string;
  items: T[];
  addLabel: string;
  onAdd: () => void;
  render: (item: T, index: number) => React.ReactNode;
  onDelete: (index: number) => void;
}) {
  return (
    <div className={panelClass}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-display text-xl font-black">{title}</h4>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/15 px-4 py-2 text-xs font-black text-white">
          <Plus size={14} />
          {addLabel}
        </button>
      </div>
      <div className="divide-y divide-white/10 border-y border-white/10">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 py-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <div className="contents md:[&>*]:min-w-0">{render(item, index)}</div>
            <button type="button" onClick={() => onDelete(index)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-red-300/30 bg-red-500/10 px-3 text-xs font-black text-red-100">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionWithRows<T>({
  sectionData,
  onSectionChange,
  rows,
  onRowsChange,
  newRow,
  addLabel,
  renderRow,
}: {
  sectionData: { eyebrow: string; title: string; description: string };
  onSectionChange: (next: any) => void;
  rows: T[];
  onRowsChange: (next: T[]) => void;
  newRow: T;
  addLabel: string;
  renderRow: (item: T, index: number, setRows: (next: T[]) => void) => React.ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <SimpleSectionHeader sectionData={sectionData} onChange={onSectionChange} />
      <EditableRows title="Items" items={rows} addLabel={addLabel} onAdd={() => onRowsChange([...rows, newRow])} render={(item, index) => renderRow(item, index, onRowsChange)} onDelete={(index) => onRowsChange(removeAt(rows, index))} />
    </div>
  );
}

function TextListEditor({
  title,
  sectionData,
  onChange,
}: {
  title: string;
  sectionData: { eyebrow: string; title: string; items: string[] };
  onChange: (next: { eyebrow: string; title: string; items: string[] }) => void;
}) {
  return (
    <div className={`${panelClass} grid gap-3 md:grid-cols-3`}>
      <h4 className="font-display text-xl font-black md:col-span-3">{title}</h4>
      <input value={sectionData.eyebrow} onChange={(event) => onChange({ ...sectionData, eyebrow: event.target.value })} className={inputClass} />
      <input value={sectionData.title} onChange={(event) => onChange({ ...sectionData, title: event.target.value })} className={`${inputClass} md:col-span-2`} />
      <textarea value={joinLines(sectionData.items)} onChange={(event) => onChange({ ...sectionData, items: splitLines(event.target.value) })} className={`${textAreaClass} md:col-span-3`} />
    </div>
  );
}

function BeforeAfterEditor({ data, setData }: { data: ProjectCaseStudyData; setData: React.Dispatch<React.SetStateAction<ProjectCaseStudyData>> }) {
  const [selectedImages, setSelectedImages] = useState<Record<number, string>>({});

  function setItems(items: ProjectCaseStudyData["beforeAfter"]["items"]) {
    setData((current) => ({ ...current, beforeAfter: { ...current.beforeAfter, items } }));
  }

  return (
    <div className="grid gap-4">
      <SimpleSectionHeader sectionData={data.beforeAfter} onChange={(beforeAfter) => setData((current) => ({ ...current, beforeAfter }))} />
      <div className={panelClass}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="font-display text-xl font-black">Before / After Items</h4>
          <button type="button" onClick={() => setItems([...data.beforeAfter.items, { label: "New state", image: "", grayscale: false, stats: [{ label: "Metric", value: "0" }] }])} className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/15 px-4 py-2 text-xs font-black text-white">
            <Plus size={14} />
            Add State
          </button>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {data.beforeAfter.items.map((item, index) => (
            <div key={index} className="py-4">
              <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <input value={item.label} onChange={(event) => setItems(updateAt(data.beforeAfter.items, index, { ...item, label: event.target.value }))} className={inputClass} placeholder="State label" />
                <label className="flex min-h-10 items-center gap-2 rounded-[8px] border border-violet-200/15 bg-black/20 px-3 text-xs font-bold text-white/72">
                  <input type="checkbox" checked={Boolean(item.grayscale)} onChange={(event) => setItems(updateAt(data.beforeAfter.items, index, { ...item, grayscale: event.target.checked }))} />
                  Grayscale
                </label>
              </div>

              <div className="mb-4 border-t border-white/10 pt-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/48">Image</p>
                    <p className="mt-1 max-w-full truncate text-xs font-semibold text-white/58">{selectedImages[index] || item.image || "No custom image selected"}</p>
                  </div>
                  {item.image && (
                    <button type="button" onClick={() => setItems(updateAt(data.beforeAfter.items, index, { ...item, image: "" }))} className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-red-300/30 bg-red-500/10 px-3 text-xs font-black text-red-100">
                      <Trash2 size={13} />
                      Remove
                    </button>
                  )}
                </div>
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[8px] bg-violet-gradient px-4 text-sm font-black text-white shadow-[0_14px_34px_rgba(109,63,196,0.25)]">
                  <ImagePlus size={15} />
                  Browse Image
                  <input
                    name={`beforeAfterImage-${index}`}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => setSelectedImages((current) => ({ ...current, [index]: event.target.files?.[0]?.name ?? "" }))}
                  />
                </label>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/48">Metrics</p>
                  <button type="button" onClick={() => setItems(updateAt(data.beforeAfter.items, index, { ...item, stats: [...item.stats, { label: "Metric", value: "0" }] }))} className="inline-flex min-h-8 items-center gap-2 rounded-[8px] border border-violet-300/25 bg-white/[0.055] px-3 text-xs font-black text-white">
                    <Plus size={13} />
                    Add Metric
                  </button>
                </div>
                {item.stats.map((stat, statIndex) => (
                  <div key={statIndex} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <input value={stat.label} onChange={(event) => setItems(updateAt(data.beforeAfter.items, index, { ...item, stats: updateAt(item.stats, statIndex, { ...stat, label: event.target.value }) }))} className={inputClass} placeholder="Label" />
                    <input value={stat.value} onChange={(event) => setItems(updateAt(data.beforeAfter.items, index, { ...item, stats: updateAt(item.stats, statIndex, { ...stat, value: event.target.value }) }))} className={inputClass} placeholder="Value" />
                    <button type="button" onClick={() => setItems(updateAt(data.beforeAfter.items, index, { ...item, stats: removeAt(item.stats, statIndex) }))} className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-red-300/30 bg-red-500/10 px-3 text-red-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => setItems(removeAt(data.beforeAfter.items, index))} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-red-300/30 bg-red-500/10 px-4 py-2 text-xs font-black text-red-100">
                <Trash2 size={14} />
                Delete State
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardEditor({ data, setData }: { data: ProjectCaseStudyData; setData: React.Dispatch<React.SetStateAction<ProjectCaseStudyData>> }) {
  return (
    <div className="grid gap-4">
      <SectionWithRows
        sectionData={{ eyebrow: data.dashboard.eyebrow, title: data.dashboard.title, description: "" }}
        onSectionChange={(dashboardHeader) => setData((current) => ({ ...current, dashboard: { ...current.dashboard, eyebrow: dashboardHeader.eyebrow, title: dashboardHeader.title } }))}
        rows={data.dashboard.stats}
        addLabel="Add Stat"
        newRow={{ label: "New stat", value: "0", change: "+0%" }}
        onRowsChange={(stats) => setData((current) => ({ ...current, dashboard: { ...current.dashboard, stats } }))}
        renderRow={(item, index, setRows) => (
          <>
            <input value={item.label} onChange={(event) => setRows(updateAt(data.dashboard.stats, index, { ...item, label: event.target.value }))} className={inputClass} />
            <input value={item.value} onChange={(event) => setRows(updateAt(data.dashboard.stats, index, { ...item, value: event.target.value }))} className={inputClass} />
            <input value={item.change} onChange={(event) => setRows(updateAt(data.dashboard.stats, index, { ...item, change: event.target.value }))} className={inputClass} />
          </>
        )}
      />
      <EditableRows
        title="Monthly Chart"
        items={data.dashboard.monthly}
        addLabel="Add Month"
        onAdd={() => setData((current) => ({ ...current, dashboard: { ...current.dashboard, monthly: [...current.dashboard.monthly, { month: "New", height: "50%" }] } }))}
        render={(item, index) => (
          <>
            <input value={item.month} onChange={(event) => setData((current) => ({ ...current, dashboard: { ...current.dashboard, monthly: updateAt(current.dashboard.monthly, index, { ...item, month: event.target.value }) } }))} className={inputClass} />
            <input value={item.height} onChange={(event) => setData((current) => ({ ...current, dashboard: { ...current.dashboard, monthly: updateAt(current.dashboard.monthly, index, { ...item, height: event.target.value }) } }))} className={inputClass} />
          </>
        )}
        onDelete={(index) => setData((current) => ({ ...current, dashboard: { ...current.dashboard, monthly: removeAt(current.dashboard.monthly, index) } }))}
      />
    </div>
  );
}
