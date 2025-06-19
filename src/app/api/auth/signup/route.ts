import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, inviteToken, siteId } = await request.json();

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists with this email
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    // If invitation token is provided, validate it
    if (inviteToken && siteId) {
      // In a real app, you would validate the invitation token here
      // For now, we'll just check if the site exists
      const siteCheck = await pool.query(
        'SELECT * FROM sites WHERE id = $1',
        [siteId]
      );

      if (siteCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid invitation or site not found' },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO users (name, email, password, created_at) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email`,
      [
        `${firstName} ${lastName}`, // Combine first and last name
        email,
        hashedPassword,
        new Date()
      ]
    );

    const newUser = result.rows[0];

    // If this is a site invitation, create site access
    if (inviteToken && siteId) {
      try {
        // In a real app, you would:
        // 1. Validate the invitation token from a database table
        // 2. Create site access record with viewer role
        // 3. Mark the invitation as used
        
        // For now, we'll just log it
        console.log(`User ${newUser.id} registered via site invitation for site ${siteId}`);
        
        // You could create a site_users table entry here:
        // await pool.query(
        //   'INSERT INTO site_users (site_id, user_id, role, created_at) VALUES ($1, $2, $3, $4)',
        //   [siteId, newUser.id, 'viewer', new Date()]
        // );
      } catch (error) {
        console.error('Error creating site access:', error);
        // Don't fail the registration if site access creation fails
      }
    }

    // Return success response with the created user (excluding password)
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        firstName: firstName, // Store original values in response
        lastName: lastName,
        name: newUser.name,
        email: newUser.email,
        role: 'admin' // Default role
      },
      siteInvitation: inviteToken && siteId ? { siteId, role: 'viewer' } : null
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 