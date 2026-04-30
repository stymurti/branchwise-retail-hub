# BranchFlow Suite — Desktop App (Electron)

Aplikasi desktop ini memuat versi online dari `https://branchflow-suite.lovable.app` dan otomatis fallback ke build offline (`dist/`) jika tidak ada koneksi internet.

## Build & Package (lokal)

```bash
# 1. Install dependencies (sekali saja)
npm install --save-dev electron @electron/packager

# 2. Build frontend
npm run build

# 3. Jalankan langsung tanpa packaging (untuk tes)
npx electron electron/main.cjs

# 4. Package menjadi aplikasi desktop
# Linux
npx @electron/packager . "BranchFlow" --platform=linux --arch=x64 --out=electron-release --overwrite --ignore="^/src" --ignore="^/public" --ignore="^/electron-release"
# Windows
npx @electron/packager . "BranchFlow" --platform=win32 --arch=x64 --out=electron-release --overwrite --ignore="^/src" --ignore="^/public" --ignore="^/electron-release"
# macOS
npx @electron/packager . "BranchFlow" --platform=darwin --arch=x64 --out=electron-release --overwrite --ignore="^/src" --ignore="^/public" --ignore="^/electron-release"
```

Hasil build berada di folder `electron-release/`.

## Menu

- **File → Mode Online**: paksa muat dari URL terpublikasi (butuh internet).
- **File → Mode Offline**: muat build lokal `dist/`.
- **View → Toggle DevTools**: buka developer tools.

## Catatan

- Field `"main": "electron/main.cjs"` sudah ditambahkan ke `package.json`.
- `vite.config.ts` menggunakan `base: "./"` agar asset dapat dimuat lewat `file://` saat offline.
