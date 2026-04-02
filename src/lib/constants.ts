import type { Condition, ClinicHours } from './types';

export const CONDITIONS: Condition[] = [
  // Adult conditions
  { slug: 'back-pain-sciatica', title: 'Back Pain and Sciatica', description: 'Expert treatment for lumbar disc conditions, spinal stenosis, and sciatic nerve pain along the full nerve pathway.', category: 'adult' },
  { slug: 'neck-pain-whiplash', title: 'Neck Pain and Whiplash', description: 'Comprehensive cervical spine assessment and mobilisation for acute and chronic neck conditions.', category: 'adult' },
  { slug: 'arthritis', title: 'Arthritis', description: 'Evidence-based strategies to reduce pain, improve joint mobility, and maintain quality of life.', category: 'adult' },
  { slug: 'sports-injuries', title: 'Sports Injuries', description: 'From acute ligament sprains to chronic overuse conditions — treatment for athletes at every level.', category: 'adult' },
  { slug: 'work-related-injury', title: 'Work Related Injury or Pain', description: 'Assessment and rehabilitation for workplace musculoskeletal conditions and repetitive strain injuries.', category: 'adult' },
  { slug: 'muscle-tendon-ligament', title: 'Muscles, Tendons and Ligaments Injuries', description: 'Targeted treatment for soft tissue injuries including strains, tears, and inflammatory conditions.', category: 'adult' },
  { slug: 'ankle-knee', title: 'Ankle and Knee Injuries/Problems', description: 'Biomechanical assessment and targeted rehabilitation for lower limb conditions and instability.', category: 'adult' },
  { slug: 'frozen-shoulder', title: 'Frozen Shoulder', description: 'Specialised capsular mobilisation and graded stretching for adhesive capsulitis at all stages.', category: 'adult' },
  { slug: 'tennis-elbow', title: 'Tennis Elbow', description: 'Targeted loading therapy for lateral epicondylitis and tendinopathy conditions.', category: 'adult' },
  { slug: 'post-surgery-rehab', title: 'Rehabilitation Following Surgery', description: 'Structured progressive rehabilitation programs following orthopaedic and spinal surgery.', category: 'adult' },
  { slug: 'disc-prolapses', title: 'Disc Prolapses', description: 'Specialist management of intervertebral disc herniation with conservative and progressive approaches.', category: 'adult' },
  // Paediatric conditions
  { slug: 'torticollis', title: 'Head Turning Preference & Torticollis', description: 'Assessment and treatment for infant neck tightness, head turning preference, and associated movement asymmetry.', category: 'paediatric' },
  { slug: 'flat-head-syndrome', title: 'Flat Head Syndrome', description: 'Management of Brachycephaly and Plagiocephaly through positioning guidance, physiotherapy, and developmental support.', category: 'paediatric' },
  { slug: 'delayed-milestones', title: 'Delayed Developmental Milestones', description: 'Support for infants and children experiencing delays in motor skills such as rolling, sitting, crawling, and walking.', category: 'paediatric' },
  { slug: 'cerebral-palsy', title: 'Cerebral Palsy & Birth-Related Conditions', description: 'Individualized therapy programs to improve movement control, strength, and functional independence.', category: 'paediatric' },
  { slug: 'balance-coordination', title: 'Balance & Coordination Difficulties', description: 'Targeted rehabilitation for Developmental Coordination Disorder (DCD) and other motor coordination challenges.', category: 'paediatric' },
  { slug: 'genetic-neurological', title: 'Chromosomal, Genetic & Neurological Conditions', description: 'Specialist physiotherapy care supporting movement, posture, and development in complex conditions.', category: 'paediatric' },
  { slug: 'clubfoot', title: 'Positional Talipes (Clubfoot)', description: 'Early intervention and therapeutic management to improve foot positioning and mobility.', category: 'paediatric' },
  { slug: 'gait-disorders', title: 'Gait Disorders', description: 'Assessment and treatment for walking abnormalities including flat feet, intoeing, and out-toeing.', category: 'paediatric' },
  { slug: 'child-musculoskeletal', title: 'Musculoskeletal Conditions in Children', description: 'Management of growth-related and orthopaedic conditions affecting bones, joints, and muscles.', category: 'paediatric' },
  { slug: 'osgood-schlatter', title: 'Osgood-Schlatter Disease', description: 'Treatment for activity-related knee pain common in growing adolescents.', category: 'paediatric' },
  { slug: 'severs-disease', title: "Sever's Disease", description: 'Rehabilitation strategies to relieve heel pain associated with growth plate irritation.', category: 'paediatric' },
  { slug: 'osteochondritis-dissecans', title: 'Osteochondritis Dissecans', description: 'Specialised care for joint cartilage and bone conditions affecting young athletes.', category: 'paediatric' },
  // General
  { slug: 'other', title: 'Other', description: 'Any other condition not listed above.' },
];

export const CONDITION_SLUGS = CONDITIONS.map(c => c.slug);

export const CLINIC_HOURS: Record<string, ClinicHours | null> = {
  Monday: { start: '16:30', end: '21:00' },
  Tuesday: { start: '16:30', end: '21:00' },
  Wednesday: { start: '16:30', end: '21:00' },
  Thursday: { start: '16:30', end: '21:00' },
  Friday: { start: '16:30', end: '21:00' },
  Saturday: { start: '08:00', end: '21:00' },
  Sunday: null,
};

export const SLOT_DURATION_MINUTES = 30;
export const BOOKING_WINDOW_WEEKS = 4;

export const CLINIC_INFO = {
  name: 'Elite Physio Clinics',
  phone: '+44 333 577 9553',
  email: 'elitephysioclinics@gmail.com',
  address: 'Mare Fair, Sol Central\nGround Floor, Unit 3\nNorthampton NN1 1SR',
};
