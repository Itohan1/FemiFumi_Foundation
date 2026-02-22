import { Dispatch, FormEvent, SetStateAction } from "react";
import { UpcomingEventFormState } from "../types/admin";

type Props = {
  resetUpcomingForm: () => void;
  handleUpcomingSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  editingUpcomingId: string | null;
  isSubmittingUpcoming: boolean;
  upcomingForm: UpcomingEventFormState;
  setUpcomingForm: Dispatch<SetStateAction<UpcomingEventFormState>>;
  upcomingPreviewUrl: string;
  onSelectUpcomingImage: (file: File) => void;
  handleDeleteUpcoming: () => void;
  onBackToList: () => void;
};

export function CreateUpcomingEventSection({
  resetUpcomingForm,
  handleUpcomingSubmit,
  editingUpcomingId,
  isSubmittingUpcoming,
  upcomingForm,
  setUpcomingForm,
  upcomingPreviewUrl,
  onSelectUpcomingImage,
  handleDeleteUpcoming,
  onBackToList
}: Props) {
  return (
    <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black text-femiBlue">
          {editingUpcomingId ? "Edit Upcoming Event" : "Create Upcoming Event"}
        </h2>
        <button
          type="button"
          onClick={onBackToList}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold sm:w-auto"
        >
          Back to Upcoming Events
        </button>
      </div>
      <form onSubmit={handleUpcomingSubmit}>
        <div className="grid min-w-0 gap-2">
          <input
            required
            value={upcomingForm.title}
            onChange={(event) =>
              setUpcomingForm((current) => ({
                ...current,
                title: event.target.value
              }))
            }
            placeholder="Title"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <textarea
            required
            rows={4}
            value={upcomingForm.description}
            onChange={(event) =>
              setUpcomingForm((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            placeholder="Description"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            type="datetime-local"
            step={60}
            value={upcomingForm.dateIso}
            onChange={(event) =>
              setUpcomingForm((current) => ({
                ...current,
                dateIso: event.target.value
              }))
            }
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            value={upcomingForm.location}
            onChange={(event) =>
              setUpcomingForm((current) => ({
                ...current,
                location: event.target.value
              }))
            }
            placeholder="Location"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2"
          />
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={upcomingForm.priorityplacement}
              onChange={(event) =>
                setUpcomingForm((current) => ({
                  ...current,
                  priorityplacement: event.target.checked
                }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            Mark as priority placement
          </label>
          {upcomingPreviewUrl ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <img
                src={upcomingPreviewUrl}
                alt="Upcoming event preview"
                className="h-44 w-full rounded object-cover"
              />
            </div>
          ) : null}
          <label className="text-xs font-semibold text-slate-600">Upload image from device</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onSelectUpcomingImage(file);
                event.target.value = "";
              }
            }}
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              disabled={isSubmittingUpcoming}
              className="w-full rounded-lg bg-femiBlue px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                {isSubmittingUpcoming ? (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
                    aria-hidden="true"
                  />
                ) : null}
                {isSubmittingUpcoming
                  ? editingUpcomingId
                    ? "Saving..."
                    : "Creating..."
                  : editingUpcomingId
                    ? "Save Changes"
                    : "Create"}
              </span>
            </button>
            <button
              type="button"
              onClick={resetUpcomingForm}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 sm:w-auto"
            >
              Clear
            </button>
            {editingUpcomingId ? (
              <button
                type="button"
                onClick={handleDeleteUpcoming}
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
