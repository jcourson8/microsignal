/**
 * MicroSignal UI Components (Tailwind CSS v4)
 * 
 * A collection of shadcn-like UI components implemented for microsignal
 * Updated for Tailwind CSS v4
 */

import { html } from '../../../../microsignal.js';

/**
 * Utility function to merge classnames
 */
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Card Components
 */
export function Card({ className, children, ...props }) {
  return html`
    <div
      data-slot="card"
      class=${cn(
        "flex flex-col gap-6 rounded-xl border py-6 shadow-xs",
        className
      )}
      ...${props}
    >
      ${children}
    </div>
  `;
}

export function CardHeader({ className, children, ...props }) {
  return html`
    <div
      data-slot="card-header"
      class=${cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      ...${props}
    >
      ${children}
    </div>
  `;
}

export function CardTitle({ className, children, ...props }) {
  return html`
    <div
      data-slot="card-title"
      class=${cn("leading-none font-semibold", className)}
      ...${props}
    >
      ${children}
    </div>
  `;
}

export function CardDescription({ className, children, ...props }) {
  return html`
    <div
      data-slot="card-description"
      class=${cn("text-sm text-muted-foreground", className)}
      ...${props}
    >
      ${children}
    </div>
  `;
}

export function CardAction({ className, children, ...props }) {
  return html`
    <div
      data-slot="card-action"
      class=${cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      ...${props}
    >
      ${children}
    </div>
  `;
}

export function CardContent({ className, children, ...props }) {
  return html`
    <div
      data-slot="card-content"
      class=${cn("px-6", className)}
      ...${props}
    >
      ${children}
    </div>
  `;
}

export function CardFooter({ className, children, ...props }) {
  return html`
    <div
      data-slot="card-footer"
      class=${cn("flex items-center px-6 [.border-t]:pt-6", className)}
      ...${props}
    >
      ${children}
    </div>
  `;
}

/**
 * Input Component
 */
export function Input({ className, type, ...props }) {
  return html`
    <input
      type=${type || "text"}
      data-slot="input"
      class=${cn(
        "file:text-foreground placeholder:text-foreground/50 selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-sm border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-hidden file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      ...${props}
    />
  `;
}

/**
 * Toggle Component
 */
export function Toggle({ className, variant, size, pressed, onPressed, children, ...props }) {
  // Define variants
  const toggleVariants = {
    variant: {
      default: "bg-transparent",
      outline: "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      default: "h-9 px-2 min-w-9",
      sm: "h-8 px-1.5 min-w-8",
      lg: "h-10 px-2.5 min-w-10",
      xs: "h-7 px-1 min-w-7", // New XS size for v4
    }
  };

  // Get variant and size classes
  const variantClass = toggleVariants.variant[variant || "default"] || toggleVariants.variant.default;
  const sizeClass = toggleVariants.size[size || "default"] || toggleVariants.size.default;

  // Create the base class with variants
  const baseClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-hidden transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
    variantClass,
    sizeClass,
    className
  );

  // Handle toggle state
  const dataState = pressed ? "on" : "off";
  
  // Handle click to toggle
  const handleClick = (e) => {
    if (onPressed) {
      onPressed(!pressed);
    }
  };

  return html`
    <button
      data-slot="toggle"
      data-state=${dataState}
      class=${baseClass}
      onClick=${handleClick}
      aria-pressed=${pressed || false}
      type="button"
      ...${props}
    >
      ${children}
    </button>
  `;
}

/**
 * Button Component
 */
export function Button({ className, variant, size, children, ...props }) {
  // Define variants
  const buttonVariants = {
    variant: {
      default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
      outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
      icon: "size-9",
      xs: "h-7 rounded-xs gap-1 px-2.5 has-[>svg]:px-2 text-xs", // New XS size for v4
    }
  };

  // Get variant and size classes
  const variantClass = buttonVariants.variant[variant || "default"] || buttonVariants.variant.default;
  const sizeClass = buttonVariants.size[size || "default"] || buttonVariants.size.default;

  // Create the base class with variants
  const baseClass = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-hidden focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    variantClass,
    sizeClass,
    className
  );

  return html`
    <button
      data-slot="button"
      class=${baseClass}
      type="button"
      ...${props}
    >
      ${children}
    </button>
  `;
}

/**
 * Checkbox Component
 */
export function Checkbox({ className, checked, onCheckedChange, disabled, ...props }) {
  const handleClick = (e) => {
    if (disabled) return;
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return html`
    <button
      data-slot="checkbox"
      role="checkbox"
      aria-checked=${checked || false}
      data-state=${checked ? "checked" : "unchecked"}
      disabled=${disabled}
      class=${cn(
        "peer h-4 w-4 shrink-0 rounded-xs border shadow-xs disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      onClick=${handleClick}
      ...${props}
    >
      ${checked ? html`<span class="flex h-full w-full items-center justify-center text-current">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>` : null}
    </button>
  `;
}

/**
 * Select Component
 */
export function Select({ className, children, value, onValueChange, placeholder, ...props }) {
  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  return html`
    <select
      data-slot="select"
      class=${cn(
        "h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:placeholder:text-foreground/50",
        className
      )}
      value=${value || ""}
      onChange=${handleChange}
      ...${props}
    >
      ${placeholder ? html`<option value="" disabled selected hidden>${placeholder}</option>` : null}
      ${children}
    </select>
  `;
}

/**
 * SelectOption Component
 */
export function SelectOption({ value, children, ...props }) {
  return html`
    <option value=${value} ...${props}>${children}</option>
  `;
}

/**
 * Label Component
 */
export function Label({ className, children, htmlFor, ...props }) {
  return html`
    <label
      for=${htmlFor}
      data-slot="label"
      class=${cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      ...${props}
    >
      ${children}
    </label>
  `;
}

/**
 * FormItem Component - Container for form fields
 */
export function FormItem({ className, children, ...props }) {
  return html`
    <div
      data-slot="form-item"
      class=${cn("space-y-2", className)}
      ...${props}
    >
      ${children}
    </div>
  `;
}

/**
 * FormDescription Component
 */
export function FormDescription({ className, children, ...props }) {
  return html`
    <p
      data-slot="form-description"
      class=${cn("text-sm text-muted-foreground", className)}
      ...${props}
    >
      ${children}
    </p>
  `;
}

/**
 * FormMessage Component - For validation errors
 */
export function FormMessage({ className, children, ...props }) {
  return html`
    <p
      data-slot="form-message"
      class=${cn("text-sm font-medium text-destructive", className)}
      ...${props}
    >
      ${children}
    </p>
  `;
}