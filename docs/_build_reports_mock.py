# -*- coding: utf-8 -*-
"""Build implementable Karvita-shell reports mock (mirrors DashboardChrome)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HEAD = Path(r"C:\Users\ak47\AppData\Local\Temp\bc-full-head.html").read_text(encoding="utf-8")
JS = (ROOT / "_reports_mock_app.js").read_text(encoding="utf-8")
OUT = ROOT / "reports-product-design.html"

SHELL_CSS = r"""
    /* Mirror better-auth DashboardChrome spacing/surfaces */
    body.kv-app { min-height: 100dvh; background: #f4f2ee; }
    .kv-header {
      height: 4rem; position: sticky; top: 0; z-index: 30;
      background: rgb(244 242 238 / 0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgb(225 222 214 / 0.9);
    }
    .kv-frame {
      width: 100%; max-width: 1600px; margin-inline: auto;
      padding: 0.75rem 1rem 1.25rem;
      display: flex; flex-direction: column; gap: 0.75rem;
    }
    @media (min-width: 1024px) {
      .kv-frame { flex-direction: row; align-items: flex-start; padding: 1rem 1.5rem 1.5rem; gap: 1rem; }
    }
    .kv-sidebar-card {
      width: 100%; background: #fbfaf8; border: 1px solid rgb(225 222 214 / 0.9);
      border-radius: 0.75rem; box-shadow: 0 1px 2px rgb(25 29 43 / 0.04);
      overflow: hidden;
    }
    @media (min-width: 1024px) {
      .kv-sidebar-card {
        position: sticky; top: calc(4rem + 1rem);
        width: 22rem; flex-shrink: 0; max-height: calc(100dvh - 5.5rem);
        display: flex; flex-direction: column;
      }
    }
    .kv-nav-item {
      width: 100%; display: flex; align-items: flex-start; gap: 0.55rem;
      padding: 0.55rem 0.7rem; border-radius: 0.65rem;
      font-size: 11.5px; font-weight: 800; color: #454b59; text-align: right;
      border: 1px solid transparent; transition: 0.15s ease; line-height: 1.45;
    }
    .kv-nav-item:hover { background: #f0eee9; color: #191d2b; }
    .kv-nav-item[aria-current="page"] {
      background: #e8eef9; color: #093a94; border-color: rgb(12 70 177 / 0.14);
    }
    .kv-nav-item i { width: 1rem; text-align: center; color: #93a1b4; margin-top: 0.15rem; flex-shrink: 0; }
    .kv-nav-item[aria-current="page"] i { color: #0c46b1; }
    .kv-report-nav span { white-space: normal; }

    .kv-main {
      flex: 1; min-width: 0;
      background: #fbfaf8; border: 1px solid rgb(225 222 214 / 0.85);
      border-radius: 0.75rem; padding: 0.85rem 1rem 1.1rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      min-height: min(70dvh, 720px);
    }
    @media (min-width: 1024px) {
      .kv-main { min-height: calc(100dvh - 5.5rem); padding: 1rem 1.15rem 1.25rem; }
    }

    .kv-page-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
    .kv-page-icon {
      width: 2.5rem; height: 2.5rem; border-radius: 0.5rem;
      background: rgb(12 70 177 / 0.1); color: #0c46b1;
      display: grid; place-items: center; flex-shrink: 0;
    }
    .kv-toolbar {
      display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;
      padding: 0.65rem; border: 1px solid #ece9e2; border-radius: 0.65rem; background: #f8f7f4;
    }
    .kv-toolbar .kv-select, .kv-toolbar .kv-input { height: 2.125rem !important; font-size: 12px !important; }
    .kv-seg {
      display: inline-flex; padding: 3px; gap: 2px; border-radius: 0.5rem; background: #ece9e2;
    }
    .kv-seg button {
      height: 1.85rem; padding: 0 0.7rem; border: 0; border-radius: 0.4rem;
      font-size: 11.5px; font-weight: 800; color: #5b6272; background: transparent;
    }
    .kv-seg button[aria-selected="true"] { background: #fff; color: #0c46b1; box-shadow: 0 1px 2px rgb(0 0 0 / 0.06); }
    .kv-panel {
      flex: 1; min-height: 0; display: flex; flex-direction: column;
      border: 1px solid #e1ded6; border-radius: 0.65rem; background: #fff; overflow: hidden;
    }
    .kv-panel-bar {
      height: 2.35rem; padding: 0 0.75rem; border-bottom: 1px solid #ece9e2;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 11.5px; font-weight: 800; color: #454b59; background: #f8f7f4;
    }
    .kv-chip {
      height: 1.65rem; padding: 0 0.55rem; border-radius: 999px; border: 1px solid #e1ded6;
      background: #fff; font-size: 10.5px; font-weight: 700; color: #454b59;
      display: inline-flex; align-items: center; gap: 0.35rem;
    }
    .kv-fab {
      position: fixed; bottom: 1.15rem; left: 1.15rem; z-index: 80;
      height: 2.75rem; padding: 0 0.9rem; border-radius: 0.85rem;
      background: #191d2b; color: #fff; border: 1px solid #2e3341;
      box-shadow: 0 10px 24px rgb(25 29 43 / 0.25);
      display: inline-flex; align-items: center; gap: 0.45rem;
      font-size: 11px; font-weight: 800;
    }
    .kv-table-wrapper { max-height: none !important; min-height: 240px !important; flex: 1; }
"""

if "</style>" in HEAD:
    HEAD = HEAD.replace("</style>", SHELL_CSS + "\n  </style>", 1)

BODY = r'''
<body class="kv-app text-slate-800 font-sans"
      x-data="karvitaApp()" x-init="init()" x-cloak>

  <div class="fixed top-4 left-4 z-[300] flex flex-col gap-2 max-w-sm pointer-events-none">
    <template x-for="toast in toasts" :key="toast.id">
      <div class="pointer-events-auto px-3.5 py-3 rounded-xl shadow-xl text-xs font-black flex items-center gap-2 text-white bg-slate-900 border border-slate-800">
        <i class="fa-solid fa-circle-check text-emerald-400"></i>
        <span x-text="toast.message"></span>
      </div>
    </template>
  </div>

  <!-- Header = project Header -->
  <header class="kv-header">
    <div class="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <button class="lg:hidden w-9 h-9 rounded-xl bg-white border border-slate-200" @click="isSidebarOpen=true"><i class="fa-solid fa-bars"></i></button>
        <div class="w-9 h-9 bg-[#0c46b1] rounded-xl flex items-center justify-center text-white shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 32 32" fill="none"><path d="M9 22L16 9L23 22M12 17H20" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="min-w-0 hidden sm:block">
          <div class="text-sm font-black text-slate-900 leading-tight">کارویتا</div>
          <div class="text-[10px] font-bold text-slate-500">سامانه کارآموزی و کارورزی</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="relative w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500"><i class="fa-solid fa-bell text-xs"></i><span class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500"></span></button>
        <button class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1 pr-3 pl-1" @click="isSimulatorOpen=true" title="تعویض نقش نمونه">
          <div class="text-right hidden md:block">
            <div class="text-xs font-black leading-tight" x-text="currentUser().name"></div>
            <div class="text-[9.5px] font-bold text-slate-500" x-text="currentUser().roleLabel"></div>
          </div>
          <div class="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center"><i class="fa-solid text-[11px]" :class="currentUser().icon"></i></div>
        </button>
      </div>
    </div>
  </header>

  <div class="kv-frame">
    <!-- mobile sidebar overlay -->
    <div class="lg:hidden fixed inset-0 z-40" x-show="isSidebarOpen" x-cloak>
      <div class="absolute inset-0 bg-slate-950/40" @click="isSidebarOpen=false"></div>
      <aside class="absolute inset-y-0 right-0 w-72 bg-[#fbfaf8] shadow-2xl p-3 overflow-y-auto">
        <div class="flex justify-between items-center mb-3"><span class="text-xs font-black">منوی سامانه</span><button class="w-8 h-8 rounded-lg border" @click="isSidebarOpen=false"><i class="fa-solid fa-xmark"></i></button></div>
        <div class="space-y-1" x-html="''"></div>
        <button class="kv-nav-item" :aria-current="activeTab==='standard_reports'?'page':null" @click="activeTab='standard_reports'; isSidebarOpen=false"><i class="fa-solid fa-chart-pie"></i><span>گزارش‌های سیستمی</span></button>
        <button class="kv-nav-item" x-show="canRbac()" :aria-current="activeTab==='rbac'?'page':null" @click="activeTab='rbac'; isSidebarOpen=false"><i class="fa-solid fa-user-shield"></i><span>مدیریت دسترسی گزارش‌ها</span></button>
        <div class="pt-2 mt-1 border-t border-slate-100" x-show="activeTab==='standard_reports'">
          <div class="px-2 pb-1.5 text-[9.5px] font-black text-slate-400">گزارش‌های این نقش</div>
          <template x-for="rep in availableReports()" :key="'mnav-'+rep.id">
            <button type="button" class="kv-nav-item kv-report-nav" :aria-current="selectedReportId===rep.id?'page':null"
              @click="selectReport(rep.id); isSidebarOpen=false">
              <i class="fa-solid" :class="rep.icon"></i><span x-text="reportLabel(rep)"></span>
            </button>
          </template>
        </div>
      </aside>
    </div>

    <!-- Sidebar card = project Sidebar -->
    <aside class="kv-sidebar-card hidden lg:flex">
      <div class="px-3 pt-3 pb-2 border-b border-slate-100">
        <div class="text-[10px] font-black text-slate-400">منوی سامانه</div>
        <div class="text-[12px] font-black text-slate-800 mt-1" x-text="currentUser().roleLabel"></div>
      </div>
      <nav class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        <button class="kv-nav-item" type="button" :aria-current="activeTab==='standard_reports' && !selectedReportId ? 'page' : null" @click="activeTab='standard_reports'">
          <i class="fa-solid fa-chart-pie"></i><span>گزارش‌های سیستمی</span>
        </button>
        <button class="kv-nav-item" type="button" x-show="canRbac()" :aria-current="activeTab==='rbac'?'page':null" @click="activeTab='rbac'">
          <i class="fa-solid fa-user-shield"></i><span>مدیریت دسترسی گزارش‌ها</span>
        </button>
        <div class="pt-2 mt-1 border-t border-slate-100" x-show="activeTab==='standard_reports'">
          <div class="px-2 pb-1.5 text-[9.5px] font-black text-slate-400 tracking-wide">گزارش‌های استاندارد این نقش</div>
          <template x-for="rep in availableReports()" :key="'nav-'+rep.id">
            <button type="button" class="kv-nav-item kv-report-nav"
              :aria-current="selectedReportId===rep.id ? 'page' : null"
              @click="selectReport(rep.id)">
              <i class="fa-solid" :class="rep.icon"></i>
              <span x-text="reportLabel(rep)"></span>
            </button>
          </template>
          <p class="px-2 py-2 text-[10px] text-slate-400 font-semibold" x-show="!availableReports().length">برای این نقش گزارشی در سند تعریف نشده.</p>
        </div>
      </nav>
      <div class="p-2 border-t border-slate-100 text-[10px] font-bold text-slate-400">
        <span x-text="toFa(availableReports().length)"></span> گزارش — مطابق سند مهر
      </div>
    </aside>

    <!-- Main viewport -->
    <main class="kv-main">
      <!-- REPORTS MODULE -->
      <template x-if="activeTab==='standard_reports'">
        <div class="contents">
          <div class="kv-page-header">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="kv-page-icon"><i class="fa-solid fa-chart-pie"></i></div>
              <div class="min-w-0">
                <h1 class="text-[14px] font-black text-slate-900 leading-snug" x-text="currentReport() ? reportLabel(currentReport()) : 'گزارش‌های سیستمی'"></h1>
                <p class="text-[11px] font-semibold text-slate-500 mt-0.5 truncate" x-text="(roleNames[currentRole]||'') + ' · استاندارد سند مهر'"></p>
              </div>
            </div>
            <button class="kv-btn kv-btn-outline !h-9 !px-3" @click="refresh(); toast('بروزرسانی شد')"><i class="fa-solid fa-rotate text-[12px]"></i></button>
          </div>

          <template x-if="!availableReports().length">
            <div class="kv-panel items-center justify-center text-center p-10">
              <i class="fa-solid fa-folder-open text-3xl text-slate-300 mb-3"></i>
              <div class="font-black text-sm">برای این نقش گزارشی فعال نیست</div>
              <button class="kv-btn kv-btn-primary mt-4 !h-9" @click="isSimulatorOpen=true">تعویض نقش</button>
            </div>
          </template>

          <template x-if="availableReports().length && currentReport()">
            <div class="contents">
              <!-- toolbar: maps to real KvSelect + buttons -->
              <div class="kv-toolbar">
                <div class="kv-seg">
                  <button type="button" :aria-selected="moduleType==='standard'" @click="moduleType='standard'">استاندارد</button>
                  <button type="button" :aria-selected="moduleType==='comparative'" @click="setComparative()" :disabled="!currentReport().comparable">مقایسه‌ای</button>
                </div>
                <button class="kv-btn kv-btn-outline !h-9 !px-3" @click="openFilters()" :disabled="!filterKeysForCurrent().length" :title="filterKeysForCurrent().length ? 'فیلترهای مجاز این نقش × گزارش' : 'این پنل فیلتر قابل‌تنظیم ندارد'">
                  <i class="fa-solid fa-filter text-brand-600 text-[12px]"></i>
                  <span>فیلتر</span>
                  <span class="text-[10px] font-black text-slate-400" x-text="'(' + toFa(filterKeysForCurrent().length) + ')'"></span>
                  <span class="w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] inline-flex items-center justify-center" x-show="activeFilterCount()" x-text="toFa(activeFilterCount())"></span>
                </button>
                <button class="kv-btn kv-btn-outline !h-9 !px-3" @click="toast('خروجی اکسل نمونه')"><i class="fa-solid fa-file-excel text-emerald-600 text-[12px]"></i><span class="hidden sm:inline">اکسل</span></button>
              </div>

              <div class="flex flex-wrap gap-1.5" x-show="activeFilterCount()">
                <template x-for="c in activeChips()" :key="c.key">
                  <button class="kv-chip" @click="clearFilter(c.key)"><span x-text="c.label"></span><i class="fa-solid fa-xmark text-[9px] text-slate-400"></i></button>
                </template>
                <button class="text-[11px] font-black text-rose-600 px-1" @click="clearAllFilters()">پاک‌سازی</button>
              </div>

              <template x-if="moduleType==='comparative' && currentReport().comparable">
                <div class="grid lg:grid-cols-[1fr_220px] gap-3 flex-1 min-h-0">
                  <div class="kv-panel p-3"><div class="h-[min(360px,50vh)]"><canvas id="cmpChart"></canvas></div></div>
                  <div class="kv-panel">
                    <div class="kv-panel-bar"><span>موجودیت‌ها</span><span class="text-slate-400">۲–۵</span></div>
                    <div class="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                      <template x-for="e in comparePool" :key="e">
                        <label class="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50 cursor-pointer">
                          <span class="text-[12px] font-bold" x-text="e"></span>
                          <input type="checkbox" class="accent-[#0c46b1]" :checked="compareSelected.includes(e)" @change="toggleCompare(e)">
                        </label>
                      </template>
                    </div>
                    <div class="p-2 border-t border-slate-100">
                      <button class="kv-btn kv-btn-primary w-full !h-9" @click="renderChart()">بروزرسانی نمودار</button>
                    </div>
                  </div>
                </div>
              </template>

              <template x-if="moduleType==='standard' || !currentReport().comparable">
                <div class="kv-panel">
                  <div class="kv-panel-bar">
                    <span><span x-text="toFa(tableRows().length)"></span> ردیف</span>
                    <span class="text-slate-400 font-bold" x-text="currentReport().grain"></span>
                  </div>
                  <div class="kv-table-wrapper custom-scrollbar">
                    <table class="kv-table w-full text-[12px]">
                      <thead>
                        <tr>
                          <template x-for="col in visibleColumns()" :key="col.key">
                            <th class="text-right font-black px-3 py-2.5 whitespace-nowrap text-slate-500" x-text="col.label"></th>
                          </template>
                        </tr>
                      </thead>
                      <tbody>
                        <template x-for="(row, idx) in tableRows()" :key="idx">
                          <tr>
                            <template x-for="col in visibleColumns()" :key="col.key+idx">
                              <td class="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap" x-html="row[col.key] ?? '—'"></td>
                            </template>
                          </tr>
                        </template>
                        <tr x-show="!tableRows().length && !loading">
                          <td class="px-4 py-14 text-center text-slate-400 font-bold" :colspan="visibleColumns().length">نتیجه‌ای نیست</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
      </template>

      <!-- RBAC MODULE (admin) -->
      <template x-if="activeTab==='rbac'">
        <div class="contents">
          <div class="kv-page-header">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="kv-page-icon"><i class="fa-solid fa-user-shield"></i></div>
              <div class="min-w-0">
                <h1 class="text-[15px] font-black text-slate-900">مدیریت دسترسی گزارش‌ها</h1>
                <p class="text-[11px] font-semibold text-slate-500 mt-0.5">اساین بستهٔ دسته به استان، سپس تیک گزارش هر نقش</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="kv-btn kv-btn-outline !h-9 !px-3" @click="applyWordDefaults(); toast('پیش‌فرض سند اعمال شد')">پیش‌فرض سند</button>
              <button class="kv-btn kv-btn-primary !h-9 !px-3" @click="toast('ذخیره شد')">ثبت</button>
            </div>
          </div>

          <div class="grid xl:grid-cols-[180px_1fr_220px] gap-3 flex-1 min-h-0">
            <div class="kv-panel overflow-auto">
              <div class="kv-panel-bar">استان (Scope)</div>
              <div class="p-2">
                <template x-for="p in provinces" :key="p">
                  <button class="w-full text-right px-2.5 py-2 rounded-lg text-[12px] font-bold mb-1"
                          :class="rbacScope===p?'bg-brand-50 text-brand-700':'hover:bg-slate-50 text-slate-600'"
                          @click="rbacScope=p" x-text="p"></button>
                </template>
                <button class="kv-btn kv-btn-outline w-full !h-9 mt-2" @click="copyScopeFrom('تهران')">کپی از تهران</button>
              </div>
            </div>
            <div class="kv-panel overflow-auto">
              <div class="kv-panel-bar">نقش × گزارش</div>
              <div class="p-3">
                <div class="flex flex-wrap gap-1.5 mb-3">
                  <template x-for="role in rbacRoles" :key="role">
                    <button class="px-2 py-1 rounded-lg text-[10.5px] font-black border"
                            :class="rbacRole===role?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200 text-slate-600'"
                            @click="rbacRole=role" x-text="roleName(role)"></button>
                  </template>
                </div>
                <table class="min-w-full text-[12px]">
                  <thead class="bg-slate-50"><tr>
                    <th class="text-right px-2 py-2 font-black">گزارش</th>
                    <th class="text-right px-2 py-2 font-black">دسته</th>
                    <th class="text-center px-2 py-2 font-black">فعال</th>
                  </tr></thead>
                  <tbody>
                    <template x-for="r in catalog.filter(x => packages[x.category])" :key="'rb'+r.id">
                      <tr class="border-t border-slate-100">
                        <td class="px-2 py-2 font-bold leading-snug" x-text="reportLabel(r)"></td>
                        <td class="px-2 py-2 text-slate-500 font-semibold" x-text="categoryLabel(r.category)"></td>
                        <td class="px-2 py-2 text-center"><input type="checkbox" class="accent-[#0c46b1]" :checked="isAllowed(rbacRole,r.id)" @change="togglePerm(rbacRole,r.id)"></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="kv-panel overflow-auto">
              <div class="kv-panel-bar">بسته‌های دسته</div>
              <div class="p-2 space-y-1.5">
                <template x-for="c in categories" :key="c.id">
                  <button class="w-full rounded-xl border px-2.5 py-2.5 text-right"
                          :class="packages[c.id]?'border-brand-300 bg-brand-50':'border-slate-200'"
                          @click="togglePackage(c.id)">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <div class="text-[12px] font-black" x-text="c.label"></div>
                        <div class="text-[10px] text-slate-500 font-bold mt-0.5" x-text="c.blurb"></div>
                      </div>
                      <span class="text-[9px] font-black px-1.5 py-0.5 rounded-full" :class="packages[c.id]?'bg-brand-500 text-white':'bg-slate-100 text-slate-500'" x-text="packages[c.id]?'ON':'OFF'"></span>
                    </div>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>

  <!-- Filter drawer: role × report personalized keys -->
  <div class="fixed inset-0 z-[110]" x-show="isFilterDrawerOpen" x-cloak>
    <div class="absolute inset-0 bg-slate-950/35" @click="isFilterDrawerOpen=false"></div>
    <div class="absolute inset-y-0 left-0 w-full max-w-sm bg-[#fbfaf8] shadow-2xl flex flex-col border-r border-slate-200">
      <div class="px-4 py-3 border-b border-slate-200 flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[13px] font-black">فیلتر گزارش</div>
          <div class="text-[10px] font-bold text-slate-500 mt-0.5 truncate" x-text="(roleNames[currentRole]||'') + ' · ' + reportLabel(currentReport())"></div>
          <div class="text-[10px] font-semibold text-slate-400 mt-1 leading-relaxed" x-text="scopeHint()"></div>
        </div>
        <button class="w-8 h-8 rounded-lg border shrink-0" @click="isFilterDrawerOpen=false"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <template x-for="f in visibleFilters()" :key="f.key">
          <label class="block">
            <span class="kv-label" x-text="f.label"></span>
            <template x-if="f.type==='select'">
              <select class="kv-select" x-model="draft[f.key]">
                <option value="">همه</option>
                <template x-for="opt in f.options" :key="opt"><option :value="opt" x-text="opt"></option></template>
              </select>
            </template>
            <template x-if="f.type!=='select'">
              <input class="kv-input" x-model="draft[f.key]" :placeholder="f.label">
            </template>
          </label>
        </template>
        <p class="text-[11px] text-slate-400 font-semibold leading-relaxed" x-show="!visibleFilters().length">
          برای این نقش روی این گزارش فیلتر قابل‌تنظیم نیست؛ محدوده از scope نقش در سرور اعمال می‌شود.
        </p>
      </div>
      <div class="p-3 border-t border-slate-200 flex gap-2">
        <button class="kv-btn kv-btn-outline flex-1 !h-9" @click="resetDraft()" :disabled="!visibleFilters().length">بازنشانی</button>
        <button class="kv-btn kv-btn-primary flex-[1.3] !h-9" @click="applyFilters(); isFilterDrawerOpen=false; toast('فیلتر اعمال شد')" :disabled="!visibleFilters().length">اعمال</button>
      </div>
    </div>
  </div>

  <button class="kv-fab" @click="isSimulatorOpen=true" title="تعویض نقش نمونه">
    <span class="hidden sm:inline">تعویض نقش</span>
    <i class="fa-solid fa-wand-magic-sparkles text-brand-400"></i>
  </button>

  <div x-show="isSimulatorOpen" class="fixed inset-0 z-50" x-cloak>
    <div class="absolute inset-0 bg-slate-950/50" @click="isSimulatorOpen=false"></div>
    <div class="absolute inset-y-0 left-0 w-full max-w-md bg-slate-900 text-slate-100 shadow-2xl flex flex-col border-r border-slate-800">
      <div class="h-12 px-4 border-b border-slate-800 flex items-center justify-between">
        <div class="text-xs font-black flex items-center gap-2"><i class="fa-solid fa-users text-brand-400"></i> سوئیچ نقش (ماک)</div>
        <button @click="isSimulatorOpen=false"><i class="fa-solid fa-xmark text-slate-400"></i></button>
      </div>
      <div class="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        <template x-for="mock in mockUsers" :key="mock.id">
          <button @click="loginAs(mock)" class="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-right border"
                  :class="currentUserId===mock.id?'bg-brand-600/20 border-brand-500':'bg-slate-950/50 border-slate-800 hover:bg-slate-800/70'">
            <i class="fa-solid w-5 text-center text-brand-400" :class="mock.icon"></i>
            <div class="min-w-0 flex-1">
              <div class="text-[12px] font-extrabold text-white truncate" x-text="mock.name"></div>
              <div class="text-[9px] text-slate-400 font-bold truncate" x-text="mock.desc"></div>
            </div>
            <span class="text-[9px] font-black text-brand-300" x-text="mock.roleLabel"></span>
          </button>
        </template>
      </div>
    </div>
  </div>

  <script>
'''

# Patch JS: add canRbac helper if missing
if "canRbac()" not in JS:
    JS = JS.replace(
        "toast(message) {",
        """canRbac() {
      return ['super_admin', 'assistant_admin', 'central_organization'].includes(this.currentRole);
    },

    toast(message) {""",
        1,
    )

html = "<!DOCTYPE html>\n<html lang=\"fa\" dir=\"rtl\">\n" + HEAD + BODY + JS + "\n  </script>\n</body>\n</html>\n"
OUT.write_text(html, encoding="utf-8")
print("WROTE", OUT, OUT.stat().st_size)
