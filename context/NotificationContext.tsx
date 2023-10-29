import { Database } from "@/lib/schema";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./UserContext";
import { useChannel, useAbly } from "ably/react";
import { Types } from "ably";

interface NotificationContextData {
  notifications: Database["public"]["Tables"]["notifications"]["Row"][];
}

export const NotificationContext = createContext<NotificationContextData>({
  notifications: [],
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<
    Database["public"]["Tables"]["notifications"]["Row"][]
  >([]);
  const supabase = createClientComponentClient<Database>();
  const { currentUser } = useUser();
  const { channel: messagesChannel, channelError } = useChannel(
    `notifications:${currentUser?.id}`,
    (ablyMessage: Types.Message) => {
      if (ablyMessage.name === "add") {
        const notification: Database["public"]["Tables"]["notifications"]["Row"] =
          ablyMessage.data;
        setNotifications((prev) => [...prev, notification]);
      } else if (ablyMessage.name === "remove") {
        setNotifications((prev) =>
          prev.filter((not) => not.id !== ablyMessage.data)
        );
      }
    }
  );

  useEffect(() => {
    (async () => {
      if (currentUser) {
        const { data: notifications } = await supabase
          .from("notifications")
          .select()
          .eq("user_id", currentUser.id)
          .eq("read", false);
        if (notifications) {
          setNotifications(notifications);
        }
      }
    })();
  }, [currentUser, supabase]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextData => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
