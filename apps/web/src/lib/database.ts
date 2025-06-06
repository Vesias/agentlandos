// PostgreSQL Database Configuration for AGENTLAND.SAARLAND
// Real business registration data persistence

import { Pool } from 'pg'

// Database connection configuration
const dbConfig = {
  user: process.env.POSTGRES_USER || 'agentland_user',
  password: process.env.POSTGRES_PASSWORD || 'secure_password_123',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'agentland_saarland',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool size for 200k+ users
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Create connection pool
const pool = new Pool(dbConfig)

// Database initialization
export async function initializeDatabase() {
  const client = await pool.connect()
  
  try {
    // Create business_registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_registrations (
        id SERIAL PRIMARY KEY,
        business_id VARCHAR(20) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        legal_form VARCHAR(50) NOT NULL,
        industry VARCHAR(255) NOT NULL,
        description TEXT,
        
        -- Address data
        street VARCHAR(255) NOT NULL,
        house_number VARCHAR(10) NOT NULL,
        postal_code VARCHAR(5) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(50) DEFAULT 'Deutschland',
        
        -- Contact data
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        
        -- Founder data
        founder_first_name VARCHAR(100) NOT NULL,
        founder_last_name VARCHAR(100) NOT NULL,
        founder_email VARCHAR(255) NOT NULL,
        founder_phone VARCHAR(20),
        saar_id VARCHAR(20),
        
        -- Business details
        expected_employees INTEGER DEFAULT 0,
        expected_revenue BIGINT DEFAULT 0,
        business_plan TEXT,
        funding_needed BOOLEAN DEFAULT FALSE,
        funding_amount BIGINT,
        
        -- Administrative data
        status VARCHAR(50) DEFAULT 'pending',
        authority_id INTEGER,
        processing_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estimated_completion_date TIMESTAMP,
        total_costs DECIMAL(10,2),
        
        -- GDPR compliance
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_retention_until TIMESTAMP,
        consent_marketing BOOLEAN DEFAULT FALSE,
        consent_data_sharing BOOLEAN DEFAULT FALSE,
        
        -- Indexes for performance
        CONSTRAINT valid_postal_code CHECK (postal_code ~ '^66[0-9]{3}$'),
        CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
      );
    `)
    
    // Create SAAR-ID table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saar_ids (
        id SERIAL PRIMARY KEY,
        saar_id VARCHAR(20) UNIQUE NOT NULL,
        citizen_id VARCHAR(100),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address_street VARCHAR(255),
        address_house_number VARCHAR(10),
        address_postal_code VARCHAR(5),
        address_city VARCHAR(100),
        
        -- Government service authorizations
        authorized_services TEXT[], -- Array of service codes
        identity_verified BOOLEAN DEFAULT FALSE,
        verification_date TIMESTAMP,
        
        -- Security
        last_login TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        account_locked BOOLEAN DEFAULT FALSE,
        
        -- GDPR compliance
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_retention_until TIMESTAMP,
        
        CONSTRAINT valid_saar_id CHECK (saar_id ~ '^SAAR-[0-9]{2}-[A-Z0-9]{6}-[0-9]{2}$'),
        CONSTRAINT valid_postal_code CHECK (address_postal_code ~ '^66[0-9]{3}$' OR address_postal_code IS NULL)
      );
    `)
    
    // Create authorities table (Saarland PLZ mapping)
    await client.query(`
      CREATE TABLE IF NOT EXISTS authorities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL, -- 'Stadtverwaltung', 'Gemeindeverwaltung', etc.
        postal_codes INTEGER[] NOT NULL, -- Array of PLZ codes
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        address_street VARCHAR(255),
        address_house_number VARCHAR(10),
        address_postal_code VARCHAR(5),
        address_city VARCHAR(100),
        
        -- Business registration capabilities
        handles_business_registration BOOLEAN DEFAULT TRUE,
        average_processing_days INTEGER DEFAULT 14,
        registration_fee DECIMAL(8,2) DEFAULT 150.00,
        
        -- API integration
        api_endpoint VARCHAR(255),
        api_key_hash VARCHAR(255),
        last_api_sync TIMESTAMP,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    // Create funding_programs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS funding_programs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL, -- 'EU', 'Bund', 'Saarland', 'Bank'
        program_type VARCHAR(100) NOT NULL, -- 'Grant', 'Loan', 'Tax Incentive'
        description TEXT,
        
        -- Eligibility criteria
        min_amount BIGINT NOT NULL,
        max_amount BIGINT NOT NULL,
        eligible_industries TEXT[], -- Array of industry codes
        eligible_legal_forms TEXT[], -- Array of legal form codes
        min_employees INTEGER DEFAULT 0,
        max_employees INTEGER,
        location_restriction VARCHAR(100), -- 'Saarland', 'EU', etc.
        
        -- Application details
        application_deadline DATE,
        application_url VARCHAR(255),
        required_documents TEXT[],
        processing_time_days INTEGER,
        
        -- Current status
        is_active BOOLEAN DEFAULT TRUE,
        budget_remaining BIGINT,
        applications_open BOOLEAN DEFAULT TRUE,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    // Create registration_funding_matches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS registration_funding_matches (
        id SERIAL PRIMARY KEY,
        business_registration_id INTEGER REFERENCES business_registrations(id),
        funding_program_id INTEGER REFERENCES funding_programs(id),
        eligibility_score DECIMAL(3,2), -- 0.00 to 1.00
        estimated_amount BIGINT,
        match_reasons TEXT[],
        application_status VARCHAR(50) DEFAULT 'eligible',
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(business_registration_id, funding_program_id)
      );
    `)
    
    // Create audit_log table for compliance
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        table_name VARCHAR(100) NOT NULL,
        record_id INTEGER NOT NULL,
        action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'VIEW'
        old_values JSONB,
        new_values JSONB,
        user_id VARCHAR(100),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_business_registrations_postal_code ON business_registrations(postal_code);
      CREATE INDEX IF NOT EXISTS idx_business_registrations_status ON business_registrations(status);
      CREATE INDEX IF NOT EXISTS idx_business_registrations_created_at ON business_registrations(created_at);
      CREATE INDEX IF NOT EXISTS idx_saar_ids_saar_id ON saar_ids(saar_id);
      CREATE INDEX IF NOT EXISTS idx_authorities_postal_codes ON authorities USING GIN(postal_codes);
      CREATE INDEX IF NOT EXISTS idx_funding_programs_eligible_industries ON funding_programs USING GIN(eligible_industries);
      CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
    `)
    
    console.log('✅ Database tables initialized successfully')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    client.release()
  }
}

// Business Registration Database Operations
export class BusinessRegistrationDB {
  
  static async create(registrationData: any): Promise<string> {
    const client = await pool.connect()
    
    try {
      // Generate unique business ID
      const businessId = `BUS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      const result = await client.query(`
        INSERT INTO business_registrations (
          business_id, company_name, legal_form, industry, description,
          street, house_number, postal_code, city, country,
          phone, email, website,
          founder_first_name, founder_last_name, founder_email, founder_phone, saar_id,
          expected_employees, expected_revenue, business_plan, funding_needed, funding_amount,
          data_retention_until
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING id
      `, [
        businessId,
        registrationData.companyName,
        registrationData.legalForm,
        registrationData.industry,
        registrationData.description,
        registrationData.address.street,
        registrationData.address.houseNumber,
        registrationData.address.postalCode,
        registrationData.address.city,
        registrationData.address.country,
        registrationData.contact.phone,
        registrationData.contact.email,
        registrationData.contact.website,
        registrationData.founder.firstName,
        registrationData.founder.lastName,
        registrationData.founder.email,
        registrationData.founder.phone,
        registrationData.founder.saarId,
        registrationData.expectedEmployees,
        registrationData.expectedRevenue,
        registrationData.businessPlan,
        registrationData.fundingNeeded,
        registrationData.fundingAmount,
        new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000) // 7 years GDPR retention
      ])
      
      // Log the creation for audit
      await this.auditLog('business_registrations', result.rows[0].id, 'INSERT', null, registrationData)
      
      return businessId
      
    } catch (error) {
      console.error('Database error creating business registration:', error)
      throw error
    } finally {
      client.release()
    }
  }
  
  static async findByBusinessId(businessId: string): Promise<any | null> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT * FROM business_registrations WHERE business_id = $1
      `, [businessId])
      
      if (result.rows.length > 0) {
        // Log the access for audit
        await this.auditLog('business_registrations', result.rows[0].id, 'VIEW', null, null)
        return result.rows[0]
      }
      
      return null
      
    } catch (error) {
      console.error('Database error finding business registration:', error)
      throw error
    } finally {
      client.release()
    }
  }
  
  static async updateStatus(businessId: string, status: string, additionalData?: any): Promise<boolean> {
    const client = await pool.connect()
    
    try {
      const oldRecord = await this.findByBusinessId(businessId)
      
      const result = await client.query(`
        UPDATE business_registrations 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE business_id = $2
      `, [status, businessId])
      
      if (result.rowCount && result.rowCount > 0) {
        await this.auditLog('business_registrations', oldRecord.id, 'UPDATE', oldRecord, { status, ...additionalData })
        return true
      }
      
      return false
      
    } catch (error) {
      console.error('Database error updating business registration status:', error)
      throw error
    } finally {
      client.release()
    }
  }
  
  static async auditLog(tableName: string, recordId: number, action: string, oldValues: any, newValues: any): Promise<void> {
    const client = await pool.connect()
    
    try {
      await client.query(`
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
        VALUES ($1, $2, $3, $4, $5)
      `, [tableName, recordId, action, JSON.stringify(oldValues), JSON.stringify(newValues)])
      
    } catch (error) {
      console.error('Audit log error:', error)
      // Don't throw - audit logging shouldn't break main functionality
    } finally {
      client.release()
    }
  }
}

// SAAR-ID Database Operations
export class SaarIdDB {
  
  static async create(saarIdData: any): Promise<string> {
    const client = await pool.connect()
    
    try {
      // Generate unique SAAR-ID
      const saarId = this.generateSaarId()
      
      const result = await client.query(`
        INSERT INTO saar_ids (
          saar_id, first_name, last_name, email, phone,
          address_street, address_house_number, address_postal_code, address_city,
          authorized_services, data_retention_until
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        saarId,
        saarIdData.firstName,
        saarIdData.lastName,
        saarIdData.email,
        saarIdData.phone,
        saarIdData.address?.street,
        saarIdData.address?.houseNumber,
        saarIdData.address?.postalCode,
        saarIdData.address?.city,
        saarIdData.authorizedServices || [],
        new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000) // 7 years GDPR retention
      ])
      
      return saarId
      
    } catch (error) {
      console.error('Database error creating SAAR-ID:', error)
      throw error
    } finally {
      client.release()
    }
  }
  
  static generateSaarId(): string {
    const year = new Date().getFullYear().toString().slice(-2)
    const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase()
    const checksum = Math.floor(Math.random() * 90) + 10
    return `SAAR-${year}-${randomPart}-${checksum}`
  }
  
  static async findBySaarId(saarId: string): Promise<any | null> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT * FROM saar_ids WHERE saar_id = $1
      `, [saarId])
      
      return result.rows[0] || null
      
    } catch (error) {
      console.error('Database error finding SAAR-ID:', error)
      throw error
    } finally {
      client.release()
    }
  }
}

// Authorities Database Operations  
export class AuthoritiesDB {
  
  static async findByPostalCode(postalCode: string): Promise<any | null> {
    const client = await pool.connect()
    
    try {
      const plzNumber = parseInt(postalCode)
      
      const result = await client.query(`
        SELECT * FROM authorities 
        WHERE $1 = ANY(postal_codes) AND handles_business_registration = TRUE
        ORDER BY average_processing_days ASC
        LIMIT 1
      `, [plzNumber])
      
      return result.rows[0] || null
      
    } catch (error) {
      console.error('Database error finding authority by postal code:', error)
      throw error
    } finally {
      client.release()
    }
  }
}

// Funding Programs Database Operations
export class FundingProgramsDB {
  
  static async findEligiblePrograms(registrationData: any): Promise<any[]> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT * FROM funding_programs 
        WHERE is_active = TRUE 
        AND applications_open = TRUE
        AND ($1 >= min_amount OR min_amount = 0)
        AND ($1 <= max_amount OR max_amount IS NULL)
        AND (eligible_industries IS NULL OR $2 = ANY(eligible_industries))
        AND (eligible_legal_forms IS NULL OR $3 = ANY(eligible_legal_forms))
        AND (max_employees IS NULL OR $4 <= max_employees)
        ORDER BY max_amount DESC
      `, [
        registrationData.fundingAmount || 0,
        registrationData.industry,
        registrationData.legalForm,
        registrationData.expectedEmployees
      ])
      
      return result.rows
      
    } catch (error) {
      console.error('Database error finding eligible funding programs:', error)
      throw error
    } finally {
      client.release()
    }
  }
}

// Health check function
export async function healthCheck(): Promise<boolean> {
  const client = await pool.connect()
  
  try {
    await client.query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  } finally {
    client.release()
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  await pool.end()
}

export default pool