// microsignal.js - Lightweight reactive framework
// Import original htm.js from the same directory
import htm from './htm.js';

/**
 * Reactive Core - Minimal reactivity system
 */
let currentListener = null;

// Create a signal (reactive state)
export function createSignal(initialValue) {
  const node = {
    value: initialValue,
    observers: new Set()
  };

  // Read function
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
    
    if (node.value !== newValue) {
      node.value = newValue;
      
      if (node.observers.size) {
        // Notify observers of change
        const currObservers = Array.from(node.observers);
        for (const observer of currObservers) {
          queueMicrotask(() => observer.update());
        }
      }
    }
    
    return node.value;
  };

  return [read, write];
}

// Create a derived value (memo)
export function createMemo(computation, initialValue) {
  const [value, setValue] = createSignal(initialValue);
  
  createComputation(
    prev => setValue(computation(prev)), 
    initialValue, 
    true
  );
  
  return value;
}

// Create a side effect
export function createEffect(computation, initialValue) {
  createComputation(computation, initialValue, false);
}

// Internal: Create a computation node
function createComputation(computation, initialValue, sync) {
  const node = {
    fn: computation,
    value: initialValue,
    sources: new Set(),
    update() {
      // Clean up old dependencies first
      for (const source of this.sources) {
        source.observers.delete(this);
      }
      this.sources.clear();
      
      // Set as current listener and run computation
      const prevListener = currentListener;
      currentListener = this;
      
      try {
        this.value = this.fn(this.value);
      } finally {
        currentListener = prevListener;
      }
    }
  };
  
  // Initial update
  if (sync) {
    node.update();
  } else {
    queueMicrotask(() => node.update());
  }
  
  return node;
}

/**
 * Rendering System - Simple DOM handling
 */

// Create DOM element
export function createElement(tag, props, ...children) {
  props = props || {};
  const flatChildren = children.flat(Infinity).filter(c => c != null);
  
  // Handle components (functions)
  if (typeof tag === 'function') {
    return tag({ 
      ...props, 
      children: flatChildren.length === 1 ? flatChildren[0] : flatChildren 
    });
  }
  
  // Create DOM element
  const element = document.createElement(tag);
  
  // Set properties and attributes
  for (const key in props) {
    if (key === 'children') continue;
    
    const value = props[key];
    
    // Handle event handlers
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
      continue;
    }
    
    // Handle reactive properties
    if (typeof value === 'function' && !key.startsWith('on')) {
      createEffect(() => {
        setProperty(element, key, value());
      });
      continue;
    }
    
    // Regular properties
    setProperty(element, key, value);
  }
  
  // Append children
  appendChildren(element, flatChildren);
  
  return element;
}

// Append children to element
function appendChildren(element, children) {
  for (const child of children) {
    if (child == null) continue;
    
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child));
    } else if (typeof child === 'function') {
      // For reactive children
      const marker = document.createComment('');
      element.appendChild(marker);
      
      createEffect(() => {
        const result = child();
        updateChild(element, marker, result);
      });
    } else if (Array.isArray(child)) {
      appendChildren(element, child);
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }
}

// Update a reactive child
function updateChild(parent, marker, value) {
  // Clear nodes after marker
  while (marker.nextSibling) {
    parent.removeChild(marker.nextSibling);
  }
  
  // Insert new content
  if (value == null) return;
  
  if (typeof value === 'string' || typeof value === 'number') {
    marker.after(document.createTextNode(value));
  } else if (value instanceof Node) {
    marker.after(value);
  } else if (Array.isArray(value)) {
    const fragment = document.createDocumentFragment();
    appendChildren(fragment, value);
    marker.after(fragment);
  }
}

// Set element property or attribute
function setProperty(element, key, value) {
  if (value == null) {
    element.removeAttribute(key);
    return;
  }
  
  // Handle special cases
  if (key === 'class' || key === 'className') {
    element.className = value;
  } 
  else if (key === 'style') {
    if (typeof value === 'string') {
      element.style.cssText = value;
    } else {
      Object.assign(element.style, value);
    }
  }
  // Boolean attributes
  else if (typeof value === 'boolean') {
    if (value) element.setAttribute(key, '');
    else element.removeAttribute(key);
    if (key in element) element[key] = value;
  }
  // Regular attributes
  else {
    try {
      element[key] = value;
    } catch {
      element.setAttribute(key, value);
    }
  }
}

/**
 * Main render function - mounts a component to DOM
 */
export function render(component, container) {
  // Clear container
  container.innerHTML = '';
  
  // Insert the component result
  const content = typeof component === 'function' ? component() : component;
  
  if (content != null) {
    if (typeof content === 'string' || typeof content === 'number') {
      container.textContent = content;
    } else if (Array.isArray(content)) {
      appendChildren(container, content);
    } else if (content instanceof Node) {
      container.appendChild(content);
    }
  }
  
  // Return cleanup function
  return () => {
    container.innerHTML = '';
  };
}

// Bind createElement to htm and export html template tag
export const html = htm.bind(createElement);