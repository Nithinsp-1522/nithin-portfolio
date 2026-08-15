(function(){
  const app=document.getElementById('designApp');
  const breadcrumb=document.getElementById('designBreadcrumb');
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const imageUrl=value=>{
    if(!value) return '';
    if(/^https?:\/\//i.test(value)) return value;
    if(value.startsWith('/nithin-portfolio/')) return value;
    if(value.startsWith('/')) return '/nithin-portfolio'+value;
    return value.replace(/^\.\//,'');
  };
  async function load(){
    try{
      const r=await fetch('content/design.json',{cache:'no-store'});
      if(!r.ok) throw new Error(r.status);
      return await r.json();
    }catch(e){
      app.innerHTML='<div class="empty-files"><i class="fa-solid fa-triangle-exclamation"></i><div>Could not load the design portfolio.</div></div>';
      throw e;
    }
  }
  function renderFolders(folders){
    breadcrumb.innerHTML='<span>Design</span>';
    app.innerHTML='<div class="row g-4">'+folders.map(f=>`<div class="col-md-6 col-xl-4"><a class="folder-card" href="design.html?folder=${encodeURIComponent(f.slug)}"><div class="folder-icon"><i class="${esc(f.icon||'fa-solid fa-folder')}"></i></div><h2>${esc(f.name)}</h2><p>${esc(f.description||'')}</p><div class="folder-count"><i class="fa-regular fa-images me-2"></i>${(f.files||[]).length} files</div></a></div>`).join('')+'</div>';
  }
  function renderFiles(folder){
    breadcrumb.innerHTML='<a href="design.html"><i class="fa-solid fa-arrow-left me-2"></i>All Design Folders</a><span class="mx-2">/</span><span>'+esc(folder.name)+'</span>';
    const files=folder.files||[];
    const cards=files.map(f=>{const src=imageUrl(f.image);return `<div class="col-md-6 col-lg-4"><a class="file-card glightbox" href="${esc(src||'#')}" data-gallery="${esc(folder.slug)}" data-title="${esc(f.title)}"><div class="file-preview">${src?`<img src="${esc(src)}" alt="${esc(f.title)}" loading="lazy">`:'<div class="file-placeholder"><i class="fa-regular fa-file-image"></i></div>'}</div><div class="file-info"><h3>${esc(f.title)}</h3>${f.description?`<p>${esc(f.description)}</p>`:''}</div></a></div>`}).join('');
    app.innerHTML=`<div class="file-toolbar"><div class="folder-heading"><h2>${esc(folder.name)}</h2><p>${esc(folder.description||'')}</p></div><a class="back-link" href="design.html"><i class="fa-solid fa-arrow-left"></i>Back to folders</a></div>${files.length?`<div class="row g-4">${cards}</div>`:'<div class="empty-files"><i class="fa-regular fa-folder-open d-block"></i><div>No files in this folder yet.</div><small>Add images from the Design Portfolio section in Admin.</small></div>'}`;
    if(window.GLightbox) GLightbox({selector:'.glightbox'});
  }
  load().then(data=>{const folders=data.folders||[];const slug=new URLSearchParams(location.search).get('folder');const folder=folders.find(f=>f.slug===slug);if(folder) renderFiles(folder); else renderFolders(folders);}).catch(()=>{});
})();
