import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NewEventInput } from '../../../types/event';
import { createEvent } from '../api/eventsApi';

const CATEGORIES = ['Tech Fest', 'Workshop', 'Cultural', 'Other'];

export function CreateEventForm() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [capacityTotal, setCapacityTotal] = useState<number>(100);
  const [price, setPrice] = useState<number>(0);
  const [gates, setGates] = useState<string[]>(['']);

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerFileName, setBannerFileName] = useState('');

  function updateGate(index: number, value: string) {
    setGates((previous) =>
      previous.map((gate, i) => (i === index ? value : gate)),
    );
  }

  function addGate() {
    setGates((previous) => [...previous, '']);
  }

  function removeGate(index: number) {
    setGates((previous) => previous.filter((_, i) => i !== index));
  }

  function handleBannerUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Banner image must be smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBannerImage(reader.result);
        setBannerFileName(file.name);
        setError('');
      }
    };

    reader.onerror = () => {
      setError('Unable to read the selected image.');
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start date and end date.');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    if (
      Number.isNaN(startDateTime.getTime()) ||
      Number.isNaN(endDateTime.getTime())
    ) {
      setError('Please select valid event dates and times.');
      return;
    }

    if (endDateTime <= startDateTime) {
      setError('Event end date and time must be after the start date and time.');
      return;
    }

    if (capacityTotal < 1 || !Number.isInteger(capacityTotal)) {
      setError('Capacity must be a positive whole number.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Ticket price cannot be negative.');
      return;
    }

    if (!name.trim() || !venue.trim()) {
      setError('Please enter the event name and venue.');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setError('Please enter your custom event category.');
      return;
    }

    setSubmitting(true);

    try {
      const input: NewEventInput = {
        name: name.trim(),
        startDate,
        endDate,
        startTime,
        endTime,
        venue: venue.trim(),
        category:
          category === 'Other' ? customCategory.trim() : category,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        capacityTotal,
        price,
        bannerImage,
        gates: gates
          .map((gate) => gate.trim())
          .filter((gate) => gate.length > 0),
      };

      const created = await createEvent(input);
      navigate(`/organizer/events/${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create event. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]';

  const labelClass = 'mb-2 block text-sm font-medium text-[#334155]';

  const today = new Date().toLocaleDateString('en-CA');

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>Event name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={150}
          placeholder="e.g. Ascend — Tech Fest"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);

              if (endDate && e.target.value > endDate) {
                setEndDate(e.target.value);
              }
            }}
            min={today}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || today}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>End time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {category === 'Other' && (
        <div>
          <label className={labelClass}>Enter custom category</label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required
            maxLength={100}
            placeholder="e.g. Sports, Gaming, Business"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className={labelClass}>Venue</label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
          maxLength={255}
          placeholder="e.g. Main Campus, Thapar"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Short description</label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          required
          maxLength={250}
          placeholder="One line shown on the event card"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Full description</label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          required
          rows={4}
          maxLength={5000}
          placeholder="Detailed description shown on the event page"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Event banner image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className={inputClass}
        />

        <p className="mt-1 text-xs text-[#64748B]">
          Select an image for your event banner. Maximum size: 2 MB.
        </p>

        {bannerImage && (
          <div className="mt-3">
            <img
              src={bannerImage}
              alt="Event banner preview"
              className="h-48 w-full rounded-xl border border-[#E2E8F0] object-cover"
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="truncate text-xs text-[#64748B]">
                {bannerFileName}
              </p>

              <button
                type="button"
                onClick={() => {
                  setBannerImage(null);
                  setBannerFileName('');
                }}
                className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove image
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Total capacity</label>
        <input
          type="number"
          value={capacityTotal}
          onChange={(e) => setCapacityTotal(Number(e.target.value))}
          required
          min={1}
          step={1}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Ticket price (₹)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
          min={0}
          step="0.01"
          className={inputClass}
          placeholder="0 for a free event"
        />
        <p className="mt-1 text-xs text-[#64748B]">
          Enter 0 for a free event.
        </p>
      </div>

      <div>
        <label className={labelClass}>Gates</label>

        <div className="flex flex-col gap-2.5">
          {gates.map((gate, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={gate}
                onChange={(e) => updateGate(index, e.target.value)}
                placeholder={`Gate ${index + 1} name (e.g. Gate A — North)`}
                className={inputClass}
              />

              {gates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGate(index)}
                  className="shrink-0 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addGate}
          className="mt-3 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2 text-sm font-medium text-[#2563EB] transition hover:bg-[#DBEAFE]"
        >
          + Add gate
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
      >
        {submitting ? 'Creating…' : 'Create event'}
      </button>
    </form>
  );
}