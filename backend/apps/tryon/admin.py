from django.contrib import admin
from .models import TryOnSession, TryOnResult


class TryOnResultInline(admin.TabularInline):
    model = TryOnResult
    extra = 0
    readonly_fields = ('status', 'processing_time_seconds', 'created_at')


@admin.register(TryOnSession)
class TryOnSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'progress', 'created_at')
    list_filter = ('status',)
    inlines = [TryOnResultInline]
    readonly_fields = ('created_at', 'completed_at')


@admin.register(TryOnResult)
class TryOnResultAdmin(admin.ModelAdmin):
    list_display = (
        'session', 'saree', 'status',
        'ai_provider', 'processing_time_seconds'
    )
    list_filter = ('status', 'ai_provider')