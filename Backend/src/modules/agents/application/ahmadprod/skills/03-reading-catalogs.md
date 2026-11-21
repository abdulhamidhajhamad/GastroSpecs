# Reading supplier catalogs

Supplier catalogs (often Chinese) mix English and Chinese, and print specs in compact forms. Read every page;
skip covers, maps, table of contents, factory photos and feature close-ups that are not a product.

## Turning printed specs into fields

| Printed | Fields |
|---|---|
| `3N~380V/50Hz` | voltage 380, phases 3, frequencyHz 50 |
| `220V~/50Hz`, `220V/50Hz` | voltage 220, phases 1, frequencyHz 50 |
| `Power: 17kW` | powerKw 17 |
| `14.3kW+14.3kW` (two tanks) | powerKw 28.6, and a spec "Power per tank: 14.3 kW + 14.3 kW" |
| `Energy: LPG/Natural Gas` | energyType gas, gasTypes ["lpg", "natural_gas"] |
| `Rated thermal load: 14.1kW` | powerKw 14.1 (gas heat input) |
| `Dimension: 1040X615X1530(mm)` | widthMm 1040, depthMm 615, heightMm 1530 (W × D × H order as printed) |
| `Net weight: 344kg` | weightKg 344 |
| `Net weight: /` or empty | leave weightKg out |
| `Oil capacity: 45L`, `7.5L+7.5L` | spec "Oil capacity" / "سعة الزيت": "45 L" or "7.5 L + 7.5 L" |
| `Temp. range: 90°C-190°C` | spec "Temperature range" / "نطاق الحرارة": "90–190 °C" |
| `Tray size: 400X600(mm)` | spec "Tray size" / "مقاس الصينية": "400 × 600 mm" |
| Basket / inner pot sizes | spec only if useful to a buyer, e.g. "Basket size": "450 × 350 × 380 mm" |

Electric with gas listed (`Energy: LPG`) on an "electric" title → trust the spec table and mention the
conflict. A machine needing mains power plus gas burners → `dual`.

## Naming

**English**: `<size/capacity> <key feature> <energy> <machine type>`, lower case after the first word,
no brand, no model code. Examples:
- "8-head touchscreen electric pressure fryer"
- "Double-tank auto-lift electric open fryer"
- "Two-tier heated display showcase"
- "Electric chicken breading table"

**Arabic** (Modern Standard Arabic, the way a Gulf/Levant buyer would search):
- "قلاية ضغط كهربائية 8 رؤوس بشاشة لمس"
- "قلاية مفتوحة كهربائية بحوضين ورفع آلي"
- "واجهة عرض ساخنة بطابقين"
- "طاولة تتبيل دجاج كهربائية"

Common words: pressure fryer قلاية ضغط · open fryer قلاية مفتوحة · warming showcase واجهة عرض ساخنة ·
holding cabinet خزانة حفظ ساخنة · chips warmer سخان بطاطا · breading table طاولة تتبيل ·
oil capacity سعة الزيت · temperature range نطاق الحرارة · tray size مقاس الصينية · basket سلة.

**Summaries**: one or two short factual sentences from the catalog's feature list (touchscreen, auto-lift,
built-in oil filtration, castors with brakes…). No marketing claims the catalog doesn't make.

## Photos

For each product give `image: { page, box }`: the PDF page (1-based) and the rectangle around **that
product's photo only**, as fractions of the page: `left`, `top`, `right`, `bottom` between 0 and 1
(0,0 = top-left corner). Rules:
- Frame the whole machine with a small margin; don't include spec tables, captions, other machines or icons.
- Prefer the photo on a plain light background. If the only photo has a dark or busy background, still give
  the box and add a note "background needs cleaning".
- If the supplier's logo or brand is printed on the machine itself, add a note "logo on the machine". The
  admin will clean it.
- If several products share one photo, give the box of the photo for each and note it.
- No usable photo → leave `image` out and say so in `notes`.
