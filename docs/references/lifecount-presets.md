# LifeCount global life-stage presets

Research date: 2026-11-09.

These presets model representative education and work paths. They are not personal biographies, population averages, or claims that one path represents an entire country. Age intervals use `[startAge, endAge)`. Every template ends with an illustrative open-ended work stage; at render time LifeCount closes that stage on the day before the selected retirement age and derives a separate retirement stage.

Source URLs and confidence notes were generated during a research session in ChatGPT and retained here for later review. Before adding a preset for a new country or updating a disputed age boundary, check the primary source again.

Retirement ages are deliberately simplified visual assumptions rather than legal or financial advice. See [lifecount-retirement.md](lifecount-retirement.md) for the values, derivation rules, and limitations.

## 中国 · China

### `cn-undergraduate-work`

**普通高中→本科→工作 / General secondary → bachelor → work**

Confidence: `high`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–12 | `primary` | `blue` |
| 初中 / Lower secondary | 12–15 | `middle` | `purple` |
| 高中 / Upper secondary | 15–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–22 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 22+ | `work` | `red` |

Basis: 小学通常6岁入学、六三三学制；小学+初中9年义务教育；普通高中与中职是不同高中阶段路径。

Caveat: 小学可因地区和入学截止日于6或7岁开始；5+4等学制、五年制专科、专升本、非连续教育均未覆盖；成年工作段仅为示意。

### `cn-academic-graduate`

**普通高中→本科→硕士→工作 / General secondary → bachelor → master → work**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–12 | `primary` | `blue` |
| 初中 / Lower secondary | 12–15 | `middle` | `purple` |
| 高中 / Upper secondary | 15–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–22 | `undergraduate` | `orange` |
| 研究生 / Graduate study | 22–25 | `graduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 25+ | `work` | `red` |

Basis: 小学通常6岁入学、六三三学制；小学+初中9年义务教育；普通高中与中职是不同高中阶段路径。

Caveat: 小学可因地区和入学截止日于6或7岁开始；5+4等学制、五年制专科、专升本、非连续教育均未覆盖；成年工作段仅为示意。

### `cn-secondary-vocational`

**初中→中职→工作 / Lower secondary → vocational school → work**

Confidence: `high`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–12 | `primary` | `blue` |
| 初中 / Lower secondary | 12–15 | `middle` | `purple` |
| 中等职业教育 / Upper-secondary vocational education | 15–18 | `upper-secondary-vocational` | `pink` |
| 工作阶段（假设） / Working life (assumed) | 18+ | `work` | `red` |

Basis: 小学通常6岁入学、六三三学制；小学+初中9年义务教育；普通高中与中职是不同高中阶段路径。

Caveat: 小学可因地区和入学截止日于6或7岁开始；5+4等学制、五年制专科、专升本、非连续教育均未覆盖；成年工作段仅为示意。

#### Sources

- https://www.moe.gov.cn/jyb_xxgk/xxgk_jyta/jyta_jijiaosi/201901/t20190103_365791.html
- https://www.moe.gov.cn/srcsite/A06/jcys_jyzb/202502/t20250207_1177647.html
- https://www.moe.gov.cn/jyb_sjzl/sjzl_zcfg/zcfg_jyfl/202204/t20220421_620064.html
- https://www.moe.gov.cn/srcsite/A07/moe_953/201212/t20121217_146273.html

## 美国 · United States

### `us-bachelor-work`

**K–12→四年制本科→工作 / K–12 → four-year college → work**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 学前期 / Preschool years | 3–5 | `preschool` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 5–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–14 | `middle` | `purple` |
| 高中 / Upper secondary | 14–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–22 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 22+ | `work` | `red` |

Basis: K-12 常以5岁 kindergarten、约6岁开始一年级、18岁完成12年级为近似；4年本科或2年副学士是常见高教形式。

Caveat: 各州强制入学/离校年龄不同；学区的小学/初中/高中分界可能为K-5/6-8/9-12、K-6/7-8/9-12等。社区学院转学不保证学分全部抵扣。

### `us-community-college-transfer`

**K–12→社区学院→转入本科 / K–12 → community college → bachelor transfer**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 学前期 / Preschool years | 3–5 | `preschool` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 5–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–14 | `middle` | `purple` |
| 高中 / Upper secondary | 14–18 | `high` | `pink` |
| 专科／副学士 / Associate / short-cycle degree | 18–20 | `associate` | `orange` |
| 本科 / Bachelor degree | 20–22 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 22+ | `work` | `red` |

Basis: K-12 常以5岁 kindergarten、约6岁开始一年级、18岁完成12年级为近似；4年本科或2年副学士是常见高教形式。

Caveat: 各州强制入学/离校年龄不同；学区的小学/初中/高中分界可能为K-5/6-8/9-12、K-6/7-8/9-12等。社区学院转学不保证学分全部抵扣。

### `us-high-school-work`

**K–12→直接工作 / K–12 → direct employment**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 学前期 / Preschool years | 3–5 | `preschool` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 5–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–14 | `middle` | `purple` |
| 高中 / Upper secondary | 14–18 | `high` | `pink` |
| 工作阶段（假设） / Working life (assumed) | 18+ | `work` | `red` |

Basis: K-12 常以5岁 kindergarten、约6岁开始一年级、18岁完成12年级为近似；4年本科或2年副学士是常见高教形式。

Caveat: 各州强制入学/离校年龄不同；学区的小学/初中/高中分界可能为K-5/6-8/9-12、K-6/7-8/9-12等。社区学院转学不保证学分全部抵扣。

#### Sources

- https://nces.ed.gov/programs/statereform/tab1_2-2023.asp
- https://educationusa.state.gov/your-5-steps-us-study/research-your-options/undergraduate/what-us-undergraduate-student
- https://educationusa.state.gov/your-5-steps-us-study/research-your-options/community-college/what-us-community-college-student

## 法国 · France

### `fr-licence-work`

**普通高中→Licence→工作 / General lycée → licence → work**

Confidence: `high`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–15 | `middle` | `purple` |
| 高中 / Upper secondary | 15–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–21 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 21+ | `work` | `red` |

Basis: 3岁开始义务教育；maternelle 3–6、小学6–11、collège 11–15、lycée 15–18；16–18岁有培训/教育参与义务。Licence 3年，master 2年；BTS常见2年。

Caveat: 2岁入幼儿学校少量存在；职业高中CAP等不总是3年；学位、预科和转轨各异；未必18岁即就业。

### `fr-licence-master`

**普通高中→Licence→Master / General lycée → licence → master**

Confidence: `high`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–15 | `middle` | `purple` |
| 高中 / Upper secondary | 15–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–21 | `undergraduate` | `orange` |
| 研究生 / Graduate study | 21–23 | `graduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 23+ | `work` | `red` |

Basis: 3岁开始义务教育；maternelle 3–6、小学6–11、collège 11–15、lycée 15–18；16–18岁有培训/教育参与义务。Licence 3年，master 2年；BTS常见2年。

Caveat: 2岁入幼儿学校少量存在；职业高中CAP等不总是3年；学位、预科和转轨各异；未必18岁即就业。

### `fr-vocational-bts`

**职业高中→BTS→工作 / Vocational lycée → BTS → work**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–15 | `middle` | `purple` |
| 中等职业教育 / Upper-secondary vocational education | 15–18 | `upper-secondary-vocational` | `pink` |
| 高等职业教育 / Postsecondary vocational education | 18–20 | `tertiary-vocational` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 20+ | `work` | `red` |

Basis: 3岁开始义务教育；maternelle 3–6、小学6–11、collège 11–15、lycée 15–18；16–18岁有培训/教育参与义务。Licence 3年，master 2年；BTS常见2年。

Caveat: 2岁入幼儿学校少量存在；职业高中CAP等不总是3年；学位、预科和转轨各异；未必18岁即就业。

#### Sources

- https://www.education.gouv.fr/l-inscription-l-ecole-maternelle-8651
- https://eduscol.education.gouv.fr/4857/table-school-system-structure
- https://eduscol.education.gouv.fr/5301/l-obligation-de-formation
- https://www.onisep.fr/formation/apres-le-bac-les-etudes-superieures/quelles-etudes-apres-le-bac

## 英国 · United Kingdom

### `uk-england-alevel-bachelor`

**英格兰：A-level→本科 / England: A levels → bachelor**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 学前期 / Preschool years | 3–4 | `preschool` | `cyan` |
| 学前衔接班 / Reception | 4–5 | `reception` | `green` |
| 小学 / Primary school | 5–11 | `primary` | `blue` |
| 中学 / Secondary school | 11–16 | `secondary` | `purple` |
| 高中后两年 / Sixth form / post-16 study | 16–18 | `sixth-form` | `pink` |
| 本科 / Bachelor degree | 18–21 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 21+ | `work` | `red` |

Basis: 英格兰通常4岁开始Reception，5岁进入Year 1；11–16岁中学、16–18岁A-level/同等课程；英格兰至18岁需教育或培训。苏格兰通常约5岁入小学并读7年，学士多4年。

Caveat: 英国不是单一学制。英格兰和苏格兰用不同预设；威尔士与北爱尔兰不应从这些预设推断。英格兰16–18岁的参与义务并非在校义务。

### `uk-england-tlevel-work`

**英格兰：T Level→工作 / England: T Level → work**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 学前期 / Preschool years | 3–4 | `preschool` | `cyan` |
| 学前衔接班 / Reception | 4–5 | `reception` | `green` |
| 小学 / Primary school | 5–11 | `primary` | `blue` |
| 中学 / Secondary school | 11–16 | `secondary` | `purple` |
| 中等职业教育 / Upper-secondary vocational education | 16–18 | `upper-secondary-vocational` | `pink` |
| 工作阶段（假设） / Working life (assumed) | 18+ | `work` | `red` |

Basis: 英格兰通常4岁开始Reception，5岁进入Year 1；11–16岁中学、16–18岁A-level/同等课程；英格兰至18岁需教育或培训。苏格兰通常约5岁入小学并读7年，学士多4年。

Caveat: 英国不是单一学制。英格兰和苏格兰用不同预设；威尔士与北爱尔兰不应从这些预设推断。英格兰16–18岁的参与义务并非在校义务。

### `uk-scotland-bachelor`

**苏格兰：中学→四年制本科 / Scotland: secondary → four-year bachelor**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–5 | `kindergarten` | `green` |
| 小学 / Primary school | 5–12 | `primary` | `blue` |
| 中学 / Secondary school | 12–16 | `secondary` | `purple` |
| 高中 / Upper secondary | 16–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–22 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 22+ | `work` | `red` |

Basis: 英格兰通常4岁开始Reception，5岁进入Year 1；11–16岁中学、16–18岁A-level/同等课程；英格兰至18岁需教育或培训。苏格兰通常约5岁入小学并读7年，学士多4年。

Caveat: 英国不是单一学制。英格兰和苏格兰用不同预设；威尔士与北爱尔兰不应从这些预设推断。英格兰16–18岁的参与义务并非在校义务。

#### Sources

- https://www.gov.uk/schools-admissions/school-starting-age
- https://www.gov.uk/know-when-you-can-leave-school
- https://education.gov.scot/parentzone/my-child/primary-school/
- https://discoveruni.gov.uk/is-uni-for-me/about-higher-education/
- https://www.gov.uk/government/publications/introduction-of-t-levels/introduction-of-t-levels

## 俄罗斯 · Russia

### `ru-eleven-year-bachelor`

**11年制普通学校→本科 / 11-year general school → bachelor**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–7 | `kindergarten` | `green` |
| 小学 / Primary school | 7–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–16 | `middle` | `purple` |
| 高中 / Upper secondary | 16–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–22 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 22+ | `work` | `red` |

Basis: 通常7岁开始第1年级；1–4年级小学，5–9年级基础普通教育，10–11年级中等普通教育。可在9年级后进入中等职业教育。传统本科4年、专门人才5年、硕士2年。

Caveat: 允许约6岁半至8岁入学，毕业年龄随入学年龄变化；职业院校按9年级/11年级起点和专业学制不同；高等教育学位结构正在调整，不将原有分级描述视为未来永久不变。

### `ru-eleven-year-specialist`

**11年制普通学校→专家学位 / 11-year general school → specialist degree**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–7 | `kindergarten` | `green` |
| 小学 / Primary school | 7–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–16 | `middle` | `purple` |
| 高中 / Upper secondary | 16–18 | `high` | `pink` |
| 专家学位课程 / Specialist degree | 18–23 | `specialist` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 23+ | `work` | `red` |

Basis: 通常7岁开始第1年级；1–4年级小学，5–9年级基础普通教育，10–11年级中等普通教育。可在9年级后进入中等职业教育。传统本科4年、专门人才5年、硕士2年。

Caveat: 允许约6岁半至8岁入学，毕业年龄随入学年龄变化；职业院校按9年级/11年级起点和专业学制不同；高等教育学位结构正在调整，不将原有分级描述视为未来永久不变。

### `ru-after-grade9-vocational`

**9年级后→中等职业教育 / After grade 9 → secondary vocational college**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–7 | `kindergarten` | `green` |
| 小学 / Primary school | 7–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–16 | `middle` | `purple` |
| 中等职业教育 / Upper-secondary vocational education | 16–20 | `upper-secondary-vocational` | `pink` |
| 工作阶段（假设） / Working life (assumed) | 20+ | `work` | `red` |

Basis: 通常7岁开始第1年级；1–4年级小学，5–9年级基础普通教育，10–11年级中等普通教育。可在9年级后进入中等职业教育。传统本科4年、专门人才5年、硕士2年。

Caveat: 允许约6岁半至8岁入学，毕业年龄随入学年龄变化；职业院校按9年级/11年级起点和专业学制不同；高等教育学位结构正在调整，不将原有分级描述视为未来永久不变。

#### Sources

- https://www.alberta.ca/iqas-education-guide-russia
- https://www.consultant.ru/document/cons_doc_LAW_140174/66c0c83e63d34f08870033f56479217971de7ae4/
- https://www7.minobrnauki.gov.ru/en/rhes/
- https://ncpa.ru/en/accreditation/higher-education-in-russia.html

## 日本 · Japan

### `jp-university-work`

**高中→四年制大学→工作 / High school → four-year university → work**

Confidence: `high`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–12 | `primary` | `blue` |
| 初中 / Lower secondary | 12–15 | `middle` | `purple` |
| 高中 / Upper secondary | 15–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–22 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 22+ | `work` | `red` |

Basis: 6–12岁小学6年、12–15岁初中3年为义务教育；15–18岁高中3年，18–22岁典型4年本科；专门学校通常高中毕业后2年以上；高专15岁起五年制。

Caveat: 年级按4月学年切换，生日年龄区间仅近似。高专五年是15–20岁连续跨中等和高等教育；幼儿园和托育非人人就读。

### `jp-senmon-work`

**高中→专门学校→工作 / High school → professional training college → work**

Confidence: `high`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–12 | `primary` | `blue` |
| 初中 / Lower secondary | 12–15 | `middle` | `purple` |
| 高中 / Upper secondary | 15–18 | `high` | `pink` |
| 高等职业教育 / Postsecondary vocational education | 18–20 | `tertiary-vocational` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 20+ | `work` | `red` |

Basis: 6–12岁小学6年、12–15岁初中3年为义务教育；15–18岁高中3年，18–22岁典型4年本科；专门学校通常高中毕业后2年以上；高专15岁起五年制。

Caveat: 年级按4月学年切换，生日年龄区间仅近似。高专五年是15–20岁连续跨中等和高等教育；幼儿园和托育非人人就读。

### `jp-kosen-work`

**初中→五年制高专→工作 / Junior high → five-year KOSEN → work**

Confidence: `high`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–12 | `primary` | `blue` |
| 初中 / Lower secondary | 12–15 | `middle` | `purple` |
| 五年制高等专门教育 / Integrated technical college | 15–20 | `integrated-technical` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 20+ | `work` | `red` |

Basis: 6–12岁小学6年、12–15岁初中3年为义务教育；15–18岁高中3年，18–22岁典型4年本科；专门学校通常高中毕业后2年以上；高专15岁起五年制。

Caveat: 年级按4月学年切换，生日年龄区间仅近似。高专五年是15–20岁连续跨中等和高等教育；幼儿园和托育非人人就读。

#### Sources

- https://www.mext.go.jp/en/policy/education/overview/
- https://www.mext.go.jp/a_menu/nihongo_kyoiku/kyoiku/handbook/pdf/en_zensho.pdf
- https://www.eduport.mext.go.jp/en/journal/needs-seeds-en/the-appeal-of-colleges-of-technology-and-initiatives-for-overseas-expansion-shinji-toga-professor-and-senior-director-headquarters-international-affairs-national-institute-of-technology/

## 印度 · India

### `in-traditional-10plus2-bachelor3`

**10+2→三年制本科 / 10+2 → three-year bachelor**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–14 | `middle` | `purple` |
| 中学 / Secondary school | 14–16 | `secondary` | `purple` |
| 高中 / Upper secondary | 16–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–21 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 21+ | `work` | `red` |

Basis: 宪法/RTE法规定6–14岁免费义务基础教育。NEP 2020提出3–8/8–11/11–14/14–18岁四阶段课程框架。传统10+2对应6–16岁1–10年级和16–18岁11–12年级；本科多为3年或4年。

Caveat: NEP 5+3+3+4 是课程/教学阶段框架，实施因邦/学校而异，不能等同全国学制均已改造。基础教育受入学时间、邦、校型和专业学制影响。

### `in-nep-four-year-bachelor`

**NEP阶段→四年制本科 / NEP stages → four-year bachelor**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 基础阶段 / Foundational stage | 3–8 | `foundation` | `green` |
| 预备阶段 / Preparatory stage | 8–11 | `preparatory` | `blue` |
| 初中 / Lower secondary | 11–14 | `middle` | `purple` |
| 高中 / Upper secondary | 14–18 | `high` | `pink` |
| 本科 / Bachelor degree | 18–22 | `undergraduate` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 22+ | `work` | `red` |

Basis: 宪法/RTE法规定6–14岁免费义务基础教育。NEP 2020提出3–8/8–11/11–14/14–18岁四阶段课程框架。传统10+2对应6–16岁1–10年级和16–18岁11–12年级；本科多为3年或4年。

Caveat: NEP 5+3+3+4 是课程/教学阶段框架，实施因邦/学校而异，不能等同全国学制均已改造。基础教育受入学时间、邦、校型和专业学制影响。

### `in-class10-iti`

**10年级→ITI职业培训→工作 / Class 10 → ITI vocational training → work**

Confidence: `medium`

| Stage | Ages | ID | Color |
|---|---:|---|---|
| 婴幼儿期 / Early childhood | 0–3 | `early-childhood` | `cyan` |
| 幼儿园 / Kindergarten / preschool | 3–6 | `kindergarten` | `green` |
| 小学 / Primary school | 6–11 | `primary` | `blue` |
| 初中 / Lower secondary | 11–14 | `middle` | `purple` |
| 中学 / Secondary school | 14–16 | `secondary` | `purple` |
| 职业技能培训 / Vocational training | 16–18 | `vocational` | `orange` |
| 工作阶段（假设） / Working life (assumed) | 18+ | `work` | `red` |

Basis: 宪法/RTE法规定6–14岁免费义务基础教育。NEP 2020提出3–8/8–11/11–14/14–18岁四阶段课程框架。传统10+2对应6–16岁1–10年级和16–18岁11–12年级；本科多为3年或4年。

Caveat: NEP 5+3+3+4 是课程/教学阶段框架，实施因邦/学校而异，不能等同全国学制均已改造。基础教育受入学时间、邦、校型和专业学制影响。

#### Sources

- https://www.education.gov.in/sites/upload_files/mhrd/files/NEP_Final_English.pdf
- https://www.education.gov.in/sites/upload_files/mhrd/files/ncf_2023.pdf
- https://dsel.education.gov.in/sites/default/files/update/guidelines_sss.pdf
- https://www.ugc.gov.in/KeyInitiative?ID=yiPY1rgAlvz9%2F1chFf86gg%3D%3D
- https://www.education.gov.in/sites/upload_files/mhrd/files/nep/Thematic_Session_NCrF.pdf
