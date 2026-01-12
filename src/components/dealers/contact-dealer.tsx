import { useState } from "react";
import { useLocation } from "wouter";
import { Dealer, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageSquare, Mail, Phone } from "lucide-react";
import * as SendbirdSDK from "@sendbird/chat";

interface ContactDealerProps {
  dealer: Dealer;
}

export default function ContactDealer({ dealer }: ContactDealerProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to contact dealers",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSending(true);
    
    try {
      // First, create a platform message in our database
      await apiRequest("POST", "/api/messages", {
        senderId: user.id,
        receiverId: dealer.userId,
        subject,
        content: message,
      });
      
      // Then, create or get a Sendbird channel between the user and dealer
      const sb = SendbirdSDK.default.getInstance();
      
      if (!sb) {
        throw new Error("Sendbird not initialized");
      }
      
      // Create parameters for the group channel
      const params = {} as any; // Using any type for now to bypass TypeScript errors
      params.userIds = [user.id.toString(), dealer.userId.toString()];
      params.name = `${user.username} and ${dealer.name}`;
      
      // Create the channel if it doesn't exist or get existing one
      const channel = await sb.groupChannel.createChannel(params);
      
      // Send the first message
      if (channel) {
        await channel.sendUserMessage({
          message: message,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the dealer",
      });
      
      setSubject("");
      setMessage("");
      
      // Navigate to messages page with this channel selected
      navigate("/messages");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contact {dealer.name}</CardTitle>
        <CardDescription>Send a message to the dealer or use other contact methods</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendMessage}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Inquiry about 2022 BMW X5"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isSending} 
          >
            {isSending ? (
              <>Sending Message...</>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        <p className="text-sm font-medium">Other ways to contact:</p>
        {dealer.email && (
          <a 
            href={`mailto:${dealer.email}`} 
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <Mail className="mr-2 h-4 w-4" />
            {dealer.email}
          </a>
        )}
        {dealer.phone && (
          <a 
            href={`tel:${dealer.phone}`} 
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <Phone className="mr-2 h-4 w-4" />
            {dealer.phone}
          </a>
        )}
      </CardFooter>
    </Card>
  );
}