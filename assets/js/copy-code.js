(function () {
  'use strict';

  var COPY_ICON = '<i class="far fa-copy" aria-hidden="true"></i>';
  var SUCCESS_ICON = '<i class="fas fa-check" aria-hidden="true"></i>';
  var FAIL_ICON = '<i class="fas fa-times" aria-hidden="true"></i>';

  function extractCode(container) {
    // 라인 넘버 테이블(linenos) 사용 시 코드 열만 추출
    var code =
      container.querySelector('td.rouge-code pre') ||
      container.querySelector('pre code') ||
      container.querySelector('pre');
    return code ? code.textContent.replace(/\s+$/, '') : '';
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // 비보안 컨텍스트(http) 폴백
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function showFeedback(button, success) {
    button.classList.add(success ? 'copied' : 'copy-failed');
    button.innerHTML = success ? SUCCESS_ICON : FAIL_ICON;
    button.disabled = true;
    setTimeout(function () {
      button.classList.remove('copied', 'copy-failed');
      button.innerHTML = COPY_ICON;
      button.disabled = false;
    }, 2000);
  }

  function initCopyButtons() {
    var containers = document.querySelectorAll(
      '.page__content div.highlighter-rouge, .page__content figure.highlight'
    );

    containers.forEach(function (container) {
      if (container.querySelector('.copy-code-button')) return;
      if (!container.querySelector('pre')) return;

      var button = document.createElement('button');
      button.className = 'copy-code-button';
      button.type = 'button';
      button.title = '코드 복사';
      button.setAttribute('aria-label', '코드 복사');
      button.innerHTML = COPY_ICON;

      button.addEventListener('click', function () {
        copyText(extractCode(container)).then(
          function () { showFeedback(button, true); },
          function () { showFeedback(button, false); }
        );
      });

      container.appendChild(button);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButtons);
  } else {
    initCopyButtons();
  }
})();
