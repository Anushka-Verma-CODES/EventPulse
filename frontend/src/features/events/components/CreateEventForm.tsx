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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="form-control">
        <label className="label"><span className="label-text">Event name</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Ascend — Tech Fest"
          className="input input-bordered w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label"><span className="label-text">Date</span></label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            placeholder="Sat, 21 Mar 2026"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Category</span></label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select select-bordered w-full"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Venue</span></label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
          placeholder="e.g. Main Campus, Thapar"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Short description</span></label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          required
          placeholder="One line shown on the event card"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Full description</span></label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          required
          rows={4}
          placeholder="Detailed description shown on the event page"
          className="textarea textarea-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Total capacity</span></label>
        <input
          type="number"
          value={capacityTotal}
          onChange={(e) => setCapacityTotal(Number(e.target.value))}
          required
          min={1}
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Gates</span></label>
        <div className="flex flex-col gap-2">
          {gates.map((gate, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={gate}
                onChange={(e) => updateGate(index, e.target.value)}
                placeholder={`Gate ${index + 1} name (e.g. Gate A — North)`}
                className="input input-bordered w-full"
              />
              {gates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGate(index)}
                  className="btn btn-outline btn-error"
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
          className="btn btn-outline btn-sm mt-2 self-start"
        >
          + Add gate
        </button>
      </div>

      <button type="submit" disabled={submitting} className="btn btn-primary mt-4">
        {submitting ? 'Creating…' : 'Create event'}
      </button>
    </form>
  );
}