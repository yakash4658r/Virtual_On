from django.urls import path
from . import views

urlpatterns = [
    path(
        'start/',
        views.StartTryOnView.as_view(),
        name='tryon-start'
    ),
    path(
        'status/<uuid:session_id>/',
        views.TryOnStatusView.as_view(),
        name='tryon-status'
    ),
    path(
        'history/',
        views.TryOnHistoryView.as_view(),
        name='tryon-history'
    ),
    path(
        'detail/<uuid:session_id>/',
        views.TryOnDetailView.as_view(),
        name='tryon-detail'
    ),
    path(
        'retry/<uuid:result_id>/',
        views.RetryTryOnView.as_view(),
        name='tryon-retry'
    ),
]