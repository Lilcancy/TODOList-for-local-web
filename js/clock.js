// 功能模块：实时日期与时间，秒级刷新。

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function format(d) {
  const date = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return { date, time };
}

export function start(dateEl, timeEl) {
  function tick() {
    const d = new Date();
    const { date, time } = format(d);
    dateEl.textContent = date;
    timeEl.textContent = time;
  }
  tick();
  setInterval(tick, 1000);
}
