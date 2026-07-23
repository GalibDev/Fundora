"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageUpload({
  value,
  onChange,
  label = "Upload campaign image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 5_000_000) return toast.error("Image must be under 5MB");
    setBusy(true);
    try {
      const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_KEY?.trim();
      if (!imgbbKey || imgbbKey === "replace_me") {
        throw new Error("ImgBB API key is not configured");
      }
      const body = new FormData();
      body.append("image", file);
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`,
        { method: "POST", body },
      );
      const result = await response.json();
      if (!response.ok || !result?.data?.url) {
        throw new Error(result?.error?.message || "ImgBB upload failed");
      }
      onChange(result.data.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/20 bg-cream p-4">
      {value ? (
        <img src={value} alt="" className="size-11 rounded-xl object-cover" />
      ) : (
        <span className="grid size-11 place-items-center rounded-xl bg-white">
          {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        </span>
      )}
      <span className="text-sm">
        <b className="block">{busy ? "Uploading..." : value ? "Replace image" : label}</b>
        <span className="text-black/45">JPG, PNG or WebP · max 5MB</span>
      </span>
      <input
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(event) => upload(event.target.files?.[0])}
      />
    </label>
  );
}
