/**
 * @fileoverview Main TODO application component with theme switching and persistent storage.
 * Implements a fully functional TODO list with CRUD operations and dark/light theme support.
 */

'use client';
import { Button, Input, Checkbox, Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import { SocialNetwork } from 'react-custom-social-icons/dist/esm/types';
import { Moon, Sun, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { SocialIcon } from 'react-custom-social-icons';
import { useState, useEffect, JSX } from 'react';
import axios from 'axios';

/** Interface defining the structure of a todo item */
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * Home component - Main TODO application page
 * @returns {JSX.Element} The rendered TODO application
 */
export default function Home(): JSX.Element {
  // State management for todos and UI controls
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  /** Initialize theme from localStorage or system preference */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemPreference);
    }
  }, []);

  /** Load todos from localStorage on component mount */
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        if (Array.isArray(parsedTodos)) {
          setTodos(parsedTodos);
        } else {
          localStorage.removeItem('todos');
        }
      } catch {
        localStorage.removeItem('todos');
      }
    }
  }, []);

  /** Save todos to localStorage whenever they change */
  useEffect(() => {
    if (todos.length > 0 || localStorage.getItem('todos')) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  /** Update theme class on document root and save to localStorage */
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  /** Toggle between light and dark theme */
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  /** Add a new todo item */
  const handleAddTodo = () => {
    if (newTodo.trim() === '') return;
    const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
    setNewTodo('');
  };

  /** Toggle todo completion status */
  const handleToggleComplete = (id: number) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  /** Delete a todo item */
  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  /** Start editing a todo item */
  const handleStartEdit = (todo: TodoItem) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  /** Cancel editing a todo item */
  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  /** Save edited todo item */
  const handleSaveEdit = (id: number) => {
    if (editingTodoText.trim() === '') return;
    setTodos(todos.map(todo => todo.id === id ? { ...todo, text: editingTodoText } : todo));
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  // State and functions for social links
  const [socialLinks, setSocialLinks] = useState({ names: [], links: [] } as { names: SocialNetwork[], links: string[] });

  /** Fetch social links from external API */
  const sociallinks = async () => {
    const req = await axios.post(
      process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_CREDITS_URL_TEST!
        : process.env.NEXT_PUBLIC_CREDITS_URL!,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
        }
      }
    );
    if (req.status === 200) {
      return req.data;
    } else {
      throw new Error(req.data.error || 'Failed to fetch social links');
    }
  };

  /** Load social links on component mount */
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const socialObj = await sociallinks();
        setSocialLinks(socialObj);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSocialLinks();
  }, []);
  return (
    <>
      {/* Main container with responsive padding and gradient background */}
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-12 md:p-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Animated wrapper div with fade-in effect */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Card component with glass-morphism effect and theme transitions */}
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-all duration-300 absolute top-[50%] left-[50%] -translate-x-2/4 -translate-y-2/4 md:w-[80%]">
            {/* Header section with app title and theme toggle */}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              {/* App title with drop shadow effect */}
              <div className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 drop-shadow-sm py-3 text-center">TODO App</div>
              {/* Theme toggle button with accessibility label */}
              <Button
                variant="ghost"
                size="sm"
                onPress={toggleTheme}
                className="rounded-full h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {/* Dynamic theme icon (Moon/Sun) */}
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-300 dark:text-gray-300" />
                )}
              </Button>
            </CardHeader>
            <CardBody>
              {/* New todo input section with animation */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex space-x-2 mb-6">
                {/* Input field for new todo items */}
                <Input
                  placeholder="Add a new task..."
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddTodo()}
                  className="flex-grow text-base border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 shadow-sm px-2 pb-2 resize-y min-h-[40px]"
                />
                {/* Add button with hover effects */}
                <Button onPress={handleAddTodo} className="h-10 px-6 font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-200">Add</Button>
              </motion.div>
              {/* Todo list container */}
              <div className="space-y-3">
                {/* Empty state message */}
                {todos.length === 0 && (
                  <p className="text-center text-gray-400 dark:text-gray-500 italic animate-fade-in px-4"><small>Just type in your task and press Enter.<br/>You can also press Add button after typing!</small></p>
                )}
                {/* Animated list of todo items */}
                <AnimatePresence>
                  {todos.map((todo) => (
                    // {/* Individual todo item with animation and hover effects */}
                    <motion.div
                      key={todo.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 0.98 }}
                      transition={{ ease: 'easeInOut' }}
                      className={`flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 shadow-sm group transition-all duration-200 ${todo.completed ? 'opacity-60' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                    >
                      {/* Checkbox for todo completion */}
                      <Checkbox
                        id={`todo-${todo.id}`}
                        onChange={() => handleToggleComplete(todo.id)}
                        isSelected={todo.completed}
                        disabled={editingTodoId === todo.id}
                        className="accent-blue-500 focus:ring-2 focus:ring-blue-400"
                      />

                      {/* Conditional rendering for edit mode */}
                      {editingTodoId === todo.id ? (
                        <>
                          {/* Edit mode textarea */}
                          <textarea
                            value={editingTodoText}
                            onChange={e => setEditingTodoText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSaveEdit(todo.id)}
                            rows={3}
                            className="flex-grow text-sm border-2 border-blue-300 focus:border-blue-500 bg-white dark:bg-gray-900 transition-all duration-200 p-2 resize-y min-h-[40px]"
                            autoFocus
                          />
                          {/* Save and Cancel buttons for edit mode */}
                          <Button variant="bordered" size="sm" onPress={() => handleSaveEdit(todo.id)} className="h-8 border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200">Save</Button>
                          <Button variant="ghost" size="sm" onPress={handleCancelEdit} className="h-8 text-gray-500 hover:text-red-500 transition-all duration-200">Cancel</Button>
                        </>
                      ) : (
                        <>
                          {/* Todo text label with completion styling */}
                          <label
                            htmlFor={`todo-${todo.id}`}
                            className={`flex-grow cursor-pointer select-text text-base transition-colors duration-200 whitespace-normal break-all ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}
                            onClick={() => handleToggleComplete(todo.id)}
                          >
                            {todo.text}
                          </label>
                          {/* Edit and Delete buttons */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 w-7 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200"
                            onPress={() => handleStartEdit(todo)}
                            disabled={todo.completed}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit task</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                            onPress={() => handleDeleteTodo(todo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete task</span>
                          </Button>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {/* Footer with credits and social links */}
              <CardFooter className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-2 animate-fade-in">
                <span>Made with <span className="text-pink-500 text-lg">♥</span> by Sarabjeet Singh</span>
                {/* Social media icons */}
                <div className="flex space-x-2">
                  {Object.hasOwn(socialLinks, 'names') && Object.hasOwn(socialLinks, 'links') && socialLinks.names.map((name: SocialNetwork, index: number) => (
                    <SocialIcon
                      key={index}
                      link={socialLinks.links[index]}
                      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                      network={name}
                      size={20}
                      color={localStorage.getItem('theme') === 'dark' && '#000' || undefined}
                      blank
                    />
                  ))}
                </div>
              </CardFooter>
            </CardBody>
          </Card>
        </motion.div>
      </main>
    </>
  );
}
