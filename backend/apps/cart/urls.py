from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.AddToCartView.as_view(), name='cart-add'),
    path('remove/<uuid:item_id>/', views.RemoveFromCartView.as_view(), name='cart-remove'),
    path('clear/', views.ClearCartView.as_view(), name='cart-clear'),
    path('count/', views.CartCountView.as_view(), name='cart-count'),
]