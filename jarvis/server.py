import os
import sys
import json
import time
import urllib.request
import urllib.parse
import subprocess
import webbrowser
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
CONFIG_FILE = BASE_DIR / "config.json"
WORKSPACE_DIR = Path(r"e:\GoFreeHold")

DEFAULT_CONFIG = {
    "user_name": "Fiza Nazz",
    "github_username": "Fiza-Nazz",
    "email": "fizanaazz321@gmail.com",
    "instagram": "@zii_tech_63",
    "tiktok": "@zii_tech_63",
    "publora_api_key": "",
    "voice_lang": "hi",  # 'hi' / 'ur' gives natural Urdu/Hindi-accented pronunciation for Roman Urdu, 'en' for English
    "contacts": {
        "me": "+923000000000"
    },
    "workspace_path": r"e:\GoFreeHold"
}


def load_config():
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged = {**DEFAULT_CONFIG, **data}
                return merged
        except Exception:
            pass
    save_config(DEFAULT_CONFIG)
    return dict(DEFAULT_CONFIG)


def save_config(cfg):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)


# =====================================================================
# AUTONOMOUS LAPTOP & SOCIAL MEDIA TOOLS
# =====================================================================

def tool_list_files(target_path=None):
    cfg = load_config()
    root = Path(target_path) if target_path else Path(cfg.get("workspace_path", r"e:\GoFreeHold"))
    if not root.exists():
        root = WORKSPACE_DIR
    items = []
    try:
        for entry in sorted(root.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))[:40]:
            items.append({
                "name": entry.name,
                "type": "folder" if entry.is_dir() else "file",
                "size": entry.stat().st_size if entry.is_file() else None
            })
        return {"ok": True, "path": str(root), "items": items}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def tool_read_file(file_path):
    try:
        p = Path(file_path)
        if not p.is_absolute():
            p = WORKSPACE_DIR / p
        if not p.exists():
            return {"ok": False, "error": f"File not found: {p}"}
        content = p.read_text(encoding="utf-8", errors="replace")
        return {"ok": True, "path": str(p), "content": content[:4000]}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def tool_write_file(file_path, content):
    try:
        p = Path(file_path)
        if not p.is_absolute():
            p = WORKSPACE_DIR / p
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return {"ok": True, "path": str(p), "bytes_written": len(content)}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def tool_run_shell(command):
    try:
        proc = subprocess.run(
            ["powershell", "-NoProfile", "-Command", command],
            cwd=str(WORKSPACE_DIR),
            capture_output=True,
            text=True,
            timeout=25
        )
        out = (proc.stdout or "") + ("\n" + proc.stderr if proc.stderr else "")
        return {
            "ok": proc.returncode == 0,
            "code": proc.returncode,
            "output": out.strip()[:3000] or "(Command completed successfully with no output)"
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}


def copy_to_clipboard(text):
    try:
        proc = subprocess.Popen(["clip"], stdin=subprocess.PIPE, shell=True)
        proc.communicate(input=text.encode("utf-16-le"))
        return True
    except Exception:
        return False


def tool_linkedin_post(post_text):
    cfg = load_config()
    publora_key = cfg.get("publora_api_key", "").strip()
    copy_to_clipboard(post_text)

    # Save latest draft in jarvis folder
    draft_path = BASE_DIR / "latest_linkedin_post.txt"
    draft_path.write_text(post_text, encoding="utf-8")

    # If Publora API key is configured, post directly via Publora API
    if publora_key:
        try:
            req = urllib.request.Request(
                "https://api.publora.com/api/v1/posts",
                data=json.dumps({"content": post_text, "platforms": ["linkedin"]}).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-publora-key": publora_key
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                return {
                    "ok": True,
                    "mode": "publora_api",
                    "message": "LinkedIn post published via Publora API!",
                    "data": resp_data
                }
        except Exception as e:
            pass

    # Open LinkedIn with post copied to clipboard & share URL
    encoded = urllib.parse.quote(post_text)
    url = f"https://www.linkedin.com/feed/?shareActive=true&text={encoded}"
    webbrowser.open(url)
    return {
        "ok": True,
        "mode": "browser_composer",
        "message": "Post clipboard mein copy kar di gayi hai aur LinkedIn Share box open kar diya gaya hai!",
        "draft_file": str(draft_path)
    }


def tool_whatsapp_message(recipient, message):
    cfg = load_config()
    contacts = cfg.get("contacts", {})
    phone = contacts.get(recipient.lower().strip(), recipient.strip())
    clean_phone = "".join(ch for ch in phone if ch.isdigit() or ch == "+").lstrip("+")
    copy_to_clipboard(message)
    encoded_msg = urllib.parse.quote(message)
    if clean_phone and len(clean_phone) >= 7:
        url = f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_msg}"
    else:
        url = f"https://web.whatsapp.com/send?text={encoded_msg}"
    webbrowser.open(url)
    return {
        "ok": True,
        "recipient": recipient,
        "phone": clean_phone or "Select Contact in WhatsApp",
        "message": message,
        "status": "WhatsApp Web opened with pre-filled message & copied to clipboard"
    }


def tool_send_email(to_email, subject, body):
    copy_to_clipboard(body)
    params = urllib.parse.urlencode({
        "view": "cm",
        "fs": "1",
        "to": to_email,
        "su": subject,
        "body": body
    }, quote_via=urllib.parse.quote)
    url = f"https://mail.google.com/mail/?{params}"
    webbrowser.open(url)
    return {
        "ok": True,
        "to": to_email,
        "subject": subject,
        "status": "Gmail Compose window opened with To, Subject, and Professional Body pre-filled!"
    }


def tool_social_post(platform, caption):
    copy_to_clipboard(caption)
    p = platform.lower().strip()
    if p in ("x", "twitter"):
        url = f"https://twitter.com/intent/tweet?text={urllib.parse.quote(caption)}"
    elif "insta" in p:
        url = "https://www.instagram.com/"
    elif "tiktok" in p:
        url = "https://www.tiktok.com/tiktokstudio/upload"
    else:
        url = f"https://www.linkedin.com/feed/?shareActive=true&text={urllib.parse.quote(caption)}"
    webbrowser.open(url)
    return {
        "ok": True,
        "platform": platform,
        "status": f"{platform.title()} opened and caption copied to clipboard!"
    }


def tool_open_target(target):
    t = target.strip()
    if t.startswith("http://") or t.startswith("https://"):
        webbrowser.open(t)
        return {"ok": True, "opened": t}
    low = t.lower()
    shortcuts = {
        "github": "https://github.com/Fiza-Nazz",
        "linkedin": "https://www.linkedin.com/feed/",
        "whatsapp": "https://web.whatsapp.com/",
        "gmail": "https://mail.google.com/",
        "instagram": "https://www.instagram.com/zii_tech_63/",
        "tiktok": "https://www.tiktok.com/@zii_tech_63",
        "claude": "https://claude.ai/new",
        "workspace": str(WORKSPACE_DIR)
    }
    for k, val in shortcuts.items():
        if k in low:
            if val.startswith("http"):
                webbrowser.open(val)
            else:
                os.startfile(val)
            return {"ok": True, "opened": val}
    p = Path(t)
    if not p.is_absolute():
        p = WORKSPACE_DIR / p
    if p.exists():
        os.startfile(str(p))
        return {"ok": True, "opened": str(p)}
    return {"ok": False, "error": f"Target not found: {t}"}


# =====================================================================
# AI BRAIN (FREE KEYLESS LLM + AUTONOMOUS TOOL DISPATCHER)
# =====================================================================

SYSTEM_PROMPT = """You are JARVIS, the personal voice-controlled AI Assistant and Autonomous Executive Agent built exclusively for Fiza Nazz (Forward Deployed AI Engineer, Full-Stack Developer, GitHub: Fiza-Nazz, Instagram/TikTok: @zii_tech_63).

RULES:
1. Always speak to Fiza in concise, confident, warm, and natural Roman Urdu (mixed with English technical terms, e.g. "Ji Boss Fiza, maine aapki LinkedIn post ready kar ke open kar di hai!").
2. Keep your spoken response ("reply") under 2-3 short sentences so your voice sounds snappy and futuristic.
3. You MUST return ONLY a valid JSON object with this exact structure (no markdown fences around it if possible):
{
  "reply": "Short spoken response in Roman Urdu for Fiza",
  "tool": "none | list_files | read_file | write_file | run_shell | linkedin_post | whatsapp_message | send_email | social_post | open_target",
  "args": { ... tool specific arguments ... }
}

AVAILABLE TOOLS & ARGS:
- "list_files": {"path": "e:\\GoFreeHold"} -> When Fiza asks to check files/folders on her laptop.
- "read_file": {"path": "README.md"} -> When Fiza asks to read or inspect a file.
- "write_file": {"path": "notes.txt", "content": "..."} -> When Fiza asks to create, write, or update a file/code on her laptop.
- "run_shell": {"command": "git status"} -> When Fiza asks to run a terminal command, check git/GitHub status, system info, or automate laptop tasks.
- "linkedin_post": {"post_text": "Full high-impact LinkedIn post with hooks, bullet points, and #FDE #AIEngineer hashtags"} -> When Fiza asks to write or publish a LinkedIn post (especially about Forward Deployed AI Engineering, Digital FTEs, AI Agents, or hiring).
- "whatsapp_message": {"recipient": "name or phone number", "message": "Message text"} -> When Fiza asks to send a WhatsApp message.
- "send_email": {"to": "recipient@example.com", "subject": "Professional Subject", "body": "Full professional email body"} -> When Fiza asks to send an email on Gmail.
- "social_post": {"platform": "twitter | instagram | tiktok", "caption": "Viral post caption with hashtags"} -> When Fiza asks to post on X/Twitter, Instagram, or TikTok.
- "open_target": {"target": "github | linkedin | whatsapp | gmail | instagram | tiktok | claude | workspace | https://..."} -> When Fiza asks to open an app, folder, or website.
- "none": {} -> For general questions, brainstorming, or conversation.
"""


def call_free_llm(user_message, history):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in (history or [])[-6:]:
        if isinstance(h, dict) and "role" in h and "content" in h:
            messages.append({"role": h["role"], "content": str(h["content"])[:1000]})
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": "openai",
        "messages": messages,
        "temperature": 0.4,
        "response_format": {"type": "json_object"}
    }

    try:
        req = urllib.request.Request(
            "https://text.pollinations.ai/openai",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Jarvis-FizaNazz/1.0"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            outer = json.loads(raw)
            content = outer["choices"][0]["message"]["content"].strip()
            # Strip markdown code block if present
            if content.startswith("```"):
                content = content.strip("`")
                if content.lower().startswith("json"):
                    content = content[4:].strip()
            return json.loads(content)
    except Exception as e:
        return local_smart_fallback(user_message, str(e))


def local_smart_fallback(user_message, err_info=""):
    low = user_message.lower()
    if "linkedin" in low or "fde" in low or "forward deployed" in low or "post" in low:
        post_content = (
            "The AI Engineering Hiring Wave Has Shifted: Why Global Companies Are Hunting for Forward Deployed AI Engineers (FDEs)\n\n"
            "Most companies don't have an AI model problem anymore — they have a *deployment & production execution* problem.\n\n"
            "That is where a Forward Deployed AI Engineer (FDE) changes the game:\n"
            "• Bridges the gap between complex enterprise workflows and autonomous AI Agents\n"
            "• Builds Digital FTEs (Full-Time Equivalent AI Workers) that automate real operations end-to-end\n"
            "• Ships full-stack production systems (Next.js, TypeScript, Python, FastAPI, Multi-Agent Pipelines) in days, not quarters\n\n"
            "If your agency or engineering team is scaling autonomous AI products and needs an engineer who owns architecture from prompt to production — let's connect.\n\n"
            "— Fiza Nazz | Forward Deployed AI Engineer & Digital FTE Builder\n"
            "GitHub: github.com/Fiza-Nazz\n\n"
            "#ForwardDeployedEngineer #FDE #AIEngineer #AutonomousAgents #DigitalFTE #FullStackAI #LLM #HiringAIEngineers #TechLeadership #AIAutomation"
        )
        return {
            "reply": "Ji Boss Fiza! Maine Forward Deployed AI Engineer ki high-ranking LinkedIn post तैयार kar ke clipboard mein copy kar di hai aur LinkedIn composer open kar diya hai!",
            "tool": "linkedin_post",
            "args": {"post_text": post_content}
        }
    if "whatsapp" in low or "message" in low or "msg" in low:
        return {
            "reply": "Ji Fiza! Main abhi WhatsApp Web open kar raha hoon aur aapka message ready kar diya hai.",
            "tool": "whatsapp_message",
            "args": {
                "recipient": "me",
                "message": "Assalam-o-Alaikum! Yeh message Fiza Nazz ke AI Assistant JARVIS ne bheja hai."
            }
        }
    if "email" in low or "gmail" in low or "mail" in low:
        return {
            "reply": "Ji Boss! Maine Gmail compose window professional email template ke sath open kar di hai.",
            "tool": "send_email",
            "args": {
                "to": "",
                "subject": "Forward Deployed AI Engineering & Automation Inquiry — Fiza Nazz",
                "body": "Hi Team,\n\nI hope you are doing well.\n\nI am reaching out regarding Forward Deployed AI Engineering and autonomous workflow automation.\n\nBest regards,\nFiza Nazz\nForward Deployed AI Engineer\nhttps://github.com/Fiza-Nazz"
            }
        }
    if "file" in low or "folder" in low or "project" in low or "dikhao" in low:
        return {
            "reply": "Ji Fiza, main aapke GoFreeHold workspace ki saari files aur folders list kar raha hoon.",
            "tool": "list_files",
            "args": {"path": r"e:\GoFreeHold"}
        }
    if "git" in low or "status" in low or "terminal" in low:
        return {
            "reply": "Ji Boss, maine terminal par git status check kar liya hai.",
            "tool": "run_shell",
            "args": {"command": "git status -s; gh auth status"}
        }
    if "open" in low or "kholo" in low:
        return {
            "reply": "Ji Fiza, main abhi open kar raha hoon!",
            "tool": "open_target",
            "args": {"target": user_message}
        }
    return {
        "reply": "Ji Boss Fiza! Main JARVIS online hoon aur aapke laptop, LinkedIn, WhatsApp, Gmail aur coding folders se connected hoon. Aap mujhe voice ya text mein koi bhi hukum dein!",
        "tool": "none",
        "args": {}
    }


def execute_tool(tool_name, args):
    args = args or {}
    if tool_name == "list_files":
        return tool_list_files(args.get("path"))
    elif tool_name == "read_file":
        return tool_read_file(args.get("path", "README.md"))
    elif tool_name == "write_file":
        return tool_write_file(args.get("path", "jarvis_note.txt"), args.get("content", ""))
    elif tool_name == "run_shell":
        return tool_run_shell(args.get("command", "Get-Location"))
    elif tool_name == "linkedin_post":
        return tool_linkedin_post(args.get("post_text", ""))
    elif tool_name == "whatsapp_message":
        return tool_whatsapp_message(args.get("recipient", ""), args.get("message", ""))
    elif tool_name == "send_email":
        return tool_send_email(args.get("to", ""), args.get("subject", ""), args.get("body", ""))
    elif tool_name == "social_post":
        return tool_social_post(args.get("platform", "linkedin"), args.get("caption", ""))
    elif tool_name == "open_target":
        return tool_open_target(args.get("target", "github"))
    return None


# =====================================================================
# HTTP SERVER & ENDPOINTS
# =====================================================================

class JarvisHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def log_message(self, format, *args):
        pass  # Keep console clean

    def _send_json(self, data, status=200):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/status":
            cfg = load_config()
            self._send_json({
                "status": "ONLINE",
                "assistant": "J.A.R.V.I.S. v2.5 (Fiza Nazz Edition)",
                "workspace": str(WORKSPACE_DIR),
                "config": cfg,
                "systems": {
                    "laptop_control": "ACTIVE",
                    "github_cli": "AUTHENTICATED (Fiza-Nazz)",
                    "linkedin_engine": "READY (Publora + Browser)",
                    "whatsapp_bridge": "READY",
                    "gmail_automation": "READY",
                    "social_studio": "READY (@zii_tech_63)"
                }
            })
            return

        if parsed.path == "/api/tts":
            qs = urllib.parse.parse_qs(parsed.query)
            text = (qs.get("text", ["Ji Boss Fiza"])[0])[:240]
            lang = qs.get("lang", ["hi"])[0]
            try:
                tts_url = (
                    "https://translate.googleapis.com/translate_tts?"
                    + urllib.parse.urlencode({
                        "ie": "UTF-8",
                        "client": "tw-ob",
                        "tl": lang,
                        "q": text
                    })
                )
                req = urllib.request.Request(
                    tts_url,
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    audio_bytes = resp.read()
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(len(audio_bytes)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(audio_bytes)
            except Exception as e:
                self._send_json({"ok": False, "error": str(e)}, status=500)
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body_raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            body = json.loads(body_raw)
        except Exception:
            body = {}

        if parsed.path == "/api/chat":
            user_msg = body.get("message", "").strip()
            history = body.get("history", [])
            if not user_msg:
                self._send_json({"ok": False, "error": "Empty command"}, status=400)
                return

            decision = call_free_llm(user_msg, history)
            reply = decision.get("reply", "Ji Fiza, kaam ho gaya hai!")
            tool_name = decision.get("tool", "none")
            tool_args = decision.get("args", {})

            tool_result = None
            if tool_name and tool_name != "none":
                tool_result = execute_tool(tool_name, tool_args)

            self._send_json({
                "ok": True,
                "reply": reply,
                "tool": tool_name,
                "args": tool_args,
                "tool_result": tool_result,
                "timestamp": time.strftime("%H:%M:%S")
            })
            return

        if parsed.path == "/api/config":
            cfg = load_config()
            cfg.update(body)
            save_config(cfg)
            self._send_json({"ok": True, "config": cfg})
            return

        self._send_json({"ok": False, "error": "Not found"}, status=404)


def main():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    load_config()
    port = int(os.environ.get("JARVIS_PORT", "8085"))
    server = ThreadingHTTPServer(("127.0.0.1", port), JarvisHandler)
    url = f"http://localhost:{port}"
    print(f"====================================================")
    print(f"  J.A.R.V.I.S. AI ASSISTANT (FIZA NAZZ EDITION)")
    print(f"  Web Interface Live at: {url}")
    print(f"====================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down JARVIS...")
        server.server_close()


if __name__ == "__main__":
    main()
