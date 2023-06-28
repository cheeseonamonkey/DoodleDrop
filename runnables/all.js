
  const sqlite = require('better-sqlite3')
  const db = sqlite('foobar.db')
  db.pragma('journal_mode = WAL');

console.table(db.prepare(`SELECT * FROM images`            ).all())
console.table(db.prepare(`SELECT * FROM image_moderations` ).all())
console.table(db.prepare(`SELECT * FROM log`               ).all())
console.table(db.prepare(`SELECT * FROM master_image_view` ).all())