from rest_framework.permissions import BasePermission


class IsStoreAdmin(BasePermission):
    """
    Only store admin role users can access
    """
    message = 'You must be a store admin to perform this action.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['store_admin', 'superadmin']
        )


class IsSuperAdmin(BasePermission):
    """
    Only superadmin can access
    """
    message = 'You must be a super admin to perform this action.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'superadmin'
        )


class IsCustomer(BasePermission):
    """
    Only customer role can access
    """
    message = 'You must be a customer to perform this action.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'customer'
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object level — only owner or admin can access
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['store_admin', 'superadmin']:
            return True
        # Check if object has user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False