const items = document.querySelectorAll(".item");
const coinsEl = document.querySelector(".coin-text");
const coins = parseInt(coinsEl.textContent);

const purchase = async (price) => {
  coinsEl.textContent = coins - price;

  const data = {
    price: price,
  };

  const raw = await fetch("http://localhost:3000/purchase", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

items.forEach((item) => {
  const purchaseBtn = item.querySelector(".purchase-btn");
  const price = parseInt(item.querySelector(".item-price__val").textContent);
  purchaseBtn.addEventListener("click", async () => {
    if (price > coins) {
      coinsEl.classList.add("flicker");
      setTimeout(() => {
        coinsEl.classList.remove("flicker");
      }, 1000);
      return;
    }

    purchase(price);
  });
});
