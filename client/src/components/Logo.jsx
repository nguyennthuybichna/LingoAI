import { BookOpen } from 'lucide-react';

export default function Logo({ size = 'md', showBook = false, vertical = false }) {
  const isSm = size === 'sm';

  return (
    <div className={`logo ${isSm ? 'logo--sm' : ''} ${vertical ? 'logo--vertical' : ''}`}>
      <span className="logo__icon" aria-hidden="true">
        <span className="logo__glyph">文A</span>
      </span>
      <span className="logo__text-row">
        <span className="logo__text">Lingo AI</span>
        {showBook && <BookOpen size={isSm ? 16 : 18} className="logo__book" />}
      </span>
    </div>
  );
}

