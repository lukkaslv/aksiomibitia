<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1XcTdSFbEEQOS6X0H7_B-dvlj5BeSDxVJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Где хранить важные файлы и тексты «навсегда»

Если нужна надежная «база данных для компьютера», лучше использовать схему **3-2-1**:

- **3 копии** данных (оригинал + 2 резервные копии)
- **2 разных носителя** (например, SSD + внешний диск)
- **1 копия вне дома/офиса** (облако)

### Практичный набор

1. **Основное хранилище:** папка на компьютере или NAS.
2. **Локальный бэкап:** внешний диск с автоматическим копированием (ежедневно).
3. **Облачный бэкап:** Backblaze / Google Drive / Dropbox / OneDrive / iCloud.
4. **Проверка восстановления:** раз в месяц открыть 2–3 файла из бэкапа.

### Если именно «база данных»

- Для структурированных заметок и текстов: **SQLite** (просто, локально, один файл).
- Для больших проектов с многопользовательским доступом: **PostgreSQL**.
- Для документов и медиафайлов: лучше хранить сами файлы в файловом хранилище, а в БД — только метаданные (имя, дата, теги, путь, хэш).

### Важно помнить

Абсолютного «навсегда» не существует — есть только хорошая стратегия резервирования и периодическая проверка копий.
