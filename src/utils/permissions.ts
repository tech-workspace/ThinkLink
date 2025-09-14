import { User } from '../services/authService';

export type Role = 'ADMIN' | 'MODERATOR' | 'USER';

export interface Permissions {
    canManageQuestions: boolean;
    canManageCategories: boolean;
    canManageUsers: boolean;
    canManageRoles: boolean;
    canCreateQuestions: boolean;
    canEditQuestions: boolean;
    canDeleteQuestions: boolean;
    canCreateCategories: boolean;
    canEditCategories: boolean;
    canDeleteCategories: boolean;
    canViewAdminPanel: boolean;
}

export const getUserRole = (user: User | null): Role => {
    if (!user || !user.roleId) {
        return 'USER';
    }

    const role = user.roleId.roleConst as Role;
    return role;
};

export const getUserPermissions = (user: User | null): Permissions => {
    const role = getUserRole(user);
    let permissions: Permissions;

    switch (role) {
        case 'ADMIN':
            permissions = {
                canManageQuestions: true,
                canManageCategories: true,
                canManageUsers: true,
                canManageRoles: true,
                canCreateQuestions: true,
                canEditQuestions: true,
                canDeleteQuestions: true,
                canCreateCategories: true,
                canEditCategories: true,
                canDeleteCategories: true,
                canViewAdminPanel: true,
            };
            break;

        case 'MODERATOR':
            permissions = {
                canManageQuestions: false, // Can only create, not manage
                canManageCategories: false,
                canManageUsers: false,
                canManageRoles: false,
                canCreateQuestions: true, // Only create questions
                canEditQuestions: false,
                canDeleteQuestions: false,
                canCreateCategories: false,
                canEditCategories: false,
                canDeleteCategories: false,
                canViewAdminPanel: true, // Can access admin panel to add questions
            };
            break;

        case 'USER':
        default:
            permissions = {
                canManageQuestions: false,
                canManageCategories: false,
                canManageUsers: false,
                canManageRoles: false,
                canCreateQuestions: false,
                canEditQuestions: false,
                canDeleteQuestions: false,
                canCreateCategories: false,
                canEditCategories: false,
                canDeleteCategories: false,
                canViewAdminPanel: false,
            };
            break;
    }

    return permissions;
};

export const hasPermission = (user: User | null, permission: keyof Permissions): boolean => {
    const permissions = getUserPermissions(user);
    return permissions[permission];
};

export const canAccessAdminPanel = (user: User | null): boolean => {
    return hasPermission(user, 'canViewAdminPanel');
};

export const canManageQuestions = (user: User | null): boolean => {
    return hasPermission(user, 'canManageQuestions');
};

export const canCreateQuestions = (user: User | null): boolean => {
    return hasPermission(user, 'canCreateQuestions');
};

export const canEditQuestions = (user: User | null): boolean => {
    return hasPermission(user, 'canEditQuestions');
};

export const canDeleteQuestions = (user: User | null): boolean => {
    return hasPermission(user, 'canDeleteQuestions');
};

export const canManageCategories = (user: User | null): boolean => {
    return hasPermission(user, 'canManageCategories');
};

export const canManageUsers = (user: User | null): boolean => {
    return hasPermission(user, 'canManageUsers');
};

export const canManageRoles = (user: User | null): boolean => {
    return hasPermission(user, 'canManageRoles');
};
