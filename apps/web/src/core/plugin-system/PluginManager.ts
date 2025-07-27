// Plugin Architecture Implementation for FitnessApp
// Enables extensible, modular functionality

export interface Plugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly dependencies?: string[];
  readonly hooks: PluginHooks;
  
  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
}

export interface PluginHooks {
  // Lifecycle hooks
  onAppStart?: () => Promise<void>;
  onAppStop?: () => Promise<void>;
  onUserLogin?: (user: User) => Promise<void>;
  onUserLogout?: () => Promise<void>;
  
  // Workout hooks
  onWorkoutStart?: (workout: Workout) => Promise<void>;
  onWorkoutComplete?: (workout: Workout, results: WorkoutResults) => Promise<void>;
  onExerciseComplete?: (exercise: Exercise, results: ExerciseResults) => Promise<void>;
  
  // Data hooks
  onDataChange?: (entity: string, data: any) => Promise<void>;
  onDataValidation?: (entity: string, data: any) => Promise<ValidationResult>;
  
  // UI hooks
  onComponentRender?: (component: string, props: any) => Promise<any>;
  onRouteChange?: (route: string) => Promise<void>;
}

export interface PluginContext {
  readonly api: PluginAPI;
  readonly storage: PluginStorage;
  readonly events: PluginEventBus;
  readonly ui: PluginUIManager;
  readonly config: PluginConfig;
}

export interface PluginAPI {
  // User management
  getCurrentUser(): Promise<User | null>;
  updateUserProfile(updates: Partial<UserProfile>): Promise<void>;
  
  // Workout management
  getWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: CreateWorkoutPlanRequest): Promise<WorkoutPlan>;
  updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<void>;
  
  // Progress tracking
  recordWorkoutSession(session: WorkoutSession): Promise<void>;
  getProgressStats(userId: string): Promise<ProgressStats>;
  
  // Notifications
  sendNotification(notification: Notification): Promise<void>;
  scheduleNotification(notification: ScheduledNotification): Promise<void>;
}

export interface PluginStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface PluginEventBus {
  emit(event: string, data?: any): void;
  on(event: string, handler: (data?: any) => void): void;
  off(event: string, handler: (data?: any) => void): void;
  once(event: string, handler: (data?: any) => void): void;
}

export interface PluginUIManager {
  registerComponent(name: string, component: React.ComponentType): void;
  registerRoute(path: string, component: React.ComponentType): void;
  registerMenuItem(item: MenuItem): void;
  registerWidget(widget: Widget): void;
  showModal(modal: ModalConfig): void;
  showToast(toast: ToastConfig): void;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private loadedPlugins = new Set<string>();
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    // Validate plugin
    this.validatePlugin(plugin);
    
    // Check dependencies
    await this.checkDependencies(plugin);
    
    // Register plugin
    this.plugins.set(plugin.name, plugin);
    
    console.log(`Plugin registered: ${plugin.name} v${plugin.version}`);
  }

  async loadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    if (this.loadedPlugins.has(name)) {
      console.warn(`Plugin already loaded: ${name}`);
      return;
    }

    try {
      // Load dependencies first
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.loadedPlugins.has(dep)) {
            await this.loadPlugin(dep);
          }
        }
      }

      // Initialize plugin
      await plugin.initialize(this.context);
      
      // Register hooks
      this.registerHooks(plugin);
      
      this.loadedPlugins.add(name);
      console.log(`Plugin loaded: ${name}`);
      
      // Emit plugin loaded event
      this.context.events.emit('plugin:loaded', { name, plugin });
      
    } catch (error) {
      console.error(`Failed to load plugin ${name}:`, error);
      throw error;
    }
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin || !this.loadedPlugins.has(name)) {
      return;
    }

    try {
      // Check if other plugins depend on this one
      const dependents = this.findDependents(name);
      if (dependents.length > 0) {
        throw new Error(`Cannot unload plugin ${name}: required by ${dependents.join(', ')}`);
      }

      // Destroy plugin
      await plugin.destroy();
      
      // Unregister hooks
      this.unregisterHooks(plugin);
      
      this.loadedPlugins.delete(name);
      console.log(`Plugin unloaded: ${name}`);
      
      // Emit plugin unloaded event
      this.context.events.emit('plugin:unloaded', { name, plugin });
      
    } catch (error) {
      console.error(`Failed to unload plugin ${name}:`, error);
      throw error;
    }
  }

  async loadAllPlugins(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys());
    
    // Sort plugins by dependencies (topological sort)
    const sortedPlugins = this.topologicalSort(pluginNames);
    
    for (const name of sortedPlugins) {
      if (!this.loadedPlugins.has(name)) {
        await this.loadPlugin(name);
      }
    }
  }

  async executeHook(hookName: keyof PluginHooks, ...args: any[]): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [name, plugin] of this.plugins) {
      if (this.loadedPlugins.has(name) && plugin.hooks[hookName]) {
        const hook = plugin.hooks[hookName] as Function;
        promises.push(
          hook(...args).catch((error: Error) => {
            console.error(`Error in plugin ${name} hook ${hookName}:`, error);
          })
        );
      }
    }
    
    await Promise.all(promises);
  }

  getLoadedPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins)
      .map(name => this.plugins.get(name)!)
      .filter(Boolean);
  }

  getPluginInfo(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  private validatePlugin(plugin: Plugin): void {
    if (!plugin.name || !plugin.version) {
      throw new Error('Plugin must have name and version');
    }
    
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin already registered: ${plugin.name}`);
    }
    
    if (!plugin.initialize || typeof plugin.initialize !== 'function') {
      throw new Error('Plugin must implement initialize method');
    }
    
    if (!plugin.destroy || typeof plugin.destroy !== 'function') {
      throw new Error('Plugin must implement destroy method');
    }
  }

  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies) return;
    
    for (const dep of plugin.dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Plugin dependency not found: ${dep}`);
      }
    }
  }

  private registerHooks(plugin: Plugin): void {
    // Register plugin hooks with the event system
    Object.entries(plugin.hooks).forEach(([hookName, hookFn]) => {
      if (hookFn) {
        this.context.events.on(`hook:${hookName}`, hookFn);
      }
    });
  }

  private unregisterHooks(plugin: Plugin): void {
    // Unregister plugin hooks from the event system
    Object.entries(plugin.hooks).forEach(([hookName, hookFn]) => {
      if (hookFn) {
        this.context.events.off(`hook:${hookName}`, hookFn);
      }
    });
  }

  private findDependents(pluginName: string): string[] {
    const dependents: string[] = [];
    
    for (const [name, plugin] of this.plugins) {
      if (plugin.dependencies?.includes(pluginName) && this.loadedPlugins.has(name)) {
        dependents.push(name);
      }
    }
    
    return dependents;
  }

  private topologicalSort(pluginNames: string[]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving plugin: ${name}`);
      }
      
      if (visited.has(name)) {
        return;
      }

      visiting.add(name);
      
      const plugin = this.plugins.get(name);
      if (plugin?.dependencies) {
        for (const dep of plugin.dependencies) {
          visit(dep);
        }
      }
      
      visiting.delete(name);
      visited.add(name);
      result.push(name);
    };

    for (const name of pluginNames) {
      visit(name);
    }

    return result;
  }
}

// Plugin factory for creating plugins
export abstract class BasePlugin implements Plugin {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly description: string;
  readonly dependencies?: string[];
  readonly hooks: PluginHooks = {};

  protected context!: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    await this.onInitialize();
  }

  async destroy(): Promise<void> {
    await this.onDestroy();
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onDestroy(): Promise<void>;
}

export default PluginManager;
