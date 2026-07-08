import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Heart, ShoppingCart, Star, BadgeCheck } from 'lucide-react';
import { categoryLabel, formatPrice } from '../../constants';
import { toggleWishlist } from '../../api/wishlist';
import { addToCart } from '../../api/cart';
import { useAuth } from '../../context/AuthContext';

export default function ListingCard({ scrap }) {
  const { isAuthenticated } = useAuth();
  const [wished, setWished] = useState(false);
  const [carted, setCarted] = useState(false);
  const location = [scrap.location?.city, scrap.location?.state].filter(Boolean).join(', ');
  const rating = scrap.seller?.rating;

  const act = async (e, fn) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try { await fn(); } catch { /* ignore */ }
  };

  return (
    <Link
      to={`/listing/${scrap._id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative"
    >
      {isAuthenticated && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={(e) => act(e, async () => { const { data } = await toggleWishlist(scrap._id); setWished(data.inWishlist); })}
            className={`p-1.5 rounded-full bg-white/90 shadow ${wished ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            title="Wishlist"
          >
            <Heart className={`h-4 w-4 ${wished ? 'fill-red-500' : ''}`} />
          </button>
          <button
            onClick={(e) => act(e, async () => { await addToCart(scrap._id, 1); setCarted(true); })}
            className={`p-1.5 rounded-full bg-white/90 shadow ${carted ? 'text-green-600' : 'text-gray-500'} hover:text-green-600`}
            title="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      )}
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
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          {location ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {location}</span> : <span />}
          {rating?.count > 0 && (
            <span className="flex items-center gap-0.5 text-yellow-500">
              <Star className="h-3.5 w-3.5 fill-yellow-400" /> {rating.average?.toFixed(1)}
              {scrap.seller?.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-green-600 ml-1" />}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
