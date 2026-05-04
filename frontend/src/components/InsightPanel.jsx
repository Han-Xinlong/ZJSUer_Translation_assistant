import { Database, Download, RotateCcw } from "lucide-react";

function InsightPanel({
  expressionCount,
  goals,
  onClearAllLearningData,
  onClearHistory,
  onExportReport,
  onLoadDemoData,
  onLoadHistory,
  recentHistory,
  reviewCount,
  serviceStatus,
  todayProgress
}) {
  const statusTone = getStatusTone(serviceStatus);

  return (
    <aside className="insight-panel" aria-label="成长概览">
      <h2>今日复盘</h2>
      <section className={`service-status ${statusTone}`} aria-label="AI 服务状态">
        <div>
          <strong>{getStatusTitle(serviceStatus)}</strong>
          <span>{serviceStatus.provider}</span>
        </div>
        <p>{serviceStatus.message}</p>
        {serviceStatus.model && <small>Model: {serviceStatus.model}</small>}
      </section>
      <div className="stat">
        <strong>{expressionCount}</strong>
        <span>累计表达</span>
      </div>
      <div className="stat">
        <strong>{reviewCount}</strong>
        <span>待改进表达</span>
      </div>
      <div className="goal-card">
        <div>
          <strong>{Math.min(todayProgress, goals.dailyTarget)}</strong>
          <span>/ {goals.dailyTarget} 今日目标</span>
        </div>
        <progress max={goals.dailyTarget} value={Math.min(todayProgress, goals.dailyTarget)} />
      </div>
      <section>
        <div className="section-title-row">
          <h3>最近记录</h3>
          <button type="button" onClick={onClearHistory}>清空</button>
        </div>
        <ul className="history-list">
          {recentHistory.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onLoadHistory(item)}>
                <span>{item.type}</span>
                <p>{item.text}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="demo-tools" aria-label="演示工具">
        <h3>演示工具</h3>
        <button type="button" onClick={onExportReport}>
          <Download size={16} aria-hidden="true" />
          导出报告
        </button>
        <button type="button" onClick={onLoadDemoData}>
          <Database size={16} aria-hidden="true" />
          载入演示数据
        </button>
        <button type="button" onClick={onClearAllLearningData}>
          <RotateCcw size={16} aria-hidden="true" />
          清空全部数据
        </button>
      </section>
    </aside>
  );
}

function getStatusTitle(serviceStatus) {
  if (serviceStatus.status === "checking") {
    return "检查中";
  }
  if (serviceStatus.status === "offline") {
    return "后端离线";
  }
  if (!serviceStatus.configured) {
    return "配置待完善";
  }
  if (serviceStatus.provider === "mock") {
    return "演示模式";
  }
  return "真实模型";
}

function getStatusTone(serviceStatus) {
  if (serviceStatus.status === "checking") {
    return "checking";
  }
  if (serviceStatus.status === "offline" || !serviceStatus.configured) {
    return "warning";
  }
  if (serviceStatus.provider === "mock") {
    return "mock";
  }
  return "ready";
}

export default InsightPanel;
