(function () {
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const list = arr => (arr || []).map(x => `<span>${esc(x)}</span>`).join('');
  const href = url => url ? esc(url) : '#';

  async function loadJSON(path, fallback) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status);
      return await response.json();
    } catch (error) {
      console.warn(`Could not load ${path}`, error);
      return fallback;
    }
  }

  function renderSite(site, projects, gallery) {
    document.title = `${site.hero.name} | ${site.hero.role}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `${site.hero.name} — ${site.hero.role}. ${site.hero.intro}`;

    const profile = site.hero.profileImage
      ? `<img src="${href(site.hero.profileImage)}" alt="${esc(site.hero.name)}" class="hero-profile-img">`
      : `<div class="profile-placeholder"><i class="fa-solid fa-user"></i></div>`;

    document.querySelector('#home').innerHTML = `
      <div class="hero-grid"></div><div class="container position-relative"><div class="row align-items-center min-vh-100 py-5">
        <div class="col-lg-8" data-aos="fade-up">
          <span class="eyebrow"><span class="pulse"></span>${esc(site.hero.eyebrow)}</span>
          <h1 class="display-title">${esc(site.hero.name)}<br><span>${esc(site.hero.role)}</span></h1>
          <p class="lead-copy">${esc(site.hero.intro)}</p>
          <div class="d-flex flex-wrap gap-3 mt-4">
            <a class="btn btn-accent btn-lg" href="#projects">View My Projects <i class="fa-solid fa-arrow-right ms-2"></i></a>
            <a class="btn btn-outline-light btn-lg" href="#contact">Contact Me</a>
            ${site.hero.resumeUrl ? `<a class="btn btn-outline-light btn-lg" href="${href(site.hero.resumeUrl)}" target="_blank" rel="noopener">Resume <i class="fa-solid fa-file-arrow-down ms-2"></i></a>` : ''}
          </div>
          <div class="hero-meta mt-5"><span><i class="fa-solid fa-location-dot"></i> ${esc(site.hero.location)}</span><span><i class="fa-solid fa-envelope"></i> ${esc(site.hero.email)}</span></div>
        </div>
        <div class="col-lg-4 d-none d-lg-block" data-aos="fade-left" data-aos-delay="150"><div class="hero-profile-wrap">${profile}</div><div class="code-card mt-4"><div class="code-top"><span></span><span></span><span></span></div><pre><code><span class="code-key">const</span> developer = {
  name: <span class="code-string">"${esc(site.hero.name)}"</span>,
  role: <span class="code-string">"Full Stack Dev"</span>,
  creative: <span class="code-bool">true</span>
};</code></pre></div></div>
      </div></div>`;

    document.querySelector('#about').innerHTML = `<div class="container"><div class="row g-5 align-items-center"><div class="col-lg-5" data-aos="fade-right"><p class="section-kicker">01 / About</p><h2 class="section-title">${esc(site.about.title).replace('Designer eye.', '<span>Designer eye.</span>')}</h2></div><div class="col-lg-7" data-aos="fade-left">${site.about.paragraphs.map((p,i)=>`<p class="${i===0?'body-lg':'body-muted'} ${i===site.about.paragraphs.length-1?'mb-0':''}">${esc(p)}</p>`).join('')}</div></div></div>`;

    document.querySelector('#skills').innerHTML = `<div class="container"><div class="row mb-5" data-aos="fade-up"><div class="col-lg-7"><p class="section-kicker">02 / Skills</p><h2 class="section-title">Tools I use to <span>build & create.</span></h2></div></div><div class="row g-4">${site.skills.map((s,i)=>`<div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="${i*80}"><div class="skill-card"><i class="fa-solid ${esc(s.icon)}"></i><h3>${esc(s.title)}</h3><p>${esc((s.items||[]).join(', '))}.</p></div></div>`).join('')}</div></div>`;

    document.querySelector('#projects').innerHTML = `<div class="container"><div class="row align-items-end mb-5" data-aos="fade-up"><div class="col-lg-8"><p class="section-kicker">03 / Selected Work</p><h2 class="section-title">Development + <span>creative work.</span></h2></div><div class="col-lg-4 text-lg-end"><p class="body-muted mb-0">A mixed portfolio highlighting both technical and visual work.</p></div></div><div class="row g-4">${projects.map((p,i)=>`<div class="col-lg-${i%2===0?'7':'5'}" data-aos="fade-up" data-aos-delay="${i*80}"><article class="project-card ${i===0?'project-featured':i===1?'project-design':'project-placeholder'}" ${p.image?`style="background-image:linear-gradient(180deg,rgba(11,18,32,.2),rgba(11,18,32,.96)),url('${href(p.image)}')"`:''}><div class="project-number">${String(i+1).padStart(2,'0')}</div><div class="project-content"><span class="tag">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="tech-row">${list(p.technologies)}</div><div class="project-links">${p.liveUrl?`<a href="${href(p.liveUrl)}" target="_blank" rel="noopener" class="text-link">Live Demo <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`:''}${p.githubUrl?`<a href="${href(p.githubUrl)}" target="_blank" rel="noopener" class="text-link">GitHub <i class="fa-brands fa-github"></i></a>`:''}</div></div></article></div>`).join('')}</div></div>`;

    document.querySelector('#gallery').innerHTML = `<div class="container"><div class="row mb-5" data-aos="fade-up"><div class="col-lg-8"><p class="section-kicker">04 / Design</p><h2 class="section-title">A visual side of <span>the portfolio.</span></h2><p class="body-muted">Selected graphic design work and creative experiments.</p></div></div><div class="row g-3">${gallery.map(g=>`<div class="col-md-4"><a class="gallery-tile glightbox" href="${href(g.image)}" data-gallery="design" data-title="${esc(g.title)}"><div class="gallery-placeholder"><i class="fa-solid fa-image"></i><span>${esc(g.title)}</span></div></a></div>`).join('')}</div></div>`;

    document.querySelector('#education').innerHTML = `<div class="container"><div class="row g-5"><div class="col-lg-4" data-aos="fade-right"><p class="section-kicker">05 / Education</p><h2 class="section-title">Learning that <span>keeps moving.</span></h2></div><div class="col-lg-8" data-aos="fade-left">${site.education.map(e=>`<div class="timeline-item"><span class="timeline-dot"></span><div><span class="timeline-year">${esc(e.year)}</span><h3>${esc(e.degree)}</h3><p>${esc(e.institution)}</p><p class="body-muted">${esc(e.description)}</p></div></div>`).join('')}</div></div></div>`;

    document.querySelector('#why').innerHTML = `<div class="container"><div class="row g-5 align-items-center"><div class="col-lg-5" data-aos="fade-right"><p class="section-kicker">06 / Why me</p><h2 class="section-title">Curious. Creative.<br><span>Career focused.</span></h2></div><div class="col-lg-7" data-aos="fade-left"><div class="why-list">${site.whyMe.map((w,i)=>`<div><strong>${String(i+1).padStart(2,'0')}</strong><span><b>${esc(w.title)}.</b> ${esc(w.description)}</span></div>`).join('')}</div></div></div></div>`;

    document.querySelector('#contact').innerHTML = `<div class="container" data-aos="fade-up"><div class="contact-panel"><p class="section-kicker">07 / Contact</p><h2 class="display-contact">${esc(site.contact.headline)}</h2><p class="lead-copy">${esc(site.contact.description)}</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn btn-accent btn-lg" href="mailto:${esc(site.contact.email)}">Email Me <i class="fa-solid fa-paper-plane ms-2"></i></a>${site.contact.github?`<a class="btn btn-outline-light btn-lg" href="${href(site.contact.github)}" target="_blank" rel="noopener">GitHub <i class="fa-brands fa-github ms-2"></i></a>`:''}${site.contact.linkedin?`<a class="btn btn-outline-light btn-lg" href="${href(site.contact.linkedin)}" target="_blank" rel="noopener">LinkedIn <i class="fa-brands fa-linkedin ms-2"></i></a>`:''}</div><div class="contact-details mt-5"><span><i class="fa-solid fa-envelope"></i> ${esc(site.contact.email)}</span>${site.contact.phone?`<span><i class="fa-solid fa-phone"></i> ${esc(site.contact.phone)}</span>`:''}<span><i class="fa-solid fa-location-dot"></i> ${esc(site.contact.location)}</span></div></div></div>`;

    document.querySelector('footer').innerHTML = `<div class="container d-flex flex-column flex-md-row justify-content-between gap-2 py-4"><span>${esc(site.footer.copyright)}</span><span>${esc(site.footer.credit)}</span></div>`;

    const lightbox = GLightbox({ selector: '.glightbox' });
    AOS.init({ once: true, duration: 700, offset: 80 });
  }

  const fallbackSite = {hero:{name:'Nithin S P',role:'Full Stack Developer • Graphic Designer',eyebrow:'Available for opportunities',intro:'I build modern, responsive web experiences and turn ideas into practical digital solutions—with a creative eye for design.',location:'Kulasekharam',email:'spbrothers4@gmail.com',profileImage:'',resumeUrl:''},about:{title:'Developer mindset. Designer eye.',paragraphs:['Hello! I’m Nithin S P, a Full Stack Developer and Graphic Designer passionate about technology, web development, and creating things that solve real problems.','I enjoy learning by building projects and exploring new technologies. I combine technical knowledge with an eye for visual design to create experiences that are useful, responsive, and engaging.','I’m looking for an opportunity where I can learn from experienced teams, contribute to real-world projects, and grow as a developer while creating meaningful work.']},skills:[],education:[],whyMe:[],contact:{headline:'Let’s build something worth showing.',description:'I’m open to job opportunities, internships, freelance projects and collaborations.',email:'spbrothers4@gmail.com',location:'Kulasekharam'},footer:{copyright:'© 2026 Nithin S P. All Rights Reserved.',credit:'Designed & Developed by Nithin S P.'}};
  const fallbackProjects = [];
  const fallbackGallery = {images: []};

  Promise.all([loadJSON('content/site.json', fallbackSite), loadJSON('content/projects.json', {projects: fallbackProjects}), loadJSON('content/gallery.json', fallbackGallery)]).then(([site, projectsData, gallery]) => renderSite(site, projectsData.projects || [], gallery.images || []));
})();
