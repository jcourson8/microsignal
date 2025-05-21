// TaskDashboard.js
import { createSignal, createMemo, createEffect, html, render } from '../../microsignal.js';
import { 
    Button, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent, 
    CardFooter,
    Input,
    Toggle,
    Select,
    SelectOption
} from './components/ui/index.js';

// Helper functions
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getFutureDateString(daysAhead = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return futureDate.toISOString().split('T')[0];
}

// SVG Icons as simple functions
function IconCheck() {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-primary-foreground">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;
}

function IconStar(filled = false) {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill=${filled ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    `;
}

function IconX() {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
}

function IconCalendar() {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-muted-foreground mr-1">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    `;
}

function IconClock() {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-muted-foreground mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    `;
}

function IconPlus() {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    `;
}

function IconMoon() {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    `;
}

function IconSun() {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    `;
}

function TaskDashboard() {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // State signals
    const [tasks, setTasks] = createSignal([
        { id: 1, title: 'Complete project proposal', priority: 'high', completed: false, due: '2025-05-25', starred: true },
        { id: 2, title: 'Review team designs', priority: 'medium', completed: false, due: '2025-05-22', starred: false },
        { id: 3, title: 'Weekly team meeting', priority: 'medium', completed: true, due: '2025-05-21', starred: false },
        { id: 4, title: 'Update documentation', priority: 'low', completed: false, due: '2025-05-30', starred: true },
    ]);
    const [newTaskTitle, setNewTaskTitle] = createSignal('');
    const [newTaskPriority, setNewTaskPriority] = createSignal('medium');
    const [filter, setFilter] = createSignal('all');
    const [isDark, setIsDark] = createSignal(prefersDark);
    
    // Computed values
    const filteredTasks = createMemo(() => {
        return tasks().filter(task => {
            if (filter() === 'all') return true;
            if (filter() === 'completed') return task.completed;
            if (filter() === 'active') return !task.completed;
            if (filter() === 'starred') return task.starred;
            return true;
        });
    });
    
    const progress = createMemo(() => {
        const totalCount = tasks().length;
        const completedCount = tasks().filter(task => task.completed).length;
        return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    });
    
    const taskStats = createMemo(() => {
        const totalCount = tasks().length;
        const completedCount = tasks().filter(task => task.completed).length;
        const highPriorityCount = tasks().filter(task => task.priority === 'high').length;
        const dueTodayCount = tasks().filter(task => task.due === getCurrentDate()).length;
        
        return {
            total: totalCount,
            completed: completedCount,
            highPriority: highPriorityCount,
            dueToday: dueTodayCount
        };
    });
    
    // Effects
    createEffect(() => {
        // Force update dark mode class - remove first then add if needed
        document.documentElement.classList.remove('dark');
        
        if (isDark()) {
            document.documentElement.classList.add('dark');
        }
        
        // Debug - console log to see if the dark mode is changing correctly
        console.log('Dark mode:', isDark(), 'Class present:', document.documentElement.classList.contains('dark'));
    });
    
    // Task operations
    const addTask = () => {
        if (newTaskTitle().trim() === '') return;
        
        const newTask = {
            id: Date.now(),
            title: newTaskTitle(),
            priority: newTaskPriority(),
            completed: false,
            due: getFutureDateString(7),
            starred: false
        };
        
        setTasks([...tasks(), newTask]);
        setNewTaskTitle('');
    };
    
    const toggleTaskComplete = (id) => {
        setTasks(tasks().map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };
    
    const toggleTaskStar = (id) => {
        setTasks(tasks().map(task => 
            task.id === id ? { ...task, starred: !task.starred } : task
        ));
    };
    
    const deleteTask = (id) => {
        setTasks(tasks().filter(task => task.id !== id));
    };
    
    return html`
        <div class="min-h-screen bg-background text-foreground p-4 transition-colors duration-200">
            <div class="max-w-4xl mx-auto">
                <!-- Header with theme toggle -->
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-2xl font-bold">MicroSignal Tasks</h1>
                    <${Button} 
                        variant="outline" 
                        onclick=${() => setIsDark(!isDark())}
                        class="gap-2"
                    >
                        ${() => isDark() ? html`${IconSun()} Light Mode` : html`${IconMoon()} Dark Mode`}
                    <//>
                </div>
                
                <!-- Dashboard Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <!-- Progress Card -->
                    <${Card}>
                        <${CardHeader}>
                            <${CardTitle}>Progress<//>
                            <${CardDescription}>Your task completion<//>
                        <//>
                        <${CardContent}>
                            <div class="relative pt-1">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <span class="text-xs font-semibold inline-block text-primary">
                                            ${() => progress()}%
                                        </span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-xs font-semibold inline-block text-muted-foreground">
                                            ${() => taskStats().completed} of ${() => taskStats().total} tasks
                                        </span>
                                    </div>
                                </div>
                                <div class="overflow-hidden h-2 mb-4 text-xs flex rounded-sm bg-secondary mt-1">
                                    <div style=${() => `width: ${progress()}%`} class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"></div>
                                </div>
                            </div>
                        <//>
                    <//>
                    
                    <!-- Today's Tasks Card -->
                    <${Card}>
                        <${CardHeader}>
                            <${CardTitle}>Today<//>
                            <${CardDescription}>May 21, 2025<//>
                        <//>
                        <${CardContent}>
                            <div class="flex items-center gap-2">
                                ${IconClock()}
                                <span class="text-sm">${() => taskStats().dueToday} tasks due today</span>
                            </div>
                        <//>
                    <//>
                    
                    <!-- Priority Tasks Card -->
                    <${Card}>
                        <${CardHeader}>
                            <${CardTitle}>Priority<//>
                            <${CardDescription}>High priority tasks<//>
                        <//>
                        <${CardContent}>
                            <div class="flex items-center gap-2">
                                ${IconStar(true)}
                                <span class="text-sm">${() => taskStats().highPriority} high priority</span>
                            </div>
                        <//>
                    <//>
                </div>
                
                <!-- Add Task Area -->
                <${Card} class="mb-8">
                    <${CardHeader}>
                        <${CardTitle}>Add New Task<//>
                    <//>
                    <${CardContent}>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <${Input}
                                placeholder="Task title..."
                                value=${newTaskTitle}
                                oninput=${(e) => setNewTaskTitle(e.target.value)}
                                class="w-full"
                            />
                            <${Select}
                                value=${newTaskPriority}
                                onValueChange=${setNewTaskPriority}
                                class="w-40"
                            >
                                <${SelectOption} value="low">Low Priority<//>
                                <${SelectOption} value="medium">Medium Priority<//>
                                <${SelectOption} value="high">High Priority<//>
                            <//>
                            <${Button}
                                onclick=${addTask}
                                class="gap-2"
                            >
                                ${IconPlus()} Add Task
                            <//>
                        </div>
                    <//>
                <//>
                
                <!-- Task List -->
                <${Card}>
                    <${CardHeader}>
                        <${CardTitle}>Tasks<//>
                        <div class="flex gap-2 mt-2">
                            <${Button} 
                                variant=${() => filter() === 'all' ? 'default' : 'secondary'}
                                size="sm"
                                onclick=${() => setFilter('all')}
                            >All<//>
                            <${Button} 
                                variant=${() => filter() === 'active' ? 'default' : 'secondary'}
                                size="sm"
                                onclick=${() => setFilter('active')}
                            >Active<//>
                            <${Button} 
                                variant=${() => filter() === 'completed' ? 'default' : 'secondary'}
                                size="sm"
                                onclick=${() => setFilter('completed')}
                            >Completed<//>
                            <${Button} 
                                variant=${() => filter() === 'starred' ? 'default' : 'secondary'}
                                size="sm"
                                onclick=${() => setFilter('starred')}
                            >Starred<//>
                        </div>
                    <//>
                    <${CardContent}>
                        <div class="divide-y">
                            ${() => filteredTasks().length === 0 
                                ? html`<div class="py-6 text-center text-muted-foreground">No tasks to display.</div>`
                                : filteredTasks().map(task => html`
                                    <div key=${task.id} class="py-3 flex items-center gap-3">
                                        <button
                                            onclick=${() => toggleTaskComplete(task.id)}
                                            class=${`w-5 h-5 flex items-center justify-center border rounded-sm ${task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                                        >
                                            ${task.completed ? IconCheck() : null}
                                        </button>
                                        
                                        <div class=${`flex-grow ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                            ${task.title}
                                        </div>
                                        
                                        <div class="flex items-center gap-2">
                                            <div class="flex items-center">
                                                ${IconCalendar()}
                                                <span class="text-xs text-muted-foreground">${task.due}</span>
                                            </div>
                                            
                                            <span class=${`inline-block px-2 py-1 text-xs rounded-sm ${
                                                task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                task.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                                ${task.priority}
                                            </span>
                                            
                                            <button
                                                onclick=${() => toggleTaskStar(task.id)}
                                                class="text-muted-foreground hover:text-amber-500"
                                            >
                                                ${task.starred ? IconStar(true) : IconStar(false)}
                                            </button>
                                            
                                            <button
                                                onclick=${() => deleteTask(task.id)}
                                                class="text-muted-foreground hover:text-destructive"
                                            >
                                                ${IconX()}
                                            </button>
                                        </div>
                                    </div>
                                `)
                            }
                        </div>
                    <//>
                <//>
            </div>
        </div>
    `;
}

render(TaskDashboard, document.getElementById('app'));