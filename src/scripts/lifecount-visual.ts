import { composeStage } from "./visuals/composition";
import type { LifeCountMessages, LifeCountLocale } from "@/i18n/lifecount";
import { VISUAL_MODES, type VisualMode } from "@/data/lifecount";
import { anniversary, parseDay } from "@/utils/lifecount";
import { createHourglass, type HourglassRenderer } from "./visuals/hourglass";
import { createBamboo } from "./visuals/bamboo";
import { createTree } from "./visuals/tree";
import { createHomebuilding } from "./visuals/homebuilding";
import { createDaylight } from "./visuals/daylight";
import { createCandle, type CandleStatus } from "./visuals/candle";
export interface VisualModeData {
    mode: VisualMode;
    birthday: string;
    displayAge: number;
    locale: LifeCountLocale;
    messages: LifeCountMessages;
    enabled: boolean;
}
/** Wall-clock seconds share the grid's existing birthday/anniversary date boundaries. */
function snapshotFor(birthday: string, displayAge: number) {
    const start = parseDay(birthday).getTime();
    const end = parseDay(anniversary(birthday, displayAge * 12)).getTime();
    const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
    const elapsedSeconds = Math.min(totalSeconds, Math.max(0, Math.floor((Date.now() - start) / 1000)));
    return { totalSeconds, elapsedSeconds, remainingSeconds: totalSeconds - elapsedSeconds,
        progress: totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0 };
}
export interface VisualModeController {
    update(data: VisualModeData): void;
    destroy(): void;
}
export function setupVisualMode(root: HTMLElement, onModeChange: (mode: VisualMode) => void): VisualModeController {
    const trigger = root.querySelector<HTMLButtonElement>("[data-lifecount-visual-trigger]");
    const visualLabel = trigger?.querySelector<HTMLElement>("[data-lifecount-visual-label]");
    const menu = root.querySelector<HTMLElement>("[data-lifecount-visual-menu]");
    const map = root.querySelector<HTMLElement>("[data-lifecount-map-wrap]");
    const stage = root.querySelector<HTMLElement>("[data-lifecount-visual-stage]");
    const canvas = root.querySelector<HTMLCanvasElement>("[data-lifecount-hourglass-canvas]");
    const summary = root.querySelector<HTMLElement>("[data-lifecount-visual-summary]");
    const fullscreen = root.querySelector<HTMLButtonElement>("[data-lifecount-visual-fullscreen]");
    const settingsButton = root.querySelector<HTMLButtonElement>("[data-lifecount-settings]");
    const settings = root.querySelector<HTMLDialogElement>("[data-lifecount-settings-dialog]");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let data: VisualModeData | null = null;
    let renderer: (HourglassRenderer & { retry?: () => void }) | null = null;
    let rendererMode: VisualMode | null = null;
    let candleStatus: CandleStatus = "loading";
    const statusNode = root.querySelector<HTMLElement>("[data-lifecount-visual-status]");
    const retry = root.querySelector<HTMLButtonElement>("[data-lifecount-visual-retry]");
    const showStatus = (value: CandleStatus) => {
        candleStatus = value;
        if (stage) stage.dataset.loadState = value;
        statusNode?.toggleAttribute("hidden", value === "ready" || data?.mode !== "candle");
        const text = root.querySelector<HTMLElement>("[data-lifecount-visual-status-text]");
        if (text && data) text.textContent = value === "error" ? data.messages.visualLoadError : data.messages.visualLoading;
        retry?.toggleAttribute("hidden", value !== "error");
        if (retry && data) retry.textContent = data.messages.visualRetry;
    };
    const onRetry = () => renderer?.retry?.();
    retry?.addEventListener("click", onRetry);
    let timer = 0;
    let destroyed = false;
    const active = () => !!data?.enabled && data.mode !== "grid";
    const closeMenu = () => { if (menu)
        menu.hidden = true; trigger?.setAttribute("aria-expanded", "false"); };
    const stop = () => { window.clearInterval(timer); timer = 0; renderer?.suspend(true); };
    const refresh = () => {
        if (!data || !active() || destroyed)
            return;
        const snapshot = snapshotFor(data.birthday, data.displayAge);
        const format = new Intl.NumberFormat(data.locale === "en" ? "en-US" : "zh-CN");
        if (summary)
            summary.textContent = `${data.messages.visualElapsed(format.format(snapshot.elapsedSeconds))} · ${data.messages.visualRemaining(format.format(snapshot.remainingSeconds))} · ${data.messages.visualProgress(`${(snapshot.progress * 100).toFixed(1)}%`)}`;
        renderer?.update(snapshot.progress, !motion.matches && !document.hidden && !settings?.open);
        renderer?.suspend(document.hidden || motion.matches || !!settings?.open);
    };
    const synchronize = () => {
        stop();
        if (active() && !destroyed) {
            refresh();
            if (!document.hidden)
                timer = window.setInterval(refresh, 1000);
        }
    };
    const isFullscreen = () => document.fullscreenElement === stage || !!stage?.classList.contains("is-fullscreen");
    const compose = () => { if (data && stage && active()) composeStage(stage, data.mode, isFullscreen()); };
    const stageObserver = new ResizeObserver(compose);
    if (stage) stageObserver.observe(stage);
    const onFullscreenChange = () => {
        compose();
        if (!data || !fullscreen)
            return;
        const parent = isFullscreen() ? stage : settingsButton?.parentElement;
        if (parent && fullscreen.parentElement !== parent) {
            parent.insertBefore(fullscreen, parent === stage ? null : settingsButton);
            fullscreen.focus({preventScroll: true});
        }
        fullscreen.hidden = !active();
        const label = isFullscreen() ? data.messages.visualExitFullscreen : data.messages.visualFullscreen;
        fullscreen.title = label;
        fullscreen.setAttribute("aria-label", label);
        fullscreen.setAttribute("aria-pressed", String(isFullscreen()));
    };
    const onFullscreen = async () => {
        if (!stage)
            return;
        if (stage.classList.contains("is-fullscreen")) {
            stage.classList.remove("is-fullscreen");
            onFullscreenChange();
            return;
        }
        try {
            if (document.fullscreenElement === stage)
                await document.exitFullscreen();
            else
                await stage.requestFullscreen();
        }
        catch {
            stage.classList.add("is-fullscreen");
        }
        onFullscreenChange();
    };
    const onTrigger = () => {
        if (!menu || trigger?.disabled)
            return;
        menu.hidden = !menu.hidden;
        trigger?.setAttribute("aria-expanded", String(!menu.hidden));
    };
    const onClick = (event: Event) => {
        if (!(event.target instanceof Node))
            return;
        if (!menu?.contains(event.target) && !trigger?.contains(event.target))
            closeMenu();
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") {
        if (isFullscreen()) {
            if (stage?.classList.contains("is-fullscreen")) {
                stage.classList.remove("is-fullscreen");
                onFullscreenChange();
            }
            return;
        }
        const menuWasOpen = menu && !menu.hidden;
        if (root.hasAttribute("data-immersive") && !menuWasOpen && !settings?.open && !(event.target instanceof Node && settings?.contains(event.target))) onModeChange("grid");
        closeMenu();
        stage?.classList.remove("is-fullscreen");
        onFullscreenChange();
    } };
    const observer = new MutationObserver(refresh);
    if (settings)
        observer.observe(settings, { attributes: true, attributeFilter: ["open"] });
    trigger?.addEventListener("click", onTrigger);
    fullscreen?.addEventListener("click", onFullscreen);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", synchronize);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    motion.addEventListener("change", synchronize);
    window.addEventListener("pagehide", stop);
    window.addEventListener("pageshow", synchronize);
    return {
        update(next) {
            if (destroyed)
                return;
            data = next;
            const skyActive = next.enabled && next.mode === "daylight";
            const immersive = skyActive || (next.enabled && (next.mode === "homebuilding" || next.mode === "tree" || next.mode === "bamboo"));
            root.toggleAttribute("data-immersive", active());
            if (canvas) canvas.hidden = immersive;
            if (trigger) {
                trigger.disabled = !next.enabled;
                const name = next.messages.visualModes[next.mode];
                if (visualLabel) visualLabel.textContent = name;
                trigger.title = name;
                trigger.setAttribute("aria-label", next.messages.visualModeButton + " · " + name);
            }
            menu?.setAttribute("aria-label", next.messages.visualModeTitle);
            menu?.replaceChildren(...VISUAL_MODES.map(mode => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "lifecount-select-option lifecount-visual-option";
                button.dataset.visualMode = mode;
                button.setAttribute("role", "option");
                button.setAttribute("aria-selected", String(mode === next.mode));
                const label = document.createElement("span");
                label.textContent = next.messages.visualModes[mode];
                const check = document.createElement("span");
                check.className = "lifecount-select-option-check";
                check.textContent = "✓";
                check.setAttribute("aria-hidden", "true");
                button.append(label, check);
                button.addEventListener("click", () => { closeMenu(); onModeChange(mode); trigger?.focus(); });
                return button;
            }));
            root.querySelector<HTMLElement>("[data-lifecount-age]")?.toggleAttribute("hidden", active());
            root.querySelector<HTMLElement>("[data-lifecount-summary]")?.toggleAttribute("hidden", active());
            summary?.toggleAttribute("hidden", !active());
            root.querySelector<HTMLElement>("[data-lifecount-summary-region]")?.setAttribute("aria-live", active() ? "off" : "polite");
            map?.toggleAttribute("hidden", active());
            stage?.toggleAttribute("hidden", !active());
            if (stage) stage.dataset.visualMode = next.mode;
            if (rendererMode !== next.mode) {
                renderer?.destroy(); renderer = null; rendererMode = next.mode;
            }
            if (active() && canvas && !renderer) {
                renderer = next.mode === "daylight" && stage
                    ? createDaylight(stage)
                    : next.mode === "bamboo" && stage
                    ? createBamboo(stage)
                    : next.mode === "tree" && stage
                    ? createTree(stage)
                    : next.mode === "homebuilding" && stage
                    ? createHomebuilding(stage)
                    : next.mode === "candle"
                    ? createCandle(canvas, `${import.meta.env.BASE_URL}images/candle/v4/`, showStatus)
                    : createHourglass(canvas, `${import.meta.env.BASE_URL}images/hourglass-glass.png`);
            }
            showStatus(next.mode === "candle" ? candleStatus : "ready");
            if (!active()) {
                closeMenu();
                stage?.classList.remove("is-fullscreen");
                renderer?.destroy();
                renderer = null;
                if (document.fullscreenElement === stage)
                    void document.exitFullscreen();
            }
            onFullscreenChange();
            synchronize();
        },
        destroy() {
            destroyed = true;
            root.removeAttribute("data-immersive");
            stage?.classList.remove("is-fullscreen");
            stop();
            renderer?.destroy();
            renderer = null;
            stageObserver.disconnect();
            observer.disconnect();
            retry?.removeEventListener("click", onRetry);
            trigger?.removeEventListener("click", onTrigger);
            fullscreen?.removeEventListener("click", onFullscreen);
            document.removeEventListener("click", onClick);
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("visibilitychange", synchronize);
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            motion.removeEventListener("change", synchronize);
            window.removeEventListener("pagehide", stop);
            window.removeEventListener("pageshow", synchronize);
        }
    };
}
