import { Link } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';
import { categoryLabel, formatPrice } from '../../constants';

export default function ListingCard({ scrap }) {
  const location = [scrap.location?.city, scrap.location?.state].filter(Boolean).join(', ');

  return (
    <Link
      to={`/listing/${scrap._id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {scrap.images?.[0] ? (
          <img src={scrap.images[0]} alt={scrap.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="h-10 w-10 text-gray-300" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{scrap.name}</h3>
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
            {categoryLabel(scrap.category)}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1 flex-1">{scrap.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-green-700">{formatPrice(scrap.price, scrap.priceUnit)}</span>
          <span className="text-sm text-gray-600">Qty: {scrap.quantity}</span>
        </div>
        {location && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5" /> {location}
          </div>
        )}
      </div>
    </Link>
  );
}
