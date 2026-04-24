import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      department VARCHAR(100),
      email VARCHAR(255),
      birth_date VARCHAR(100),
      birthplace VARCHAR(255),
      gender VARCHAR(50),
      citizenship VARCHAR(100),
      religion VARCHAR(100),
      address TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  const existing = await sql`SELECT COUNT(*) as count FROM members`;
  if (Number(existing[0].count) === 0) {
    await sql`
      INSERT INTO members (name, role, department, email, birth_date, birthplace, gender, citizenship, religion, address) VALUES
      ('John Michael Talbo',       'AI Chat Developer',   'AI Chat Digital Twin', '',                          '', '', '', '', '', ''),
      ('Arjay Pamittan',           'AI Chat Developer',   'AI Chat Digital Twin', '',                          '', '', '', '', '', ''),
      ('Marc Ruben Lucas',         'AI Chat Developer',   'AI Chat Digital Twin', '',                          '', '', '', '', '', ''),
      ('Aeron Garma',              'UI Designer',         'UI',                   'garmaaeron@gmail.com',       'July 10, 2005', 'Aparri, Cagayan', 'Male', 'Filipino', 'Roman Catholic', 'Casambalangan, Sta. Ana, Cagayan'),
      ('Prince Ethan Macadangdang','UI Designer',         'UI',                   'papa.ethanmac@gmail.com',    'February 2, 2005', 'Aparri, Cagayan', 'Male', 'Filipino', 'Roman Catholic', 'Gaggabutan West, Rizal, Cagayan'),
      ('Peter Cauan',              'UI Designer',         'UI',                   '',                          '', '', '', '', '', ''),
      ('Aaron Clerf Sarambao',     'Backend Developer',   'Database Back End',    '',                          '', '', '', '', '', ''),
      ('Christian Jerald Martinez','Backend Developer',   'Database Back End',    '',                          '', '', '', '', '', '')
    `;
  }
}
