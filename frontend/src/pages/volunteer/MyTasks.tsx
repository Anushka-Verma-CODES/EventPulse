import { useState } from "react";
import { tasks as initialTasks } from "../../lib/volunteerMockData";
import StatusBadge from "../../components/volunteer/StatusBadge";

const filters = ["All", "Pending", "Completed"];

export default function MyTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeFilter, setActiveFilter] = useState("All");

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  }

  const filtered = tasks.filter((task) => {
    if (activeFilter === "Pending") return !task.completed;
    if (activeFilter === "Completed") return task.completed;
    return true;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">My Tasks</h2>
      <p className="mt-1 text-sm text-[#64748B]">
        {tasks[0]?.event} &bull; {tasks[0]?.shift}
      </p>

      <div className="mt-5 flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="mt-1 h-4 w-4 flex-shrink-0 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className={`text-sm font-semibold ${
                    task.completed ? "text-[#94A3B8] line-through" : "text-[#1E293B]"
                  }`}
                >
                  {task.name}
                </h3>
                <StatusBadge status={task.priority} />
              </div>
              <p className="mt-1 text-sm text-[#64748B]">{task.description}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[#64748B]">
                <span>Due: {task.dueTime}</span>
                <StatusBadge status={task.completed ? "Completed" : "Pending"} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
