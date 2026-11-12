import type { LifePresetCountryId } from "@/data/lifecount";

export interface LifeAnnotationEvent {
  age: number;
  label: string;
  type:
    | "demographic"
    | "legal_threshold"
    | "asset_milestone"
    | "career_milestone"
    | "mobility_milestone"
    | "achievement";
  year: number | string | null;
  detail?: string;
  status: string;
  sourceUrl?: string;
}

export interface LifeAchievementAnnotation {
  age: number;
  label: string;
  type: "achievement";
  year: number | string | null;
  status: string;
}

export interface LifeCelebrityAnnotation {
  name: string;
  age: number | null;
  death: string;
  summary: string;
  type: "celebrity";
  sourceUrl: string;
  status: string;
}

export interface LifeCountryAnnotations {
  events: LifeAnnotationEvent[];
  achievements: LifeAchievementAnnotation[];
  celebrities: LifeCelebrityAnnotation[];
  specialPeriods: LifeSpecialPeriod[];
}

export interface LifeSpecialPeriod {
  startAge: number;
  endAge: number | null;
  label: string;
  detail: string;
  status: string;
  sourceUrl?: string;
}

export interface LifeCountryWikiSources {
  education: string;
  demographics: string;
  driving: string;
  ageOfMajority: string;
  retirement: string;
  jobTenure: string;
}

export const lifeCountryWikiSources: Record<LifePresetCountryId, LifeCountryWikiSources> = {
  cn: {
    education: "https://en.wikipedia.org/wiki/Education_in_China",
    demographics: "https://en.wikipedia.org/wiki/Demographics_of_China",
    driving: "https://en.wikipedia.org/wiki/Driving_license_in_China",
    ageOfMajority: "https://en.wikipedia.org/wiki/Age_of_majority",
    retirement: "https://en.wikipedia.org/wiki/Retirement_age",
    jobTenure: "https://en.wikipedia.org/wiki/Job_tenure"
  },
  us: {
    education: "https://en.wikipedia.org/wiki/Education_in_the_United_States",
    demographics: "https://en.wikipedia.org/wiki/Demographics_of_the_United_States",
    driving: "https://en.wikipedia.org/wiki/Driver%27s_licenses_in_the_United_States",
    ageOfMajority: "https://en.wikipedia.org/wiki/Age_of_majority",
    retirement: "https://en.wikipedia.org/wiki/Retirement_age",
    jobTenure: "https://en.wikipedia.org/wiki/Job_tenure"
  },
  fr: {
    education: "https://en.wikipedia.org/wiki/Education_in_France",
    demographics: "https://en.wikipedia.org/wiki/Demographics_of_France",
    driving: "https://en.wikipedia.org/wiki/Driving_licence_in_France",
    ageOfMajority: "https://en.wikipedia.org/wiki/Age_of_majority",
    retirement: "https://en.wikipedia.org/wiki/Retirement_age",
    jobTenure: "https://en.wikipedia.org/wiki/Job_tenure"
  },
  uk: {
    education: "https://en.wikipedia.org/wiki/Education_in_the_United_Kingdom",
    demographics: "https://en.wikipedia.org/wiki/Demographics_of_the_United_Kingdom",
    driving: "https://en.wikipedia.org/wiki/Driving_licence_in_the_United_Kingdom",
    ageOfMajority: "https://en.wikipedia.org/wiki/Age_of_majority",
    retirement: "https://en.wikipedia.org/wiki/Retirement_age",
    jobTenure: "https://en.wikipedia.org/wiki/Job_tenure"
  },
  ru: {
    education: "https://en.wikipedia.org/wiki/Education_in_Russia",
    demographics: "https://en.wikipedia.org/wiki/Demographics_of_Russia",
    driving: "https://en.wikipedia.org/wiki/Driving_licence_in_Russia",
    ageOfMajority: "https://en.wikipedia.org/wiki/Age_of_majority",
    retirement: "https://en.wikipedia.org/wiki/Retirement_age",
    jobTenure: "https://en.wikipedia.org/wiki/Job_tenure"
  },
  jp: {
    education: "https://en.wikipedia.org/wiki/Education_in_Japan",
    demographics: "https://en.wikipedia.org/wiki/Demographics_of_Japan",
    driving: "https://en.wikipedia.org/wiki/Driving_license_in_Japan",
    ageOfMajority: "https://en.wikipedia.org/wiki/Age_of_majority",
    retirement: "https://en.wikipedia.org/wiki/Retirement_age",
    jobTenure: "https://en.wikipedia.org/wiki/Job_tenure"
  },
  in: {
    education: "https://en.wikipedia.org/wiki/Education_in_India",
    demographics: "https://en.wikipedia.org/wiki/Demographics_of_India",
    driving: "https://en.wikipedia.org/wiki/Driving_licence_in_India",
    ageOfMajority: "https://en.wikipedia.org/wiki/Age_of_majority",
    retirement: "https://en.wikipedia.org/wiki/Retirement_age",
    jobTenure: "https://en.wikipedia.org/wiki/Job_tenure"
  }
};

export const lifeCountryAnnotations: Partial<Record<LifePresetCountryId, LifeCountryAnnotations>> = {
  "cn": {
    "specialPeriods": [
      {
        "startAge": 30,
        "endAge": 37,
        "label": "当前工作任期参考",
        "detail": "样本均值约 6.99 年",
        "status": "conditional"
      },
      {
        "startAge": 38,
        "endAge": 50,
        "label": "离婚婚龄主要分布参考",
        "detail": "5–9 年区间占比最高（34.7%）",
        "status": "verified"
      }
    ],
    "events": [
      {
        "age": 26.8,
        "label": "女性首次生育年龄（2017）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 29.38,
        "label": "男性平均初婚年龄（2020）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 27.95,
        "label": "女性平均初婚年龄（2020）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 18,
        "label": "成年、驾驶、烟酒年龄门槛",
        "type": "legal_threshold",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 65.5,
        "label": "男性实际退休年龄",
        "type": "demographic",
        "year": 2022,
        "status": "verified"
      },
      {
        "age": 60,
        "label": "女性实际退休年龄",
        "type": "demographic",
        "year": 2022,
        "status": "verified"
      },
      {
        "age": 75.4,
        "label": "男性预期寿命（2020）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 80.9,
        "label": "女性预期寿命（2020）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 29.5,
        "label": "首次购房年龄参考（2018）",
        "type": "asset_milestone",
        "year": null,
        "status": "conditional",
        "sourceUrl": "https://www.tup.com.cn/upload/books/yz/081327-01.pdf"
      },
      {
        "age": 35.6,
        "label": "城镇购房者年龄参考（2025）",
        "type": "asset_milestone",
        "year": null,
        "status": "conditional",
        "sourceUrl": "https://zfdj.cbpt.cnki.net/portal/journal/portal/client/paper/3b9873cfba8ef3404f86e5c77fb94647"
      },
      {
        "age": 30.5,
        "label": "首次拥有汽车年龄参考（2025）",
        "type": "asset_milestone",
        "year": null,
        "status": "conditional",
        "sourceUrl": "https://pdf.dfcfw.com/pdf/H3_AP202504271663154591_1.pdf"
      },
      {
        "age": 22.4,
        "label": "平均取得驾驶证年龄参考（2025）",
        "type": "asset_milestone",
        "year": null,
        "status": "conditional",
        "sourceUrl": "https://pdf.dfcfw.com/pdf/H3_AP202504271663154591_1.pdf"
      },
      {
        "age": 23,
        "label": "首次创业年龄段参考（21–25 岁）",
        "type": "career_milestone",
        "year": null,
        "status": "conditional",
        "sourceUrl": "https://www.yee.org.cn/qywtzgg/201808/P020180808598751354069.pdf"
      },
      {
        "age": 27,
        "label": "首次跨城市迁移年龄拐点参考",
        "type": "mobility_milestone",
        "year": 2017,
        "status": "candidate_only",
        "sourceUrl": "https://www.geog.com.cn/CN/abstract/article/0375-5444/74237"
      }
    ],
    "celebrities": [
      {
        "name": "屈原",
        "age": 62,
        "death": "约前 278",
        "summary": "《离骚》作者，端午文化的重要历史人物",
        "type": "celebrity",
        "sourceUrl": "https://zh.wikipedia.org/wiki/%E5%B1%88%E5%8E%9F",
        "status": "conditional"
      },
      {
        "name": "李白",
        "age": 61,
        "death": "762",
        "summary": "“诗仙”；去世日期和死因均无可靠日级记录",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Li_Bai",
        "status": "verified"
      },
      {
        "name": "杜甫",
        "age": 58,
        "death": "770",
        "summary": "“诗圣”；唐诗重要代表",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Du_Fu",
        "status": "verified"
      },
      {
        "name": "苏轼",
        "age": 64,
        "death": "1101",
        "summary": "诗、词、散文和书法代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Su_Shi",
        "status": "verified"
      },
      {
        "name": "鲁迅",
        "age": 55,
        "death": "1936-10-19",
        "summary": "中国现代文学的重要人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Lu_Xun",
        "status": "verified"
      },
      {
        "name": "钱学森",
        "age": 98,
        "death": "2009-10-31",
        "summary": "中国航天与系统科学的重要人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Qian_Xuesen",
        "status": "verified"
      },
      {
        "name": "张国荣",
        "age": 47,
        "death": "2003-04-01",
        "summary": "华语流行文化和电影的重要人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Leslie_Cheung",
        "status": "verified"
      },
      {
        "name": "张雪峰",
        "age": 42,
        "death": "2026-03-24",
        "summary": "当代教育与网络公共讨论人物",
        "type": "celebrity",
        "sourceUrl": "https://zh.wikipedia.org/wiki/%E5%BC%A0%E9%9B%AA%E5%B3%B0",
        "status": "conditional"
      }
,
{
      "name": "金庸",
      "age": 94,
      "death": "2018-10-30",
      "summary": "武侠小说作家、报人和社会文化人物",
      "sourceUrl": "https://en.wikipedia.org/wiki/Jin_Yong",
      "type": "celebrity",
      "status": "verified"
},
{
      "name": "杨绛",
      "age": 104,
      "death": "2016-05-25",
      "summary": "作家、翻译家和戏剧家；《堂吉诃德》中文全译本译者",
      "sourceUrl": "https://en.wikipedia.org/wiki/Yang_Jiang",
      "type": "celebrity",
      "status": "verified"
},
{
      "name": "老舍",
      "age": 67,
      "death": "1966-08-24",
      "summary": "作家、剧作家，《茶馆》作者",
      "sourceUrl": "https://en.wikipedia.org/wiki/Lao_She",
      "type": "celebrity",
      "status": "verified"
},
{
      "name": "钱锺书",
      "age": 88,
      "death": "1998-12-19",
      "summary": "作家、文学研究者和《围城》作者",
      "sourceUrl": "https://en.wikipedia.org/wiki/Qian_Zhongshu",
      "type": "celebrity",
      "status": "verified"
},
      {
        "name": "朱自清",
        "age": 49,
        "death": "1948-08-12",
        "summary": "散文家、诗人和学者，《背影》作者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Zhu_Ziqing",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "张爱玲",
        "age": 74,
        "death": "1995-09-08",
        "summary": "作家，20世纪华语文学重要人物",
        "sourceUrl": "https://en.wikipedia.org/wiki/Eileen_Chang",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "林语堂",
        "age": 80,
        "death": "1976-03-26",
        "summary": "作家、语言学家和文化传播者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Lin_Yutang",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "李玟",
        "age": 48,
        "death": "2023-07-05",
        "summary": "华语流行歌手和舞台表演者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Coco_Lee",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "高以翔",
        "age": 35,
        "death": "2019-11-27",
        "summary": "演员和模特；其意外去世引发公众对节目安全的关注",
        "sourceUrl": "https://en.wikipedia.org/wiki/Godfrey_Gao",
        "type": "celebrity",
        "status": "verified"
      }    ],
    "achievements": [
      {
        "age": 84,
        "label": "屠呦呦获得诺贝尔生理学或医学奖（2015）",
        "type": "achievement",
        "year": null,
        "status": "conditional"
      }
    ]
  },
  "fr": {
    "specialPeriods": [
      {
        "startAge": 30,
        "endAge": 42,
        "label": "当前工作任期参考",
        "detail": "平均约 10.21 年",
        "status": "verified"
      },
      {
        "startAge": 43,
        "endAge": 57,
        "label": "离婚婚龄参考",
        "detail": "离婚判决时平均约 14 年",
        "status": "verified"
      }
    ],
    "events": [
      {
        "age": 29.1,
        "label": "女性首次生育年龄（2023）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 36.6,
        "label": "男性平均初婚年龄（2022）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 34.7,
        "label": "女性平均初婚年龄（2022）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 18,
        "label": "成年、投票、酒类和烟草年龄门槛",
        "type": "legal_threshold",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 17,
        "label": "汽车驾驶年龄",
        "type": "legal_threshold",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 61.9,
        "label": "男性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 62.4,
        "label": "女性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 80.3,
        "label": "男性预期寿命（2025）",
        "type": "demographic",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 85.9,
        "label": "女性预期寿命（2025）",
        "type": "demographic",
        "year": null,
        "status": "conditional"
      }
    ],
    "celebrities": [
      {
        "name": "Molière",
        "age": 51,
        "death": "1673-02-17",
        "summary": "法国古典喜剧和戏剧代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Moli%C3%A8re",
        "status": "verified"
      },
      {
        "name": "Victor Hugo",
        "age": 83,
        "death": "1885-05-22",
        "summary": "《悲惨世界》《巴黎圣母院》作者",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Victor_Hugo",
        "status": "verified"
      },
      {
        "name": "Marie Curie",
        "age": 67,
        "death": "1934-07-04",
        "summary": "诺贝尔奖获得者；放射性研究先驱",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Marie_Curie",
        "status": "verified"
      },
      {
        "name": "Édith Piaf",
        "age": 48,
        "death": "1963-10-10",
        "summary": "法国香颂代表人物；官方死亡证明曾因迁葬问题写成 10 月 11 日",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/%C3%89dith_Piaf",
        "status": "verified"
      },
      {
        "name": "Charles de Gaulle",
        "age": 80,
        "death": "1970-11-09",
        "summary": "法国第五共和国的重要政治人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Charles_de_Gaulle",
        "status": "verified"
      },
      {
        "name": "Alain Delon",
        "age": 89,
        "death": "2024-08-18",
        "summary": "法国和欧洲电影代表演员",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Alain_Delon",
        "status": "verified"
      }
,
{
      "name": "Jean-Paul Sartre",
      "age": 74,
      "death": "1980-04-15",
      "summary": "哲学家、作家和存在主义代表人物",
      "sourceUrl": "https://en.wikipedia.org/wiki/Jean-Paul_Sartre",
      "type": "celebrity",
      "status": "verified"
},
      {
        "name": "Albert Camus",
        "age": 46,
        "death": "1960-01-04",
        "summary": "作家、哲学家和诺贝尔文学奖获得者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Albert_Camus",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Marcel Proust",
        "age": 51,
        "death": "1922-11-18",
        "summary": "作家，《追忆似水年华》作者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Marcel_Proust",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Claude François",
        "age": 39,
        "death": "1978-03-11",
        "summary": "法国流行歌手、词曲作者和舞者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Claude_Fran%C3%A7ois",
        "type": "celebrity",
        "status": "verified"
      }    ],
    "achievements": [
      {
        "age": 36,
        "label": "Marie Curie 获得诺贝尔物理学奖（1903）",
        "type": "achievement",
        "year": null,
        "status": "conditional"
      }
    ]
  },
  "uk": {
    "specialPeriods": [
      {
        "startAge": 30,
        "endAge": 42,
        "label": "当前工作任期参考",
        "detail": "平均约 10.13 年",
        "status": "verified"
      },
      {
        "startAge": 43,
        "endAge": 56,
        "label": "离婚婚龄参考",
        "detail": "离婚时中位数约 13 年",
        "status": "verified"
      }
    ],
    "events": [
      {
        "age": 29.4,
        "label": "女性首次生育年龄（2024，英格兰及威尔士）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 32.7,
        "label": "男性首次伴侣关系年龄中位数（2022）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 31.2,
        "label": "女性首次伴侣关系年龄中位数（2022）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 18,
        "label": "成年、投票、酒类和烟草年龄门槛",
        "type": "legal_threshold",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 17,
        "label": "汽车驾驶年龄",
        "type": "legal_threshold",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 63.8,
        "label": "男性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 63.1,
        "label": "女性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 79.1,
        "label": "男性预期寿命（2022–2024）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 83.0,
        "label": "女性预期寿命（2022–2024）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      }
    ],
    "celebrities": [
      {
        "name": "William Shakespeare",
        "age": 52,
        "death": "1616-04-23",
        "summary": "英语文学和戏剧代表人物；日期以 Stratford 纪念记录为主",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/William_Shakespeare",
        "status": "verified"
      },
      {
        "name": "Isaac Newton",
        "age": 84,
        "death": "1727-03-31",
        "summary": "经典力学、微积分和光学代表人物；旧式历法存在换算差异",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Isaac_Newton",
        "status": "verified"
      },
      {
        "name": "Charles Darwin",
        "age": 73,
        "death": "1882-04-19",
        "summary": "演化论和自然选择理论代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Charles_Darwin",
        "status": "verified"
      },
      {
        "name": "Winston Churchill",
        "age": 91,
        "death": "1965-01-24",
        "summary": "二战时期英国首相和历史写作者",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Winston_Churchill",
        "status": "verified"
      },
      {
        "name": "Diana, Princess of Wales",
        "age": 36,
        "death": "1997-08-31",
        "summary": "英国王室和全球公共文化人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Diana,_Princess_of_Wales",
        "status": "verified"
      },
      {
        "name": "David Bowie",
        "age": 69,
        "death": "2016-01-10",
        "summary": "英国流行音乐和视觉文化代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/David_Bowie",
        "status": "verified"
      },
      {
        "name": "Stephen Hawking",
        "age": 76,
        "death": "2018-03-14",
        "summary": "黑洞和宇宙学公众传播代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Stephen_Hawking",
        "status": "verified"
      }
,
{
      "name": "Alan Turing",
      "age": 41,
      "death": "1954-06-07",
      "summary": "数学家、计算机科学先驱和密码学家",
      "sourceUrl": "https://en.wikipedia.org/wiki/Alan_Turing",
      "type": "celebrity",
      "status": "verified"
},
      {
        "name": "George Orwell",
        "age": 46,
        "death": "1950-01-21",
        "summary": "作家、记者和社会评论家，《1984》作者",
        "sourceUrl": "https://en.wikipedia.org/wiki/George_Orwell",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Agatha Christie",
        "age": 85,
        "death": "1976-01-12",
        "summary": "推理小说作家和剧作家",
        "sourceUrl": "https://en.wikipedia.org/wiki/Agatha_Christie",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Amy Winehouse",
        "age": 27,
        "death": "2011-07-23",
        "summary": "灵魂乐、节奏布鲁斯和爵士歌手",
        "sourceUrl": "https://en.wikipedia.org/wiki/Amy_Winehouse",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "George Michael",
        "age": 53,
        "death": "2016-12-25",
        "summary": "歌手、词曲作者和音乐制作人",
        "sourceUrl": "https://en.wikipedia.org/wiki/George_Michael",
        "type": "celebrity",
        "status": "verified"
      }    ],
    "achievements": [
      {
        "age": 62,
        "label": "石黑一雄获得诺贝尔文学奖（2017）",
        "type": "achievement",
        "year": null,
        "status": "conditional"
      }
    ]
  },
  "ru": {
    "specialPeriods": [],
    "events": [
      {
        "age": 25.2,
        "label": "女性首次生育平均年龄（2013）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 18,
        "label": "成年、投票和驾驶年龄门槛",
        "type": "legal_threshold",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 62,
        "label": "男性实际退休年龄",
        "type": "demographic",
        "year": 2020,
        "status": "verified"
      },
      {
        "age": 59.8,
        "label": "女性实际退休年龄",
        "type": "demographic",
        "year": 2020,
        "status": "verified"
      },
      {
        "age": 68.0,
        "label": "男性预期寿命（2023）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 78.7,
        "label": "女性预期寿命（2023）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      }
    ],
    "celebrities": [
      {
        "name": "Alexander Pushkin",
        "age": 38,
        "death": "1837-02-10",
        "summary": "俄语现代文学和诗歌的重要奠基者",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Alexander_Pushkin",
        "status": "verified"
      },
      {
        "name": "Leo Tolstoy",
        "age": 82,
        "death": "1910-11-20",
        "summary": "《战争与和平》《安娜·卡列尼娜》作者",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Leo_Tolstoy",
        "status": "verified"
      },
      {
        "name": "Fyodor Dostoevsky",
        "age": 60,
        "death": "1881-02-09",
        "summary": "俄国文学和心理小说代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Fyodor_Dostoevsky",
        "status": "verified"
      },
      {
        "name": "Sergei Rachmaninoff",
        "age": 70,
        "death": "1943-03-28",
        "summary": "俄国和俄罗斯流亡音乐传统代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Sergei_Rachmaninoff",
        "status": "verified"
      },
      {
        "name": "Yuri Gagarin",
        "age": 34,
        "death": "1968-03-27",
        "summary": "首位进入太空的人类；成就属于苏联时期",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Yuri_Gagarin",
        "status": "verified"
      },
      {
        "name": "Mikhail Gorbachev",
        "age": 91,
        "death": "2022-08-30",
        "summary": "20 世纪末苏联政治和国际关系的重要人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Mikhail_Gorbachev",
        "status": "verified"
      }
,
{
      "name": "Anna Akhmatova",
      "age": 76,
      "death": "1966-03-05",
      "summary": "俄国和苏联诗人；20世纪俄语文学重要人物",
      "sourceUrl": "https://en.wikipedia.org/wiki/Anna_Akhmatova",
      "type": "celebrity",
      "status": "verified"
},
      {
        "name": "Mikhail Bulgakov",
        "age": 48,
        "death": "1940-03-10",
        "summary": "作家，《大师与玛格丽特》作者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Mikhail_Bulgakov",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Sergei Prokofiev",
        "age": 61,
        "death": "1953-03-05",
        "summary": "作曲家、钢琴家和指挥家",
        "sourceUrl": "https://en.wikipedia.org/wiki/Sergei_Prokofiev",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Vladimir Vysotsky",
        "age": 42,
        "death": "1980-07-25",
        "summary": "歌手、诗人和演员；苏联时期重要公共文化人物",
        "sourceUrl": "https://en.wikipedia.org/wiki/Vladimir_Vysotsky",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Dmitri Hvorostovsky",
        "age": 55,
        "death": "2017-11-22",
        "summary": "歌剧男中音歌唱家",
        "sourceUrl": "https://en.wikipedia.org/wiki/Dmitri_Hvorostovsky",
        "type": "celebrity",
        "status": "verified"
      }    ],
    "achievements": [
      {
        "age": 27,
        "label": "Yuri Gagarin 完成人类首次载人太空飞行（1961，苏联）",
        "type": "achievement",
        "year": null,
        "status": "conditional"
      }
    ]
  },
  "jp": {
    "specialPeriods": [
      {
        "startAge": 30,
        "endAge": 43,
        "label": "当前工作任期参考",
        "detail": "一般劳动者平均约 12.7 年",
        "status": "verified"
      }
    ],
    "events": [
      {
        "age": 31,
        "label": "女性首次生育平均年龄（2024）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 31.1,
        "label": "男性平均初婚年龄（2024）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 29.8,
        "label": "女性平均初婚年龄（2024）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 18,
        "label": "成年、投票和驾驶年龄门槛",
        "type": "legal_threshold",
        "year": 2022,
        "status": "conditional"
      },
      {
        "age": 20,
        "label": "饮酒和烟草年龄",
        "type": "legal_threshold",
        "year": null,
        "status": "verified"
      },
      {
        "age": 66.9,
        "label": "男性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 67.4,
        "label": "女性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 81.35,
        "label": "男性预期寿命（2025）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 87.33,
        "label": "女性预期寿命（2025）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      }
    ],
    "celebrities": [
      {
        "name": "Murasaki Shikibu",
        "age": 41,
        "death": "约 1014",
        "summary": "《源氏物语》作者；生卒年份存在学术争议",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Murasaki_Shikibu",
        "status": "verified"
      },
      {
        "name": "Matsuo Bashō",
        "age": 50,
        "death": "1694-11-28",
        "summary": "日本俳句传统代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Matsuo_Bash%C5%8D",
        "status": "verified"
      },
      {
        "name": "Natsume Sōseki",
        "age": 49,
        "death": "1916-12-09",
        "summary": "日本近代文学代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Natsume_S%C5%8Dseki",
        "status": "verified"
      },
      {
        "name": "Akira Kurosawa",
        "age": 88,
        "death": "1998-09-06",
        "summary": "日本电影和世界电影史代表导演",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Akira_Kurosawa",
        "status": "verified"
      },
      {
        "name": "Osamu Tezuka",
        "age": 61,
        "death": "1989-02-09",
        "summary": "日本现代漫画与动画产业的重要奠基者",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Osamu_Tezuka",
        "status": "verified"
      },
      {
        "name": "Yukio Mishima",
        "age": 45,
        "death": "1970-11-25",
        "summary": "日本战后文学和公共争议人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Yukio_Mishima",
        "status": "verified"
      }
,
{
      "name": "Hideki Yukawa",
      "age": 74,
      "death": "1981-09-08",
      "summary": "理论物理学家；首位获得诺贝尔奖的日本人",
      "sourceUrl": "https://en.wikipedia.org/wiki/Hideki_Yukawa",
      "type": "celebrity",
      "status": "verified"
},
{
      "name": "Kenzaburō Ōe",
      "age": 88,
      "death": "2023-03-03",
      "summary": "日本作家和诺贝尔文学奖获得者",
      "sourceUrl": "https://en.wikipedia.org/wiki/Kenzabur%C5%8D_%C5%8Ce",
      "type": "celebrity",
      "status": "verified"
},
      {
        "name": "Yasunari Kawabata",
        "age": 72,
        "death": "1972-04-16",
        "summary": "作家和首位获得诺贝尔文学奖的日本人",
        "sourceUrl": "https://en.wikipedia.org/wiki/Yasunari_Kawabata",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Haruma Miura",
        "age": 30,
        "death": "2020-07-18",
        "summary": "演员和歌手；日本影视文化人物",
        "sourceUrl": "https://en.wikipedia.org/wiki/Haruma_Miura",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Satoshi Kon",
        "age": 46,
        "death": "2010-08-24",
        "summary": "动画导演、编剧和漫画家",
        "sourceUrl": "https://en.wikipedia.org/wiki/Satoshi_Kon",
        "type": "celebrity",
        "status": "verified"
      }    ],
    "achievements": [
      {
        "age": 50,
        "label": "山中伸弥获得诺贝尔生理学或医学奖（2012）",
        "type": "achievement",
        "year": null,
        "status": "conditional"
      }
    ]
  },
  "in": {
    "specialPeriods": [],
    "events": [
      {
        "age": 21.2,
        "label": "女性首次生育年龄中位数（2019–2021）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 24.9,
        "label": "男性首次结婚年龄中位数（2019–2021）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 18.8,
        "label": "女性首次结婚年龄中位数（2019–2021）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 18,
        "label": "成年、投票、驾驶、女性最低结婚和烟草年龄门槛",
        "type": "legal_threshold",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 21,
        "label": "男性最低结婚年龄",
        "type": "legal_threshold",
        "year": null,
        "status": "verified"
      },
      {
        "age": 56.1,
        "label": "男性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "conditional"
      },
      {
        "age": 54.8,
        "label": "女性实际退休年龄",
        "type": "demographic",
        "year": 2024,
        "status": "conditional"
      },
      {
        "age": 68.5,
        "label": "男性预期寿命（2019–2023）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 72.5,
        "label": "女性预期寿命（2019–2023）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      }
    ],
    "celebrities": [
      {
        "name": "Rabindranath Tagore",
        "age": 80,
        "death": "1941-08-07",
        "summary": "首位获得诺贝尔文学奖的亚洲作家",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Rabindranath_Tagore",
        "status": "verified"
      },
      {
        "name": "Mahatma Gandhi",
        "age": 79,
        "death": "1948-01-30",
        "summary": "印度独立运动的重要人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Mahatma_Gandhi",
        "status": "verified"
      },
      {
        "name": "Jawaharlal Nehru",
        "age": 75,
        "death": "1964-05-27",
        "summary": "独立后印度国家建设的重要人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Jawaharlal_Nehru",
        "status": "verified"
      },
      {
        "name": "Indira Gandhi",
        "age": 67,
        "death": "1984-10-31",
        "summary": "印度现代政治的重要人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Indira_Gandhi",
        "status": "verified"
      },
      {
        "name": "Satyajit Ray",
        "age": 71,
        "death": "1992-04-23",
        "summary": "印度电影和世界电影史代表导演",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Satyajit_Ray",
        "status": "verified"
      },
      {
        "name": "A. P. J. Abdul Kalam",
        "age": 84,
        "death": "2015-07-27",
        "summary": "航天与公共教育传播人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/A._P._J._Abdul_Kalam",
        "status": "verified"
      },
      {
        "name": "Lata Mangeshkar",
        "age": 93,
        "death": "2022-02-06",
        "summary": "印度电影音乐和大众文化代表人物",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Lata_Mangeshkar",
        "status": "verified"
      }
,
{
      "name": "Mother Teresa",
      "age": 87,
      "death": "1997-09-05",
      "summary": "天主教修女和慈善工作者；诺贝尔和平奖获得者",
      "sourceUrl": "https://en.wikipedia.org/wiki/Mother_Teresa",
      "type": "celebrity",
      "status": "verified"
},
{
      "name": "Ravi Shankar",
      "age": 92,
      "death": "2012-12-11",
      "summary": "印度西塔琴演奏家和世界音乐传播者",
      "sourceUrl": "https://en.wikipedia.org/wiki/Ravi_Shankar",
      "type": "celebrity",
      "status": "verified"
},
      {
        "name": "Vikram Sarabhai",
        "age": 52,
        "death": "1971-12-30",
        "summary": "物理学家和印度空间研究事业奠基者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Vikram_Sarabhai",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "R. K. Narayan",
        "age": 94,
        "death": "2001-05-13",
        "summary": "作家，印度英语文学代表人物",
        "sourceUrl": "https://en.wikipedia.org/wiki/R._K._Narayan",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Irrfan Khan",
        "age": 53,
        "death": "2020-04-29",
        "summary": "印度演员，活跃于印度、英国和美国电影",
        "sourceUrl": "https://en.wikipedia.org/wiki/Irrfan_Khan",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Sridevi",
        "age": 54,
        "death": "2018-02-24",
        "summary": "印度电影演员和舞者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Sridevi",
        "type": "celebrity",
        "status": "verified"
      }    ],
    "achievements": [
      {
        "age": 52,
        "label": "Rabindranath Tagore 获得诺贝尔文学奖（1913）",
        "type": "achievement",
        "year": null,
        "status": "conditional"
      }
    ]
  },
  "us": {
    "specialPeriods": [],
    "events": [
      {
        "age": 16,
        "label": "多数州开始分级驾驶许可",
        "type": "legal_threshold",
        "year": null,
        "status": "conditional"
      },
      {
        "age": 18,
        "label": "成年、投票与参军资格参考",
        "type": "legal_threshold",
        "year": null,
        "status": "verified"
      },
      {
        "age": 27.6,
        "label": "女性首次生育平均年龄（2024）",
        "type": "demographic",
        "year": 2024,
        "status": "verified"
      },
      {
        "age": 21,
        "label": "烟草与酒精购买年龄门槛",
        "type": "legal_threshold",
        "year": 2019,
        "status": "verified"
      },
      {
        "age": 76.5,
        "label": "男性预期寿命（2024）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      },
      {
        "age": 81.4,
        "label": "女性预期寿命（2024）",
        "type": "demographic",
        "year": null,
        "status": "verified"
      }
    ],
    "celebrities": [
      {
        "name": "Kurt Cobain",
        "age": 27,
        "death": "1994-04-05",
        "summary": "Nirvana 主唱、吉他手、词曲作者",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Kurt_Cobain",
        "status": "verified"
      },
      {
        "name": "Marilyn Monroe",
        "age": 36,
        "death": "1962-08-04",
        "summary": "美国演员、模特、歌手",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Marilyn_Monroe",
        "status": "verified"
      },
      {
        "name": "Martin Luther King Jr.",
        "age": 39,
        "death": "1968-04-04",
        "summary": "美国民权运动领袖、牧师",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Martin_Luther_King_Jr.",
        "status": "verified"
      },
      {
        "name": "John Lennon",
        "age": 40,
        "death": "1980-12-08",
        "summary": "Beatles 联合创始人、歌手和词曲作者",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/John_Lennon",
        "status": "verified"
      },
      {
        "name": "Steve Jobs",
        "age": 56,
        "death": "2011-10-05",
        "summary": "Apple 联合创始人、CEO",
        "type": "celebrity",
        "sourceUrl": "https://en.wikipedia.org/wiki/Steve_Jobs",
        "status": "verified"
      }
,
{
      "name": "Muhammad Ali",
      "age": 74,
      "death": "2016-06-03",
      "summary": "拳击运动员、民权人物和公共文化人物",
      "sourceUrl": "https://en.wikipedia.org/wiki/Muhammad_Ali",
      "type": "celebrity",
      "status": "verified"
},
{
      "name": "Maya Angelou",
      "age": 86,
      "death": "2014-05-28",
      "summary": "作家、诗人、民权活动家和教育者",
      "sourceUrl": "https://en.wikipedia.org/wiki/Maya_Angelou",
      "type": "celebrity",
      "status": "verified"
},
      {
        "name": "Robin Williams",
        "age": 63,
        "death": "2014-08-11",
        "summary": "演员、喜剧演员和公共文化人物",
        "sourceUrl": "https://en.wikipedia.org/wiki/Robin_Williams",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Kobe Bryant",
        "age": 41,
        "death": "2020-01-26",
        "summary": "篮球运动员和体育文化人物",
        "sourceUrl": "https://en.wikipedia.org/wiki/Kobe_Bryant",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Chadwick Boseman",
        "age": 43,
        "death": "2020-08-28",
        "summary": "演员和编剧，《黑豹》主演",
        "sourceUrl": "https://en.wikipedia.org/wiki/Chadwick_Boseman",
        "type": "celebrity",
        "status": "verified"
      },
      {
        "name": "Steve Irwin",
        "age": 44,
        "death": "2006-09-04",
        "summary": "动物保护者、电视主持人和野生动物教育者",
        "sourceUrl": "https://en.wikipedia.org/wiki/Steve_Irwin",
        "type": "celebrity",
        "status": "verified"
      }    ],
    "achievements": []
  }
};
