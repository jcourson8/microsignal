// --- Shared state ---
let currentListener = null;

// --- Core utility functions ---
const comparator = (a, b) => a === b;

/**
 * Creates a new signal with getter and setter
 * @param {*} initialValue - The initial value of the signal
 * @param {Object} options - Optional configuration 
 * @returns {Array} - [getter, setter]
 */
function createSignal(initialValue) {
  // Signal state
  const node = {
    value: initialValue,
    observers: new Set()
  };

  // Read function - This needs to be a function object so we can attach properties
  const read = function signal() {
    if (currentListener) {
      node.observers.add(currentListener);
      currentListener.sources.add(node);
    }
    return node.value;
  };

  // Write function
  const write = function setSignal(newValue) {
    if (typeof newValue === "function") {
      newValue = newValue(node.value);
    }
    
    if (!comparator(node.value, newValue)) {
      node.value = newValue;
      
      if (node.observers.size) {
        // Clone the set to avoid issues with observers that might be added/removed
        // during the update process
        const currObservers = Array.from(node.observers);
        for (const observer of currObservers) {
          // Schedule updates instead of running immediately
          // This gives better performance with multiple updates
          queueMicrotask(() => observer.update());
        }
      }
    }
    
    return node.value;
  };

  return [read, write];
}

/**
 * Creates a derived reactive value
 * @param {Function} computation - The computation function
 * @param {*} initialValue - Optional initial value
 * @param {Object} options - Optional configuration
 * @returns {Function} - Getter for the memo value
 */
function createMemo(computation, initialValue, options = {}) {
  
  // Create a signal to store the value
  const [value, setValue] = createSignal(initialValue, { equals: comparator });
  
  // Create the computation
  const memo = createComputation(
    prev => setValue(computation(prev)), 
    initialValue, 
    true
  );
  
  // Return a read-only accessor
  return value;
}

/**
 * Creates a computation that runs after render
 * @param {Function} computation - The effect function
 * @param {*} initialValue - Optional initial value
 */
function createEffect(computation, initialValue) {
  createComputation(computation, initialValue, false);
}

/**
 * Internal: Create a computation node
 * @param {Function} computation - The computation function
 * @param {*} initialValue - Initial value
 * @param {boolean} sync - Whether to run synchronously
 * @returns {Object} - The computation node
 */
function createComputation(computation, initialValue, sync) {
  // Create the computation node
  const node = {
    fn: computation,
    value: initialValue,
    sources: new Set(),
    update() {
      // Clean up old sources
      this.cleanup();
      
      // Set as current listener and run computation
      const prevListener = currentListener;
      currentListener = this;
      
      try {
        const newValue = this.fn(this.value);
        this.value = newValue;
      } finally {
        currentListener = prevListener;
      }
    },
    cleanup() {
      // Remove this node from all sources
      for (const source of this.sources) {
        source.observers.delete(this);
      }
      this.sources.clear();
    }
  };
  
  // Initial update (sync for memos, immediate for effects)
  if (sync) {
    node.update();
  } else {
    // Use queueMicrotask for more consistent timing
    queueMicrotask(() => node.update());
  }
  
  return node;
}

/**
 * Ignores tracking inside the function
 * @param {Function} fn - Function to run without tracking
 * @returns {*} - The return value of fn
 */
function untrack(fn) {
  const prevListener = currentListener;
  currentListener = null;
  try {
    return fn();
  } finally {
    currentListener = prevListener;
  }
}

// --- Cleanup handling ---
let currentOwner = null;

function createRoot(fn) {
  const prevOwner = currentOwner;
  const owner = {
    cleanups: []
  };
  
  currentOwner = owner;
  try {
    const result = fn(() => cleanNode(owner));
    return result;
  } finally {
    currentOwner = prevOwner;
  }
}

function onCleanup(fn) {
  if (currentOwner) {
    currentOwner.cleanups.push(fn);
  }
}

function cleanNode(node) {
  if (node.cleanups) {
    for (const cleanup of node.cleanups) {
      cleanup();
    }
  }
}

// Export the reactive primitives
export {
  createSignal,
  createMemo,
  createEffect,
  createRoot,
  onCleanup,
  untrack
};