import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SendBirdProvider, ChannelList, Channel } from "@sendbird/uikit-react";
import "@sendbird/uikit-react/dist/index.css";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/lib/protected-route";

// Define a type for the channel
interface GroupChannel {
  url: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<GroupChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will be handled by ProtectedRoute
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        <SendBirdProvider
          appId={import.meta.env.VITE_SENDBIRD_APP_ID}
          userId={user.id.toString()}
          nickname={user.username}
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-1">
            <ChannelList
              onChannelSelect={(channel) => {
                setSelectedChannel(channel as GroupChannel);
              }}
              allowProfileEdit={true}
              onProfileEditSuccess={(user) => {
                console.log("Profile edit success", user);
              }}
            />
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-3">
            {selectedChannel ? (
              <Channel channelUrl={selectedChannel.url} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </SendBirdProvider>
      </div>
    </div>
  );
}