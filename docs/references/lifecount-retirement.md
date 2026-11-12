# LifeCount retirement assumptions

Research date: 2026-11-09.

LifeCount uses retirement age only to place a visual boundary on the life-stage timeline. It is not a pension eligibility calculator and does not account for occupation, contribution history, retirement route, disability, early retirement, partial retirement, regional rules, or future policy changes. The selected gender is a display input for this estimate; it is not saved.

The preset templates end with an open-ended `work` stage. At render time:

1. The retirement birthday is calculated from the selected birthday and retirement age.
2. The work stage ends on the day before that birthday.
3. A `retirement` stage starts on that birthday and remains open-ended.
4. Cells after the current date keep the stage color but are rendered with a grayer translucent treatment.

## Assumptions by preset family

| Preset family | Not specified | Female | Male | Why this visual boundary |
|---|---:|---:|---:|---|
| China, undergraduate or graduate path | 60 | 58 | 63 | Uses the simplified 60 baseline with the post-reform 58/63 upper values for the selected paths. |
| China, upper-secondary vocational path | 60 | 55 | 63 | Uses the same 60/63 baseline while representing the lower 55 boundary commonly associated with the vocational route. |
| United States | 67 | 67 | 67 | Uses 67 as a common full-retirement-age reference. |
| United Kingdom | 67 | 67 | 67 | Uses 67 as a common state-pension-age reference. |
| France | 64 | 64 | 64 | Uses 64 as a common legal-retirement-age reference. |
| Russia | 62 | 60 | 65 | Uses the 60/65 age schedule. |
| Japan | 65 | 65 | 65 | Uses 65 as the common pension-start reference. |
| India | 60 | 60 | 60 | Uses 60 as a simple illustrative boundary. |

These values exist to make the long-range view readable. They should be reviewed before using the page to support a real financial, immigration, employment, or retirement decision. Country-level retirement rules can vary by birth cohort, scheme, occupation, and individual contribution history.

## Rendering contract

- Past and current cells use the full stage color family.
- Future cells use a 34% stage-color mix with a gray background so the stage remains identifiable while clearly reading as future.
- Future DOM cells also use a dashed border.
- The stage drawer, legend, ARIA labels, and native titles all use the derived retirement stage.
