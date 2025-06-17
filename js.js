const langSwitcherHtml = ` <div class="lang-switcher">
<button data-lang="en" class="active">EN</button>
<button data-lang="ro">RO</button>
<button data-lang="ru">RU</button>
<button id="print-btn" onclick="window.print();"
class="icon print-btn" title="Print or Save PDF" style="margin-left:auto;">
<svg style="width:20px; height:20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#0077b7" d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></button></div>`;
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
