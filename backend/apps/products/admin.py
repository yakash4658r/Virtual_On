from django.contrib import admin
from .models import Category, Saree


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('display_order', 'is_active')


@admin.register(Saree)
class SareeAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'barcode_id', 'category',
        'price', 'fabric', 'occasion',
        'in_stock', 'is_active', 'created_at'
    )
    list_filter = ('category', 'fabric', 'occasion', 'in_stock', 'is_active')
    search_fields = ('name', 'barcode_id', 'color')
    readonly_fields = ('barcode_id', 'barcode_image', 'slug', 'created_at')
    ordering = ('-created_at',)