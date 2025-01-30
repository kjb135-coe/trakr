const chromeMock = {
    storage: {
      sync: {
        get: (keys: string[], callback: (result: any) => void) => {
          const mockData = {
            habits: [
              { id: '1', name: 'Example Habit', completions: [], streak: 0 }
            ]
          };
          setTimeout(() => callback(mockData), 500);
        },
        set: (data: any, callback?: () => void) => {
          console.log('[DEV] Chrome storage set mock:', data);
          setTimeout(() => callback?.(), 500);
        }
      }
    },
    runtime: {
      id: 'dev-mock-extension'
    }
  };
  
  declare global {
    interface Window {
      chrome: typeof chrome;
    }
  }
  
  // @ts-ignore - Attach to window for development
  if (import.meta.env.DEV) {
    window.chrome = window.chrome || chromeMock;
  }
  
  export {};