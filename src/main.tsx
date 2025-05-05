
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { requestNotificationPermission } from './services/notificationService'

// Request notification permission when the app starts
requestNotificationPermission().then(granted => {
  if (granted) {
    console.log("Notification permission granted");
  } else {
    console.log("Notification permission not granted");
  }
});

createRoot(document.getElementById("root")!).render(<App />);
