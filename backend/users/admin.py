from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    list_filter = ('is_active', 'is_staff', 'date_joined')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'height', 'weight', 'birth_date', 'profile_picture')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_active', 'is_staff')}
        ),
    )
