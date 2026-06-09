// src/services/firestoreTasks.js
// Service for handling task CRUD operations using Firebase Firestore.
// Falls back to localStorage mock when Firebase credentials are not configured.

import { db as firebaseDb, isFirebaseConfigured } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

/**
 * Add a new task for a given user.
 * @param {string} userId - UID of the user (parent).
 * @param {object} task - Task object containing at least { title, time, assignedTo, status }.
 * @returns {Promise<string>} The created task ID.
 */
export async function addTask(userId, task) {
  if (isFirebaseConfigured) {
    const tasksCol = collection(firebaseDb, "users", userId, "tasks");
    const docRef = await addDoc(tasksCol, {
      ...task,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } else {
    // Mock mode – store in localStorage under a key per user
    const storageKey = `fc_mock_tasks_${userId}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const newTask = {
      ...task,
      id: `mock-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    existing.push(newTask);
    localStorage.setItem(storageKey, JSON.stringify(existing));
    return newTask.id;
  }
}

/**
 * Retrieve all tasks for a given user.
 * @param {string} userId - UID of the user.
 * @returns {Promise<Array>} Array of task objects.
 */
export async function getTasks(userId) {
  if (isFirebaseConfigured) {
    const tasksCol = collection(firebaseDb, "users", userId, "tasks");
    const q = query(tasksCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const tasks = [];
    snapshot.forEach(docSnap => {
      tasks.push({ id: docSnap.id, ...docSnap.data() });
    });
    return tasks;
  } else {
    const storageKey = `fc_mock_tasks_${userId}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    // Return newest first to mimic orderBy desc on createdAt
    return existing.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

/**
 * Update a specific task.
 * @param {string} userId - UID of the user.
 * @param {string} taskId - ID of the task to update.
 * @param {object} updates - Partial task fields to update.
 */
export async function updateTask(userId, taskId, updates) {
  if (isFirebaseConfigured) {
    const taskRef = doc(firebaseDb, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, updates);
  } else {
    const storageKey = `fc_mock_tasks_${userId}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const idx = existing.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } else {
      throw new Error("Task not found in mock storage");
    }
  }
}

/**
 * Delete a task.
 * @param {string} userId - UID of the user.
 * @param {string} taskId - ID of the task to delete.
 */
export async function deleteTask(userId, taskId) {
  if (isFirebaseConfigured) {
    const taskRef = doc(firebaseDb, "users", userId, "tasks", taskId);
    await deleteDoc(taskRef);
  } else {
    const storageKey = `fc_mock_tasks_${userId}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const filtered = existing.filter(t => t.id !== taskId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  }
}

// Helper: callers should import useAuth and pass currentUser.uid as userId.
