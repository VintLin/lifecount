"""With npm run dev running, execute with Python, Playwright and Chrome installed."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

out = Path(__file__).parent
with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    page = browser.new_page(viewport={"width": 1200, "height": 800}, reduced_motion="reduce")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.add_init_script("""if (!localStorage.getItem('lifecount-settings-v1'))
        localStorage.setItem('lifecount-settings-v1', JSON.stringify({
        birthday:'2000-04-01', displayAge:80, locale:'zh-CN', visualMode:'grid'
        })); window.bambooDate=Date.parse('2000-04-01T12:00:00'); Date.now=()=>window.bambooDate""")
    page.goto("http://localhost:4321/lifecount/?lang=zh-CN")
    trigger = page.locator("[data-lifecount-visual-trigger]")
    trigger.click()
    page.get_by_role("option", name="竹").click()
    canvas = page.locator(".lifecount-bamboo-canvas")
    for label, year, fraction in [
        ("shoot", 2004, .05), ("elongation", 2016, .20),
        ("grove", 2048, .60), ("old", 2073, .9125), ("end", 2081, 1)
    ]:
        page.evaluate("(date)=>window.bambooDate=Date.parse(date)", f"{year}-04-01T12:00:00")
        page.wait_for_function("(f)=>Math.abs(Number(document.querySelector('.lifecount-bamboo-canvas').dataset.progress)-f)<.001", arg=fraction)
        page.screenshot(path=out / f"{label}.png")
    page.evaluate("window.bambooDate=Date.parse('2029-01-18T12:00:00')")
    page.wait_for_function("Math.abs(Number(document.querySelector('.lifecount-bamboo-canvas').dataset.progress)-.36)<.0005")
    page.screenshot(path=out / "36-desktop.png")
    page.set_viewport_size({"width": 375, "height": 812})
    page.wait_for_function("innerWidth === 375")
    page.evaluate("new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))")
    page.screenshot(path=out / "36-mobile.png")
    page.reload()
    expect(trigger).to_have_text("竹")
    page.set_viewport_size({"width": 375, "height": 812})
    page.evaluate("window.bambooDate=Date.parse('2048-12-15T12:00:00')")
    page.wait_for_function("Number(document.querySelector('.lifecount-bamboo-canvas').dataset.progress)>.60")
    fullscreen = page.locator("[data-lifecount-visual-fullscreen]")
    for name in ["mobile", "fullscreen"]:
        if name == "fullscreen":
            fullscreen.click()
            expect(fullscreen).to_have_attribute("aria-pressed", "true")
        assert canvas.evaluate("""c=>{
          const r=c.getBoundingClientRect(),s=c.parentElement.getBoundingClientRect();
          const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
          let count=0;
          for(let i=3;i<pixels.length;i+=4) if(pixels[i]){
            const x=r.x+(i>>2)%c.width*r.width/c.width;
            const y=r.y+Math.floor((i>>2)/c.width)*r.height/c.height;
            if(x<s.left || x>=s.right || y<s.top || y>=s.bottom) return false;
            count++;
          }
          return count>1000 && document.documentElement.scrollWidth===innerWidth;
        }""")
        page.screenshot(path=out / f"{name}.png")
    fullscreen.click()
    expect(fullscreen).to_have_attribute("aria-pressed", "false")
    page.keyboard.press("Escape")
    expect(canvas).to_have_count(0)
    assert not errors, errors
    browser.close()
