// 数据层：唯一接触 localStorage 的模块，负责任务的增删改查。
const STORAGE_KEY = 'todo-list:v1';

// 优先级：从高到低排列，顺序同时用于列表排序与循环切换。
export const PRIORITIES = ['high', 'medium', 'low'];
export const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' };

function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function save(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t.text === 'string')
      .map((t) => ({ ...t, priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium' }));
  } catch {
    return [];
  }
}

export function addTask(tasks, text, priority = 'medium') {
  const task = {
    id: uid(),
    text: text.trim(),
    completed: false,
    priority: PRIORITIES.includes(priority) ? priority : 'medium',
    createdAt: Date.now(),
  };
  tasks.unshift(task); // 新任务置于顶部
  save(tasks);
  return task;
}

export function toggleTask(tasks, id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    save(tasks);
  }
}

// 循环切换优先级：高 → 中 → 低 → 高。
export function cyclePriority(tasks, id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    const i = PRIORITIES.indexOf(task.priority);
    task.priority = PRIORITIES[(i + 1) % PRIORITIES.length];
    save(tasks);
  }
}

export function removeTask(tasks, id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
    save(tasks);
  }
}

export function editTask(tasks, id, text) {
  const task = tasks.find((t) => t.id === id);
  const trimmed = text.trim();
  if (task && trimmed) {
    task.text = trimmed;
    save(tasks);
  }
}

export function clearDone(tasks) {
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].completed) tasks.splice(i, 1);
  }
  save(tasks);
}
