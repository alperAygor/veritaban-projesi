
import psycopg
import os
from dotenv import load_dotenv

# Load params from .env (need to specify path if running from backend dir)
load_dotenv()

from passlib.context import CryptContext

# Context for hashing seed passwords
# Switched to pbkdf2_sha256 to avoid bcrypt version conflicts
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_hash(password):
    return pwd_context.hash(password)

DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "user")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_NAME = os.getenv("POSTGRES_DB", "toolshare")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

# Connection URL for initial connection to 'postgres' db to create the target db if needed
# But usually docker creates the DB. We just connect to it.
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def run_sql_commands(conn, commands):
    with conn.cursor() as cur:
        for command in commands:
            if command.strip():
                try:
                    cur.execute(command)
                    conn.commit()
                    print(f"Executed: {command[:50]}...")
                except Exception as e:
                    print(f"Error executing: {command[:50]}... \n Error: {e}")
                    conn.rollback()

def setup_database():
    print(f"Connecting to {DATABASE_URL}...")
    try:
        conn = psycopg.connect(DATABASE_URL)
    except Exception as e:
        print("Could not connect to database. Make sure Docker is running.")
        print(e)
        return

    # SQL Commands
    commands = [
        # 1. Clean up
        "DROP TRIGGER IF EXISTS trg_update_score_after_review ON reviews CASCADE;",
        "DROP TRIGGER IF EXISTS trg_check_availability ON reservations CASCADE;",
        "DROP FUNCTION IF EXISTS func_update_score CASCADE;",
        "DROP FUNCTION IF EXISTS func_check_availability CASCADE;",
        "DROP FUNCTION IF EXISTS func_search_tools CASCADE;",
        "DROP FUNCTION IF EXISTS func_calculate_price CASCADE;",
        "DROP VIEW IF EXISTS view_available_tools CASCADE;",
        "DROP TABLE IF EXISTS reviews CASCADE;",
        "DROP TABLE IF EXISTS reservations CASCADE;",
        "DROP TABLE IF EXISTS tools CASCADE;",
        "DROP TABLE IF EXISTS users CASCADE;",
        "DROP SEQUENCE IF EXISTS reservation_seq CASCADE;",

        # 2. Sequence (Req 8)
        "CREATE SEQUENCE reservation_seq START 1000;",

        # 3. Users Table (Req 1, 2, 3 - Constraints)
        """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN ('admin', 'user')) NOT NULL DEFAULT 'user',
            security_score FLOAT CHECK (security_score >= 0 AND security_score <= 10) DEFAULT 10.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # 4. Tools Table
        """
        CREATE TABLE tools (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            daily_price DECIMAL(10, 2) NOT NULL CHECK (daily_price > 0),
            category VARCHAR(50),
            status VARCHAR(20) CHECK (status IN ('available', 'maintenance', 'rented')) DEFAULT 'available',
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # 5. Reservations Table (Req 2, 8)
        """
        CREATE TABLE reservations (
            id INTEGER PRIMARY KEY DEFAULT nextval('reservation_seq'), 
            tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
            renter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            total_price DECIMAL(10, 2),
            status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # 6. Reviews Table (Req 1, 2)
        """
        CREATE TABLE reviews (
            id SERIAL PRIMARY KEY,
            reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # 7. Index (Req 7)
        "CREATE INDEX idx_tool_search ON tools(name, category);",

        # 8. View (Req 6)
        """
        CREATE VIEW view_available_tools AS
        SELECT t.id, t.name, t.description, t.category, t.daily_price, t.image_url, u.name as owner_name, u.security_score as owner_score
        FROM tools t
        JOIN users u ON t.owner_id = u.id
        WHERE t.status = 'available';
        """,
        
        # 9. Functions (Req 11)
        # Function 1: Calculate Price (Simple)
        """
        CREATE OR REPLACE FUNCTION func_calculate_price(p_daily_price DECIMAL, p_start DATE, p_end DATE)
        RETURNS DECIMAL AS $$
        BEGIN
            RETURN p_daily_price * (p_end - p_start + 1);
        END;
        $$ LANGUAGE plpgsql;
        """,

        # Function 2: Update Score (Uses RECORD)
        """
        CREATE OR REPLACE FUNCTION func_update_score()
        RETURNS TRIGGER AS $$
        DECLARE
            r RECORD;
            avg_rating FLOAT;
            owner_id_val INTEGER;
        BEGIN
            -- Get owner_id from reservation -> tool
            SELECT t.owner_id INTO owner_id_val
            FROM reservations res
            JOIN tools t ON res.tool_id = t.id
            WHERE res.id = NEW.reservation_id;

            -- Calculate new average
            SELECT AVG(rating) INTO avg_rating
            FROM reviews rv
            JOIN reservations res ON rv.reservation_id = res.id
            JOIN tools t ON res.tool_id = t.id
            WHERE t.owner_id = owner_id_val;
            
            -- Normalize to 10 based (ratings are 1-5, so * 2)
            IF avg_rating IS NULL THEN
                avg_rating := 5; -- default
            END IF;
            
            UPDATE users SET security_score = (avg_rating * 2) WHERE id = owner_id_val;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,

        # Function 3: Search Tools (Uses CURSOR)
        """
        CREATE OR REPLACE FUNCTION func_search_tools(search_term VARCHAR)
        RETURNS REFCURSOR AS $$
        DECLARE
            ref REFCURSOR;
        BEGIN
            OPEN ref FOR 
            SELECT * FROM tools 
            WHERE name ILIKE '%' || search_term || '%' 
               OR category ILIKE '%' || search_term || '%';
            RETURN ref;
        END;
        $$ LANGUAGE plpgsql;
        """,

        # Function 4: Trigger Function for Availability
        """
        CREATE OR REPLACE FUNCTION func_check_availability()
        RETURNS TRIGGER AS $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM reservations
                WHERE tool_id = NEW.tool_id
                  AND status NOT IN ('cancelled', 'rejected')
                  AND (
                      (NEW.start_date BETWEEN start_date AND end_date) OR
                      (NEW.end_date BETWEEN start_date AND end_date) OR
                      (start_date BETWEEN NEW.start_date AND NEW.end_date)
                  )
            ) THEN
                RAISE EXCEPTION 'Tool is not available for these dates';
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """,

        # Function 5: Get User Stats (Requirement 11 - 3rd Function)
        """
        CREATE OR REPLACE FUNCTION func_get_user_stats(p_user_id INTEGER)
        RETURNS TABLE (tools_owned BIGINT, rentals_count BIGINT, total_spent DECIMAL) AS $$
        BEGIN
            RETURN QUERY SELECT
                (SELECT COUNT(*) FROM tools WHERE owner_id = p_user_id),
                (SELECT COUNT(*) FROM reservations WHERE renter_id = p_user_id),
                (SELECT COALESCE(SUM(total_price), 0) FROM reservations WHERE renter_id = p_user_id);
        END;
        $$ LANGUAGE plpgsql;
        """,

        # 10. Triggers (Req 12)
        """
        CREATE TRIGGER trg_update_score_after_review
        AFTER INSERT ON reviews
        FOR EACH ROW
        EXECUTE FUNCTION func_update_score();
        """,
        """
        CREATE TRIGGER trg_check_availability
        BEFORE INSERT ON reservations
        FOR EACH ROW
        EXECUTE FUNCTION func_check_availability();
        """,

# ... (inside setup_database commands list) ...
        # 11. Seed Data
        # Users
        f"INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@toolshare.com', '{get_hash('admin123')}', 'admin');",
        f"INSERT INTO users (name, email, password, role) VALUES ('John Doe', 'john@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('Jane Smith', 'jane@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('Bob Builder', 'bob@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('Alice Wonderland', 'alice@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('Charlie Brown', 'charlie@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('David Tenant', 'david@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('Eva Green', 'eva@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('Frank Castle', 'frank@example.com', '{get_hash('pass123')}', 'user');",
        f"INSERT INTO users (name, email, password, role) VALUES ('Grace Hopper', 'grace@example.com', '{get_hash('pass123')}', 'user');",

        # Tools
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (2, 'Makita Drill', 'Cordless drill 18V', 15.00, 'Power Tools');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (2, 'Hammer', 'Heavy duty hammer', 5.00, 'Hand Tools');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (3, 'Lawn Mower', 'Electric lawn mower', 25.00, 'Gardening');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (3, 'Rake', 'Garden rake', 5.00, 'Gardening');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (4, 'Ladder', 'Extension ladder 5m', 10.00, 'Construction');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (4, 'Paint Sprayer', 'Airless paint sprayer', 30.00, 'Painting');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (5, 'Tripod', 'Camera tripod', 8.00, 'Photography');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (5, 'Camera Lens', '50mm lens', 20.00, 'Photography');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (6, 'Circular Saw', '1800W saw', 18.00, 'Power Tools');",
        "INSERT INTO tools (owner_id, name, description, daily_price, category) VALUES (6, 'Jigsaw', 'Electric jigsaw', 12.00, 'Power Tools');",

        # Reservations
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (1, 3, '2023-11-01', '2023-11-03', 45.00, 'completed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (3, 2, '2023-11-05', '2023-11-05', 25.00, 'completed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (6, 2, '2023-11-10', '2023-11-12', 90.00, 'completed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (1, 4, '2023-11-15', '2023-11-16', 30.00, 'confirmed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (5, 3, '2023-11-20', '2023-11-20', 10.00, 'pending');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (2, 5, '2023-11-22', '2023-11-23', 10.00, 'completed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (7, 2, '2023-11-25', '2023-11-26', 16.00, 'completed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (8, 4, '2023-11-28', '2023-11-30', 60.00, 'completed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (9, 3, '2023-12-01', '2023-12-02', 36.00, 'completed');",
        "INSERT INTO reservations (tool_id, renter_id, start_date, end_date, total_price, status) VALUES (10, 5, '2023-12-05', '2023-12-06', 24.00, 'confirmed');",

        # Reviews
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1000, 5, 'Great drill, worked perfectly.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1001, 4, 'Good mower but battery life short.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1002, 5, 'Paint sprayer saved me days of work!');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1005, 5, 'Solid hammer.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1006, 4, 'Tripod was sturdy.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1007, 5, 'Lens in perfect condition.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1008, 4, 'Saw cut well.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1000, 5, 'Rented again, all good.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1003, 5, 'Good interaction.');",
        "INSERT INTO reviews (reservation_id, rating, comment) VALUES (1006, 5, 'Amazing tool for the price.');"
    ]
    
    run_sql_commands(conn, commands)
    conn.close()
    print("Database setup complete.")

if __name__ == "__main__":
    setup_database()
