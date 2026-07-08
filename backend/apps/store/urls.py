from django.urls import path
from . import views

urlpatterns = [
    path(
        'settings/',
        views.StoreSettingsView.as_view(),
        name='store-settings'
    ),
    path(
        'dashboard/',
        views.DashboardView.as_view(),
        name='store-dashboard'
    ),
    path(
        'tryon-history/',
        views.TryOnAdminHistoryView.as_view(),
        name='admin-tryon-history'
    ),
]