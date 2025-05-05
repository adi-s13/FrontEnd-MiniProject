
import { useState, useEffect } from "react";
import { Check, Trash2, Edit, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  requestNotificationPermission, 
  scheduleNotification,
  cancelScheduledNotification
} from "@/services/notificationService";

// Define the Todo type
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export const TodoList = () => {
  // State for todos and input
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Load todos from localStorage if available
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Record<number, number>>({});
  const { toast } = useToast();

  // Check notification permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      const permissionGranted = await requestNotificationPermission();
      setNotificationsEnabled(permissionGranted);
    };
    
    checkPermission();
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Cleanup timers when component unmounts
  useEffect(() => {
    return () => {
      // Clear all active timers when component unmounts
      Object.values(activeTimers).forEach(timerId => {
        cancelScheduledNotification(timerId);
      });
    };
  }, [activeTimers]);

  // Add a new todo
  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: inputValue.trim(), completed: false },
      ]);
      setInputValue("");
    }
  };

  // Toggle a todo's completed status
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id: number) => {
    // Cancel any active timer for this todo
    if (activeTimers[id]) {
      cancelScheduledNotification(activeTimers[id]);
      const updatedTimers = { ...activeTimers };
      delete updatedTimers[id];
      setActiveTimers(updatedTimers);
    }
    
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Start editing a todo
  const startEdit = (id: number, text: string) => {
    setEditId(id);
    setEditValue(text);
  };

  // Save edited todo
  const saveEdit = () => {
    if (editId !== null && editValue.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === editId ? { ...todo, text: editValue.trim() } : todo
        )
      );
      setEditId(null);
      setEditValue("");
    }
  };

  // Schedule a notification with timer
  const scheduleTimedNotification = (id: number, todoText: string) => {
    // Cancel any existing timer for this todo
    if (activeTimers[id]) {
      cancelScheduledNotification(activeTimers[id]);
    }
    
    if (notificationsEnabled) {
      const timerId = scheduleNotification(todoText);
      
      // Store the timer ID
      setActiveTimers(prev => ({
        ...prev,
        [id]: timerId
      }));
      
      toast({
        title: "Reminder Set",
        description: `A reminder for "${todoText}" will appear in 10 seconds`,
      });
    } else {
      requestNotificationPermission().then(granted => {
        if (granted) {
          setNotificationsEnabled(true);
          const timerId = scheduleNotification(todoText);
          
          // Store the timer ID
          setActiveTimers(prev => ({
            ...prev,
            [id]: timerId
          }));
          
          toast({
            title: "Reminder Set",
            description: `A reminder for "${todoText}" will appear in 10 seconds`,
          });
        } else {
          toast({
            title: "Notification Permission Required",
            description: "Please enable notifications to use this feature",
            variant: "destructive",
          });
        }
      });
    }
  };

  // Handle key press for adding and editing todos
  const handleKeyPress = (e: React.KeyboardEvent, isEditing: boolean) => {
    if (e.key === "Enter") {
      isEditing ? saveEdit() : addTodo();
    }
  };

  // Filter todos based on current filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      
      {/* Add Todo Form */}
      <div className="flex mb-6">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, false)}
          placeholder="Add a new task..."
          className="flex-1 mr-2 border-purple-200 focus:border-purple-500"
        />
        <Button 
          onClick={addTodo}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex justify-center mb-6 space-x-2">
        <Button 
          onClick={() => setFilter("all")}
          variant={filter === "all" ? "default" : "outline"}
          className={filter === "all" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-600 border-purple-300"}
          size="sm"
        >
          All
        </Button>
        <Button 
          onClick={() => setFilter("active")}
          variant={filter === "active" ? "default" : "outline"}
          className={filter === "active" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-600 border-purple-300"}
          size="sm"
        >
          Active
        </Button>
        <Button 
          onClick={() => setFilter("completed")}
          variant={filter === "completed" ? "default" : "outline"}
          className={filter === "completed" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-600 border-purple-300"}
          size="sm"
        >
          Completed
        </Button>
      </div>
      
      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-500">No tasks found</p>
        ) : (
          filteredTodos.map((todo) => (
            <div 
              key={todo.id} 
              className={`flex items-center p-3 border rounded-md transition-all animate-fade-in ${
                todo.completed ? "bg-purple-50 border-purple-200" : "bg-white border-gray-200"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`mr-2 p-1 ${todo.completed ? "text-purple-600" : "text-gray-400"}`}
                onClick={() => toggleTodo(todo.id)}
              >
                <Check className="h-5 w-5" />
              </Button>
              
              {editId === todo.id ? (
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, true)}
                  onBlur={saveEdit}
                  autoFocus
                  className="flex-1 mr-2"
                />
              ) : (
                <span 
                  className={`flex-1 ${
                    todo.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {todo.text}
                </span>
              )}
              
              {editId !== todo.id && (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-gray-400 hover:text-orange-500"
                    onClick={() => scheduleTimedNotification(todo.id, todo.text)}
                    title="Set 10-second reminder"
                  >
                    <Timer className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-gray-400 hover:text-blue-600"
                    onClick={() => startEdit(todo.id, todo.text)}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-gray-400 hover:text-red-600"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Summary */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        {todos.length > 0 && (
          <>
            {todos.filter(t => !t.completed).length} items left to complete
          </>
        )}
      </div>
    </div>
  );
};
