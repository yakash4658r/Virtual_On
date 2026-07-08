from django.urls import path
from . import views

urlpatterns = [

    # Public routes
    path('', views.SareeListView.as_view(), name='saree-list'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('<slug:slug>/', views.SareeDetailView.as_view(), name='saree-detail'),
    path('barcode/<str:barcode_id>/', views.SareeByBarcodeView.as_view(), name='saree-by-barcode'),

    # Admin routes
    path('admin/list/', views.AdminSareeListView.as_view(), name='admin-saree-list'),
    path('admin/create/', views.SareeCreateView.as_view(), name='saree-create'),
    path('admin/<uuid:pk>/update/', views.SareeUpdateView.as_view(), name='saree-update'),
    path('admin/categories/create/', views.CategoryCreateView.as_view(), name='category-create'),
    path('admin/barcodes/all/', views.AllBarcodesView.as_view(), name='all-barcodes'),
    path('admin/<uuid:pk>/barcode/', views.BarcodeDownloadView.as_view(), name='barcode-download'),
]