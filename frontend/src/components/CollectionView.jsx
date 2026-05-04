import { BookOpen } from "lucide-react";

function CollectionView({ emptyText, items, onRemove, title }) {
  return (
    <section className="collection-panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={28} aria-hidden="true" />
          <p>{emptyText}</p>
        </div>
      ) : (
        <ul className="collection-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.source}</span>
              {item.sourceText && (
                <div className="collection-context">
                  <small>原文</small>
                  <p>{item.sourceText}</p>
                </div>
              )}
              <p>{item.text}</p>
              <button type="button" onClick={() => onRemove(item.id)}>移除</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CollectionView;
