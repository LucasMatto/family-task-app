import { supabase } from "./supabase";

/**
 * Add a new task for a given user in Supabase.
 * @param {string} userId - UUID of the user (from profiles/auth).
 * @param {object} task - Task object containing { title, time, assignedTo, status }.
 * @returns {Promise<string>} The created task ID.
 */
export async function addTask(userId, task) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        uid: userId,
        title: task.title,
        time: task.time,
        assigned_to: task.assignedTo || task.assigned_to,
        status: task.status || "Pendiente",
      }
    ])
    .select();

  if (error) throw error;
  return data[0].id;
}

/**
 * Retrieve all tasks for a given user from Supabase.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Array>} Array of task objects.
 */
export async function getTasks(userId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("uid", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Map fields to match components expectations if necessary
  return data.map(item => ({
    id: item.id,
    uid: item.uid,
    title: item.title,
    time: item.time,
    assignedTo: item.assigned_to,
    status: item.status,
    createdAt: item.created_at
  }));
}

/**
 * Update a specific task in Supabase.
 * @param {string} userId - UUID of the user.
 * @param {string} taskId - ID of the task to update.
 * @param {object} updates - Partial task fields to update.
 */
export async function updateTask(userId, taskId, updates) {
  const mappedUpdates = {};
  if (updates.title !== undefined) mappedUpdates.title = updates.title;
  if (updates.time !== undefined) mappedUpdates.time = updates.time;
  if (updates.status !== undefined) mappedUpdates.status = updates.status;
  if (updates.assignedTo !== undefined) mappedUpdates.assigned_to = updates.assignedTo;
  if (updates.assigned_to !== undefined) mappedUpdates.assigned_to = updates.assigned_to;

  const { error } = await supabase
    .from("tasks")
    .update(mappedUpdates)
    .eq("id", taskId)
    .eq("uid", userId);

  if (error) throw error;
}

/**
 * Delete a task from Supabase.
 * @param {string} userId - UUID of the user.
 * @param {string} taskId - ID of the task to delete.
 */
export async function deleteTask(userId, taskId) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("uid", userId);

  if (error) throw error;
}
