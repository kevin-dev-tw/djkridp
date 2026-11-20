// 全域掛載：vanilla WebGL 模組與 GSAP 掛在 window 上的實例
interface StrandsOrb {
  setEnergy?(a: number, b: number): void;
  pulse?(): void;
  wake?(): void;
}

interface SmootherLike {
  scrollTo(target: Element | string, smooth: boolean, position?: string): void;
  paused?(value: boolean): void;
}

interface Window {
  smoother?: SmootherLike | null;
  I18N?: Record<string, Record<string, string>>;
  I18N_LANG?: string;
  t?: (key: string) => string;
  twitchIsLive?: boolean;
  strandsLiveInstance?: StrandsOrb | null;
  strandsHeaderInstance?: StrandsOrb | null;
  strandsInstance?: StrandsOrb | null;
  ensureHeaderOrb?: () => void;
  pauseHeaderOrb?: () => void;
}

// GSAP plugin 在執行期由 useGsapScenes 註冊為全域
declare const ScrollTrigger: {
  refresh(): void;
} | undefined;
