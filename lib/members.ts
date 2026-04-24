export interface TeamMember {
  name: string;
  birthDate: string;
  birthplace: string;
  gender: string;
  citizenship: string;
  religion: string;
  address: string;
  email: string;
  role: string;
}

// Shared data for all members
export const SHARED_EDUCATION = `Bachelor of Science in Information Technology
St. Paul University Philippines, 2023 - Present`;

export const SHARED_CERTIFICATIONS = [
  'Certificate of Recognition, SPUP Paskuhan 2023 Volleyball',
  'Certificate of Recognition, Cluster Meet 2023',
  'Certificate of Participation, IT Cybersecurity Roadshow',
  'Certificate of Participation, ITE CONVENTION 2025',
  'Certificate of Participation, SITE Film Festival 2025',
  'Certificate of Participation, ITE CONVENTION 2024',
  'Certificate of Participation, CYBER SUMMIT 2023',
];

export const SHARED_SEMINARS = [
  {
    event: 'IT Cybersecurity Roadshow',
    venue: 'St. Paul University Philippines, Tuguegarao City, Cagayan',
    date: 'October 25, 2025',
  },
  {
    event: 'SITE Film Festival 2025',
    venue: 'St. Paul University Philippines, Tuguegarao City, Cagayan',
    date: 'June 19, 2025',
  },
  {
    event: 'ITE CONVENTION 2025',
    theme: 'Innovate, Transform, Sustain: Shaping a Smarter World',
    venue: 'St. Paul University Philippines, Tuguegarao City, Cagayan',
  },
  {
    event: 'ITE CONVENTION 2024',
    theme: 'Sustainable Synergy: Integrating Information Technology and Engineering for a Greener Tomorrow',
    venue: 'St. Paul University Philippines, Tuguegarao City, Cagayan',
    date: 'April 17-19, 2024',
  },
  {
    event: 'Cyber Summit 2023',
    theme: 'Driving Sustainable Development through Innovation of Technology for a Better Future',
    venue: 'St. Paul University Philippines, Tuguegarao City, Cagayan',
    date: 'May 24-26, 2023',
  },
];

export const SHARED_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'SQL',
  'Laravel', 'Next.js', 'React', 'PostgreSQL',
  'AI Claude (has knowledge in using)',
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Aeron Garma',
    birthDate: 'July 10, 2005',
    birthplace: 'Aparri, Cagayan',
    gender: 'Male',
    citizenship: 'Filipino',
    religion: 'Roman Catholic',
    address: 'Casambalangan, Sta. Ana, Cagayan',
    email: 'garmaaeron@gmail.com',
    role: 'UI Design',
  },
  {
    name: 'Prince Ethan Macadangdang',
    birthDate: 'February 2, 2005',
    birthplace: 'Aparri, Cagayan',
    gender: 'Male',
    citizenship: 'Filipino',
    religion: 'Roman Catholic',
    address: 'Gaggabutan West, Rizal, Cagayan',
    email: 'papa.ethanmac@gmail.com',
    role: 'UI Design',
  },
  {
    name: 'John Michael Talbo',
    birthDate: '',
    birthplace: '',
    gender: '',
    citizenship: 'Filipino',
    religion: '',
    address: '',
    email: '',
    role: 'AI Chat Developer',
  },
  {
    name: 'Arjay Pamittan',
    birthDate: '',
    birthplace: '',
    gender: '',
    citizenship: 'Filipino',
    religion: '',
    address: '',
    email: '',
    role: 'AI Chat Developer',
  },
  {
    name: 'Marc Ruben Lucas',
    birthDate: '',
    birthplace: '',
    gender: '',
    citizenship: 'Filipino',
    religion: '',
    address: '',
    email: '',
    role: 'AI Chat Developer',
  },
  {
    name: 'Peter Cauan',
    birthDate: '',
    birthplace: '',
    gender: '',
    citizenship: 'Filipino',
    religion: '',
    address: '',
    email: '',
    role: 'UI Design',
  },
  {
    name: 'Michael Josh Jacinto',
    birthDate: '',
    birthplace: '',
    gender: '',
    citizenship: 'Filipino',
    religion: '',
    address: '',
    email: '',
    role: 'UI Design',
  },
  {
    name: 'Aaron Clerf Sarambao',
    birthDate: '',
    birthplace: '',
    gender: '',
    citizenship: 'Filipino',
    religion: '',
    address: '',
    email: '',
    role: 'Backend Developer',
  },
  {
    name: 'Christian Jerald Martinez',
    birthDate: '',
    birthplace: '',
    gender: '',
    citizenship: 'Filipino',
    religion: '',
    address: '',
    email: '',
    role: 'Backend Developer',
  },
];
