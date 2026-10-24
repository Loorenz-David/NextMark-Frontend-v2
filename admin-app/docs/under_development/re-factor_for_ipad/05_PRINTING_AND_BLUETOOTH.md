# 05 — Printing labels and route sheets from an iPad; Bluetooth reality check

**Status:** research done 2026-10-24; user decided (2026-10-24) to pursue a native bridge app as a parallel project (§6). Printer model is still the deciding fact for the transport.

---

## 1. What the app prints today

All printing is client-side PDF generation; nothing goes to a printer directly.

| Piece | Path |
|---|---|
| Template feature | `src/features/templates/printDocument/` (api, domain, flows, controllers, store, pages, components/templates) |
| Item labels (two variants) | `components/templates/item/classicTemplateItem.pdf.ts`, `sevenByTenTemplateItem.pdf.ts` (jsPDF draw functions, size in cm) |
| Route sheets | `components/templates/route/driversTemplateRoute.pdf.ts`, `packersTemplateRoute.pdf.ts`, `routeTemplate.shared.ts` |
| Render | `controllers/renderPdfDocument.controller.ts` (lazy `import('jspdf')`, returns `Blob`), `renderComponentToPdfBlob.controller.ts` (html2canvas path) |
| Delivery to user | `controllers/downloadBlob.controller.ts`: `URL.createObjectURL` + `<a download>` click |
| Trigger from orders | `src/features/order/item/flows/downloadItemLabels.flow.ts` → `useDownloadTemplateByEventFlow().downloadByEvent({ channel: 'item', event, data, fileName })` |
| Preview | `components/config/PrintTemplatePreview.tsx` renders the blob URL in an iframe/embed |
| Template config | Settings → print templates (`pages/PrintTemplateMainPage.tsx`, `PrintTemplateConfigPage.tsx`), per channel/event variant, persisted through `api/printTemplate.api.ts` |

Backend has no print or label endpoint (grep over `Back_end/Delivery_app_BK/routers` found none).

## 2. iPad facts that constrain the design

1. **`<a download>` with a blob URL fails silently in an installed home-screen web app** on iOS (WebKit bug 190351 and Apple forum reports; the behaviour comes from the system web-app host, not WebKit). In a Safari tab it works and shows the download sheet. Our `downloadBlob.controller.ts` is therefore broken exactly in the mode we are moving to.
2. **Web Bluetooth, Web Serial, WebUSB are not implemented in WebKit** and WebKit's standards position is negative. `navigator.bluetooth` is `undefined` in Safari and in any installed web app on iPadOS. Third-party browsers (Bluefy) or Safari extensions (WebBLE) exist but are not acceptable for a client install.
3. **AirPrint is the native printing path on iPadOS.** A web page can trigger it with `window.print()` (prints the current document) or by opening a PDF and using the share sheet → Print. AirPrint label printers exist (Brother QL-8xx NWB series, Zebra ZSB series). Pure Bluetooth label printers (Zebra ZQ series, many cheap thermal printers) are **not** reachable from a web app on iPad.
4. **Zebra Browser Print has no iOS build.** Zebra's recommended web path for iOS is a server-side relay (Link-OS "SendFileToPrinter" cloud API, or printing to a network printer's TCP port 9100 from a backend).

## 3. Options, ranked

| # | Option | Needs | Works in installed app | Label-size fidelity | Effort | Verdict |
|---|---|---|---|---|---|---|
| A | **Open the PDF in-app with a Print/Share button** (`navigator.share({ files: [File] })` → system share sheet → Print/AirPrint, Files, AirDrop). Fallback: show the PDF in an in-app viewer (`<iframe>` of blob URL already used by `PrintTemplatePreview`) and let the user use the share sheet. | AirPrint-capable printer (any office printer for route sheets; Brother QL-820NWB / Zebra ZSB for labels) | Yes (Web Share with files works in Safari ≥ 15; verify in standalone on the device) | Good when the PDF page size equals the label size (already true: jsPDF `format: [w, h]` in cm) | Small: one new controller next to `downloadBlob` + a viewer popup | **Do first.** Zero backend, zero hardware assumptions. |
| B | **Backend print relay**: iPad posts "print job" (template + data or rendered PDF) to the FastAPI backend; a worker sends ZPL/TSPL/PDF to a **network** label printer (TCP 9100 / IPP) or to a vendor cloud (Zebra SendFileToPrinter). | Printer on the same network as the backend, or a Link-OS printer with cloud connect; a Celery task; printer registry in settings | Yes | Exact (native printer language) | Medium-large: backend command + model + settings UI + ZPL templates (today templates are jsPDF drawings) | **Second phase if the client has Zebra/network printers.** Reuses the Celery infra. |
| C | **Local print agent** (small service on a Mac/PC/Raspberry Pi in the store; backend or iPad sends jobs to it) | A device left running on site | Yes | Exact | Medium, plus ops burden | Only if printers are USB/Bluetooth-only and no network model is bought. |
| D | **Native wrapper (Capacitor)** with a BLE plugin to talk to Bluetooth printers | App Store or enterprise distribution, Xcode, plugin maintenance | N/A (becomes native) | Exact | Large; changes the whole delivery model | Not recommended for this project. |
| E | Third-party browser/extension with Web Bluetooth (Bluefy, WebBLE) | Client installs an unusual browser | Partially | Depends | Small code, poor UX/support story | Reject. |

## 4. Recommendation

1. **Phase P1 (in this refactor):** replace the silent `downloadBlob` on iPad with an **Export sheet**: "Print / Share" (Web Share with the PDF `File`), "Open" (in-app viewer popup with the blob URL), and "Download" only when `navigator.share` with files is unsupported and not standalone. Detection: `navigator.canShare?.({ files })`, `isStandaloneDisplay(...)` from `src/app/pwa`. Place the chooser in `features/templates/printDocument/controllers/deliverPdf.controller.ts` (or similar) and route both `downloadByEvent` and the preview through it. Desktop keeps the download behaviour.
2. **Ask the client which printer they have or will buy.** Decision tree:
   - AirPrint label printer (Brother QL-820NWB/1110NWB, Zebra ZSB) → Option A is enough; tune label PDF page sizes per model (QL 62mm continuous vs die-cut).
   - Zebra Link-OS network printer (ZD421/ZD621 with Ethernet/Wi-Fi) → Option B with ZPL, or Option A if the printer has AirPrint firmware.
   - Bluetooth-only mobile printer → cannot be driven from a web app on iPad; recommend swapping for a network/AirPrint model, otherwise Option C.
3. **Bluetooth is reached through a native bridge app, not through Safari** (§6). The web app only needs capability detection and a transport layer; the bridge is a parallel native project.

## 6. Native bridge app (decided 2026-10-24 as a parallel project)

The web app cannot reach Bluetooth, but an iPad app we build and install ourselves can, and it can hand that capability to the web app. Three shapes, none of which needs App Store publication:

| Shape | How it works | PWA stays a home-screen web app? | UX per print | Effort |
|---|---|---|---|---|
| **A. Wrapper shell** (recommended) | A thin Swift app with a `WKWebView` that loads the deployed admin URL full screen and injects a `navigator.bluetooth` polyfill bridged to CoreBluetooth. The open-source **WebBLE** project (Apache-2.0, https://github.com/daphtdazz/WebBLE) already implements `requestDevice`, GATT server/characteristics for iOS; Capacitor + `@capacitor-community/bluetooth-le` or `@capgo/capacitor-bluetooth-low-energy` (ships a Web Bluetooth shim) is the alternative. The wrapper **replaces** "Add to Home Screen": it is the full-screen install. | No, the wrapper is the install. The web code is unchanged and still works as a PWA elsewhere. | None, prints in place | Small native app; most work is on the web side (printer-language rendering, §6.2) |
| **B. Companion app via share sheet** | PWA stays installed from Safari. Printing calls `navigator.share({ files })`; the companion app registers a **Share Extension** that receives the file (PDF or a `.zpl`/`.bin` payload) and sends it over CoreBluetooth / ExternalAccessory. A URL scheme (`nextmark-print://…`) is the fallback for small payloads. | Yes | One extra tap in the share sheet, app switch | Small native app + extension; no injection |
| **C. Off-the-shelf** | WebBLE (App Store) and Bluefy are **browsers** with Web Bluetooth. The admin app would run inside their browser UI, not full screen, and their Safari-extension variants almost certainly do not apply inside home-screen web apps (home-screen apps run in an isolated container; verify on device before relying on it). | No | — | Zero code, poor fit |

### 6.1 Platform constraints the bridge inherits (these decide the printer)

- **CoreBluetooth is BLE only.** Bluetooth Classic (SPP) printers are reachable from third-party iOS apps only through the ExternalAccessory framework and only if the printer is **MFi-certified** and the app declares its protocol string (Zebra: `com.zebra.rawport`). A Web Bluetooth polyfill covers BLE printers only; MFi/Classic printers need a custom bridge API (`window.nextmarkBridge.print(bytes)`), not `navigator.bluetooth`. Ask the printer vendor: BLE GATT printing supported? MFi protocol string?
- **Printer language must be generated by us.** Today everything is jsPDF/PDF. A Bluetooth printer takes ZPL/CPCL (Zebra), ESC/POS or TSPL (generic thermal), or Brother raster. Phase 6 therefore needs a second renderer family next to `components/templates/*` (`*.zpl.ts` / `*.escpos.ts`) and a "print transport" port that picks PDF→share/AirPrint or bytes→bridge. This cost exists whichever bridge shape is chosen.
- **The wrapper can also open raw TCP sockets** (`Network.framework`), so Wi-Fi printers on port 9100 become reachable directly from the iPad without a backend relay. That covers the "Wi-Fi integrations" gap too.
- **Distribution without the App Store** still needs an Apple Developer Program membership (US$99/yr): Ad Hoc (≤100 registered device UDIDs per year, profile renewed yearly), TestFlight (builds expire after 90 days; up to 100 internal / 10,000 external testers), Enterprise (only for ≥100-employee organisations' own staff, not for clients). Apple also offers **unlisted App Store distribution** (link-only, goes through review) — verify current terms. Budget a yearly renewal task for the client's iPads.
- Updates to the **web** app need no native release; only bridge-API changes do. Keep the bridge surface tiny and versioned (`window.nextmarkBridge.version`).

### 6.2 Contract between the web app and the bridge (design target)

- Detection, in `app/` (platform concern): `hasWebBluetooth = 'bluetooth' in navigator`, `hasNativeBridge = typeof window.nextmarkBridge === 'object'`, exposed through the viewport/platform provider next to `isStandalone`.
- `features/templates/printDocument` gets a **transport** layer: `transports/share.transport.ts` (Web Share files), `transports/download.transport.ts`, `transports/webBluetooth.transport.ts` (GATT write of printer-language bytes, chunked to the characteristic MTU), `transports/nativeBridge.transport.ts` (MFi / TCP), later `transports/backendRelay.transport.ts`. A `resolvePrintTransport` domain function picks by capability + printer settings.
- Printer pairing/settings UI lives in Settings → print templates (device name, language, label size), persisted per device (localStorage, it is a per-iPad fact) with the template config in the backend.

### 6.3 Suggested order

1. Phase 6a (web only): transport layer + share/AirPrint path, so printing works on day one with any AirPrint printer.
2. Parallel project **"NextMark Bridge"** (Swift, WKWebView + WebBLE polyfill + `nextmarkBridge` for MFi/TCP). Separate repo, its own docs. First milestone: load the admin URL full screen, expose `navigator.bluetooth`, ship Ad Hoc to the user's iPad.
3. Phase 6b (web): ZPL/ESC-POS renderers for the client's printer model + `webBluetooth`/`nativeBridge` transports.

## 7. Sources (checked 2026-10-24)

- WebBLE source (Apache-2.0): https://github.com/daphtdazz/WebBLE
- Capacitor BLE plugins: https://github.com/capacitor-community/bluetooth-le , https://www.npmjs.com/package/@capgo/capacitor-bluetooth-low-energy
- iOS distribution methods compared (Ad Hoc 100 devices, TestFlight 90 days, Enterprise rules): https://appisto.app/blog/ios-app-distribution-methods-compared , https://foresightmobile.com/blog/ios-app-distribution-guide-2026

- WebKit bug 190351, "download attribute fails in home-screen web apps": https://www2.webkit.org/show_bug.cgi?id=190351
- Apple Developer Forums, "Impossible to download a file on PWA": https://developer.apple.com/forums/thread/95911
- Chromium Intent to Ship (table lists WebKit position on Web Serial/Bluetooth as negative, ref WebKit standards-positions #199): https://groups.google.com/a/chromium.org/g/blink-dev/c/P4YwDCcvdvs/m/CHbyTu_gAAAJ
- WebBLE (Safari extension + companion app, i.e. no native support): https://apps.apple.com/app/id1492822055
- Zebra developer forum, "Web Application IOS print to Zebra Printer" (Browser Print has no iOS; SendFileToPrinter relay; ZSB AirPrint): https://developer.zebra.com/content/web-application-ios-print-zebra-printer
- Zebra developer forum, "Printing from Safari on an iPad": https://developer.zebra.com/thread/32049
- Brother QL AirPrint announcement: https://www.brother.ee/about-brother/news/2014/airprint
- Komisio spike on label printing without a Windows PC (AirPrint exact-size PDF fallback, Zebra cloud connect): https://github.com/Komisio/komisio/issues/525
- iOS/iPadOS 26 home-screen web app behaviour change: https://heise.de/-10749652
