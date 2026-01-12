import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Message, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ChatWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user's messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user && isOpen,
    refetchInterval: isOpen ? 5000 : false, // Poll every 5 seconds when open
  });

  // Get unique conversation partners
  const conversations = messages ? Array.from(
    new Set(
      messages.map(m => 
        m.senderId === user?.id ? m.receiverId : m.senderId
      )
    )
  ) : [];

  // Get current conversation messages
  const conversationMessages = messages?.filter(m => 
    (m.senderId === user?.id && m.receiverId === selectedReceiverId) ||
    (m.receiverId === user?.id && m.senderId === selectedReceiverId)
  ).sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Fetch user info for conversation partners
  const { data: conversationUsers } = useQuery<User[]>({
    queryKey: ["/api/users/batch", conversations],
    queryFn: async () => {
      if (!conversations.length) return [];
      
      // Use the batch API endpoint to get multiple users at once
      const response = await apiRequest("POST", "/api/users/batch", {
        userIds: conversations
      });
      const users = await response.json();
      return users;
    },
    enabled: !!conversations.length && isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedReceiverId) throw new Error("No receiver selected");
      
      return apiRequest("POST", "/api/messages", {
        content,
        receiverId: selectedReceiverId,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to send messages",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedReceiverId) {
      toast({
        title: "No recipient selected",
        description: "Please select a conversation partner",
        variant: "destructive",
      });
      return;
    }
    
    sendMessageMutation.mutate(message);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationMessages]);

  // Select first conversation if none selected
  useEffect(() => {
    if (isOpen && conversations.length > 0 && !selectedReceiverId) {
      setSelectedReceiverId(conversations[0]);
    }
  }, [isOpen, conversations, selectedReceiverId]);

  // Get selected user info
  const selectedUser = conversationUsers?.find(u => u.id === selectedReceiverId);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              className="bg-secondary hover:bg-secondary-light text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[90%] sm:max-w-md p-0 flex flex-col h-[80vh]">
            <SheetHeader className="p-4 border-b">
              <div className="flex justify-between items-center">
                <SheetTitle>Messages</SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            {!user ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                  <p className="text-neutral-medium mb-4">
                    Please login to use the messaging feature
                  </p>
                  <Button 
                    className="bg-primary"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = "/auth";
                    }}
                  >
                    Login or Register
                  </Button>
                </div>
              </div>
            ) : messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                  <p className="text-neutral-medium">
                    Your conversations with dealers will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                {/* Conversation list */}
                <div className="w-1/3 border-r overflow-y-auto">
                  {conversations.map(conversationId => {
                    const conversationUser = conversationUsers?.find(u => u.id === conversationId);
                    const lastMessage = messages?.filter(m => 
                      (m.senderId === user.id && m.receiverId === conversationId) ||
                      (m.receiverId === user.id && m.senderId === conversationId)
                    ).sort((a, b) => 
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0];
                    
                    return (
                      <div 
                        key={conversationId}
                        className={`p-4 cursor-pointer hover:bg-neutral-lightest border-b ${
                          selectedReceiverId === conversationId ? 'bg-neutral-lightest' : ''
                        }`}
                        onClick={() => setSelectedReceiverId(conversationId)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {conversationUser?.firstName?.charAt(0) || 
                             conversationUser?.username?.charAt(0) || "U"}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-semibold truncate">
                              {conversationUser?.firstName && conversationUser?.lastName
                                ? `${conversationUser.firstName} ${conversationUser.lastName}`
                                : conversationUser?.username || `User #${conversationId}`}
                            </div>
                            {lastMessage && (
                              <div className="text-xs text-neutral-medium truncate">
                                {lastMessage.senderId === user.id ? 'You: ' : ''}
                                {lastMessage.content}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Message area */}
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b">
                    <div className="font-semibold">
                      {selectedUser?.firstName && selectedUser?.lastName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser?.username || `User #${selectedReceiverId}`}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {conversationMessages?.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`mb-3 max-w-[80%] ${
                          msg.senderId === user.id ? 'ml-auto' : 'mr-auto'
                        }`}
                      >
                        <div className={`p-3 rounded-lg ${
                          msg.senderId === user.id 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-neutral-lightest rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                        <div className={`text-xs text-neutral-medium mt-1 ${
                          msg.senderId === user.id ? 'text-right' : ''
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <SheetFooter className="p-3 border-t">
                    <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={sendMessageMutation.isPending}
                        className="bg-primary"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </SheetFooter>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
