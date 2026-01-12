import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Review } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ReviewCard from './review-card';
import ReviewForm from './review-form';

interface ReviewListProps {
  dealerId: number;
}

export default function ReviewList({ dealerId }: ReviewListProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews for this dealer
  const {
    data: reviews,
    isLoading,
    error,
    refetch
  } = useQuery<Review[]>({
    queryKey: [`/api/dealers/${dealerId}/reviews`],
  });

  // Toggle review form
  const toggleReviewForm = () => {
    setShowReviewForm((prev) => !prev);
  };

  // Handle successful review submission
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-medium" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-error-light/10 p-4 rounded text-center text-error">
        <p>Failed to load reviews. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
        <Button onClick={toggleReviewForm} variant={showReviewForm ? "outline" : "default"}>
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>
      
      {showReviewForm && (
        <>
          <ReviewForm dealerId={dealerId} onSuccess={handleReviewSuccess} />
          <Separator className="my-6" />
        </>
      )}
      
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-neutral-50 p-8 rounded-lg text-center">
          <p className="text-neutral-medium">No reviews yet. Be the first to review this dealer!</p>
        </div>
      )}
    </div>
  );
}