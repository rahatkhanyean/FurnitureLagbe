// OPEN & CLOSE CART
const cartIcon = document.querySelector("#cart-icon");
const cart = document.querySelector(".cart");
const closeCart = document.querySelector("#cart-close");

cartIcon.addEventListener("click", () => {
  cart.classList.add("active");
});

closeCart.addEventListener("click", () => {
  cart.classList.remove("active");
});

// Start when the document is ready
document.addEventListener("DOMContentLoaded", start);

// =============== START ====================
function start() {
  addEvents();
}

// ============= UPDATE & RERENDER ===========
function update() {
  addEvents();
  updateTotal();
}

// =============== ADD EVENTS ===============
function addEvents() {
  // Remove items from cart
  document.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", handle_removeCartItem);
  });

  // Change item quantity
  document.querySelectorAll(".cart-quantity").forEach((input) => {
    input.addEventListener("change", handle_changeItemQuantity);
  });

  // Add item to cart
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", handle_addCartItem);
  });

  // Buy Order
  const buy_btn = document.querySelector(".btn-buy");
  buy_btn.addEventListener("click", handle_buyOrder);
}

// ============= HANDLE EVENTS FUNCTIONS =============
let itemsAdded = [];

function handle_addCartItem() {
  const product = this.parentElement;
  const title = product.querySelector(".product-title").innerHTML;
  const price = product.querySelector(".product-price").innerHTML;
  const imgSrc = product.querySelector(".product-img").src;

  const newToAdd = {
    title,
    price,
    imgSrc,
  };

  // handle item is already exist
  if (itemsAdded.some((el) => el.title === newToAdd.title)) {
    alert("This Item Is Already Exist!");
    return;
  } else {
    itemsAdded.push(newToAdd);
  }

  // Add product to cart
  const cartBoxElement = CartBoxComponent(title, price, imgSrc);
  const newNode = document.createElement("div");
  newNode.innerHTML = cartBoxElement;
  const cartContent = cart.querySelector(".cart-content");
  cartContent.appendChild(newNode);

  update();
}

function handle_removeCartItem() {
  this.parentElement.remove();
  itemsAdded = itemsAdded.filter(
    (el) =>
      el.title !==
      this.parentElement.querySelector(".cart-product-title").innerHTML
  );

  update();
}

function handle_changeItemQuantity() {
  if (isNaN(this.value) || this.value < 1) {
    this.value = 1;
  }
  this.value = Math.floor(this.value); // to keep it integer

  update();
}

function handle_buyOrder() {
  if (itemsAdded.length <= 0) {
    alert("There is No Order to Place Yet! \nPlease Make an Order first.");
    return;
  }
  const cartContent = cart.querySelector(".cart-content");
  cartContent.innerHTML = "";
  alert("Your Order is Placed Successfully :)");
  itemsAdded = [];

  update();
}

// =========== UPDATE & RERENDER FUNCTIONS =========
function updateTotal() {
  const cartBoxes = document.querySelectorAll(".cart-box");
  const totalElement = cart.querySelector(".total-price");
  let total = 0;

  cartBoxes.forEach((cartBox) => {
    const priceElement = cartBox.querySelector(".cart-price");
    const price = parseFloat(priceElement.innerHTML.replace("$", ""));
    const quantity = cartBox.querySelector(".cart-quantity").value;
    total += price * quantity;
  });

  // keep 2 digits after the decimal point
  total = total.toFixed(2);

  totalElement.innerHTML = "$" + total;
}

// ============= HTML COMPONENTS =============
function CartBoxComponent(title, price, imgSrc) {
  return `
    <div class="cart-box">
        <img src=${imgSrc} alt="" class="cart-img">
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <input type="number" value="1" class="cart-quantity">
        </div>
        <!-- REMOVE CART  -->
        <i class='bx bxs-trash-alt cart-remove'></i>
    </div>`;
}

// Your existing filtering and sorting logic
// ... (No changes made to this part)

//Search Bar
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const productBoxes = document.querySelectorAll(".product-box");

  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();

    productBoxes.forEach((box) => {
      const productName = box.querySelector(".product-title").textContent.toLowerCase();
      const displayStyle = productName.includes(searchTerm) ? "block" : "none";

      box.style.display = displayStyle;
    });
  }

  searchInput.addEventListener("input", filterProducts);
  searchButton.addEventListener("click", filterProducts);
});


document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productBoxes = document.querySelectorAll('.product-box');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category').toLowerCase();

      // Toggle the "active" class for filter buttons
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');

      // Show all product boxes for the "All" filter
      if (category === 'all') {
        productBoxes.forEach(box => {
          box.style.display = 'block';
        });
      } else {
        // Hide all product boxes
        productBoxes.forEach(box => {
          box.style.display = 'none';
        });

        // Show only the product boxes with the selected category
        const filteredBoxes = document.querySelectorAll(`.product-box[data-category*="${category}"]`);
        filteredBoxes.forEach(box => {
          box.style.display = 'block';
        });
      }
    });
  });
});


document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const sortButtons = document.querySelectorAll('.sort-btn');
  const productBoxes = document.querySelectorAll('.product-box');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Handle category filtering
      const category = button.getAttribute('data-category').toLowerCase();

      filterProducts(category);
    });
  });

  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Handle sorting
      const sortType = button.getAttribute('data-sort');

      sortProducts(sortType);
    });
  });

  function filterProducts(category) {
    // Your existing filtering logic here

    // Example: Display only the product boxes with the selected category
    if (category === 'all') {
      productBoxes.forEach(box => {
        box.style.display = 'block';
      });
    } else {
      productBoxes.forEach(box => {
        const boxCategories = box.getAttribute('data-category').split(' ');
        box.style.display = boxCategories.includes(category) ? 'block' : 'none';
      });
    }
  }

  function sortProducts(sortType) {
    // Your sorting logic here

    // Example: Sort product boxes based on price
    const sortedBoxes = Array.from(productBoxes).sort((a, b) => {
      const priceA = parseFloat(a.querySelector('.product-price').textContent.slice(1));
      const priceB = parseFloat(b.querySelector('.product-price').textContent.slice(1));

      if (sortType === 'lowToHigh') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    // Update the order of product boxes in the DOM
    const shopContent = document.querySelector('.shop-content');
    shopContent.innerHTML = ''; // Clear existing content

    sortedBoxes.forEach(box => {
      shopContent.appendChild(box);
    });
  }
});

// Search Bar
document.addEventListener('DOMContentLoaded', function () {
  // Selectors
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const productBoxes = document.querySelectorAll('.product-box');

  // Function to filter products based on search term
  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();

    productBoxes.forEach(box => {
      const productName = box.querySelector('.product-title').textContent.toLowerCase();
      const displayStyle = productName.includes(searchTerm) ? 'block' : 'none';

      box.style.display = displayStyle;
    });
  }

  // Event listeners
  searchInput.addEventListener('input', filterProducts);
  searchButton.addEventListener('click', filterProducts);
});