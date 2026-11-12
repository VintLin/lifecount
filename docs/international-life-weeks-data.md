# LifeCount 国际人生周历资料档案

研究日期：2026-11-09
研究范围：中国、法国、英国、俄罗斯、日本、印度
研究目的：在美国资料档案之后，按同一套 LifeCount 字段整理其他预设国家的制度、人口统计和启发性案例。

最新补充核验结果见：[2026-11-10 国际人生阶段数据补充核验记录](international-life-weeks-data-addendum-2026-11-10.md)。该补充记录覆盖首次生育、首次结婚、实际劳动市场退出年龄、离婚婚龄和当前雇主任期，并对本文早期的 `not_verified` 状态进行更新说明。

两组可直接读取的结构化资料：[名人去世时间 JSON](international-celebrity-deaths.json)；[典型人生阶段及事件 JSON](international-life-stages-events.json)。

本文件不是应用功能，也不是跨国排名。教育阶段是代表性年龄模型；法律年龄是制度门槛；婚育、工作、退休和寿命是人口或制度统计。它们不能合并成一条“每个人都应该遵循”的人生时间线。

## 1. 统一口径

| 维度 | 记录方式 |
|---|---|
| 教育路径 | 连续年龄区间，使用左闭右开规则，例如 `6–12` 表示从 6 周岁到 12 周岁生日之前 |
| 法律门槛 | 记录最低资格年龄，并注明国家、地区、选举类型或商品类别 |
| 首次生育 | 优先记录首次活产母亲的 mean；若来源使用 median 或标准化均值，必须保留原类型 |
| 首次结婚 | 区分 mean、median、synthetic cohort mean，以及首婚与全部婚姻 |
| 离婚婚龄 | 只记录已经离婚婚姻的持续时间；无法确认统计总体时使用 `not_verified` |
| 工作任期 | 区分当前雇主任期、已经结束的工作持续时间和实际退出劳动市场年龄 |
| 退休 | 区分实际退出劳动市场、养老金领取年龄和法定退休年龄 |
| 预期寿命 | 使用出生时 period life-table expectancy；不解释为个人死亡日期 |
| 启发性案例 | 单独记录人物或成就，不把人物年龄当成人口统计或成功标准 |

状态值：

- `verified`：来源和统计口径足够清楚，可进入资料档案。
- `conditional`：有来源，但地区、年份或定义需要一并显示。
- `not_verified`：本次没有找到足以确认该具体数值的同口径来源。
- `not_comparable`：存在资料，但定义或统计总体不适合横向比较。

## 2. 六国总览

| 国家 | 代表性教育路径 | 人口统计可用性 | 主要限制 |
|---|---|---|---|
| 中国 | 普通高中→本科→工作；本硕；初中后中职 | 部分可用 | 初婚和寿命年份不一致，工作任期全国同口径值缺失 |
| 法国 | maternelle→小学→collège→lycée→Licence；Licence+Master；BTS | 较好 | 首婚数据为合成队列均值，离婚婚龄和总体寿命待补 |
| 英国 | 必须区分英格兰和苏格兰 | 部分可用 | 婚育和离婚多为英格兰及威尔士，教育按构成国拆分 |
| 俄罗斯 | 4+5+2 普通教育；本科；专家学位；中职 | 寿命和养老金可用 | 婚育、工作任期和实际退休年龄全国同口径值缺失 |
| 日本 | 6+3+3+4；专门学校；五年制高专 | 婚育、寿命和退出年龄可用 | 离婚婚龄和当前雇主任期暂缺同口径值 |
| 印度 | 传统 10+2；NEP 5+3+3+4；ITI | 寿命和法律门槛可用 | 邦级差异大，婚育、养老金和工作任期不宜全国简化 |

## 3. 中国 China

### 3.1 教育路径

| 预设 | 年龄路径 | 性质 |
|---|---|---|
| `cn-undergraduate-work` | 0–3 婴幼儿 → 3–6 幼儿园 → 6–12 小学 → 12–15 初中 → 15–18 普通高中 → 18–22 本科 → 22+ 工作 | 推荐代表路径 |
| `cn-academic-graduate` | 普通高中 → 18–22 本科 → 22–25 研究生 → 25+ 工作 | 研究生路径 |
| `cn-secondary-vocational` | 12–15 初中 → 15–18 中等职业教育 → 18+ 工作 | 职业分流路径 |

小学和初中通常构成九年义务教育。硕士 3 年和毕业后立即工作的部分属于产品建模假设，不是全国统一人生轨迹。

### 3.2 法律与人口统计

| 指标 | 值 | 年份与类型 | 状态 |
|---|---:|---|---|
| 民事成年 | 18 岁 | 法律门槛，《民法典》第 17 条 | verified |
| 普通汽车驾驶 | 18 岁 | C1/C2 驾照最低申请年龄 | conditional |
| 烟酒销售 | 18 岁 | 不得向未成年人销售；不等于统一饮酒年龄 | conditional |
| 女性首次生育 | 27.2 岁 | 2020，mean，女性初育；国家卫健委二次引用 | conditional |
| 男性首次结婚 | 29.38 岁 | 2020，人口普查衍生值，具体总体需复核 | not_verified |
| 女性首次结婚 | 27.95 岁 | 2020，人口普查衍生值，具体总体需复核 | not_verified |
| 离婚婚姻持续时间 | — | 未确认全国同口径数值 | not_verified |
| 当前雇主任期 | — | 未找到可直接对标 OECD 的全国平均或中位数 | not_verified |
| 实际退出劳动市场年龄 | — | 不能用法定退休年龄代替 | not_verified |
| 法定退休年龄 | 男 60→63；女 50→55、55→58 | 2025–2039 渐进式改革，依出生年月和岗位类别 | verified |
| 出生时预期寿命 | 男 75.4、女 80.9、全体 77.9 岁 | 2020，国家统计局生命表 | verified |
| 较新全体预期寿命 | 79.25 岁 | 2025，全国总体；同期性别值未确认 | conditional |

2020 年性别寿命与 2025 年总体寿命不能拼成一个同年度对象。初婚年龄也应保留 `verification_pending_primary_table`，不能把二次引用当成已核实的一手表格。

### 3.3 启发性案例

- 屠呦呦：2015 年获得诺贝尔生理学或医学奖，约 84 岁。
- 该案例表达“重要贡献可以在很晚的年龄被认可”，不构成成功年龄标准。

来源：[中国教育部](https://www.moe.gov.cn/jyb_sjzl/sjzl_fztjgb/202607/t20260706_1442870.html)、[国家卫健委初育年龄报道](https://en.nhc.gov.cn/2024-03/21/c_86295.htm)、[国家统计局生命表资料](https://www.stats.gov.cn/zt_18555/ztsj/jzgj/jzsc2023/202404/P020240417553133577139.pdf)、[延迟法定退休年龄决定](https://www.cncaprc.gov.cn/xxzcfg/770252.jhtml)、[诺贝尔奖资料](https://www.nobelprize.org/prizes/medicine/2015/tu/facts/)。

## 4. 法国 France

### 4.1 教育路径

| 预设 | 年龄路径 | 置信度 |
|---|---|---|
| `fr-licence-work` | 0–3 婴幼儿 → 3–6 maternelle → 6–11 小学 → 11–15 collège → 15–18 lycée → 18–21 Licence → 工作 | high |
| `fr-licence-master` | 普通高中 → 18–21 Licence → 21–23 Master → 工作 | high |
| `fr-vocational-bts` | 15–18 职业高中 → 18–20 BTS → 工作 | medium |

法国从 3 岁开始义务教育；16–18 岁还有继续教育或培训参与义务。BTS 和 CAP 等职业路径不能用同一条两年或三年路径覆盖。

### 4.2 法律与人口统计

| 指标 | 值 | 年份与类型 | 状态 |
|---|---:|---|---|
| 民事成年与通常投票年龄 | 18 岁 | 法律门槛 | verified |
| 普通汽车驾驶 | 17 岁 | B 类驾照取得门槛，2024 年起适用 | verified |
| 酒／烟销售 | 18 岁 | 向未成年人销售限制 | conditional |
| 女性首次生育 | 29.1 岁 | 2023，mean，法国首次分娩女性 | verified |
| 男性首次结婚 | 33.8 岁 | 2022，synthetic cohort mean | conditional |
| 女性首次结婚 | 32.3 岁 | 2022，synthetic cohort mean | conditional |
| 离婚婚姻持续时间 | — | 本次未确认同口径全国值 | not_verified |
| 当前雇主任期 | 10.20 年 | 2024，OECD mean current job tenure，就业者存量 | conditional |
| 实际退出劳动市场年龄 | 男 61.9、女 62.4 岁 | 2024，OECD 估计 | verified |
| 养老金法定年龄 | 最终 64 岁 | 2026 规则，依出生队列 | conditional |
| 出生时预期寿命 | 男 80.3、女 85.9 岁 | 2025，Insee period life table | conditional |
| 全人口预期寿命 | — | 未找到同年同源总体精确值 | not_verified |

### 4.3 启发性案例

- Marie Curie：1903 年获得诺贝尔物理学奖，约 36 岁。
- 她出生于当时俄罗斯帝国统治下的华沙，不能简单描述为“法国出生者”。

来源：[法国教育部幼儿学校](https://www.education.gouv.fr/l-inscription-l-ecole-maternelle-8651)、[Service Public 驾照](https://www.service-public.fr/particuliers/actualites/A14945)、[Insee 首次生育](https://www.insee.fr/fr/statistiques/8608134)、[Insee 首次结婚](https://www.insee.fr/fr/statistiques/7746162)、[Insee 预期寿命](https://www.insee.fr/fr/statistiques/2416631)、[法国退休年龄](https://www.info-retraite.fr/portail-info/sites/PortailInformationnel/home/reforme-des-retraites/reforme-des-retraites---age-le-1.html)、[诺贝尔奖资料](https://www.nobelprize.org/prizes/physics/1903/marie-curie/facts/)。

## 5. 英国 United Kingdom

英国教育必须区分构成国；婚育和离婚数据常见范围是英格兰及威尔士，而寿命可以使用全英国生命表。

### 5.1 教育路径

| 预设 | 年龄路径 | 适用范围 |
|---|---|---|
| `uk-england-alevel-bachelor` | 0–3 婴幼儿 → 3–4 学前 → 4–5 Reception → 5–11 小学 → 11–16 中学 → 16–18 A-level → 18–21 本科 | 英格兰 |
| `uk-england-tlevel-work` | 0–3 婴幼儿 → 3–4 学前 → 4–5 Reception → 5–11 小学 → 11–16 中学 → 16–18 T Level → 工作 | 英格兰 |
| `uk-scotland-bachelor` | 0–3 婴幼儿 → 3–5 学前 → 5–12 小学 → 12–16 中学 → 16–18 高中后期 → 18–22 本科 | 苏格兰 |

16–18 岁在英格兰仍有教育或培训参与要求，但不一定继续在学校学习。北爱尔兰不能直接套用英格兰 Reception 路径。

### 5.2 法律与人口统计

| 指标 | 值 | 年份与类型 | 状态 |
|---|---:|---|---|
| 成年 | 英格兰通常 18 岁；苏格兰部分法律能力更早 | 法域差异 | conditional |
| 英国议会投票 | 18 岁 | 苏格兰议会及地方选举可为 16 岁 | conditional |
| 普通汽车驾驶 | 17 岁 | 通常门槛 | conditional |
| 酒／烟购买 | 18 岁 | 零售购买门槛 | conditional |
| 女性首次生育 | 29.4 岁 | 2024，standardised mean，英格兰及威尔士首次活产 | conditional |
| 男性首次结婚 | 32.7 岁 | 2022，median，英格兰及威尔士 | conditional |
| 女性首次结婚 | 31.2 岁 | 2022，median，英格兰及威尔士 | conditional |
| 离婚婚姻持续时间 | 13.0 年 | 2025，median，英格兰及威尔士当年离婚的异性婚姻 | conditional |
| 当前雇主任期 | — | OECD 返回值不适合作为真实平均任期 | not_verified |
| 实际退出劳动市场年龄 | 男 63.8、女 63.1 岁 | 2024，OECD 估计 | verified |
| 国家养老金年龄 | 66→67 岁 | 2026–2028 分阶段上调，依出生日期 | verified |
| 出生时预期寿命 | 男 79.1、女 83.0 岁 | 2022–2024，英国全境三年期生命表 | verified |

地区生命表差异也应保留：同一时期英格兰约男 79.4、女 83.3；苏格兰约男 77.1、女 81.1；威尔士约男 78.3、女 82.2；北爱尔兰约男 78.8、女 82.6。

### 5.3 启发性案例

- 石黑一雄：2017 年获得诺贝尔文学奖，约 62 岁；出生于日本长崎，后移居英国。

来源：[英格兰国家课程](https://www.gov.uk/national-curriculum/overview)、[苏格兰选举资格](https://www.gov.uk/elections-in-the-uk/scottish-parliament)、[ONS 首次生育](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/bulletins/birthsummarytablesenglandandwales/2024refreshedpopulations/previous)、[ONS 首次婚姻](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/marriagecohabitationandcivilpartnerships/bulletins/marriagesinenglandandwalesprovisional/2021and2022)、[ONS 离婚婚龄](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/divorce/bulletins/divorcesinenglandandwales/2024and2025)、[ONS 生命表](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/lifeexpectancies/bulletins/nationallifetablesunitedkingdom/2022to2024)、[养老金年龄](https://www.gov.uk/government/publications/state-pension-age-timetable/state-pension-age-timetable)。

## 6. 俄罗斯 Russia

### 6.1 教育路径

| 预设 | 年龄路径 | 置信度 |
|---|---|---|
| `ru-eleven-year-bachelor` | 0–3 婴幼儿 → 3–7 幼儿教育近似期 → 7–11 小学 → 11–16 基础普通教育 → 16–18 高中 → 18–22 本科 | medium |
| `ru-eleven-year-specialist` | 11 年制普通学校 → 18–23 专家学位课程 → 工作 | medium |
| `ru-after-grade9-vocational` | 7–11 小学 → 11–16 基础普通教育 → 16–20 中等职业教育 → 工作 | medium |

普通学校常见 4+5+2 结构；7 岁入学是名义近似，不代表所有人实际在 7 岁入学。

### 6.2 法律与人口统计

| 指标 | 值 | 年份与类型 | 状态 |
|---|---:|---|---|
| 民事成年 | 18 岁 | 一般法律门槛 | conditional |
| 投票 | 18 岁 | 一般选举资格年龄 | conditional |
| 普通汽车驾驶 | 18 岁 | B 类通常资格年龄 | conditional |
| 酒／烟销售 | 通常 18 岁 | 商品和现行交易规则需再核验 | conditional |
| 女性首次生育 | — | 地区资料不能替代全国值 | not_verified |
| 首次结婚 | — | 未确认全国 mean/median | not_verified |
| 离婚婚姻持续时间 | — | 未取得全国同口径值 | not_verified |
| 当前雇主任期 | — | 未核实全国平均任期 | not_verified |
| 实际退出劳动市场年龄 | — | 未取得 OECD 定义下可靠可比值 | not_verified |
| 法定养老金年龄 | 男 64、女 59 岁 | 2026；2028 年起一般目标男 65、女 60 | verified |
| 出生时预期寿命 | 男 68.0、女 78.7、全体 73.4 岁 | 2023，俄罗斯统计局生命表 | verified |

巴什科尔托斯坦地区 2023 年初育平均年龄 26.3 岁只代表该共和国，不能填入俄罗斯全国字段。

### 6.3 启发性案例

- Yuri Gagarin：1961-04-12 完成首次载人太空飞行，约 27 岁。
- 该事件属于苏联时期成就，归档时应保留历史政治实体说明。

来源：[俄罗斯社会基金养老金年龄](https://sfr.gov.ru/grazhdanam/pensionnoe_obespechenie/strahovaya_pensiya_po_starosti/usloviya_naznacheniya/povyshenie_pensionnogo_vozrasta_stazha_ipk/)、[俄罗斯统计局性别统计](https://rosstat.gov.ru/storage/mediabank/Wum_Man_2024.pdf)、[俄罗斯统计概览](https://rosstat.gov.ru/storage/mediabank/Rossia_2025.pdf)、[地区初育资料](https://02.rosstat.gov.ru/storage/mediabank/press_Den-materi-v-Rossii_2024.pdf)、[NASA Gagarin 资料](https://science.nasa.gov/resource/yuri-gagarin-first-human-in-space/)。

## 7. 日本 Japan

### 7.1 教育路径

| 预设 | 年龄路径 | 置信度 |
|---|---|---|
| `jp-university-work` | 0–3 婴幼儿 → 3–6 幼儿园近似期 → 6–12 小学 → 12–15 初中 → 15–18 高中 → 18–22 大学 → 工作 | high |
| `jp-senmon-work` | 高中 → 18–20 专门学校 → 工作 | high |
| `jp-kosen-work` | 初中 → 15–20 五年制高等专门学校 → 工作 | high |

日本 6+3+3+4 体系中，小学和初中构成九年义务教育。五年制高专从约 15 岁开始，不能简单归入普通高中或本科。

### 7.2 法律与人口统计

| 指标 | 值 | 年份与类型 | 状态 |
|---|---:|---|---|
| 成年 | 18 岁 | 2022 年由 20 岁下调 | verified |
| 投票 | 18 岁 | 国政与地方选举一般门槛 | verified |
| 普通汽车驾驶 | 18 岁 | 普通汽车驾驶资格 | conditional |
| 饮酒／烟草 | 20 岁 | 成年年龄降低后仍保持 20 岁 | verified |
| 女性首次生育 | 31.0 岁 | 2024，mean，第一个孩子出生时母亲年龄 | verified |
| 男性首次结婚 | 31.1 岁 | 2024，mean，首次婚姻男性 | conditional |
| 女性首次结婚 | 29.8 岁 | 2024，mean，首次婚姻女性 | conditional |
| 离婚婚姻持续时间 | — | 有分组资料，但未确认全国精确 mean/median | not_comparable |
| 当前雇主任期 | — | 厚劳省有勤续年数统计，本次未核实统一总体值 | not_verified |
| 实际退出劳动市场年龄 | 男 66.9、女 67.4 岁 | 2024，OECD 估计 | verified |
| 公共养老金领取 | 原则上 65 岁 | 老龄基础养老金一般起点，不等于停止工作 | verified |
| 出生时预期寿命 | 男 81.35、女 87.33 岁 | 2025，厚劳省简易生命表 | verified |
| 全人口预期寿命 | — | 不用男女值简单平均 | not_verified |

### 7.3 启发性案例

- 山中伸弥：2012 年获得诺贝尔生理学或医学奖，约 50 岁。
- 日本案例清楚说明成年、饮酒年龄、养老金年龄和实际退出劳动市场年龄是不同字段。

来源：[日本文部科学省学制](https://www.mext.go.jp/en/policy/education/overview/)、[日本政府成年说明](https://www.gov-online.go.jp/article/201808/entry-7947.html)、[厚劳省人口动态统计](https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/houkoku24/dl/all.pdf)、[厚劳省简易生命表](https://www.mhlw.go.jp/content/12602000/001749651.pdf)、[日本年金机构](https://www.nenkin.go.jp/service/jukyu/seido/roureinenkin/jukyu-yoken/20150401-02.html)、[诺贝尔奖资料](https://www.nobelprize.org/prizes/medicine/2012/yamanaka/facts/)。

## 8. 印度 India

### 8.1 教育路径

| 预设 | 年龄路径 | 置信度 |
|---|---|---|
| `in-traditional-10plus2-bachelor3` | 0–3 婴幼儿 → 3–6 学前 → 6–11 小学 → 11–14 初中 → 14–16 中学 → 16–18 高中 → 18–21 三年本科 | medium |
| `in-nep-four-year-bachelor` | 0–3 婴幼儿 → 3–8 Foundation → 8–11 Preparatory → 11–14 Middle → 14–18 Secondary → 18–22 本科 | medium |
| `in-class10-iti` | 0–3 婴幼儿 → 3–6 学前 → 6–11 小学 → 11–14 初中 → 14–16 中学 → 16+ ITI 职业技能培训 → 工作 | medium |

NEP 5+3+3+4 是课程与教学框架，不代表所有邦和学校已经完成同样的制度转换。三年本科和四年本科并存，ITI 项目时长也会因课程而不同。

### 8.2 法律与人口统计

| 指标 | 值 | 年份与类型 | 状态 |
|---|---:|---|---|
| 民事成年 | 18 岁 | 一般法律门槛 | conditional |
| 投票 | 18 岁 | 国家和邦选举通常适用 | conditional |
| 普通汽车驾驶 | 18 岁 | 普通机动车驾驶资格 | conditional |
| 合法饮酒 | 18、21、25 岁或禁酒 | 各邦和中央直辖区不同 | not_comparable |
| 烟草购买 | 18 岁 | COTPA 2003 禁止向未满 18 岁者销售 | conditional |
| 法定结婚最低年龄 | 女 18、男 21 岁 | 法律门槛，不是实际初婚年龄 | verified |
| 女性首次活产 | — | NFHS 有资料，本次未确认指定总体的精确全国值 | not_verified |
| 男性／女性首次结婚 | — | NFHS 有资料，本次未确认同口径性别值 | not_verified |
| 离婚婚姻持续时间 | — | 未确认统一全国值 | not_verified |
| 当前雇主任期 | — | 正规／非正规就业结构使比较困难 | not_verified |
| 实际退出劳动市场年龄 | 男 56.1、女 54.8 岁 | 2024，OECD 估计；不等于所有人的退休年龄 | conditional |
| 法定养老金年龄 | — | 公私部门和养老金制度差异大 | not_comparable |
| 出生时预期寿命 | 男 68.5、女 72.5、全体 70.3 岁 | 2019–2023，SRS 简略生命表 | verified |

NFHS-5 的一个可用但不同口径的指标是：2019–2021 年调查中，20–24 岁女性约 23.3% 曾在 18 岁之前结婚。这是比例，不是初婚年龄中位数，不能反推全国首婚年龄。

### 8.3 启发性案例

- Rabindranath Tagore：1913 年获得诺贝尔文学奖，约 52 岁。
- 该案例属于英国殖民统治时期的印度历史人物，时间背景应保留。

来源：[印度教育部 NEP 结构](https://dsel.education.gov.in/sites/default/files/update/Shiksha%20Shabdkosh_03.09.2022.pdf)、[NFHS-5](https://www.mohfw.gov.in/sites/default/files/NFHS-5_Phase-II_0.pdf)、[印度生命表](https://censusindia.gov.in/nada/index.php/catalog/46175/download/50423/SRS-Abridged_Life_Tables_2019-2023.pdf)、[印度烟草销售限制](https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2101735&lang=2&reg=48)、[诺贝尔奖资料](https://www.nobelprize.org/prizes/literature/1913/tagore/facts/)。

## 9. 各国名人出生与去世时间参考

这一组资料用于在 LifeCount 的人生周格子中提供历史人物参照点。它不是“成功年龄表”，也不是国家人口统计。每条记录包含人物类型、出生/去世年份、日期精度和来源。

日期精度：

- `day`：可以记录到公历日。
- `year_only`：只确认年份，适合古代人物或日期存在历法争议的情况。
- `circa`：年份本身是约数。

### 9.1 中国 China

| 人物 | 类型 | 出生 | 去世 | 去世时间 | 日期精度 | 简介 |
|---|---|---:|---|---|---|---|
| [屈原](https://zh.wikipedia.org/wiki/%E5%B1%88%E5%8E%9F) | 先秦诗人、政治人物 | 约前 340 | 约前 278 | — | circa/year_only | 《离骚》作者，端午文化的重要历史人物 |
| [李白](https://en.wikipedia.org/wiki/Li_Bai) | 唐代诗人 | 701 | 762 | — | year_only | “诗仙”；去世日期和死因均无可靠日级记录 |
| [杜甫](https://en.wikipedia.org/wiki/Du_Fu) | 唐代诗人 | 712 | 770 | — | year_only | “诗圣”；唐诗重要代表 |
| [苏轼](https://en.wikipedia.org/wiki/Su_Shi) | 宋代文学家、书画家 | 1037 | 1101 | — | year_only | 诗、词、散文和书法代表人物 |
| [鲁迅](https://en.wikipedia.org/wiki/Lu_Xun) | 现代作家、思想家 | 1881-09-25 | 1936-10-19 | — | day | 中国现代文学的重要人物 |
| [钱学森](https://en.wikipedia.org/wiki/Qian_Xuesen) | 科学家、航天事业奠基者 | 1911-12-11 | 2009-10-31 | — | day | 中国航天与系统科学的重要人物 |
| [张国荣](https://en.wikipedia.org/wiki/Leslie_Cheung) | 香港歌手、演员、词曲作者 | 1956-09-12 | 2003-04-01 | 18:43 HKT | day | 华语流行文化和电影的重要人物 |
| [张雪峰](https://zh.wikipedia.org/wiki/%E5%BC%A0%E9%9B%AA%E5%B3%B0) | 教育博主、升学规划讲师 | 1984-05-18 | 2026-03-24 | 15:50，苏州当地时间 | day | 当代教育与网络公共讨论人物 |

张雪峰的日期来自 2026-03-24 发布的讣告报道；此前资料曾将他误判为在世人物，本档案已按当前日期修正。[相关报道](https://finance.sina.com.cn/roll/2026-03-26/doc-inhshnxf9179982.shtml)

### 9.2 法国 France

| 人物 | 类型 | 出生 | 去世 | 去世时间 | 日期精度 | 简介 |
|---|---|---:|---|---|---|---|
| [Molière](https://en.wikipedia.org/wiki/Moli%C3%A8re) | 剧作家、演员 | 1622-01-15 | 1673-02-17 | — | day | 法国古典喜剧和戏剧代表人物 |
| [Victor Hugo](https://en.wikipedia.org/wiki/Victor_Hugo) | 作家、诗人 | 1802-02-26 | 1885-05-22 | — | day | 《悲惨世界》《巴黎圣母院》作者 |
| [Marie Curie](https://en.wikipedia.org/wiki/Marie_Curie) | 物理学家、化学家 | 1867-11-07 | 1934-07-04 | — | day | 诺贝尔奖获得者；放射性研究先驱 |
| [Édith Piaf](https://en.wikipedia.org/wiki/%C3%89dith_Piaf) | 歌手 | 1915-12-19 | 1963-10-10 | — | day | 法国香颂代表人物；官方死亡证明曾因迁葬问题写成 10 月 11 日 |
| [Charles de Gaulle](https://en.wikipedia.org/wiki/Charles_de_Gaulle) | 政治家、法国总统 | 1890-11-22 | 1970-11-09 | — | day | 法国第五共和国的重要政治人物 |
| [Alain Delon](https://en.wikipedia.org/wiki/Alain_Delon) | 演员 | 1935-11-08 | 2024-08-18 | — | day | 法国和欧洲电影代表演员 |

### 9.3 英国 United Kingdom

英国人物与教育路径一样，应在需要时进一步拆分英格兰、苏格兰、威尔士和北爱尔兰；本表按英国文化史关联记录。

| 人物 | 类型 | 出生 | 去世 | 去世时间 | 日期精度 | 简介 |
|---|---|---:|---|---|---|---|
| [William Shakespeare](https://en.wikipedia.org/wiki/William_Shakespeare) | 剧作家、诗人 | 1564-04-23 | 1616-04-23 | — | day | 英语文学和戏剧代表人物；日期以 Stratford 纪念记录为主 |
| [Isaac Newton](https://en.wikipedia.org/wiki/Isaac_Newton) | 物理学家、数学家 | 1643-01-04 | 1727-03-31 | — | day | 经典力学、微积分和光学代表人物；旧式历法存在换算差异 |
| [Charles Darwin](https://en.wikipedia.org/wiki/Charles_Darwin) | 生物学家、博物学家 | 1809-02-12 | 1882-04-19 | — | day | 演化论和自然选择理论代表人物 |
| [Winston Churchill](https://en.wikipedia.org/wiki/Winston_Churchill) | 政治家、作家 | 1874-11-30 | 1965-01-24 | — | day | 二战时期英国首相和历史写作者 |
| [Diana, Princess of Wales](https://en.wikipedia.org/wiki/Diana,_Princess_of_Wales) | 公共人物、慈善活动者 | 1961-07-01 | 1997-08-31 | — | day | 英国王室和全球公共文化人物 |
| [David Bowie](https://en.wikipedia.org/wiki/David_Bowie) | 歌手、词曲作者、演员 | 1947-01-08 | 2016-01-10 | — | day | 英国流行音乐和视觉文化代表人物 |
| [Stephen Hawking](https://en.wikipedia.org/wiki/Stephen_Hawking) | 理论物理学家、宇宙学家 | 1942-01-08 | 2018-03-14 | — | day | 黑洞和宇宙学公众传播代表人物 |

### 9.4 俄罗斯 Russia

俄罗斯人物中有一部分属于俄罗斯帝国或苏联时期，记录时保留历史实体，避免把后来的国家边界直接套回人物出生和成就时期。

| 人物 | 类型 | 出生 | 去世 | 去世时间 | 日期精度 | 简介 |
|---|---|---:|---|---|---|---|
| [Alexander Pushkin](https://en.wikipedia.org/wiki/Alexander_Pushkin) | 诗人、作家 | 1799-06-08 | 1837-02-10 | — | day | 俄语现代文学和诗歌的重要奠基者 |
| [Leo Tolstoy](https://en.wikipedia.org/wiki/Leo_Tolstoy) | 作家、思想家 | 1828-09-09 | 1910-11-20 | — | day | 《战争与和平》《安娜·卡列尼娜》作者 |
| [Fyodor Dostoevsky](https://en.wikipedia.org/wiki/Fyodor_Dostoevsky) | 作家、思想家 | 1821-11-11 | 1881-02-09 | — | day | 俄国文学和心理小说代表人物 |
| [Sergei Rachmaninoff](https://en.wikipedia.org/wiki/Sergei_Rachmaninoff) | 作曲家、钢琴家、指挥家 | 1873-04-01 | 1943-03-28 | — | day | 俄国和俄罗斯流亡音乐传统代表人物 |
| [Yuri Gagarin](https://en.wikipedia.org/wiki/Yuri_Gagarin) | 宇航员 | 1934-03-09 | 1968-03-27 | — | day | 首位进入太空的人类；成就属于苏联时期 |
| [Mikhail Gorbachev](https://en.wikipedia.org/wiki/Mikhail_Gorbachev) | 政治家、苏联领导人 | 1931-03-02 | 2022-08-30 | — | day | 20 世纪末苏联政治和国际关系的重要人物 |

### 9.5 日本 Japan

| 人物 | 类型 | 出生 | 去世 | 去世时间 | 日期精度 | 简介 |
|---|---|---:|---|---|---|---|
| [Murasaki Shikibu](https://en.wikipedia.org/wiki/Murasaki_Shikibu) | 平安时代作家、诗人 | 约 973 | 约 1014 | — | circa/year_only | 《源氏物语》作者；生卒年份存在学术争议 |
| [Matsuo Bashō](https://en.wikipedia.org/wiki/Matsuo_Bash%C5%8D) | 江户时代俳句诗人 | 1644 | 1694-11-28 | — | day | 日本俳句传统代表人物 |
| [Natsume Sōseki](https://en.wikipedia.org/wiki/Natsume_S%C5%8Dseki) | 作家、诗人、学者 | 1867-02-09 | 1916-12-09 | — | day | 日本近代文学代表人物 |
| [Akira Kurosawa](https://en.wikipedia.org/wiki/Akira_Kurosawa) | 导演、编剧 | 1910-03-23 | 1998-09-06 | — | day | 日本电影和世界电影史代表导演 |
| [Osamu Tezuka](https://en.wikipedia.org/wiki/Osamu_Tezuka) | 漫画家、动画制作人 | 1928-11-03 | 1989-02-09 | — | day | 日本现代漫画与动画产业的重要奠基者 |
| [Yukio Mishima](https://en.wikipedia.org/wiki/Yukio_Mishima) | 作家、剧作家 | 1925-01-14 | 1970-11-25 | — | day | 日本战后文学和公共争议人物 |

### 9.6 印度 India

| 人物 | 类型 | 出生 | 去世 | 去世时间 | 日期精度 | 简介 |
|---|---|---:|---|---|---|---|
| [Rabindranath Tagore](https://en.wikipedia.org/wiki/Rabindranath_Tagore) | 诗人、作家、思想家 | 1861-05-07 | 1941-08-07 | — | day | 首位获得诺贝尔文学奖的亚洲作家 |
| [Mahatma Gandhi](https://en.wikipedia.org/wiki/Mahatma_Gandhi) | 政治和社会运动领袖 | 1869-10-02 | 1948-01-30 | — | day | 印度独立运动的重要人物 |
| [Jawaharlal Nehru](https://en.wikipedia.org/wiki/Jawaharlal_Nehru) | 政治家、印度首任总理 | 1889-11-14 | 1964-05-27 | — | day | 独立后印度国家建设的重要人物 |
| [Indira Gandhi](https://en.wikipedia.org/wiki/Indira_Gandhi) | 政治家、印度总理 | 1917-11-19 | 1984-10-31 | — | day | 印度现代政治的重要人物 |
| [Satyajit Ray](https://en.wikipedia.org/wiki/Satyajit_Ray) | 导演、编剧、作家 | 1921-05-02 | 1992-04-23 | — | day | 印度电影和世界电影史代表导演 |
| [A. P. J. Abdul Kalam](https://en.wikipedia.org/wiki/A._P._J._Abdul_Kalam) | 科学家、印度总统 | 1931-10-15 | 2015-07-27 | — | day | 航天与公共教育传播人物 |
| [Lata Mangeshkar](https://en.wikipedia.org/wiki/Lata_Mangeshkar) | 歌手 | 1929-09-28 | 2022-02-06 | — | day | 印度电影音乐和大众文化代表人物 |

### 9.7 美国 United States

美国的名人去世参考已经在 [american-life-weeks-data.md](american-life-weeks-data.md) 中整理为 16 人，包括 Kurt Cobain、Marilyn Monroe、Martin Luther King Jr.、John Lennon、Elvis Presley、JFK、Michael Jackson、Steve Jobs 等。本文件不重复复制，以免出现两份日期表不一致。

## 10. 出生时预期寿命对照

这些数据来自不同国家的不同参考期，只能作为资料对照，不能直接当作同年排名。

| 国家 | 男性 | 女性 | 全体 | 参考期 |
|---|---:|---:|---:|---|
| 中国 | 75.4 | 80.9 | 77.9 | 2020 |
| 法国 | 80.3 | 85.9 | not_verified | 2025 |
| 英国 | 79.1 | 83.0 | not_verified | 2022–2024 |
| 俄罗斯 | 68.0 | 78.7 | 73.4 | 2023 |
| 日本 | 81.35 | 87.33 | not_verified | 2025 |
| 印度 | 68.5 | 72.5 | 70.3 | 2019–2023 |

如果未来需要严格六国同年比较，应另建一份统一来源的 UN World Population Prospects 2024 数据视图，而不是混用各国不同年度的官方生命表。

## 11. 适合 LifeCount 的字段

国际资料不应直接写入现有 `LifeStage`。建议拆成三个集合：

| 集合 | 用途 | 是否属于阶段着色 |
|---|---|---|
| `educationPresets` | 代表性连续教育路径 | 是 |
| `lifecycleReferenceIndicators` | 法律、婚育、工作、退休、寿命事实 | 否 |
| `historicalExamples` | 人物和成就案例 | 否 |

`lifecycleReferenceIndicators` 建议字段：

```text
indicatorId
countryId
regionId
value
unit
statisticType
referenceYear
publicationYear
population
methodology
limitations
status
comparabilityGroup
sources
verifiedAt
```

推荐的指标 ID：

- `age_of_majority`
- `voting_age`
- `driving_age_car`
- `alcohol_purchase_age`
- `tobacco_purchase_age`
- `mean_age_at_first_live_birth`
- `mean_age_at_first_marriage`
- `median_age_at_first_marriage`
- `divorce_marriage_duration`
- `current_employer_tenure`
- `effective_labour_market_exit_age`
- `statutory_pension_age`
- `life_expectancy_at_birth`

只有 `comparabilityGroup` 相同、参考期相容、总体范围相容且状态为 `verified` 的指标，才适合跨国定量比较。

## 12. 研究结论与缺口

1. **教育路径最适合做 LifeCount 的预设。** 各国教育制度能提供较清晰的年龄区间，但英国必须拆分构成国，印度必须区分传统 10+2 与 NEP，俄罗斯需保留教育制度调整说明。
2. **法律年龄可以做参考标记，但不能当人口平均。** 日本 18 岁成年、20 岁饮酒和烟草、65 岁养老金就是一个清晰例子。
3. **出生时预期寿命的跨国比较最容易统一。** 但必须使用同一参考期和同一种 period life table。
4. **俄罗斯和印度的婚育、工作任期、离婚婚龄缺口应保持为空。** 不用地区值、比例或邻近指标冒充全国均值。
5. **英国数据需要保留地域字段。** 英格兰和威尔士的婚育数据不能无说明地称为全英国数据。

本文件是研究资料归档，不是个人寿命、婚姻、生育、职业或退休预测，也不表示某一条教育路径代表该国全部人口。

## 13. ChatGPT 研究记录

本次按用户要求在 ChatGPT 的既有“人生阶段预设调研”对话中继续提问，明确指定只补充中国、法国、英国、俄罗斯、日本、印度，不重复美国；要求对教育、法律、婚育、工作、退休、寿命和启发性案例逐项给出来源与可比性状态。

对话链接：[人生阶段预设调研](https://chatgpt.com/c/6af189d7-c908-83e8-a2f0-86b7d3d9e74d)
