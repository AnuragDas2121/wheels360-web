import { useState, useEffect, useCallback } from "react";
import { GroupChannelModule } from "@sendbird/chat/groupChannel";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

// Import Sendbird types and SDK
// Using dynamic imports to avoid TypeScript errors with the Sendbird SDK
import * as SendbirdSDK from "@sendbird/chat";

export function useSendbird() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const initialize = useCallback(async () => {
    if (!user) {
      return null;
    }

    const appId = import.meta.env.VITE_SENDBIRD_APP_ID;
    if (!appId) {
      console.error("Sendbird App ID is not defined");
      toast({
        title: "Chat initialization failed",
        description: "Missing Sendbird configuration",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsConnecting(true);
      
      // Initialize the Sendbird SDK
      const params = {
        appId,
        modules: [new GroupChannelModule()]
      };
      
      const sb = await SendbirdSDK.default.init(params);
      
      // Connect the user
      await sb.connect(user.id.toString(), {
        nickname: user.username,
        profileUrl: user.avatar || ""
      });
      
      setIsInitialized(true);
      setError(null);
      return sb;
    } catch (error) {
      console.error("Sendbird initialization error:", error);
      setError(error);
      toast({
        title: "Chat initialization failed",
        description: "Could not connect to chat service",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [user, toast]);

  const getSDK = useCallback(() => {
    try {
      return SendbirdSDK.default.getInstance();
    } catch (error) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (user && !isInitialized && !isConnecting) {
      initialize();
    }
    
    // Clean up function
    return () => {
      const sb = getSDK();
      if (sb) {
        sb.disconnect()
          .then(() => console.log("Disconnected from Sendbird"))
          .catch(console.error);
      }
    };
  }, [user, isInitialized, isConnecting, initialize, getSDK]);

  return {
    isInitialized,
    isConnecting,
    error,
    initialize,
    getSDK
  };
}