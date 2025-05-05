
// Function to request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Function to show a notification
export const showNotification = (title: string, options?: NotificationOptions) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};

// Function to show a todo notification
export const showTodoNotification = (todoText: string) => {
  showNotification("TaskMaster Reminder", {
    body: todoText,
    icon: "/favicon.ico", // Using the existing favicon
  });
};

// Function to schedule a notification after a delay
export const scheduleNotification = (todoText: string, delayInSeconds: number = 10): number => {
  const timerId = window.setTimeout(() => {
    showTodoNotification(`Reminder: ${todoText}`);
  }, delayInSeconds * 1000);
  
  return timerId;
};

// Function to cancel a scheduled notification
export const cancelScheduledNotification = (timerId: number): void => {
  window.clearTimeout(timerId);
};

// Function to check if notifications are supported
export const areNotificationsSupported = (): boolean => {
  return "Notification" in window;
};

// Function to get current notification permission status
export const getNotificationPermissionStatus = (): NotificationPermission | null => {
  if (!("Notification" in window)) {
    return null;
  }
  return Notification.permission;
};
