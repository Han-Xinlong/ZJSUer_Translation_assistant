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
            <button type="button" onClick={() => onSaveExpression(item.expression, "推荐语料")}>
              收藏表达
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CorpusPanel;
