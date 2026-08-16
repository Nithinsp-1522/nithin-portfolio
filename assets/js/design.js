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

  function fileUrl(value) {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;

    const deploymentRoot = new URL('.', document.baseURI);
    const path = String(value).replace(/^\.?\/+/, '');
    return new URL(path, deploymentRoot).href;
  }

  function getExtension(value) {
    if (!value) return '';
    const clean = String(value).split('?')[0].split('#')[0];
    const parts = clean.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function isImageFile(value) {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(getExtension(value));
  }

  function getFileType(value) {
    const ext = getExtension(value);
    return ext ? ext.toUpperCase() : 'FILE';
  }

  function getFileIcon(value) {
    const ext = getExtension(value);

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) return 'fa-regular fa-image';
    if (ext === 'pdf') return 'fa-regular fa-file-pdf';
    if (ext === 'psd') return 'fa-solid fa-file';
    if (ext === 'ai') return 'fa-solid fa-pen-nib';
    if (ext === 'cdr') return 'fa-solid fa-vector-square';
    if (['zip', 'rar', '7z'].includes(ext)) return 'fa-regular fa-file-zipper';
    if (['doc', 'docx'].includes(ext)) return 'fa-regular fa-file-word';
    if (['xls', 'xlsx'].includes(ext)) return 'fa-regular fa-file-excel';
    if (['ppt', 'pptx'].includes(ext)) return 'fa-regular fa-file-powerpoint';

    return 'fa-regular fa-file';
  }

  function getFileName(value) {
    if (!value) return '';
    try {
      const clean = String(value).split('?')[0].split('#')[0];
      return decodeURIComponent(clean.split('/').pop() || '');
    } catch (_) {
      return String(value).split('/').pop() || '';
    }
  }

  async function load() {
    try {
      const r = await fetch('content/design.json', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      app.innerHTML = `
        <div class="empty-files">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>Could not load the design portfolio.</div>
        </div>`;
      throw e;
    }
  }

  function renderFolders(folders) {
    breadcrumb.innerHTML = '<span>Design</span>';

    if (!folders.length) {
      app.innerHTML = `
        <div class="empty-files">
          <i class="fa-regular fa-folder-open d-block"></i>
          <div>No design folders yet.</div>
          <small>Add Photoshop, Illustrator, CorelDRAW or other folders from Admin.</small>
        </div>`;
      return;
    }

    app.innerHTML = `
      <div class="row g-4">
        ${folders.map(f => {
          const count = (f.files || []).length;
          return `
            <div class="col-md-6 col-xl-4">
              <a class="folder-card" href="design.html?folder=${encodeURIComponent(f.slug)}">
                <div class="folder-icon-wrap">
                  <div class="folder-icon">
                    <i class="${esc(f.icon || 'fa-solid fa-folder')}"></i>
                  </div>
                  <span class="folder-open-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                </div>
                <h2>${esc(f.name)}</h2>
                <p>${esc(f.description || '')}</p>
                <div class="folder-meta">
                  <span><i class="fa-regular fa-folder-open"></i>${count} ${count === 1 ? 'file' : 'files'}</span>
                  <span>Open <i class="fa-solid fa-arrow-right"></i></span>
                </div>
              </a>
            </div>`;
        }).join('')}
      </div>`;
  }

  function renderFiles(folder) {
    breadcrumb.innerHTML = `
      <a href="design.html"><i class="fa-solid fa-arrow-left me-2"></i>All Design Folders</a>
      <span class="mx-2">/</span>
      <span>${esc(folder.name)}</span>`;

    const files = folder.files || [];

    const cards = files.map(f => {
      const original = fileUrl(f.file);
      const preview = fileUrl(f.image);
      const imagePreview = preview || (isImageFile(f.file) ? original : '');
      const extension = getFileType(f.file);
      const icon = getFileIcon(f.file);
      const fileName = getFileName(f.file);

      const previewHtml = imagePreview
        ? `
          <a class="file-preview glightbox" href="${esc(imagePreview)}" data-gallery="${esc(folder.slug)}" data-title="${esc(f.title)}">
            <img src="${esc(imagePreview)}" alt="${esc(f.title)}" loading="lazy">
            <span class="preview-badge"><i class="fa-solid fa-expand"></i> Preview</span>
          </a>`
        : `
          <div class="file-preview file-preview-placeholder">
            <div class="file-type-icon"><i class="${esc(icon)}"></i></div>
            <span class="file-extension">${esc(extension)}</span>
          </div>`;

      const downloadHtml = original
        ? `
          <a class="file-download" href="${esc(original)}" download target="_blank" rel="noopener" title="Download original ${esc(extension)} file">
            <i class="fa-solid fa-download"></i>
            <span>Download Original</span>
          </a>`
        : `
          <span class="file-download file-download-disabled">
            <i class="fa-solid fa-ban"></i>
            <span>File unavailable</span>
          </span>`;

      return `
        <div class="col-md-6 col-lg-4">
          <article class="file-card">
            ${previewHtml}
            <div class="file-info">
              <div class="file-topline">
                <span class="file-type"><i class="${esc(icon)}"></i>${esc(extension)}</span>
                <span class="file-source">Original file</span>
              </div>
              <h3>${esc(f.title)}</h3>
              ${f.description ? `<p>${esc(f.description)}</p>` : ''}
              ${fileName ? `<div class="file-name"><i class="fa-regular fa-file"></i>${esc(fileName)}</div>` : ''}
              <div class="file-actions">${downloadHtml}</div>
            </div>
          </article>
        </div>`;
    }).join('');

    app.innerHTML = `
      <div class="file-toolbar">
        <div class="folder-heading">
          <div class="folder-heading-kicker"><i class="fa-solid fa-folder-open"></i> Design folder</div>
          <h2>${esc(folder.name)}</h2>
          <p>${esc(folder.description || '')}</p>
        </div>
        <a class="back-link" href="design.html"><i class="fa-solid fa-arrow-left"></i>Back to folders</a>
      </div>
      ${files.length
        ? `<div class="row g-4">${cards}</div>`
        : `<div class="empty-files"><i class="fa-regular fa-folder-open d-block"></i><div>No files in this folder yet.</div><small>Add files from the Design Portfolio section in Admin.</small></div>`}
    `;

    if (window.GLightbox) {
      GLightbox({ selector: '.glightbox' });
    }
  }

  load()
    .then(data => {
      const folders = data.folders || [];
      const slug = new URLSearchParams(location.search).get('folder');
      const folder = folders.find(f => f.slug === slug);
      if (folder) renderFiles(folder);
      else renderFolders(folders);
    })
    .catch(() => {});
})();
