import React from 'react';
import { BookOpen, Heart, Building, Target, User, MapPin, Clock, Trophy } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LifePlan = () => {
  const [lifePlanData] = useLocalStorage('lifePlanData', {
    selfPhilosophy: {
      mission: "未知の世界をテクノロジーで体現する",
      vision: "日々を世界観でUpdateする",
      values: "誠実さ、堅実さ、感謝、人間味"
    },
    workPhilosophy: {
      mission: "Begin your fire 人と人とで熱狂を生み出す",
      vision: "熱狂をデザインし、熱狂を。",
      motto: "心の底から湧いてくる高揚感をカタチにする"
    },
    finalGoals: {
      fiveYears: "世界の状況を正確に把握、大学で学習、投資開始、最先端技術を駆使した生活",
      tenYears: "お金が稼げている、投資ができている",
      fifteenYears: "起業または転職、家族計画の実行",
      twentyYears: "ある程度の発言力がある"
    },
    whoToBe: {
      economic: "お金に余裕がある、お金のノウハウがある",
      technical: "最先端技術を駆使して、時代の最先端で生きる",
      physical: "体、知、心がPerfect",
      relationships: "愛するものがある、守るものがある、人を愛し愛される",
      lifestyle: "自由に生きる、世界に生きる、楽しみがある、希望がある"
    },
    whatToBe: {
      ideal: "Perfect Human",
      profession: "投資家",
      sports: "サッカーができる、泳げる",
      music: "ピアノができる、ギターができる",
      role: "家族を守れる者、光の中で生きる"
    },
    whatToDo: {
      investment: "投資、分析、youtube",
      development: "開発(VR)、宇宙開発",
      sports: "サッカー",
      travel: "世界旅行、宇宙移住、空を飛びたい、探検",
      lifestyle: "最先端技術生活、オークションに出る"
    },
    termGoals: {
      university: "立教大学経済学部卒業、アントレプレナー教育、各種資格取得、学生起業",
      earlyTwenties: "SAO VR関係の仕事、副業準備、自己投資、海外旅行、タワーマンション購入",
      lateTwenties: "結婚、超富裕層への接近、資産形成の継続",
      thirties: "起業または転職、家族計画（子供3-5人）、海外移住の実現"
    },
  });

  const sections = [
    {
      title: "自己哲学",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        { label: "ミッション", value: lifePlanData.selfPhilosophy.mission },
        { label: "ビジョン", value: lifePlanData.selfPhilosophy.vision },
        { label: "価値観", value: lifePlanData.selfPhilosophy.values },
      ]
    },
    {
      title: "仕事哲学",
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        { label: "ミッション", value: lifePlanData.workPhilosophy.mission },
        { label: "ビジョン", value: lifePlanData.workPhilosophy.vision },
        { label: "モットー", value: lifePlanData.workPhilosophy.motto },
      ]
    },
    {
      title: "最終目標",
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-50",
      items: [
        { label: "5年後", value: lifePlanData.finalGoals.fiveYears },
        { label: "10年後", value: lifePlanData.finalGoals.tenYears },
        { label: "15年後", value: lifePlanData.finalGoals.fifteenYears },
        { label: "20年後", value: lifePlanData.finalGoals.twentyYears },
      ]
    },
    {
      title: "なりたい人",
      icon: User,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      items: [
        { label: "経済的", value: lifePlanData.whoToBe.economic },
        { label: "技術的", value: lifePlanData.whoToBe.technical },
        { label: "身体的", value: lifePlanData.whoToBe.physical },
        { label: "関係性", value: lifePlanData.whoToBe.relationships },
        { label: "ライフスタイル", value: lifePlanData.whoToBe.lifestyle },
      ]
    },
    {
      title: "なりたいもの",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      items: [
        { label: "理想像", value: lifePlanData.whatToBe.ideal },
        { label: "職業", value: lifePlanData.whatToBe.profession },
        { label: "スポーツ", value: lifePlanData.whatToBe.sports },
        { label: "音楽", value: lifePlanData.whatToBe.music },
        { label: "役割", value: lifePlanData.whatToBe.role },
      ]
    },
    {
      title: "やりたいこと",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      items: [
        { label: "投資", value: lifePlanData.whatToDo.investment },
        { label: "開発", value: lifePlanData.whatToDo.development },
        { label: "スポーツ", value: lifePlanData.whatToDo.sports },
        { label: "旅行", value: lifePlanData.whatToDo.travel },
        { label: "ライフスタイル", value: lifePlanData.whatToDo.lifestyle },
      ]
    },
    {
      title: "期間目標",
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      items: [
        { label: "大学", value: lifePlanData.termGoals.university },
        { label: "20代前半", value: lifePlanData.termGoals.earlyTwenties },
        { label: "20代後半", value: lifePlanData.termGoals.lateTwenties },
        { label: "30代", value: lifePlanData.termGoals.thirties },
      ]
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📋 Life Plan
        </h1>
        <p className="text-gray-600">
          人生の計画と目標を確認
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className={`${section.bgColor} rounded-lg p-6 border-2 border-gray-200`}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-6 w-6 ${section.color}`} />
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <p className="text-sm font-semibold text-gray-700 mb-1">{item.label}</p>
                    <p className="text-gray-800 leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifePlan;
