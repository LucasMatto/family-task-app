// src/pages/tasks/TaskForm.jsx
// Component for creating a new task (parent view)
import React, { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !time || !assignedTo) return;
    const newTask = {
      title,
      time,
      assignedTo,
      status: "Pendiente",
    };
    await onAdd(newTask);
    // reset fields
    setTitle("");
    setTime("");
    setAssignedTo("");
  };

  return (
    <form className="card border-0 p-4 rounded-4 card-shadow bg-white mb-4" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Título de la tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Asignado a (nombre)"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-primary">
            Añadir Tarea
          </button>
        </div>
      </div>
    </form>
  );
}
