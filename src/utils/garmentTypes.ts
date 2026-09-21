// Shared between OrderEdit.tsx and GenerateJobCardsModal.tsx — anywhere
// that needs to know a garment type's measurement fields, its dropdown
// label, or how to map it onto the (separately, more narrowly enumerated)
// Measurement.garmentType schema field. Keeping this in one place is what
// stops the Order/JobCard garment-type enums from silently drifting apart
// again the way they had before (see models/JobCard.js's comment).
import { getOrderedFields } from '../components/Orders/MeasurementGrid';

export interface MeasurementFieldDef {
  key: string;
  label: string;
  placeholder: string;
  unit?: string;
}

// Accessories that carry a real, measurable spec (shoe/sandal size, belt
// waist) get a small field set of their own; everything else in this list
// (dupatta, tie, perfume, jewellery, etc.) has nothing to measure, so the
// whole Measurements section stays hidden for them.
export const NO_MEASUREMENT_ACCESSORIES = [
  'dupatta', 'shawl', 'tuxedo-belt', 'safa', 'perfume', 'brooches', 'tie',
  'bow', 'muffler', 'scarf', 'watch', 'buttons', 'cufflinks', 'mala',
  'wallets', 'bags', 'clutches', 'purses', 'rings', 'earrings', 'necklace', 'bangles'
];

// Catalog type ids (this file's own lowercase ids, not MeasurementGrid's
// Title Case garment names) that count as "lower body" for the purpose of
// picking the right fixed-order chart below.
const BOTTOM_TYPE_IDS = [
  'trousers', 'pant', 'pajamas', 'shalwars', 'salwar', 'dhoti', 'arhems',
  'paticoats', 'skirts', 'skirt', 'garara', 'sharara', 'churidar'
];

// Returns the measurement fields relevant to a garment type, for a given
// customer gender. This defers to the SAME fixed-order, gender + body-part
// chart the order-creation measurement grid uses (MeasurementGrid.tsx) —
// it used to be a much shorter, ad hoc list of 4-6 fields per garment
// "family" that didn't match that chart at all, so most of a customer's
// actual saved measurements (shape, tummy, mori, bicep, forearm, armhole,
// thigh, knee, calf, etc.) were invisible here even though they existed.
export const getMeasurementFields = (type: string, gender?: string): MeasurementFieldDef[] => {
  const t = (type || '').toLowerCase();
  if (NO_MEASUREMENT_ACCESSORIES.includes(t)) return [];
  if (['shoes', 'sleepers', 'sandals', 'jutis'].includes(t))
    return [{ key: 'size', label: 'Size', placeholder: '9', unit: '' }];
  if (['belts'].includes(t))
    return [{ key: 'waist', label: 'Waist', placeholder: '34' }];

  const bodyPart = BOTTOM_TYPE_IDS.includes(t) ? 'lower' : 'upper';
  return getOrderedFields(gender, bodyPart).map(([field, label]) => ({
    key: field,
    label,
    placeholder: '',
    unit: 'in'
  }));
};

const VALID_GARMENT_TYPES = [
  'shirt', 'pant', 'suit', 'blazer', 'kurta', 'pajama', 'sherwani',
  'lehenga', 'saree_blouse', 'dress', 'skirt', 'top', 'jacket',
  'coat', 'waistcoat', 'dhoti', 'churidar', 'salwar', 'dupatta'
];

// Full catalog of type values actually used across the app (order creation
// draws from a much larger product list than a plain dropdown would offer —
// see components/Orders/NewOrder/forms/ProductSelection.tsx — plus a few
// legacy values seen in existing order data, e.g. 'pant' vs 'trousers').
// Grouped for a dropdown's <optgroup>s.
export const GARMENT_TYPE_GROUPS: { group: string; options: { value: string; label: string }[] }[] = [
  {
    group: 'Bottoms', options: [
      { value: 'trousers', label: 'Trousers' }, { value: 'pant', label: 'Pant' },
      { value: 'pajamas', label: 'Pajamas' }, { value: 'shalwars', label: 'Shalwars' },
      { value: 'salwar', label: 'Salwar' }, { value: 'dhoti', label: 'Dhoti' },
      { value: 'arhems', label: 'Arhems' }, { value: 'paticoats', label: 'Paticoats' },
      { value: 'skirts', label: 'Skirts' }, { value: 'skirt', label: 'Skirt' },
      { value: 'garara', label: 'Garara' }, { value: 'sharara', label: 'Sharara' },
      { value: 'churidar', label: 'Churidar' }
    ]
  },
  {
    group: 'Uppers', options: [
      { value: 'shirt', label: 'Shirt' }, { value: 'kurta', label: 'Kurta' },
      { value: 'kurti', label: 'Kurti' }, { value: 'kamize', label: 'Kamize' },
      { value: 'pathni', label: 'Pathni' }, { value: 'jubba', label: 'Jubba' },
      { value: 'blouse', label: 'Blouse' }, { value: 'saree_blouse', label: 'Saree Blouse' },
      { value: 'shrags', label: 'Shrags' }, { value: 'gowne', label: 'Gowne' },
      { value: 'dress', label: 'Dress' }, { value: 'kaftan', label: 'Kaftan' },
      { value: 'jacket-upper', label: 'Jacket (Upper)' }, { value: 'froog', label: 'Froog' },
      { value: 'one-pec', label: 'One Piece' }, { value: 'top', label: 'Top' },
      { value: 'lehenga', label: 'Lehenga' }
    ]
  },
  {
    group: 'Westcoats', options: [
      { value: 'west-coat', label: 'West Coat' }, { value: 'waistcoat', label: 'Waistcoat' },
      { value: 'nehru', label: 'Nehru Jacket' }, { value: 'shrug', label: 'Shrug' }
    ]
  },
  {
    group: 'Blazers & Sherwani', options: [
      { value: 'blazer', label: 'Blazer' }, { value: 'jothpuri', label: 'Jothpuri' },
      { value: 'sherwani', label: 'Sherwani' }, { value: 'over-coat', label: 'Over Coat' },
      { value: 'coat', label: 'Coat' }, { value: 'trench-coat', label: 'Trench Coat' },
      { value: 'jacket-formal', label: 'Formal Jacket' }, { value: 'jacket', label: 'Jacket' },
      { value: 'suit', label: 'Suit' }
    ]
  },
  {
    group: 'Accessories', options: [
      { value: 'dupatta', label: 'Dupatta' }, { value: 'shawl', label: 'Shawl' },
      { value: 'tuxedo-belt', label: 'Tuxedo Belt' }, { value: 'shoes', label: 'Shoes' },
      { value: 'sleepers', label: 'Sleepers' }, { value: 'sandals', label: 'Sandals' },
      { value: 'jutis', label: 'Jutis' }, { value: 'safa', label: 'Safa' },
      { value: 'perfume', label: 'Perfume' }, { value: 'brooches', label: 'Brooches' },
      { value: 'tie', label: 'Tie' }, { value: 'bow', label: 'Bow' },
      { value: 'muffler', label: 'Muffler' }, { value: 'scarf', label: 'Scarf' },
      { value: 'watch', label: 'Watch' }, { value: 'buttons', label: 'Buttons' },
      { value: 'cufflinks', label: 'Cufflinks' }, { value: 'mala', label: 'Mala' },
      { value: 'belts', label: 'Belts' }, { value: 'wallets', label: 'Wallets' },
      { value: 'bags', label: 'Bags' }, { value: 'clutches', label: 'Clutches' },
      { value: 'purses', label: 'Purses' }, { value: 'rings', label: 'Rings' },
      { value: 'earrings', label: 'Earrings' }, { value: 'necklace', label: 'Necklace' },
      { value: 'bangles', label: 'Bangles' }
    ]
  }
];

export const ALL_GARMENT_TYPE_VALUES = new Set(GARMENT_TYPE_GROUPS.flatMap(g => g.options.map(o => o.value)));

// Maps a loose, catalog-style type (e.g. 'trousers', 'west-coat') onto the
// narrower Measurement.garmentType enum the backend actually accepts.
export const resolveGarmentType = (type: string): string => {
  const t = (type || '').toLowerCase();
  if (VALID_GARMENT_TYPES.includes(t)) return t;
  if (['trousers', 'pajamas', 'shalwars'].includes(t)) return 'pant';
  if (['kurti', 'kamize', 'pathni', 'jubba'].includes(t)) return 'kurta';
  if (['west-coat'].includes(t)) return 'waistcoat';
  if (['gowne', 'one-pec', 'kaftan'].includes(t)) return 'dress';
  if (['skirts', 'garara', 'sharara'].includes(t)) return 'skirt';
  return 'other';
};
