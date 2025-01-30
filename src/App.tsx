import { useEffect, useState } from 'react';
import './App.css';

interface Habit {
  id: string;
  name: string;
  completions: string[];
  streak: number;
}

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    const loadHabits = () => {
      if (!window.chrome?.storage?.sync) {
        console.warn('Chrome storage not available - using mock data');
        return;
      }

      window.chrome.storage.sync.get(['habits'], (result: { habits?: Habit[] }) => {
        const storedHabits = result.habits || [];
        setHabits(storedHabits);
      });
    };

    loadHabits();
  }, []);

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    if (window.chrome?.storage?.sync) {
      window.chrome.storage.sync.set({ habits: updatedHabits });
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

  return (
    <div className="container">
      <h1>Daily Habits</h1>
      <form onSubmit={addHabit} className="habit-form">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Enter new habit"
          className="habit-input"
        />
        <button type="submit" className="add-button">
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
            />
            
            <div className="habit-info">
              <span className="habit-name">{habit.name}</span>
              <span className="habit-streak">🔥 {habit.streak}</span>
            </div>
            
            <button 
              className="delete-button"
              onClick={() => deleteHabit(habit.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;