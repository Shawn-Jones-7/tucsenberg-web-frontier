/**
 * Vitest 测试环境设置文件
 * 配置全局测试环境、Mock和工具函数
 */

/* eslint-disable max-lines-per-function, max-lines */

// ⚠️ CRITICAL: Mock geist fonts BEFORE any other imports
// This prevents ES module directory import errors from geist package
import { afterEach, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
// 扩展 Vitest 的 expect 断言
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Mock geist/font/mono and geist/font/sans to avoid next/font/local directory import issues
// This is a test-only stub and has no effect on production builds
vi.mock('geist/font/mono', () => ({
  GeistMono: {
    variable: '--font-geist-mono',
    className: 'geist-mono',
    style: { fontFamily: 'Geist Mono' },
  },
}));

vi.mock('geist/font/sans', () => ({
  GeistSans: {
    variable: '--font-geist-sans',
    className: 'geist-sans',
    style: { fontFamily: 'Geist Sans' },
  },
}));

/**
 * Global fetch polyfill and stable mock for externalized messages requests
 *
 * Purpose:
 * - Avoid ECONNREFUSED when local dev server is not running during unit tests
 * - Provide deterministic responses for /messages/* so tests don't depend on network
 *
 * Scope:
 * - Only intercepts URLs containing '/messages/'
 * - All other requests fall back to the original global fetch if present
 *
 * Environment switch:
 * - Set VITEST_USE_REAL_MESSAGES=true to bypass this mock and use real network
 * - Useful for integration tests that need actual message loading
 *
 * Example:
 *   VITEST_USE_REAL_MESSAGES=true pnpm test src/lib/__tests__/i18n-performance.test.ts
 *
 * Note:
 * - This is test-only behavior. Production builds and runtime are unaffected.
 */

// Global fetch polyfill and stable mock for externalized messages requests
// - Avoid ECONNREFUSED when local server is not running during tests
// - If a test needs real network, set VITEST_USE_REAL_MESSAGES=true in that test
(() => {
  // Minimal Response polyfill if not available
  const hasNativeResponse = typeof (globalThis as any).Response !== 'undefined';
  const SimpleResponse: any = hasNativeResponse
    ? (globalThis as any).Response
    : class SimpleResponse {
        private _body: string;
        status: number;
        ok: boolean;
        headers: Map<string, string>;
        constructor(
          body: string,
          init: { status: number; headers?: Record<string, string> },
        ) {
          this._body = body ?? '{}';
          this.status = init.status;
          this.ok = this.status >= 200 && this.status < 300;
          this.headers = new Map(Object.entries(init.headers || {}));
        }
        async json() {
          try {
            return JSON.parse(this._body || '{}');
          } catch {
            return {};
          }
        }
        async text() {
          return this._body || '';
        }
      };

  const OriginalFetch = (globalThis as any).fetch as
    | ((input: any, init?: any) => Promise<any>)
    | undefined;

  const mockFetch = vi.fn(async (input: any, init?: any) => {
    // Normalize URL
    let url = '';
    try {
      url =
        typeof input === 'string'
          ? input
          : input && input.url
            ? (input.url as string)
            : String(input);
    } catch {
      url = '';
    }

    // Stable mock for externalized messages under public/messages/*
    if (!process.env.VITEST_USE_REAL_MESSAGES && url.includes('/messages/')) {
      const body = JSON.stringify({});
      return new SimpleResponse(body, {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }) as Response;
    }

    // Fallback to original fetch if available
    if (typeof OriginalFetch === 'function') {
      return OriginalFetch(input, init);
    }

    // Final fallback: return empty JSON
    return new SimpleResponse(JSON.stringify({}), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }) as Response;
  });

  // Publish polyfills if missing
  if (typeof (globalThis as any).Response === 'undefined') {
    (globalThis as any).Response = SimpleResponse;
  }
  if (typeof (globalThis as any).Headers === 'undefined') {
    // Minimal Headers no-op polyfill to satisfy type checks
    (globalThis as any).Headers = class {};
  }

  // Set global fetch to our mocked version to ensure stability in unit tests
  vi.stubGlobal('fetch', mockFetch);
})();

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<any, void> {}
}

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    pop: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
  })),
}));

// Mock Next.js navigation (App Router)
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/'),
  useParams: vi.fn(() => ({})),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  notFound: vi.fn(),
}));

// Suppress jsdom navigation errors during unit tests
// - Clicking <a href> in jsdom can trigger "Not implemented: navigation" errors
// - Unit tests generally assert handlers/state rather than real navigation
//   so we neutralize navigation side-effects in the test environment.
// Window navigation stubs
Object.defineProperty(window, 'open', { value: vi.fn(), configurable: true });
try {
  const locDesc = Object.getOwnPropertyDescriptor(window, 'location');
  if (!locDesc || locDesc.configurable) {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        assign: vi.fn(),
        replace: vi.fn(),
      },
      configurable: true,
    });
  }
} catch {
  // In Browser Mode, window.location is not configurable; skip overriding
}

// Anchor click: dispatch click event without performing navigation
const _anchorClick = HTMLAnchorElement.prototype.click;
vi.spyOn(HTMLAnchorElement.prototype as any, 'click').mockImplementation(
  function anchorClickMock(this: HTMLAnchorElement) {
    // Fire a cancellable click event so user handlers still run
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(evt);
    // Do not call the original click to avoid jsdom navigation
  },
);

// Mock lucide-react icons - 返回真正的React元素而不是字符串
// Browser Mode（BROWSER_TEST=true）下跳过此 Mock，避免 v4 Browser 手动 mock 解析冲突
if (process.env.BROWSER_TEST !== 'true') {
  const _MockIcon = vi.fn(({ className, ...props }: any) =>
    React.createElement('svg', {
      'className': className || '',
      'data-testid': 'mock-icon',
      'width': '24',
      'height': '24',
      'viewBox': '0 0 24 24',
      'fill': 'none',
      'stroke': 'currentColor',
      'strokeWidth': '2',
      'strokeLinecap': 'round',
      'strokeLinejoin': 'round',
      ...props,
    }),
  );

  vi.mock('lucide-react', () => {
    // 在 factory 内定义 MockIcon，避免 Vitest v4 hoist 导致的未定义错误
    const MockIcon = ({ className, ...props }: any) =>
      React.createElement('svg', {
        'className': className || '',
        'data-testid': 'mock-icon',
        'width': '24',
        'height': '24',
        'viewBox': '0 0 24 24',
        'fill': 'none',
        'stroke': 'currentColor',
        'strokeWidth': '2',
        'strokeLinecap': 'round',
        'strokeLinejoin': 'round',
        ...props,
      });
    return {
      __esModule: true,
      default: MockIcon,
      // 常用图标
      Home: MockIcon,
      User: MockIcon,
      Settings: MockIcon,
      Search: MockIcon,
      Menu: MockIcon,
      X: MockIcon,
      XIcon: MockIcon,
      ChevronDown: MockIcon,
      ChevronUp: MockIcon,
      ChevronLeft: MockIcon,
      ChevronRight: MockIcon,
      ChevronRightIcon: MockIcon,
      ArrowLeft: MockIcon,
      ArrowRight: MockIcon,
      Globe: MockIcon,
      Languages: MockIcon,
      Monitor: MockIcon,
      MapPin: MockIcon,
      Smartphone: MockIcon,
      Mail: MockIcon,
      MessageCircle: MockIcon,
      MessageSquare: MockIcon,
      Phone: MockIcon,
      ExternalLink: MockIcon,
      Github: MockIcon,
      Twitter: MockIcon,
      Linkedin: MockIcon,
      Facebook: MockIcon,
      Instagram: MockIcon,
      Youtube: MockIcon,
      Check: MockIcon,
      CheckIcon: MockIcon,
      CheckCircle: MockIcon,
      AlertCircle: MockIcon,
      Info: MockIcon,
      Warning: MockIcon,
      Error: MockIcon,
      Plus: MockIcon,
      Minus: MockIcon,
      Edit: MockIcon,
      Trash: MockIcon,
      Download: MockIcon,
      Upload: MockIcon,
      Copy: MockIcon,
      Share: MockIcon,
      Share2: MockIcon,
      Heart: MockIcon,
      Star: MockIcon,
      Bookmark: MockIcon,
      BookOpen: MockIcon,
      Calendar: MockIcon,
      Clock: MockIcon,
      Eye: MockIcon,
      EyeOff: MockIcon,
      Lock: MockIcon,
      Unlock: MockIcon,
      Shield: MockIcon,
      Key: MockIcon,
      Zap: MockIcon,
      Wifi: MockIcon,
      WifiOff: MockIcon,
      Battery: MockIcon,
      Volume: MockIcon,
      VolumeOff: MockIcon,
      Play: MockIcon,
      Pause: MockIcon,
      Stop: MockIcon,
      SkipBack: MockIcon,
      SkipForward: MockIcon,
      Repeat: MockIcon,
      Shuffle: MockIcon,
      Camera: MockIcon,
      Circle: MockIcon,
      CircleIcon: MockIcon,
      Image: MockIcon,
      Video: MockIcon,
      Mic: MockIcon,
      MicOff: MockIcon,
      Speaker: MockIcon,
      Headphones: MockIcon,
      Music: MockIcon,
      Film: MockIcon,
      FileText: MockIcon,
      Code: MockIcon,
      File: MockIcon,
      Folder: MockIcon,
      FolderOpen: MockIcon,
      Archive: MockIcon,
      Package: MockIcon,
      Box: MockIcon,
      Truck: MockIcon,
      Car: MockIcon,
      Plane: MockIcon,
      Ship: MockIcon,
      Train: MockIcon,
      Bike: MockIcon,
      Walk: MockIcon,
      Run: MockIcon,
      Target: MockIcon,
      Flag: MockIcon,
      Award: MockIcon,
      Trophy: MockIcon,
      Medal: MockIcon,
      Gift: MockIcon,
      ShoppingCart: MockIcon,
      ShoppingBag: MockIcon,
      CreditCard: MockIcon,
      DollarSign: MockIcon,
      Euro: MockIcon,
      Pound: MockIcon,
      Yen: MockIcon,
      Bitcoin: MockIcon,
      TrendingUp: MockIcon,
      TrendingDown: MockIcon,
      BarChart: MockIcon,
      PieChart: MockIcon,
      Activity: MockIcon,
      Pulse: MockIcon,
      Thermometer: MockIcon,
      Gauge: MockIcon,
      Compass: MockIcon,
      Navigation: MockIcon,
      Map: MockIcon,
      Layers: MockIcon,
      Filter: MockIcon,
      Sort: MockIcon,
      Grid: MockIcon,
      List: MockIcon,
      Layout: MockIcon,
      Sidebar: MockIcon,
      Maximize: MockIcon,
      Minimize: MockIcon,
      MoreHorizontal: MockIcon,
      MoreVertical: MockIcon,
      RefreshCw: MockIcon,
      RotateCcw: MockIcon,
      RotateCw: MockIcon,
      Undo: MockIcon,
      Redo: MockIcon,
      Save: MockIcon,
      Print: MockIcon,
      Printer: MockIcon,
      Scan: MockIcon,
      QrCode: MockIcon,
      Barcode: MockIcon,
      Hash: MockIcon,
      AtSign: MockIcon,
      Percent: MockIcon,
      Slash: MockIcon,
      Backslash: MockIcon,
      Asterisk: MockIcon,
      Equal: MockIcon,
      NotEqual: MockIcon,
      LessThan: MockIcon,
      GreaterThan: MockIcon,
      LessEqual: MockIcon,
      GreaterEqual: MockIcon,
      Infinity: MockIcon,
      Pi: MockIcon,
      Sigma: MockIcon,
      Alpha: MockIcon,
      Beta: MockIcon,
      Gamma: MockIcon,
      Delta: MockIcon,
      Lambda: MockIcon,
      Omega: MockIcon,
      Sun: MockIcon,
      Moon: MockIcon,
      Cloud: MockIcon,
      CloudRain: MockIcon,
      CloudSnow: MockIcon,
      CloudLightning: MockIcon,
      Umbrella: MockIcon,
      Droplets: MockIcon,
      Wind: MockIcon,
      Tornado: MockIcon,
      Snowflake: MockIcon,
      Flame: MockIcon,
      Leaf: MockIcon,
      Tree: MockIcon,
      Flower: MockIcon,
      Seedling: MockIcon,
      Cactus: MockIcon,
      Mountain: MockIcon,
      Waves: MockIcon,
      Sunrise: MockIcon,
      Sunset: MockIcon,
      Rainbow: MockIcon,
      Sparkles: MockIcon,
      Sparkle: MockIcon,
      Stars: MockIcon,
      Comet: MockIcon,
      Rocket: MockIcon,
      Satellite: MockIcon,
      Telescope: MockIcon,
      Microscope: MockIcon,
      Atom: MockIcon,
      Dna: MockIcon,
      Virus: MockIcon,
      Bacteria: MockIcon,
      Pill: MockIcon,
      Syringe: MockIcon,
      Stethoscope: MockIcon,
      Bandage: MockIcon,
      FirstAid: MockIcon,
      Cross: MockIcon,
      Plus2: MockIcon,
      Minus2: MockIcon,
      Divide: MockIcon,
      Multiply: MockIcon,
      Square: MockIcon,
      Triangle: MockIcon,
      Diamond: MockIcon,
      Pentagon: MockIcon,
      Hexagon: MockIcon,
      Octagon: MockIcon,
      Rectangle: MockIcon,
      RoundedRectangle: MockIcon,
      Ellipse: MockIcon,
      Polygon: MockIcon,
      Polyline: MockIcon,
      Bezier: MockIcon,
      Spline: MockIcon,
      Vector: MockIcon,
      Anchor: MockIcon,
      Paperclip: MockIcon,
      Link: MockIcon,
      Unlink: MockIcon,
      Chain: MockIcon,
      Scissors: MockIcon,
      Ruler: MockIcon,
      Pen: MockIcon,
      Pencil: MockIcon,
      Brush: MockIcon,
      Palette: MockIcon,
      Pipette: MockIcon,
      Eraser: MockIcon,
      Highlighter: MockIcon,
      Marker: MockIcon,
      Crayon: MockIcon,
      PaintBucket: MockIcon,
      Spray: MockIcon,
      Stamp: MockIcon,
      Seal: MockIcon,
      Badge: MockIcon,
      Ribbon: MockIcon,
      Rosette: MockIcon,
      Crown: MockIcon,
      Gem: MockIcon,
      Ring: MockIcon,
      Necklace: MockIcon,
      Bracelet: MockIcon,
      Watch: MockIcon,
      Glasses: MockIcon,
      Sunglasses: MockIcon,
      Hat: MockIcon,
      Cap: MockIcon,
      Helmet: MockIcon,
      Mask: MockIcon,
      Gloves: MockIcon,
      Socks: MockIcon,
      Shoes: MockIcon,
      Boots: MockIcon,
      Sandals: MockIcon,
      Slippers: MockIcon,
      Shirt: MockIcon,
      Dress: MockIcon,
      Pants: MockIcon,
      Shorts: MockIcon,
      Skirt: MockIcon,
      Jacket: MockIcon,
      Coat: MockIcon,
      Sweater: MockIcon,
      Hoodie: MockIcon,
      Scarf: MockIcon,
      Tie: MockIcon,
      BowTie: MockIcon,
      Belt: MockIcon,
      Suspenders: MockIcon,
      Pocket: MockIcon,
      Button: MockIcon,
      Zipper: MockIcon,
      Thread: MockIcon,
      Needle: MockIcon,
      Scissors2: MockIcon,
      Thimble: MockIcon,
      MeasuringTape: MockIcon,
      Fabric: MockIcon,
      Pattern: MockIcon,
      Loom: MockIcon,
      SpinningWheel: MockIcon,
      Yarn: MockIcon,
      Knot: MockIcon,
      Rope: MockIcon,
      String: MockIcon,
      Wire: MockIcon,
      Cable: MockIcon,
      Plug: MockIcon,
      Socket: MockIcon,
      Switch: MockIcon,
      Lightbulb: MockIcon,
      Lamp: MockIcon,
      Candle: MockIcon,
      Torch: MockIcon,
      Flashlight: MockIcon,
      Lantern: MockIcon,
      Beacon: MockIcon,
      Lighthouse: MockIcon,
      Spotlight: MockIcon,
      Projector: MockIcon,
      Screen: MockIcon,
      Television: MockIcon,
      Radio: MockIcon,
      Antenna: MockIcon,
      Satellite2: MockIcon,
      Radar: MockIcon,
      Sonar: MockIcon,
      Gps: MockIcon,
      Compass2: MockIcon,
      Magnet: MockIcon,
      Electromagnet: MockIcon,
      Coil: MockIcon,
      Resistor: MockIcon,
      Capacitor: MockIcon,
      Inductor: MockIcon,
      Diode: MockIcon,
      Transistor: MockIcon,
      Chip: MockIcon,
      Circuit: MockIcon,
      Breadboard: MockIcon,
      Pcb: MockIcon,
      Soldering: MockIcon,
      Multimeter: MockIcon,
      Oscilloscope: MockIcon,
      Generator: MockIcon,
      Motor: MockIcon,
      Gear: MockIcon,
      Cog: MockIcon,
      Wrench: MockIcon,
      Screwdriver: MockIcon,
      Hammer: MockIcon,
      Saw: MockIcon,
      Drill: MockIcon,
      Pliers: MockIcon,
      Clamp: MockIcon,
      Vice: MockIcon,
      Anvil: MockIcon,
      Forge: MockIcon,
      Furnace: MockIcon,
      Kiln: MockIcon,
      Oven: MockIcon,
      Stove: MockIcon,
      Microwave: MockIcon,
      Refrigerator: MockIcon,
      Freezer: MockIcon,
      Dishwasher: MockIcon,
      WashingMachine: MockIcon,
      Dryer: MockIcon,
      Iron: MockIcon,
      VacuumCleaner: MockIcon,
      Broom: MockIcon,
      Mop: MockIcon,
      Bucket: MockIcon,
      Sponge: MockIcon,
      Soap: MockIcon,
      Towel: MockIcon,
      Tissue: MockIcon,
      ToiletPaper: MockIcon,
      Toothbrush: MockIcon,
      Toothpaste: MockIcon,
      Shampoo: MockIcon,
      Conditioner: MockIcon,
      BodyWash: MockIcon,
      Lotion: MockIcon,
      Perfume: MockIcon,
      Deodorant: MockIcon,
      Razor: MockIcon,
      Shaver: MockIcon,
      Comb: MockIcon,
      Brush2: MockIcon,
      HairDryer: MockIcon,
      Curler: MockIcon,
      Straightener: MockIcon,
      Mirror: MockIcon,
      Scale: MockIcon,
      Thermometer2: MockIcon,
      BloodPressure: MockIcon,
      Pulse2: MockIcon,
      Heartbeat: MockIcon,
      Ecg: MockIcon,
      Ekg: MockIcon,
      XRay: MockIcon,
      Ultrasound: MockIcon,
      Mri: MockIcon,
      CtScan: MockIcon,
      PetScan: MockIcon,
      Endoscope: MockIcon,
      Otoscope: MockIcon,
      Ophthalmoscope: MockIcon,
      Reflex: MockIcon,
      Tuning: MockIcon,
      Fork: MockIcon,
      Spoon: MockIcon,
      Knife: MockIcon,
      Plate: MockIcon,
      Bowl: MockIcon,
      Cup: MockIcon,
      Mug: MockIcon,
      Glass: MockIcon,
      Bottle: MockIcon,
      Can: MockIcon,
      Jar: MockIcon,
      Pot: MockIcon,
      Pan: MockIcon,
      Kettle: MockIcon,
      Teapot: MockIcon,
      CoffeeMaker: MockIcon,
      Blender: MockIcon,
      Mixer: MockIcon,
      Whisk: MockIcon,
      Spatula: MockIcon,
      Ladle: MockIcon,
      Tongs: MockIcon,
      Peeler: MockIcon,
      Grater: MockIcon,
      Slicer: MockIcon,
      Chopper: MockIcon,
      Mortar: MockIcon,
      Pestle: MockIcon,
      RollingPin: MockIcon,
      CuttingBoard: MockIcon,
      Colander: MockIcon,
      Strainer: MockIcon,
      Funnel: MockIcon,
      MeasuringCup: MockIcon,
      MeasuringSpoon: MockIcon,
      Timer: MockIcon,
      Stopwatch: MockIcon,
      Hourglass: MockIcon,
      Sundial: MockIcon,
      Metronome: MockIcon,
      Tuner: MockIcon,
      Piano: MockIcon,
      Guitar: MockIcon,
      Violin: MockIcon,
      Cello: MockIcon,
      Bass: MockIcon,
      Drums: MockIcon,
      Trumpet: MockIcon,
      Saxophone: MockIcon,
      Flute: MockIcon,
      Clarinet: MockIcon,
      Oboe: MockIcon,
      Bassoon: MockIcon,
      Tuba: MockIcon,
      Horn: MockIcon,
      Trombone: MockIcon,
      Harp: MockIcon,
      Banjo: MockIcon,
      Mandolin: MockIcon,
      Ukulele: MockIcon,
      Harmonica: MockIcon,
      Accordion: MockIcon,
      Organ: MockIcon,
      Synthesizer: MockIcon,
      Keyboard: MockIcon,
      Microphone: MockIcon,
      Amplifier: MockIcon,
      Speaker2: MockIcon,
      Subwoofer: MockIcon,
      Tweeter: MockIcon,
      Woofer: MockIcon,
      Equalizer: MockIcon,
      Mixer2: MockIcon,
      Turntable: MockIcon,
      Record: MockIcon,
      Cd: MockIcon,
      Dvd: MockIcon,
      BluRay: MockIcon,
      Cassette: MockIcon,
      Vhs: MockIcon,
      Floppy: MockIcon,
      HardDrive: MockIcon,
      Ssd: MockIcon,
      UsbDrive: MockIcon,
      SdCard: MockIcon,
      MemoryCard: MockIcon,
      Ram: MockIcon,
      Cpu: MockIcon,
      Gpu: MockIcon,
      Motherboard: MockIcon,
      PowerSupply: MockIcon,
      Fan: MockIcon,
      Cooler: MockIcon,
      Heatsink: MockIcon,
      ThermalPaste: MockIcon,
      Cable2: MockIcon,
      Connector: MockIcon,
      Adapter: MockIcon,
      Splitter: MockIcon,
      Hub: MockIcon,
      Router: MockIcon,
      Modem: MockIcon,
      Switch2: MockIcon,
      Bridge: MockIcon,
      Gateway: MockIcon,
      Firewall: MockIcon,
      Proxy: MockIcon,
      Vpn: MockIcon,
      Tunnel: MockIcon,
      Encryption: MockIcon,
      Decryption: MockIcon,
      Hash2: MockIcon,
      Checksum: MockIcon,
      Signature: MockIcon,
      Certificate: MockIcon,
      License: MockIcon,
      Patent: MockIcon,
      Copyright: MockIcon,
      Trademark: MockIcon,
      Registered: MockIcon,
      ServiceMark: MockIcon,
      Brand: MockIcon,
      Logo: MockIcon,
      Watermark: MockIcon,
      Stamp2: MockIcon,
      Seal2: MockIcon,
      Emboss: MockIcon,
      Engrave: MockIcon,
      Etch: MockIcon,
      Carve: MockIcon,
      Sculpt: MockIcon,
      Mold: MockIcon,
      Cast: MockIcon,
      Forge2: MockIcon,
      Weld: MockIcon,
      Solder: MockIcon,
      Braze: MockIcon,
      Rivet: MockIcon,
      Bolt: MockIcon,
      Nut: MockIcon,
      Washer: MockIcon,
      Screw: MockIcon,
      Nail: MockIcon,
      Staple: MockIcon,
      Clip: MockIcon,
      Pin: MockIcon,
      Tack: MockIcon,
      Brad: MockIcon,
      Dowel: MockIcon,
      Peg: MockIcon,
      Wedge: MockIcon,
      Shim: MockIcon,
      Spacer: MockIcon,
      Gasket: MockIcon,
      Seal3: MockIcon,
      Ring2: MockIcon,
      Bearing: MockIcon,
      Bushing: MockIcon,
      Sleeve: MockIcon,
      Collar: MockIcon,
      Flange: MockIcon,
      Coupling: MockIcon,
      Joint: MockIcon,
      Hinge: MockIcon,
      Pivot: MockIcon,
      Swivel: MockIcon,
      Slide: MockIcon,
      Track: MockIcon,
      Rail: MockIcon,
      Guide: MockIcon,
      StopSign: MockIcon,
      Bumper: MockIcon,
      Cushion: MockIcon,
      Pad: MockIcon,
      Mat: MockIcon,
      Rug: MockIcon,
      Carpet: MockIcon,
      Tile: MockIcon,
      Plank: MockIcon,
      Board: MockIcon,
      Panel: MockIcon,
      Sheet: MockIcon,
      Plate2: MockIcon,
      Slab: MockIcon,
      Block: MockIcon,
      Brick: MockIcon,
      Stone: MockIcon,
      Rock: MockIcon,
      Pebble: MockIcon,
      Sand: MockIcon,
      Gravel: MockIcon,
      Concrete: MockIcon,
      Cement: MockIcon,
      MortarMix: MockIcon,
      Plaster: MockIcon,
      Stucco: MockIcon,
      Paint: MockIcon,
      Primer: MockIcon,
      Sealer: MockIcon,
      Stain: MockIcon,
      Varnish: MockIcon,
      Lacquer: MockIcon,
      Polyurethane: MockIcon,
      Epoxy: MockIcon,
      Resin: MockIcon,
      Glue: MockIcon,
      Adhesive: MockIcon,
      Tape: MockIcon,
      Velcro: MockIcon,
      Magnet2: MockIcon,
      Suction: MockIcon,
      Vacuum: MockIcon,
      Pressure: MockIcon,
      Compression: MockIcon,
      Tension: MockIcon,
      Torsion: MockIcon,
      Shear: MockIcon,
      Bend: MockIcon,
      Twist: MockIcon,
      Stretch: MockIcon,
      Compress: MockIcon,
      Expand: MockIcon,
      Contract: MockIcon,
      Inflate: MockIcon,
      Deflate: MockIcon,
      Pump: MockIcon,
      Compressor: MockIcon,
      Blower: MockIcon,
      Exhaust: MockIcon,
      Intake: MockIcon,
      Filter2: MockIcon,
      Purifier: MockIcon,
      Cleaner: MockIcon,
      Sanitizer: MockIcon,
      Disinfectant: MockIcon,
      Sterilizer: MockIcon,
      Autoclave: MockIcon,
      Incubator: MockIcon,
      Centrifuge: MockIcon,
      Separator: MockIcon,
      Extractor: MockIcon,
      Distiller: MockIcon,
      Evaporator: MockIcon,
      Condenser: MockIcon,
      Radiator: MockIcon,
      HeatExchanger: MockIcon,
      Boiler: MockIcon,
      Chiller: MockIcon,
      AirConditioner: MockIcon,
      Heater: MockIcon,
      Furnace2: MockIcon,
      Fireplace: MockIcon,
      Chimney: MockIcon,
      Vent: MockIcon,
      Duct: MockIcon,
      Pipe: MockIcon,
      Tube: MockIcon,
      Hose: MockIcon,
      Valve: MockIcon,
      Faucet: MockIcon,
      Spigot: MockIcon,
      Nozzle: MockIcon,
      Sprinkler: MockIcon,
      Shower: MockIcon,
      Bath: MockIcon,
      Tub: MockIcon,
      Sink: MockIcon,
      Basin: MockIcon,
      Drain: MockIcon,
      Trap: MockIcon,
      Septic: MockIcon,
      Sewer: MockIcon,
      Manhole: MockIcon,
      Grate: MockIcon,
      Cover: MockIcon,
      Lid: MockIcon,
      Cap2: MockIcon,
      Stopper: MockIcon,
      Cork: MockIcon,
      Plug2: MockIcon,
      Outlet: MockIcon,
      Inlet: MockIcon,
      Port: MockIcon,
      Jack: MockIcon,
      Socket2: MockIcon,
      Receptacle: MockIcon,
      Terminal: MockIcon,
      Contact: MockIcon,
      Probe: MockIcon,
      Sensor: MockIcon,
      Detector: MockIcon,
      Monitor2: MockIcon,
      Gauge2: MockIcon,
      Meter: MockIcon,
      Counter: MockIcon,
      Register: MockIcon,
      Display: MockIcon,
      Indicator: MockIcon,
      Light: MockIcon,
      Led: MockIcon,
      Laser: MockIcon,
      Fiber: MockIcon,
      Optic: MockIcon,
      Lens: MockIcon,
      Prism: MockIcon,
      Mirror2: MockIcon,
      Reflector: MockIcon,
      Diffuser: MockIcon,
      Filter3: MockIcon,
      Polarizer: MockIcon,
      Shutter: MockIcon,
      Aperture: MockIcon,
      Iris: MockIcon,
      Pupil: MockIcon,
      Retina: MockIcon,
      Cornea: MockIcon,
      Sclera: MockIcon,
      Eyelid: MockIcon,
      Eyelash: MockIcon,
      Eyebrow: MockIcon,
      Forehead: MockIcon,
      Temple: MockIcon,
      Cheek: MockIcon,
      Nose: MockIcon,
      Nostril: MockIcon,
      Mouth: MockIcon,
      Lip: MockIcon,
      Tooth: MockIcon,
      Tongue: MockIcon,
      Chin: MockIcon,
      Jaw: MockIcon,
      Ear: MockIcon,
      Earlobe: MockIcon,
      Neck: MockIcon,
      Throat: MockIcon,
      Shoulder: MockIcon,
      Arm: MockIcon,
      Elbow: MockIcon,
      Forearm: MockIcon,
      Wrist: MockIcon,
      Hand: MockIcon,
      Palm: MockIcon,
      Finger: MockIcon,
      Thumb: MockIcon,
      Nail2: MockIcon,
      Knuckle: MockIcon,
      Chest: MockIcon,
      Breast: MockIcon,
      Rib: MockIcon,
      Spine: MockIcon,
      Back: MockIcon,
      Waist: MockIcon,
      Hip: MockIcon,
      Buttock: MockIcon,
      Thigh: MockIcon,
      Knee: MockIcon,
      Shin: MockIcon,
      Calf: MockIcon,
      Ankle: MockIcon,
      Foot: MockIcon,
      Heel: MockIcon,
      Toe: MockIcon,
      Sole: MockIcon,
      Arch: MockIcon,
      Instep: MockIcon,
      Bone: MockIcon,
      Skull: MockIcon,
      Brain: MockIcon,
      Nerve: MockIcon,
      Muscle: MockIcon,
      Tendon: MockIcon,
      Ligament: MockIcon,
      Cartilage: MockIcon,
      Joint2: MockIcon,
      Skin: MockIcon,
      Hair: MockIcon,
      Follicle: MockIcon,
      Pore: MockIcon,
      Sweat: MockIcon,
      Sebum: MockIcon,
      Blood: MockIcon,
      Vein: MockIcon,
      Artery: MockIcon,
      Capillary: MockIcon,
      Heart2: MockIcon,
      Lung: MockIcon,
      Liver: MockIcon,
      Kidney: MockIcon,
      Stomach: MockIcon,
      Intestine: MockIcon,
      Colon: MockIcon,
      Rectum: MockIcon,
      Anus: MockIcon,
      Bladder: MockIcon,
      Urethra: MockIcon,
      Prostate: MockIcon,
      Ovary: MockIcon,
      Uterus: MockIcon,
      Vagina: MockIcon,
      Penis: MockIcon,
      Testicle: MockIcon,
      Sperm: MockIcon,
      Egg: MockIcon,
      Embryo: MockIcon,
      Fetus: MockIcon,
      Baby: MockIcon,
      Child: MockIcon,
      Adult: MockIcon,
      Elder: MockIcon,
      Male: MockIcon,
      Female: MockIcon,
      Person: MockIcon,
      People: MockIcon,
      Family: MockIcon,
      Couple: MockIcon,
      Parent: MockIcon,
      Mother: MockIcon,
      Father: MockIcon,
      Son: MockIcon,
      Daughter: MockIcon,
      Brother: MockIcon,
      Sister: MockIcon,
      Grandfather: MockIcon,
      Grandmother: MockIcon,
      Grandson: MockIcon,
      Granddaughter: MockIcon,
      Uncle: MockIcon,
      Aunt: MockIcon,
      Nephew: MockIcon,
      Niece: MockIcon,
      Cousin: MockIcon,
      Friend: MockIcon,
      Stranger: MockIcon,
      Neighbor: MockIcon,
      Colleague: MockIcon,
      Boss: MockIcon,
      Employee: MockIcon,
      Worker: MockIcon,
      Manager: MockIcon,
      Director: MockIcon,
      Executive: MockIcon,
      President: MockIcon,
      Ceo: MockIcon,
      Cto: MockIcon,
      Cfo: MockIcon,
      Coo: MockIcon,
      Cmo: MockIcon,
      Ciso: MockIcon,
      Cdo: MockIcon,
      Cpo: MockIcon,
      Cro: MockIcon,
      Cso: MockIcon,
      Cvo: MockIcon,
      Cwo: MockIcon,
      Cxo: MockIcon,
      Vp: MockIcon,
      Svp: MockIcon,
      Evp: MockIcon,
      Avp: MockIcon,
      Gm: MockIcon,
      Pm: MockIcon,
      Sm: MockIcon,
      Tm: MockIcon,
      Am: MockIcon,
      Rm: MockIcon,
      Dm: MockIcon,
      Fm: MockIcon,
      Hm: MockIcon,
      Im: MockIcon,
      Km: MockIcon,
      Lm: MockIcon,
      Mm: MockIcon,
      Nm: MockIcon,
      Om: MockIcon,
      Qm: MockIcon,
      Um: MockIcon,
      Vm: MockIcon,
      Wm: MockIcon,
      Xm: MockIcon,
      Ym: MockIcon,
      Zm: MockIcon,
    };
  });
}

// Mock Zod validation library
const createMockZodString = () => {
  const mockString = {
    min: vi.fn(() => mockString),
    max: vi.fn(() => mockString),
    email: vi.fn(() => mockString),
    url: vi.fn(() => mockString),
    regex: vi.fn(() => mockString),
    optional: vi.fn(() => mockString),
    nullable: vi.fn(() => mockString),
    default: vi.fn(() => mockString),
    transform: vi.fn(() => mockString),
    refine: vi.fn(() => mockString),
    parse: vi.fn((value) => value),
    safeParse: vi.fn((value) => ({ success: true, data: value })),
  };
  return mockString;
};

const createMockZodNumber = () => {
  const mockNumber = {
    min: vi.fn(() => mockNumber),
    max: vi.fn(() => mockNumber),
    int: vi.fn(() => mockNumber),
    positive: vi.fn(() => mockNumber),
    negative: vi.fn(() => mockNumber),
    nonnegative: vi.fn(() => mockNumber),
    nonpositive: vi.fn(() => mockNumber),
    finite: vi.fn(() => mockNumber),
    optional: vi.fn(() => mockNumber),
    nullable: vi.fn(() => mockNumber),
    default: vi.fn(() => mockNumber),
    transform: vi.fn(() => mockNumber),
    refine: vi.fn(() => mockNumber),
    parse: vi.fn((value) => value),
    safeParse: vi.fn((value) => ({ success: true, data: value })),
  };
  return mockNumber;
};

const createMockZodBoolean = () => {
  const mockBoolean = {
    optional: vi.fn(() => mockBoolean),
    nullable: vi.fn(() => mockBoolean),
    default: vi.fn(() => mockBoolean),
    transform: vi.fn(() => mockBoolean),
    refine: vi.fn(() => mockBoolean),
    parse: vi.fn((value) => value),
    safeParse: vi.fn((value) => ({ success: true, data: value })),
  };
  return mockBoolean;
};

const createMockZodArray = () => {
  const mockArray = {
    min: vi.fn(() => mockArray),
    max: vi.fn(() => mockArray),
    length: vi.fn(() => mockArray),
    nonempty: vi.fn(() => mockArray),
    optional: vi.fn(() => mockArray),
    nullable: vi.fn(() => mockArray),
    default: vi.fn(() => mockArray),
    transform: vi.fn(() => mockArray),
    refine: vi.fn(() => mockArray),
    parse: vi.fn((value) => value),
    safeParse: vi.fn((value) => ({ success: true, data: value })),
  };
  return mockArray;
};

const createMockZodObject = () => {
  const mockObject = {
    shape: {},
    extend: vi.fn(() => mockObject),
    merge: vi.fn(() => mockObject),
    pick: vi.fn(() => mockObject),
    omit: vi.fn(() => mockObject),
    partial: vi.fn(() => mockObject),
    deepPartial: vi.fn(() => mockObject),
    required: vi.fn(() => mockObject),
    passthrough: vi.fn(() => mockObject),
    strict: vi.fn(() => mockObject),
    strip: vi.fn(() => mockObject),
    catchall: vi.fn(() => mockObject),
    optional: vi.fn(() => mockObject),
    nullable: vi.fn(() => mockObject),
    default: vi.fn(() => mockObject),
    transform: vi.fn(() => mockObject),
    refine: vi.fn(() => mockObject),
    parse: vi.fn((value) => value),
    safeParse: vi.fn((value) => ({ success: true, data: value })),
  };
  return mockObject;
};

vi.mock('zod', () => ({
  z: {
    string: vi.fn(() => createMockZodString()),
    number: vi.fn(() => createMockZodNumber()),
    boolean: vi.fn(() => createMockZodBoolean()),
    date: vi.fn(() => createMockZodString()),
    array: vi.fn(() => createMockZodArray()),
    object: vi.fn(() => createMockZodObject()),
    union: vi.fn(() => createMockZodString()),
    intersection: vi.fn(() => createMockZodString()),
    tuple: vi.fn(() => createMockZodArray()),
    record: vi.fn(() => createMockZodObject()),
    map: vi.fn(() => createMockZodObject()),
    set: vi.fn(() => createMockZodArray()),
    function: vi.fn(() => createMockZodString()),
    lazy: vi.fn(() => createMockZodString()),
    literal: vi.fn(() => createMockZodString()),
    enum: vi.fn(() => createMockZodString()),
    nativeEnum: vi.fn(() => createMockZodString()),
    promise: vi.fn(() => createMockZodString()),
    any: vi.fn(() => createMockZodString()),
    unknown: vi.fn(() => createMockZodString()),
    never: vi.fn(() => createMockZodString()),
    void: vi.fn(() => createMockZodString()),
    undefined: vi.fn(() => createMockZodString()),
    null: vi.fn(() => createMockZodString()),
    optional: vi.fn(() => createMockZodString()),
    nullable: vi.fn(() => createMockZodString()),
    coerce: {
      string: vi.fn(() => createMockZodString()),
      number: vi.fn(() => createMockZodNumber()),
      boolean: vi.fn(() => createMockZodBoolean()),
      date: vi.fn(() => createMockZodString()),
    },
  },
  ZodError: class MockZodError extends Error {
    constructor(issues: any[]) {
      super('Validation error');
      this.name = 'ZodError';
      this.issues = issues;
    }
    issues: any[];
    format = vi.fn();
    flatten = vi.fn();
  },
  ZodIssueCode: {
    invalid_type: 'invalid_type',
    invalid_literal: 'invalid_literal',
    custom: 'custom',
    invalid_union: 'invalid_union',
    invalid_union_discriminator: 'invalid_union_discriminator',
    invalid_enum_value: 'invalid_enum_value',
    unrecognized_keys: 'unrecognized_keys',
    invalid_arguments: 'invalid_arguments',
    invalid_return_type: 'invalid_return_type',
    invalid_date: 'invalid_date',
    invalid_string: 'invalid_string',
    too_small: 'too_small',
    too_big: 'too_big',
    invalid_intersection_types: 'invalid_intersection_types',
    not_multiple_of: 'not_multiple_of',
    not_finite: 'not_finite',
  },
}));

// Mock app constants - 使用importOriginal保留所有原始常量
vi.mock('@/constants/app-constants', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    // 只覆盖测试中需要特殊处理的常量（如果有的话）
  };
});

// Mock unified constants entry point - 使用importOriginal保留所有原始常量
vi.mock('@/constants', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    // 只覆盖测试中需要特殊处理的常量（如果有的话）
  };
});

// Mock i18n constants - 使用importOriginal保留所有原始常量
vi.mock('@/constants/i18n-constants', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    // 只覆盖测试中需要特殊处理的常量（如果有的话）
  };
});

// Mock next-intl - 提供实际的翻译映射和基础 Provider
const mockTranslations: Record<string, string> = {
  'navigation.home': 'Home',
  'navigation.about': 'About',
  'navigation.services': 'Services',
  'navigation.products': 'Products',
  'navigation.blog': 'Blog',
  'navigation.contact': 'Contact',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const safeTranslations = new Map(Object.entries(mockTranslations));
    return safeTranslations.get(key) || key;
  }),
  useLocale: vi.fn(() => 'en'),
  useMessages: vi.fn(() => ({})),
  useFormatter: vi.fn(() => ({
    dateTime: vi.fn(),
    number: vi.fn(),
    relativeTime: vi.fn(),
  })),
  // 最小实现：用于与 renderWithIntl 和 NextIntlClientProvider API 兼容
  NextIntlClientProvider: ({
    children,
  }: {
    children: React.ReactNode;
    locale?: string;
    messages?: Record<string, unknown>;
  }) => React.createElement(React.Fragment, null, children),
}));

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => (key: string) => key),
  getLocale: vi.fn(() => 'en'),
  getMessages: vi.fn(() => ({})),
  getFormatter: vi.fn(() => ({
    dateTime: vi.fn(),
    number: vi.fn(),
    relativeTime: vi.fn(),
  })),
}));

// Mock @/i18n/routing - 提供完整的路由Mock配置
vi.mock('@/i18n/routing', () => ({
  // Minimal routing config for tests
  routing: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    pathnames: {
      '/': '/',
      '/about': '/about',
      '/contact': '/contact',
      '/products': '/products',
      '/blog': '/blog',
      '/faq': '/faq',
      '/privacy': '/privacy',
    },
  },
  Link: ({ children, href, ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
    themes: ['light', 'dark', 'system'],
    systemTheme: 'light',
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables - use Object.defineProperty for read-only properties
try {
  if (!process.env.NODE_ENV) {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
} catch {
  // Environment variable already set, ignore
}

// Enhanced matchMedia mock for accessibility testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated but still used by some libraries
    removeListener: vi.fn(), // Deprecated but still used by some libraries
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for React components that use it
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;

// Mock IntersectionObserver for React components with controllable visibility triggers
// - Preserve instances and observed targets
// - Export helpers: triggerVisible(el) and triggerAll()
// - Default autoVisibleAll=true so Idle/Client islands appear in jsdom without layout

const __ioEmptyRect: DOMRectReadOnly = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  toJSON: () => ({}),
};

class MockIntersectionObserver {
  static _instances = new Set<MockIntersectionObserver>();
  static _observed = new Set<Element>();
  static _autoVisibleAll = true;

  private _cb: IntersectionObserverCallback | undefined;

  readonly observe = vi.fn((el: Element) => {
    MockIntersectionObserver._observed.add(el);
    if (MockIntersectionObserver._autoVisibleAll && this._cb) {
      this._cb(
        [
          {
            isIntersecting: true,
            target: el as Element,
            intersectionRatio: 1,
            boundingClientRect: __ioEmptyRect,
            rootBounds: null,
            time: Date.now(),
          } as unknown as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      );
    }
  });
  readonly unobserve = vi.fn((el: Element) => {
    MockIntersectionObserver._observed.delete(el);
  });
  readonly disconnect = vi.fn(() => {
    // keep observed registry global so other instances can still trigger
  });
  readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

  constructor(
    callback?: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {
    this._cb = callback;
    MockIntersectionObserver._instances.add(this);
  }
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

export function triggerVisible(el: Element) {
  for (const inst of MockIntersectionObserver._instances) {
    // istanbul ignore next
    (inst as any)._cb?.(
      [
        {
          isIntersecting: true,
          target: el,
          intersectionRatio: 1,
          boundingClientRect: __ioEmptyRect,
          rootBounds: null,
          time: Date.now(),
        } as unknown as IntersectionObserverEntry,
      ],
      inst as unknown as IntersectionObserver,
    );
  }
}

export function triggerAll() {
  for (const el of Array.from(MockIntersectionObserver._observed)) {
    triggerVisible(el);
  }
}

export function setIntersectionAutoVisibleAll(v: boolean) {
  MockIntersectionObserver._autoVisibleAll = v;
}

// Mock PerformanceObserver for performance monitoring
const MockPerformanceObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
}));

// 添加静态属性
Object.defineProperty(MockPerformanceObserver, 'supportedEntryTypes', {
  value: ['navigation', 'resource', 'measure', 'mark'],
  writable: false,
  enumerable: true,
  configurable: true,
});

globalThis.PerformanceObserver =
  MockPerformanceObserver as unknown as typeof PerformanceObserver;

// Mock environment variables - 使用vi.stubEnv而不是直接修改process.env
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://tucsenberg.com');
vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'tucsenberg.vercel.app');

// Mock server-side environment variables for API testing
vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret-key');
vi.stubEnv('RESEND_API_KEY', 'test-resend-key');
vi.stubEnv('AIRTABLE_API_KEY', 'test-airtable-key');
vi.stubEnv('AIRTABLE_BASE_ID', 'test-base-id');
vi.stubEnv('AIRTABLE_TABLE_NAME', 'test-table');
vi.stubEnv('EMAIL_FROM', 'test@example.com');
vi.stubEnv('EMAIL_REPLY_TO', 'reply@example.com');
vi.stubEnv('CSP_REPORT_URI', 'https://example.com/csp-report');
vi.stubEnv('ADMIN_TOKEN', 'test-admin-token');

// Mock @t3-oss/env-nextjs to prevent server-side environment variable access errors
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn(() => ({
    NODE_ENV: 'test',
    TURNSTILE_SECRET_KEY: 'test-secret-key',
    RESEND_API_KEY: 'test-resend-key',
    AIRTABLE_API_KEY: 'test-airtable-key',
    AIRTABLE_BASE_ID: 'test-base-id',
    AIRTABLE_TABLE_NAME: 'test-table',
    EMAIL_FROM: 'test@example.com',
    EMAIL_REPLY_TO: 'reply@example.com',
    CSP_REPORT_URI: 'https://example.com/csp-report',
    ADMIN_TOKEN: 'test-admin-token',
    NEXT_PUBLIC_BASE_URL: 'https://tucsenberg.com',
    NEXT_PUBLIC_VERCEL_URL: 'tucsenberg.vercel.app',
    WHATSAPP_ACCESS_TOKEN: 'test-whatsapp-token',
    WHATSAPP_PHONE_NUMBER_ID: 'test-phone-id',
    WHATSAPP_BUSINESS_ACCOUNT_ID: 'test-business-id',
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'test-webhook-token',
  })),
}));

// Mock the env module directly
vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    TURNSTILE_SECRET_KEY: 'test-secret-key',
    RESEND_API_KEY: 'test-resend-key',
    AIRTABLE_API_KEY: 'test-airtable-key',
    AIRTABLE_BASE_ID: 'test-base-id',
    AIRTABLE_TABLE_NAME: 'test-table',
    EMAIL_FROM: 'test@example.com',
    EMAIL_REPLY_TO: 'reply@example.com',
    CSP_REPORT_URI: 'https://example.com/csp-report',
    ADMIN_TOKEN: 'test-admin-token',
    NEXT_PUBLIC_BASE_URL: 'https://tucsenberg.com',
    NEXT_PUBLIC_VERCEL_URL: 'tucsenberg.vercel.app',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-site-key-12345',
    NEXT_PUBLIC_TEST_MODE: false,
    WHATSAPP_ACCESS_TOKEN: 'test-whatsapp-token',
    WHATSAPP_PHONE_NUMBER_ID: 'test-phone-id',
    WHATSAPP_BUSINESS_ACCOUNT_ID: 'test-business-id',
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'test-webhook-token',
  },
  envUtils: {
    isDevelopment: () => false,
    isProduction: () => false,
    isTest: () => true,
    getWhatsAppToken: () => 'test-whatsapp-token',
    getWhatsAppPhoneId: () => 'test-phone-id',
    getTurnstileSecret: () => 'test-secret-key',
    getTurnstileSiteKey: () => 'test-site-key',
    getResendApiKey: () => 'test-resend-key',
    getAirtableToken: () => 'test-airtable-key',
    getAirtableBaseId: () => 'test-base-id',
  },
}));

// 不Mock validations模块，保留真实验证逻辑

// Mock requestAnimationFrame for animations
globalThis.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 0);
  return 1;
});
globalThis.cancelAnimationFrame = vi.fn((id) => clearTimeout(id as number));

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) || null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value.toString());
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => {
      const keys = Array.from(store.keys());
      // 安全的数组访问，避免对象注入
      return index >= 0 && index < keys.length ? keys.at(index) || null : null;
    }),
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

// Mock CSS.supports for CSS feature detection
Object.defineProperty(window, 'CSS', {
  value: {
    supports: vi.fn().mockReturnValue(true),
  },
});

// Mock document.startViewTransition for theme transitions
Object.defineProperty(document, 'startViewTransition', {
  value: vi.fn((callback?: () => void) => {
    callback?.();
    return Promise.resolve();
  }),
  writable: true,
});

// Setup DOM container for React Testing Library
if (typeof document !== 'undefined') {
  // Create a root container for React Testing Library
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
}

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Set up environment variables for API tests
  vi.stubEnv('ADMIN_API_TOKEN', 'test-admin-token');

  // Reset DOM - 安全的DOM重置
  if (typeof document !== 'undefined' && document.body) {
    try {
      document.body.innerHTML = '<div id="test-container"></div>';
    } catch {
      // 如果DOM操作失败，创建新的body元素
      const newBody = document.createElement('body');
      newBody.innerHTML = '<div id="test-container"></div>';
      if (document.documentElement) {
        document.documentElement.replaceChild(newBody, document.body);
      }
    }
  }

  // Reset localStorage (only if window is available)
  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      window.localStorage.clear();
    }
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
  }
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

// Console error suppression for known issues
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('Warning: React.createFactory() is deprecated') ||
        args[0].includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});
// Ensure each test starts from a clean slate under Vitest v4
beforeEach(() => {
  vi.resetAllMocks();
});
