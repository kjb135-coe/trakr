export interface Habit {
    name: string
    completions: string[]
    streak: number
    id: string
  }
  
export interface AppState {
habits: Habit[]
newHabit: string
}