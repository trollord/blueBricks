"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Star,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ITEM_CATEGORY_LABELS,
  ITEM_CATEGORIES,
  ITEM_CONDITION_LABELS,
  ITEM_CONDITIONS,
  VEHICLE_TYPE_LABELS,
  VEHICLE_TYPES,
  HIRANANDANI_LOCALITIES,
} from "@/lib/constants";
import {
  itemStep1Schema,
  itemStep3Schema,
} from "@/lib/validations/item";
import { formatPrice } from "@/lib/utils/formatters";

type Step1Data = z.infer<typeof itemStep1Schema>;
type Step3Data = z.infer<typeof itemStep3Schema>;

interface UploadedImage {
  file?: File;
  preview: string;
  url: string;
  s3Key: string;
  isPrimary: boolean;
  uploading: boolean;
  error?: string;
}

const STEPS = ["Details", "Photos", "Pricing", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
              i < current
                ? "bg-[#FF5F15] text-white"
                : i === current
                ? "bg-[#FF5F15] text-white ring-2 ring-gray-200"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span
            className={`text-xs font-medium hidden sm:inline ${
              i === current ? "text-[#FF5F15]" : "text-gray-400"
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────── Step 1 - Details ─────────────────────────────────────────────── */
function Step1({
  defaultValues,
  onNext,
}: {
  defaultValues: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(itemStep1Schema) as any,
    defaultValues,
  });

  const category = watch("category");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v ?? "")}>
                <SelectTrigger aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((k) => (
                    <SelectItem key={k} value={k}>
                      {ITEM_CATEGORY_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-xs text-red-500">{errors.category.message}</p>
          )}
        </div>

        {category === "VEHICLES" && (
          <div className="space-y-1.5">
            <Label>Vehicle Type *</Label>
            <Controller
              control={control}
              name="vehicleType"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v ?? "")}
                >
                  <SelectTrigger aria-invalid={!!errors.vehicleType}>
                    <SelectValue placeholder="Car / Two-Wheeler / Cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {VEHICLE_TYPE_LABELS[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleType && (
              <p className="text-xs text-red-500">{errors.vehicleType.message}</p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Condition *</Label>
          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v ?? "")}>
                <SelectTrigger aria-invalid={!!errors.condition}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {ITEM_CONDITION_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.condition && (
            <p className="text-xs text-red-500">{errors.condition.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input
          {...register("title")}
          placeholder="e.g. Herman Miller Aeron chair - Size B"
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Description *</Label>
        <Textarea
          {...register("description")}
          placeholder="Age, usage pattern, scratches, what's included, reason for selling…"
          rows={5}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            Brand <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input {...register("brand")} placeholder="e.g. Sony, Honda, IKEA" />
        </div>
        <div className="space-y-1.5">
          <Label>
            Year purchased{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input
            {...register("yearPurchased")}
            type="number"
            min={1950}
            max={new Date().getFullYear()}
            placeholder="e.g. 2022"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Pickup locality *</Label>
          <Controller
            control={control}
            name="pickupLocality"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v ?? "")}>
                <SelectTrigger aria-invalid={!!errors.pickupLocality}>
                  <SelectValue placeholder="Select locality" />
                </SelectTrigger>
                <SelectContent>
                  {HIRANANDANI_LOCALITIES.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.pickupLocality && (
            <p className="text-xs text-red-500">{errors.pickupLocality.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>
            Landmark / tower{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Input {...register("pickupArea")} placeholder="e.g. Tower B, 3rd floor" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="gap-2 rounded-xl">
          Next: Photos <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/* ───────── Step 2 - Photos ──────────────────────────────────────────────── */
function Step2({
  images,
  onImagesChange,
  onNext,
  onBack,
}: {
  images: UploadedImage[];
  onImagesChange: (
    imgs: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])
  ) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const MAX_BYTES = 2 * 1024 * 1024;
      const oversized = acceptedFiles.filter((f) => f.size > MAX_BYTES);
      if (oversized.length) {
        oversized.forEach((f) =>
          toast.error(`"${f.name}" exceeds 2 MB and was removed.`)
        );
      }
      const validFiles = acceptedFiles.filter((f) => f.size <= MAX_BYTES);
      if (!validFiles.length) return;

      const newImages: UploadedImage[] = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        url: "",
        s3Key: "",
        isPrimary: false,
        uploading: true,
      }));

      if (!images.some((i) => i.isPrimary)) {
        newImages[0].isPrimary = true;
      }

      onImagesChange([...images, ...newImages]);

      const uploadPromises = newImages.map(async (img, idx) => {
        try {
          const res = await fetch(
            `/api/upload?filename=${encodeURIComponent(img.file!.name)}&contentType=${encodeURIComponent(img.file!.type)}&fileSize=${img.file!.size}`
          );
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error ?? "Failed to get upload URL");
          }
          const { presignedUrl, s3Key, publicUrl } = await res.json();
          const putRes = await fetch(presignedUrl, {
            method: "PUT",
            body: img.file,
            headers: { "Content-Type": img.file!.type },
          });
          if (!putRes.ok) {
            const body = await putRes.text().catch(() => "");
            const s3Msg = body.match(/<Message>(.*?)<\/Message>/)?.[1];
            throw new Error(s3Msg ?? `S3 upload failed (${putRes.status})`);
          }
          return { idx, url: publicUrl, s3Key, error: undefined };
        } catch (err) {
          return {
            idx,
            url: "",
            s3Key: "",
            error: err instanceof Error ? err.message : "Upload failed",
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      onImagesChange((prev: UploadedImage[]) => {
        const updated = [...prev];
        const startIdx = prev.length - newImages.length;
        results.forEach(({ idx, url, s3Key, error }) => {
          const i = startIdx + idx;
          if (i < updated.length) {
            updated[i] = { ...updated[i], uploading: false, url, s3Key, error };
          }
        });
        return updated;
      });
    },
    [images, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/heic": [],
    },
    maxFiles: 10,
  });

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    if (images[idx].isPrimary && updated.length > 0) {
      updated[0] = { ...updated[0], isPrimary: true };
    }
    onImagesChange(updated);
  };

  const setPrimary = (idx: number) => {
    onImagesChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  const hasUploading = images.some((i) => i.uploading);
  const hasError = images.some((i) => i.error);
  const canProceed = !hasUploading && !hasError;

  const handleNext = () => {
    if (hasUploading) return toast.error("Wait for uploads to finish.");
    if (hasError) return toast.error("Remove the failed photos and try again.");
    onNext();
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-[#FF5F15] bg-gray-50"
            : "border-gray-200 hover:border-gray-300 bg-[#F5F5F5]"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? "Drop photos here" : "Drag & drop photos here"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          or click to browse · up to 2 MB each · 10 photos max · optional
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                img.isPrimary ? "border-[#FF5F15]" : "border-gray-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`Photo ${idx + 1}`}
                className="w-full h-32 object-cover"
              />
              {img.uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#FF5F15]" />
                </div>
              )}
              {img.error && (
                <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center p-2">
                  <p className="text-xs text-red-600 text-center">{img.error}</p>
                </div>
              )}
              {!img.uploading && !img.error && (
                <div className="absolute top-1.5 right-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className={`p-1 rounded-full ${
                      img.isPrimary
                        ? "bg-[#FF5F15] text-white"
                        : "bg-white/95 text-gray-500 hover:text-[#FF5F15]"
                    }`}
                    aria-label="Mark primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1 rounded-full bg-white/95 text-gray-500 hover:text-red-500"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {img.isPrimary && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-[#FF5F15] text-white px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2 rounded-xl"
        >
          Next: Pricing <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ───────── Step 3 - Pricing ─────────────────────────────────────────────── */
function Step3({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step3Data>;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(itemStep3Schema) as any,
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="space-y-1.5">
        <Label>Price (₹) *</Label>
        <Input
          {...register("price")}
          type="number"
          min={1}
          placeholder="e.g. 25000"
          aria-invalid={!!errors.price}
        />
        {errors.price && (
          <p className="text-xs text-red-500">{errors.price.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Controller
          control={control}
          name="priceNegotiable"
          render={({ field }) => (
            <input
              type="checkbox"
              id="priceNegotiable"
              className="rounded border-gray-300 text-[#FF5F15]"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <Label htmlFor="priceNegotiable" className="cursor-pointer font-normal">
          Price is negotiable
        </Label>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" className="gap-2 rounded-xl">
          Next: Review <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

/* ───────── Step 4 - Review ──────────────────────────────────────────────── */
function Step4({
  step1,
  images,
  step3,
  onBack,
  onSubmit,
  submitting,
}: {
  step1: Partial<Step1Data>;
  images: UploadedImage[];
  step3: Partial<Step3Data>;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const rows: [string, string | number | undefined][] = [
    ["Category", ITEM_CATEGORY_LABELS[step1.category ?? ""] ?? step1.category],
    ...(step1.category === "VEHICLES"
      ? [["Vehicle type", VEHICLE_TYPE_LABELS[step1.vehicleType ?? ""] ?? step1.vehicleType] as [string, string]]
      : []),
    ["Condition", ITEM_CONDITION_LABELS[step1.condition ?? ""] ?? step1.condition],
    ["Brand", step1.brand || "-"],
    ["Year purchased", step1.yearPurchased ? String(step1.yearPurchased) : "-"],
    ["Pickup", step1.pickupArea ? `${step1.pickupArea}, ${step1.pickupLocality}` : step1.pickupLocality],
    [
      "Price",
      step3.price
        ? `${formatPrice(Number(step3.price))}${step3.priceNegotiable ? " (Negotiable)" : ""}`
        : "-",
    ],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Your listing will be sent for admin review before it goes live.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="font-semibold text-gray-900">{step1.title}</h3>
        <p className="text-sm text-gray-600">{step1.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-2 text-sm">
              <span className="text-gray-500 min-w-[110px] shrink-0">
                {label}:
              </span>
              <span className="font-medium text-gray-900 break-words min-w-0">
                {String(value ?? "-")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Photos ({images.length})
        </p>
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`Photo ${i + 1}`}
                className="h-16 w-20 object-cover rounded-lg border border-gray-200"
              />
              {img.isPrimary && (
                <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-[#FF5F15] text-white px-1 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="gap-2 rounded-xl"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            "Submit for review"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ───────── Page shell ───────────────────────────────────────────────────── */
export default function NewItemPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [step1, setStep1] = useState<Partial<Step1Data>>({});
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [step3, setStep3] = useState<Partial<Step3Data>>({
    priceNegotiable: false,
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = {
        ...step1,
        ...step3,
        yearPurchased: step1.yearPurchased || null,
        images: images.map((img) => ({
          url: img.url,
          s3Key: img.s3Key,
          isPrimary: img.isPrimary,
        })),
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Submission failed");
      }

      toast.success("Item submitted! It will appear once admin approves.");
      router.push("/dashboard/items");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sell an item</h1>
        <p className="text-sm text-gray-500 mt-1">
          List something you no longer need - reach every resident of the
          estate.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <StepIndicator current={step} />

        {step === 0 && (
          <Step1
            defaultValues={step1}
            onNext={(d) => {
              setStep1(d);
              setStep(1);
            }}
          />
        )}
        {step === 1 && (
          <Step2
            images={images}
            onImagesChange={setImages}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <Step3
            defaultValues={step3}
            onNext={(d) => {
              setStep3(d);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step4
            step1={step1}
            images={images}
            step3={step3}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
