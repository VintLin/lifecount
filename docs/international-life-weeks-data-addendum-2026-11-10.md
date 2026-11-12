# LifeCount 国际人生阶段数据补充核验记录

核验日期：2026-11-10。本文补充并修正 `international-life-weeks-data.md` 中此前显示为缺失或候选的数据。不同国家的统计口径不强行统一；每条记录保留年份、统计类型、地域范围和核验状态。

## 1. 女性首次生育年龄

| 国家 | value | 统计年份 | 统计类型 | 范围 | 状态 |
|---|---:|---|---|---|---|
| 中国 | 26.8 | 2017 | 官方平均初育年龄 | 中国大陆，全国 | verified |
| 法国 | 29.1 | 2023 | 第一孩次假设队列平均值 | France，含 Mayotte | verified |
| 英国 | 29.4 | 2024 | 首次活产标准化平均值 | England and Wales | verified |
| 俄罗斯 | 25.2 | 2013 | 第一孩次假设队列平均值 | Russian Federation，全国估计 | verified，数据较旧 |
| 日本 | 31.0 | 2024 | 第一孩次母亲平均年龄 | Japan，全国 | verified |
| 印度 | 21.2 | 2019–2021 | 首次生育年龄中位数 | India，全国，25–49 岁女性回顾调查 | verified |

主要来源：[中国国家统计局](https://www.stats.gov.cn/zt_18555/ztfx/ggkf40n/202302/t20230209_1902601.html)、[法国 Insee](https://www.insee.fr/fr/statistiques/8608134)、[英国 ONS](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/bulletins/birthsummarytablesenglandandwales/2024refreshedpopulations)、[UNECE](https://w3.unece.org/PXWeb/en/Table?IndicatorCode=34)、[日本厚生劳动省](https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/geppo/nengai24/dl/kekka.pdf)、[印度 NFHS-5](https://dhsprogram.com/pubs/pdf/FR375/FR375.pdf)。

中国 2020 年约 27.2 岁保留为 `candidateValue`，不覆盖国家统计局直接发布的 2017 年 26.8 岁。

## 2. 实际劳动市场退出年龄

| 国家 | 男性 | 女性 | 统计年份 | referencePeriod | 状态 |
|---|---:|---:|---|---|---|
| 中国 | 65.5 | 60.0 | 2022 | 2017–2022 | verified |
| 法国 | 61.9 | 62.4 | 2024 | 2019–2024 | verified |
| 英国 | 63.8 | 63.1 | 2024 | 2019–2024 | verified |
| 俄罗斯 | 62.0 | 59.8 | 2020 | 2015–2020 | verified，数据较旧 |
| 日本 | 66.9 | 67.4 | 2024 | 2019–2024 | verified |
| 印度 | 56.1 | 54.8 | 2024 | 2019–2024 | verified |

统计定义：OECD 根据 40 岁及以上劳动者的劳动参与率变化估算实际退出劳动市场年龄。它不是法定退休年龄，也不是养老金领取年龄。来源为 OECD《Pensions at a Glance》2021、2023、2025 的有效退出年龄图表。

## 3. 首次结婚年龄

| 国家 | 男性 | 女性 | 统计年份 | 统计类型 | 状态 |
|---|---:|---:|---|---|---|
| 中国 | 29.38 | 27.95 | 2020 | 人口普查人数加权平均 | verified |
| 法国 | 36.6 | 34.7 | 2022 | 实际初婚者平均值 | verified |
| 英国 | 32.7 | 31.2 | 2022 | 首次法律伴侣关系中位数 | verified，England and Wales |
| 俄罗斯 | 27.6 | 25.0 | 2022 | 首次婚姻／结合调查平均值 | conditional |
| 日本 | 31.1 | 29.8 | 2024 | 登记初婚平均值 | verified |
| 印度 | 24.9 | 18.8 | 2019–2021 | 回顾调查中位数 | conditional |

中国另一种普查计算值 28.34/26.23 保留为候选值。俄罗斯数据可能包括未登记结合；印度数据是 NFHS-5 回顾性调查，不能自动解释为全部合法登记婚姻。来源：[中国《人口研究》](https://rkyj.ruc.edu.cn/CN/Y2024/V48/I6/18)、[法国 Insee](https://www.insee.fr/fr/statistiques/7929432)、[英国 ONS](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/marriagecohabitationandcivilpartnerships/bulletins/marriagesinenglandandwalesprovisional/2021and2022)、[日本厚生劳动省](https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/geppo/nengai24/dl/kekka.pdf)、[印度 NFHS-5](https://healthnutritionindia.in/reports/documents/35/NFHS-5_INDIA_REPORT.pdf)。

## 4. 已离婚婚姻的持续时间

该指标只在来源明确描述离婚时婚姻持续时间或已解除婚姻分布时记录。分组比例不转换成虚构的均值。

| 国家 | value | 年份 | 统计类型 | 范围 | 状态 |
|---|---|---|---|---|---|
| 中国 | 1–4 年 29.3%；5–9 年 34.7%；10–14 年 13.3%；15–19 年 10.7%；20 年以上 12.0% | 2020 | 离婚婚姻持续时间分组 | 全国 | verified |
| 法国 | 约 14 年 | 2015 | 离婚判决时婚姻持续时间平均值 | France métropolitaine | verified |
| 英国 | 13.0 年 | 2025 | 离婚时婚姻持续时间中位数 | England and Wales，异性婚姻 | verified |
| 俄罗斯 | 2 年以下 18%；3–4 年 13%；5–9 年 28%；10–14 年 20%；15–19 年 10%；20 年以上 11% | 2023 | 已解除婚姻持续时间分组 | Komi Republic | verified，地区数据 |
| 日本 | — | 2024 | 官方表为共同生活期间，非严格法律婚姻存续期 | 全国 | not_verified |
| 印度 | — | — | 现有研究混合分居与正式离婚 | 全国 | not_verified |

来源：[OECD 亚太家庭数据库 SF3.2.A](https://oecdkorea.org/resource/download/2025/SF_3_2_Family_dissolution_children_2025.pdf)、[法国 Insee](https://www.insee.fr/fr/statistiques/2659213)、[英国 ONS](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/divorce/bulletins/divorcesinenglandandwales/2024and2025)、[科米共和国统计资料](https://11.rosstat.gov.ru/storage/mediabank/Семья%20и%20дети%20Республики%20Коми%20в%20диаграммах%20и%20графиках.pdf)。

## 5. 当前雇主任期

| 国家 | value | 年份 | 统计类型 | 范围 | 状态 |
|---|---:|---|---|---|---|
| 中国 | — | — | 官方调查包含该字段，但没有公开全国汇总值 | 中国大陆，全国 | not_verified |
| 法国 | 10.21 年 | 2025 | 当前工作任期平均值 | France，全国 | verified |
| 英国 | 10.13 年 | 2023 | 当前工作任期平均值 | United Kingdom，全国 | verified |
| 俄罗斯 | 少于 6 个月超过 16%；半年至 1 年 9.5%；1–2 年 23.5%；超过 3 年超过 50% | 2026 | 当前任期分组调查 | Russian Federation，多地区 | conditional |
| 日本 | 12.7 年；男性 14.2、女性 10.4 | 2025 | 平均勤续年数 | Japan，全国，一般劳动者 | verified |
| 印度 | — | — | 尚无可核验全国任期汇总值 | India，全国 | not_verified |

法国、英国数据来自 OECD job tenure 数据；日本来自厚生劳动省《工资结构基本统计调查 2025》。英国 OECD 2024–2025 页面出现 0.00 异常值，因此保留 2023 年 10.13 年。俄罗斯数据来自 SberAnalytics/Rabota.ru 调查的媒体转引，区间不是完整互斥分布，不能据此计算均值。

## 6. 剩余缺口与候选记录

本轮又检查了国家劳动力调查、PLFS、MHLW/e-Stat、UNSD 和国家级研究。四项严格定义的全国值仍未公开，但已经补上可归档的候选记录：

| 项目 | candidateValue | 来源与范围 | 状态 |
|---|---|---|---|
| 中国当前雇主任期 | 6.99 年 | 89 家企业、1,044 名员工；北京、天津、石家庄、南京、上海、广州等城市的企业员工样本 | conditional |
| 印度当前雇主任期 | 少于 1 年 23%；1–2 年 22%；2–3 年 14%；3–4 年 12%；4–5 年 11%；5 年以上 18% | 2017 年哈里亚纳邦制造业 100 名劳动者 | conditional |
| 日本离婚婚龄 | 141.8 个月 | 2010 年全国 251,379 条离婚记录；以开始共同生活时间作为起点 | not_verified，candidate only |
| 印度离婚婚龄 | 不足 1 年 15.1%；1–2 年 13.6%；2–6 年 30.0%；6–10 年 15.1%；10 年以上 26.2% | 多地区婚姻解体调查；混合正式离婚、分居和少量丧偶 | not_verified，candidate only |

来源：中国企业员工任期[北京大学论文 PDF](https://ccj.pku.edu.cn/Article/DownLoad?id=255658285&type=ArticleFile)；印度制造业任期[ICRIER Working Paper 397](https://icrier.org/pdf/Working_Paper_397.pdf)；日本候选婚龄[ESRI Discussion Paper No. 405](https://www.esri.cao.go.jp/en/esri/content/e_dis405.pdf)；印度婚姻解体调查[Kirti Singh](https://idrc-crdi.ca/sites/default/files/openebooks/051-3/index.html)。

严格缺失仍是：

1. 中国全国就业人口当前雇主任期的公开加权均值、中位数或完整分布。
2. 印度全国当前雇主任期或最近一份工作持续时间。
3. 日本从法律婚姻登记日至离婚生效日计算的全国婚姻存续时间。
4. 印度仅包含正式法律离婚、不混合分居的婚姻持续时间。

这些严格缺失不会阻塞 LifeCount 使用：展示层可以显示候选值及其范围；只有需要“全国代表性”或“法律登记严格口径”时才显示暂无核验值。
