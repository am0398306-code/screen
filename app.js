// رابط الشيت المربوط بـ ID الشيت بتاعك مباشرة
const sheetURL = "https://opensheet.elk.sh/1x5OlVGAPl6XHnnGhwPluUcp0FQSRr3ydMbJWzmQyapo/Sheet1";

let allProducts = [];
let currentCategory = "";

// 1. تشغيل شاشة الترحيب مع الـ Delay
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const intro = document.getElementById("introScreen");
    const main = document.getElementById("mainApp");
    if (intro) intro.classList.add("hidden");
    if (main) main.classList.remove("hidden");
  }, 3000);
});

// 2. فتح القسم وأنيميشن الزوم
function openCategory(catType, element) {
  currentCategory = catType;
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    if (card === element) {
      card.classList.add("zoom-in");
    } else {
      card.classList.add("fade-out");
    }
  });

  setTimeout(() => {
    document.getElementById("categoriesContainer").classList.add("hidden");
    document.getElementById("productsView").classList.remove("hidden");

    const title = document.getElementById("categoryTitle");
    const searchInput = document.getElementById("searchInput");

    if (catType === "screens") {
      title.innerText = "قسم الشاشات 📱";
      searchInput.placeholder = "ابحث باسم الشاشة...";
    } else if (catType === "glass") {
      title.innerText = "قسم الباغات 🛡️";
      searchInput.placeholder = "ابحث باسم الباغة...";
    } else if (catType === "batteries") {
      title.innerText = "قسم البطاريات 🔋";
      searchInput.placeholder = "ابحث بالكود الخاص بالبطارية...";
    }

    fetchDataAndRender();
  }, 600);
}

// 3. العودة للأقسام
function closeCategory() {
  document.getElementById("productsView").classList.add("hidden");
  document.getElementById("categoriesContainer").classList.remove("hidden");

  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.classList.remove("zoom-in", "fade-out");
  });

  document.getElementById("searchInput").value = "";
}

// 4. سحب البيانات من Google Sheets ومعالجة المسميات
async function fetchDataAndRender() {
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  try {
    let res = await fetch(sheetURL);
    
    // تجربة اسم الورقة بالعربي لو Sheet1 ما ردتش بيانات
    if (!res.ok) {
      const arabicURL = "https://opensheet.elk.sh/1x5OlVGAPl6XHnnGhwPluUcp0FQSRr3ydMbJWzmQyapo/ورقة1";
      res = await fetch(arabicURL);
    }

    const data = await res.json();
    
    // توحيد مفاتيح الأعمدة لتفادي أخطاء الحروف
    allProducts = data.map(row => {
      let newRow = {};
      for (let key in row) {
        newRow[key.trim().toLowerCase()] = row[key];
      }
      return newRow;
    });

  } catch (err) {
    console.error("خطأ في الاتصال بالشيت:", err);
  }

  loading.classList.add("hidden");
  filterProducts();
}

// 5. الفلترة المَرِنة والبحث وعرض البوكسات
function filterProducts() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const list = document.getElementById("productsList");
  list.innerHTML = "";

  // فلترة حسب القسم
  let categoryFiltered = allProducts.filter(item => {
    const cat = (item.category || item.قسم || "").toString().trim().toLowerCase();
    
    if (currentCategory === "screens") return cat.includes("شاش");
    if (currentCategory === "glass") return cat.includes("باغ");
    if (currentCategory === "batteries") return cat.includes("بطار");
    return false;
  });

  // فلترة حسب البحث
  let finalResults = categoryFiltered.filter(item => {
    if (!query) return true;

    const name = (item.name || item.اسم || "").toString().toLowerCase();
    const code = (item.code || item.كود || "").toString().toLowerCase();

    if (currentCategory === "batteries") {
      return code.includes(query);
    } else {
      return name.includes(query);
    }
  });

  if (finalResults.length === 0) {
    list.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#64748b; margin-top:20px;">لا توجد نتائج مطابقة</p>`;
    return;
  }

  // عرض المنتجات على شكل بوكسات
  finalResults.forEach(item => {
    const name = item.name || item.اسم || "بدون اسم";
    const qty = parseInt(item.quantity || item.كمية || 0);
    const code = item.code || item.كود || "";
    const status = item.status || item.حالة || "";
    const img = item.image || item.صورة || "";

    const isAvailable = qty > 0;
    const imageSrc = img ? img : 'https://via.placeholder.com/80?text=No+Img';

    // الكود يظهر في البطاريات فقط
    const codeHTML = (currentCategory === "batteries" && code) 
      ? `<p>الكود: ${code}</p>` 
      : '';

    // الحالة تظهر في الشاشات فقط
    const statusHTML = (currentCategory === "screens" && status)
      ? `<p style="color:#38bdf8; font-size:0.8rem;">الحالة: ${status}</p>`
      : '';

    list.innerHTML += `
      <div class="product-item">
        <img src="${imageSrc}" alt="${name}" class="prod-img" onerror="this.src='https://via.placeholder.com/80?text=No+Img'">
        <div class="product-info">
          <h4>${name}</h4>
          ${statusHTML}
          ${codeHTML}
        </div>
        <div class="qty-badge ${!isAvailable ? 'empty' : ''}">
          ${isAvailable ? qty + ' قطعة' : 'غير متوفر'}
        </div>
      </div>
    `;
  });
}