# FoodShare Lanka – Laravel & MySQL Backend Setup on Linux with XAMPP

This guide covers running the real **FoodShare Lanka** Laravel backend and MySQL database using **XAMPP on Linux (Ubuntu/Debian)**.

---

## 1. System Requirements

- **OS**: Linux (Ubuntu 22.04 LTS, 24.04 LTS, or Debian)
- **Web/DB Server**: XAMPP for Linux (`/opt/lampp`) with MySQL/MariaDB 10.4+
- **PHP**: 8.2 or 8.3 with extensions `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer**: 2.6+
- **Node.js**: 20+ & npm 10+ (for the React frontend)

---

## 2. Start MySQL in XAMPP

Open a terminal on your Linux system:

```bash
# Start XAMPP (Apache and MySQL)
sudo /opt/lampp/lampp start

# Or start MySQL service individually if using native system MySQL:
# sudo systemctl start mysql
```

Verify MySQL is running on port 3306:
```bash
/opt/lampp/bin/mysql -u root -p
```
*(Press Enter when prompted for password if using the default blank root password in XAMPP)*

---

## 3. Create the Database in MySQL

Execute inside the MySQL client:

```sql
CREATE DATABASE IF NOT EXISTS `foodshare_lanka` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

Or import the full schema file directly:
```bash
/opt/lampp/bin/mysql -u root < database/schema.sql
```

---

## 4. Configure Laravel Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Ensure database credentials in `.env` match your XAMPP settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=foodshare_lanka
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. Install PHP dependencies and generate application encryption key:
   ```bash
   composer install
   php artisan key:generate
   ```

5. Run database migrations to construct the tables:
   ```bash
   php artisan migrate
   ```

6. Seed initial test data and administrator account:
   ```bash
   php artisan db:seed
   ```

---

## 5. Start the Services

### Terminal 1: Start Laravel Backend Server
```bash
cd backend
php artisan serve --port=8000
```
The REST API will be accessible at: `http://localhost:8000/api/`

### Terminal 2: Start React Frontend
In the root project directory:
```bash
npm install
npm run dev
```
The web application will open at: `http://localhost:3000`

---

## 6. How to Test Registration, Login, and Role Security

### Step 1: Real User Registration
1. Open `http://localhost:3000` and click **Register** in the navigation bar.
2. Select **Food Donor** or **Receiving Institution**.
3. Fill in the required fields (Name, Email, Mobile, Password, Confirm Password, Jaffna area, Address).
4. Click **Complete Registration**.
5. The frontend sends `POST /api/auth/register` to the backend. The backend cryptographically hashes the password, inserts the user into `users` and `donor_profiles` in MySQL, and returns a verified authentication token.
6. A success message appears and automatically redirects to the user's role dashboard.

### Step 2: Verification in MySQL
Check that the record was stored in MySQL:
```bash
/opt/lampp/bin/mysql -u root foodshare_lanka -e "SELECT id, name, email, role, is_verified, created_at FROM users;"
```
*(Notice that passwords are encrypted hashes; plain-text passwords are never stored).*

### Step 3: Test Duplicate Registration
Try registering again with the exact same email address. The backend returns HTTP `422 Unprocessable Content` with a clear message:
`"This email address is already registered. Please log in or use a different email."`

### Step 4: Test Logout
Click **Sign Out** in the top navigation bar. The token is invalidated on the backend and removed from browser storage. Unauthenticated visitors cannot access protected dashboards.

### Step 5: Test Real Login
1. Click **Login** in the navigation bar.
2. Enter the registered email and password.
3. Click **Log In**.
4. The backend verifies the password hash against MySQL records and opens the respective dashboard (Donor Dashboard for donors, Institution Dashboard for care homes).
5. Entering an incorrect password triggers a 401 response: `"Invalid credentials. The password entered is incorrect."`
