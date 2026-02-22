import { Dispatch, FormEvent, SetStateAction } from "react";
import { GalleryExtraMediaFormItem, GalleryFormState } from "../types/admin";

type Props = {
  resetGalleryForm: () => void;
  handleGallerySubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  editingGalleryId: string | null;
  isSubmittingGallery: boolean;
  galleryForm: GalleryFormState;
  setGalleryForm: Dispatch<SetStateAction<GalleryFormState>>;
  galleryPreviewUrl: string;
  onSelectGalleryMedia: (file: File) => void;
  galleryExtraMedia: GalleryExtraMediaFormItem[];
  uploadGalleryExtraMedia: (file: File, type: "photo" | "video") => Promise<void>;
  removeGalleryExtraMedia: (index: number) => void;
  handleDeleteGallery: () => void;
  onBackToList: () => void;
};

export function CreateGalleryItemSection({
  resetGalleryForm,
  handleGallerySubmit,
  editingGalleryId,
  isSubmittingGallery,
  galleryForm,
  setGalleryForm,
  galleryPreviewUrl,
  onSelectGalleryMedia,
  galleryExtraMedia,
  uploadGalleryExtraMedia,
  removeGalleryExtraMedia,
  handleDeleteGallery,
  onBackToList
}: Props) {
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black text-femiBlue">
          {editingGalleryId ? "Edit Gallery Item" : "Create Gallery"}
        </h2>
        <button
          type="button"
          onClick={onBackToList}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold sm:w-auto"
        >
          Back to Donation Gallery
        </button>
      </div>
      <form onSubmit={handleGallerySubmit}>
        <div className="grid min-w-0 gap-2">
          <select
            value={galleryForm.type}
            onChange={(event) =>
              setGalleryForm((current) => ({
                ...current,
                type: event.target.value as "photo" | "video"
              }))
            }
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
          <input
            required
            value={galleryForm.donateeName}
            onChange={(event) =>
              setGalleryForm((current) => ({
                ...current,
                donateeName: event.target.value
              }))
            }
            placeholder="Donatee name"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={galleryForm.title}
            onChange={(event) =>
              setGalleryForm((current) => ({
                ...current,
                title: event.target.value
              }))
            }
            placeholder="Title"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <textarea
            required
            rows={3}
            value={galleryForm.description}
            onChange={(event) =>
              setGalleryForm((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            placeholder="Description"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={galleryForm.location}
            onChange={(event) =>
              setGalleryForm((current) => ({
                ...current,
                location: event.target.value
              }))
            }
            placeholder="Location"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={galleryForm.address}
            onChange={(event) =>
              setGalleryForm((current) => ({
                ...current,
                address: event.target.value
              }))
            }
            placeholder="Address"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            type="date"
            min={minDate}
            value={galleryForm.date}
            onChange={(event) =>
              setGalleryForm((current) => ({
                ...current,
                date: event.target.value
              }))
            }
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={galleryForm.priorityplacement}
              onChange={(event) =>
                setGalleryForm((current) => ({
                  ...current,
                  priorityplacement: event.target.checked
                }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            Mark as priority placement
          </label>
          {galleryPreviewUrl || galleryForm.mediaUrl ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
              {galleryForm.type === "photo" ? (
                <img
                  src={galleryPreviewUrl || galleryForm.mediaUrl}
                  alt="Gallery preview"
                  className="aspect-video w-full rounded object-cover"
                />
              ) : (
                <video
                  src={galleryPreviewUrl || galleryForm.mediaUrl}
                  controls
                  className="aspect-video w-full rounded bg-black object-contain"
                />
              )}
            </div>
          ) : null}
          <label className="text-xs font-semibold text-slate-600">Upload from device (photo/video)</label>
          <input
            type="file"
            accept={galleryForm.type === "video" ? "video/*" : "image/*"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onSelectGalleryMedia(file);
                event.target.value = "";
              }
            }}
            className="w-full min-w-0 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm"
          />
          <label className="text-xs font-semibold text-slate-600">Add other photos/videos</label>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadGalleryExtraMedia(file, "photo");
                  event.target.value = "";
                }
              }}
              className="w-full min-w-0 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm"
            />
            <input
              type="file"
              accept="video/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadGalleryExtraMedia(file, "video");
                  event.target.value = "";
                }
              }}
              className="w-full min-w-0 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm"
            />
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {galleryExtraMedia.map((item, index) => (
              <div
                key={`${item.mediaUrl || item.previewUrl || "gallery-extra"}-${index}`}
                className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                {item.type === "photo" ? (
                  <img
                    src={item.mediaUrl || item.previewUrl}
                    alt={`Gallery additional media ${index + 1}`}
                    className="mt-2 aspect-video w-full rounded object-cover"
                  />
                ) : (
                  <video
                    src={item.mediaUrl || item.previewUrl}
                    controls
                    className="mt-2 aspect-video w-full rounded bg-black object-contain"
                  />
                )}
                {item.isUploading ? <p className="mt-2 text-xs text-slate-600">Uploading...</p> : null}
                {item.uploadError ? (
                  <p className="mt-2 text-xs text-red-600">Upload failed. Remove this item and try again.</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeGalleryExtraMedia(index)}
                  className="mt-2 rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              disabled={isSubmittingGallery}
              className="w-full rounded-lg bg-femiBlue px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                {isSubmittingGallery ? (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                    aria-hidden="true"
                  />
                ) : null}
                {isSubmittingGallery
                  ? editingGalleryId
                    ? "Saving..."
                    : "Creating..."
                  : editingGalleryId
                    ? "Save Changes"
                    : "Create"}
              </span>
            </button>
            <button
              type="button"
              onClick={resetGalleryForm}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 sm:w-auto"
            >
              Clear
            </button>
            {editingGalleryId ? (
              <button
                type="button"
                onClick={handleDeleteGallery}
                className="w-full rounded-lg bg-femiRed px-4 py-2 text-sm font-bold text-white sm:w-auto"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </section>
  );
}
