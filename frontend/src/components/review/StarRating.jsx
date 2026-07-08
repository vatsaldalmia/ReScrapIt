import { Star } from 'lucide-react';

export default function StarRating({ value = 0, count, size = 16, editable = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((s) => {
          const filled = s <= Math.round(value);
          const star = (
            <Star
              style={{ height: size, width: size }}
              className={`${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${editable ? 'cursor-pointer' : ''}`}
            />
          );
          return editable ? (
            <button key={s} type="button" onClick={() => onChange?.(s)} aria-label={`${s} star`}>
              {star}
            </button>
          ) : (
            <span key={s}>{star}</span>
          );
        })}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-gray-500">
          {value ? Number(value).toFixed(1) : '0.0'} {count > 0 ? `(${count})` : '(no reviews)'}
        </span>
      )}
    </div>
  );
}
