{{ $searchData := resources.Get "js/search-data.json" | resources.ExecuteAsTemplate "js/search-data.json" . | resources.Minify | resources.Fingerprint }}

(function () {
  const searchDataURL = '{{ $searchData.RelPermalink }}';

  const input = document.querySelector('#book-search-input');
  const results = document.querySelector('#book-search-results');

  if (!input) {
    return
  }

  input.addEventListener('focus', init);
  input.addEventListener('keyup', search);

  document.addEventListener('keypress', focusSearchFieldOnKeyPress);

  /**
   * @param {Event} event
   */
  function focusSearchFieldOnKeyPress(event) {
    if (input === document.activeElement) {
      return;
    }

    const characterPressed = String.fromCharCode(event.charCode);
    if (!isHotkey(characterPressed)) {
      return;
    }

    input.focus();
    event.preventDefault();
  }

  /**
   * @param {String} character
   * @returns {Boolean} 
   */
  function isHotkey(character) {
    const dataHotkeys = input.getAttribute('data-hotkeys') || '';
    return dataHotkeys.indexOf(character) >= 0;
  }

  function init() {
    input.removeEventListener('focus', init); // init once
    input.required = true;

    fetch(searchDataURL)
      .then(pages => pages.json())
      .then(pages => {
        window.bookSearchIndex = new FlexSearch.Document({
            tokenize: "forward",
            document: {
                id: "id",
                store: ["title", "href", "tags", "preview"],
                index: ["title", "tags", "content"]
            }
        });

        // TOOD: This won't likely scale. Not a problem _for now_.
        pages.forEach(page => { window.bookSearchIndex.add(page); });
      })
      .then(() => input.required = false)
      .then(search);
  }

  function search() {
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }

    if (!input.value) {
      return;
    }

    // TODO explore asyncSearch (triggers flicker as of now).
    let searchHitIndices = window.bookSearchIndex.search(input.value, { limit: 10, enrich: true });
    const mapResults = new Map();
    // Would love to have a flatMap
    searchHitIndices.forEach((searchResultIndex) => {
      searchResultIndex.result.forEach(pageHit => {
        mapResults.set(pageHit.id, pageHit.doc);
      });
     });

    mapResults.forEach((page) => {
      results.appendChild(buildPreview(page));
    });
  }

  // Has to be consistent with partials/component/preview.html
  function buildPreview(page) {
    const li = element('<li></li>')
    const a = element('<a></a>')
    const div = element('<div></div>')
    const title = element('<span></span>')
    const content = element('<span></span>')

    a.href = page.href;
    title.textContent = page.title;
    content.textContent = page.preview;

    div.classList.add('item-preview');
    title.classList.add('item-preview-title');
    content.classList.add('item-preview-content');

    div.appendChild(title);
    div.appendChild(element('<br>'));
    div.appendChild(content);
    a.appendChild(div);
    li.appendChild(a);

    return li;
  }

  /**
   * @param {String} content
   * @returns {Node}
   */
  function element(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.firstChild;
  }
})();
