export function formatDate(value) {
  if (!value) {
    return "时间未记录";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function countTodayItems(items) {
  const todayKey = toDateKey(new Date());
  return items.filter((item) => toDateKey(item.createdAt ? new Date(item.createdAt) : new Date()) === todayKey).length;
}

export function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}
