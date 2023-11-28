const firebaseConfig = {
  apiKey: "AIzaSyBvKAzG2v82rCflL9qLhJIUdk6-0YdFdhY",
  authDomain: "mydb-4bbe1.firebaseapp.com",
  databaseURL: "https://mydb-4bbe1-default-rtdb.firebaseio.com",
  projectId: "mydb-4bbe1",
  storageBucket: "mydb-4bbe1.appspot.com",
  messagingSenderId: "529760354637",
  appId: "1:529760354637:web:ed8f222f9d624b83753704",
  measurementId: "G-8TYMQ08GVY"
};

firebase.initializeApp(firebaseConfig);

var productsCollection = firebase.database().ref("list_product");
var productsSnapshot;
var cartProducts = [];

productsCollection.once("value").then(function(snapshot) {
  productsSnapshot = snapshot;
  const productsContainer = document.getElementById('products-container');

  snapshot.forEach(function(childSnapshot) {
    const product = childSnapshot.val();
    const productCard = document.createElement('div');
    productCard.className = 'col-md-4';

    const formattedHarga = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0 }).format(product.harga);
    productCard.innerHTML = `
      <div class="card shadow">
        <img src="${product.imageurl}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title mb-1 text-uppercase">${product.name}</h5>
          <p class="card-text mt-1"><b>${formattedHarga}/${product.satuan}</b></p>
          <p class="card-text">${product.deskripsi}</p>
        
          <input type="number" id="quantity-${childSnapshot.key}" class="form-control d-block text-center" placeholder="Jumlah/${product.satuan}">
      
      <button onclick="addToCart('${childSnapshot.key}')" class="btn btn-cart text-center mt-1 w-100">Add to Cart</button>
      
        </div>
      </div>
    `;
    productsContainer.appendChild(productCard);
  });
});

if (localStorage.getItem('cartProducts')) {
  cartProducts = JSON.parse(localStorage.getItem('cartProducts'));
  updateCartView();
}

// Fungsi untuk menyimpan cartProducts ke localStorage
function saveCartToLocalStorage() {
  localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}


function addToCart(productId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  const quantity = parseInt(quantityInput.value);

  if (!isNaN(quantity) && quantity > 0) {
    const indeksProdukAda = cartProducts.findIndex(product => product.id === productId);

    if (indeksProdukAda !== -1) {
      // Produk sudah ada di keranjang, perbarui kuantitas
      cartProducts[indeksProdukAda].quantity += quantity;
    } else {
      // Produk belum ada di keranjang, tambahkan entri baru
      const dataProduk = productsSnapshot.child(productId).val();
      const produkDitambahkan = {
        id: productId,
        name: dataProduk.name,
        harga: dataProduk.harga,
        des: dataProduk.deskripsi,
        satuan: dataProduk.satuan,
        imageurl: dataProduk.imageurl,
        quantity: quantity,
      };
      cartProducts.push(produkDitambahkan);
    }

    updateCartView();
      saveCartToLocalStorage();

    // Set nilai input kembali ke nilai awal (biasanya nol)
    quantityInput.value = 0;
  } else {
    alert('Silakan masukkan jumlah yang valid.');
  }
}

function updateCartView() {
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = ''; // Hapus konten sebelumnya

    cartProducts.forEach(function (product) {
        const cartItem = document.createElement('li');
        cartItem.className = 'list-group-item';
        cartItem.innerHTML = `<span>${product.quantity} ${product.satuan}- ${product.name}</span>
        <button onclick="removeFromCart('${product.id}')" class="btn btn-danger btn-sm float-right">Hapus</button>`;
        cartList.appendChild(cartItem);
    });
}

// Fungsi untuk menghapus produk dari keranjang
function removeFromCart(productId) {
    // Temukan indeks produk yang akan dihapus dari keranjang
    const indexToRemove = cartProducts.findIndex(product => product.id === productId);

    // Hapus produk dari keranjang
    if (indexToRemove !== -1) {
        cartProducts.splice(indexToRemove, 1);

        // Update tampilan keranjang setelah penghapusan
        updateCartView();
        saveCartToLocalStorage();
    }
}

function pesanBarang() {
  const cartItems = Array.from(document.querySelectorAll('#cart-list li'));

  if (cartItems.length > 0) {
    const arrbulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const date = new Date();
    const waktu = `${date.getDate()}-${arrbulan[date.getMonth()]}-${date.getFullYear()}`;
    const nomorWhatsApp = '62882005619735';
    const hed = '\nQty - Nama Barang\n==================\n';
    
    const pesan = `----~~~--- ABM ---~~~----\nTanggal: ${waktu}\nPesanan Hari Ini:\n•••••••••©2023••••••••••${hed}`;
    const tag = '\n\n#BelanjaMudahDiDepanRumah';
    const detailPesanan = cartItems.map(item => item.querySelector('span').textContent).join('\n');
    const waLink = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(pesan + detailPesanan + tag)}`;
    window.open(waLink, '_blank');

    // Hapus cookie setelah pesanan dibuat
    deleteCookie('cartCookie');
  } else {
    alert('Keranjang belanja kosong. Tambahkan barang terlebih dahulu.');
  }
}

// Fungsi untuk menghapus cookie
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
