// src/pages/tasks/ParentTaskList.jsx
// Component to display tasks in a table for parent users
import React from "react";

export default function ParentTaskList({ tasks, onStatusToggle, onDelete }) {
  return (
    <div className="card border-0 rounded-4 card-shadow bg-white overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 border-0">Tarea</th>
              <th className="py-3 border-0">Asignado a</th>
              <th className="py-3 border-0">Hora</th>
              <th className="py-3 border-0 text-end px-4">Estado</th>
              <th className="py-3 border-0 text-end px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="px-4 py-3 fw-semibold text-dark border-0">{task.title}</td>
                <td className="py-3 text-secondary border-0">{task.assignedTo}</td>
                <td className="py-3 text-secondary border-0">{task.time}</td>
                <td className="py-3 text-end px-4 border-0">
                  <span className={`badge px-3 py-1-5 rounded-pill ${
                    task.status === "Completada" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                  }`}>{task.status}</span>
                </td>
                <td className="py-3 text-end px-4 border-0">
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => onStatusToggle(task)}
                  >
                    {task.status === "Completada" ? "Reabrir" : "Completar"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(task.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
