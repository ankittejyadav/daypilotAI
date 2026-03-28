-- DayPilot AI PostgreSQL Schema

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insights Table (Bento Dashboard)
CREATE TABLE insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(50) NOT NULL, -- Email, Calendar, Finance, Tasks
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    status_text VARCHAR(100),
    priority_level VARCHAR(20), -- primary, secondary, tertiary, error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Alerts Table
CREATE TABLE financial_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20), -- error, tertiary
    icon VARCHAR(50),
    action_label VARCHAR(50),
    is_critical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bills Table
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(100),
    due_date DATE,
    amount DECIMAL(12, 2),
    icon VARCHAR(50),
    color_token VARCHAR(50)
);

-- Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(20), -- High, Medium, Low
    due_datetime TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, done
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Events Table
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    zoom_id VARCHAR(100),
    ai_context TEXT,
    needs_prep BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE
);
