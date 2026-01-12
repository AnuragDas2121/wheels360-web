import { useQuery } from "@tanstack/react-query";
import { Review, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface DealerReviewProps {
  review: Review;
}

export default function DealerReview({ review }: DealerReviewProps) {
  // Fetch the user who wrote the review
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${review.userId}`],
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold font-montserrat">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || "Anonymous User"}
            </h4>
            <p className="text-sm text-neutral-medium">
              {review.createdAt 
                ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) 
                : "Recently"}
            </p>
          </div>
        </div>
        <div className="flex text-warning">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`${i < review.rating ? 'text-warning' : 'text-neutral-light'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-neutral-medium whitespace-pre-line">{review.comment}</p>
    </div>
  );
}
