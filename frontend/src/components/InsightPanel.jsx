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
  todayProgress
}) {
  return (
    <aside className="insight-panel" aria-label="成长概览">
      <h2>今日复盘</h2>
      <div className="stat">
        <strong>{expressionCount}</strong>
        <span>累计表达</span>
      </div>
      <div className="stat">
        <strong>{reviewCount}</strong>
        <span>待复习错误</span>
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

export default InsightPanel;
