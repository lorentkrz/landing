-- Sample venue data to quickly bootstrap a development environment.
insert into public.venues (id, name, type, description, address, city, country, rating, image_url, cover_image_url, features, capacity, open_hours, latitude, longitude, map_visible, is_featured)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Zone Club',
    'Nightclub',
    'Kosovo''s iconic electronic club hosting international techno and house DJs every weekend.',
    'Rruga e Germise 21',
    'Prishtina',
    'Kosovo',
    4.8,
    'https://storage.googleapis.com/albania-travel-guide/2022/07/Nightlife-in-Tirana-Tirana-Albania-Travel-Guide-960x640.jpg',
    'https://storage.googleapis.com/albania-travel-guide/2022/07/Nightlife-in-Tirana-Tirana-Albania-Travel-Guide-960x640.jpg',
    array['International DJs', 'VIP tables', 'Laser show'],
    1000,
    '22:00 - 04:00',
    42.6629,
    21.1655,
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Soluna Beach Bar',
    'Beach Bar',
    'Sunset-ready cocktail bar right on Vlore''s promenade with live sax on Fridays.',
    'Rruga Uji i Ftohte 12',
    'Vlore',
    'Albania',
    4.6,
    'https://scratchyourmapa.com/wp-content/uploads/2022/07/beach-club-set-up-1024x676.jpg',
    'https://scratchyourmapa.com/wp-content/uploads/2022/07/beach-club-set-up-1024x676.jpg',
    array['Beach beds', 'Sunset DJ', 'Signature cocktails'],
    200,
    '10:00 - 02:00',
    40.4711,
    19.4914,
    true,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Infinity Lounge',
    'Lounge',
    'Modern lounge with ambient lighting, crafted drinks, and Thursday RnB nights.',
    'Rruga Adem Jashari 45',
    'Peja',
    'Kosovo',
    4.5,
    'https://ghostaroundtheglobe.com/wp-content/uploads/2023/09/Pristina-Kosovo-Bars.jpg',
    'https://ghostaroundtheglobe.com/wp-content/uploads/2023/09/Pristina-Kosovo-Bars.jpg',
    array['Live sax', 'Craft cocktails', 'Cozy booths'],
    140,
    '18:00 - 02:00',
    42.6593,
    20.2883,
    true,
    false
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Sky High Club',
    'Nightclub',
    'Rooftop nightclub with open-air dance floors, skyline views, and laser light shows.',
    'Rruga e Shkupit 5',
    'Mitrovica',
    'Kosovo',
    4.7,
    'https://www.digitalstudioindia.com/cloud/2021/11/12/Sky-High-Skybar-1-(1).jpg',
    'https://www.digitalstudioindia.com/cloud/2021/11/12/Sky-High-Skybar-1-(1).jpg',
    array['Rooftop views', 'Premium bottles', 'VIP cabanas'],
    500,
    '21:00 - 03:30',
    42.8901,
    20.8651,
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Cuba Libre',
    'Cocktail Bar',
    'Latin-inspired cocktail bar with mojitos, salsa nights, and acoustic Sundays.',
    'Rruga Teuta 9',
    'Shkoder',
    'Albania',
    4.4,
    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/ae/08/8d/premium-cocktail-at-plata.jpg?w=700&h=400&s=1',
    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/ae/08/8d/premium-cocktail-at-plata.jpg?w=700&h=400&s=1',
    array['Live salsa', 'Outdoor patio', 'Rum library'],
    100,
    '19:00 - 02:00',
    42.0693,
    19.5126,
    true,
    false
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Sunset Vibes',
    'Beach Bar',
    'Beachfront party spot with fire shows, tropical mixes, and weekend brunch parties.',
    'Rruga Taulantia 3',
    'Durres',
    'Albania',
    4.6,
    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/d6/36/85/caption.jpg?w=1100&h=-1&s=1',
    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/d6/36/85/caption.jpg?w=1100&h=-1&s=1',
    array['Fire shows', 'Brunch parties', 'Tropical mixes'],
    250,
    '12:00 - 02:00',
    41.3148,
    19.4445,
    true,
    false
  )
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  description = excluded.description,
  address = excluded.address,
  city = excluded.city,
  country = excluded.country,
  rating = excluded.rating,
  image_url = excluded.image_url,
  cover_image_url = excluded.cover_image_url,
  features = excluded.features,
  capacity = excluded.capacity,
  open_hours = excluded.open_hours,
  updated_at = now();
insert into public.admins (profile_id, email, role, is_active)
values ('d6aceeac-5fc2-407f-a580-bf5ac6552fe2', 'lorentkryeziu@gmail.com', 'super_admin', true)
on conflict (email) do update
set profile_id = excluded.profile_id, role = excluded.role, is_active = true;

insert into public.app_guides (slug, title, subtitle, steps, media_url)
values (
  'how-to-check-in',
  'How to check in',
  'Scan the venue QR to access guest lists, offers, and live rooms.',
  '[
    {"title": "Find the scanner", "description": "Look for the Nata QR podium at the door or ask a host."},
    {"title": "Open the app", "description": "Tap Scan and point your camera steadily at the QR code."},
    {"title": "Wait for the pulse", "description": "We’ll validate the code and unlock the venue room instantly."},
    {"title": "Enjoy perks", "description": "Once inside you can redeem offers, DM people in the room, and track your night."}
  ]',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop'
)
on conflict (slug) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    steps = excluded.steps,
    media_url = excluded.media_url,
    updated_at = now();
