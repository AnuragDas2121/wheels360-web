import React from 'react';
import { format } from 'date-fns';
import { Star, StarHalf, User } from 'lucide-react';
import { Review, User as UserType } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  // Fetch user data for this review
  const { data: userData } = useQuery<Partial<UserType>>({
    queryKey: [`/api/users/${review.userId}`],
    enabled: !!review.userId,
  });

  // Format the date
  const formattedDate = review.createdAt 
    ? format(new Date(review.createdAt), 'MMM dd, yyyy') 
    : '';

  // Generate star rating
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="h-4 w-4 text-neutral-200" />
      );
    }

    return stars;
  };

  // Generate user initials for avatar
  const getInitials = () => {
    if (userData && userData.firstName && userData.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
    }
    if (userData && userData.firstName) {
      return userData.firstName.charAt(0);
    }
    if (userData && userData.username) {
      return userData.username.charAt(0).toUpperCase();
    }
    return '';
  };

  // Get user full name
  const getUserName = () => {
    if (userData) {
      if (userData.firstName || userData.lastName) {
        return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      }
      return userData.username || 'Anonymous User';
    }
    return 'Anonymous User';
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={userData?.avatar || ''} alt={getUserName()} />
              <AvatarFallback>
                {getInitials() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                {getUserName()}
              </div>
              <div className="text-sm text-neutral-medium">{formattedDate}</div>
            </div>
          </div>
          <div className="flex">{renderRating(review.rating)}</div>
        </div>
        
        <div className="mt-4 flex-grow">
          <p className="text-sm text-neutral-dark">{review.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
}