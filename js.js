const langSwitcherHtml = ` <div class="lang-switcher">
<button data-lang="en" class="active">EN</button>
<button data-lang="ro">RO</button>
<button data-lang="ru">RU</button>
<button id="print-btn" onclick="window.print();"
class="icon print-btn" title="Print or Save PDF" style="margin-left:auto;">
<i class="fas fa-print" style="justify-content: center ;"></i></button></div>`;
document.querySelectorAll('.container').forEach(container => {
    container.insertAdjacentHTML('afterbegin', langSwitcherHtml);
});
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.lang-switcher button');
    const containers = {
        en: document.querySelector('.container.lang-en'),
        ro: document.querySelector('.container.lang-ro'),
        ru: document.querySelector('.container.lang-ru')
    };
    const toc = document.querySelector('.toc');
    const tocLangEn = toc.querySelector('.lang-en');
    const tocLangRo = toc.querySelector('.lang-ro');
    const tocLangRu = toc.querySelector('.lang-ru');
    function updateToc(lang) {
        tocLangEn.style.display = (lang === 'en') ? 'block' : 'none';
        tocLangRo.style.display = (lang === 'ro') ? 'block' : 'none';
        tocLangRu.style.display = (lang === 'ru') ? 'block' : 'none';
    }
    let activeLang = localStorage.getItem('cv_active_lang');
    if (activeLang !== 'en' && activeLang !== 'ro' && activeLang !== 'ru') {
        activeLang = 'en';
        localStorage.setItem('cv_active_lang', 'en');
    }
    updateToc(activeLang);
    Object.keys(containers).forEach(l => {
        if (l === activeLang) {
            containers[l].classList.remove('hide');
        } else {
            containers[l].classList.add('hide');
        }
    });
    document.querySelectorAll('.lang-switcher').forEach(ls => {
        ls.querySelectorAll('button').forEach(b => {
            if (b.getAttribute('data-lang') === activeLang) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    });
    buttons.forEach(btn => {
        if (btn.hasAttribute('data-lang')) {
            btn.addEventListener('click', function () {
                if (btn.disabled) return;
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const lang = btn.getAttribute('data-lang');
                activeLang = lang;
                localStorage.setItem('cv_active_lang', lang);
                Object.keys(containers).forEach(l => {
                    if (l === lang) {
                        containers[l].classList.remove('hide');
                    } else {
                        containers[l].classList.add('hide');
                    }
                });
                updateToc(lang);
                document.querySelectorAll('.lang-switcher').forEach(ls => {
                    ls.querySelectorAll('button').forEach(b => {
                        if (b.getAttribute('data-lang') === lang) {
                            b.classList.add('active');
                        } else {
                            b.classList.remove('active');
                        }
                    });
                });
            });
        }
    });
});
