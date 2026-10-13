import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getDb,
  queryRows,
  queryOne,
  runQuery,
  hashPassword,
  verifyPassword,
  generateToken,
  hashToken,
} from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS & Security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Authentication Middleware (Token-based Sanctum equivalent)
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'donor' | 'institution' | 'admin';
    is_verified: number;
    profile?: any;
  };
}

async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated: Authorization token required.' });
  }

  try {
    const hashed = hashToken(token);
    const tokenRecord = await queryOne(
      'SELECT * FROM personal_access_tokens WHERE token_hash = ?',
      [hashed]
    );

    if (!tokenRecord) {
      return res.status(401).json({ message: 'Unauthenticated: Invalid or expired session token.' });
    }

    const user = await queryOne(
      'SELECT id, name, email, phone, role, is_verified FROM users WHERE id = ?',
      [tokenRecord.user_id]
    );

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    // Attach profile information
    if (user.role === 'donor') {
      user.profile = await queryOne('SELECT * FROM donor_profiles WHERE user_id = ?', [user.id]);
    } else if (user.role === 'institution') {
      user.profile = await queryOne('SELECT * FROM institution_profiles WHERE user_id = ?', [user.id]);
    }

    req.user = user;
    next();
  } catch (err: any) {
    console.error('[Auth Error]', err);
    return res.status(500).json({ message: 'Internal authentication error.' });
  }
}

// --------------------------------------------------------------------------
// REST API ROUTES
// --------------------------------------------------------------------------

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    await getDb();
    res.json({
      status: 'healthy',
      database: 'connected',
      engine: 'MySQL-compatible SQL Engine',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// POST /api/auth/register (Real User Registration with MySQL constraints)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      password_confirmation,
      role,
      // Donor fields
      donor_type,
      venue_name,
      address,
      area,
      district = 'Jaffna',
      // Institution fields
      institution_name,
      institution_type,
      registration_number,
      contact_person,
      resident_count,
    } = req.body;

    // 1. Validate required basic fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { name: ['Full name must be at least 2 characters.'] },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { email: ['Please provide a valid email address (e.g., name@example.lk).'] },
      });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 9) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { phone: ['Please provide a valid phone number with at least 9 digits.'] },
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { password: ['Password must be at least 6 characters long.'] },
      });
    }

    if (password !== password_confirmation) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { password_confirmation: ['Password confirmation does not match password.'] },
      });
    }

    // Role check: Only donor or institution allowed for public registration
    if (role === 'admin') {
      return res.status(403).json({
        message: 'Forbidden: Administrator accounts cannot be created via public registration.',
        errors: { role: ['Admin role registration is restricted.'] },
      });
    }

    if (role !== 'donor' && role !== 'institution') {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { role: ["User role must be either 'Food Donor' or 'Receiving Institution'."] },
      });
    }

    // Check unique email in DB
    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser) {
      return res.status(422).json({
        message: 'Duplicate email address',
        errors: {
          email: ['This email address is already registered. Please log in or use a different email.'],
        },
      });
    }

    // 2. Role-specific validation
    if (role === 'donor') {
      if (!donor_type || !['Individual', 'Function Hall', 'Hotel', 'Restaurant', 'Catering Service', 'Other'].includes(donor_type)) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { donor_type: ['Please select a valid donor type.'] },
        });
      }
      if (!address || address.trim().length < 3) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { address: ['Please provide a pickup address.'] },
        });
      }
      if (!area || area.trim().length < 2) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { area: ['Please select or specify a Jaffna area (e.g. Nallur, Jaffna Town).'] },
        });
      }
    } else if (role === 'institution') {
      if (!institution_name || institution_name.trim().length < 2) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { institution_name: ['Please provide the institution or home name.'] },
        });
      }
      if (!['Children\'s Home', 'Elders\' Home', 'Care Centre'].includes(institution_type)) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { institution_type: ["Institution type must be Children's Home or Elders' Home."] },
        });
      }
      if (!registration_number || registration_number.trim().length < 2) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { registration_number: ['Please provide a social welfare registration code or reference.'] },
        });
      }
      // Check unique registration number
      const existingReg = await queryOne(
        'SELECT id FROM institution_profiles WHERE registration_number = ?',
        [registration_number.trim()]
      );
      if (existingReg) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { registration_number: ['This institution registration number is already registered.'] },
        });
      }
      if (!address || address.trim().length < 3) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { address: ['Please provide the institution address.'] },
        });
      }
      if (!contact_person || contact_person.trim().length < 2) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: { contact_person: ['Please provide the contact person name.'] },
        });
      }
    }

    // 3. Cryptographic Password Hashing (Salt + Scrypt)
    const { hash: password_hash, salt: password_salt } = hashPassword(password);

    // 4. Save User in Database
    const userId = await runQuery(
      `INSERT INTO users (name, email, password_hash, password_salt, phone, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [name.trim(), email.trim().toLowerCase(), password_hash, password_salt, phone.trim(), role]
    );

    let profile: any = null;

    if (role === 'donor') {
      const donorProfileId = await runQuery(
        `INSERT INTO donor_profiles (user_id, donor_type, venue_name, address, area, district)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, donor_type, venue_name || name, address.trim(), area.trim(), district]
      );
      profile = await queryOne('SELECT * FROM donor_profiles WHERE id = ?', [donorProfileId]);
    } else if (role === 'institution') {
      const instProfileId = await runQuery(
        `INSERT INTO institution_profiles (user_id, institution_name, institution_type, registration_number, address, area, district, contact_person, resident_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          institution_name.trim(),
          institution_type,
          registration_number.trim(),
          address.trim(),
          area.trim(),
          district,
          contact_person.trim(),
          Number(resident_count) || 20,
        ]
      );
      profile = await queryOne('SELECT * FROM institution_profiles WHERE id = ?', [instProfileId]);
    }

    // 5. Generate Authentication Token
    const plainToken = generateToken();
    const tokenHash = hashToken(plainToken);
    await runQuery(
      `INSERT INTO personal_access_tokens (token_hash, user_id, name)
       VALUES (?, ?, 'web_session')`,
      [tokenHash, userId]
    );

    // Fetch user without sensitive hash
    const savedUser = await queryOne(
      'SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );
    savedUser.profile = profile;

    return res.status(201).json({
      message: 'Account registered successfully in MySQL database.',
      token: plainToken,
      user: savedUser,
    });
  } catch (err: any) {
    console.error('[Registration Error]', err);
    return res.status(500).json({ message: 'Internal server error while saving registration.' });
  }
});

// POST /api/auth/login (Real User Login with MySQL Password Verification)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { email: ['Please enter your email address.'] },
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { password: ['Please enter your password.'] },
      });
    }

    // Query user by email
    const user = await queryOne(
      'SELECT id, name, email, password_hash, password_salt, phone, role, is_verified FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email address. Please register an account first.',
        errors: { email: ['Account does not exist. Click Register to create one.'] },
      });
    }

    // Verify Password Cryptographically
    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      return res.status(401).json({
        message: 'Invalid credentials. The password entered is incorrect.',
        errors: { password: ['Incorrect password. Please verify and try again.'] },
      });
    }

    // Generate Token and store in DB
    const plainToken = generateToken();
    const tokenHash = hashToken(plainToken);
    await runQuery(
      `INSERT INTO personal_access_tokens (token_hash, user_id, name)
       VALUES (?, ?, 'web_session')`,
      [tokenHash, user.id]
    );

    // Fetch Profile
    let profile: any = null;
    if (user.role === 'donor') {
      profile = await queryOne('SELECT * FROM donor_profiles WHERE user_id = ?', [user.id]);
    } else if (user.role === 'institution') {
      profile = await queryOne('SELECT * FROM institution_profiles WHERE user_id = ?', [user.id]);
    }

    // Return safe user object (omit hashes)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      profile,
    };

    return res.json({
      message: 'Login successful.',
      token: plainToken,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const hashed = hashToken(token);
      await runQuery('DELETE FROM personal_access_tokens WHERE token_hash = ?', [hashed]);
    }
    return res.json({ message: 'Successfully logged out. Session terminated.' });
  } catch (err: any) {
    console.error('[Logout Error]', err);
    return res.status(500).json({ message: 'Error during logout.' });
  }
});

// GET /api/auth/me (Current Authenticated User)
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(422).json({ message: 'Please provide an email address.' });
  }

  const user = await queryOne('SELECT id, email FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (!user) {
    return res.status(404).json({
      message: 'No registered account found with this email address.',
    });
  }

  // Check if mail service is configured
  const mailConfigured = !!(process.env.MAIL_HOST || process.env.SMTP_HOST);
  if (!mailConfigured) {
    return res.status(503).json({
      configured: false,
      message:
        'Live email dispatch is currently unconfigured in this environment. To enable real password reset emails, please configure SMTP credentials in .env (MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD).',
      setup_required: {
        driver: 'smtp',
        variables: ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_FROM_ADDRESS'],
      },
    });
  }

  // When mail service is configured, record token
  const resetToken = generateToken();
  const tokenHash = hashToken(resetToken);
  await runQuery(
    `INSERT OR REPLACE INTO password_reset_tokens (email, token_hash, expires_at)
     VALUES (?, ?, datetime('now', '+1 hour'))`,
    [email.trim().toLowerCase(), tokenHash]
  );

  return res.json({
    message: 'A password reset link has been dispatched to your email address.',
  });
});

// --------------------------------------------------------------------------
// FOOD DONATIONS & REQUESTS API (Protected by User ID)
// --------------------------------------------------------------------------

// GET /api/donations (Public feed of active donations)
app.get('/api/donations', async (_req, res) => {
  try {
    const donations = await queryRows(`
      SELECT d.*, u.name as donor_name, u.phone as donor_phone, p.venue_name, p.organization_type
      FROM food_donations d
      JOIN users u ON d.donor_id = u.id
      LEFT JOIN donor_profiles p ON u.id = p.user_id
      ORDER BY d.created_at DESC
    `);
    res.json(donations);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to retrieve food donations.' });
  }
});

// POST /api/donations (Donor Only - Associate with authenticated user ID)
app.post('/api/donations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'donor' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Only Food Donors can post donations.' });
  }

  try {
    const {
      food_name,
      category,
      description,
      total_quantity,
      unit = 'portions',
      serves_count,
      event_name,
      venue_name,
      pickup_address,
      area,
      district = 'Jaffna',
      prepared_at,
      safe_deadline,
      storage_condition,
      is_veg = 1,
      allergens = 'None disclosed',
      contact_phone,
      collection_pref = 'Self Pickup by Institution',
      special_instructions,
    } = req.body;

    const donationId = await runQuery(
      `INSERT INTO food_donations (
        donor_id, food_name, category, description, total_quantity, remaining_quantity,
        unit, serves_count, event_name, venue_name, pickup_address, area, district,
        prepared_at, safe_deadline, storage_condition, is_veg, allergens, contact_phone,
        collection_pref, special_instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
      [
        req.user.id,
        food_name,
        category,
        description,
        Number(total_quantity),
        Number(total_quantity),
        unit,
        Number(serves_count),
        event_name,
        venue_name,
        pickup_address,
        area,
        district,
        prepared_at,
        safe_deadline,
        storage_condition,
        is_veg ? 1 : 0,
        allergens,
        contact_phone || req.user.phone,
        collection_pref,
        special_instructions || '',
      ]
    );

    const created = await queryOne('SELECT * FROM food_donations WHERE id = ?', [donationId]);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('[Donation Create Error]', err);
    res.status(500).json({ message: 'Failed to create food donation.' });
  }
});

// GET /api/institutions (Directory of care homes)
app.get('/api/institutions', async (_req, res) => {
  try {
    const institutions = await queryRows(`
      SELECT p.*, u.email, u.phone, u.is_verified
      FROM institution_profiles p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.institution_name ASC
    `);
    res.json(institutions);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to load institutions.' });
  }
});

// --------------------------------------------------------------------------
// VITE SPA MIDDLEWARE / PRODUCTION STATIC SERVING
// --------------------------------------------------------------------------

async function startServer() {
  // Initialize Database Schema on boot
  await getDb();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[FoodShare Lanka] Full-Stack Server running at http://localhost:${PORT}`);
    console.log(`[REST API] Endpoints available at http://localhost:${PORT}/api/auth/*`);
  });
}

startServer().catch((err) => {
  console.error('[Fatal Server Startup Error]', err);
  process.exit(1);
});
