import type { Tool, ToolMode } from "@/types/models";

const toolNames = [
  "subfinder", "Amass", "assetfinder", "findomain", "Sublist3r", "chaos-client", "crt.sh", "Cert Spotter", "SecurityTrails", "VirusTotal", "Shodan", "Censys", "theHarvester", "Spyse", "BuiltWith",
  "Nmap", "Naabu", "Masscan", "RustScan", "ZMap", "httpx", "httprobe", "Katana", "gospider", "hakrawler", "Gobuster", "ffuf", "dirsearch", "feroxbuster", "Gowitness",
  "dig", "nslookup", "host", "dnsx", "massdns", "puredns", "shuffledns", "dnsvalidator", "dnstracer", "dnstwist", "dnsrecon", "fierce", "altdns", "dnsgen", "gotator",
  "curl", "wget", "WhatWeb", "Wappalyzer", "Nikto", "Nuclei", "OWASP ZAP", "Burp Suite", "Aquatone", "sslscan", "testssl.sh",
  "Unicornscan", "Hping3", "Angry IP Scanner", "Netcat (nc)", "Telnet", "Fping", "IPerf3", "Arp-scan", "Scapy",
  "OpenVAS / Greenbone", "Nessus", "Qualys VMDR", "Rapid7 InsightVM (Nexpose)", "Acunetix", "Invicti (Netsparker)", "Wapiti", "Arachni", "WPScan", "Trivy", "Snyk",
  "Metasploit Framework", "sqlmap", "Commix", "XSStrike", "Dalfox", "tplmap", "wfuzz", "Hydra", "John the Ripper", "Hashcat", "jwt-tool", "Responder",
  "DirBuster", "dirb", "Burp Suite Intruder", "OWASP ZAP Fuzzer", "AFL++", "Radamsa", "SecLists",
  "TruffleHog", "Gitleaks", "detect-secrets", "git-secrets", "SecretScanner", "AWS Scout Suite", "Prowler", "Cloudsploit", "CloudMapper", "Steampipe", "Checkov", "tfsec", "kube-bench", "kube-hunter", "S3Scanner",
  "BloodHound", "SharpHound", "PowerView", "Rubeus", "Mimikatz", "Impacket", "NetExec (nxc)", "Kerbrute", "Certipy", "Certify", "LDAPDomainDump", "enum4linux-ng", "SMBMap", "evil-winrm",
  "msfvenom", "socat", "pwncat-cs", "Chisel", "PsExec (Sysinternals)", "Weevely", "Powercat", "Nishang", "GDB", "pwntools", "ROPgadget",
  "recon-ng", "SpiderFoot", "Maltego", "FOCA", "DNSDumpster", "Have I Been Pwned", "ldns-walk / zonewalk",
  "mitmproxy", "Insomnia", "Postman", "kiterunner", "Swagger/OpenAPI tools", "uro", "qsreplace", "unfurl", "anew", "gf patterns", "hakrevdns", "EyeWitness",
  "Wireshark", "tcpdump", "Aircrack-ng", "Kismet", "Bettercap", "Wifite", "Reaver",
  "CrackMapExec (CME)", "rpcclient", "ldapsearch", "SharpUp", "Seatbelt", "PowerUp", "PingCastle", "linPEAS / winPEAS", "pspy", "GTFOBins", "LOLBAS", "linux-exploit-suggester", "Watson",
  "MobSF", "JADX", "apktool", "Frida", "Objection", "Burp Suite Mobile Assistant",
  "Ghidra", "radare2", "IDA Free", "x64dbg", "binwalk", "strings",
  "kubescape", "kubeaudit", "k9s", "terrascan", "conftest (OPA)",
  "Dradis", "Faraday", "Serpico", "CherryTree", "Obsidian"
] as const;

function classify(name: string): { category: string; mode: ToolMode; tags: string[] } {
  const n = name.toLowerCase();
  if (/dns|sub|crt\.sh|cert spotter|securitytrails|virustotal|shodan|censys|harvester|spyse|builtwith/.test(n)) {
    return { category: "Discovery", mode: "passive", tags: ["recon", "inventory"] };
  }
  if (/nmap|naabu|masscan|rustscan|zmap|unicornscan|hping|fping|arp|iperf|telnet|netcat/.test(n)) {
    return { category: "Network", mode: "active", tags: ["network", "enumeration"] };
  }
  if (/wireshark|tcpdump|aircrack|kismet|bettercap|wifite|reaver|mitmproxy/.test(n)) {
    return { category: "Traffic", mode: "offline", tags: ["packets", "analysis"] };
  }
  if (/burp|zap|ffuf|gobuster|dirsearch|ferox|wappalyzer|whatweb|nikto|nuclei|katana|gospider|hakrawler|aquatone/.test(n)) {
    return { category: "Web", mode: "active", tags: ["http", "surface"] };
  }
  if (/trufflehog|gitleaks|secret|checkov|tfsec|cloud|kube|s3scanner|trivy|snyk|prowler/.test(n)) {
    return { category: "Cloud & Code", mode: "offline", tags: ["misconfig", "supply-chain"] };
  }
  if (/metasploit|sqlmap|commix|hydra|hashcat|john|mimikatz|impacket|psexec|pwncat|msfvenom|evil-winrm/.test(n)) {
    return { category: "Offensive", mode: "active", tags: ["high-risk", "authorization-required"] };
  }
  if (/dradis|faraday|serpico|cherrytree|obsidian/.test(n)) {
    return { category: "Reporting", mode: "offline", tags: ["reporting", "collaboration"] };
  }
  return { category: "General", mode: "passive", tags: ["utility"] };
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const toolsSeed: Tool[] = toolNames.map((name) => {
  const meta = classify(name);
  return {
    id: slugify(name),
    name,
    category: meta.category,
    tags: meta.tags,
    mode: meta.mode,
    template: ""
  };
});
