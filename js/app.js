// 入口：持有各模块，绑定事件并协调数据层与视图层。

import * as store from './store.js';
import * as renderer from './renderer.js';
import { start as startClock } from './clock.js';

const els = {
  date: document.getElementById('date'),
  clock: document.getElementById('clock'),
  form: document.getElementById('compose'),
  input: document.getElementById('task-input'),
  priority: document.getElementById('priority-select'),
  list: document.getElementById('tasks'),
  count: document.getElementById('count'),
  clearDone: document.getElementById('clear-done'),
  themeToggle: document.getElementById('theme-toggle'),
  filters: document.querySelector('.filters'),
};

let tasks = store.load();
let filter = 'all';
let priority = 'medium';

function render() {
  renderer.render(tasks, filter, els);
}

// —— 主题：默认跟随系统，手动切换后写入 localStorage ——
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(theme);
}

els.themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

// —— 优先级选择 ——
els.priority.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-priority]');
  if (!btn) return;
  priority = btn.dataset.priority;
  els.priority.querySelectorAll('[data-priority]').forEach((b) => {
    const active = b === btn;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-checked', String(active));
  });
});

// —— 新增任务 ——
els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;
  store.addTask(tasks, text, priority);
  els.input.value = '';
  render();
  els.input.focus();
});

// —— 筛选 ——
els.filters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  filter = btn.dataset.filter;
  els.filters.querySelectorAll('.filter').forEach((b) => {
    const active = b === btn;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  render();
});

// —— 清除已完成 ——
els.clearDone.addEventListener('click', () => {
  store.clearDone(tasks);
  render();
});

// —— 任务列表事件（事件委托）：完成 / 删除 ——
els.list.addEventListener('click', (e) => {
  const li = e.target.closest('.task');
  if (!li) return;
  const action = e.target.closest('[data-action]');
  if (!action) return;
  if (action.dataset.action === 'toggle') store.toggleTask(tasks, li.dataset.id);
  else if (action.dataset.action === 'delete') store.removeTask(tasks, li.dataset.id);
  else if (action.dataset.action === 'priority') store.cyclePriority(tasks, li.dataset.id);
  render();
});

// —— 双击进入行内编辑 ——
els.list.addEventListener('dblclick', (e) => {
  const textEl = e.target.closest('.task__text');
  if (!textEl) return;
  const task = tasks.find((t) => t.id === textEl.closest('.task').dataset.id);
  if (task) beginEdit(textEl, task);
});

function beginEdit(textEl, task) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task__edit';
  input.value = task.text;
  input.maxLength = 200;
  textEl.replaceWith(input);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  let finished = false;
  const commit = () => {
    if (finished) return;
    finished = true;
    store.editTask(tasks, task.id, input.value);
    render();
  };
  const cancel = () => {
    if (finished) return;
    finished = true;
    render();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape') cancel();
  });
  input.addEventListener('blur', commit);
}

// —— 启动 ——
initTheme();
startClock(els.date, els.clock);
render();
