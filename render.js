/**
 * Basic implementation of Solid.js render function
 * This demonstrates the core concepts without all the complexity
 */

// Import our minimal reactive system
import { createRoot, createEffect } from './reactive.js';

/**
 * Renders a component to a DOM element
 * 
 * @param {Function} code - Function that returns JSX/DOM nodes
 * @param {Element} element - DOM element to render into
 * @returns {Function} - Cleanup function to remove everything
 */
function render(code, element) {
  // Validate element exists
  if (!element) {
    throw new Error(
      "The `element` passed to `render(..., element)` doesn't exist. Make sure `element` exists in the document."
    );
  }
  
  // Store for the disposer function from createRoot
  let disposer;
  
  // Create a reactive root to track dependencies
  createRoot(dispose => {
    // Store the disposer for later cleanup
    disposer = dispose;
    
    // Special case for document
    if (element === document) {
      // Just run the code for document level
      code();
    } else {
      // Insert the result of running code() into the element
      const result = code();
      insert(element, result);
    }
  });
  
  // Return a cleanup function
  return () => {
    // Call the disposer to clean up reactive system
    disposer();
    
    // Clear the DOM
    element.textContent = "";
  };
}

/**
 * Insert content into a parent element
 * 
 * @param {Element} parent - The parent DOM element
 * @param {Node|String|Array} content - Content to insert
 * @returns {Node|Node[]} - The inserted node(s)
 */
function insert(parent, content) {
  // Handle different content types
  
  // String or number: create text node
  if (typeof content === 'string' || typeof content === 'number') {
    const node = document.createTextNode(content);
    parent.appendChild(node);
    return node;
  }
  
  // Arrays: insert each item
  if (Array.isArray(content)) {
    const nodes = [];
    for (let i = 0; i < content.length; i++) {
      const node = insert(parent, content[i]);
      if (node) {
        if (Array.isArray(node)) nodes.push(...node);
        else nodes.push(node);
      }
    }
    return nodes;
  }
  
  // DOM nodes: directly append
  if (content && content.nodeType) {
    parent.appendChild(content);
    return content;
  }
  
  // Functions: track with an effect for reactivity
  if (typeof content === 'function') {
    // Create a placeholder div to hold the content
    const container = document.createElement('div');
    parent.appendChild(container);
    
    // Use an effect to update this part of the DOM when dependencies change
    createEffect(() => {
      const result = content();
      // Simple approach: just clear and re-render the content
      container.innerHTML = '';
      if (result != null) {
        if (typeof result === 'string' || typeof result === 'number') {
          container.textContent = result;
        } else if (Array.isArray(result)) {
          // For arrays (like in todo lists), insert each item
          for (let i = 0; i < result.length; i++) {
            insert(container, result[i]);
          }
        } else {
          insert(container, result);
        }
      }
    });
    
    return container;
  }
  
  // Null or undefined: don't insert anything
  if (content == null) {
    return null;
  }
  
  // Fallback for other types
  console.warn(`Unrecognized content type:`, content);
  return null;
}

/**
 * Creates a DOM element or component with the given properties
 * 
 * @param {String|Function} tag - HTML tag name or component function
 * @param {Object} props - Element properties
 * @param {Array} children - Child elements
 * @returns {Element|Array} - The created DOM element or component result
 */
function createElement(tag, props, ...children) {
  // Normalize props (might be null)
  props = props || {};
  
  // Flatten children
  const flatChildren = children.flat(Infinity);
  
  // Add children to props for components
  props.children = flatChildren.length === 1 ? flatChildren[0] : flatChildren;
  
  // Handle function components (like custom components)
  if (typeof tag === 'function') {
    return tag(props);
  }
  
  // Create a DOM element for regular HTML tags
  const element = document.createElement(tag);
  
  // Set properties
  for (const key in props) {
    // Skip children prop as it's handled separately
    if (key === 'children') continue;
    
    // Handle event handlers
    if (key.startsWith('on') && typeof props[key] === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, props[key]);
      continue;
    }
    
    // Handle reactive properties
    if (typeof props[key] === 'function' && !key.startsWith('on')) {
      createEffect(() => {
        const value = props[key]();
        updateProperty(element, key, value);
      });
      continue;
    }
    
    // Handle regular properties
    updateProperty(element, key, props[key]);
  }
  
  // Append children
  for (let i = 0; i < flatChildren.length; i++) {
    insert(element, flatChildren[i]);
  }
  
  return element;
}

/**
 * Updates a property or attribute on an element
 */
function updateProperty(element, key, value) {
  // Skip null or undefined values except for boolean attributes
  if (value == null) {
    if (key === 'checked' || key === 'disabled' || key === 'selected') {
      element[key] = false;
    } else {
      element.removeAttribute(key);
    }
    return;
  }
  
  // Special handling for certain attributes
  if (key === 'class' || key === 'className') {
    element.className = value;
    return;
  }
  
  if (key === 'style') {
    if (typeof value === 'string') {
      element.style.cssText = value;
    } else {
      for (const styleName in value) {
        element.style[styleName] = value[styleName];
      }
    }
    return;
  }
  
  // Boolean attributes
  if (typeof value === 'boolean') {
    if (value) {
      element.setAttribute(key, '');
    } else {
      element.removeAttribute(key);
    }
    
    // Also set the property for form elements
    if (key in element) {
      element[key] = value;
    }
    return;
  }
  
  // Regular attributes
  if (typeof value === 'string' || typeof value === 'number') {
    element.setAttribute(key, value);
    return;
  }
  
  // Properties (objects, etc.)
  element[key] = value;
}

// Export for JSX
export const jsx = createElement;

export {
  render,
  createElement
};