
import { TodoList } from "@/components/TodoList";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="w-full max-w-md px-4">
        <Header />
        <TodoList />
      </div>
    </div>
  );
};

export default Index;
