-- Wisconsin Districts Seed
-- All 232 districts + ~600 offices
-- Idempotent: safe to run multiple times

-- ─── Congressional Districts (8) ──────────────────────────────────────────────
INSERT INTO districts (geoid, name, state, district_type) VALUES
  ('5000US5501', 'Wisconsin Congressional District 1', 'WI', 'congressional'),
  ('5000US5502', 'Wisconsin Congressional District 2', 'WI', 'congressional'),
  ('5000US5503', 'Wisconsin Congressional District 3', 'WI', 'congressional'),
  ('5000US5504', 'Wisconsin Congressional District 4', 'WI', 'congressional'),
  ('5000US5505', 'Wisconsin Congressional District 5', 'WI', 'congressional'),
  ('5000US5506', 'Wisconsin Congressional District 6', 'WI', 'congressional'),
  ('5000US5507', 'Wisconsin Congressional District 7', 'WI', 'congressional'),
  ('5000US5508', 'Wisconsin Congressional District 8', 'WI', 'congressional')
ON CONFLICT (geoid) DO NOTHING;

-- ─── State Senate Districts (33) ──────────────────────────────────────────────
INSERT INTO districts (geoid, name, state, district_type) VALUES
  ('SLU5500001', 'Wisconsin State Senate District 1', 'WI', 'state_senate'),
  ('SLU5500002', 'Wisconsin State Senate District 2', 'WI', 'state_senate'),
  ('SLU5500003', 'Wisconsin State Senate District 3', 'WI', 'state_senate'),
  ('SLU5500004', 'Wisconsin State Senate District 4', 'WI', 'state_senate'),
  ('SLU5500005', 'Wisconsin State Senate District 5', 'WI', 'state_senate'),
  ('SLU5500006', 'Wisconsin State Senate District 6', 'WI', 'state_senate'),
  ('SLU5500007', 'Wisconsin State Senate District 7', 'WI', 'state_senate'),
  ('SLU5500008', 'Wisconsin State Senate District 8', 'WI', 'state_senate'),
  ('SLU5500009', 'Wisconsin State Senate District 9', 'WI', 'state_senate'),
  ('SLU5500010', 'Wisconsin State Senate District 10', 'WI', 'state_senate'),
  ('SLU5500011', 'Wisconsin State Senate District 11', 'WI', 'state_senate'),
  ('SLU5500012', 'Wisconsin State Senate District 12', 'WI', 'state_senate'),
  ('SLU5500013', 'Wisconsin State Senate District 13', 'WI', 'state_senate'),
  ('SLU5500014', 'Wisconsin State Senate District 14', 'WI', 'state_senate'),
  ('SLU5500015', 'Wisconsin State Senate District 15', 'WI', 'state_senate'),
  ('SLU5500016', 'Wisconsin State Senate District 16', 'WI', 'state_senate'),
  ('SLU5500017', 'Wisconsin State Senate District 17', 'WI', 'state_senate'),
  ('SLU5500018', 'Wisconsin State Senate District 18', 'WI', 'state_senate'),
  ('SLU5500019', 'Wisconsin State Senate District 19', 'WI', 'state_senate'),
  ('SLU5500020', 'Wisconsin State Senate District 20', 'WI', 'state_senate'),
  ('SLU5500021', 'Wisconsin State Senate District 21', 'WI', 'state_senate'),
  ('SLU5500022', 'Wisconsin State Senate District 22', 'WI', 'state_senate'),
  ('SLU5500023', 'Wisconsin State Senate District 23', 'WI', 'state_senate'),
  ('SLU5500024', 'Wisconsin State Senate District 24', 'WI', 'state_senate'),
  ('SLU5500025', 'Wisconsin State Senate District 25', 'WI', 'state_senate'),
  ('SLU5500026', 'Wisconsin State Senate District 26', 'WI', 'state_senate'),
  ('SLU5500027', 'Wisconsin State Senate District 27', 'WI', 'state_senate'),
  ('SLU5500028', 'Wisconsin State Senate District 28', 'WI', 'state_senate'),
  ('SLU5500029', 'Wisconsin State Senate District 29', 'WI', 'state_senate'),
  ('SLU5500030', 'Wisconsin State Senate District 30', 'WI', 'state_senate'),
  ('SLU5500031', 'Wisconsin State Senate District 31', 'WI', 'state_senate'),
  ('SLU5500032', 'Wisconsin State Senate District 32', 'WI', 'state_senate'),
  ('SLU5500033', 'Wisconsin State Senate District 33', 'WI', 'state_senate')
ON CONFLICT (geoid) DO NOTHING;

-- ─── State Assembly Districts (99) ────────────────────────────────────────────
INSERT INTO districts (geoid, name, state, district_type) VALUES
  ('SLL5500001', 'Wisconsin State Assembly District 1', 'WI', 'state_assembly'),
  ('SLL5500002', 'Wisconsin State Assembly District 2', 'WI', 'state_assembly'),
  ('SLL5500003', 'Wisconsin State Assembly District 3', 'WI', 'state_assembly'),
  ('SLL5500004', 'Wisconsin State Assembly District 4', 'WI', 'state_assembly'),
  ('SLL5500005', 'Wisconsin State Assembly District 5', 'WI', 'state_assembly'),
  ('SLL5500006', 'Wisconsin State Assembly District 6', 'WI', 'state_assembly'),
  ('SLL5500007', 'Wisconsin State Assembly District 7', 'WI', 'state_assembly'),
  ('SLL5500008', 'Wisconsin State Assembly District 8', 'WI', 'state_assembly'),
  ('SLL5500009', 'Wisconsin State Assembly District 9', 'WI', 'state_assembly'),
  ('SLL5500010', 'Wisconsin State Assembly District 10', 'WI', 'state_assembly'),
  ('SLL5500011', 'Wisconsin State Assembly District 11', 'WI', 'state_assembly'),
  ('SLL5500012', 'Wisconsin State Assembly District 12', 'WI', 'state_assembly'),
  ('SLL5500013', 'Wisconsin State Assembly District 13', 'WI', 'state_assembly'),
  ('SLL5500014', 'Wisconsin State Assembly District 14', 'WI', 'state_assembly'),
  ('SLL5500015', 'Wisconsin State Assembly District 15', 'WI', 'state_assembly'),
  ('SLL5500016', 'Wisconsin State Assembly District 16', 'WI', 'state_assembly'),
  ('SLL5500017', 'Wisconsin State Assembly District 17', 'WI', 'state_assembly'),
  ('SLL5500018', 'Wisconsin State Assembly District 18', 'WI', 'state_assembly'),
  ('SLL5500019', 'Wisconsin State Assembly District 19', 'WI', 'state_assembly'),
  ('SLL5500020', 'Wisconsin State Assembly District 20', 'WI', 'state_assembly'),
  ('SLL5500021', 'Wisconsin State Assembly District 21', 'WI', 'state_assembly'),
  ('SLL5500022', 'Wisconsin State Assembly District 22', 'WI', 'state_assembly'),
  ('SLL5500023', 'Wisconsin State Assembly District 23', 'WI', 'state_assembly'),
  ('SLL5500024', 'Wisconsin State Assembly District 24', 'WI', 'state_assembly'),
  ('SLL5500025', 'Wisconsin State Assembly District 25', 'WI', 'state_assembly'),
  ('SLL5500026', 'Wisconsin State Assembly District 26', 'WI', 'state_assembly'),
  ('SLL5500027', 'Wisconsin State Assembly District 27', 'WI', 'state_assembly'),
  ('SLL5500028', 'Wisconsin State Assembly District 28', 'WI', 'state_assembly'),
  ('SLL5500029', 'Wisconsin State Assembly District 29', 'WI', 'state_assembly'),
  ('SLL5500030', 'Wisconsin State Assembly District 30', 'WI', 'state_assembly'),
  ('SLL5500031', 'Wisconsin State Assembly District 31', 'WI', 'state_assembly'),
  ('SLL5500032', 'Wisconsin State Assembly District 32', 'WI', 'state_assembly'),
  ('SLL5500033', 'Wisconsin State Assembly District 33', 'WI', 'state_assembly'),
  ('SLL5500034', 'Wisconsin State Assembly District 34', 'WI', 'state_assembly'),
  ('SLL5500035', 'Wisconsin State Assembly District 35', 'WI', 'state_assembly'),
  ('SLL5500036', 'Wisconsin State Assembly District 36', 'WI', 'state_assembly'),
  ('SLL5500037', 'Wisconsin State Assembly District 37', 'WI', 'state_assembly'),
  ('SLL5500038', 'Wisconsin State Assembly District 38', 'WI', 'state_assembly'),
  ('SLL5500039', 'Wisconsin State Assembly District 39', 'WI', 'state_assembly'),
  ('SLL5500040', 'Wisconsin State Assembly District 40', 'WI', 'state_assembly'),
  ('SLL5500041', 'Wisconsin State Assembly District 41', 'WI', 'state_assembly'),
  ('SLL5500042', 'Wisconsin State Assembly District 42', 'WI', 'state_assembly'),
  ('SLL5500043', 'Wisconsin State Assembly District 43', 'WI', 'state_assembly'),
  ('SLL5500044', 'Wisconsin State Assembly District 44', 'WI', 'state_assembly'),
  ('SLL5500045', 'Wisconsin State Assembly District 45', 'WI', 'state_assembly'),
  ('SLL5500046', 'Wisconsin State Assembly District 46', 'WI', 'state_assembly'),
  ('SLL5500047', 'Wisconsin State Assembly District 47', 'WI', 'state_assembly'),
  ('SLL5500048', 'Wisconsin State Assembly District 48', 'WI', 'state_assembly'),
  ('SLL5500049', 'Wisconsin State Assembly District 49', 'WI', 'state_assembly'),
  ('SLL5500050', 'Wisconsin State Assembly District 50', 'WI', 'state_assembly'),
  ('SLL5500051', 'Wisconsin State Assembly District 51', 'WI', 'state_assembly'),
  ('SLL5500052', 'Wisconsin State Assembly District 52', 'WI', 'state_assembly'),
  ('SLL5500053', 'Wisconsin State Assembly District 53', 'WI', 'state_assembly'),
  ('SLL5500054', 'Wisconsin State Assembly District 54', 'WI', 'state_assembly'),
  ('SLL5500055', 'Wisconsin State Assembly District 55', 'WI', 'state_assembly'),
  ('SLL5500056', 'Wisconsin State Assembly District 56', 'WI', 'state_assembly'),
  ('SLL5500057', 'Wisconsin State Assembly District 57', 'WI', 'state_assembly'),
  ('SLL5500058', 'Wisconsin State Assembly District 58', 'WI', 'state_assembly'),
  ('SLL5500059', 'Wisconsin State Assembly District 59', 'WI', 'state_assembly'),
  ('SLL5500060', 'Wisconsin State Assembly District 60', 'WI', 'state_assembly'),
  ('SLL5500061', 'Wisconsin State Assembly District 61', 'WI', 'state_assembly'),
  ('SLL5500062', 'Wisconsin State Assembly District 62', 'WI', 'state_assembly'),
  ('SLL5500063', 'Wisconsin State Assembly District 63', 'WI', 'state_assembly'),
  ('SLL5500064', 'Wisconsin State Assembly District 64', 'WI', 'state_assembly'),
  ('SLL5500065', 'Wisconsin State Assembly District 65', 'WI', 'state_assembly'),
  ('SLL5500066', 'Wisconsin State Assembly District 66', 'WI', 'state_assembly'),
  ('SLL5500067', 'Wisconsin State Assembly District 67', 'WI', 'state_assembly'),
  ('SLL5500068', 'Wisconsin State Assembly District 68', 'WI', 'state_assembly'),
  ('SLL5500069', 'Wisconsin State Assembly District 69', 'WI', 'state_assembly'),
  ('SLL5500070', 'Wisconsin State Assembly District 70', 'WI', 'state_assembly'),
  ('SLL5500071', 'Wisconsin State Assembly District 71', 'WI', 'state_assembly'),
  ('SLL5500072', 'Wisconsin State Assembly District 72', 'WI', 'state_assembly'),
  ('SLL5500073', 'Wisconsin State Assembly District 73', 'WI', 'state_assembly'),
  ('SLL5500074', 'Wisconsin State Assembly District 74', 'WI', 'state_assembly'),
  ('SLL5500075', 'Wisconsin State Assembly District 75', 'WI', 'state_assembly'),
  ('SLL5500076', 'Wisconsin State Assembly District 76', 'WI', 'state_assembly'),
  ('SLL5500077', 'Wisconsin State Assembly District 77', 'WI', 'state_assembly'),
  ('SLL5500078', 'Wisconsin State Assembly District 78', 'WI', 'state_assembly'),
  ('SLL5500079', 'Wisconsin State Assembly District 79', 'WI', 'state_assembly'),
  ('SLL5500080', 'Wisconsin State Assembly District 80', 'WI', 'state_assembly'),
  ('SLL5500081', 'Wisconsin State Assembly District 81', 'WI', 'state_assembly'),
  ('SLL5500082', 'Wisconsin State Assembly District 82', 'WI', 'state_assembly'),
  ('SLL5500083', 'Wisconsin State Assembly District 83', 'WI', 'state_assembly'),
  ('SLL5500084', 'Wisconsin State Assembly District 84', 'WI', 'state_assembly'),
  ('SLL5500085', 'Wisconsin State Assembly District 85', 'WI', 'state_assembly'),
  ('SLL5500086', 'Wisconsin State Assembly District 86', 'WI', 'state_assembly'),
  ('SLL5500087', 'Wisconsin State Assembly District 87', 'WI', 'state_assembly'),
  ('SLL5500088', 'Wisconsin State Assembly District 88', 'WI', 'state_assembly'),
  ('SLL5500089', 'Wisconsin State Assembly District 89', 'WI', 'state_assembly'),
  ('SLL5500090', 'Wisconsin State Assembly District 90', 'WI', 'state_assembly'),
  ('SLL5500091', 'Wisconsin State Assembly District 91', 'WI', 'state_assembly'),
  ('SLL5500092', 'Wisconsin State Assembly District 92', 'WI', 'state_assembly'),
  ('SLL5500093', 'Wisconsin State Assembly District 93', 'WI', 'state_assembly'),
  ('SLL5500094', 'Wisconsin State Assembly District 94', 'WI', 'state_assembly'),
  ('SLL5500095', 'Wisconsin State Assembly District 95', 'WI', 'state_assembly'),
  ('SLL5500096', 'Wisconsin State Assembly District 96', 'WI', 'state_assembly'),
  ('SLL5500097', 'Wisconsin State Assembly District 97', 'WI', 'state_assembly'),
  ('SLL5500098', 'Wisconsin State Assembly District 98', 'WI', 'state_assembly'),
  ('SLL5500099', 'Wisconsin State Assembly District 99', 'WI', 'state_assembly')
ON CONFLICT (geoid) DO NOTHING;

-- ─── Counties (72) ────────────────────────────────────────────────────────────
INSERT INTO districts (geoid, name, state, district_type) VALUES
  ('WI-COUNTY-adams', 'Adams County', 'WI', 'county'),
  ('WI-COUNTY-ashland', 'Ashland County', 'WI', 'county'),
  ('WI-COUNTY-barron', 'Barron County', 'WI', 'county'),
  ('WI-COUNTY-bayfield', 'Bayfield County', 'WI', 'county'),
  ('WI-COUNTY-brown', 'Brown County', 'WI', 'county'),
  ('WI-COUNTY-buffalo', 'Buffalo County', 'WI', 'county'),
  ('WI-COUNTY-burnett', 'Burnett County', 'WI', 'county'),
  ('WI-COUNTY-calumet', 'Calumet County', 'WI', 'county'),
  ('WI-COUNTY-chippewa', 'Chippewa County', 'WI', 'county'),
  ('WI-COUNTY-clark', 'Clark County', 'WI', 'county'),
  ('WI-COUNTY-columbia', 'Columbia County', 'WI', 'county'),
  ('WI-COUNTY-crawford', 'Crawford County', 'WI', 'county'),
  ('WI-COUNTY-dane', 'Dane County', 'WI', 'county'),
  ('WI-COUNTY-dodge', 'Dodge County', 'WI', 'county'),
  ('WI-COUNTY-door', 'Door County', 'WI', 'county'),
  ('WI-COUNTY-douglas', 'Douglas County', 'WI', 'county'),
  ('WI-COUNTY-dunn', 'Dunn County', 'WI', 'county'),
  ('WI-COUNTY-eau-claire', 'Eau Claire County', 'WI', 'county'),
  ('WI-COUNTY-florence', 'Florence County', 'WI', 'county'),
  ('WI-COUNTY-fond-du-lac', 'Fond du Lac County', 'WI', 'county'),
  ('WI-COUNTY-forest', 'Forest County', 'WI', 'county'),
  ('WI-COUNTY-grant', 'Grant County', 'WI', 'county'),
  ('WI-COUNTY-green', 'Green County', 'WI', 'county'),
  ('WI-COUNTY-green-lake', 'Green Lake County', 'WI', 'county'),
  ('WI-COUNTY-iowa', 'Iowa County', 'WI', 'county'),
  ('WI-COUNTY-iron', 'Iron County', 'WI', 'county'),
  ('WI-COUNTY-jackson', 'Jackson County', 'WI', 'county'),
  ('WI-COUNTY-jefferson', 'Jefferson County', 'WI', 'county'),
  ('WI-COUNTY-juneau', 'Juneau County', 'WI', 'county'),
  ('WI-COUNTY-kenosha', 'Kenosha County', 'WI', 'county'),
  ('WI-COUNTY-kewaunee', 'Kewaunee County', 'WI', 'county'),
  ('WI-COUNTY-la-crosse', 'La Crosse County', 'WI', 'county'),
  ('WI-COUNTY-lafayette', 'Lafayette County', 'WI', 'county'),
  ('WI-COUNTY-langlade', 'Langlade County', 'WI', 'county'),
  ('WI-COUNTY-lincoln', 'Lincoln County', 'WI', 'county'),
  ('WI-COUNTY-manitowoc', 'Manitowoc County', 'WI', 'county'),
  ('WI-COUNTY-marathon', 'Marathon County', 'WI', 'county'),
  ('WI-COUNTY-marinette', 'Marinette County', 'WI', 'county'),
  ('WI-COUNTY-marquette', 'Marquette County', 'WI', 'county'),
  ('WI-COUNTY-menominee', 'Menominee County', 'WI', 'county'),
  ('WI-COUNTY-milwaukee', 'Milwaukee County', 'WI', 'county'),
  ('WI-COUNTY-monroe', 'Monroe County', 'WI', 'county'),
  ('WI-COUNTY-oconto', 'Oconto County', 'WI', 'county'),
  ('WI-COUNTY-oneida', 'Oneida County', 'WI', 'county'),
  ('WI-COUNTY-outagamie', 'Outagamie County', 'WI', 'county'),
  ('WI-COUNTY-ozaukee', 'Ozaukee County', 'WI', 'county'),
  ('WI-COUNTY-pepin', 'Pepin County', 'WI', 'county'),
  ('WI-COUNTY-pierce', 'Pierce County', 'WI', 'county'),
  ('WI-COUNTY-polk', 'Polk County', 'WI', 'county'),
  ('WI-COUNTY-portage', 'Portage County', 'WI', 'county'),
  ('WI-COUNTY-price', 'Price County', 'WI', 'county'),
  ('WI-COUNTY-racine', 'Racine County', 'WI', 'county'),
  ('WI-COUNTY-richland', 'Richland County', 'WI', 'county'),
  ('WI-COUNTY-rock', 'Rock County', 'WI', 'county'),
  ('WI-COUNTY-rusk', 'Rusk County', 'WI', 'county'),
  ('WI-COUNTY-st-croix', 'St. Croix County', 'WI', 'county'),
  ('WI-COUNTY-sauk', 'Sauk County', 'WI', 'county'),
  ('WI-COUNTY-sawyer', 'Sawyer County', 'WI', 'county'),
  ('WI-COUNTY-shawano', 'Shawano County', 'WI', 'county'),
  ('WI-COUNTY-sheboygan', 'Sheboygan County', 'WI', 'county'),
  ('WI-COUNTY-taylor', 'Taylor County', 'WI', 'county'),
  ('WI-COUNTY-trempealeau', 'Trempealeau County', 'WI', 'county'),
  ('WI-COUNTY-vernon', 'Vernon County', 'WI', 'county'),
  ('WI-COUNTY-vilas', 'Vilas County', 'WI', 'county'),
  ('WI-COUNTY-walworth', 'Walworth County', 'WI', 'county'),
  ('WI-COUNTY-washburn', 'Washburn County', 'WI', 'county'),
  ('WI-COUNTY-washington', 'Washington County', 'WI', 'county'),
  ('WI-COUNTY-waukesha', 'Waukesha County', 'WI', 'county'),
  ('WI-COUNTY-waupaca', 'Waupaca County', 'WI', 'county'),
  ('WI-COUNTY-waushara', 'Waushara County', 'WI', 'county'),
  ('WI-COUNTY-winnebago', 'Winnebago County', 'WI', 'county'),
  ('WI-COUNTY-wood', 'Wood County', 'WI', 'county')
ON CONFLICT (geoid) DO NOTHING;

-- ─── Municipalities (20) ──────────────────────────────────────────────────────
INSERT INTO districts (geoid, name, state, district_type) VALUES
  ('WI-MUNI-milwaukee', 'Milwaukee', 'WI', 'municipal'),
  ('WI-MUNI-madison', 'Madison', 'WI', 'municipal'),
  ('WI-MUNI-green-bay', 'Green Bay', 'WI', 'municipal'),
  ('WI-MUNI-kenosha', 'Kenosha', 'WI', 'municipal'),
  ('WI-MUNI-racine', 'Racine', 'WI', 'municipal'),
  ('WI-MUNI-appleton', 'Appleton', 'WI', 'municipal'),
  ('WI-MUNI-waukesha', 'Waukesha', 'WI', 'municipal'),
  ('WI-MUNI-oshkosh', 'Oshkosh', 'WI', 'municipal'),
  ('WI-MUNI-eau-claire', 'Eau Claire', 'WI', 'municipal'),
  ('WI-MUNI-janesville', 'Janesville', 'WI', 'municipal'),
  ('WI-MUNI-west-allis', 'West Allis', 'WI', 'municipal'),
  ('WI-MUNI-la-crosse', 'La Crosse', 'WI', 'municipal'),
  ('WI-MUNI-sheboygan', 'Sheboygan', 'WI', 'municipal'),
  ('WI-MUNI-wauwatosa', 'Wauwatosa', 'WI', 'municipal'),
  ('WI-MUNI-fond-du-lac', 'Fond du Lac', 'WI', 'municipal'),
  ('WI-MUNI-new-berlin', 'New Berlin', 'WI', 'municipal'),
  ('WI-MUNI-wausau', 'Wausau', 'WI', 'municipal'),
  ('WI-MUNI-brookfield', 'Brookfield', 'WI', 'municipal'),
  ('WI-MUNI-beloit', 'Beloit', 'WI', 'municipal'),
  ('WI-MUNI-greenfield', 'Greenfield', 'WI', 'municipal')
ON CONFLICT (geoid) DO NOTHING;

-- ─── Congressional Offices (8) ────────────────────────────────────────────────
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5501' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5502' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5503' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5504' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5505' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5506' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5507' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'U.S. Representative', 'federal', 2, true, 1, '2026-11-03' FROM districts WHERE geoid = '5000US5508' ON CONFLICT DO NOTHING;

-- ─── State Senate Offices (33) — odd=2026, even=2028 ─────────────────────────
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500001' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500002' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500003' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500004' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500005' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500006' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500007' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500008' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500009' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500010' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500011' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500012' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500013' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500014' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500015' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500016' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500017' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500018' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500019' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500020' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500021' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500022' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500023' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500024' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500025' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500026' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500027' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500028' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500029' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500030' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500031' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2028-11-07' FROM districts WHERE geoid = 'SLU5500032' ON CONFLICT DO NOTHING;
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Senator', 'state', 4, true, 1, '2026-11-03' FROM districts WHERE geoid = 'SLU5500033' ON CONFLICT DO NOTHING;

-- ─── Assembly Offices (99) ────────────────────────────────────────────────────
INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
SELECT id, 'Wisconsin State Assembly Representative', 'state', 2, true, 1, '2026-11-03'
FROM districts WHERE geoid LIKE 'SLL5500%' AND district_type = 'state_assembly'
ON CONFLICT DO NOTHING;

-- ─── County Offices (72 counties × 8 offices = 576) ──────────────────────────
-- NOTE: We use a DO block to iterate all county districts rather than 576 individual statements.
-- Each county gets: County Executive (partisan), County Board Chair (nonpartisan),
-- County Sheriff, County Clerk, County Treasurer, District Attorney, Register of Deeds, Clerk of Courts
DO $$
DECLARE
  county_row RECORD;
BEGIN
  FOR county_row IN SELECT id FROM districts WHERE district_type = 'county' AND state = 'WI' LOOP
    INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
    VALUES
      (county_row.id, 'County Executive', 'county', 4, true, 1, '2026-04-07'),
      (county_row.id, 'County Board Chair', 'county', 2, false, 1, '2026-04-07'),
      (county_row.id, 'County Sheriff', 'county', 4, true, 1, '2026-11-03'),
      (county_row.id, 'County Clerk', 'county', 4, true, 1, '2026-11-03'),
      (county_row.id, 'County Treasurer', 'county', 4, true, 1, '2026-11-03'),
      (county_row.id, 'District Attorney', 'county', 4, true, 1, '2026-11-03'),
      (county_row.id, 'Register of Deeds', 'county', 4, true, 1, '2026-11-03'),
      (county_row.id, 'Clerk of Courts', 'county', 4, false, 1, '2026-04-07')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ─── Municipal Offices (20 municipalities × 4 offices = 80) ──────────────────
DO $$
DECLARE
  muni_row RECORD;
BEGIN
  FOR muni_row IN SELECT id FROM districts WHERE district_type = 'municipal' AND state = 'WI' LOOP
    INSERT INTO offices (district_id, title, level, term_years, is_partisan, seats, next_election)
    VALUES
      (muni_row.id, 'Mayor', 'municipal', 4, false, 1, '2027-04-06'),
      (muni_row.id, 'City Council Member (At-Large)', 'municipal', 4, false, 3, '2027-04-06'),
      (muni_row.id, 'City Clerk', 'municipal', 4, false, 1, '2027-04-06'),
      (muni_row.id, 'City Treasurer', 'municipal', 4, false, 1, '2027-04-06')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
