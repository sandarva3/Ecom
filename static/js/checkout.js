var shipping = "{{order.shipping}}";
var storeUrl = "{% url 'store' %}";
var rawTotal = document.getElementById("rawTotal").textContent;
console.log("raw TOTAL:", rawTotal);
var numericTotal = rawTotal.replace(/[^0-9.]/g, "");
console.log("numeric TOTAL:", numericTotal);
var total = parseFloat(numericTotal);

if (shipping == "False") {
  document.getElementById("shipping-info").innerHTML = "";
}

if (user != "AnonymousUser") {
  document.getElementById("user-info").innerHTML = "";
}
if (shipping == "False" && user != "AnonymousUser") {
  // Hiding the entire form if user is logged in and shipping is false.
  document.getElementById("form-wrapper").classList.add("hidden");
  // Showing the payment option if the logged in user buy items that doesn't require shipping
  document.getElementById("payment-info").classList.remove("hidden");
}

var form = document.getElementById("form");
csrftoken = form.getElementsByTagName("input")[0].value;
console.log("NewToken:", form.getElementsByTagName("input")[0].value);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if(user === "AnonymousUser"){
  console.log("Form submitted..");
  console.log("Anonymous User")
  checkForm();
  }
  else{
  console.log("Form submitted..");
  console.log("User: ",user)
  document.getElementById("form-button").classList.add("hidden");
  document.getElementById("payment-info").classList.remove("hidden");
  }
});

document.getElementById("make-payment").addEventListener("click", function (e) {
  submitFormData();
});

function checkForm() {
  console.log("Continue button clicked.");

  var userFormData = {
    name: null,
    email: null,
    username: null,
    password1: null,
    password2: null,
    total: total,
  };
  if (user == "AnonymousUser") {
    userFormData.email = form.email.value;
    userFormData.username = form.username.value;
    userFormData.password1 = form.password1.value;
    userFormData.password2 = form.password2.value;
  }

  var url = "/formview/";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ form: userFormData }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      try {
        if (data.status === "error") {
          console.log("formView: FORM IS NOT VALID");
          for (const field in data.errors) {
            const errorMsg = data.errors[field].join(" ");
            document.querySelector(`#${field}-error`).textContent = errorMsg;
          }
        } else {
          console.log("Success:", data);
          document.getElementById("form-button").classList.add("hidden");
          document.getElementById("payment-info").classList.remove("hidden");
        }
      } catch (error) {
        console.log("formView: OCCURED: ", error);
        alert("FOrm error occured, please check the console.");
      }
    });
}

function submitFormData() {
  console.log("Payment button clicked.");
  console.log("TOTAL:", total);
  var userFormData = {
    name: null,
    email: null,
    username: null,
    password1: null,
    password2: null,
    total: total,
  };
  var shippingInfo = {
    address: null,
    city: null,
    state: null,
  };

  if (shipping != "False") {
    shippingInfo.address = form.address.value;
    shippingInfo.city = form.city.value;
    shippingInfo.state = form.state.value;
  }

  if (user == "AnonymousUser") {
    userFormData.name = form.name.value;
    userFormData.email = form.email.value;
    userFormData.username = form.username.value;
    userFormData.password1 = form.password1.value;
    userFormData.password2 = form.password2.value;
  }

  var url = "/process_order/";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ form: userFormData, shipping: shippingInfo }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      try {
        if (data.status === "error") {
          console.log(
            "THERE WAS RESPONSE OF ERROR FROM SERVER. FORM IS NOT VALID"
          );
          console.log("The ERROR is: ", data.error);
          alert("THERE WAS ERROR. FORM IS NOT VALID !");
        } else {
          console.log("Success:", data);
          alert("Transaction completed");
          cart = {};
          document.cookie = "cart=" + JSON.stringify(cart) + ";domain=;path=/";
          window.location.href = '/';
        }
      } catch (error) {
        console.log("ERROR OCCURED: ", error);
        alert("An error occured, please check the console.");
      }
    });
}
