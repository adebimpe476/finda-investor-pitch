(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Soft reveal; no network library or broken invisible text if observer is missing.
  if ('IntersectionObserver' in window && !reducedMotion) {
    document.documentElement.classList.add('js-motion');
    const reveal = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -18px 0px' });
    $$('.reveal').forEach(el => reveal.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('is-visible'));

  // Native anchors remain functional even if this script fails.
  const chapterLinks = $$('.chapters [data-chapter]');
  const chapterCounter = $('#chapter-count');
  const readingFill = $('#reading-fill');
  const sections = $$('[data-section]');
  const progressUpdate = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (readingFill) readingFill.style.width = `${Math.min(100, Math.max(0, window.scrollY / maxScroll * 100))}%`;
  };
  document.addEventListener('scroll', progressUpdate, { passive: true }); progressUpdate();
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const selected = visible[0]?.target;
      if (!selected) return;
      chapterLinks.forEach(link => link.classList.toggle('current', link.dataset.chapter === selected.id));
      if (chapterCounter) chapterCounter.textContent = selected.dataset.number || '01';
    }, { threshold: [0.16, 0.28, 0.5], rootMargin: '-10% 0px -30% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }
  // Accessible mobile nav that closes on every link and Escape.
  const menu = $('#mobile-menu');
  const toggle = $('.menu-toggle');
  function closeMenu() { menu?.classList.remove('active'); menu?.setAttribute('aria-hidden', 'true'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.setAttribute('aria-label', 'Open menu'); }
  toggle?.addEventListener('click', () => {
    const willOpen = !menu.classList.contains('active');
    menu.classList.toggle('active', willOpen);
    menu.setAttribute('aria-hidden', String(!willOpen));
    toggle.setAttribute('aria-expanded', String(willOpen));
    toggle.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
  });
  $$('.mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') {closeMenu(); closeSources();} });

  // Horizontal product narrative: swipe native, arrows / numbered tabs / keyboard.
  const rail = $('#product-rail');
  const cards = $$('[data-card]');
  const tabs = $$('[data-rail]');
  const meter = $('#rail-meter-fill');
  const position = $('#rail-position');
  let current = 0;
  function updateRail(index) {
    current = Math.max(0, Math.min(cards.length - 1, index));
    tabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === current)));
    if (meter) meter.style.width = `${100 / cards.length * (current + 1)}%`;
    if (position) position.textContent = `${String(current + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  function goToCard(index) {
    if (!cards.length || !rail) return;
    const next = Math.max(0, Math.min(cards.length - 1, index));
    cards[next].scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', inline: 'start', block: 'nearest' });
    updateRail(next);
  }
  $('#rail-prev')?.addEventListener('click', () => goToCard(current - 1));
  $('#rail-next')?.addEventListener('click', () => goToCard(current + 1));
  tabs.forEach((tab, i) => tab.addEventListener('click', () => goToCard(i)));
  rail?.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight') {ev.preventDefault();goToCard(current + 1);} if(ev.key === 'ArrowLeft') {ev.preventDefault();goToCard(current - 1);} });
  let scrollRaf = 0;
  rail?.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const viewportLeft = rail.getBoundingClientRect().left;
      let nearest = 0, distance = Infinity;
      cards.forEach((card, i) => { const d = Math.abs(card.getBoundingClientRect().left - viewportLeft); if(d < distance){nearest = i;distance = d;} });
      updateRail(nearest);
    });
  }, {passive:true});
  updateRail(0);

  // A native pointer-driven ambient light. Not a full-screen overlay that captures clicks.
  const glow = $('#cursor-glow');
  if (glow && !reducedMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.addEventListener('pointermove', (ev) => { glow.style.transform = `translate3d(${ev.clientX - 195}px,${ev.clientY - 195}px,0)`; }, {passive:true});
  }
  // Interactive tilt is restrained and disabled for touch/reduced-motion.
  if (!reducedMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', ev => {
        const rect = card.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width - .5;
        const y = (ev.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(1100px) rotateY(${x * 3}deg) rotateX(${y * -3}deg) translateY(-3px)`;
      }, {passive:true});
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
  // Count only when seen; the values remain readable if JavaScript fails.
  if ('IntersectionObserver' in window && !reducedMotion) {
    const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const value = Number(el.dataset.counter);
      const decimals = String(el.dataset.counter).includes('.') ? 1 : 0;
      const start = performance.now(), duration = 1400;
      function tick(now) {
        const t = Math.min(1,(now - start)/duration);
        const progress = 1-Math.pow(1-t,4);
        el.textContent = (value * progress).toLocaleString('en-NG',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }), {threshold:.45});
    $$('[data-counter]').forEach(el => counterObserver.observe(el));
  }

  // Independent, optional chapter navigation using PageUp/PageDown only while outside inputs.
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
    if (event.key === 'PageDown' || event.key === 'PageUp') {
      const coords = [...sections].map(s => ({ id:s.id, y:Math.abs(s.getBoundingClientRect().top - 90) }));
      coords.sort((a,b) => a.y - b.y);
      const index = sections.findIndex(el=>el.id===coords[0].id);
      const newIdx = Math.max(0,Math.min(sections.length-1,index + (event.key === 'PageDown'?1:-1)));
      if (sections[newIdx]) {event.preventDefault();sections[newIdx].scrollIntoView({behavior: reducedMotion?'instant':'smooth'});}
    }
  });

  // Accessible research panel to substantiate numbers; also direct hash opens it.
  const sourceModal = $('#sources');
  let previousFocus = null;
  function openSources(event) {
    event?.preventDefault();
    previousFocus = document.activeElement;
    sourceModal.classList.add('open'); sourceModal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden'; $('#close-sources')?.focus();
  }
  function closeSources() {
    if (!sourceModal?.classList.contains('open')) return;
    sourceModal.classList.remove('open');sourceModal.setAttribute('aria-hidden','true');
    document.body.style.overflow=''; previousFocus?.focus?.();
  }
  $('#sources-trigger')?.addEventListener('click', openSources);
  $('#close-sources')?.addEventListener('click', closeSources);
  $$('[data-close-sources]').forEach(el=>el.addEventListener('click',closeSources));
  sourceModal?.addEventListener('keydown', ev => {
    if (ev.key !== 'Tab') return;
    const targets = $$('button,a[href]',sourceModal).filter(el=>el.offsetParent!==null);
    if(!targets.length)return;
    const first=targets[0],last=targets.at(-1);
    if(ev.shiftKey && document.activeElement===first){ev.preventDefault();last.focus();}
    else if(!ev.shiftKey && document.activeElement===last){ev.preventDefault();first.focus();}
  });

  // The copy button works after real hosting, but never claims to have published the site.
  const toast = $('#toast'); let toastTimer;
  function showToast(message) { if(!toast)return;toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600); }
  $('#share-deck')?.addEventListener('click', async () => {
    if (location.protocol === 'file:') { showToast('Publish with GitHub Pages first to get a shareable link'); return; }
    try {
      await navigator.clipboard.writeText(location.href.split('#')[0]);
      showToast('Pitch link copied');
    } catch(e) { showToast('Copy the address from your browser'); }
  });

  // Ambient particles: canvas is absolutely pointer-events:none, high-DPI bounded, hidden on reduced motion / background tab.
  const canvas = $('#particle-field');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d',{alpha:true});
    if (ctx) {
      let points=[],w=0,h=0,frame=0,raf=0;
      let visible = true;
      function resize(){
        const rect=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.7);
        w=rect.width;h=rect.height;canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);
        points=Array.from({length:Math.min(70,Math.floor(w/19))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+.5,v:Math.random()*.33+.08,alpha:Math.random()*.42+.1}));
      }
      function paint(){
        if(!visible)return;
        frame++;ctx.clearRect(0,0,w,h);
        for(const p of points){p.y-=p.v;if(p.y<0)p.y=h;ctx.beginPath();ctx.fillStyle=`rgba(141,255,182,${p.alpha})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
        raf=requestAnimationFrame(paint);
      }
      resize();paint();
      window.addEventListener('resize',()=>{cancelAnimationFrame(raf);resize();if(visible)paint();},{passive:true});
      document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)paint();else cancelAnimationFrame(raf);});
    }
  }
  // Progressive enhancement: if a hash is supplied, the site opens that chapter directly.
  if (location.hash && location.hash !== '#sources') {
    const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));
  }
})();
