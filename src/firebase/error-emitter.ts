type Listener = (error: unknown) => void;

const listeners: Listener[] = [];

export const errorEmitter = {
  emit: (error: unknown) => {
    listeners.forEach(fn => fn(error));
  },

  subscribe: (fn: Listener) => {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i > -1) listeners.splice(i, 1);
    };
  },
};