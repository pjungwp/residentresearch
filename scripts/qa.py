"""
Responsive + flow QA for Research Forge (local; mocks the Claude API and citation services).

    npm run build && npx vite preview --port 4174
    python3 scripts/qa.py http://localhost:4174 screenshots

Requires Python Playwright with Chromium.
"""
import asyncio, json, sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4174"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "screenshots"); OUT.mkdir(parents=True, exist_ok=True)
VIEWPORTS = [(390, 844), (600, 960), (768, 1024), (1024, 768), (1440, 900), (1920, 1080)]
problems = []

DOI = "10.1097/gme.0000000000002028"
SSE_TEXT = (
    "Good start. Your question needs a measurable outcome.\n\n"
    "```proposal\n" + json.dumps({"field": "primaryOutcome", "value": "Documented BP assessment within 10 days of discharge", "note": "Measurable in the EHR"}) + "\n```\n\n"
    "A relevant source: DOI: 10.1097/GME.0000000000002028\n"
)

def sse():
    ev = []
    ev.append({"type": "message_start", "message": {"id": "m"}})
    ev.append({"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}})
    for i in range(0, len(SSE_TEXT), 40):
        ev.append({"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": SSE_TEXT[i:i+40]}})
    ev.append({"type": "content_block_stop", "index": 0})
    ev.append({"type": "message_delta", "delta": {"stop_reason": "end_turn"}})
    ev.append({"type": "message_stop"})
    return "".join(f"event: {e['type']}\ndata: {json.dumps(e)}\n\n" for e in ev)

CROSSREF = {"message": {"DOI": DOI, "title": ["The 2022 hormone therapy position statement of The North American Menopause Society"], "author": [{"given": "Stephanie S", "family": "Faubion"}], "container-title": ["Menopause"], "issued": {"date-parts": [[2022, 7, 1]]}, "volume": "29", "issue": "7", "page": "767-794", "type": "journal-article"}}
EPMC = {"resultList": {"result": [{"id": "35797481", "source": "MED", "pmid": "35797481", "doi": DOI, "title": "The 2022 hormone therapy position statement of The North American Menopause Society.", "authorString": "Faubion SS, et al.", "journalTitle": "Menopause", "pubYear": "2022", "authorList": {"author": [{"lastName": "Faubion", "initials": "SS"}]}, "journalInfo": {"volume": "29", "issue": "7", "yearOfPublication": 2022, "journal": {"title": "Menopause", "isoabbreviation": "Menopause"}}, "pageInfo": "767-794", "abstractText": "Hormone therapy remains the most effective treatment for vasomotor symptoms.", "isOpenAccess": "N", "pubTypeList": {"pubType": ["Journal Article"]}, "fullTextUrlList": {"fullTextUrl": []}}]}}
PUBMED = {"result": {"35797481": {"uid": "35797481", "title": "The 2022 hormone therapy position statement of The North American Menopause Society.", "authors": [{"name": "Faubion SS", "authtype": "Author"}], "source": "Menopause", "fulljournalname": "Menopause", "pubdate": "2022 Jul 1", "volume": "29", "issue": "7", "pages": "767-794", "articleids": [{"idtype": "doi", "value": DOI}], "pubtype": ["Journal Article"]}}}

async def mock(ctx):
    async def concierge(route):
        if route.request.method == "GET":
            return await route.fulfill(status=200, content_type="application/json", body=json.dumps({"configured": True, "needsCode": False, "model": "claude-sonnet-5-5"}))
        await route.fulfill(status=200, content_type="text/event-stream", body=sse())
    await ctx.route("**/api/concierge", concierge)
    async def any_lit(route):
        u = route.request.url
        if "crossref" in u: body = CROSSREF
        elif "europepmc" in u: body = EPMC
        elif "esearch" in u: body = {"esearchresult": {"idlist": ["35797481"]}}
        elif "esummary" in u: body = PUBMED
        elif "unpaywall" in u: body = {"is_oa": False, "oa_status": "closed", "best_oa_location": None}
        else: body = {}
        await route.fulfill(status=200, content_type="application/json", body=json.dumps(body), headers={"access-control-allow-origin": "*"})
    for pat in ["https://api.crossref.org/**", "https://www.ebi.ac.uk/**", "https://eutils.ncbi.nlm.nih.gov/**", "https://api.unpaywall.org/**"]:
        await ctx.route(pat, any_lit)

async def overflow(page):
    return await page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")

async def seed(page):
    """Create a project with some content via the UI."""
    await page.goto(BASE + "/projects")
    await page.fill("input[placeholder='e.g. Postpartum BP follow-up']", "Postpartum BP follow-up")
    await page.get_by_role("button", name="Open my Research Studio").click()
    await page.wait_for_url("**/p/**")
    return page.url.split("/p/")[1].split("/")[0]

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        # ---- Flow at desktop
        ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        await mock(ctx)
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        pid = await seed(page)
        # Studio: prefill from start mode, send
        await page.fill("#composer", "I want to study postpartum BP follow-up after discharge.")
        await page.get_by_role("button", name="Send").click()
        await page.get_by_role("button", name="I understand").click()
        await page.get_by_role("button", name="Send").click()
        await page.wait_for_selector("text=Suggested Blueprint update")
        await page.screenshot(path=str(OUT / "1440_studio_proposal.png"))
        await page.get_by_role("button", name="Accept", exact=True).click()
        await page.wait_for_selector("text=Accepted into Blueprint")
        val = await page.evaluate("""async () => { return document.body.innerText.includes('Documented BP assessment within 10 days of discharge') }""")
        if not val: problems.append("[flow] accepted proposal not visible in Blueprint panel")
        # Add & verify AI-suggested DOI
        await page.get_by_role("button", name="Add & verify 10.1097/gme.0000000000002028").click()
        await page.wait_for_timeout(800)
        # Week 1 editing
        await page.goto(f"{BASE}/p/{pid}/week/1")
        await page.get_by_role("textbox", name="Once upon a time, we believed").fill("Postpartum patients with hypertension get follow-up.")
        await page.locator("#f-question textarea").fill("Among postpartum patients with HDP, does remote BP monitoring improve timely follow-up?")
        await page.wait_for_timeout(700)
        await page.screenshot(path=str(OUT / "1440_week1.png"))
        # Evidence page shows verified source
        await page.goto(f"{BASE}/p/{pid}/evidence")
        await page.wait_for_selector("text=2022 hormone therapy position statement")
        txt = await page.locator("main").inner_text()
        if "Verified" not in txt: problems.append("[flow] source not verified in Evidence Library")
        await page.locator("li[id^='s_'] button[aria-expanded]").first.click()
        await page.screenshot(path=str(OUT / "1440_evidence.png"))
        # Proposal
        await page.goto(f"{BASE}/p/{pid}/proposal")
        await page.wait_for_selector("text=Proposal editor")
        await page.screenshot(path=str(OUT / "1440_proposal.png"))
        # DOCX export
        async with page.expect_download() as dl:
            await page.get_by_role("button", name="Protocol DOCX").click()
        d = await dl.value
        path = OUT / "protocol.docx"
        await d.save_as(str(path))
        if path.stat().st_size < 4000: problems.append("[flow] protocol docx too small")
        # Mentor review
        await page.goto(f"{BASE}/p/{pid}/review")
        await page.get_by_role("radio", name="Mentor view").click()
        await page.screenshot(path=str(OUT / "1440_review.png"))
        await page.get_by_role("radio", name="Resident view").click()
        # Persistence across reload
        await page.goto(f"{BASE}/p/{pid}/week/1")
        await page.reload()
        v = await page.locator("#f-question textarea").input_value()
        if "remote BP monitoring" not in v: problems.append("[flow] week 1 field not persisted across reload")
        # Downstream flag check not tested here (time-based); unit tested.
        if errs: problems.append(f"[pageerror] {errs[:3]}")
        await ctx.close()

        # ---- Responsive sweep (reuse storage by seeding per context)
        for w, h in VIEWPORTS:
            ctx = await b.new_context(viewport={"width": w, "height": h})
            await mock(ctx)
            page = await ctx.new_page()
            errs = []
            page.on("pageerror", lambda e: errs.append(str(e)))
            pid = await seed(page)
            routes = ["/projects", f"/p/{pid}", f"/p/{pid}/week/1", f"/p/{pid}/week/2", f"/p/{pid}/week/4", f"/p/{pid}/blueprint", f"/p/{pid}/evidence", f"/p/{pid}/proposal", f"/p/{pid}/review", "/settings"]
            for r in routes:
                await page.goto(BASE + r, wait_until="networkidle")
                await page.wait_for_timeout(150)
                ov = await overflow(page)
                if ov > 0:
                    culprits = await page.evaluate("""() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0,4).map(e => e.tagName + '.' + String(e.className).slice(0,50))""")
                    problems.append(f"[overflow {ov}px] {w}x{h} {r} {culprits}")
                if r in (f"/p/{pid}", f"/p/{pid}/week/2", f"/p/{pid}/blueprint"):
                    await page.screenshot(path=str(OUT / f"{w}x{h}_{r.split('/')[-1] or 'studio'}.png"))
            # composer visible in first viewport on Studio
            await page.goto(f"{BASE}/p/{pid}")
            box = await page.locator("#composer").bounding_box()
            if not box or box["y"] + box["height"] > h:
                problems.append(f"[viewport] composer not visible at {w}x{h}: {box}")
            # dark mode screenshot at a couple sizes
            if w in (390, 1440):
                await page.emulate_media(color_scheme="dark")
                await page.wait_for_timeout(100)
                await page.screenshot(path=str(OUT / f"{w}x{h}_studio_dark.png"))
            if errs: problems.append(f"[pageerror] {w}: {errs[:2]}")
            await ctx.close()
        await b.close()
    print(json.dumps({"problems": problems, "count": len(problems)}, indent=2))

asyncio.run(main())
