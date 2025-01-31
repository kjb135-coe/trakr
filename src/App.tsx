import { useEffect, useState } from 'react';
import './App.css';

interface Habit {
  id: string;
  name: string;
  completions: string[];
  streak: number;
  isEditing?: boolean;
}

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadData = () => {
      if (!window.chrome?.storage?.sync) {
        console.warn('Chrome storage not available - using mock data');
        return;
      }

      window.chrome.storage.sync.get(
        ['habits', 'darkMode'],
        (result: { habits?: Habit[]; darkMode?: boolean }) => {
          const storedHabits = result.habits || [];
          const darkModePreference = result.darkMode || false;
          setHabits(storedHabits);
          setIsDarkMode(darkModePreference);
        }
      );
    };

    loadData();
  }, []);

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    if (window.chrome?.storage?.sync) {
      window.chrome.storage.sync.set({ habits: updatedHabits });
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (window.chrome?.storage?.sync) {
      window.chrome.storage.sync.set({ darkMode: newDarkMode });
    }
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabit.trim(),
      completions: [],
      streak: 0
    };

    saveHabits([...habits, habit]);
    setNewHabit('');
  };

  const toggleCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map(habit => {
      if (habit.id !== habitId) return habit;

      const completions = habit.completions.includes(today)
        ? habit.completions.filter(d => d !== today)
        : [...habit.completions, today];

      const streak = calculateStreak(completions);
      
      return { ...habit, completions, streak };
    });

    saveHabits(updatedHabits);
  };

  const calculateStreak = (completions: string[]): number => {
    const sortedDates = [...completions].sort();
    let streak = 0;
    let currentDate = new Date();

    while (sortedDates.includes(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const deleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    saveHabits(updatedHabits);
  };

  const toggleEdit = (habitId: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, isEditing: !habit.isEditing } 
        : habit
    ));
  };

  const handleNameChange = (habitId: string, newName: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, name: newName } 
        : habit
    ));
  };

  return (
    <div className="container" data-theme={isDarkMode ? "dark" : "light"}>
      <button 
        className="theme-toggle"
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>
      
      <h1>Daily Habits</h1>
      
      <form onSubmit={addHabit} className="habit-form">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Enter new habit"
          className="habit-input"
          aria-label="New habit input"
        />
        <button 
          type="submit" 
          className="add-button"
          aria-label="Add new habit"
        >
          Add Habit
        </button>
      </form>
      
      <div className="habits-list">
        {habits.map(habit => (
          <div key={habit.id} className="habit-item">
            <div 
              className={`completion-circle ${
                habit.completions.includes(new Date().toISOString().split('T')[0]) 
                  ? 'completed' 
                  : ''
              }`}
              onClick={() => toggleCompletion(habit.id)}
              aria-label={
                habit.completions.includes(new Date().toISOString().split('T')[0]) 
                  ? "Mark as incomplete" 
                  : "Mark as complete"
              }
            />
            
            <div className="habit-info">
              {habit.isEditing ? (
                <input
                  type="text"
                  value={habit.name}
                  onChange={(e) => handleNameChange(habit.id, e.target.value)}
                  onBlur={() => toggleEdit(habit.id)}
                  className="habit-edit-input"
                  autoFocus
                  aria-label="Edit habit name"
                />
              ) : (
                <span className="habit-name">{habit.name}</span>
              )}
              <span className="habit-streak">🔥 {habit.streak}</span>
            </div>
            
            <div className="habit-actions">
              <button 
                className="edit-button"
                onClick={() => toggleEdit(habit.id)}
                aria-label="Edit habit"
              >
                ✏️
              </button>
              <button 
                className="delete-button"
                onClick={() => deleteHabit(habit.id)}
                aria-label="Delete habit"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;