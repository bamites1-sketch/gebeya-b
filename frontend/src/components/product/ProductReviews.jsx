import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function StarRating({ value, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const sz = size === 'lg' ? 'text-3xl' : 'text-xl';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`${sz} transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <span className={star <= (hover || value) ? 'text-[#F19A0E]' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onDelete, currentUserId }) {
  const isOwn = review.user.id === currentUserId;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#F19A0E] rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
            {review.user.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.user.name}</p>
            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StarRating value={review.rating} size="md" />
          {isOwn && (
            <button onClick={() => onDelete(review.id)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors ml-1 font-medium px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
    </motion.div>
  );
}

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = () => {
    api.get(`/reviews/${productId}`)
      .then(({ data }) => {
        setReviews(data.reviews);
        setAverage(data.average);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      await api.post(`/reviews/${productId}`, { rating, comment });
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${productId}/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const hasReviewed = user && reviews.some((r) => r.user.id === user.id);

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
  }));

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
          {total > 0 && <span className="text-sm sm:text-base font-normal text-gray-400 ml-2">({total})</span>}
        </h2>
        {user && !hasReviewed && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="self-start xs:self-auto px-4 sm:px-5 py-2 bg-[#F19A0E] hover:bg-[#d97b08] text-white rounded-xl text-sm font-bold transition-colors shrink-0">
            Write a Review
          </button>
        )}
        {!user && (
          <Link to="/login" className="self-start xs:self-auto px-4 sm:px-5 py-2 border-2 border-[#F19A0E] text-[#F19A0E] rounded-xl text-sm font-bold hover:bg-[#FEF3E2] transition-colors shrink-0">
            Login to Review
          </Link>
        )}
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 grid sm:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-6xl font-black text-[#F19A0E]">{average}</p>
            <StarRating value={Math.round(average)} />
            <p className="text-sm text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-2">
            {dist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 w-4 shrink-0">{star}</span>
                <span className="text-[#F19A0E] text-xs">★</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-[#F19A0E] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-gray-400 w-6 shrink-0 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 border-2 border-[#F19A0E]/30">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-[#F19A0E] hover:bg-[#d97b08] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center gap-2">
                  {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setRating(0); setComment(''); }}
                  className="px-6 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:border-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No reviews yet</p>
          <p className="text-sm text-gray-400">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onDelete={handleDelete} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </section>
  );
}
