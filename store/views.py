from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
import json,datetime
from .models import *
from .utils import cookieCart, cartData, guestOrder
from django.views.decorators.csrf import csrf_exempt
from .forms import CustomeUserCreationForm
from django.contrib import auth
from django.contrib.auth import login,logout

# def loginPage_view(request):
#     user = request.user
#     if user.is_authenticated:
#         return redirect('store')
#     return render(request, 'store/login.html')

def login_view(request):
    user = request.user
    if user.is_authenticated:
        return redirect('store')
    else:
        if request.method == "POST":
            username = request.POST.get('username')
            password = request.POST.get('password')
            
            print(f"username: {username}, password: {password}")
            user = auth.authenticate(request, username=username, password=password)
            print(f"user: {user}")
            if user is not None:
                auth.login(request, user)
                print(f"The user is: {user}")
                return redirect('store')
            else:
                return render(request, 'store/login.html', {'error': 'Invalid username or password'})
                print(f"User is this: {user}")
                print(f"username: {username}, password: {password}")
        else:
            return render(request, 'store/login.html')
            
    return render(request, "store/login.html")

def logout_view(request):
    logout(request)
    return redirect('store')

def store_view(request):
    data = cartData(request)
    cartItems = data['cartItems']
    order = data['order']
    items = data['items']

    products = Product.objects.all()
    context = {'products': products, "cartItems": cartItems}
    return render(request, 'store/store.html', context)


def cart_view(request):
    data = cartData(request)

    cartItems = data['cartItems']
    order = data['order']
    items = data['items']
    print(items)

    context = {'items': items, 'order': order, "cartItems": cartItems}
    return render(request, 'store/cart.html', context)
    

def checkout_view(request):
    data = cartData(request)

    cartItems = data['cartItems']
    order = data['order']
    items = data['items']
    context = {'items': items, 'order': order,
               "cartItems": cartItems}

    return render(request, 'store/checkout.html', context)


def form_view(request):
    data = json.loads(request.body)
    print(f"FORM RECEIVED: {data}")
    if request.method == "POST":
        form = CustomeUserCreationForm(data['form'])
        if form.is_valid():
            print("formView: Form is valid")
            return JsonResponse("formView: Form is valid", safe=False)
        else:
            print("FORM VIEW: the received form was not valid.")
            print(f"FORM ERRORS: {form.errors}")
            form = CustomeUserCreationForm(data['form'])
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    else:
        return HttpResponse("Something went wrong!")

    return render(request, "store/checkout.html", {'form':form})


def detail_view(request, product_id):
    data = cartData(request)
    cartItems = data['cartItems']
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        product = None

    context = {'product': product, 'cartItems': cartItems}
    return render(request, 'store/view.html', context)


@csrf_exempt
def updateItem_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        productId = data['productId']
        action = data['action']
        print("Data received:", data)
        data2 = cartData(request)
        items = data2['items']

        customer = request.user.customer    
        product = Product.objects.get(id=productId)
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
        order_item, created= OrderItem.objects.get_or_create(order=order, product=product)

        if action == "add":
            print("ADD ACTION")
            order_item.quantity += 1
            print(order_item.quantity)

        elif action == "remove":
            print("REMOVE ACTION")
            order_item.quantity -= 1
            print(order_item.quantity)

        order_item.save()

        if order_item.quantity <= 0:
            order_item.quantity =0
            order_item.delete()
        
        total_items = order.get_cart_items
        total_price = order.get_cart_total
        sub_total = order_item.get_total
        item_quantity = order_item.quantity

        return JsonResponse({
            "status":"success",
            "productId":productId,
            "action":action,
            'total_items':total_items,
            'total_price':total_price,
            'sub_total':sub_total,
            'item_quantity':item_quantity,
        })
        
    else:
        return("The request was not an AJAX request")


def processOrder_view(request):
    transaction_id = datetime.datetime.now().timestamp()
    data = json.loads(request.body)
    print("Request method: ", request.method)
    print("Request body: ", request.body)

    if request.user.is_authenticated:
        customer = request.user.customer
        order, created = Order.objects.get_or_create(
            customer=customer, complete=False)

    elif not request.user.is_authenticated:
        customer, order = guestOrder(request, data)

    else:
        order.complete = False
        return HttpResponse("Something went wrong.")

    if order.complete:
        return JsonResponse({'status': 'error', 'errors': 'Order was already processed.'}, status=400)

    total = float(data['form']['total'])
    order.transaction_id = transaction_id
    if total == order.get_cart_total:
        order.complete = True
    order.save()

    if order.shipping == True:
        ShippingAddress.objects.create(
            customer=customer,
            order=order,
            address=data['shipping']['address'],
            city=data['shipping']['city'],
            state=data['shipping']['state'],
        )
    return JsonResponse('Payment submitted..', safe=False,)