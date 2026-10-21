
import { useEffect, useState, type FormEvent } from "react";
import { getAuthHeaders } from "../../lib/authApi";
import { getMyEvents } from "../../features/events/api/eventsApi";
import StatusBadge from "../../components/organizer/StatusBadge";

const API_BASE_URL = "http://localhost:3000";

type ResourceStatus = "Available" | "Low" | "Critical";

type ResourceItem = {
  id: string;
  eventId: string;
  name: string;
  category: string;
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  unit: string;
  notes: string | null;
  status: ResourceStatus;
};

type OrganizerEvent = {
  id: string;
  title: string;
  status: string;
};

type ResourceForm = {
  eventId: string;
  name: string;
  category: string;
  totalQuantity: string;
  usedQuantity: string;
  lowStockThreshold: string;
  unit: string;
  notes: string;
};

const emptyForm: ResourceForm = {
  eventId: "",
  name: "",
  category: "General",
  totalQuantity: "1",
  usedQuantity: "0",
  lowStockThreshold: "5",
  unit: "units",
  notes: "",
};

const barColor: Record<ResourceStatus, string> = {
  Available: "bg-[#16A34A]",
  Low: "bg-[#D97706]",
  Critical: "bg-[#DC2626]",
};

async function resourceRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export default function Resources() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] =
    useState<ResourceItem | null>(null);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [resourceData, eventData] = await Promise.all([
        resourceRequest<ResourceItem[]>("/resources"),
        getMyEvents(),
      ]);

      setResources(resourceData);
      setEvents(
        eventData.map((event) => ({
          id: event.id,
          title: event.title,
          status: event.status,
        })),
      );

      setForm((current) => ({
        ...current,
        eventId:
          current.eventId ||
          eventData.find((event) => event.status !== "cancelled")?.id ||
          "",
      }));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load resources.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function openCreateForm() {
    setEditingResource(null);
    setForm({
      ...emptyForm,
      eventId:
        events.find((event) => event.status !== "cancelled")?.id ?? "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(resource: ResourceItem) {
    setEditingResource(resource);
    setForm({
      eventId: resource.eventId,
      name: resource.name,
      category: resource.category,
      totalQuantity: String(resource.totalQuantity),
      usedQuantity: String(resource.usedQuantity),
      lowStockThreshold: String(resource.lowStockThreshold),
      unit: resource.unit,
      notes: resource.notes ?? "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function updateField<K extends keyof ResourceForm>(
    field: K,
    value: ResourceForm[K],
  ) {
    setForm((current) => {
      const updated = { ...current, [field]: value };

      if (field === "totalQuantity") {
        const total = Number(value);
        const threshold = Number(current.lowStockThreshold);

        if (total > 0 && threshold > total) {
          updated.lowStockThreshold = String(Math.min(5, total));
        }
      }

      return updated;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const totalQuantity = Number(form.totalQuantity);
    const usedQuantity = Number(form.usedQuantity);
    const lowStockThreshold = Number(form.lowStockThreshold);

    if (!form.eventId) {
      setError("Create an event first, then add a resource.");
      return;
    }

    if (
      !Number.isInteger(totalQuantity) ||
      !Number.isInteger(usedQuantity) ||
      !Number.isInteger(lowStockThreshold) ||
      totalQuantity < 1 ||
      usedQuantity < 0 ||
      lowStockThreshold < 0 ||
      usedQuantity > totalQuantity ||
      lowStockThreshold > totalQuantity
    ) {
      setError(
        "Enter valid whole numbers. Used quantity and low-stock threshold cannot exceed the total quantity.",
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...(!editingResource ? { eventId: form.eventId } : {}),
        name: form.name.trim(),
        category: form.category.trim() || "General",
        totalQuantity,
        usedQuantity,
        lowStockThreshold,
        unit: form.unit.trim() || "units",
        notes: form.notes.trim() || null,
      };

      if (editingResource) {
        await resourceRequest<ResourceItem>(
          `/resources/${editingResource.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );
        setSuccess("Resource updated successfully.");
      } else {
        await resourceRequest<ResourceItem>("/resources", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Resource added successfully.");
      }

      setShowForm(false);
      setEditingResource(null);
      setForm(emptyForm);
      await loadData();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the resource.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(resource: ResourceItem) {
    const confirmed = window.confirm(
      `Delete "${resource.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await resourceRequest<{ message: string }>(
        `/resources/${resource.id}`,
        { method: "DELETE" },
      );

      setResources((current) =>
        current.filter((item) => item.id !== resource.id),
      );
      setSuccess("Resource deleted successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete the resource.",
      );
    }
  }

  function getEventName(eventId: string) {
    return events.find((event) => event.id === eventId)?.title ??
      "Event unavailable";
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Resources
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Track inventory and manage resource quantities for your events.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          + Add Resource
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-sm text-[#166534]"
        >
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-[#1E293B]">
            {editingResource ? "Edit Resource" : "Add Resource"}
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#334155]">
              Event
              <select
                required
                value={form.eventId}
                disabled={Boolean(editingResource)}
                onChange={(event) =>
                  updateField("eventId", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 font-normal disabled:bg-[#F1F5F9]"
              >
                <option value="">Select an event</option>
                {events
                  .filter(
                    (event) =>
                      event.status !== "cancelled" ||
                      event.id === form.eventId,
                  )
                  .map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
              </select>
            </label>

            <label className="text-sm font-medium text-[#334155]">
              Resource name
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="e.g. Water bottles"
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-[#334155]">
              Category
              <input
                maxLength={80}
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                placeholder="e.g. Supplies"
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-[#334155]">
              Unit
              <input
                maxLength={30}
                value={form.unit}
                onChange={(event) =>
                  updateField("unit", event.target.value)
                }
                placeholder="e.g. bottles, pieces"
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-[#334155]">
              Total quantity
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.totalQuantity}
                onChange={(event) =>
                  updateField("totalQuantity", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-[#334155]">
              Used quantity
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.usedQuantity}
                onChange={(event) =>
                  updateField("usedQuantity", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-[#334155]">
              Low-stock threshold
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.lowStockThreshold}
                onChange={(event) =>
                  updateField("lowStockThreshold", event.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 font-normal"
              />
            </label>

            <label className="text-sm font-medium text-[#334155] sm:col-span-2">
              Notes (optional)
              <textarea
                rows={2}
                maxLength={2000}
                value={form.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Additional information about this resource"
                className="mt-1.5 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 font-normal"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || events.length === 0}
              className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingResource
                  ? "Save Changes"
                  : "Create Resource"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingResource(null);
                setError("");
              }}
              className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
          </div>

          {events.length === 0 && (
            <p className="mt-3 text-sm text-[#B45309]">
              You need to create an event before adding resources.
            </p>
          )}
        </form>
      )}

      {loading ? (
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
          Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
          <h3 className="font-semibold text-[#1E293B]">
            No resources yet
          </h3>
          <p className="mt-2 text-sm text-[#64748B]">
            Add resources for one of your events to start tracking inventory.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Add your first resource
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {resources.map((resource) => {
            const percentage =
              resource.totalQuantity > 0
                ? Math.min(
                    100,
                    Math.round(
                      (resource.usedQuantity / resource.totalQuantity) * 100,
                    ),
                  )
                : 0;

            return (
              <div
                key={resource.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1E293B]">
                      {resource.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {resource.category} · {getEventName(resource.eventId)}
                    </p>
                  </div>
                  <StatusBadge status={resource.status} />
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className={`h-full rounded-full ${barColor[resource.status]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#64748B]">
                  <span>
                    {resource.usedQuantity.toLocaleString()} used of{" "}
                    {resource.totalQuantity.toLocaleString()} {resource.unit}
                  </span>
                  <span>
                    {resource.availableQuantity.toLocaleString()} left
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                  <span className="text-xs text-[#64748B]">
                    Low stock at {resource.lowStockThreshold}
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(resource)}
                      className="text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(resource)}
                      className="text-sm font-medium text-[#DC2626] hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {resource.notes && (
                  <p className="mt-3 border-t border-[#F1F5F9] pt-3 text-sm text-[#64748B]">
                    {resource.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
