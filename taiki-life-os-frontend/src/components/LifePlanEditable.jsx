import React, { useState } from 'react';
import { BookOpen, Heart, Building, Target, User, MapPin, Clock, Trophy } from 'lucide-react';
import { EditableText, EditableList, EditableSection } from './EditableContent';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LifePlanEditable = () => {
  const [lifePlanData, setLifePlanData] = useLocalStorage('lifePlanData', {
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
    bucketList: [
      "立教大学経済学部卒業",
      "各種資格取得",
      "学生起業",
      "VR関係の仕事に就く",
      "著書出版",
      "タワーマンション購入",
      "結婚",
      "海外移住"
    ],
    avoidList: [
      "やりがいのない仕事",
      "単純作業",
      "自分の時間がない生活",
      "軸に準じないもの",
      "他者のレールに乗って生きること"
    ]
  });

  const updateNestedData = (category, key, value) => {
    setLifePlanData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateSimpleData = (key, value) => {
    setLifePlanData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            人生計画（編集可能）
          </h1>
        </div>
        <p className="text-gray-600">理念、目標、そして未来への道筋を明確にする</p>
      </div>

      {/* 自己理念 */}
      <EditableSection title="自己理念" icon={Heart} collapsible={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MISSION</label>
            <EditableText
              value={lifePlanData.selfPhilosophy.mission}
              onSave={(value) => updateNestedData('selfPhilosophy', 'mission', value)}
              placeholder="ミッションを入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">VISION</label>
            <EditableText
              value={lifePlanData.selfPhilosophy.vision}
              onSave={(value) => updateNestedData('selfPhilosophy', 'vision', value)}
              placeholder="ビジョンを入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">価値観</label>
            <EditableText
              value={lifePlanData.selfPhilosophy.values}
              onSave={(value) => updateNestedData('selfPhilosophy', 'values', value)}
              placeholder="価値観を入力してください"
              multiline={true}
            />
          </div>
        </div>
      </EditableSection>

      {/* 仕事理念 */}
      <EditableSection title="仕事理念" icon={Building} collapsible={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">理念</label>
            <EditableText
              value={lifePlanData.workPhilosophy.mission}
              onSave={(value) => updateNestedData('workPhilosophy', 'mission', value)}
              placeholder="仕事の理念を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
            <EditableText
              value={lifePlanData.workPhilosophy.vision}
              onSave={(value) => updateNestedData('workPhilosophy', 'vision', value)}
              placeholder="仕事のビジョンを入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">モットー</label>
            <EditableText
              value={lifePlanData.workPhilosophy.motto}
              onSave={(value) => updateNestedData('workPhilosophy', 'motto', value)}
              placeholder="仕事のモットーを入力してください"
              multiline={true}
            />
          </div>
        </div>
      </EditableSection>

      {/* 最終目標 */}
      <EditableSection title="最終目標" icon={Target} collapsible={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">5年後(20歳)</label>
            <EditableText
              value={lifePlanData.finalGoals.fiveYears}
              onSave={(value) => updateNestedData('finalGoals', 'fiveYears', value)}
              placeholder="5年後の目標を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">10年後(25歳)</label>
            <EditableText
              value={lifePlanData.finalGoals.tenYears}
              onSave={(value) => updateNestedData('finalGoals', 'tenYears', value)}
              placeholder="10年後の目標を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">15年後(30歳)</label>
            <EditableText
              value={lifePlanData.finalGoals.fifteenYears}
              onSave={(value) => updateNestedData('finalGoals', 'fifteenYears', value)}
              placeholder="15年後の目標を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">20年後(35歳)</label>
            <EditableText
              value={lifePlanData.finalGoals.twentyYears}
              onSave={(value) => updateNestedData('finalGoals', 'twentyYears', value)}
              placeholder="20年後の目標を入力してください"
              multiline={true}
            />
          </div>
        </div>
      </EditableSection>

      {/* どういう人になりたい */}
      <EditableSection title="どういう人になりたい" icon={User} collapsible={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">経済面</label>
            <EditableText
              value={lifePlanData.whoToBe.economic}
              onSave={(value) => updateNestedData('whoToBe', 'economic', value)}
              placeholder="経済面での理想を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">技術面</label>
            <EditableText
              value={lifePlanData.whoToBe.technical}
              onSave={(value) => updateNestedData('whoToBe', 'technical', value)}
              placeholder="技術面での理想を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">身体面</label>
            <EditableText
              value={lifePlanData.whoToBe.physical}
              onSave={(value) => updateNestedData('whoToBe', 'physical', value)}
              placeholder="身体面での理想を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">人間関係</label>
            <EditableText
              value={lifePlanData.whoToBe.relationships}
              onSave={(value) => updateNestedData('whoToBe', 'relationships', value)}
              placeholder="人間関係での理想を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ライフスタイル</label>
            <EditableText
              value={lifePlanData.whoToBe.lifestyle}
              onSave={(value) => updateNestedData('whoToBe', 'lifestyle', value)}
              placeholder="ライフスタイルでの理想を入力してください"
              multiline={true}
            />
          </div>
        </div>
      </EditableSection>

      {/* 何になりたい */}
      <EditableSection title="何になりたい" icon={MapPin} collapsible={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">理想像</label>
            <EditableText
              value={lifePlanData.whatToBe.ideal}
              onSave={(value) => updateNestedData('whatToBe', 'ideal', value)}
              placeholder="理想像を入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">職業</label>
            <EditableText
              value={lifePlanData.whatToBe.profession}
              onSave={(value) => updateNestedData('whatToBe', 'profession', value)}
              placeholder="目指す職業を入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">スポーツ</label>
            <EditableText
              value={lifePlanData.whatToBe.sports}
              onSave={(value) => updateNestedData('whatToBe', 'sports', value)}
              placeholder="スポーツの目標を入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">音楽</label>
            <EditableText
              value={lifePlanData.whatToBe.music}
              onSave={(value) => updateNestedData('whatToBe', 'music', value)}
              placeholder="音楽の目標を入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">役割</label>
            <EditableText
              value={lifePlanData.whatToBe.role}
              onSave={(value) => updateNestedData('whatToBe', 'role', value)}
              placeholder="果たしたい役割を入力してください"
            />
          </div>
        </div>
      </EditableSection>

      {/* 何したい */}
      <EditableSection title="何したい" icon={Trophy} collapsible={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">投資・分析</label>
            <EditableText
              value={lifePlanData.whatToDo.investment}
              onSave={(value) => updateNestedData('whatToDo', 'investment', value)}
              placeholder="投資・分析でやりたいことを入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">開発</label>
            <EditableText
              value={lifePlanData.whatToDo.development}
              onSave={(value) => updateNestedData('whatToDo', 'development', value)}
              placeholder="開発でやりたいことを入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">スポーツ</label>
            <EditableText
              value={lifePlanData.whatToDo.sports}
              onSave={(value) => updateNestedData('whatToDo', 'sports', value)}
              placeholder="スポーツでやりたいことを入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">旅行・冒険</label>
            <EditableText
              value={lifePlanData.whatToDo.travel}
              onSave={(value) => updateNestedData('whatToDo', 'travel', value)}
              placeholder="旅行・冒険でやりたいことを入力してください"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ライフスタイル</label>
            <EditableText
              value={lifePlanData.whatToDo.lifestyle}
              onSave={(value) => updateNestedData('whatToDo', 'lifestyle', value)}
              placeholder="ライフスタイルでやりたいことを入力してください"
            />
          </div>
        </div>
      </EditableSection>

      {/* タームごとのwant */}
      <EditableSection title="タームごとのwant" icon={Clock} collapsible={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">大学時代</label>
            <EditableText
              value={lifePlanData.termGoals.university}
              onSave={(value) => updateNestedData('termGoals', 'university', value)}
              placeholder="大学時代の目標を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">20代前半</label>
            <EditableText
              value={lifePlanData.termGoals.earlyTwenties}
              onSave={(value) => updateNestedData('termGoals', 'earlyTwenties', value)}
              placeholder="20代前半の目標を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">20代後半</label>
            <EditableText
              value={lifePlanData.termGoals.lateTwenties}
              onSave={(value) => updateNestedData('termGoals', 'lateTwenties', value)}
              placeholder="20代後半の目標を入力してください"
              multiline={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">30代以降</label>
            <EditableText
              value={lifePlanData.termGoals.thirties}
              onSave={(value) => updateNestedData('termGoals', 'thirties', value)}
              placeholder="30代以降の目標を入力してください"
              multiline={true}
            />
          </div>
        </div>
      </EditableSection>

      {/* やりたいことリスト */}
      <EditableSection title="🏆 やりたいことリスト（ゾンビ100）" icon={Trophy} collapsible={true}>
        <EditableList
          items={lifePlanData.bucketList}
          onUpdate={(items) => updateSimpleData('bucketList', items)}
          addButtonText="やりたいことを追加"
        />
      </EditableSection>

      {/* やりたくないことリスト */}
      <EditableSection title="❌ やりたくないことリスト" icon={Target} collapsible={true}>
        <EditableList
          items={lifePlanData.avoidList}
          onUpdate={(items) => updateSimpleData('avoidList', items)}
          addButtonText="避けたいことを追加"
        />
      </EditableSection>
    </div>
  );
};

export default LifePlanEditable;

