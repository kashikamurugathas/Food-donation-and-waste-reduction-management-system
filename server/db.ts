import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import initSqlJs, { Database } from 'sql.js';

const DB_DIR = path.resolve(process.cwd(), 'database');
const DB_FILE = path.resolve(DB_DIR, 'foodshare.sqlite');

let dbInstance: Database | null = null;

// Password hashing using scrypt (Node crypto standard, irreversible, salt-based)
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  } catch (err) {
    return false;
  }
}

// Generate secure random Bearer token
export function generateToken(): string {
  return 'sanctum_' + crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function persistDatabase(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('[DB] Failed to persist database:', err);
  }
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('[DB] Loaded existing database from disk:', DB_FILE);
      return dbInstance;
    } catch (e) {
      console.warn('[DB] Could not read existing DB file, initializing fresh DB');
    }
  }

  dbInstance = new SQL.Database();
  console.log('[DB] Created fresh SQL database instance');
  initializeSchema(dbInstance);
  persistDatabase();
  return dbInstance;
}

function initializeSchema(db: Database): void {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('donor', 'institution', 'admin')),
      is_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Donor Profiles Table
  db.run(`
    CREATE TABLE IF NOT EXISTS donor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      donor_type TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      address TEXT NOT NULL,
      area TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT 'Jaffna',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Institutions Table
  db.run(`
    CREATE TABLE IF NOT EXISTS institution_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      institution_name TEXT NOT NULL,
      institution_type TEXT NOT NULL CHECK(institution_type IN ('Children''s Home', 'Elders'' Home', 'Care Centre')),
      registration_number TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL,
      area TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT 'Jaffna',
      contact_person TEXT NOT NULL,
      resident_count INTEGER NOT NULL DEFAULT 20,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Personal Access Tokens (Sanctum Compatible)
  db.run(`
    CREATE TABLE IF NOT EXISTS personal_access_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL DEFAULT 'auth_token',
      last_used_at TEXT NULL,
      expires_at TEXT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Password Reset Tokens
  db.run(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      email TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );
  `);

  // 6. Food Donations Table
  db.run(`
    CREATE TABLE IF NOT EXISTS food_donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      food_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      total_quantity INTEGER NOT NULL,
      remaining_quantity INTEGER NOT NULL,
      unit TEXT NOT NULL DEFAULT 'portions',
      serves_count INTEGER NOT NULL,
      event_name TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      pickup_address TEXT NOT NULL,
      area TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT 'Jaffna',
      prepared_at TEXT NOT NULL,
      safe_deadline TEXT NOT NULL,
      storage_condition TEXT NOT NULL,
      is_veg INTEGER NOT NULL DEFAULT 1,
      allergens TEXT NOT NULL DEFAULT 'None disclosed',
      contact_phone TEXT NOT NULL,
      collection_pref TEXT NOT NULL DEFAULT 'Self Pickup by Institution',
      special_instructions TEXT NULL,
      photo_url TEXT NULL,
      status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'Request Received', 'Reserved', 'Collected', 'Delivered', 'Expired', 'Cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. Food Requests Table
  db.run(`
    CREATE TABLE IF NOT EXISTS food_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_id INTEGER NOT NULL,
      institution_id INTEGER NOT NULL,
      requested_portions INTEGER NOT NULL,
      people_to_feed INTEGER NOT NULL,
      preferred_time TEXT NOT NULL,
      logistics_type TEXT NOT NULL,
      dietary_requirements TEXT NULL,
      additional_notes TEXT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
      FOREIGN KEY (institution_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default Platform Administrator (authorized role)
  const adminCheck = db.exec("SELECT id FROM users WHERE email = 'admin@foodshare.lk'");
  if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
    const adminPass = hashPassword('AdminSecurePass123!');
    db.run(
      `INSERT INTO users (name, email, password_hash, password_salt, phone, role, is_verified)
       VALUES (?, ?, ?, ?, ?, 'admin', 1)`,
      [
        'FoodShare Lanka Administrator',
        'admin@foodshare.lk',
        adminPass.hash,
        adminPass.salt,
        '+94 21 222 3456',
      ]
    );
    console.log('[DB] Seeded authorized Administrator account: admin@foodshare.lk');
  }

  // Seed initial verified Jaffna institutions and donor for immediate realistic matching
  const donorCheck = db.exec("SELECT id FROM users WHERE email = 'rajapalace@jaffnahalls.lk'");
  if (donorCheck.length === 0 || donorCheck[0].values.length === 0) {
    const donorPass = hashPassword('DonorPass123!');
    db.run(
      `INSERT INTO users (name, email, password_hash, password_salt, phone, role, is_verified)
       VALUES (?, ?, ?, ?, ?, 'donor', 1)`,
      [
        'Senthil Kumaran (Raja Palace)',
        'rajapalace@jaffnahalls.lk',
        donorPass.hash,
        donorPass.salt,
        '+94 77 345 6789',
      ]
    );
    const donorUserIdRes = db.exec("SELECT id FROM users WHERE email = 'rajapalace@jaffnahalls.lk'");
    const donorUserId = donorUserIdRes[0].values[0][0];
    db.run(
      `INSERT INTO donor_profiles (user_id, donor_type, venue_name, address, area, district)
       VALUES (?, 'Wedding Hall', 'Raja Palace Wedding Hall', 'Point Pedro Road, Nallur, Jaffna', 'Nallur', 'Jaffna')`,
      [donorUserId]
    );
  }

  const instCheck = db.exec("SELECT id FROM users WHERE email = 'anbucare@jaffna.lk'");
  if (instCheck.length === 0 || instCheck[0].values.length === 0) {
    const instPass = hashPassword('CareHomePass123!');
    db.run(
      `INSERT INTO users (name, email, password_hash, password_salt, phone, role, is_verified)
       VALUES (?, ?, ?, ?, ?, 'institution', 1)`,
      [
        'Sister Mary (Anbu Children Home)',
        'anbucare@jaffna.lk',
        instPass.hash,
        instPass.salt,
        '+94 77 987 6543',
      ]
    );
    const instUserIdRes = db.exec("SELECT id FROM users WHERE email = 'anbucare@jaffna.lk'");
    const instUserId = instUserIdRes[0].values[0][0];
    db.run(
      `INSERT INTO institution_profiles (user_id, institution_name, institution_type, registration_number, address, area, district, contact_person, resident_count)
       VALUES (?, 'Anbu Children Home', 'Children''s Home', 'DSW/NP/JAF/0412', 'Temple Road, Nallur, Jaffna', 'Nallur', 'Jaffna', 'Sister Mary', 45)`,
      [instUserId]
    );
  }
}

// Database helper functions with automatic save
export async function queryRows<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryRows<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function runQuery(sql: string, params: any[] = []): Promise<number> {
  const db = await getDb();
  db.run(sql, params);
  const res = db.exec('SELECT last_insert_rowid() as id');
  const insertId = res.length > 0 && res[0].values.length > 0 ? Number(res[0].values[0][0]) : 0;
  persistDatabase();
  return insertId;
}
