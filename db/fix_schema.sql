-- Fix missing columns in sites table and config_vars table
-- Add all missing columns that are causing errors

DO $$
BEGIN
    -- Check if repository_url column exists in sites table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sites' AND column_name = 'repository_url'
    ) THEN
        ALTER TABLE sites ADD COLUMN repository_url VARCHAR(255);
    END IF;

    -- Check if branch column exists in sites table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sites' AND column_name = 'branch'
    ) THEN
        ALTER TABLE sites ADD COLUMN branch VARCHAR(100) DEFAULT 'main';
    END IF;
    
    -- Check if auto_deploy column exists in sites table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sites' AND column_name = 'auto_deploy'
    ) THEN
        ALTER TABLE sites ADD COLUMN auto_deploy BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Check if visibility column exists in sites table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sites' AND column_name = 'visibility'
    ) THEN
        ALTER TABLE sites ADD COLUMN visibility VARCHAR(50) DEFAULT 'public';
    END IF;
    
    -- Check if is_sensitive column exists in config_vars table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'config_vars' AND column_name = 'is_sensitive'
    ) THEN
        ALTER TABLE config_vars ADD COLUMN is_sensitive BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Check if environment column exists in config_vars table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'config_vars' AND column_name = 'environment'
    ) THEN
        ALTER TABLE config_vars ADD COLUMN environment VARCHAR(50) DEFAULT 'production';
    END IF;
    
    -- Check if created_by column exists in config_vars table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'config_vars' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE config_vars ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- Check if user_sessions table exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_sessions'
    ) THEN
        CREATE TABLE user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_user_sessions_token ON user_sessions(token);
        CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
    END IF;
END$$;

-- Confirm sites table changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sites' 
ORDER BY ordinal_position;

-- Confirm config_vars table changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'config_vars' 
ORDER BY ordinal_position; 