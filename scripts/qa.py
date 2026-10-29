"""
Responsive + flow QA for ResearchForge (local; mocks the Claude API and citation services).

    npm run build && npx vite preview --port 4174
    python3 scripts/qa.py http://localhost:4174 screenshots

Requires Python Playwright with Chromium.
"""
import asyncio, json, re, sys
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

async def culprits(page):
    return await page.evaluate("""() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0,4).map(e => e.tagName + '.' + String(e.className).slice(0,50))""")

async def new_project(page, title="Postpartum BP follow-up"):
    await page.goto(BASE + "/concierge")
    await page.fill("input[placeholder='e.g. Postpartum BP follow-up']", title)
    await page.get_by_role("button", name="Start designing").click()
    await page.wait_for_url("**/stage/1")
    return page.url.split("/p/")[1].split("/")[0]

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
        await mock(ctx)
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" and "React Router caught" in m.text else None)

        # ---- Academy: slides, check, assignment, submit
        await page.goto(BASE + "/academy/week/1")
        for _ in range(6):
            await page.get_by_role("button", name="Next slide").click()
        await page.get_by_role("button", name="In PGY-1s, does weekly feedback coaching").click()
        await page.wait_for_selector("text=Correct.")
        await page.screenshot(path=str(OUT / "1440_week1_check.png"))
        await page.get_by_role("button", name="Present").click()
        await page.wait_for_selector("[aria-label='Slides, full screen']")
        await page.screenshot(path=str(OUT / "1440_present.png"))
        await page.keyboard.press("Escape")
        submit_btn = page.get_by_role("button", name="Submit assignment")
        if not await submit_btn.is_disabled(): problems.append("[academy] submit enabled with empty required fields")
        await page.fill("#a1-problem", "Students get few chances to practise hard conversations.")
        await page.fill("#a1-gap", "Unclear whether AI-simulated patients improve observed skills.")
        await page.fill("#a1-purpose", "Test AI-simulated encounters with rubric feedback.")
        await page.fill("#a1-question", "In third-year students, do AI-simulated encounters improve OSCE communication scores vs usual teaching?")
        await page.select_option("#a1-outcomeLevel", index=3)
        await page.fill("#a1-finer\\.f", "Yes")
        await submit_btn.click()
        async with page.expect_download() as dl:
            await page.get_by_role("button", name="Yes, submit").click()
        d = await dl.value
        await d.save_as(str(OUT / "week1.docx"))
        await page.wait_for_selector("text=Edit & resubmit")
        if not await page.get_by_role("link", name="Add faculty email").count(): problems.append("[academy] missing faculty email prompt")
        await page.screenshot(path=str(OUT / "1440_submitted.png"))
        # AI feedback (mocked, optional, paid credits)
        await page.get_by_role("button", name="Get AI feedback").click()
        await page.wait_for_selector("text=paid API credits")
        await page.get_by_role("button", name="Use credits — get feedback").click()
        await page.wait_for_selector("text=Good start")
        # Bring into Concierge
        await page.get_by_role("button", name="Bring into Concierge").click()
        await page.wait_for_url("**/stage/2")
        await page.wait_for_timeout(400)
        if await page.get_by_text("Something went wrong").count(): problems.append("[crash] stage 2 after transfer")
        q = await page.locator("#f-question textarea").input_value()
        if "OSCE" not in q: problems.append("[transfer] question not copied into Concierge")
        await page.screenshot(path=str(OUT / "1440_stage2.png"))
        pid = page.url.split("/p/")[1].split("/")[0]

        # ---- Concierge: stages, progressive disclosure, AI mentor
        await page.goto(f"{BASE}/p/{pid}/stage/3")
        await page.wait_for_selector("text=Choose a framework")
        await page.get_by_role("button", name="More details").click()
        await page.screenshot(path=str(OUT / "1440_stage3.png"))
        await page.goto(f"{BASE}/p/{pid}/mentor")
        await page.fill("#composer", "Help me define the outcome.")
        await page.get_by_role("button", name="Send").click()
        await page.wait_for_selector("text=Suggested Blueprint update")
        await page.get_by_role("button", name="Accept", exact=True).click()
        await page.wait_for_selector("text=Accepted into Blueprint")
        await page.goto(f"{BASE}/p/{pid}/proposal")
        async with page.expect_download() as dl:
            await page.get_by_role("button", name="Protocol DOCX").click()
        await (await dl.value).save_as(str(OUT / "protocol.docx"))

        # ---- Week 5 combined proposal export
        await page.goto(BASE + "/academy/week/5")
        async with page.expect_download() as dl:
            await page.get_by_role("button", name="Export full proposal (Word)").click()
        await (await dl.value).save_as(str(OUT / "proposal.docx"))

        # ---- Text size button
        await page.goto(BASE + "/")
        before = await page.evaluate("getComputedStyle(document.documentElement).fontSize")
        await page.get_by_role("button", name=re.compile("Text size")).click()
        after = await page.evaluate("getComputedStyle(document.documentElement).fontSize")
        if before == after: problems.append(f"[text size] unchanged {before}")
        await page.get_by_role("button", name=re.compile("Text size")).click()
        await page.get_by_role("button", name=re.compile("Text size")).click()
        await page.get_by_role("button", name=re.compile("Text size")).click()  # back to Large
        if errs: problems.append(f"[pageerror flow] {errs[:3]}")
        await ctx.close()

        # ---- Responsive sweep
        for w, h in VIEWPORTS:
            ctx = await b.new_context(viewport={"width": w, "height": h})
            await mock(ctx)
            page = await ctx.new_page()
            errs = []
            page.on("pageerror", lambda e: errs.append(str(e)))
            pid = await new_project(page)
            routes = ["/", "/academy", "/academy/week/1", "/academy/week/3", "/academy/week/5", "/concierge", "/settings",
                      f"/p/{pid}/stage/1", f"/p/{pid}/stage/2", f"/p/{pid}/stage/4", f"/p/{pid}/stage/6", f"/p/{pid}/stage/7",
                      f"/p/{pid}/mentor", f"/p/{pid}/blueprint", f"/p/{pid}/evidence", f"/p/{pid}/proposal", f"/p/{pid}/review"]
            for r in routes:
                await page.goto(BASE + r, wait_until="networkidle")
                await page.wait_for_timeout(120)
                if await page.get_by_text("Something went wrong").count(): problems.append(f"[crash] {w} {r}")
                ov = await overflow(page)
                if ov > 0: problems.append(f"[overflow {ov}px] {w}x{h} {r} {await culprits(page)}")
                if r in ("/", "/academy/week/1", f"/p/{pid}/stage/2", f"/p/{pid}/mentor"):
                    await page.screenshot(path=str(OUT / f"{w}x{h}_{r.strip('/').replace('/', '_') or 'home'}.png"))
            # largest text size still fits
            await page.evaluate("localStorage.setItem('rc.settings', JSON.stringify({...JSON.parse(localStorage.getItem('rc.settings')||'{}'), textSize:'xxl'}))")
            for r in ["/", "/academy/week/2", f"/p/{pid}/stage/5"]:
                await page.goto(BASE + r, wait_until="networkidle")
                ov = await overflow(page)
                if ov > 0: problems.append(f"[overflow xxl {ov}px] {w}x{h} {r} {await culprits(page)}")
            if w in (390, 1440):
                await page.emulate_media(color_scheme="dark")
                await page.goto(BASE + "/academy/week/2", wait_until="networkidle")
                await page.screenshot(path=str(OUT / f"{w}x{h}_dark_week2.png"))
            if errs: problems.append(f"[pageerror] {w}: {errs[:2]}")
            await ctx.close()
        await b.close()
    print(json.dumps({"problems": problems, "count": len(problems)}, indent=2))

asyncio.run(main())
