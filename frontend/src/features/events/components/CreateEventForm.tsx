import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NewEventInput } from '../../../types/event';
import { createEvent } from '../api/eventsApi';

const CATEGORIES = ['Tech Fest', 'Workshop', 'Cultural'];

export function CreateEventForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [capacityTotal, setCapacityTotal] = useState<number>(100);
  const [gates, setGates] = useState<string[]>(['']);

  function updateGate(index: number, value: string) {
    setGates((prev) => prev.map((g, i) => (i === index ? value : g)));
  }

  function addGate() {
    setGates((prev) => [...prev, '']);
  }

  function removeGate(index: number) {
    setGates((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const input: NewEventInput = {
      name,
      date,
      venue,
      category,
      shortDescription,
      fullDescription,
      capacityTotal,
      gates: gates.map((g) => g.trim()).filter((g) => g.length > 0),
    };

    const created = await createEvent(input);
    setSubmitting(false);
    navigate(`/events/${created.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#334155]">Event name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Ascend — Tech Fest"
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#334155]">Date</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            placeholder="Sat, 21 Mar 2026"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#334155]">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#334155]">Venue</label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
          placeholder="e.g. Main Campus, Thapar"
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#334155]">Short description</label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          required
          placeholder="One line shown on the event card"
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#334155]">Full description</label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          required
          rows={4}
          placeholder="Detailed description shown on the event page"
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#334155]">Total capacity</label>
        <input
          type="number"
          value={capacityTotal}
          onChange={(e) => setCapacityTotal(Number(e.target.value))}
          required
          min={1}
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#334155]">Gates</label>
        <div className="flex flex-col gap-2.5">
          {gates.map((gate, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={gate}
                onChange={(e) => updateGate(index, e.target.value)}
                placeholder={`Gate ${index + 1} name (e.g. Gate A — North)`}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#DBEAFE]"
              />
              {gates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGate(index)}
                  className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]"
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