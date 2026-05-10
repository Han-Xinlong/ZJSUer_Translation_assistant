import { corpusExamples } from "../data/corpus.js";

function CorpusPanel({ items, onSaveExpression }) {
  const visibleItems = items.length > 0 ? items : corpusExamples.slice(0, 3);

  return (
    <section className="corpus-panel">
      <h2>推荐语料</h2>
      <div className="corpus-grid">
        {visibleItems.map((item) => (
          <article key={item.id}>
            <span>{item.title}</span>
            <p>{item.expression}</p>
            <small>{item.note}</small>
            {item.reason && <em>{item.reason}</em>}
            <button
              type="button"
              onClick={() => onSaveExpression(item.expression, "推荐语料", {
                corpusId: item.id,
                corpusKeywords: item.keywords,
                corpusTitle: item.title,
                relatedExpressions: item.relatedExpressions
              })}
            >
              收藏表达
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CorpusPanel;
