// 视图层：把数据渲染成 DOM，处理筛选与计数，不直接读写存储。

import { PRIORITIES, PRIORITY_LABELS } from './store.js';

const PRIORITY_ORDER = new Map(PRIORITIES.map((p, i) => [p, i]));

function esc(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}

function taskTemplate(task) {
  const done = task.completed;
  const prio = PRIORITIES.includes(task.priority) ? task.priority : 'medium';
  return `
    <li class="task${done ? ' task--done' : ''}" data-id="${task.id}">
      <button class="task__toggle" type="button" data-action="toggle"
        aria-label="${done ? '标记为未完成' : '标记为完成'}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
      <button class="task__priority task__priority--${prio}" type="button" data-action="priority"
        aria-label="优先级：${PRIORITY_LABELS[prio]}，点击切换" title="点击切换优先级">${PRIORITY_LABELS[prio]}</button>
      <span class="task__text">${esc(task.text)}</span>
      <button class="task__delete" type="button" data-action="delete" aria-label="删除任务">
        <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </li>`;
}

export function render(tasks, filter, els) {
  const visible =
    filter === 'active'
      ? tasks.filter((t) => !t.completed)
      : filter === 'done'
        ? tasks.filter((t) => t.completed)
        : [...tasks];

  // 按优先级排序：高 → 中 → 低；同优先级保持插入顺序（新任务在上）。
  visible.sort((a, b) => PRIORITY_ORDER.get(a.priority) - PRIORITY_ORDER.get(b.priority));

  if (tasks.length === 0) {
    els.list.innerHTML = '<li class="tasks__empty">还没有任务，从上面写一件今天要做的事吧。</li>';
  } else if (visible.length === 0) {
    const msg =
      filter === 'active' ? '没有未完成的任务。' : filter === 'done' ? '没有已完成的任务。' : '';
    els.list.innerHTML = `<li class="tasks__empty">${msg}</li>`;
  } else {
    els.list.innerHTML = visible.map(taskTemplate).join('');
  }

  const active = tasks.filter((t) => !t.completed).length;
  const done = tasks.length - active;
  els.count.textContent =
    tasks.length === 0 ? '' : active === 0 ? '全部完成' : `还有 ${active} 项未完成`;
  els.clearDone.hidden = done === 0;
}
