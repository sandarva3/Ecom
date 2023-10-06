from django.urls import path
from .views import(
    store_view,
    cart_view,
    checkout_view,
    form_view,
    updateItem_view,
    processOrder_view,
    detail_view,
    login_view,
    logout_view,
    # loginPage_view,
)

urlpatterns = [
    path('', store_view, name='store'),
    # path('loginpage/', loginPage_view, name="loginPage"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name='logout'),
    path('cart/', cart_view, name='cart'),
    path('checkout/', checkout_view, name='checkout'),
    path('formview/', form_view, name='formView'),
    path('product/<int:product_id>/', detail_view, name='detail'),
    path('update_item/', updateItem_view, name="update_item"),
    path('process_order/', processOrder_view, name='process_order'),
]
