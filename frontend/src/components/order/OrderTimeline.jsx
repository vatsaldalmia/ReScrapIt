import { CheckCircle2 } from 'lucide-react';
import { orderStatusLabel } from '../../orderStatus';

export default function OrderTimeline({ timeline = [] }) {
  if (timeline.length === 0) return <p className="text-sm text-gray-500">No events yet.</p>;

  return (
    <ol className="relative border-l border-gray-200 ml-2">
      {timeline.map((event, i) => (
        <li key={i} className="mb-5 ml-4">
          <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-green-100 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
          </span>
          <h4 className="text-sm font-medium text-gray-900">{orderStatusLabel(event.status)}</h4>
          <time className="text-xs text-gray-400">
            {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN') : ''}
          </time>
          {event.note && <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
}
