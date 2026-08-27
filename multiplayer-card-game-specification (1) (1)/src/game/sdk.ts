export interface CrazyGamesUser {
  username: string;
  avatarUrl?: string;
}

export type AdType = 'midgame' | 'rewarded';

class CrazyGamesSDKAdapter {
  private isInitialized: boolean = false;
  private sdk: any = null;
  private isDevMock: boolean = true;
  private adListeners: ((type: AdType, success: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public async init() {
    if (typeof window === 'undefined') return;

    try {
      if ((window as any).CrazyGames && (window as any).CrazyGames.SDK) {
        this.sdk = (window as any).CrazyGames.SDK;
        await this.sdk.init();
        this.isDevMock = false;
        console.log('[CrazyGames SDK] Initialized successfully');
      } else {
        this.isDevMock = true;
        console.log('[CrazyGames SDK] Mock Sandbox Mode active (SDK not injected)');
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('[CrazyGames SDK] Failed to initialize live SDK, using mock fallback', e);
      this.isDevMock = true;
      this.isInitialized = true;
    }
  }

  public gameplayStart() {
    try {
      if (this.sdk?.game?.gameplayStart) {
        this.sdk.game.gameplayStart();
      }
      console.log('[CrazyGames SDK] gameplayStart()');
    } catch (e) {
      console.error(e);
    }
  }

  public gameplayStop() {
    try {
      if (this.sdk?.game?.gameplayStop) {
        this.sdk.game.gameplayStop();
      }
      console.log('[CrazyGames SDK] gameplayStop()');
    } catch (e) {
      console.error(e);
    }
  }

  public happyTime() {
    try {
      if (this.sdk?.game?.happytime) {
        this.sdk.game.happytime();
      }
    } catch (e) {
      console.error(e);
    }
  }

  public async requestAd(type: AdType): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isDevMock && this.sdk?.ad?.requestAd) {
        const callbacks = {
          adStarted: () => console.log(`[CrazyGames SDK] ${type} ad started`),
          adFinished: () => {
            console.log(`[CrazyGames SDK] ${type} ad finished`);
            resolve(true);
          },
          adError: (error: any) => {
            console.warn(`[CrazyGames SDK] ${type} ad error:`, error);
            resolve(false);
          },
        };
        this.sdk.ad.requestAd(type, callbacks);
      } else {
        // Mock ad experience in dev/preview
        console.log(`[CrazyGames SDK Mock] Showing simulated ${type} ad for 2.5s`);
        // Trigger simulated callback event
        const event = new CustomEvent('cg_mock_ad_show', { detail: { type } });
        window.dispatchEvent(event);

        setTimeout(() => {
          const finishEvent = new CustomEvent('cg_mock_ad_finish', { detail: { type } });
          window.dispatchEvent(finishEvent);
          resolve(true);
        }, 2500);
      }
    });
  }

  public async getUser(): Promise<CrazyGamesUser | null> {
    try {
      if (this.sdk?.user?.getUser) {
        const user = await this.sdk.user.getUser();
        return user;
      }
    } catch (e) {
      console.warn('[CrazyGames SDK] user.getUser failed or not supported');
    }
    return null;
  }

  public async saveCloudData(key: string, value: string): Promise<void> {
    try {
      if (this.sdk?.data?.setItem) {
        await this.sdk.data.setItem(key, value);
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(`cg_save_${key}`, value);
      }
    } catch (e) {
      console.warn('[CrazyGames SDK] saveCloudData error:', e);
    }
  }

  public async getCloudData(key: string): Promise<string | null> {
    try {
      if (this.sdk?.data?.getItem) {
        return await this.sdk.data.getItem(key);
      } else if (typeof window !== 'undefined') {
        return localStorage.getItem(`cg_save_${key}`);
      }
    } catch (e) {
      console.warn('[CrazyGames SDK] getCloudData error:', e);
    }
    return null;
  }
}

export const crazyGamesSDK = new CrazyGamesSDKAdapter();
