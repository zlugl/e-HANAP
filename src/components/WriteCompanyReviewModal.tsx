import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { X, Star, Camera, Upload, Check } from 'lucide-react';

interface WriteCompanyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string;
  companyName: string;
}

export const WriteCompanyReviewModal: React.FC<WriteCompanyReviewModalProps> = ({
  isOpen,
  onClose,
  employerId,
  companyName,
}) => {
  const { currentUser, addCompanyReview, showToast } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Please provide review feedback text.");
      return;
    }

    addCompanyReview({
      employerId,
      reviewerId: currentUser?.id || 'guest',
      reviewerName: currentUser?.name || 'Verified Job Seeker',
      reviewerAvatar: currentUser?.avatar,
      rating,
      comment: comment.trim(),
      photoUrl: photoUrl || undefined,
    });

    showToast({
      title: "Review Published",
      message: `Your company review for ${companyName} has been submitted!`,
      type: "success"
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Write Company Review</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating Selection matching design */}
          <div className="text-center space-y-2">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              How overall rating of this company?
            </label>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-blue-600">
              {rating === 5 && 'Outstanding Workplace'}
              {rating === 4 && 'Very Good Employer'}
              {rating === 3 && 'Average Experience'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Not Recommended'}
            </p>
          </div>

          {/* Detailed Review Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Add detailed review
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe work culture, management support, benefits, and local onboarding experience..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none leading-relaxed placeholder:text-slate-400"
            />
          </div>

          {/* Add Photo Simulation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Add Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPhotoUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80")}
                className={`flex-1 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                  photoUrl
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-blue-400 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>{photoUrl ? 'Workplace Photo Attached' : 'Attach Workplace Photo'}</span>
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-xs text-rose-500 hover:underline font-bold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Submit Review</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
