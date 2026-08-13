// 初始化預設資料（若本機無資料時自動寫入示範商品）
let products = JSON.parse(localStorage.getItem('mubear_products')) || [
    { id: 1, name: '客製壓克力飯友', category: '客製訂製', price: 350, stock: 99, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500', desc: '雙面夾層壓克力，附彩色珠鍊。製作時間約 14-20 個工作天。' },
    { id: 2, name: '撿漏｜客製飯友 (展示品)', category: '撿漏區', price: 300, stock: 1, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500', desc: '拍攝展示品，僅此一個，售完不補！' },
    { id: 3, name: 'Q版頭貼繪圖委託', category: '繪圖委託', price: 600, stock: 5, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500', desc: '精緻大頭貼委託，可提供角色設定。' }
];

let cart = JSON.parse(localStorage.getItem('mubear_cart')) || [];

// 切換頁面分頁
function switchTab(tabName) {
    document.getElementById('tab-home').classList.add('hidden');
    document.getElementById('tab-detail').classList.add('hidden');
    document.getElementById('tab-cart').classList.add('hidden');
    document.getElementById('tab-success').classList.add('hidden');

    if (tabName === 'home') {
        document.getElementById('tab-home').classList.remove('hidden');
        renderHomeProducts();
    } else if (tabName === 'cart') {
        document.getElementById('tab-cart').classList.remove('hidden');
        renderCart();
    } else if (tabName === 'success') {
        document.getElementById('tab-success').classList.remove('hidden');
    }
    window.scrollTo(0, 0);
}

// 渲染首頁商品
function renderHomeProducts(filter = '全部') {
    const listEl = document.getElementById('product-list');
    const clearanceEl = document.getElementById('clearance-list');
    
    // 篩選撿漏區專用
    const clearanceItems = products.filter(p => p.category === '撿漏區');
    if (clearanceEl) {
        clearanceEl.innerHTML = clearanceItems.map(p => `
            <div onclick="showDetail(${p.id})" class="bg-white rounded-2xl p-3 border border-amber-200 shadow-sm cursor-pointer hover:shadow transition">
                <img src="${p.image}" class="w-full h-28 object-cover rounded-xl mb-2">
                <div class="text-xs text-red-500 font-bold">剩餘 ${p.stock} 件</div>
                <div class="font-medium text-sm truncate">${p.name}</div>
                <div class="text-warmprimary font-bold text-sm">NT$${p.price}</div>
            </div>
        `).join('') || '<div class="text-xs text-gray-400 col-span-2">目前沒有撿漏商品</div>';
    }

    // 主商品列表
    const filtered = filter === '全部' ? products : products.filter(p => p.category.includes(filter) || filter === '零食雜貨' && (p.category === '零食雜貨'));
    listEl.innerHTML = filtered.map(p => `
        <div onclick="showDetail(${p.id})" class="bg-white rounded-2xl p-3 border border-warmprimary/10 shadow-sm cursor-pointer hover:shadow transition flex flex-col justify-between">
            <div>
                <img src="${p.image}" class="w-full h-36 object-cover rounded-xl mb-2">
                <div class="text-[10px] bg-warmbg px-2 py-0.5 rounded-full inline-block text-warmtext mb-1">${p.category}</div>
                <div class="font-medium text-sm line-clamp-1">${p.name}</div>
            </div>
            <div class="mt-2 flex justify-between items-center">
                <span class="text-warmprimary font-bold text-sm">NT$${p.price}</span>
                <span class="text-xs bg-warmprimary/10 text-warmprimary px-2 py-1 rounded-lg">查看</span>
            </div>
        </div>
    `).join('');
}

function filterCategory(cat) {
    renderHomeProducts(cat);
}

// 顯示商品詳情
function showDetail(id) {
    const p = products.find(item => item.id === id);
    if (!p) return;

    const detailEl = document.getElementById('product-detail-content');
    const isCustom = p.category === '客製訂製' || p.category === '繪圖委託';

    detailEl.innerHTML = `
        <img src="${p.image}" class="w-full h-64 object-cover rounded-2xl mb-4">
        <div class="text-xs text-warmprimary font-bold mb-1">${p.category}</div>
        <h1 class="text-xl font-bold mb-2">${p.name}</h1>
        <div class="text-xl font-bold text-warmprimary mb-4">NT$${p.price}</div>
        <div class="text-sm text-warmtext/80 whitespace-pre-line bg-warmbg p-4 rounded-xl mb-4">${p.desc}</div>
        
        ${isCustom ? `
            <div class="space-y-3 mb-4 border-t pt-4">
                <label class="block text-xs font-bold text-warmtext">上傳參考圖片 (手機可直接拍照或選取)</label>
                <input type="file" id="custom-file" accept="image/*" class="w-full text-xs p-2 bg-warmbg rounded-xl border">
                
                <label class="block text-xs font-bold text-warmtext">客製需求 / 備註 (例如角色、服裝、特殊要求)</label>
                <textarea id="custom-note" placeholder="請輸入您的客製需求..." rows="3" class="w-full p-3 rounded-xl border text-sm bg-warmbg"></textarea>
            </div>
        ` : ''}

        <div class="flex items-center gap-3 mb-4">
            <span class="text-sm font-medium">數量：</span>
            <input type="number" id="buy-qty" value="1" min="1" max="${p.stock}" class="w-20 p-2 text-center rounded-xl border bg-warmbg">
        </div>

        <button onclick="addToCart(${p.id})" class="w-full bg-warmprimary hover:bg-warmhover text-white py-3 rounded-2xl font-bold shadow-md transition">
            🛒 加入購物車
        </button>
    `;

    document.getElementById('tab-home').classList.add('hidden');
    document.getElementById('tab-detail').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// 加入購物車
function addToCart(id) {
    const p = products.find(item => item.id === id);
    const qty = parseInt(document.getElementById('buy-qty').value) || 1;
    let customNote = document.getElementById('custom-note') ? document.getElementById('custom-note').value : '';
    
    cart.push({ ...p, qty, customNote });
    localStorage.setItem('mubear_cart', JSON.stringify(cart));
    updateCartBadge();
    alert('✨ 已成功加入購物車！');
    switchTab('cart');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (cart.length > 0) {
        badge.innerText = cart.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// 渲染購物車
function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">購物車目前是空的唷～</div>`;
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        total += item.price * item.qty;
        return `
            <div class="flex justify-between items-center border-b pb-3">
                <div>
                    <div class="font-medium text-sm">${item.name}</div>
                    <div class="text-xs text-warmprimary font-bold">NT$${item.price} × ${item.qty}</div>
                    ${item.customNote ? `<div class="text-[11px] text-gray-500 bg-warmbg p-1 rounded mt-1">需求：${item.customNote}</div>` : ''}
                </div>
                <button onclick="removeFromCart(${index})" class="text-xs text-red-400 p-2">刪除</button>
            </div>
        `;
    }).join('') + `
        <div class="flex justify-between items-center pt-2 font-bold text-base">
            <span>總金額：</span>
            <span class="text-warmprimary">NT$${total}</span>
        </div>
    `;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('mubear_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

// 提交訂單並產生抽獎按鈕
function submitOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return alert('購物車是空的！');

    const orderId = 'MB' + Date.now().toString().slice(-6);
    const buyerData = {
        orderId,
        name: document.getElementById('buyer-name').value,
        phone: document.getElementById('buyer-phone').value,
        region: document.getElementById('buyer-region').value,
        store: document.getElementById('buyer-store').value,
        note: document.getElementById('buyer-note').value,
        items: cart,
        time: new Date().toLocaleString()
    };

    // 儲存至本地訂單紀錄
    let orders = JSON.parse(localStorage.getItem('mubear_orders')) || [];
    orders.push(buyerData);
    localStorage.setItem('mubear_orders', JSON.stringify(orders));

    // 清空購物車
    cart = [];
    localStorage.removeItem('mubear_cart');
    updateCartBadge();

    // 顯示完成頁面與專屬抽獎網址
    document.getElementById('success-order-id').innerText = orderId;
    
    // 設定您的獨立抽獎轉盤網址 (請替換成您自己的抽獎網址)
    const lotteryBaseUrl = 'https://example-lottery-wheel.com'; 
    document.getElementById('lottery-btn').href = `${lotteryBaseUrl}?order=${orderId}`;

    switchTab('success');
}

// 後台管理渲染
function handleAddNewProduct(e) {
    e.preventDefault();
    const newP = {
        id: Date.now(),
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        price: Number(document.getElementById('p-price').value),
        stock: Number(document.getElementById('p-stock').value),
        image: document.getElementById('p-image').value,
        desc: document.getElementById('p-desc').value
    };
    products.push(newP);
    localStorage.setItem('mubear_products', JSON.stringify(products));
    alert('✨ 商品上架成功！');
    document.getElementById('add-product-form').reset();
    renderAdminProducts();
}

function renderAdminProducts() {
    const listEl = document.getElementById('admin-product-list');
    if (!listEl) return;
    listEl.innerHTML = products.map(p => `
        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-sm">
            <div>
                <span class="font-bold">${p.name}</span>
                <span class="text-xs text-gray-500 block">NT$${p.price} | 庫存: ${p.stock} | 分類: ${p.category}</span>
            </div>
            <button onclick="deleteProduct(${p.id})" class="text-red-500 text-xs px-3 py-1 bg-white rounded border shadow-sm">刪除</button>
        </div>
    `).join('');
}

function deleteProduct(id) {
    if (confirm('確定要刪除這個商品嗎？')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('mubear_products', JSON.stringify(products));
        renderAdminProducts();
    }
}

updateCartBadge();
