
/* ==========================================
   BUY OR WAIT?
   Complete script.js
   Korean / Chinese / English
   Supabase Cloud Storage
========================================== */

const SUPABASE_URL =
  "https://swjypbofbgejuavxwxgo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_CfKI5T8tdDRsi9OywfHqvQ_mLwzaIqh";

const TABLE = "bow_want_items";
const BUCKET = "bow-want-photos";
const STORAGE_KEY = "buy-or-wait-finds-v1";
const LANGUAGE_KEY = "buy-or-wait-language";

const $ = (id) => document.getElementById(id);

let supabaseClient = null;
let currentUser = null;
let cloudReady = false;
let finds = [];
let filter = "all";
let currentLang = "ko";
let busy = false;
let photoPreviewURL = "";

const I18N = {
  ko: {
    announcement: "✿ 구매하기 전에 잠깐 생각해 봐요 ✿",
    navHome: "홈",
    navHow: "이용 방법",
    navFinds: "나의 발견",
    navRoom: "나의 방",
    lead: "너무 귀여워. 갖고 싶어.<br>그런데 <i>정말</i> 필요할까?",
    want: "♡ 갖고 싶어!",
    wishlist: "위시리스트 보기 ↗",
    ticker: "♡ 발견하기 ♡ 저장하기 ♡ 다시 생각하기 ♡ 가진 것 사랑하기",
    stepsKicker: "작은 사용 안내",
    stepsTitle: "지금은 좋아해도, <span>결정은 나중에.</span>",
    stepsDesc: "“너무 귀여워!”에서 “샀어!”까지, 세 가지 작은 단계",
    stepNumber1: "01 / 발견하기",
    stepNumber2: "02 / 기다리기",
    stepNumber3: "03 / 결정하기",
    step1: "마음에 담기",
    step2: "잠깐 기다리기",
    step3: "결정하기",
    stepButton1: "물건 추가하기 ↗",
    stepButton2: "위시리스트 보기 ↗",
    stepButton3: "나의 발견 보기 ↗",
    findsKicker: "♡ 나만의 작은 컬렉션",
    findsTitle: '나의 작은 발견<span class="sparkle">✳</span>',
    findsDesc: "마음에 쏙 들었던 귀여운 것들을 모아 보세요.",
    add: "＋ 물건 추가하기",
    all: "전체",
    waiting: "고민 중",
    bought: "이미 샀어요",
    roomKicker: "나만의 작은 공간",
    roomTitle: "좋아하는 것들을 위한<br><i>나만의 공간.</i>",
    roomDesc: "모아 둔 물건들을 작은 3D 방에서 다시 만나 보세요.",
    roomButton: "나의 방 들어가기 ↗",
    roomSmall: "3D 방은 다음 단계에서 연결할 예정이에요.",
    footer1: "귀여운 것을 좋아하는 친구를 위해 만들었어요.",
    footer2: "작은 물건, 신중한 선택. © 2026",
    drawerKicker: "♡ 잠깐의 기다림",
    drawerTitle: "나의 위시리스트",
    drawerMessage: "오늘은 사진만 저장해도 충분해요. 지금 사지 않아도 괜찮아요 ♡",
    waitingStat: "고민 중",
    boughtStat: "이미 샀어요",
    drawerUpload: "＋ 다른 물건 저장하기",
    drawerClose: "계속 둘러보기",
    uploadKicker: "✿ 새로운 마음에 드는 물건",
    uploadTitle: "갖고 싶어!",
    uploadDesc: "사진을 찍고 저장한 뒤 잠깐 생각해 보세요.",
    photoPrompt: "사진 촬영 또는 업로드",
    photoLimit: "JPG, PNG, WEBP • 최대 5MB",
    nameLabel: "어떤 물건이 마음에 들었나요?",
    priceLabel: "가격 (선택)",
    categoryLabel: "카테고리",
    noteLabel: "짧은 메모 (선택)",
    save: "♡ 위시리스트에 저장하기",
    namePlaceholder: "예: 작은 토끼 키링",
    notePlaceholder: "왜 이 물건이 마음에 들었나요?",
    catPlushies: "인형",
    catKeychains: "키링",
    catStationery: "문구",
    catAccessories: "액세서리",
    catHome: "인테리어 소품",
    catOther: "기타 귀여운 물건",
    statusWaiting: "♡ 고민 중",
    statusBought: "✓ 이미 샀어요",
    markBought: "✓ 구매 완료",
    markWaiting: "↶ 다시 고민하기",
    remove: "삭제",
    emptyTitle: "아직 저장한 물건이 없어요!",
    emptyFiltered: "이 목록에는 아직 물건이 없어요",
    emptyDesc: "귀여운 물건을 발견했다면 사진으로 저장해 보세요.",
    emptyButton: "＋ 첫 발견 저장하기",
    drawerEmpty: "아직 저장한 물건이 없어요.",
    noPrice: "가격 미입력",
    confirmRemove: "이 물건을 삭제할까요?",
    needName: "물건 이름을 입력해 주세요.",
    imageInvalid: "5MB 이하의 JPG, PNG 또는 WEBP 이미지를 선택해 주세요.",
    imageError: "사진을 불러올 수 없어요.",
    saved: "♡ 위시리스트에 저장했어요!",
    removed: "물건을 삭제했어요.",
    markedBought: "구매 완료로 표시했어요.",
    markedWaiting: "다시 고민 중으로 변경했어요.",
    connected: "♡ 클라우드 연결 완료!",
    connectionError: "클라우드 연결 실패",
    saveError: "저장 실패",
    updateError: "수정 실패",
    deleteError: "삭제 실패",
    roomNotice: "♡ 3D 방은 다음 단계에서 연결할 예정이에요!",
    saving: "저장 중..."
  },

  zh: {
    announcement: "✿ 买下喜欢的东西之前，先想一想 ✿",
    navHome: "首页",
    navHow: "使用方法",
    navFinds: "我的发现",
    navRoom: "我的房间",
    lead: "太可爱了，好想拥有。<br>但是<i>真的</i>需要吗？",
    want: "♡ 好想要！",
    wishlist: "查看心愿清单 ↗",
    ticker: "♡ 发现它 ♡ 收藏它 ♡ 再想一想 ♡ 珍惜已拥有的",
    stepsKicker: "小小使用指南",
    stepsTitle: "现在喜欢，<span>以后决定。</span>",
    stepsDesc: "从“好可爱！”到“买下了！”的三个小步骤",
    stepNumber1: "01 / 发现它",
    stepNumber2: "02 / 等一等",
    stepNumber3: "03 / 做决定",
    step1: "记录心动",
    step2: "先等等看",
    step3: "做出选择",
    stepButton1: "添加物品 ↗",
    stepButton2: "查看心愿清单 ↗",
    stepButton3: "我的小发现 ↗",
    findsKicker: "♡ 属于自己的小收藏",
    findsTitle: '我的小发现<span class="sparkle">✳</span>',
    findsDesc: "把让你心动的小东西收藏在这里。",
    add: "＋ 添加物品",
    all: "全部",
    waiting: "考虑中",
    bought: "已购买",
    roomKicker: "属于你的小角落",
    roomTitle: "给喜欢的东西<br><i>一个小房间。</i>",
    roomDesc: "把收藏的物品放进可爱的 3D 房间，重新发现自己拥有的东西。",
    roomButton: "进入我的房间 ↗",
    roomSmall: "3D 房间将在下一步连接。",
    footer1: "为喜欢可爱小东西的朋友而制作。",
    footer2: "小小物品，认真选择。© 2026",
    drawerKicker: "♡ 先收藏，再决定",
    drawerTitle: "我的心愿清单",
    drawerMessage: "今天只保存照片就好，不一定要立刻买下来 ♡",
    waitingStat: "考虑中",
    boughtStat: "已购买",
    drawerUpload: "＋ 再收藏一件",
    drawerClose: "继续逛逛",
    uploadKicker: "✿ 新发现的心动小物",
    uploadTitle: "好想要！",
    uploadDesc: "拍下来、收藏起来，再给自己一点时间考虑。",
    photoPrompt: "拍照或上传照片",
    photoLimit: "JPG、PNG、WEBP • 最大 5MB",
    nameLabel: "你看中了什么？",
    priceLabel: "价格（选填）",
    categoryLabel: "物品分类",
    noteLabel: "小小备注（选填）",
    save: "♡ 保存到心愿清单",
    namePlaceholder: "例如：小兔子钥匙扣",
    notePlaceholder: "为什么喜欢这个小东西？",
    catPlushies: "毛绒玩具",
    catKeychains: "钥匙扣",
    catStationery: "文具",
    catAccessories: "配饰",
    catHome: "家居装饰",
    catOther: "其他可爱小物",
    statusWaiting: "♡ 考虑中",
    statusBought: "✓ 已购买",
    markBought: "↶ 重新考虑",
    markWaiting: "↶ 重新考虑",
    remove: "删除",
    emptyTitle: "这里还没有收藏哦！",
    emptyFiltered: "这个分类暂时没有物品",
    emptyDesc: "看到喜欢的小东西，先拍照收藏，再决定买不买。",
    emptyButton: "＋ 添加第一件物品",
    drawerEmpty: "这里还没有收藏哦！",
    noPrice: "未填写价格",
    confirmRemove: "确定删除这件物品吗？",
    needName: "请先填写物品名称。",
    imageInvalid: "请选择不超过 5MB 的 JPG、PNG 或 WEBP 图片。",
    imageError: "照片读取失败。",
    saved: "♡ 已保存到云端心愿清单！",
    removed: "物品已删除。",
    markedBought: "已标记为购买。",
    markedWaiting: "已改为考虑中。",
    connected: "♡ 云端连接成功！",
    connectionError: "云端连接失败",
    saveError: "保存失败",
    updateError: "修改失败",
    deleteError: "删除失败",
    roomNotice: "♡ 3D 房间将在下一步连接！",
    saving: "正在保存..."
  },

  en: {
    announcement: "✿ A little pause before a little purchase ✿",
    navHome: "HOME",
    navHow: "HOW IT WORKS",
    navFinds: "MY FINDS",
    navRoom: "MY ROOM",
    lead: "It's cute. You love it.<br>But do you <i>really</i> need it?",
    want: "♡ I WANT IT!",
    wishlist: "VIEW MY WISHLIST ↗",
    ticker: "♡ SPOT IT ♡ SAVE IT ♡ THINK TWICE ♡ LOVE WHAT YOU HAVE",
    stepsKicker: "A LITTLE GUIDE",
    stepsTitle: "Love it now. <span>Decide later.</span>",
    stepsDesc: "Three small steps between “so cute!” and “I bought it!”",
    stepNumber1: "01 / SPOT IT",
    stepNumber2: "02 / PAUSE IT",
    stepNumber3: "03 / KEEP IT",
    step1: "Catch the crush",
    step2: "Give it a moment",
    step3: "Choose your ending",
    stepButton1: "ADD A FIND ↗",
    stepButton2: "SEE MY LIST ↗",
    stepButton3: "MY LITTLE FINDS ↗",
    findsKicker: "♡ YOUR VERY OWN COLLECTION",
    findsTitle: 'My little finds<span class="sparkle">✳</span>',
    findsDesc: 'All the things that made you stop and say “aww!”',
    add: "＋ ADD A FIND",
    all: "ALL FINDS",
    waiting: "STILL THINKING",
    bought: "ALREADY MINE",
    roomKicker: "YOUR LITTLE CORNER",
    roomTitle: "A room for<br><i>everything</i> you love.",
    roomDesc: "Your collected finds will eventually live in a tiny interactive 3D room.",
    roomButton: "ENTER MY ROOM ↗",
    roomSmall: "3D room connection coming in the next step.",
    footer1: "Made for a friend who loves all things cute.",
    footer2: "Little things. Thoughtful choices. © 2026",
    drawerKicker: "♡ THE LITTLE PAUSE",
    drawerTitle: "My Wishlist",
    drawerMessage: "A photo is enough for today. You don't have to buy it now ♡",
    waitingStat: "Still thinking",
    boughtStat: "Already mine",
    drawerUpload: "＋ SAVE ANOTHER FIND",
    drawerClose: "CONTINUE EXPLORING",
    uploadKicker: "✿ A NEW LITTLE CRUSH",
    uploadTitle: "I WANT IT!",
    uploadDesc: "Snap it, save it, and give yourself a moment to think.",
    photoPrompt: "Tap to take a photo or upload one",
    photoLimit: "JPG, PNG or WEBP • max 5 MB",
    nameLabel: "WHAT CAUGHT YOUR EYE?",
    priceLabel: "PRICE (OPTIONAL)",
    categoryLabel: "CATEGORY",
    noteLabel: "A LITTLE NOTE (OPTIONAL)",
    save: "♡ SAVE TO WISHLIST",
    namePlaceholder: "e.g. Tiny bunny keychain",
    notePlaceholder: "Why did I fall for it?",
    catPlushies: "Plushies",
    catKeychains: "Keychains",
    catStationery: "Stationery",
    catAccessories: "Accessories",
    catHome: "Home decor",
    catOther: "Other cute things",
    statusWaiting: "♡ Still thinking",
    statusBought: "✓ Already mine",
    markBought: "✓ BOUGHT",
    markWaiting: "↶ WAITING",
    remove: "REMOVE",
    emptyTitle: "Your little collection starts here!",
    emptyFiltered: "Nothing in this section yet",
    emptyDesc: "Spot something cute? Save a photo before you buy it.",
    emptyButton: "＋ ADD MY FIRST FIND",
    drawerEmpty: "Nothing here yet. Save your first cute find!",
    noPrice: "Price not added",
    confirmRemove: "Remove this find?",
    needName: "Give your find a name first.",
    imageInvalid: "Choose a JPG, PNG or WEBP image under 5 MB.",
    imageError: "Could not read this photo.",
    saved: "♡ Saved to your cloud wishlist!",
    removed: "Find removed.",
    markedBought: "Marked as bought.",
    markedWaiting: "Moved back to waiting.",
    connected: "♡ Your collection is connected!",
    connectionError: "Cloud connection failed",
    saveError: "Could not save",
    updateError: "Update failed",
    deleteError: "Delete failed",
    roomNotice: "♡ Your 3D room will be connected in the next step!",
    saving: "Saving..."
  }
};

const CATEGORY_KEYS = {
  "Plushies": "catPlushies",
  "Keychains": "catKeychains",
  "Stationery": "catStationery",
  "Accessories": "catAccessories",
  "Home decor": "catHome",
  "Other cute things": "catOther"
};

function t(key) {
  return I18N[currentLang]?.[key] || I18N.en[key] || key;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function notify(message) {
  const el = $("toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(notify.timer);

  notify.timer = setTimeout(() => {
    el.classList.remove("show");
  }, 3500);
}

function formError(message) {
  const el = $("formError");
  if (el) el.textContent = message;
  console.error("[BUY OR WAIT?]", message);
}

function setBusy(value) {
  busy = value;

  const button = document.querySelector(
    '#uploadForm button[type="submit"]'
  );

  if (button) {
    button.disabled = busy;
    button.textContent = busy ? t("saving") : t("save");
  }
}

function applyLanguage(lang) {
  currentLang = I18N[lang] ? lang : "ko";

  document.documentElement.lang =
    currentLang === "zh" ? "zh-CN" : currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  document.querySelectorAll(".language-switch button").forEach((el) => {
    const active = el.dataset.lang === currentLang;
    el.classList.toggle("selected", active);
    el.setAttribute("aria-pressed", String(active));
  });

  if ($("itemName")) {
    $("itemName").placeholder = t("namePlaceholder");
  }

  if ($("itemNote")) {
    $("itemNote").placeholder = t("notePlaceholder");
  }

  try {
    localStorage.setItem(LANGUAGE_KEY, currentLang);
  } catch (error) {
    console.warn(error);
  }

  setBusy(busy);

  render();
}

function categoryName(category) {
  const key = CATEGORY_KEYS[category];
  return key ? t(key) : (category || t("catOther"));
}

function formatPrice(value, currency = "KRW") {
  if (value === null || value === undefined || value === "") {
    return t("noPrice");
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return t("noPrice");

  return currency === "KRW"
    ? `₩ ${number.toLocaleString("en-US")}`
    : `${number.toLocaleString()} ${currency}`;
}

/* ==========================================
   LOCAL BACKUP
========================================== */

function getLocalBackup() {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveLocalBackup() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finds));
  } catch (error) {
    console.warn(error);
  }
}

/* ==========================================
   PHOTO URL
========================================== */

function getPhotoURL(path) {
  if (!path) return "";

  if (/^(https?:|data:)/.test(path)) return path;

  if (!supabaseClient) return "";

  return supabaseClient.storage
    .from(BUCKET)
    .getPublicUrl(path).data.publicUrl;
}

function normalizeItem(row) {
  return {
    id: row.id,
    name: row.item_name || "",
    category: row.category || "Other cute things",
    price: row.price ?? "",
    currency: row.currency || "KRW",
    note: row.note || "",
    photoPath: row.photo_path || "",
    photo: getPhotoURL(row.photo_path),
    bought: row.status === "bought",
    createdAt: row.created_at || ""
  };
}

/* ==========================================
   RENDER WISHLIST
========================================== */

function render() {
  const grid = $("findsGrid");
  const drawer = $("drawerItems");

  if (!grid || !drawer) return;

  const waiting = finds.filter((x) => !x.bought).length;
  const bought = finds.length - waiting;

  if ($("wishlistCount")) {
    $("wishlistCount").textContent = waiting;
  }

  if ($("drawerCount")) {
    $("drawerCount").textContent = waiting;
  }

  if ($("waitingTotal")) {
    $("waitingTotal").textContent = waiting;
  }

  if ($("boughtTotal")) {
    $("boughtTotal").textContent = bought;
  }

  const visible = finds.filter((x) => {
    if (filter === "all") return true;
    if (filter === "waiting") return !x.bought;
    return x.bought;
  });

  if (visible.length) {
    grid.innerHTML = visible.map((item) => `
      <article class="find-card">
        <div class="find-image">
          ${item.photo
            ? `<img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.name)}">`
            : `<span class="find-placeholder">🎀</span>`
          }
        </div>
        <div class="find-info">
          <h3>${escapeHTML(item.name)}</h3>
          <div class="find-meta">
            <span>${escapeHTML(categoryName(item.category))}</span>
            <span>${escapeHTML(formatPrice(item.price, item.currency))}</span>
          </div>
          <span class="status-pill ${item.bought ? "bought" : ""}">
            ${item.bought ? t("statusBought") : t("statusWaiting")}
          </span>
          <div class="find-actions">
            <button
              type="button"
              class="mini-button"
              data-action="toggle"
              data-id="${escapeHTML(item.id)}"
            >
              ${item.bought ? t("markWaiting") : t("markBought")}
            </button>
            <button
              type="button"
              class="mini-button"
              data-action="remove"
              data-id="${escapeHTML(item.id)}"
            >
              ${t("remove")}
            </button>
          </div>
        </div>
      </article>
    `).join("");
  } else {
    grid.innerHTML = `
      <div class="empty-finds">
        <div class="empty-icon">♡</div>
        <h3>
          ${filter === "all" ? t("emptyTitle") : t("emptyFiltered")}
        </h3>
        <p>${t("emptyDesc")}</p>
        <button
          type="button"
          class="btn btn-yellow"
          id="emptyUpload"
        >
          ${t("emptyButton")}
        </button>
      </div>
    `;
  }

  if (finds.length) {
    drawer.innerHTML = [...finds].reverse().map((item) => `
      <div class="drawer-item">
        ${item.photo
          ? `<img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.name)}">`
          : `<div class="drawer-placeholder">🎀</div>`
        }
        <div>
          <h3>${escapeHTML(item.name)}</h3>
          <small>
            ${escapeHTML(categoryName(item.category))}
            · ${escapeHTML(formatPrice(item.price, item.currency))}
          </small>
          <br>
          <small>
            ${item.bought ? t("statusBought") : t("statusWaiting")}
          </small>
          <div class="drawer-item-actions">
            <button
              type="button"
              data-action="toggle"
              data-id="${escapeHTML(item.id)}"
            >
              ${item.bought ? t("markWaiting") : t("markBought")}
            </button>
            <button
              type="button"
              data-action="remove"
              data-id="${escapeHTML(item.id)}"
            >
              ${t("remove")}
            </button>
          </div>
        </div>
      </div>
    `).join("");
  } else {
    drawer.innerHTML = `
      <div class="drawer-empty">
        <div class="empty-icon">♡</div>
        <p>${t("drawerEmpty")}</p>
      </div>
    `;
  }
}

/* ==========================================
   LOAD SUPABASE LIBRARY
========================================== */

function loadSupabaseLibrary() {
  return new Promise((resolve, reject) => {
    if (window.supabase?.createClient) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";

    script.onload = () => {
      if (window.supabase?.createClient) {
        resolve();
      } else {
        reject(
          new Error("Supabase library unavailable")
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error("Supabase library could not be loaded")
      );
    };

    document.head.appendChild(script);
  });
}

/* ==========================================
   SUPABASE CONNECTION
========================================== */

async function initializeSupabase() {
  cloudReady = false;

  try {
    await loadSupabaseLibrary();

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      }
    );

    const result = await supabaseClient.auth.getSession();

    if (result.error) {
      throw result.error;
    }

    let session = result.data.session;

    if (!session) {
      const login =
        await supabaseClient.auth.signInAnonymously();

      if (login.error) {
        throw login.error;
      }

      session = login.data.session;
    }

    if (!session?.user) {
      throw new Error("Anonymous login failed");
    }

    currentUser = session.user;

    await loadCloudFinds();

    cloudReady = true;

    notify(t("connected"));

    console.log(
      "[BUY OR WAIT?] Connected:",
      currentUser.id
    );

  } catch (error) {
    console.error(
      "Supabase connection error:",
      error
    );

    cloudReady = false;

    finds = getLocalBackup();

    render();

    notify(
      `${t("connectionError")}: ${error.message}`
    );
  }
}

async function ensureCloudConnection() {
  if (
    cloudReady &&
    currentUser &&
    supabaseClient
  ) {
    return true;
  }

  await initializeSupabase();

  return Boolean(
    cloudReady &&
    currentUser &&
    supabaseClient
  );
}

/* ==========================================
   LOAD CLOUD FINDS
========================================== */

async function loadCloudFinds() {
  if (!supabaseClient || !currentUser) {
    throw new Error("Not signed in");
  }

  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw error;
  }

  finds = (data || []).map(normalizeItem);

  saveLocalBackup();

  render();
}

/* ==========================================
   PHOTO UPLOAD
========================================== */

function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    const url = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const scale = Math.min(
          1,
          850 / Math.max(
            image.width,
            image.height
          )
        );

        const canvas =
          document.createElement("canvas");

        canvas.width = Math.max(
          1,
          Math.round(image.width * scale)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * scale)
        );

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas unavailable");
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error("Image conversion failed")
              );
            }
          },
          "image/jpeg",
          0.75
        );

      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);

      reject(
        new Error("Cannot read image")
      );
    };

    image.src = url;
  });
}

async function uploadPhoto(blob) {
  if (
    !supabaseClient ||
    !currentUser?.id
  ) {
    throw new Error("Not signed in");
  }

  const {
    data: { user },
    error: authError
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    throw new Error(
      `Photo upload authentication: ${
        authError?.message || "Session unavailable"
      }`
    );
  }

  currentUser = user;

  const path =
    `${user.id}/${crypto.randomUUID()}.jpg`;

  const { error } = await supabaseClient.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false
    });

  if (error) {
    throw new Error(
      `Photo upload: ${error.message}`
    );
  }

  return path;
}

function clearPhotoPreview() {
  if (photoPreviewURL) {
    URL.revokeObjectURL(photoPreviewURL);

    photoPreviewURL = "";
  }

  if ($("photoPreview")) {
    $("photoPreview").hidden = true;

    $("photoPreview").removeAttribute("src");
  }

  if ($("photoPrompt")) {
    $("photoPrompt").hidden = false;
  }
}

/* ==========================================
   SAVE NEW FIND
========================================== */

async function saveNewFind(event) {
  event.preventDefault();

  if (busy) return;

  const name = $("itemName")?.value.trim();

  if (!name) {
    formError(t("needName"));
    return;
  }

  setBusy(true);
  formError("");

  let photoPath = "";
  let inserted = false;

  try {
    if (!await ensureCloudConnection()) {
      throw new Error("Cloud login failed");
    }

    const file = $("itemPhoto")?.files?.[0];

    if (file) {
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp"
        ].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      ) {
        throw new Error(t("imageInvalid"));
      }

      const blob = await shrinkImage(file);

      photoPath = await uploadPhoto(blob);
    }

    const priceText =
      $("itemPrice")?.value.trim() || "";

    const price = priceText === ""
      ? null
      : Number(priceText);

    if (
      price !== null &&
      (
        !Number.isFinite(price) ||
        price < 0
      )
    ) {
      throw new Error("Invalid price");
    }

    const item = {
      user_id: currentUser.id,
      item_name: name,
      category:
        $("itemCategory")?.value ||
        "Other cute things",
      price,
      currency: "KRW",
      note:
        $("itemNote")?.value.trim() || "",
      photo_path: photoPath || null,
      status: "waiting"
    };

    const { data, error } = await supabaseClient
      .from(TABLE)
      .insert(item)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Database: ${error.message}`
      );
    }

    inserted = true;

    finds.unshift(normalizeItem(data));

    saveLocalBackup();

    render();

    $("uploadForm").reset();

    clearPhotoPreview();

    closeUpload();

    notify(t("saved"));

    try {
      await loadCloudFinds();
    } catch (error) {
      console.warn(
        "Saved, but refresh failed:",
        error
      );
    }

    $("finds")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    console.error("Save failed:", error);

    formError(
      `${t("saveError")}: ${error.message}`
    );

    if (
      photoPath &&
      !inserted &&
      supabaseClient
    ) {
      try {
        await supabaseClient.storage
          .from(BUCKET)
          .remove([photoPath]);

      } catch (cleanupError) {
        console.warn(cleanupError);
      }
    }

  } finally {
    setBusy(false);
  }
}

/* ==========================================
   UPDATE / DELETE
========================================== */

async function handleItemClick(event) {
  const button = event.target.closest("[data-action]");

  if (!button || busy) return;

  const item = finds.find(
    (x) => String(x.id) === button.dataset.id
  );

  if (!item) return;

  if (!await ensureCloudConnection()) {
    notify(t("connectionError"));
    return;
  }

  if (button.dataset.action === "toggle") {
    setBusy(true);

    try {
      const status = item.bought
        ? "waiting"
        : "bought";

      const { error } = await supabaseClient
        .from(TABLE)
        .update({ status })
        .eq("id", item.id)
        .eq("user_id", currentUser.id);

      if (error) throw error;

      await loadCloudFinds();

      notify(
        status === "bought"
          ? t("markedBought")
          : t("markedWaiting")
      );

    } catch (error) {
      notify(
        `${t("updateError")}: ${error.message}`
      );

    } finally {
      setBusy(false);
    }
  }

  if (button.dataset.action === "remove") {
    if (!confirm(t("confirmRemove"))) return;

    setBusy(true);

    try {
      const { error } = await supabaseClient
        .from(TABLE)
        .delete()
        .eq("id", item.id)
        .eq("user_id", currentUser.id);

      if (error) throw error;

      await loadCloudFinds();

      if (item.photoPath) {
        const { error: photoError } =
          await supabaseClient.storage
            .from(BUCKET)
            .remove([item.photoPath]);

        if (photoError) {
          console.warn(photoError);
        }
      }

      notify(t("removed"));

    } catch (error) {
      notify(
        `${t("deleteError")}: ${error.message}`
      );

    } finally {
      setBusy(false);
    }
  }
}

/* ==========================================
   MODALS
========================================== */

function openDrawer() {
  const el = $("wishlistDrawer");

  if (!el) return;

  el.classList.add("open");

  el.setAttribute(
    "aria-hidden",
    "false"
  );

  if ($("overlay")) {
    $("overlay").hidden = false;
  }

  document.body.classList.add("locked");
}

function closeDrawer() {
  const el = $("wishlistDrawer");

  if (el) {
    el.classList.remove("open");

    el.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  if ($("overlay")) {
    $("overlay").hidden = true;
  }

  document.body.classList.remove("locked");
}

function openUpload() {
  closeDrawer();

  formError("");

  const dialog = $("uploadDialog");

  if (!dialog) return;

  if (!dialog.open) {
    dialog.showModal();
  }

  document.body.classList.add("locked");
}

function closeUpload() {
  const dialog = $("uploadDialog");

  if (dialog?.open) {
    dialog.close();
  }

  document.body.classList.remove("locked");
}

function bindClick(id, handler) {
  const element = $(id);

  if (element) {
    element.addEventListener(
      "click",
      handler
    );
  }
}

/* ==========================================
   BUTTON EVENTS
========================================== */

function initializeEvents() {
  [
    "openWishlist",
    "heroWishlist",
    "stepWishlist"
  ].forEach((id) => {
    bindClick(id, openDrawer);
  });

  [
    "closeWishlist",
    "drawerCloseBottom"
  ].forEach((id) => {
    bindClick(id, closeDrawer);
  });

  bindClick(
    "overlay",
    closeDrawer
  );

  [
    "uploadTop",
    "heroUpload",
    "stepUpload",
    "findsUpload",
    "drawerUpload"
  ].forEach((id) => {
    bindClick(id, openUpload);
  });

  bindClick(
    "closeUpload",
    closeUpload
  );

  [
    "roomNav",
    "roomMobile",
    "roomButton"
  ].forEach((id) => {
    bindClick(id, () => {
      notify(t("roomNotice"));
    });
  });

  bindClick("menuButton", () => {
    const menu = $("mobileNav");

    if (!menu) return;

    menu.hidden = !menu.hidden;

    $("menuButton")?.setAttribute(
      "aria-expanded",
      String(!menu.hidden)
    );
  });

  $("mobileNav")
    ?.querySelectorAll("a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        $("mobileNav").hidden = true;

        $("menuButton")?.setAttribute(
          "aria-expanded",
          "false"
        );
      });
    });

  $("uploadDialog")?.addEventListener(
    "close",
    () => {
      document.body.classList.remove(
        "locked"
      );
    }
  );

  $("uploadDialog")?.addEventListener(
    "click",
    (event) => {
      if (
        event.target === $("uploadDialog")
      ) {
        closeUpload();
      }
    }
  );

  $("uploadForm")?.addEventListener(
    "submit",
    saveNewFind
  );

  /* ==========================================
     PHOTO PREVIEW
  ========================================== */

  $("itemPhoto")?.addEventListener(
    "change",
    async (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp"
        ].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      ) {
        formError(t("imageInvalid"));

        event.target.value = "";

        return;
      }

      try {
        const blob = await shrinkImage(file);

        if (photoPreviewURL) {
          URL.revokeObjectURL(
            photoPreviewURL
          );
        }

        photoPreviewURL =
          URL.createObjectURL(blob);

        $("photoPreview").src =
          photoPreviewURL;

        $("photoPreview").hidden = false;

        $("photoPrompt").hidden = true;

        formError("");

      } catch (error) {
        formError(t("imageError"));
      }
    }
  );

  /* ==========================================
     FIND CARD BUTTONS
  ========================================== */

  $("findsGrid")?.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest(
          "#emptyUpload"
        )
      ) {
        openUpload();
      } else {
        handleItemClick(event);
      }
    }
  );

  $("drawerItems")?.addEventListener(
    "click",
    handleItemClick
  );

  /* ==========================================
     FILTER BUTTONS
  ========================================== */

  document
    .querySelectorAll(".filter")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          filter =
            button.dataset.filter || "all";

          document
            .querySelectorAll(".filter")
            .forEach((el) => {
              el.classList.toggle(
                "active",
                el === button
              );
            });

          render();
        }
      );
    });

  /* ==========================================
     LANGUAGE SWITCH
  ========================================== */

  document
    .querySelectorAll(
      ".language-switch button"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          applyLanguage(
            button.dataset.lang
          );
        }
      );
    });

  /* ==========================================
     ESCAPE KEY
  ========================================== */

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        $("wishlistDrawer")
          ?.classList.contains("open")
      ) {
        closeDrawer();
      }
    }
  );
}

/* ==========================================
   START APPLICATION
========================================== */

function startApplication() {
  try {
    currentLang =
      localStorage.getItem(
        LANGUAGE_KEY
      ) || "ko";

  } catch {
    currentLang = "ko";
  }

  finds = getLocalBackup();

  initializeEvents();

  applyLanguage(currentLang);

  initializeSupabase();
}

/* ==========================================
   DOM READY
========================================== */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startApplication
  );
} else {
  startApplication();
}

/* ==========================================
   END OF SCRIPT.JS
========================================== */
