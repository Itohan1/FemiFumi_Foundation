import { Dispatch, FormEvent, SetStateAction } from "react";
import { RecentUpdateFormState, RecentUpdateMediaFormItem } from "../types/admin";

type Props = {
  resetRecentUpdateForm: () => void;
  handleRecentUpdateSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  editingRecentUpdateId: string | null;
  isSubmittingRecentUpdate: boolean;
  recentUpdateForm: RecentUpdateFormState;
  setRecentUpdateForm: Dispatch<SetStateAction<RecentUpdateFormState>>;
  uploadRecentUpdateMedia: (file: File, type: "photo" | "video") => Promise<void>;
  recentUpdateMedia: RecentUpdateMediaFormItem[];
  updateRecentMediaCaption: (index: number, caption: string) => void;
  removeRecentMedia: (index: number) => void;
  handleDeleteRecentUpdate: () => void;
  onBackToList: () => void;
};

export function CreateRecentUpdateItemSection({
  resetRecentUpdateForm,
  handleRecentUpdateSubmit,
  editingRecentUpdateId,
  isSubmittingRecentUpdate,
  recentUpdateForm,
  setRecentUpdateForm,
  uploadRecentUpdateMedia,
  recentUpdateMedia,
  updateRecentMediaCaption,
  removeRecentMedia,
  handleDeleteRecentUpdate,
  onBackToList
}: Props) {
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black text-femiBlue">
          {editingRecentUpdateId ? "Edit Recent Update Item" : "Create Recent Update Item"}
        </h2>
        <button
          type="button"
          onClick={onBackToList}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold sm:w-auto"
        >
          Back to Recent Updates
        </button>
      </div>
      <form onSubmit={handleRecentUpdateSubmit}>
        <div className="grid min-w-0 gap-2">
          <input
            required
            value={recentUpdateForm.title}
            onChange={(event) =>
              setRecentUpdateForm((current) => ({
                ...current,
                title: event.target.value
              }))
            }
            placeholder="Title"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <textarea
            required
            rows={5}
            value={recentUpdateForm.description}
            onChange={(event) =>
              setRecentUpdateForm((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            placeholder="Description"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            type="date"
            min={minDate}
            value={recentUpdateForm.date}
            onChange={(event) =>
              setRecentUpdateForm((current) => ({
                ...current,
                date: event.target.value
              }))
            }
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={recentUpdateForm.location}
            onChange={(event) =>
              setRecentUpdateForm((current) => ({
                ...current,
                location: event.target.value
              }))
            }
            placeholder="Location"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <label className="text-xs font-semibold text-slate-600">Upload photos/videos from device</label>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                if (files.length > 0) {
                  files.forEach((file) => {
                    void uploadRecentUpdateMedia(file, "photo");
                  });
                  event.target.value = "";
                }
              }}
              className="w-full min-w-0 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm"
            />
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                if (files.length > 0) {
                  files.forEach((file) => {
                    void uploadRecentUpdateMedia(file, "video");
                  });
                  event.target.value = "";
                }
              }}
              className="w-full min-w-0 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm"
            />
          </div>
          <label className="text-xs font-semibold text-slate-600">Cover image/video shown on client</label>
          <select
            value={recentUpdateForm.mainMediaIndex}
            onChange={(event) =>
              setRecentUpdateForm((current) => ({
                ...current,
                mainMediaIndex: Number(event.target.value || 0)
              }))
            }
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          >
            {recentUpdateMedia.length === 0 ? (
              <option value={0}>No media uploaded yet</option>
            ) : (
              recentUpdateMedia.map((item, index) => (
                <option key={`${item.mediaUrl || item.previewUrl || "media"}-${index}`} value={index}>
                  {index + 1}. {item.type.toUpperCase()}
                </option>
              ))
            )}
          </select>
          <div className="grid gap-2 lg:grid-cols-2">
            {recentUpdateMedia.map((item, index) => (
              <div
                key={`${item.mediaUrl || item.previewUrl || "media"}-${index}`}
                className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-600">{item.type.toUpperCase()}</p>
                  {recentUpdateForm.mainMediaIndex === index ? (
                    <span className="rounded bg-femiBlue px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-700">
                  {editingRecentUpdateId
                    ? item.file
                      ? "Local file selected"
                      : "Existing uploaded media"
                    : item.mediaUrl || "Local file selected"}
                </p>
                {item.type === "photo" ? (
                  <img
                    src={item.mediaUrl || item.previewUrl}
                    alt={`Recent update media ${index + 1}`}
                    className="mt-2 aspect-video w-full rounded object-cover"
                  />
                ) : (
                  <video src={item.mediaUrl || item.previewUrl} controls className="mt-2 aspect-video w-full rounded bg-black object-contain" />
                )}
                <input
                  value={item.caption ?? ""}
                  onChange={(event) => updateRecentMediaCaption(index, event.target.value)}
                  placeholder="Caption (optional)"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      setRecentUpdateForm((current) => ({
                        ...current,
                        mainMediaIndex: index
                      }))
                    }
                    className="w-full rounded-lg border border-femiBlue px-3 py-1 text-xs font-semibold text-femiBlue sm:w-auto"
                  >
                    Set as Cover
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecentMedia(index)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              disabled={isSubmittingRecentUpdate}
              className="w-full rounded-lg bg-femiBlue px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                {isSubmittingRecentUpdate ? (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                    aria-hidden="true"
                  />
                ) : null}
                {isSubmittingRecentUpdate
                  ? editingRecentUpdateId
                    ? "Saving..."
                    : "Creating..."
                  : editingRecentUpdateId
                    ? "Save Changes"
                    : "Create"}
              </span>
            </button>
            <button
              type="button"
              onClick={resetRecentUpdateForm}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 sm:w-auto"
            >
              Clear
            </button>
            {editingRecentUpdateId ? (
              <button
                type="button"
                onClick={handleDeleteRecentUpdate}
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
