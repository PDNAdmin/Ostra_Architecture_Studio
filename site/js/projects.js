// Work index data. SAMPLE projects for design review: names, places and figures are believable
// stand-ins until Ostra Studio confirms its own (copy deck rule: nothing unconfirmed is published).
// photo: image path without extension; <path>.jpg (1448w) and <path>-800.jpg are served. Renders are 4:3.
// focus: where the key idea sits in the render (% across, % down); the render develops out from there.
// drawing: a key in PROJECTS (js/drawings.js).
export const PROJECTS_DATA = [
  { slug: 'court-house', job: '2403', name: 'Court House', place: 'Lewes, East Sussex', type: 'new-build', status: 'complete',
    year: '2025', size: '212 m²', drawing: 'courtyard', href: 'case-study.html', photo: 'assets/work/court-house', focus: [34, 24],
    idea: 'Rooms gathered around a court, so every one of them gets the sun.' },
  { slug: 'long-reach', job: '2305', name: 'Long Reach', place: 'Frome, Somerset', type: 'new-build', status: 'complete',
    year: '2024', size: '186 m²', drawing: 'cantilever', photo: 'assets/work/long-reach', focus: [62, 30],
    idea: 'An upper floor that reaches past the house below, toward the view.' },
  { slug: 'mill-lane', job: '2302', name: 'Mill Lane', place: 'Stroud, Gloucestershire', type: 'remodel', status: 'complete',
    year: '2024', size: '164 m²', drawing: 'remodel', photo: 'assets/work/mill-lane', focus: [70, 26],
    idea: 'A low garden wing, so the old house could stay as it was.' },
  { slug: 'albert-terrace', job: '2207', name: '14 Albert Terrace', place: 'Whitstable, Kent', type: 'extension', status: 'complete',
    year: '2023', size: '38 m² added', drawing: 'extension', photo: 'assets/work/albert-terrace', focus: [57, 52],
    idea: 'A glass room that turns a terrace house toward its garden.' },
  { slug: 'orchard-barn', job: '2204', name: 'Orchard Barn', place: 'Ledbury, Herefordshire', type: 'remodel', status: 'complete',
    year: '2023', size: '240 m²', drawing: 'barn', photo: 'assets/work/orchard-barn', focus: [62, 50],
    idea: 'One long room under the old roof, with the oak frame left on show.' },
  { slug: 'ashdown-studio', job: '2203', name: 'Ashdown Studio', place: 'Forest Row, East Sussex', type: 'new-build', status: 'complete',
    year: '2022', size: '32 m²', drawing: 'studio', photo: 'assets/work/ashdown-studio', focus: [47, 22],
    idea: 'A garden studio lit from the north, so the light stays even all day.' },
  { slug: 'hollow-way', job: '2109', name: 'Hollow Way', place: 'Hebden Bridge, West Yorkshire', type: 'new-build', status: 'complete',
    year: '2022', size: '158 m²', drawing: 'slope', photo: 'assets/work/hollow-way', focus: [56, 48],
    idea: 'A house stepped down the slope, so no room sits below ground.' },
  { slug: 'sea-lane', job: '2501', name: 'Sea Lane', place: 'Hastings, East Sussex', type: 'new-build', status: 'progress',
    year: '2026', size: '198 m²', drawing: 'twin', photo: 'assets/work/sea-lane', focus: [48, 42],
    idea: 'Two gables facing the sea, joined by a glass link.' },
];

export const TYPE_LABEL = { 'new-build': 'New build', remodel: 'Remodel', extension: 'Extension' };
