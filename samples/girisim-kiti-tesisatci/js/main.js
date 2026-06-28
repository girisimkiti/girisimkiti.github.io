/* WebForge — minimal etkileşim. Saf vanilla JS; framework/CDN yok. */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* Çerez/KVKK bandı: kabul edilmemişse göster; "Kabul Et" ile kalıcı gizle. */
    var cookie = document.getElementById("cookie_banner");
    if (cookie) {
      if (localStorage.getItem("wf_cookie") === "1") {
        cookie.style.display = "none";
      } else {
        cookie.style.display = "";
      }
      var accept = document.getElementById("cookie_accept");
      if (accept) {
        accept.addEventListener("click", function () {
          localStorage.setItem("wf_cookie", "1");
          cookie.style.display = "none";
        });
      }
    }

    /* Üst duyuru şeridi: kapat (×) butonu varsa şeridi gizle. */
    document.querySelectorAll('[data-feature="announcement"] [data-close]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var bar = btn.closest('[data-feature="announcement"]');
        if (bar) { bar.style.display = "none"; }
      });
    });

    /* "Yukarı çık" butonu: aşağı kaydırınca görünür; tıklayınca yumuşak yukarı. */
    var toTop = document.getElementById("back_to_top");
    if (toTop) {
      var toggleTop = function () {
        toTop.style.display = (window.scrollY > 400) ? "" : "none";
      };
      toggleTop();
      window.addEventListener("scroll", toggleTop, { passive: true });
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* Mobil menü aç/kapa: nav_toggle bir sonraki <ul>'u veya [data-nav-menu]'yu açar. */
    var navToggle = document.getElementById("nav_toggle");
    if (navToggle) {
      navToggle.addEventListener("click", function () {
        var menu = document.querySelector('[data-nav-menu]')
          || navToggle.closest("nav").querySelector("ul");
        if (menu) { menu.classList.toggle("hidden"); }
      });
    }

    /* Açık/koyu tema geçişi: theme_toggle <html>'e 'dark' sınıfını ekler/kaldırır. */
    var themeToggle = document.getElementById("theme_toggle");
    if (themeToggle) {
      if (localStorage.getItem("wf_theme") === "dark") {
        document.documentElement.classList.add("dark");
      }
      themeToggle.addEventListener("click", function () {
        var isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("wf_theme", isDark ? "dark" : "light");
      });
    }

    /* Kullanıcı-tanımlı buton aksiyonları (data-action): sınırlı, statik-site uyumlu
       davranışlar — yukarı çık / mobil menü aç / aynı sayfada bölüme yumuşak kaydır.
       Navigasyon (bölüm/sayfa/URL) zaten <a href> ile çalışır; bu yalnız ek davranıştır. */
    document.querySelectorAll('[data-action]').forEach(function (el) {
      el.addEventListener("click", function (e) {
        var action = el.getAttribute("data-action");
        if (action === "back-to-top") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (action === "open-menu") {
          e.preventDefault();
          var nav = document.getElementById("nav_toggle");
          var menu = document.querySelector('[data-nav-menu]')
            || (nav && nav.closest("nav") ? nav.closest("nav").querySelector("ul") : null);
          if (menu) { menu.classList.toggle("hidden"); }
        } else if (action === "scroll-to") {
          var href = el.getAttribute("href") || "";
          var hashIdx = href.indexOf("#");
          if (hashIdx >= 0) {
            var id = href.substring(hashIdx + 1);
            var target = id ? document.getElementById(id) : null;
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
          }
        }
      });
    });

    /* İletişim formu — AJAX gönderim (backend/DB yok; form-backend servisine fetch).
       Sayfada kal + başarı/hata göster; yönlendirme yok. JS yoksa form native POST eder
       (progressive enhancement). Honeypot doluysa sessizce iptal (bot). */
    document.querySelectorAll('form[data-feature="contactForm"]').forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = form.querySelector("[data-form-status]");
        var btn = form.querySelector('button[type="submit"], [type="submit"]');
        /* Honeypot: ekran dışı gizli alan doluysa bot → sessiz iptal. */
        var honey = form.querySelector('input[name="botcheck"], input[name="_gotcha"], input[name="_honey"]');
        if (honey && honey.value) { return; }
        var show = function (ok) {
          if (!status) { return; }
          status.hidden = false;
          status.textContent = status.getAttribute(ok ? "data-success" : "data-error") || "";
          status.style.color = ok ? "#16a34a" : "#dc2626";
        };
        var btnText = btn ? btn.textContent : null;
        if (btn) { btn.disabled = true; btn.textContent = "Gönderiliyor…"; }
        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        }).then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; })
            .catch(function () { return { ok: res.ok, data: {} }; });
        }).then(function (r) {
          /* Başarı = HTTP ok ve yanıt 'success' alanı açıkça false değil. Sağlayıcılar
             farklı döner: Web3Forms {success:true/false}, Formspree (success alanı yok),
             FormSubmit {success:"true"} (string). Bu yüzden "false değilse başarı". */
          var s = r.data ? r.data.success : undefined;
          var success = r.ok && s !== false && s !== "false";
          show(success);
          if (success) { form.reset(); }
        }).catch(function () {
          show(false);
        }).finally(function () {
          if (btn) { btn.disabled = false; if (btnText !== null) { btn.textContent = btnText; } }
        });
      });
    });
  });
})();
