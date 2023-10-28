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

interface NotificationContextData {
  showNotification: (message: string) => void;
  hideNotification: () => void;
  notifications: Database["public"]["Tables"]["notifications"]["Row"][];
}

export const NotificationContext = createContext<NotificationContextData>({
  showNotification: () => {},
  hideNotification: () => {},
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

  const showNotification = (message: string) => {
    setNotification(message);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // useEffect(() => {
  //   if (notification) {
  //     const timer = setTimeout(hideNotification, 4000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [notification]);

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
  }, [currentUser]);

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification, notifications }}
    >
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
