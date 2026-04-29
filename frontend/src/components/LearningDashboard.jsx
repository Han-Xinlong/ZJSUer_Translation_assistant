import { useEffect, useMemo, useRef } from "react";

function LearningDashboard({ errors, expressions, history }) {
  const chartRef = useRef(null);

  const days = useMemo(() => buildRecentDays(14), []);
  const recentSevenDays = useMemo(() => days.slice(-7), [days]);
  const dailyCounts = useMemo(() => {
    return countByDate([...history, ...expressions, ...errors]);
  }, [errors, expressions, history]);

  const sevenDaySeries = useMemo(() => {
    return recentSevenDays.map((day) => ({
      label: day.label,
      value: dailyCounts[day.key] || 0
    }));
  }, [dailyCounts, recentSevenDays]);

  useEffect(() => {
    if (!chartRef.current) {
      return undefined;
    }

    let chart = null;
    let isMounted = true;

    Promise.all([
      import("echarts/core"),
      import("echarts/components"),
      import("echarts/charts"),
      import("echarts/renderers")
    ]).then(([echarts, components, charts, renderers]) => {
      if (!isMounted || !chartRef.current) {
        return;
      }

      echarts.use([
        charts.BarChart,
        components.GridComponent,
        components.TooltipComponent,
        renderers.CanvasRenderer
      ]);

      chart = echarts.init(chartRef.current);
      chart.setOption({
        color: ["#0f766e"],
        grid: {
          left: 24,
          right: 10,
          top: 18,
          bottom: 24
        },
        tooltip: {
          trigger: "axis"
        },
        xAxis: {
          type: "category",
          data: sevenDaySeries.map((item) => item.label),
          axisTick: { show: false }
        },
        yAxis: {
          type: "value",
          minInterval: 1,
          splitLine: {
            lineStyle: {
              color: "#edf0f3"
            }
          }
        },
        series: [
          {
            type: "bar",
            barMaxWidth: 28,
            data: sevenDaySeries.map((item) => item.value),
            itemStyle: {
              borderRadius: [5, 5, 0, 0]
            }
          }
        ]
      });
    });

    const handleResize = () => {
      if (chart) {
        chart.resize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      if (chart) {
        chart.dispose();
      }
    };
  }, [sevenDaySeries]);

  return (
    <section className="profile-panel">
      <h2>学习档案</h2>

      <div className="profile-grid">
        <div className="stat">
          <strong>{history.length}</strong>
          <span>历史记录</span>
        </div>
        <div className="stat">
          <strong>{expressions.length}</strong>
          <span>表达收藏</span>
        </div>
        <div className="stat">
          <strong>{errors.length}</strong>
          <span>错题沉淀</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>近 7 天练习趋势</h3>
          <div className="chart-box" ref={chartRef} />
        </article>

        <article className="dashboard-card">
          <h3>14 天热力</h3>
          <div className="heatmap-grid">
            {days.map((day) => {
              const count = dailyCounts[day.key] || 0;
              return (
                <div className="heatmap-cell-wrap" key={day.key}>
                  <span className={`heatmap-cell level-${Math.min(count, 4)}`} title={`${day.label}: ${count}`} />
                  <small>{day.label}</small>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}

function buildRecentDays(length) {
  const days = [];
  const today = startOfDay(new Date());
  for (let index = length - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    days.push({
      key: toDateKey(date),
      label: `${date.getMonth() + 1}/${date.getDate()}`
    });
  }
  return days;
}

function countByDate(items) {
  return items.reduce((acc, item) => {
    const key = toDateKey(item.createdAt ? new Date(item.createdAt) : new Date());
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export default LearningDashboard;
