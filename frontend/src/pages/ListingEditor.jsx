import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ListingForm from '../components/listing/ListingForm';
import { addScrap, updateScrap, getScrap } from '../api/scrap';

export default function ListingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [initial, setInitial] = useState(isEdit ? null : {});
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await getScrap(id);
        setInitial(data.scrap);
      } catch {
        setInitial(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleSubmit = async (payload) => {
    if (isEdit) {
      await updateScrap(id, payload);
    } else {
      await addScrap(payload);
    }
    navigate('/my-listings');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Listing' : 'Create Listing'}</h1>
          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : initial === null ? (
            <p className="text-gray-500">Listing not found.</p>
          ) : (
            <ListingForm
              initial={initial}
              submitLabel={isEdit ? 'Save Changes' : 'Create Listing'}
              onSubmit={handleSubmit}
              showStatus={isEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
