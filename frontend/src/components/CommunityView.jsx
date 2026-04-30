import { Languages } from "lucide-react";

import { formatDate } from "../utils/date.js";

function CommunityView({ items, onRemove }) {
  return (
    <section className="collection-panel">
      <h2>社群互学</h2>
      {items.length === 0 ? (
        <div className="empty-state">
          <Languages size={28} aria-hidden="true" />
          <p>还没有共享内容。在写作台把译文或润色版本分享到社群，积累可互学的语料。</p>
        </div>
      ) : (
        <ul className="community-list">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <span>{item.source}</span>
                <small>{formatDate(item.createdAt)}</small>
              </div>
              <p>{item.text}</p>
              <button type="button" onClick={() => onRemove(item.id)}>移除</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CommunityView;
