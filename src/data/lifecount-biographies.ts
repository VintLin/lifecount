import type { LifeStageTemplate } from "./lifecount";
import type { LifeAnnotationEvent, LifeSpecialPeriod } from "./lifecount-annotations";
import { additionalLifeBiographyProfiles } from "./lifecount-biographies-additional";

export interface LifeBiographyStage extends LifeStageTemplate {
  labelZh: string;
  labelEn: string;
}

export interface LifeBiographyProfile {
  id: string;
  nameZh: string;
  nameEn: string;
  birthDate: string;
  deathDate?: string;
  basePresetId: string;
  stages: LifeBiographyStage[];
  sourceUrl: string;
  specialPeriods: LifeSpecialPeriod[];
  events: LifeAnnotationEvent[];
}

export const lifeBiographyProfiles: LifeBiographyProfile[] = [
  {
    id: "elon-musk",
    nameZh: "埃隆·马斯克",
    nameEn: "Elon Musk",
    birthDate: "1971-06-28",
    basePresetId: "cn-undergraduate-work",
    stages: [
      { id: "early-childhood", startAge: 0, endAge: 3, color: "cyan", labelZh: "南非婴幼儿期", labelEn: "Early childhood in South Africa" },
      { id: "kindergarten", startAge: 3, endAge: 6, color: "green", labelZh: "比勒陀利亚学前阶段", labelEn: "Preschool years in Pretoria" },
      { id: "primary", startAge: 6, endAge: 12, color: "blue", labelZh: "南非小学阶段", labelEn: "Primary school in South Africa" },
      { id: "middle", startAge: 12, endAge: 15, color: "purple", labelZh: "比勒陀利亚中学前段", labelEn: "Lower secondary in Pretoria" },
      { id: "high", startAge: 15, endAge: 17.5, color: "pink", labelZh: "Pretoria Boys High School", labelEn: "Pretoria Boys High School" },
      { id: "undergraduate", startAge: 17.5, endAge: 18, color: "sand", labelZh: "比勒陀利亚大学", labelEn: "University of Pretoria" },
      { id: "undergraduate", startAge: 18, endAge: 21, color: "orange", labelZh: "皇后大学", labelEn: "Queen's University" },
      { id: "undergraduate", startAge: 21, endAge: 24, color: "purple", labelZh: "宾夕法尼亚大学", labelEn: "University of Pennsylvania" },
      { id: "work", startAge: 24, endAge: 28, color: "red", labelZh: "Zip2 创业期", labelEn: "Zip2 startup period" },
      { id: "work", startAge: 28, endAge: 29.5, color: "pink", labelZh: "X.com 创业阶段", labelEn: "X.com entrepreneurship" },
      { id: "work", startAge: 29.5, endAge: 31.3, color: "purple", labelZh: "PayPal 业务阶段", labelEn: "PayPal business period" },
      { id: "work", startAge: 31.3, endAge: 32.8, color: "sand", labelZh: "SpaceX 早期发展", labelEn: "Early SpaceX development" },
      { id: "work", startAge: 32.8, endAge: 37.3, color: "orange", labelZh: "Tesla 董事长阶段", labelEn: "Tesla chairman period" },
      { id: "work", startAge: 37.3, endAge: 44.9, color: "red", labelZh: "Tesla CEO 阶段", labelEn: "Tesla CEO period" },
      { id: "work", startAge: 44.9, endAge: 48, color: "green", labelZh: "Neuralink 创业阶段", labelEn: "Neuralink startup period" },
      { id: "work", startAge: 48, endAge: 51.3, color: "purple", labelZh: "The Boring Company 建设阶段", labelEn: "The Boring Company development" },
      { id: "work", startAge: 51.3, endAge: 51.9, color: "red", labelZh: "X 所有者兼 CEO", labelEn: "X owner and CEO" },
      { id: "work", startAge: 51.9, endAge: null, color: "orange", labelZh: "X 产品技术领导", labelEn: "X product and technology leadership" }
    ],
    sourceUrl: "https://en.wikipedia.org/wiki/Elon_Musk",
    specialPeriods: [],
    events: [
      {
        age: 17.5,
        label: "通过高中毕业考试",
        type: "demographic",
        year: null,
        detail: "1988 年；Pretoria Boys High School",
        status: "verified",
        sourceUrl: "https://en.wikipedia.org/wiki/Elon_Musk"
      },
      {
        age: 23.5,
        label: "创办 Zip2",
        type: "career_milestone",
        year: null,
        detail: "1995 年；第一家互联网公司",
        status: "verified",
        sourceUrl: "https://en.wikipedia.org/wiki/Zip2"
      },
      {
        age: 25.5,
        label: "获得两项本科学位",
        type: "achievement",
        year: null,
        detail: "1997 年；宾夕法尼亚大学正式授位",
        status: "verified",
        sourceUrl: "https://knowledge.wharton.upenn.edu/article/harnessing-the-sun-and-outer-space-elon-musks-sky-high-vision/"
      },
      {
        age: 27.7,
        label: "创办 X.com",
        type: "career_milestone",
        year: null,
        detail: "1999 年 3 月；进入互联网金融",
        status: "verified",
        sourceUrl: "https://www.sec.gov/Archives/edgar/data/1103415/000091205702009834/a2073071z10-k405.htm"
      },
      {
        age: 30.7,
        label: "SpaceX 成立",
        type: "career_milestone",
        year: null,
        detail: "2002 年 3 月注册成立；创办商业航天公司",
        status: "verified",
        sourceUrl: "https://ir.spacex.com/faqs-and-contact/"
      },
      {
        age: 31.3,
        label: "PayPal 被 eBay 收购",
        type: "career_milestone",
        year: null,
        detail: "2002-10-03；完成互联网支付业务出售",
        status: "verified",
        sourceUrl: "https://www.sec.gov/Archives/edgar/data/1103415/000091205702037693/a2090698zex-99_1.htm"
      },
      {
        age: 37.25,
        label: "Falcon 1 成功入轨",
        type: "achievement",
        year: null,
        detail: "2008-09-28；SpaceX 航天突破",
        status: "verified",
        sourceUrl: "https://www.nasa.gov/wp-content/uploads/2023/03/sp4034.pdf"
      },
      {
        age: 39,
        label: "Tesla 正式上市",
        type: "career_milestone",
        year: null,
        detail: "2010-06-29；纳斯达克上市",
        status: "verified",
        sourceUrl: "https://ir.tesla.com/press-release/tesla-announces-pricing-initial-public-offering"
      },
      {
        age: 40,
        label: "Dragon 抵达国际空间站",
        type: "achievement",
        year: null,
        detail: "2012-05-25；完成商业航天器对接",
        status: "verified",
        sourceUrl: "https://www.nasa.gov/news-release/nasa-administrator-calls-station-following-spacex-historic-feat/"
      },
      {
        age: 48.9,
        label: "Crew Dragon 首次载人发射",
        type: "achievement",
        year: null,
        detail: "2020-05-30；将 NASA 宇航员送往空间站",
        status: "verified",
        sourceUrl: "https://www.nasa.gov/news-release/nasa-and-spacex-launch-first-crew-mission-to-space-station/"
      },
      {
        age: 51.3,
        label: "完成收购 Twitter",
        type: "career_milestone",
        year: null,
        detail: "2022-10-27；取得平台控制权",
        status: "verified",
        sourceUrl: "https://www.sec.gov/Archives/edgar/data/1418091/000119312522272772/d411753d8k.htm"
      },
      {
        age: 52.35,
        label: "Grok 发布",
        type: "achievement",
        year: null,
        detail: "2023-11-03；xAI 官方发布早期测试版",
        status: "verified",
        sourceUrl: "https://x.ai/news/grok"
      }
    ]
  },
  {
    id: "steve-jobs",
    nameZh: "史蒂夫·乔布斯",
    nameEn: "Steve Jobs",
    birthDate: "1955-02-24",
    deathDate: "2011-10-05",
    basePresetId: "us-bachelor-work",
    stages: [
      { id: "early-childhood", startAge: 0, endAge: 6, color: "cyan", labelZh: "加州收养家庭早期生活", labelEn: "Early life in California adoptive family" },
      { id: "primary", startAge: 6, endAge: 10, color: "blue", labelZh: "Monta Loma Elementary（约）", labelEn: "Monta Loma Elementary (approx.)" },
      { id: "middle", startAge: 10, endAge: 13, color: "purple", labelZh: "Crittenden Middle School（约）", labelEn: "Crittenden Middle School (approx.)" },
      { id: "high", startAge: 13, endAge: 17, color: "pink", labelZh: "Homestead High School", labelEn: "Homestead High School" },
      { id: "undergraduate", startAge: 17, endAge: 19, color: "orange", labelZh: "Reed College", labelEn: "Reed College" },
      { id: "work", startAge: 19, endAge: 19.5, color: "sand", labelZh: "Atari 早期工作", labelEn: "Early Atari work" },
      { id: "work", startAge: 19.5, endAge: 20, color: "purple", labelZh: "印度精神探索阶段", labelEn: "India spiritual exploration" },
      { id: "work", startAge: 20, endAge: 21, color: "sand", labelZh: "Atari 游戏开发阶段", labelEn: "Atari game development" },
      { id: "work", startAge: 21, endAge: 30, color: "red", labelZh: "Apple 早期", labelEn: "Early Apple" },
      { id: "work", startAge: 30, endAge: 32, color: "purple", labelZh: "NeXT 创业阶段", labelEn: "NeXT startup period" },
      { id: "work", startAge: 32, endAge: 42, color: "pink", labelZh: "Pixar 管理阶段", labelEn: "Pixar leadership period" },
      { id: "work", startAge: 42, endAge: 44.9, color: "orange", labelZh: "Apple 临时 CEO 重建期", labelEn: "Apple interim CEO rebuilding period" },
      { id: "work", startAge: 44.9, endAge: 56.5, color: "red", labelZh: "Apple 正式 CEO 阶段", labelEn: "Apple CEO period" },
      { id: "work", startAge: 56.5, endAge: null, color: "purple", labelZh: "Apple 董事长过渡阶段", labelEn: "Apple chairman transition" }
    ],
    sourceUrl: "https://en.wikipedia.org/wiki/Steve_Jobs",
    specialPeriods: [],
    events: [
      {
        age: 16,
        label: "认识 Steve Wozniak",
        type: "career_milestone",
        year: null,
        detail: "约 1971 年；由 Bill Fernandez 介绍",
        status: "conditional",
        sourceUrl: "https://en.wikipedia.org/wiki/Steve_Wozniak"
      },
      {
        age: 17.5,
        label: "高中毕业并进入 Reed College",
        type: "demographic",
        year: null,
        detail: "1972 年；一个学期后退学，继续旁听书法课",
        status: "verified",
        sourceUrl: "https://www.reed.edu/about/steve-jobs.html"
      },
      {
        age: 19.3,
        label: "前往印度",
        type: "mobility_milestone",
        year: null,
        detail: "1974 年；与 Daniel Kottke 寻求精神体验，具体日期未确认",
        status: "conditional",
        sourceUrl: "https://book.stevejobsarchive.com/"
      },
      {
        age: 21,
        label: "创办 Apple",
        type: "career_milestone",
        year: null,
        detail: "1976 年；与 Steve Wozniak 共同创办",
        status: "verified",
        sourceUrl: "https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says"
      },
      {
        age: 28.9,
        label: "Macintosh 发布",
        type: "achievement",
        year: null,
        detail: "1984-01-24；Macintosh 正式发布",
        status: "verified",
        sourceUrl: "https://en.wikipedia.org/wiki/Macintosh_128K"
      },
      {
        age: 30.4,
        label: "离开 Apple",
        type: "career_milestone",
        year: null,
        detail: "1985 年；离开自己参与创办的公司",
        status: "verified",
        sourceUrl: "https://news.stanford.edu/stories/2005/06/steve-jobs-2005-graduates-stay-hungry-stay-foolish"
      },
      {
        age: 30.9,
        label: "成立 NeXT 并建立 Pixar",
        type: "career_milestone",
        year: null,
        detail: "1986 年；进入 NeXT 软件与计算机动画",
        status: "verified",
        sourceUrl: "https://www.pixar.com/our-story"
      },
      {
        age: 40.75,
        label: "Toy Story 上映",
        type: "achievement",
        year: null,
        detail: "1995-11-22；世界首部计算机动画长片",
        status: "verified",
        sourceUrl: "https://www.pixar.com/our-story"
      },
      {
        age: 42,
        label: "回归 Apple",
        type: "career_milestone",
        year: null,
        detail: "1997 年；Apple 收购 NeXT 后回归",
        status: "verified",
        sourceUrl: "https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says"
      },
      {
        age: 46.65,
        label: "iPod 发布",
        type: "achievement",
        year: null,
        detail: "2001-10-23；开启数字音乐产品阶段",
        status: "verified",
        sourceUrl: "https://www.apple.com/newsroom/2001/10/23Apple-Presents-iPod/"
      },
      {
        age: 51.9,
        label: "iPhone 发布",
        type: "achievement",
        year: null,
        detail: "2007-01-09；重新定义智能手机产品",
        status: "verified",
        sourceUrl: "https://www.apple.com/uk/newsroom/2007/01/09Apple-Reinvents-the-Phone/"
      },
      {
        age: 54.9,
        label: "iPad 发布",
        type: "achievement",
        year: null,
        detail: "2010-01-27；定义平板电脑产品类别",
        status: "verified",
        sourceUrl: "https://www.apple.com/ie/newsroom/2010/01/27Apple-Launches-iPad/"
      },
      {
        age: 56.6,
        label: "去世",
        type: "demographic",
        year: null,
        detail: "2011-10-05；享年 56 岁",
        status: "verified",
        sourceUrl: "https://www.apple.com/in/newsroom/2011/10/05Statement-by-Apples-Board-of-Directors/"
      }
    ]
  },
  ...additionalLifeBiographyProfiles
];

export function biographyById(id: string | null) {
  return lifeBiographyProfiles.find((profile) => profile.id === id) ?? null;
}
