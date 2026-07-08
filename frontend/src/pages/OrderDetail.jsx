import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, CreditCard, Truck, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import OrderTimeline from '../components/order/OrderTimeline';
import StarRating from '../components/review/StarRating';
import { useAuth } from '../context/AuthContext';
import { getOrder, updateOrderStatus, payOrder, addDeliveryProof, getInvoice, refundOrder, verifyWeight } from '../api/orders';
import { createReview } from '../api/reviews';
import { raiseDispute } from '../api/disputes';
import { uploadImages } from '../api/upload';
import { orderStatusColor, orderStatusLabel } from '../orderStatus';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState([]);

  const load = async () => {
    try {
      const { data } = await getOrder(id);
      setOrder(data.order);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const run = async (fn, ...args) => {
    setBusy(true);
    try {
      await fn(...args);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDeliveryProof = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const base64s = await Promise.all(files.map((f) => new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(f);
      })));
      const { data } = await uploadImages(base64s);
      await addDeliveryProof(id, data.urls || base64s);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async () => {
    setBusy(true);
    try {
      let images = [];
      if (reviewImages.length > 0) {
        const { data } = await uploadImages(reviewImages);
        images = data.urls || reviewImages;
      }
      await createReview({ orderId: id, rating, text: reviewText, images });
      setReviewText('');
      setReviewImages([]);
      await load();
      alert('Thanks for your review!');
    } catch (e) {
      alert(e.response?.data?.message || 'Could not submit review');
    } finally {
      setBusy(false);
    }
  };

  const handleReviewImages = (e) => {
    Array.from(e.target.files).forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => setReviewImages((prev) => [...prev, reader.result]);
      reader.readAsDataURL(f);
    });
  };

  const handleRaiseDispute = async () => {
    const reason = window.prompt('Briefly describe the issue (reason):');
    if (!reason) return;
    setBusy(true);
    try {
      await raiseDispute({ orderId: id, reason });
      await load();
      alert('Dispute raised. An admin will review it.');
    } catch (e) {
      alert(e.response?.data?.message || 'Could not raise dispute');
    } finally {
      setBusy(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      const { data } = await getInvoice(id);
      const w = window.open();
      if (w) w.document.write(`<iframe src="${data.invoiceUrl}" style="border:0;width:100%;height:100%"></iframe>`);
    } catch {
      alert('Could not generate invoice.');
    }
  };

  const recordWeight = async () => {
    const w = window.prompt('Actual weighed quantity at pickup:');
    if (w === null || w === '') return;
    await run(verifyWeight, id, Number(w));
  };

  const doRefund = async () => {
    if (!window.confirm('Refund this order to the buyer?')) return;
    await run(refundOrder, id);
  };

  if (loading) return (<div className="min-h-screen bg-gray-50"><Navbar /><p className="p-6 text-gray-500">Loading…</p></div>);
  if (!order) return (<div className="min-h-screen bg-gray-50"><Navbar /><p className="p-6 text-gray-500">Order not found.</p></div>);

  const isBuyer = String(order.buyer?._id) === String(user?._id);
  const isSeller = String(order.seller?._id) === String(user?._id);
  const item = order.items?.[0];
  const btn = 'flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Order #{order._id.slice(-6)}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full ${orderStatusColor(order.status)}`}>{orderStatusLabel(order.status)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {item?.listing?.images?.[0] ? <img src={item.listing.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="h-6 w-6 text-gray-300" />}
                </div>
                <div className="flex-1">
                  <Link to={`/listing/${item?.listing?._id}`} className="font-semibold hover:underline">{item?.listing?.name || 'Listing'}</Link>
                  <div className="text-sm text-gray-500">Qty {item?.quantity} × ₹{item?.unitPrice}/unit</div>
                </div>
                <div className="text-lg font-bold text-green-700">₹{order.finalPrice?.toLocaleString('en-IN')}</div>
              </div>

              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                <div>Buyer: {order.buyer?.name}</div>
                <div>Seller: {order.seller?.name}</div>
                {order.paymentId && <div>Payment ref: {order.paymentId}</div>}
                {order.escrowStatus && order.escrowStatus !== 'none' && <div>Escrow: <span className="font-medium">{order.escrowStatus}</span></div>}
                {order.platformFee ? <div>Platform fee: ₹{order.platformFee}</div> : null}
                {order.actualWeight !== undefined && order.actualWeight !== null && <div>Weighed at pickup: {order.actualWeight}</div>}
              </div>

              {(order.deliveryProof?.length > 0 || order.signature) && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Delivery proof</h3>
                  <div className="flex gap-2 flex-wrap">
                    {order.deliveryProof.map((img, i) => <img key={i} src={img} alt={`proof ${i}`} className="h-16 w-16 object-cover rounded-lg border" />)}
                    {order.signature && (
                      <div className="text-center">
                        <img src={order.signature} alt="signature" className="h-16 w-24 object-contain rounded-lg border bg-white" />
                        <div className="text-[10px] text-gray-400">signature</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white p-5 rounded-lg border space-y-3">
              <h3 className="font-semibold">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {isBuyer && order.status === 'payment_pending' && (
                  <button disabled={busy} onClick={() => run(payOrder, id)} className={`${btn} bg-green-600 text-white hover:bg-green-700`}>
                    <CreditCard className="h-4 w-4" /> Pay ₹{order.finalPrice?.toLocaleString('en-IN')}
                  </button>
                )}
                {isSeller && order.status === 'paid' && (
                  <button disabled={busy} onClick={() => run(updateOrderStatus, id, 'pickup_scheduled')} className={`${btn} bg-green-600 text-white hover:bg-green-700`}>
                    <Truck className="h-4 w-4" /> Schedule Pickup
                  </button>
                )}
                {isSeller && order.status === 'pickup_scheduled' && (
                  <button disabled={busy} onClick={() => run(updateOrderStatus, id, 'in_transit')} className={`${btn} bg-green-600 text-white hover:bg-green-700`}>
                    <Truck className="h-4 w-4" /> Mark In Transit
                  </button>
                )}
                {isSeller && order.status === 'in_transit' && (
                  <>
                    <label className={`${btn} border cursor-pointer hover:bg-gray-50`}>
                      Add Delivery Proof
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={handleDeliveryProof} />
                    </label>
                    <button disabled={busy} onClick={() => run(updateOrderStatus, id, 'delivered')} className={`${btn} bg-green-600 text-white hover:bg-green-700`}>
                      <CheckCircle2 className="h-4 w-4" /> Mark Delivered
                    </button>
                  </>
                )}
                {isBuyer && order.status === 'delivered' && (
                  <button disabled={busy} onClick={() => run(updateOrderStatus, id, 'completed')} className={`${btn} bg-green-600 text-white hover:bg-green-700`}>
                    <CheckCircle2 className="h-4 w-4" /> Confirm Received &amp; Complete
                  </button>
                )}
                {['payment_pending', 'paid', 'pickup_scheduled'].includes(order.status) && (
                  <button disabled={busy} onClick={() => run(updateOrderStatus, id, 'cancelled')} className={`${btn} text-red-600 border border-red-200 hover:bg-red-50`}>
                    <XCircle className="h-4 w-4" /> Cancel Order
                  </button>
                )}
                {['paid', 'pickup_scheduled', 'in_transit', 'delivered'].includes(order.status) && (
                  <button disabled={busy} onClick={handleRaiseDispute} className={`${btn} text-orange-600 border border-orange-200 hover:bg-orange-50`}>
                    <XCircle className="h-4 w-4" /> Raise Dispute
                  </button>
                )}
                {isSeller && order.status === 'pickup_scheduled' && (
                  <button disabled={busy} onClick={recordWeight} className={`${btn} border hover:bg-gray-50`}>Record Weight</button>
                )}
                {(isSeller || isBuyer) && order.paymentId && (
                  <button onClick={downloadInvoice} className={`${btn} border hover:bg-gray-50`}>Download Invoice</button>
                )}
                {isSeller && order.escrowStatus === 'held' && (
                  <button disabled={busy} onClick={doRefund} className={`${btn} text-red-600 border border-red-200 hover:bg-red-50`}>Refund Buyer</button>
                )}
                {!['payment_pending', 'paid', 'pickup_scheduled', 'in_transit', 'delivered'].includes(order.status) &&
                  !(isBuyer && order.status === 'completed' && !order.reviewed) && (
                    <p className="text-sm text-gray-500">No actions available for this order.</p>
                  )}
              </div>

              {/* Review form */}
              {isBuyer && order.status === 'completed' && !order.reviewed && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Leave a review</h4>
                  <StarRating value={rating} editable onChange={setRating} size={22} />
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this seller…"
                    rows={3}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-sm text-green-700 border border-green-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-green-50">
                      Add photos
                      <input type="file" className="sr-only" accept="image/*" multiple onChange={handleReviewImages} />
                    </label>
                    {reviewImages.map((img, i) => <img key={i} src={img} alt={`review ${i}`} className="h-10 w-10 object-cover rounded border" />)}
                  </div>
                  <button disabled={busy} onClick={submitReview} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Submit Review
                  </button>
                </div>
              )}
              {isBuyer && order.reviewed && <p className="text-sm text-green-600 pt-3 border-t">✓ You reviewed this order.</p>}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-5 rounded-lg border h-fit">
            <h3 className="font-semibold mb-4">Timeline</h3>
            <OrderTimeline timeline={order.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
