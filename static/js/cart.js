document.addEventListener("DOMContentLoaded", (event) => {
  // Your code here
  let addButtons = document.querySelectorAll(".update-cart");
  addButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      let productId = this.getAttribute("data-product");
      let action = this.getAttribute("data-action");
      if (user === "AnonymousUser") {
        updateCartDisplay();
        addCookieItem(productId, action);
      } else {
        updateUserOrder(productId, action);
      }
    });
  });
  function updateUserOrder(productId, action) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/update_item/");
    xhr.setRequestHeader("Content-Type", "application/json");
    var csrftoken = getCookie("csrftoken"); // Assuming you have a function to get the CSRF token from the cookie
    xhr.setRequestHeader("X-CSRFTOKEN", csrftoken);
    var data = JSON.stringify({ productId: productId, action: action });
    xhr.onload = function () {
      if (xhr.status == 200) {
        console.log("SUCCESS");
        console.log("USER is:", user);
        var response = JSON.parse(this.responseText);
        console.log("Response is:", response);
        try {
          document.getElementById("totalitem").textContent =
            response.total_items;
          document.getElementById("totalitem2").textContent =
            response.total_items;
          document.getElementById("totalprice").textContent =
            "$" + parseFloat(response.total_price).toFixed(2);
          document.getElementById("subtotal_" + productId).textContent =
            "$" + parseFloat(response.sub_total).toFixed(2);
          document.getElementById("itemquantity_" + productId).textContent =
            response.item_quantity;
        } catch (error) {
          document.getElementById("totalitem").textContent =
            response.total_items;
        }
      } else {
        console.error("REQUEST FAILED. Reason:", +xhr.status);
      }
    };
    xhr.send(data);
  }

  function addCookieItem(productId, action) {
    console.log("Not logged in...");

    if (action === "add") {
      if (cart[productId] === undefined) {
        cart[productId] = { quantity: 1 };
      } else {
        cart[productId]["quantity"] += 1;
      }
    }

    if (action === "remove") {
      if (cart[productId] !== undefined) {
        cart[productId]["quantity"] -= 1;
      }
    }

    document.cookie = "cart=" + JSON.stringify(cart) + ";domain=;path=/";

    // Update cart count display without reloading the page
    updateCartDisplay();
  }
  function updateCartDisplay() {
    let totalItems = 0;
    let totalPrice = 0;
    //Loop
    for (let productId in cart) {
      totalItems += cart[productId]["quantity"];
      item_quantity = parseFloat(cart[productId]["quantity"]);

      console.log("quantity:", item_quantity);

      try {
        if (item_quantity <= 0) {
          document.getElementById("itemquantity_" + productId).innerHTML =
            item_quantity;
          priceString = document.getElementById(
            "productPrice_" + productId
          ).textContent;
          priceNumber = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));

          //Subtotal
          subTotal = item_quantity * priceNumber;
          document.getElementById("subtotal_" + productId).textContent =
            "$" + parseFloat(subTotal).toFixed(2);

          delete cart[productId];
          document.cookie = "cart=" + JSON.stringify(cart) + ";domain=;path=/";
          continue;
        }
        document.getElementById("itemquantity_" + productId).innerHTML =
          item_quantity;

        //Price
        priceString = document.getElementById(
          "productPrice_" + productId
        ).textContent;
        priceNumber = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));

        //Subtotal
        subTotal = item_quantity * priceNumber;
        document.getElementById("subtotal_" + productId).textContent =
          "$" + parseFloat(subTotal).toFixed(2);

        //TotalPrice
        totalPrice += subTotal;
        document.getElementById("totalprice").textContent =
          "$" + parseFloat(totalPrice).toFixed(2);
      } catch (error) {
        document.getElementById("totalitem").textContent = totalItems;
      }
    }
    //Loop ended

    try {
      document.getElementById("totalitem").textContent = totalItems;
      document.getElementById("totalitem2").textContent = totalItems;
    } catch (error) {
      document.getElementById("totalitem").textContent = totalItems;
    }
  }
});
