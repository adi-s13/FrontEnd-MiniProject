
import { ListTodo } from "lucide-react";

export const Header = () => {
  return (
    <header className="flex items-center justify-center mb-8">
      <ListTodo className="h-8 w-8 text-purple-600 mr-2" />
      <h1 className="text-4xl font-bold text-purple-800">TaskMaster</h1>
    </header>
  );
};
