const client = contentful.createClient({
  space: "51j86xw4x46q",
  environment: "master", // defaults to 'master' if not set
  accessToken: "fVAYaxo53uL_JvW2n0aBTFWL1IAPDazK-1JhpxU5YzQ",
});
// console.log(client);

// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart item
let cart = [];

// buttons
let buttonsDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries("comfyHouseProduct");
      let result = await fetch("products.json");
      let data = await result.json();
      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<!-- Single Product -->
            <article class="product">
              <div class="img-container">
                <img
                  src=${product.image}
                  alt="product"
                  class="product-img"
                />
                <button class="bag-btn" data-id=${product.id}>
                  <i class="fas fa-shopping-cart"></i> Add to cart
                </button>
              </div>
              <h3>${product.title}</h3>
              <h4>$${product.price}</h4>
            </article>
            <!-- End of Single Product -->`;
    });
    productsDOM.innerHTML = result;
  }

  getBagBtn() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    // console.log(buttons);
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      //   console.log(id);
      let inCart = cart.find((item) => {
        return item.id === id;
      });
      if (inCart) {
        button.innerHTML = `<i class="fas fa-check"></i> In cart`;
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerHTML = `<i class="fas fa-check"></i> In cart`;
        event.target.disabled = true;

        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // console.log(cartItem);

        // add product to the cart
        cart = [...cart, cartItem];
        // console.log(cart);

        // save cart in local storage
        Storage.setCart(cart);

        // set cart values
        this.setCartValues(cart);

        // display cart items
        this.addCartItems(cartItem);

        // show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    // console.log(cartTotal, cartItems);
  }

  addCartItems(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<!-- Cart Item -->
    <img src=${item.image} alt="product" />

    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>

    <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    <!-- End of Cart Item -->`;
    cartContent.appendChild(div);
    // console.log(cartContent);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItems(item);
    });
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        cartContent.removeChild(e.target.parentElement.parentElement);
        this.removeItem(e.target.dataset.id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let id = e.target.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.setCart(cart);
        this.setCartValues(cart);
        e.target.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let id = e.target.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.setCart(cart);
          this.setCartValues(cart);
          e.target.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(e.target.parentElement.parentElement);
          this.removeItem(e.target.dataset.id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((items) => items.id);
    // console.log(cartItems);
    cartItems.forEach((item) => {
      return this.removeItem(item);
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.lastChild);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => {
      return item.id !== id;
    });
    this.setCartValues(cart);
    Storage.setCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> Add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => {
      return button.dataset.id === id;
    });
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => {
      return product.id === id;
    });
  }
  static setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const product = new Products();
  ui.setupApp();

  // get all products
  product
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagBtn();
      ui.cartLogic();
    });
});
