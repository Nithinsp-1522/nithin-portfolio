(function () {
  const app = document.getElementById('designApp');
  const breadcrumb = document.getElementById('designBreadcrumb');

  const esc = (v) =>
    String(v ?? '').replace(/[&<>'"]/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c]));

  // Resolve Decap upload paths correctly on both:
  // GitHub Pages: /nithin-portfolio/
  // Netlify: /
  function fileUrl(value) {
    if (!value) return '';

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const deploymentRoot = new URL('.', document.baseURI);
    const path = String(value).replace(/^\.?\/+/, '');

    return new URL(path, deploymentRoot).href;
  }

  // Get file extension
  function getExtension(value) {
    if (!value) return '';

    const clean = String(value)
      .split('?')[0]
      .split('#')[0];

    const parts = clean.split('.');
    return parts.length > 1
      ? parts.pop().toLowerCase()
      : '';
  }

  // Check whether a file can be previewed as an image
  function isImageFile(value) {
    return [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'bmp',
      'avif'
    ].includes(getExtension(value));
  }

  // Friendly file type
  function getFileType(value) {
    const ext = getExtension(value);

    if (!ext) return 'FILE';

    return ext.toUpperCase();
  }

  // Font Awesome icon for different file types
  function getFileIcon(value) {
    const ext = getExtension(value);

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) {
      return 'fa-regular fa-image';
    }

    if (ext === 'pdf') {
      return 'fa-regular fa-file-pdf';
    }

    if (ext === 'psd') {
      return 'fa-solid fa-file';
    }

    if (ext === 'ai') {
      return 'fa-solid fa-pen-nib';
    }

    if (ext === 'cdr') {
      return 'fa-solid fa-vector-square';
    }

    if (['zip', 'rar', '7z'].includes(ext)) {
      return 'fa-regular fa-file-zipper';
    }

    if (['doc', 'docx'].includes(ext)) {
      return 'fa-regular fa-file-word';
    }

    if (['xls', 'xlsx'].includes(ext)) {
      return 'fa-regular fa-file-excel';
    }

    if (['ppt', 'pptx'].includes(ext)) {
      return 'fa-regular fa-file-powerpoint';
    }

    return 'fa-regular fa-file';
  };

  async function load() {
    try {
      const r = await fetch('content/design.json', {
        cache: 'no-store'
      });

      if (!r.ok) {
        throw new Error(r.status);
      }

      return await r.json();
    } catch (e) {
      app.innerHTML = `
        <div class="empty-files">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>Could not load the design portfolio.</div>
        </div>
      `;

      throw e;
    }
  }

  function renderFolders(folders) {
    breadcrumb.innerHTML = '<span>Design</span>';

    app.innerHTML = `
      <div class="row g-4">
        ${folders.map(f => `
          <div class="col-md-6 col-xl-4">
            <a
              class="folder-card"
              href="design.html?folder=${encodeURIComponent(f.slug)}"
            >
              <div class="folder-icon">
                <i class="${esc(f.icon || 'fa-solid fa-folder')}"></i>
              </div>

              <h2>${esc(f.name)}</h2>

              <p>${esc(f.description || '')}</p>

              <div class="folder-count">
                <i class="fa-regular fa-folder-open me-2"></i>
                ${(f.files || []).length} files
              </div>
            </a>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderFiles(folder) {
    breadcrumb.innerHTML = `
      <a href="design.html">
        <i class="fa-solid fa-arrow-left me-2"></i>
        All Design Folders
      </a>

      <span class="mx-2">/</span>

      <span>${esc(folder.name)}</span>
    `;

    const files = folder.files || [];

    const cards = files.map(f => {
      const original = fileUrl(f.file);
      const preview = fileUrl(f.image);

      // If no separate preview image was provided,
      // automatically use the original file when it is an image.
      const imagePreview =
        preview ||
        (isImageFile(f.file) ? original : '');

      const extension = getFileType(f.file);
      const icon = getFileIcon(f.file);

      const previewHtml = imagePreview
        ? `
          <a
            class="file-preview glightbox"
            href="${esc(imagePreview)}"
            data-gallery="${esc(folder.slug)}"
            data-title="${esc(f.title)}"
          >
            <img
              src="${esc(imagePreview)}"
              alt="${esc(f.title)}"
              loading="lazy"
            >
          </a>
        `
        : `
          <div class="file-preview file-preview-placeholder">
            <div class="file-type-icon">
              <i class="${esc(icon)}"></i>
            </div>

            <span class="file-extension">
              ${esc(extension)}
            </span>
          </div>
        `;

      const downloadHtml = original
        ? `
          <a
            class="file-download"
            href="${esc(original)}"
            download
            target="_blank"
            rel="noopener"
            title="Download original ${esc(extension)} file"
          >
            <i class="fa-solid fa-download"></i>
            Download Original
          </a>
        `
        : `
          <span class="file-download file-download-disabled">
            <i class="fa-solid fa-ban"></i>
            File unavailable
          </span>
        `;

      return `
        <div class="col-md-6 col-lg-4">

          <article class="file-card">

            ${previewHtml}

            <div class="file-info">

              <div class="file-type">
                <i class="${esc(icon)}"></i>
                ${esc(extension)}
              </div>

              <h3>${esc(f.title)}</h3>

              ${
                f.description
                  ? `<p>${esc(f.description)}</p>`
                  : ''
              }

              ${downloadHtml}

            </div>

          </article>

        </div>
      `;
    }).join('');

    app.innerHTML = `
      <div class="file-toolbar">

        <div class="folder-heading">
          <h2>${esc(folder.name)}</h2>

          <p>
            ${esc(folder.description || '')}
          </p>
        </div>

        <a
          class="back-link"
          href="design.html"
        >
          <i class="fa-solid fa-arrow-left"></i>
          Back to folders
        </a>

      </div>

      ${
        files.length
          ? `
            <div class="row g-4">
              ${cards}
            </div>
          `
          : `
            <div class="empty-files">
              <i class="fa-regular fa-folder-open d-block"></i>

              <div>
                No files in this folder yet.
              </div>

              <small>
                Add files from the Design Portfolio section in Admin.
              </small>
            </div>
          `
      }
    `;

    // Initialize image lightbox only for image previews
    if (window.GLightbox) {
      GLightbox({
        selector: '.glightbox'
      });
    }
  }

  load()
    .then(data => {
      const folders = data.folders || [];

      const slug =
        new URLSearchParams(location.search).get('folder');

      const folder =
        folders.find(f => f.slug === slug);

      if (folder) {
        renderFiles(folder);
      } else {
        renderFolders(folders);
      }
    })
    .catch(() => {});
})();
