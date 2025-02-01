import { ValidationEngine } from './validation/ValidationEngine';
import {
  SystemConfig,
  RoleDefinition,
  ValidationRequest,
  ValidationResult,
  AccessResult,
  ContextUpdate,
  SecurityContext
} from '../types';

/**
 * Main entry point for the agent profile system
 */
export class AgentProfileSystem {
  private config: SystemConfig = {
    roles: [],
    security: {
      minimumSecurityLevel: 1,
      defaultRequirements: [],
      enabledPlugins: []
    },
    validation: {
      strict: true,
      rules: [],
      enabledPlugins: [],
      minimumSecurityLevel: 1
    },
    integration: {}
  };
  
  private validationEngine: ValidationEngine;
  private initialized: boolean = false;

  constructor() {
    this.validationEngine = new ValidationEngine({
      strict: true,
      rules: [],
      enabledPlugins: [],
      minimumSecurityLevel: 1
    });
  }

  /**
   * Initialize the agent profile system
   */
  public async initialize(config: SystemConfig): Promise<void> {
    if (this.initialized) {
      throw new Error('AgentProfileSystem is already initialized');
    }

    try {
      this.config = config;

      // Initialize validation engine
      await this.validationEngine.initialize();

      // Register roles
      for (const role of config.roles) {
        this.validationEngine.registerRole(role);
      }

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize AgentProfileSystem: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add a new role to the system
   */
  public async addRole(role: RoleDefinition): Promise<void> {
    this.checkInitialized();
    
    try {
      // Validate role definition
      this.validateRoleDefinition(role);

      // Register with validation engine
      this.validationEngine.registerRole(role);
    } catch (error) {
      throw new Error(`Failed to add role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing role
   */
  public async updateRole(roleId: string, updates: Partial<RoleDefinition>): Promise<void> {
    this.checkInitialized();
    
    // Implementation will be added in future updates
    throw new Error('Method not implemented');
  }

  /**
   * Validate a role-based access request
   */
  public async validateAccess(request: ValidationRequest): Promise<AccessResult> {
    this.checkInitialized();

    try {
      const validationResult = await this.validationEngine.validate(request);

      return {
        allowed: validationResult.isValid,
        reason: validationResult.errorMessage,
        requiredLevel: this.getRequiredSecurityLevel(request)
      };
    } catch (error) {
      throw new Error(`Access validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update the context for a role
   */
  public async updateContext(update: ContextUpdate): Promise<void> {
    this.checkInitialized();
    
    // Implementation will be added in future updates
    throw new Error('Method not implemented');
  }

  /**
   * Get the current security context
   */
  public async getSecurityContext(): Promise<SecurityContext> {
    this.checkInitialized();
    
    return {
      authenticated: true,
      securityLevel: this.config.security.minimumSecurityLevel,
      permissions: []
    };
  }

  /**
   * Check if the system is initialized
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('AgentProfileSystem is not initialized');
    }
  }

  /**
   * Validate a role definition
   */
  private validateRoleDefinition(role: RoleDefinition): void {
    if (!role.id) {
      throw new Error('Role ID is required');
    }

    if (!role.name) {
      throw new Error('Role name is required');
    }

    if (!role.accessPatterns || role.accessPatterns.length === 0) {
      throw new Error('Role must have at least one access pattern');
    }

    // Validate access patterns
    for (const pattern of role.accessPatterns) {
      if (!pattern.pattern) {
        throw new Error('Access pattern must have a pattern');
      }

      if (!pattern.operations || pattern.operations.length === 0) {
        throw new Error('Access pattern must have at least one operation');
      }

      // Validate pattern is a valid regex
      try {
        new RegExp(pattern.pattern);
      } catch {
        throw new Error(`Invalid regex pattern: ${pattern.pattern}`);
      }
    }
  }

  /**
   * Get the required security level for a request
   */
  private getRequiredSecurityLevel(request: ValidationRequest): number {
    const role = this.config.roles.find(r => r.id === request.roleId);
    return role?.securityLevel ?? this.config.security.minimumSecurityLevel;
  }
}