import json
from .models import *
from .forms import CustomeUserCreationForm
from django.http import JsonResponse
from django.shortcuts import render, HttpResponse



def cookieCart(request):

	# Create empty cart for now for non-logged in user
	try:
		cart = json.loads(request.COOKIES['cart'])
	except:
		cart = {}
		print('CART:', cart)

	items = []
	order = {'get_cart_total': 0, 'get_cart_items': 0, 'shipping': False}
	cartItems = order['get_cart_items']

	for i in cart:
		# We use try block to prevent items in cart that may have been removed from causing error
		try:
			cartItems += cart[i]['quantity']

			product = Product.objects.get(id=i)
			total = (product.price * cart[i]['quantity'])

			order['get_cart_total'] += total
			order['get_cart_items'] += cart[i]['quantity']

			item = {
				'id': product.id,
				'product': {
					'id': product.id,
					'name': product.name,
					'price': product.price,
				        'imageURL': product.imageURL
					},
				'quantity': cart[i]['quantity'],
				'digital': product.digital,
				'get_total': total,
				}
			items.append(item)

			if product.digital == False:
				order['shipping'] = True
		except:
			pass

	return {'cartItems': cartItems, 'order': order, 'items': items}


def cartData(request):
	if request.user.is_authenticated:
		customer = request.user.customer
		order, created = Order.objects.get_or_create(customer=customer, complete=False)
		items = order.orderitem_set.all()
		cartItems = order.get_cart_items
	else:
		cookieData = cookieCart(request)
		cartItems = cookieData['cartItems']
		order = cookieData['order']
		items = cookieData['items']

	return {'cartItems':cartItems ,'order':order, 'items':items}
	
def guestOrder(request, data):
	name = data['form']['name']

	cookieData = cookieCart(request)
	items = cookieData['items']
	
	if request.method == "POST":
		form = CustomeUserCreationForm(data['form'])
		if form.is_valid():
			user = form.save()
			customer = Customer.objects.create(
					user=user, email=user.email, name=name
					)
			customer.save()
		else:
			print("Form is not valid")
			form = CustomeUserCreationForm(data['form'])
			print(f"Form ERROR:{form.errors}")
			return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
	else:
		return HttpResponse("Something went wrong ! ")
	
	order = Order.objects.create(
		customer=customer,
		complete=False,
		)
	
	for item in items:
		product = Product.objects.get(id=item['id'])
		orderItem = OrderItem.objects.create(
			product=product,
			order=order,
			quantity=item['quantity'],
		)
	print(f"Customer:{customer}")
	print(f"order:{order}")
	return (customer, order)